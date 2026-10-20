/** Объёмная волна образцов раствора — сцена Three.js для первого экрана главной (бриф 20.10).
 *
 *  Последовательность тонких матовых пластин (образцы цветной кладочной смеси) стоит вдоль кривой и образует
 *  скрученную ленту: закрутка вокруг оси ленты нарастает от края к краю, по ленте медленно идёт волна —
 *  соседние пластины с небольшим сдвигом фазы меняют высоту и наклон (наклон — от производной). Цвета идут
 *  блоками по 4 пластины (палитра 8 оттенков от светлого к тёмному), выбранный оттенок приподнимает свой блок.
 *
 *  Модуль грузится динамическим import() из MortarWave.astro уже после первой отрисовки страницы: до этого
 *  на месте сцены стоит статичная CSS-раскладка тех же цветов. Импорт — только нужных классов (tree-shaking).
 *
 *  Производительность: все пластины — один InstancedMesh (одна геометрия, цвет — на экземпляр), материалов
 *  два — лицо и торец; итого 2 вызова отрисовки на проход (+1 тени, +1 частицы) вместо ~385 у варианта
 *  «меш на пластину». Тени между пластинами — карта 512 px; на сенсорных экранах тени выключены.
 *  Рендер идёт только когда это нужно: не на паузе, сцена на экране, вкладка активна. На каждом кадре — никаких
 *  обновлений DOM и состояния страницы: только матрицы экземпляров.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  InstancedMesh,
  MathUtils,
  Matrix4,
  MeshStandardMaterial,
  NoColorSpace,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  ACESFilmicToneMapping,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { WAVE_CONFIG, colorOfPlate, middleOfColor } from './wave-config';

export { WAVE_CONFIG };

export interface WaveOptions {
  /** HEX оттенков палитры по порядку */
  colors: string[];
  /** prefers-reduced-motion: волна собрана и неподвижна, без частиц и реакции на курсор */
  reduced: boolean;
  /** клик/тап по пластине: индекс оттенка в палитре */
  onPick: (colorIndex: number) => void;
  /** первый кадр нарисован — можно убрать CSS-раскладку */
  onReady: () => void;
}

export interface WaveHandle {
  /** выбрать оттенок (−1 — без выбора): приподнять его блок; burst — шлейф частиц */
  select: (colorIndex: number, burst: boolean) => void;
  setPaused: (paused: boolean) => void;
  destroy: () => void;
}

const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);

/** Процедурное зерно раствора: мелкий шум + мягкие пятна тона. Значения около 1 — цвет почти не темнеет. */
function grainCanvas(size = 256, seed = 7): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  // крупные пятна: несколько гауссовых «облаков» с малым контрастом
  const blobs = Array.from({ length: 7 }, () => ({ x: rnd() * size, y: rnd() * size, r: size * (0.18 + rnd() * 0.3), k: (rnd() - 0.5) * 0.09 }));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0.93 + (rnd() - 0.5) * 0.13; // зерно
      if (rnd() > 0.985) v -= 0.12 * rnd(); // редкие тёмные песчинки
      for (const b of blobs) {
        const dx = x - b.x;
        const dy = y - b.y;
        v += b.k * Math.exp(-(dx * dx + dy * dy) / (b.r * b.r));
      }
      const g = Math.max(0, Math.min(255, Math.round(v * 255)));
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = g;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Круглая мягкая точка для частиц (alphaMap читает зелёный канал). */
function dotCanvas(size = 32): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, '#fff');
  g.addColorStop(0.55, '#fff');
  g.addColorStop(1, '#000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return c;
}

export function mountWave(canvas: HTMLCanvasElement, opts: WaveOptions): WaveHandle {
  const C = WAVE_CONFIG;
  const N = C.count;
  const P = opts.colors.length;
  const reduced = opts.reduced;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, C.maxPixelRatio));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  // тени пластин друг на друга; на телефонах и планшетах — без теней (дешевле кадр)
  renderer.shadowMap.enabled = !coarse;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(C.fov, 1, 0.1, 50);
  camera.position.set(0, 0.55, 8);
  camera.lookAt(0, 0, 0);

  // Свет: мягкое небо сверху + направленный сверху-слева. «Пола» с тенью нет — фон остаётся бумагой страницы.
  scene.add(new HemisphereLight(0xfffaf1, 0xcfc4b3, 1.55));
  const sun = new DirectionalLight(0xffffff, 2.1);
  sun.position.set(-3.2, 5.5, 4.2);
  sun.castShadow = !coarse;
  sun.shadow.mapSize.set(512, 512);
  sun.shadow.camera.left = -4;
  sun.shadow.camera.right = 4;
  sun.shadow.camera.top = 3;
  sun.shadow.camera.bottom = -3;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 16;
  sun.shadow.radius = 3;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.025;
  scene.add(sun);

  const group = new Group();
  group.position.x = C.view.offsetX;
  scene.add(group);

  // Текстуры: одно зерно на все пластины (цвет — у экземпляра), отдельно — для шероховатости и рельефа
  const grain = grainCanvas();
  const mapTex = new CanvasTexture(grain);
  mapTex.colorSpace = SRGBColorSpace;
  const dataTex = new CanvasTexture(grain);
  dataTex.colorSpace = NoColorSpace;
  for (const t of [mapTex, dataTex]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = 4;
  }

  // Одна геометрия на все пластины. Толщина — по X (пластины стоят «стопкой» вдоль ленты).
  // Группы BoxGeometry (±X лицо, ±Y и ±Z торцы) идут подряд — сводим их в две: 0 — лицевые стороны, 1 — торцы.
  // Так у InstancedMesh две группы = два вызова отрисовки на проход.
  const geo = new RoundedBoxGeometry(C.plate.thickness, C.plate.height, C.plate.width, 2, C.plate.radius);
  const g = geo.groups;
  const faceCount = g[0].count + g[1].count;
  const total = g.reduce((s, x) => s + x.count, 0);
  geo.clearGroups();
  geo.addGroup(0, faceCount, 0);
  geo.addGroup(faceCount, total - faceCount, 1);

  // Материалы: лицо и торец (торец темнее и чуть шершавее). Цвет оттенка — instanceColor, он умножается на цвет материала.
  const face = new MeshStandardMaterial({
    color: 0xffffff,
    map: mapTex,
    roughness: C.material.roughness,
    roughnessMap: dataTex,
    bumpMap: dataTex,
    bumpScale: C.material.bump,
    metalness: 0,
  });
  const edge = new MeshStandardMaterial({
    color: new Color(C.material.edgeShade, C.material.edgeShade, C.material.edgeShade),
    map: mapTex,
    roughness: C.material.edgeRoughness,
    metalness: 0,
  });

  const plates = new InstancedMesh(geo, [face, edge], N);
  plates.castShadow = !coarse;
  plates.receiveShadow = !coarse;
  plates.frustumCulled = false; // матрицы меняются каждый кадр, граница считается для луча отдельно
  const colors = opts.colors.map((hex) => new Color(hex));
  for (let i = 0; i < N; i++) plates.setColorAt(i, colors[colorOfPlate(i, N, P)]);
  if (plates.instanceColor) plates.instanceColor.needsUpdate = true;
  group.add(plates);

  // Стартовый разброс — небольшой: лента «складывается» из сжатой стопки, без взрыва
  const startPose: Array<{ x: number; y: number; z: number; rx: number; ry: number; rz: number }> = [];
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const s0 = C.assemble.scatter;
  for (let i = 0; i < N; i++) startPose.push({ x: rnd() * 0.2, y: rnd() * s0, z: rnd() * s0, rx: rnd() * 0.25, ry: rnd() * 0.15, rz: rnd() * 0.2 });

  const dummy = new Object3D();
  dummy.rotation.order = 'YZX';
  const hoverW = new Float32Array(N); // сглаженный вес подъёма у каждой пластины
  let hovered = -1;
  let selectedColor = -1;

  // Частицы шлейфа: круглые, мелкие, немного
  const PC = C.particles.count;
  const pPos = new Float32Array(PC * 3);
  const pCol = new Float32Array(PC * 4).fill(1);
  const pVel = new Float32Array(PC * 3);
  const pLife = new Float32Array(PC);
  const pMax = new Float32Array(PC);
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new BufferAttribute(pCol, 4));
  const dotTex = new CanvasTexture(dotCanvas());
  const pMat = new PointsMaterial({ size: C.particles.size, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true, alphaMap: dotTex });
  const points = new Points(pGeo, pMat);
  points.visible = false;
  points.frustumCulled = false;
  group.add(points);
  let particlesAlive = 0;
  const halfL = ((N - 1) * C.spacing) / 2;

  // ── поза пластины i во «времени ленты» t с прогрессом сборки ──
  function pose(i: number, t: number, assembleT: number) {
    const u = i / (N - 1) - 0.5; // −0,5…0,5
    const phase = i * C.wave.phaseStep - t * C.wave.speed;
    const x = i * C.spacing - halfL;
    let y = C.curve.rise * Math.sin(u * Math.PI * 1.8) + C.wave.amplitude * Math.sin(phase);
    let z = C.curve.depth * Math.cos(u * Math.PI) - C.curve.depth * 0.6;
    // наклон по касательной к волне: производная высоты по x
    const slope = (C.wave.amplitude * Math.cos(phase) * C.wave.phaseStep) / C.spacing + (C.curve.rise * Math.PI * 1.8 * Math.cos(u * Math.PI * 1.8)) / ((N - 1) * C.spacing);
    let rz = Math.atan(slope) * C.wave.tilt;
    // закрутка ленты нарастает монотонно от края к краю + лёгкое покачивание с волной
    let rx = C.curve.twist * 2 * u + C.wave.roll * Math.sin(phase);
    let ry = C.yaw;
    // наведение и выбор: подъём и выдвижение к зрителю
    const w = hoverW[i];
    y += C.hover.lift * w;
    z += C.hover.push * w;
    // сборка из сжатой стопки
    let px = x;
    const k = easeOutCubic(MathUtils.clamp((assembleT - i * C.assemble.stagger) / C.assemble.duration, 0, 1));
    if (k < 1) {
      const s = startPose[i];
      px = MathUtils.lerp(x * 0.35 + s.x, x, k);
      y = MathUtils.lerp(s.y, y, k);
      z = MathUtils.lerp(s.z, z, k);
      rx = MathUtils.lerp(rx + s.rx, rx, k);
      ry = MathUtils.lerp(ry + s.ry, ry, k);
      rz = MathUtils.lerp(rz + s.rz, rz, k);
    }
    dummy.position.set(px, y, z);
    dummy.rotation.set(rx, ry, rz);
    dummy.scale.setScalar(0.92 + 0.08 * k);
    dummy.updateMatrix();
    plates.setMatrixAt(i, dummy.matrix);
  }

  // ── состояние времени ──
  let waveT = 0; // время ленты (идёт только когда анимация запущена)
  let assembleT = reduced ? 99 : 0;
  let paused = reduced;
  let onScreen = true;
  let pageVisible = !document.hidden;
  let raf = 0;
  let last = 0;
  const pointerTarget = new Vector2();
  const pointerNow = new Vector2();
  const sig2 = 2 * C.hover.sigma * C.hover.sigma;

  function update(dt: number) {
    const a = reduced ? 1 : 1 - Math.exp(-C.hover.ease * dt);
    for (let i = 0; i < N; i++) {
      let target = hovered >= 0 ? Math.exp(-((i - hovered) ** 2) / sig2) : 0;
      if (selectedColor >= 0 && colorOfPlate(i, N, P) === selectedColor) target = Math.max(target, C.selected);
      hoverW[i] += (target - hoverW[i]) * a;
      pose(i, waveT, assembleT);
    }
    plates.instanceMatrix.needsUpdate = true;
    // наклон сцены за курсором с инерцией
    if (!reduced) {
      const b = 1 - Math.exp(-C.pointer.ease * dt);
      pointerNow.lerp(pointerTarget, b);
      const deg = MathUtils.degToRad(C.pointer.tiltDeg);
      group.rotation.y = pointerNow.x * deg;
      group.rotation.x = -pointerNow.y * deg * 0.6;
    }
    if (particlesAlive > 0) updateParticles(dt);
  }

  function updateParticles(dt: number) {
    let alive = 0;
    const damp = Math.exp(-2.4 * dt);
    for (let p = 0; p < PC; p++) {
      if (pLife[p] <= 0) { pCol[p * 4 + 3] = 0; continue; }
      pLife[p] -= dt;
      const j = p * 3;
      pVel[j] *= damp; pVel[j + 1] = pVel[j + 1] * damp + 0.25 * dt; pVel[j + 2] *= damp;
      // частицы не выходят за пределы сцены (и canvas)
      pPos[j] = MathUtils.clamp(pPos[j] + pVel[j] * dt, -halfL, halfL);
      pPos[j + 1] = MathUtils.clamp(pPos[j + 1] + pVel[j + 1] * dt, -1, 1);
      pPos[j + 2] = MathUtils.clamp(pPos[j + 2] + pVel[j + 2] * dt, -1.5, 1.5);
      pCol[p * 4 + 3] = Math.max(0, pLife[p] / pMax[p]);
      if (pLife[p] > 0) alive++;
    }
    particlesAlive = alive;
    points.visible = alive > 0;
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
  }

  const tmp = new Vector3();
  const m4 = new Matrix4();
  function burst(plate: number, hex: string) {
    if (reduced) return;
    pMat.color.set(hex);
    plates.getMatrixAt(plate, m4);
    for (let p = 0; p < PC; p++) {
      const j = p * 3;
      // старт — по пластине, чуть перед ней (иначе шлейф прячется внутри ленты); разлёт мягко в стороны и вверх
      tmp.set(0, (Math.random() - 0.5) * C.plate.height, (Math.random() - 0.5) * C.plate.width).applyMatrix4(m4);
      tmp.z += 0.45;
      pPos[j] = tmp.x; pPos[j + 1] = tmp.y; pPos[j + 2] = tmp.z;
      const ang = Math.random() * Math.PI * 2;
      const sp = C.particles.speed * (0.3 + Math.random() * 0.7);
      pVel[j] = Math.cos(ang) * sp;
      pVel[j + 1] = Math.sin(ang) * sp * 0.6 + 0.15;
      pVel[j + 2] = (Math.random() - 0.2) * sp * 0.5;
      pMax[p] = pLife[p] = C.particles.lifeMin + Math.random() * (C.particles.lifeMax - C.particles.lifeMin);
      pCol[p * 4 + 3] = 1;
    }
    particlesAlive = PC;
    points.visible = true;
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
  }

  // ── размер: камера отъезжает так, чтобы лента помещалась по ширине (на узкой сцене — с меньшим запасом) ──
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(MathUtils.degToRad(C.fov / 2));
    const mx = camera.aspect < 1.7 ? 0.15 : C.view.marginX;
    // на телефоне лента целиком в кадре (иначе последний оттенок уходит за край); с 600 px — уходит вправо «через экран»
    group.position.x = w < 600 ? C.view.offsetXPhone : C.view.offsetX;
    const needW = halfL + mx;
    const needH = C.view.halfHeight;
    const dist = Math.max(needH / tan, needW / (tan * camera.aspect));
    camera.position.set(0, dist * 0.07, dist);
    camera.lookAt(0, -0.05, 0);
    camera.updateProjectionMatrix();
  }

  const render = () => renderer.render(scene, camera);
  let readySent = false;
  const ready = () => {
    if (readySent) return;
    readySent = true;
    opts.onReady();
  };

  function frame(now: number) {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    waveT += dt;
    assembleT += dt;
    if (pointerDirty) pick();
    update(dt);
    render();
    ready();
    loop();
  }
  const running = () => !paused && onScreen && pageVisible;
  function loop() {
    if (running() && !raf) raf = requestAnimationFrame(frame);
    if (!running()) last = 0;
  }
  /** один кадр без хода времени — пауза, reduced-motion, изменение размера */
  function still() {
    update(1);
    render();
    ready();
  }

  // ── указатель: наведение (raycaster), клик, наклон сцены ──
  const ray = new Raycaster();
  const ndc = new Vector2();
  let pointerDirty = false;
  let pointerInside = false;
  /** номер пластины под лучом или −1 (границу экземпляров пересчитываем — матрицы двигаются) */
  function hitPlate(): number {
    ray.setFromCamera(ndc, camera);
    plates.computeBoundingSphere();
    const hit = ray.intersectObject(plates, false)[0];
    return hit && hit.instanceId !== undefined ? hit.instanceId : -1;
  }
  function pick() {
    pointerDirty = false;
    if (!pointerInside) { hovered = -1; canvas.style.cursor = ''; return; }
    hovered = hitPlate();
    canvas.style.cursor = hovered >= 0 ? 'pointer' : '';
  }
  const toNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const onMove = (e: PointerEvent) => {
    toNdc(e);
    pointerInside = e.pointerType === 'mouse';
    pointerDirty = true;
    if (e.pointerType === 'mouse') pointerTarget.set(ndc.x, ndc.y);
  };
  const onLeave = () => {
    pointerInside = false;
    pointerDirty = true;
    pointerTarget.set(0, 0);
  };
  let downAt: { x: number; y: number } | null = null;
  const onDown = (e: PointerEvent) => { downAt = { x: e.clientX, y: e.clientY }; };
  const onUp = (e: PointerEvent) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved > 8) return; // это была прокрутка/жест, не выбор
    toNdc(e);
    const i = hitPlate();
    if (i >= 0) opts.onPick(colorOfPlate(i, N, P));
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);

  const ro = new ResizeObserver(() => {
    resize();
    if (!running()) still();
  });
  ro.observe(canvas);
  const io = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    loop();
  });
  io.observe(canvas);
  const onVis = () => {
    pageVisible = !document.hidden;
    loop();
  };
  document.addEventListener('visibilitychange', onVis);

  resize();
  if (reduced) still();
  else {
    // первый кадр сразу — пластины сжатой стопкой, сборка идёт со следующего
    update(0);
    render();
    ready();
    loop();
  }

  return {
    select(colorIndex, withBurst) {
      selectedColor = colorIndex >= 0 && colorIndex < P ? colorIndex : -1;
      if (withBurst && selectedColor >= 0 && running()) burst(middleOfColor(selectedColor, N, P), opts.colors[selectedColor]);
      if (!running()) still();
    },
    setPaused(p) {
      paused = reduced || p;
      if (paused) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        hovered = -1;
      }
      loop();
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      geo.dispose();
      plates.dispose();
      pGeo.dispose();
      pMat.dispose();
      face.dispose();
      edge.dispose();
      mapTex.dispose();
      dataTex.dispose();
      dotTex.dispose();
      renderer.dispose();
    },
  };
}
