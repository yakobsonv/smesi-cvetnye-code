/** Объёмная волна образцов раствора — сцена Three.js для первого экрана главной (бриф 20.10).
 *
 *  Последовательность тонких матовых пластин (образцы цветной кладочной смеси) стоит вдоль пространственной
 *  кривой и образует скрученную волну. При старте пластины собираются из разброса, затем по ним медленно
 *  идёт волна: соседние пластины с небольшим сдвигом фазы меняют высоту и наклон (наклон — от производной).
 *
 *  Модуль грузится динамическим import() из MortarWave.astro уже после первой отрисовки страницы: до этого
 *  на месте сцены стоит статичная CSS-раскладка тех же цветов. Импорт — только нужных классов (tree-shaking).
 *  Рендер идёт только когда это нужно: не на паузе, сцена на экране, вкладка активна. На каждом кадре — никаких
 *  обновлений DOM и состояния страницы: только матрицы пластин.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  NoColorSpace,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  ShadowMaterial,
  ACESFilmicToneMapping,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { WAVE_CONFIG } from './wave-config';

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
  /** выбрать оттенок: подсветить ближайшую к центру пластину этого цвета; burst — шлейф частиц */
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

export function mountWave(canvas: HTMLCanvasElement, opts: WaveOptions): WaveHandle {
  const C = WAVE_CONFIG;
  const N = C.count;
  const P = opts.colors.length;
  const reduced = opts.reduced;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, C.maxPixelRatio));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(C.fov, 1, 0.1, 50);
  camera.position.set(0, 0.55, 8);
  camera.lookAt(0, 0, 0);

  // Свет: мягкое небо сверху + направленный сверху-слева; тени деликатные (мягкая карта, низкая плотность на «полу»)
  scene.add(new HemisphereLight(0xfffaf1, 0xcfc4b3, 1.55));
  const sun = new DirectionalLight(0xffffff, 2.1);
  sun.position.set(-3.2, 5.5, 4.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -4;
  sun.shadow.camera.right = 4;
  sun.shadow.camera.top = 3;
  sun.shadow.camera.bottom = -3;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 16;
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  const group = new Group();
  group.position.x = C.view.offsetX;
  scene.add(group);

  // «Пол» только принимает тень — фон остаётся бумагой страницы (canvas прозрачный)
  const floorMat = new ShadowMaterial({ opacity: 0.07 });
  const floor = new Mesh(new PlaneGeometry(14, 8), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.08;
  floor.receiveShadow = true;
  group.add(floor);

  // Текстуры: одно зерно на все пластины (цвет — у материала), отдельно — для шероховатости и рельефа
  const grain = grainCanvas();
  const mapTex = new CanvasTexture(grain);
  mapTex.colorSpace = SRGBColorSpace;
  const dataTex = new CanvasTexture(grain);
  dataTex.colorSpace = NoColorSpace;
  for (const t of [mapTex, dataTex]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = 4;
  }

  // Одна геометрия на все пластины. Толщина — по X (пластины стоят «стопкой» вдоль волны).
  // Группы BoxGeometry: 0/1 — лицевые стороны (±X), 2–5 — торцы.
  const geo = new RoundedBoxGeometry(C.plate.thickness, C.plate.height, C.plate.width, 2, C.plate.radius);

  // Материалы по цвету: лицо и торец (торец темнее и чуть шершавее). 2 материала × 8 оттенков.
  const mats = opts.colors.map((hex) => {
    const face = new MeshStandardMaterial({
      color: new Color(hex),
      map: mapTex,
      roughness: C.material.roughness,
      roughnessMap: dataTex,
      bumpMap: dataTex,
      bumpScale: C.material.bump,
      metalness: 0,
    });
    const edge = new MeshStandardMaterial({
      color: new Color(hex).multiplyScalar(C.material.edgeShade),
      map: mapTex,
      roughness: C.material.edgeRoughness,
      metalness: 0,
    });
    return [face, face, edge, edge, edge, edge];
  });

  // Пластины. Пересчёт позы — в update(), без создания объектов на кадре.
  const meshes: Mesh[] = [];
  const startPose: Array<{ x: number; y: number; z: number; rx: number; ry: number; rz: number }> = [];
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < N; i++) {
    const m = new Mesh(geo, mats[i % P]);
    m.castShadow = true;
    m.receiveShadow = true;
    m.rotation.order = 'YZX';
    m.userData.index = i;
    group.add(m);
    meshes.push(m);
    const s = C.assemble.scatter;
    startPose.push({ x: rnd() * 0.5, y: rnd() * s, z: -1.2 + rnd() * s, rx: rnd() * 1.4, ry: rnd() * 0.8, rz: rnd() * 1.1 });
  }

  const hoverW = new Float32Array(N); // сглаженный вес наведения у каждой пластины
  let hovered = -1;
  let selectedPlate = -1;

  // Частицы шлейфа
  const PC = C.particles.count;
  const pPos = new Float32Array(PC * 3);
  const pCol = new Float32Array(PC * 4).fill(1);
  const pVel = new Float32Array(PC * 3);
  const pLife = new Float32Array(PC);
  const pMax = new Float32Array(PC);
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new BufferAttribute(pCol, 4));
  const pMat = new PointsMaterial({ size: C.particles.size, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true });
  const points = new Points(pGeo, pMat);
  points.visible = false;
  points.frustumCulled = false;
  group.add(points);
  let particlesAlive = 0;
  const halfL = ((N - 1) * C.spacing) / 2;

  // ── поза пластины i во «времени волны» t с прогрессом сборки ──
  const plateX = (i: number) => i * C.spacing - halfL;
  function pose(i: number, t: number, assembleT: number) {
    const u = i / (N - 1) - 0.5; // −0,5…0,5
    const phase = i * C.wave.phaseStep - t * C.wave.speed;
    const x = plateX(i);
    let y = C.curve.rise * Math.sin(u * Math.PI * 1.8) + C.wave.amplitude * Math.sin(phase);
    let z = C.curve.depth * Math.cos(u * Math.PI) - C.curve.depth * 0.6;
    // наклон по касательной к волне: производная высоты по x
    const slope = (C.wave.amplitude * Math.cos(phase) * C.wave.phaseStep) / C.spacing + (C.curve.rise * Math.PI * 1.8 * Math.cos(u * Math.PI * 1.8)) / ((N - 1) * C.spacing);
    let rz = Math.atan(slope) * C.wave.tilt;
    let rx = C.curve.twist * Math.sin(u * Math.PI * 1.6) + C.wave.roll * Math.sin(phase);
    let ry = C.yaw;
    // наведение и выбор: подъём и выдвижение к зрителю
    const w = hoverW[i];
    y += C.hover.lift * w;
    z += C.hover.push * w;
    // сборка из разброса
    let px = x;
    const k = easeOutCubic(MathUtils.clamp((assembleT - i * C.assemble.stagger) / C.assemble.duration, 0, 1));
    if (k < 1) {
      const s = startPose[i];
      px = MathUtils.lerp(x * 0.35 + s.x, x, k);
      y = MathUtils.lerp(s.y, y, k);
      z = MathUtils.lerp(s.z, z, k);
      rx = MathUtils.lerp(s.rx, rx, k);
      ry = MathUtils.lerp(ry + s.ry, ry, k);
      rz = MathUtils.lerp(s.rz, rz, k);
    }
    const m = meshes[i];
    m.position.set(px, y, z);
    m.rotation.set(rx, ry, rz);
    const sc = 0.55 + 0.45 * k;
    m.scale.setScalar(sc);
  }

  // ── состояние времени ──
  let waveT = 0; // время волны (идёт только когда анимация запущена)
  let assembleT = reduced ? 99 : 0;
  let paused = reduced;
  let onScreen = true;
  let pageVisible = !document.hidden;
  let raf = 0;
  let last = 0;
  const pointerTarget = new Vector2();
  const pointerNow = new Vector2();

  function targetWeights(): (i: number) => number {
    const sig2 = 2 * C.hover.sigma * C.hover.sigma;
    return (i) => {
      let w = 0;
      if (hovered >= 0) w = Math.exp(-((i - hovered) ** 2) / sig2);
      if (selectedPlate >= 0) w = Math.max(w, C.selected * Math.exp(-((i - selectedPlate) ** 2) / (sig2 * 0.5)));
      return w;
    };
  }

  function update(dt: number) {
    const target = targetWeights();
    const a = reduced ? 1 : 1 - Math.exp(-C.hover.ease * dt);
    for (let i = 0; i < N; i++) {
      hoverW[i] += (target(i) - hoverW[i]) * a;
      pose(i, waveT, assembleT);
    }
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
      pPos[j + 1] = MathUtils.clamp(pPos[j + 1] + pVel[j + 1] * dt, -1.1, 1.3);
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
  function burst(plate: number, hex: string) {
    if (reduced) return;
    pMat.color.set(hex);
    const m = meshes[plate];
    for (let p = 0; p < PC; p++) {
      const j = p * 3;
      // старт — по кромке пластины, разлёт мягко в стороны и вверх
      tmp.set(0, (Math.random() - 0.5) * C.plate.height, (Math.random() - 0.5) * C.plate.width);
      tmp.applyEuler(m.rotation).add(m.position);
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

  // ── размер: камера отъезжает так, чтобы волна помещалась по ширине ──
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tan = Math.tan(MathUtils.degToRad(C.fov / 2));
    const needW = halfL + C.view.marginX;
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
  function pick() {
    pointerDirty = false;
    if (!pointerInside) { hovered = -1; canvas.style.cursor = ''; return; }
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    hovered = hit ? (hit.object.userData.index as number) : -1;
    canvas.style.cursor = hit ? 'pointer' : '';
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
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    if (!hit) return;
    const i = hit.object.userData.index as number;
    selectedPlate = i;
    opts.onPick(i % P);
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
    // первый кадр сразу — пластины в разбросе, сборка начинается со следующего
    update(0);
    render();
    ready();
    loop();
  }

  return {
    select(colorIndex, withBurst) {
      // пластина этого цвета, ближайшая к центру волны (если клик был не по ней самой)
      if (selectedPlate < 0 || selectedPlate % P !== colorIndex) {
        let best = -1;
        for (let i = colorIndex; i < N; i += P) if (best < 0 || Math.abs(i - (N - 1) / 2) < Math.abs(best - (N - 1) / 2)) best = i;
        selectedPlate = best;
      }
      if (withBurst && selectedPlate >= 0 && running()) burst(selectedPlate, opts.colors[colorIndex]);
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
      pGeo.dispose();
      pMat.dispose();
      floor.geometry.dispose();
      floorMat.dispose();
      mats.forEach((m) => { m[0].dispose(); m[2].dispose(); });
      mapTex.dispose();
      dataTex.dispose();
      renderer.dispose();
    },
  };
}
