/** Кадры кладки для страницы «Подбор цвета шва под кирпич» (цвет кирпича × цвет шва) и первого экрана главной.
 *
 *  ИСТОЧНИК — материалы клиента (Николай, ООО «Кирпичный трест») на Яндекс.Диске, публичная ссылка
 *  https://disk.yandex.ru/d/4Xj3pQEsJbrcrQ, папка «Текстуры (кладки)». Поле `source` — путь файла внутри этой ссылки
 *  (как его отдаёт листинг cloud-api.yandex.net/v1/disk/public/resources). Скачано и обработано 09.10.2026.
 *
 *  ⚠️ ЭТО ВИЗУАЛИЗАЦИИ (рендеры), а не фото настоящей кладки: ровные кирпичи, нарисованная тень шва.
 *  На странице так и подписывать («визуализация»), не выдавать за фото объекта.
 *  ⚠️ Бренда и артикула смеси в материалах нет: шов на кадре НЕ привязан к позиции Perel / Основит.
 *  Подпись шва — видимый цвет, а не название смеси.
 *
 *  ПОДПИСЬ ШВА = ВИДИМЫЙ ЦВЕТ. Каждый кадр открыт глазами (фрагмент 1:1 и масштаб страницы), цвет раствора
 *  дополнительно замерен (в комментарии у шва — средний цвет раствора в горизонтальных швах).
 *  • Серия 1024×1024 (имена «<завод>_гладкий_<цвет>_шов <шов>.jpg»): имя файла совпадает с видимым цветом.
 *    Раствор на всех кирпичах этой серии один и тот же набор (белый #dedddd … кремово-розовый #cbaca5).
 *  • Серия 4134×3960–3975 (транслит: osmbt-…-wov, sero-bejevyj-…, slon-…, terrakot-…; у файлов папки «белый»
 *    фактически 4134×3960, хотя в EXIF записано 3975; у «терракот» 4134×3975): ИМЯ ФАЙЛА НЕ СОВПАДАЕТ
 *    с видимым цветом. Пересчёт: «superbelyj» → белый, «belyj» → светло-серый, «korichnevyj» → чёрно-коричневый
 *    (#422f28, почти чёрный), «svetlo-korichnevyj» → тёмно-коричневый (#5c3d2c), «kremovo-rozovyj» → коричневый
 *    (#81584b — тот же цвет, что «коричневый» в серии 1024); у белого кирпича ОСМиБТ «kremovo-rozovyj» светлее
 *    (#95735f) → светло-коричневый. Супербелого и кремово-розового в этой серии нет.
 *  Порядок швов один для всех кирпичей: white, superwhite, lightgrey, grey, darkgrey, black, blackbrown,
 *  darkbrown, brown, lightbrown, cream (стандартные id в заданном порядке, свои вставлены рядом по тону).
 *  Один и тот же id шва = близкий цвет раствора на всех кирпичах (можно сохранять выбор шва при смене кирпича;
 *  если у нового кирпича такого id нет — брать соседний по порядку).
 *
 *  ЕДИНЫЙ КАДР: квадрат 1000×1000 (WebP q85), превью 320×320 (q75). Масштаб кирпича у всех кадров одинаковый:
 *  шаг рядов 71 px на 1000 px. Серия 1024 — весь кадр 1024 → 1000; серия 4134 — центральный квадрат 2790 px
 *  исходника (тот же шаг рядов) → 1000. У восьми швов одного кирпича раскладка одна и та же (сверено масками
 *  кирпича: лучшее совпадение без сдвига) — при переключении шва кирпичи не «прыгают».
 *
 *  ⚠️ ОДИН РЕНДЕР НА ДВА ЗАВОДА: у клиента в папках ОСМиБТ «коричневый», «красный», «серый», «соломенный» лежат
 *  ТЕ ЖЕ файлы, что у ЖКЗ «т_коричневый», «красный», «серый», «соломенный» (md5 совпадает у всех 32 пар).
 *  Картинки на сайте для этих пар одинаковые — см. KLADKA_SAME_RENDER; показывать ли оба завода, решает страница.
 *
 *  НЕ ВЗЯТО: ЖКЗ «персиковый» (один кадр, шов серый — переключать нечего).
 *
 *  ВТОРАЯ ПРОВЕРКА 09.10.2026 (независимая: листы по каждому кирпичу, фрагменты 1:1, замер ядра шва по пикселям,
 *  которые меняются между вариантами): подписи всех 112 кадров совпадают с видимым цветом; водяных знаков и мусора нет,
 *  пропорции кирпича не искажены, превью -sm соответствуют своим кадрам. Самые близкие пары внутри одного кирпича —
 *  белый/супербелый и белый/светло-серый (CIEDE2000 ≈ 5), чёрно-коричневый/тёмно-коричневый (≈ 7): на фрагменте 1:1
 *  различимы, оставлены. Соответствие «файл клиента → кадр» перепроверено по исходникам папки «белый» (5 файлов) и
 *  по terrakot-superbelyj (кадр terrakot-white и первый экран).
 */

export interface KladkaSeam {
  id: string;
  /** видимый цвет шва по-русски */
  label: string;
  src: string;
  srcSm: string;
  w: number;
  h: number;
  /** путь файла на диске клиента (внутри публичной ссылки) */
  source: string;
}

export interface KladkaBrick {
  id: string;
  factory: 'osmibt' | 'zhkz';
  factoryName: string;
  brick: string;
  seams: KladkaSeam[];
}

export const KLADKA: KladkaBrick[] = [
  {
    id: 'osmibt-soloma',
    factory: 'osmibt',
    factoryName: 'Старый Оскол (ОСМиБТ)',
    brick: 'соломенный',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/osmibt-soloma-white.webp', srcSm: '/assets/kladka/osmibt-soloma-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/соломенный/ОСМиБТ_гладкий_солома_шов белый.jpg' }, // раствор #dfdedd, ΔE к кирпичу 28.6
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/osmibt-soloma-superwhite.webp', srcSm: '/assets/kladka/osmibt-soloma-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/соломенный/ОСМиБТ_гладкий_солома_шов супербелый.jpg' }, // раствор #f4f4f3, ΔE к кирпичу 30.7
      { id: 'grey', label: 'серый', src: '/assets/kladka/osmibt-soloma-grey.webp', srcSm: '/assets/kladka/osmibt-soloma-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/соломенный/ОСМиБТ_гладкий_солома_шов серый.jpg' }, // раствор #9c9a99, ΔE к кирпичу 35.2
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/osmibt-soloma-darkgrey.webp', srcSm: '/assets/kladka/osmibt-soloma-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/соломенный/ОСМиБТ_гладкий_солома_шов т-серый.jpg' }, // раствор #494645, ΔE к кирпичу 61.6
      { id: 'black', label: 'чёрный', src: '/assets/kladka/osmibt-soloma-black.webp', srcSm: '/assets/kladka/osmibt-soloma-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/соломенный/ОСМиБТ_гладкий_солома_шов черный.jpg' }, // раствор #171614, ΔE к кирпичу 82.5
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/osmibt-soloma-brown.webp', srcSm: '/assets/kladka/osmibt-soloma-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/соломенный/ОСМиБТ_гладкий_солома_шов коричневый.jpg' }, // раствор #865b4e, ΔE к кирпичу 45.5
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/osmibt-soloma-lightbrown.webp', srcSm: '/assets/kladka/osmibt-soloma-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/соломенный/ОСМиБТ_гладкий_солома_шов св-коричневый.jpg' }, // раствор #a4806c, ΔE к кирпичу 31.5
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/osmibt-soloma-cream.webp', srcSm: '/assets/kladka/osmibt-soloma-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/соломенный/ОСМиБТ_гладкий_солома_шов розовый.jpg' }, // раствор #ccaca4, ΔE к кирпичу 23.8
    ],
  },
  {
    id: 'osmibt-belyj',
    factory: 'osmibt',
    factoryName: 'Старый Оскол (ОСМиБТ)',
    brick: 'белый',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/osmibt-belyj-white.webp', srcSm: '/assets/kladka/osmibt-belyj-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/белый/osmbt-gladkij-belyj-super-belyj-wov.jpg' }, // раствор #dddcd7, ΔE к кирпичу 8.1
      { id: 'lightgrey', label: 'светло-серый', src: '/assets/kladka/osmibt-belyj-lightgrey.webp', srcSm: '/assets/kladka/osmibt-belyj-lightgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/белый/osmbt-gladkij-belyj-belyj-wov.jpg' }, // раствор #c7c6c1, ΔE к кирпичу 10.8
      { id: 'grey', label: 'серый', src: '/assets/kladka/osmibt-belyj-grey.webp', srcSm: '/assets/kladka/osmibt-belyj-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/белый/osmbt-gladkij-belyj-seryj-wov.jpg' }, // раствор #82817b, ΔE к кирпичу 33.9
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/osmibt-belyj-darkgrey.webp', srcSm: '/assets/kladka/osmibt-belyj-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/белый/osmbt-gladkij-belyj-temno-seryj-wov.jpg' }, // раствор #494a46, ΔE к кирпичу 56.4
      { id: 'black', label: 'чёрный', src: '/assets/kladka/osmibt-belyj-black.webp', srcSm: '/assets/kladka/osmibt-belyj-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/белый/osmbt-gladkij-belyj-chernyj-wov.jpg' }, // раствор #2f302c, ΔE к кирпичу 67.9
      { id: 'blackbrown', label: 'чёрно-коричневый', src: '/assets/kladka/osmibt-belyj-blackbrown.webp', srcSm: '/assets/kladka/osmibt-belyj-blackbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/белый/osmbt-gladkij-belyj-korichnevyj-wov.jpg' }, // раствор #3c1f17, ΔE к кирпичу 72.7
      { id: 'darkbrown', label: 'тёмно-коричневый', src: '/assets/kladka/osmibt-belyj-darkbrown.webp', srcSm: '/assets/kladka/osmibt-belyj-darkbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/белый/osmbt-gladkij-belyj-svetlo-korichnevyj-wov.jpg' }, // раствор #5a382f, ΔE к кирпичу 61.3
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/osmibt-belyj-lightbrown.webp', srcSm: '/assets/kladka/osmibt-belyj-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/белый/osmbt-gladkij-belyj-kremovo-rozovyj-wov.jpg' }, // раствор #95735f, ΔE к кирпичу 37.6
    ],
  },
  {
    id: 'osmibt-seryj',
    factory: 'osmibt',
    factoryName: 'Старый Оскол (ОСМиБТ)',
    brick: 'серый',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/osmibt-seryj-white.webp', srcSm: '/assets/kladka/osmibt-seryj-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый/ОСМиБТ_гладкий_серый_шов белый.jpg' }, // раствор #dedede, ΔE к кирпичу 3.6
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/osmibt-seryj-superwhite.webp', srcSm: '/assets/kladka/osmibt-seryj-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый/ОСМиБТ_гладкий_серый_шов супербелый.jpg' }, // раствор #f2f2f2, ΔE к кирпичу 10.6
      { id: 'grey', label: 'серый', src: '/assets/kladka/osmibt-seryj-grey.webp', srcSm: '/assets/kladka/osmibt-seryj-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый/ОСМиБТ_гладкий_серый_шов серый.jpg' }, // раствор #9c9a9a, ΔE к кирпичу 21.2
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/osmibt-seryj-darkgrey.webp', srcSm: '/assets/kladka/osmibt-seryj-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый/ОСМиБТ_гладкий_серый_шов т-серый.jpg' }, // раствор #494645, ΔE к кирпичу 55.0
      { id: 'black', label: 'чёрный', src: '/assets/kladka/osmibt-seryj-black.webp', srcSm: '/assets/kladka/osmibt-seryj-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый/ОСМиБТ_гладкий_серый_шов черный.jpg' }, // раствор #171614, ΔE к кирпичу 77.6
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/osmibt-seryj-brown.webp', srcSm: '/assets/kladka/osmibt-seryj-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый/ОСМиБТ_гладкий_серый_шов коричневый.jpg' }, // раствор #865b4e, ΔE к кирпичу 47.2
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/osmibt-seryj-lightbrown.webp', srcSm: '/assets/kladka/osmibt-seryj-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый/ОСМиБТ_гладкий_серый_шов св-коричневый.jpg' }, // раствор #a4806c, ΔE к кирпичу 34.5
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/osmibt-seryj-cream.webp', srcSm: '/assets/kladka/osmibt-seryj-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый/ОСМиБТ_гладкий_серый_шов розовый.jpg' }, // раствор #cbaca6, ΔE к кирпичу 17.4
    ],
  },
  {
    id: 'osmibt-seryj-bezh',
    factory: 'osmibt',
    factoryName: 'Старый Оскол (ОСМиБТ)',
    brick: 'серый беж',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/osmibt-seryj-bezh-white.webp', srcSm: '/assets/kladka/osmibt-seryj-bezh-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый беж/sero-bejevyj-superbelyj.jpg' }, // раствор #d8d8ce, ΔE к кирпичу 14.1
      { id: 'lightgrey', label: 'светло-серый', src: '/assets/kladka/osmibt-seryj-bezh-lightgrey.webp', srcSm: '/assets/kladka/osmibt-seryj-bezh-lightgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый беж/sero-bejevyj-belyj.jpg' }, // раствор #c2c3b9, ΔE к кирпичу 10.3
      { id: 'grey', label: 'серый', src: '/assets/kladka/osmibt-seryj-bezh-grey.webp', srcSm: '/assets/kladka/osmibt-seryj-bezh-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый беж/sero-bejevyj-seryj.jpg' }, // раствор #80796f, ΔE к кирпичу 25.7
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/osmibt-seryj-bezh-darkgrey.webp', srcSm: '/assets/kladka/osmibt-seryj-bezh-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый беж/sero-bejevyj-temnoseryj.jpg' }, // раствор #4a453d, ΔE к кирпичу 47.0
      { id: 'black', label: 'чёрный', src: '/assets/kladka/osmibt-seryj-bezh-black.webp', srcSm: '/assets/kladka/osmibt-seryj-bezh-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый беж/sero-bejevyj-chernyj.jpg' }, // раствор #252425, ΔE к кирпичу 63.0
      { id: 'blackbrown', label: 'чёрно-коричневый', src: '/assets/kladka/osmibt-seryj-bezh-blackbrown.webp', srcSm: '/assets/kladka/osmibt-seryj-bezh-blackbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый беж/sero-bejevyj-korichnevyj.jpg' }, // раствор #422f28, ΔE к кирпичу 54.9
      { id: 'darkbrown', label: 'тёмно-коричневый', src: '/assets/kladka/osmibt-seryj-bezh-darkbrown.webp', srcSm: '/assets/kladka/osmibt-seryj-bezh-darkbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый беж/sero-bejevyj-svetlo-korichnevyj.jpg' }, // раствор #5c3d2c, ΔE к кирпичу 47.7
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/osmibt-seryj-bezh-brown.webp', srcSm: '/assets/kladka/osmibt-seryj-bezh-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/серый беж/sero-bejevyj-kremroz.jpg' }, // раствор #81584b, ΔE к кирпичу 36.4
    ],
  },
  {
    id: 'osmibt-korichnevyj',
    factory: 'osmibt',
    factoryName: 'Старый Оскол (ОСМиБТ)',
    brick: 'коричневый',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/osmibt-korichnevyj-white.webp', srcSm: '/assets/kladka/osmibt-korichnevyj-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/коричневый/ОСМиБТ_гладкий_коричневый_шов белый.jpg' }, // раствор #dedddd, ΔE к кирпичу 54.1
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/osmibt-korichnevyj-superwhite.webp', srcSm: '/assets/kladka/osmibt-korichnevyj-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/коричневый/ОСМиБТ_гладкий_коричневый_шов супербелый.jpg' }, // раствор #f4f4f3, ΔE к кирпичу 61.2
      { id: 'grey', label: 'серый', src: '/assets/kladka/osmibt-korichnevyj-grey.webp', srcSm: '/assets/kladka/osmibt-korichnevyj-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/коричневый/ОСМиБТ_гладкий_коричневый_шов серый.jpg' }, // раствор #9a9897, ΔE к кирпичу 33.8
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/osmibt-korichnevyj-darkgrey.webp', srcSm: '/assets/kladka/osmibt-korichnevyj-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/коричневый/ОСМиБТ_гладкий_коричневый_шов т-серый.jpg' }, // раствор #494643, ΔE к кирпичу 26.6
      { id: 'black', label: 'чёрный', src: '/assets/kladka/osmibt-korichnevyj-black.webp', srcSm: '/assets/kladka/osmibt-korichnevyj-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/коричневый/ОСМиБТ_гладкий_коричневый_шов черный.jpg' }, // раствор #171614, ΔE к кирпичу 42.1
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/osmibt-korichnevyj-brown.webp', srcSm: '/assets/kladka/osmibt-korichnevyj-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/коричневый/ОСМиБТ_гладкий_коричневый_шов коричневый.jpg' }, // раствор #855a4b, ΔE к кирпичу 9.9
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/osmibt-korichnevyj-lightbrown.webp', srcSm: '/assets/kladka/osmibt-korichnevyj-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/коричневый/ОСМиБТ_гладкий_коричневый_шов св-коричневый.jpg' }, // раствор #a27e6a, ΔE к кирпичу 16.9
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/osmibt-korichnevyj-cream.webp', srcSm: '/assets/kladka/osmibt-korichnevyj-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/коричневый/ОСМиБТ_гладкий_коричневый_шов розовый.jpg' }, // раствор #c9aaa3, ΔE к кирпичу 35.3
    ],
  },
  {
    id: 'osmibt-krasnyj',
    factory: 'osmibt',
    factoryName: 'Старый Оскол (ОСМиБТ)',
    brick: 'красный',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/osmibt-krasnyj-white.webp', srcSm: '/assets/kladka/osmibt-krasnyj-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/красный/ОСМиБТ_гладкий_красный_шов белый.jpg' }, // раствор #dedddd, ΔE к кирпичу 62.2
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/osmibt-krasnyj-superwhite.webp', srcSm: '/assets/kladka/osmibt-krasnyj-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/красный/ОСМиБТ_гладкий_красный_шов супербелый.jpg' }, // раствор #f4f3f3, ΔE к кирпичу 67.6
      { id: 'grey', label: 'серый', src: '/assets/kladka/osmibt-krasnyj-grey.webp', srcSm: '/assets/kladka/osmibt-krasnyj-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/красный/ОСМиБТ_гладкий_красный_шов серый.jpg' }, // раствор #9b9898, ΔE к кирпичу 48.4
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/osmibt-krasnyj-darkgrey.webp', srcSm: '/assets/kladka/osmibt-krasnyj-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/красный/ОСМиБТ_гладкий_красный_шов т-серый.jpg' }, // раствор #494543, ΔE к кирпичу 47.4
      { id: 'black', label: 'чёрный', src: '/assets/kladka/osmibt-krasnyj-black.webp', srcSm: '/assets/kladka/osmibt-krasnyj-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/красный/ОСМиБТ_гладкий_красный_шов черный.jpg' }, // раствор #181716, ΔE к кирпичу 59.8
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/osmibt-krasnyj-brown.webp', srcSm: '/assets/kladka/osmibt-krasnyj-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/красный/ОСМиБТ_гладкий_красный_шов коричневый.jpg' }, // раствор #865a4b, ΔE к кирпичу 24.2
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/osmibt-krasnyj-lightbrown.webp', srcSm: '/assets/kladka/osmibt-krasnyj-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/красный/ОСМиБТ_гладкий_красный_шов св-коричневый.jpg' }, // раствор #a37e6a, ΔE к кирпичу 28.2
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/osmibt-krasnyj-cream.webp', srcSm: '/assets/kladka/osmibt-krasnyj-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/красный/ОСМиБТ_гладкий_красный_шов розовый.jpg' }, // раствор #caaaa3, ΔE к кирпичу 42.3
    ],
  },
  {
    id: 'osmibt-slonovaya-kost',
    factory: 'osmibt',
    factoryName: 'Старый Оскол (ОСМиБТ)',
    brick: 'слоновая кость',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/osmibt-slonovaya-kost-white.webp', srcSm: '/assets/kladka/osmibt-slonovaya-kost-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/слоновая кость/slon-superbelyj.jpg' }, // раствор #d7d8cd, ΔE к кирпичу 14.2
      { id: 'lightgrey', label: 'светло-серый', src: '/assets/kladka/osmibt-slonovaya-kost-lightgrey.webp', srcSm: '/assets/kladka/osmibt-slonovaya-kost-lightgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/слоновая кость/slon-belyj.jpg' }, // раствор #b7b7ad, ΔE к кирпичу 17.2
      { id: 'grey', label: 'серый', src: '/assets/kladka/osmibt-slonovaya-kost-grey.webp', srcSm: '/assets/kladka/osmibt-slonovaya-kost-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/слоновая кость/slon-seryj.jpg' }, // раствор #80796f, ΔE к кирпичу 35.0
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/osmibt-slonovaya-kost-darkgrey.webp', srcSm: '/assets/kladka/osmibt-slonovaya-kost-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/слоновая кость/slon-temnoseryj.jpg' }, // раствор #4b463e, ΔE к кирпичу 55.6
      { id: 'black', label: 'чёрный', src: '/assets/kladka/osmibt-slonovaya-kost-black.webp', srcSm: '/assets/kladka/osmibt-slonovaya-kost-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/слоновая кость/slon-chernyj.jpg' }, // раствор #272626, ΔE к кирпичу 71.1
      { id: 'blackbrown', label: 'чёрно-коричневый', src: '/assets/kladka/osmibt-slonovaya-kost-blackbrown.webp', srcSm: '/assets/kladka/osmibt-slonovaya-kost-blackbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/слоновая кость/slon-korichnevyj.jpg' }, // раствор #433029, ΔE к кирпичу 63.1
      { id: 'darkbrown', label: 'тёмно-коричневый', src: '/assets/kladka/osmibt-slonovaya-kost-darkbrown.webp', srcSm: '/assets/kladka/osmibt-slonovaya-kost-darkbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/слоновая кость/slon-svetlo-korichnevyj.jpg' }, // раствор #5c3d2d, ΔE к кирпичу 55.7
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/osmibt-slonovaya-kost-brown.webp', srcSm: '/assets/kladka/osmibt-slonovaya-kost-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/слоновая кость/slon-kremovo-rozovyj.jpg' }, // раствор #83594b, ΔE к кирпичу 43.7
    ],
  },
  {
    id: 'osmibt-terrakot',
    factory: 'osmibt',
    factoryName: 'Старый Оскол (ОСМиБТ)',
    brick: 'терракот',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/osmibt-terrakot-white.webp', srcSm: '/assets/kladka/osmibt-terrakot-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-superbelyj.jpg' }, // раствор #d4d5cc, ΔE к кирпичу 62.4
      { id: 'lightgrey', label: 'светло-серый', src: '/assets/kladka/osmibt-terrakot-lightgrey.webp', srcSm: '/assets/kladka/osmibt-terrakot-lightgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-belyj.jpg' }, // раствор #b7b7ad, ΔE к кирпичу 53.0
      { id: 'grey', label: 'серый', src: '/assets/kladka/osmibt-terrakot-grey.webp', srcSm: '/assets/kladka/osmibt-terrakot-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-seryj.jpg' }, // раствор #817a70, ΔE к кирпичу 34.2
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/osmibt-terrakot-darkgrey.webp', srcSm: '/assets/kladka/osmibt-terrakot-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-temno-seryj.jpg' }, // раствор #4b453d, ΔE к кирпичу 27.1
      { id: 'black', label: 'чёрный', src: '/assets/kladka/osmibt-terrakot-black.webp', srcSm: '/assets/kladka/osmibt-terrakot-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-chernyj.jpg' }, // раствор #262525, ΔE к кирпичу 34.0
      { id: 'blackbrown', label: 'чёрно-коричневый', src: '/assets/kladka/osmibt-terrakot-blackbrown.webp', srcSm: '/assets/kladka/osmibt-terrakot-blackbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-kori4nevyj.jpg' }, // раствор #422f28, ΔE к кирпичу 22.2
      { id: 'darkbrown', label: 'тёмно-коричневый', src: '/assets/kladka/osmibt-terrakot-darkbrown.webp', srcSm: '/assets/kladka/osmibt-terrakot-darkbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-svetlo-kori4nevyj.jpg' }, // раствор #5c3c2c, ΔE к кирпичу 13.9
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/osmibt-terrakot-brown.webp', srcSm: '/assets/kladka/osmibt-terrakot-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-krem-roz.jpg' }, // раствор #83584b, ΔE к кирпичу 15.0
    ],
  },
  {
    id: 'zhkz-belyj',
    factory: 'zhkz',
    factoryName: 'Железногорск (ЖКЗ)',
    brick: 'белый',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/zhkz-belyj-white.webp', srcSm: '/assets/kladka/zhkz-belyj-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/белый/ЖКЗ_гладкий_бел_шов белый.jpg' }, // раствор #dfdedd, ΔE к кирпичу 11.3
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/zhkz-belyj-superwhite.webp', srcSm: '/assets/kladka/zhkz-belyj-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/белый/ЖКЗ_гладкий_бел_шов супербелый.jpg' }, // раствор #f3f3f3, ΔE к кирпичу 15.8
      { id: 'grey', label: 'серый', src: '/assets/kladka/zhkz-belyj-grey.webp', srcSm: '/assets/kladka/zhkz-belyj-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/белый/ЖКЗ_гладкий_бел_шов серый.jpg' }, // раствор #9b9a9a, ΔE к кирпичу 23.9
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/zhkz-belyj-darkgrey.webp', srcSm: '/assets/kladka/zhkz-belyj-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/белый/ЖКЗ_гладкий_бел_шов т-серый.jpg' }, // раствор #494645, ΔE к кирпичу 55.8
      { id: 'black', label: 'чёрный', src: '/assets/kladka/zhkz-belyj-black.webp', srcSm: '/assets/kladka/zhkz-belyj-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/белый/ЖКЗ_гладкий_бел_шов черный.jpg' }, // раствор #181716, ΔE к кирпичу 77.7
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/zhkz-belyj-brown.webp', srcSm: '/assets/kladka/zhkz-belyj-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/белый/ЖКЗ_гладкий_бел_шов коричневый.jpg' }, // раствор #865b4d, ΔE к кирпичу 44.4
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/zhkz-belyj-lightbrown.webp', srcSm: '/assets/kladka/zhkz-belyj-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/белый/ЖКЗ_гладкий_бел_шов св-коричневый.jpg' }, // раствор #a4816c, ΔE к кирпичу 29.9
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/zhkz-belyj-cream.webp', srcSm: '/assets/kladka/zhkz-belyj-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/белый/ЖКЗ_гладкий_бел_шов розовый.jpg' }, // раствор #cbaca5, ΔE к кирпичу 15.0
    ],
  },
  {
    id: 'zhkz-krasnyj',
    factory: 'zhkz',
    factoryName: 'Железногорск (ЖКЗ)',
    brick: 'красный',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/zhkz-krasnyj-white.webp', srcSm: '/assets/kladka/zhkz-krasnyj-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/красный/ЖКЗ_гладкий_красный_шов белый.jpg' }, // раствор #dedddd, ΔE к кирпичу 62.2
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/zhkz-krasnyj-superwhite.webp', srcSm: '/assets/kladka/zhkz-krasnyj-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/красный/ЖКЗ_гладкий_красный_шов супербелый.jpg' }, // раствор #f4f3f3, ΔE к кирпичу 67.6
      { id: 'grey', label: 'серый', src: '/assets/kladka/zhkz-krasnyj-grey.webp', srcSm: '/assets/kladka/zhkz-krasnyj-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/красный/ЖКЗ_гладкий_красный_шов серый.jpg' }, // раствор #9b9898, ΔE к кирпичу 48.4
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/zhkz-krasnyj-darkgrey.webp', srcSm: '/assets/kladka/zhkz-krasnyj-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/красный/ЖКЗ_гладкий_красный_шов т-серый.jpg' }, // раствор #494543, ΔE к кирпичу 47.4
      { id: 'black', label: 'чёрный', src: '/assets/kladka/zhkz-krasnyj-black.webp', srcSm: '/assets/kladka/zhkz-krasnyj-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/красный/ЖКЗ_гладкий_красный_шов черный.jpg' }, // раствор #181716, ΔE к кирпичу 59.8
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/zhkz-krasnyj-brown.webp', srcSm: '/assets/kladka/zhkz-krasnyj-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/красный/ЖКЗ_гладкий_красный_шов коричневый.jpg' }, // раствор #865a4b, ΔE к кирпичу 24.2
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/zhkz-krasnyj-lightbrown.webp', srcSm: '/assets/kladka/zhkz-krasnyj-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/красный/ЖКЗ_гладкий_красный_шов св-коричневый.jpg' }, // раствор #a37e6a, ΔE к кирпичу 28.2
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/zhkz-krasnyj-cream.webp', srcSm: '/assets/kladka/zhkz-krasnyj-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/красный/ЖКЗ_гладкий_красный_шов розовый.jpg' }, // раствор #caaaa3, ΔE к кирпичу 42.3
    ],
  },
  {
    id: 'zhkz-kraft',
    factory: 'zhkz',
    factoryName: 'Железногорск (ЖКЗ)',
    brick: 'крафт',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/zhkz-kraft-white.webp', srcSm: '/assets/kladka/zhkz-kraft-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/крафт/ЖКЗ_гладкий_крафт_шов белый.jpg' }, // раствор #dddcdb, ΔE к кирпичу 49.8
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/zhkz-kraft-superwhite.webp', srcSm: '/assets/kladka/zhkz-kraft-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/крафт/ЖКЗ_гладкий_крафт_шов супербелый.jpg' }, // раствор #f3f2f1, ΔE к кирпичу 53.9
      { id: 'grey', label: 'серый', src: '/assets/kladka/zhkz-kraft-grey.webp', srcSm: '/assets/kladka/zhkz-kraft-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/крафт/ЖКЗ_гладкий_крафт_шов серый.jpg' }, // раствор #9c9897, ΔE к кирпичу 43.1
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/zhkz-kraft-darkgrey.webp', srcSm: '/assets/kladka/zhkz-kraft-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/крафт/ЖКЗ_гладкий_крафт_шов т-серый.jpg' }, // раствор #464342, ΔE к кирпичу 56.0
      { id: 'black', label: 'чёрный', src: '/assets/kladka/zhkz-kraft-black.webp', srcSm: '/assets/kladka/zhkz-kraft-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/крафт/ЖКЗ_гладкий_крафт_шов черный.jpg' }, // раствор #181715, ΔE к кирпичу 71.3
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/zhkz-kraft-brown.webp', srcSm: '/assets/kladka/zhkz-kraft-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/крафт/ЖКЗ_гладкий_крафт_шов коричневый.jpg' }, // раствор #83594b, ΔE к кирпичу 33.1
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/zhkz-kraft-lightbrown.webp', srcSm: '/assets/kladka/zhkz-kraft-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/крафт/ЖКЗ_гладкий_крафт_шов св-коричневый.jpg' }, // раствор #a4806a, ΔE к кирпичу 25.5
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/zhkz-kraft-cream.webp', srcSm: '/assets/kladka/zhkz-kraft-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/крафт/ЖКЗ_гладкий_крафт_шов розовый.jpg' }, // раствор #ccaba2, ΔE к кирпичу 32.6
    ],
  },
  {
    id: 'zhkz-seryj',
    factory: 'zhkz',
    factoryName: 'Железногорск (ЖКЗ)',
    brick: 'серый',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/zhkz-seryj-white.webp', srcSm: '/assets/kladka/zhkz-seryj-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/серый/ЖКЗ_гладкий_серый_шов белый.jpg' }, // раствор #dedede, ΔE к кирпичу 3.6
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/zhkz-seryj-superwhite.webp', srcSm: '/assets/kladka/zhkz-seryj-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/серый/ЖКЗ_гладкий_серый_шов супербелый.jpg' }, // раствор #f2f2f2, ΔE к кирпичу 10.6
      { id: 'grey', label: 'серый', src: '/assets/kladka/zhkz-seryj-grey.webp', srcSm: '/assets/kladka/zhkz-seryj-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/серый/ЖКЗ_гладкий_серый_шов серый.jpg' }, // раствор #9c9a9a, ΔE к кирпичу 21.2
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/zhkz-seryj-darkgrey.webp', srcSm: '/assets/kladka/zhkz-seryj-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/серый/ЖКЗ_гладкий_серый_шов т-серый.jpg' }, // раствор #494645, ΔE к кирпичу 55.0
      { id: 'black', label: 'чёрный', src: '/assets/kladka/zhkz-seryj-black.webp', srcSm: '/assets/kladka/zhkz-seryj-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/серый/ЖКЗ_гладкий_серый_шов черный.jpg' }, // раствор #171614, ΔE к кирпичу 77.6
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/zhkz-seryj-brown.webp', srcSm: '/assets/kladka/zhkz-seryj-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/серый/ЖКЗ_гладкий_серый_шов коричневый.jpg' }, // раствор #865b4e, ΔE к кирпичу 47.2
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/zhkz-seryj-lightbrown.webp', srcSm: '/assets/kladka/zhkz-seryj-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/серый/ЖКЗ_гладкий_серый_шов св-коричневый.jpg' }, // раствор #a4806c, ΔE к кирпичу 34.5
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/zhkz-seryj-cream.webp', srcSm: '/assets/kladka/zhkz-seryj-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/серый/ЖКЗ_гладкий_серый_шов розовый.jpg' }, // раствор #cbaca6, ΔE к кирпичу 17.4
    ],
  },
  {
    id: 'zhkz-soloma',
    factory: 'zhkz',
    factoryName: 'Железногорск (ЖКЗ)',
    brick: 'соломенный',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/zhkz-soloma-white.webp', srcSm: '/assets/kladka/zhkz-soloma-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/соломенный/ЖКЗ_гладкий_солома_шов белый.jpg' }, // раствор #dfdedd, ΔE к кирпичу 28.6
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/zhkz-soloma-superwhite.webp', srcSm: '/assets/kladka/zhkz-soloma-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/соломенный/ЖКЗ_гладкий_солома_шов супербелый.jpg' }, // раствор #f4f4f3, ΔE к кирпичу 30.7
      { id: 'grey', label: 'серый', src: '/assets/kladka/zhkz-soloma-grey.webp', srcSm: '/assets/kladka/zhkz-soloma-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/соломенный/ЖКЗ_гладкий_солома_шов серый.jpg' }, // раствор #9c9a99, ΔE к кирпичу 35.2
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/zhkz-soloma-darkgrey.webp', srcSm: '/assets/kladka/zhkz-soloma-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/соломенный/ЖКЗ_гладкий_солома_шов т-серый.jpg' }, // раствор #494645, ΔE к кирпичу 61.6
      { id: 'black', label: 'чёрный', src: '/assets/kladka/zhkz-soloma-black.webp', srcSm: '/assets/kladka/zhkz-soloma-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/соломенный/ЖКЗ_гладкий_солома_шов черный.jpg' }, // раствор #171614, ΔE к кирпичу 82.5
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/zhkz-soloma-brown.webp', srcSm: '/assets/kladka/zhkz-soloma-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/соломенный/ЖКЗ_гладкий_солома_шов коричневый.jpg' }, // раствор #865b4e, ΔE к кирпичу 45.5
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/zhkz-soloma-lightbrown.webp', srcSm: '/assets/kladka/zhkz-soloma-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/соломенный/ЖКЗ_гладкий_солома_шов св-коричневый.jpg' }, // раствор #a4806c, ΔE к кирпичу 31.5
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/zhkz-soloma-cream.webp', srcSm: '/assets/kladka/zhkz-soloma-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/соломенный/ЖКЗ_гладкий_солома_шов розовый.jpg' }, // раствор #ccaca4, ΔE к кирпичу 23.8
    ],
  },
  {
    id: 'zhkz-t-korichnevyj',
    factory: 'zhkz',
    factoryName: 'Железногорск (ЖКЗ)',
    brick: 'тёмно-коричневый',
    seams: [
      { id: 'white', label: 'белый', src: '/assets/kladka/zhkz-t-korichnevyj-white.webp', srcSm: '/assets/kladka/zhkz-t-korichnevyj-white-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/т_коричневый/ЖКЗ_гладкий_т-коричневый_шов белый.jpg' }, // раствор #dedddd, ΔE к кирпичу 54.1
      { id: 'superwhite', label: 'супербелый', src: '/assets/kladka/zhkz-t-korichnevyj-superwhite.webp', srcSm: '/assets/kladka/zhkz-t-korichnevyj-superwhite-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/т_коричневый/ЖКЗ_гладкий_т-коричневый_шов супербелый.jpg' }, // раствор #f4f4f3, ΔE к кирпичу 61.2
      { id: 'grey', label: 'серый', src: '/assets/kladka/zhkz-t-korichnevyj-grey.webp', srcSm: '/assets/kladka/zhkz-t-korichnevyj-grey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/т_коричневый/ЖКЗ_гладкий_т-коричневый_шов серый.jpg' }, // раствор #9a9897, ΔE к кирпичу 33.8
      { id: 'darkgrey', label: 'тёмно-серый', src: '/assets/kladka/zhkz-t-korichnevyj-darkgrey.webp', srcSm: '/assets/kladka/zhkz-t-korichnevyj-darkgrey-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/т_коричневый/ЖКЗ_гладкий_т-коричневый_шов т-серый.jpg' }, // раствор #494643, ΔE к кирпичу 26.6
      { id: 'black', label: 'чёрный', src: '/assets/kladka/zhkz-t-korichnevyj-black.webp', srcSm: '/assets/kladka/zhkz-t-korichnevyj-black-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/т_коричневый/ЖКЗ_гладкий_т-коричневый_шов черный.jpg' }, // раствор #171614, ΔE к кирпичу 42.1
      { id: 'brown', label: 'коричневый', src: '/assets/kladka/zhkz-t-korichnevyj-brown.webp', srcSm: '/assets/kladka/zhkz-t-korichnevyj-brown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/т_коричневый/ЖКЗ_гладкий_т-коричневый_шов коричневый.jpg' }, // раствор #855a4b, ΔE к кирпичу 9.9
      { id: 'lightbrown', label: 'светло-коричневый', src: '/assets/kladka/zhkz-t-korichnevyj-lightbrown.webp', srcSm: '/assets/kladka/zhkz-t-korichnevyj-lightbrown-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/т_коричневый/ЖКЗ_гладкий_т-коричневый_шов св-коричневый.jpg' }, // раствор #a27e6a, ΔE к кирпичу 16.9
      { id: 'cream', label: 'кремово-розовый', src: '/assets/kladka/zhkz-t-korichnevyj-cream.webp', srcSm: '/assets/kladka/zhkz-t-korichnevyj-cream-sm.webp', w: 1000, h: 1000,
        source: '/Текстуры (кладки)/АО _ЖКЗ/гладкий/т_коричневый/ЖКЗ_гладкий_т-коричневый_шов розовый.jpg' }, // раствор #c9aaa3, ΔE к кирпичу 35.3
    ],
  },
];

/** Пары кирпичей с побайтно одинаковыми рендерами у клиента (md5 всех 8 кадров совпадает). */
export const KLADKA_SAME_RENDER: ReadonlyArray<readonly [string, string]> = [
  ['osmibt-korichnevyj', 'zhkz-t-korichnevyj'],
  ['osmibt-krasnyj', 'zhkz-krasnyj'],
  ['osmibt-seryj', 'zhkz-seryj'],
  ['osmibt-soloma', 'zhkz-soloma'],
];

/** Кадры «шов почти в тон кирпича»: цвет раствора отличается от кирпича меньше чем на ΔE 10 (CIE76),
 *  шов читается в основном по нарисованной тени. Кадры честные и оставлены (это и есть ответ «как будет смотреться
 *  шов в цвет кирпича»), но подпись на странице лучше дополнить: «шов почти сливается с кирпичом». */
export const KLADKA_TONE_ON_TONE: ReadonlyArray<readonly [string, string]> = [
  ['osmibt-belyj', 'white'], // ΔE 8.1
  ['osmibt-seryj', 'white'], // ΔE 3.6
  ['osmibt-korichnevyj', 'brown'], // ΔE 9.9
  ['zhkz-seryj', 'white'], // ΔE 3.6
  ['zhkz-t-korichnevyj', 'brown'], // ΔE 9.9
];

/** Первый экран главной: гладкий терракот ОСМиБТ с белым швом (рендер клиента
 *  «Текстуры (кладки)/ООО_ОСМиБТ/Гладкий/терракот/terrakot-superbelyj.jpg», шов по виду белый).
 *  Центр 3300×2062 исходника 4134×3975 → 1600×1000 (q85); srcSm — 800×500 (q75) для телефона. */
export const KLADKA_HERO: { src: string; srcSm: string; w: number; h: number; alt: string } = {
  src: '/assets/kladka/hero-osmibt-terrakot-white.webp',
  srcSm: '/assets/kladka/hero-osmibt-terrakot-white-sm.webp',
  w: 1600,
  h: 1000,
  // «терракот» — название цвета у завода; на кадре кирпич тёмный красно-коричневый (#71352e), не оранжевый,
  // поэтому в подписи — название цвета в кавычках, а не прилагательное «терракотовый».
  alt: 'Кладка из гладкого кирпича ОСМиБТ цвета «терракот» с белым швом — визуализация',
};
