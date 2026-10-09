/** Ассортимент сайта: какие позиции показываем и как они устроены.
 *
 *  ИСТОЧНИК СОСТАВА — действующий магазин смесей клиента tk-sm.ru («ТОРГКОМПЛЕКТ»), разделы
 *  «Цветные смеси» (подразделы по водопоглощению кирпича) и «Затирки для швов», снято 09.10.2026:
 *    https://tk-sm.ru/products/2369 — клинкерный кирпич 0–5 %: Perel NL × 14
 *    https://tk-sm.ru/products/2370 — обычный кирпич 5–12 %: Perel SL × 14, Основит Брикформ МС11 × 22
 *    https://tk-sm.ru/products/2371 — ручная формовка 10–17 %: Perel VL × 14, Основит Брикформ МС11/1 × 22
 *    https://tk-sm.ru/products/2389 — затирки для швов: Perel RL × 12, Основит Бриксэйв ХС30 × 22
 *  В тех же разделах у дилера есть Promix CKS 512 / CKS 017 и Стройбриг «Кирпирок» — на сайт
 *  НЕ взяты до слова Влада (план, вопрос 2): источники фактов по заданию — только Perel,
 *  Основит, Dauer; Dauer в каталоге дилера нет (позиций 0).
 *
 *  НАЗВАНИЯ И КОДЫ ЦВЕТОВ — по палитрам производителей (у дилера в названиях встречается род
 *  «белая/белый», это одно и то же):
 *    Perel — https://td-perel.ru/catalog/palitra-14-tsvetov/ (14 цветов, коды 01–65; артикул
 *    = серия 00 / 01 / 02 + код: SL 0005, NL 0105, VL 0205); затирка RL — 12 цветов, артикул 04 + код.
 *    Основит — палитра Брикформ и Бриксэйв на osnovit.ru, коды трёхзначные (010 белый …).
 *  ⚠️ У белой NL на сайте Perel ошибка: 0105 в заголовке и 0101 в свойствах. По палитре
 *  01 = супер-белый, 05 = белый — так и у дилера (супер-белая 0101, белая 0105).
 *  ⚠️ Код Основит 041: на новой палитре производителя «светло-кирпичный», везде ещё
 *  (калькулятор, старая палитра, ХС30, магазин производителя, дилер) — «светло-коричневый».
 *  Берём «светло-коричневый».
 *
 *  ЦЕН НЕТ НАМЕРЕННО: цены производителей на сайт не ставим, дилерские — только по слову
 *  Влада (план, вопрос 3). Кнопка позиции — «Узнать цену».
 */

/** Тип кирпича по водопоглощению — главная логика выбора у всех производителей и у дилера.
 *  Подписи и диапазоны — как у самого дилера: подразделы tk-sm.ru «Клинкерный кирпич 0-5%»,
 *  «Обычный кирпич 5-12%», «Ручная формовка 10-17%». У производителей диапазоны свои
 *  (Perel VL 5–17 %, Основит МС11/1 «более 12 %») — их показываем на страницах серий. */
export type BrickType = 'klinker' | 'obychnyj' | 'ruchnoj';

export const BRICK_TYPES: Record<BrickType, { label: string; short: string; absorption: string; note: string }> = {
  klinker: {
    label: 'Клинкерный кирпич',
    short: 'Клинкер',
    absorption: '0–5 %',
    note: 'низкое водопоглощение',
  },
  obychnyj: {
    label: 'Обычный облицовочный кирпич',
    short: 'Обычный',
    absorption: '5–12 %',
    note: 'среднее водопоглощение',
  },
  ruchnoj: {
    label: 'Кирпич ручной формовки',
    short: 'Ручная формовка',
    absorption: '10–17 %',
    note: 'высокое водопоглощение',
  },
};

export type Brand = 'perel' | 'osnovit';

export type SeriesId = 'perel-nl' | 'perel-sl' | 'perel-vl' | 'perel-rl' | 'osnovit-mc11' | 'osnovit-mc11-1' | 'osnovit-xc30';

/** Назначение смеси: кладочная (кладка и шов за один проход) или для расшивки готовых швов. */
export type Purpose = 'kladka' | 'rasshivka';

/** Группа оттенка — для фильтра и страниц цвета. Это наша навигация, не данные производителя. */
export type Tone = 'white' | 'grey' | 'black' | 'beige' | 'yellow' | 'brown' | 'red' | 'accent';

export const TONES: Record<Tone, string> = {
  white: 'Белые',
  grey: 'Серые',
  black: 'Чёрные и графит',
  beige: 'Бежевые и кремовые',
  yellow: 'Жёлтые и оранжевые',
  brown: 'Коричневые',
  red: 'Красные',
  accent: 'Цветные',
};

export interface Color {
  /** код цвета в палитре производителя: '05' у Perel, '010' у Основит */
  code: string;
  name: string;
  tone: Tone;
}

/** ── Палитры (только те цвета, что есть у дилера) ─────────────────────────────── */

/** Perel SL / VL / NL — 14 цветов, одинаковых для трёх серий. */
export const PEREL_COLORS: Color[] = [
  { code: '01', name: 'супер-белый', tone: 'white' },
  { code: '05', name: 'белый', tone: 'white' },
  { code: '10', name: 'серый', tone: 'grey' },
  { code: '15', name: 'тёмно-серый', tone: 'grey' },
  { code: '20', name: 'бежевый', tone: 'beige' },
  { code: '25', name: 'кремово-бежевый', tone: 'beige' },
  { code: '30', name: 'кремово-жёлтый', tone: 'beige' },
  { code: '35', name: 'жёлтый', tone: 'yellow' },
  { code: '40', name: 'кремовый', tone: 'beige' },
  { code: '45', name: 'светло-коричневый', tone: 'brown' },
  { code: '50', name: 'коричневый', tone: 'brown' },
  { code: '55', name: 'шоколадный', tone: 'brown' },
  { code: '60', name: 'красный', tone: 'red' },
  { code: '65', name: 'чёрный', tone: 'black' },
];

/** Perel RL (затирка для швов) — 12 цветов; супер-белого и красного нет, есть горчичный,
 *  медный и кирпичный. Артикул 04 + код (0405 … 0465). */
export const PEREL_RL_COLORS: Color[] = [
  { code: '05', name: 'белый', tone: 'white' },
  { code: '10', name: 'серый', tone: 'grey' },
  { code: '15', name: 'тёмно-серый', tone: 'grey' },
  { code: '20', name: 'бежевый', tone: 'beige' },
  { code: '36', name: 'горчичный', tone: 'yellow' },
  { code: '37', name: 'медный', tone: 'brown' },
  { code: '38', name: 'кирпичный', tone: 'red' },
  { code: '40', name: 'кремовый', tone: 'beige' },
  { code: '45', name: 'светло-коричневый', tone: 'brown' },
  { code: '50', name: 'коричневый', tone: 'brown' },
  { code: '55', name: 'шоколадный', tone: 'brown' },
  { code: '65', name: 'чёрный', tone: 'black' },
];

/** Основит Брикформ МС11, МС11/1 и Бриксэйв ХС30 — у дилера одни и те же 22 цвета. */
export const OSNOVIT_COLORS: Color[] = [
  { code: '010', name: 'белый', tone: 'white' },
  { code: '011', name: 'супербелый', tone: 'white' },
  { code: '020', name: 'серый', tone: 'grey' },
  { code: '021', name: 'светло-серый', tone: 'grey' },
  { code: '022', name: 'тёмно-серый', tone: 'grey' },
  { code: '023', name: 'графит', tone: 'black' },
  { code: '026', name: 'гранитно-серый', tone: 'grey' },
  { code: '027', name: 'пепельный', tone: 'grey' },
  { code: '028', name: 'мокрый асфальт', tone: 'grey' },
  { code: '030', name: 'бежевый', tone: 'beige' },
  { code: '034', name: 'светло-бежевый', tone: 'beige' },
  { code: '035', name: 'кремовый', tone: 'beige' },
  { code: '036', name: 'ореховый', tone: 'brown' },
  { code: '040', name: 'коричневый', tone: 'brown' },
  { code: '041', name: 'светло-коричневый', tone: 'brown' },
  { code: '045', name: 'шоколадный', tone: 'brown' },
  { code: '046', name: 'оранжевый', tone: 'yellow' },
  { code: '061', name: 'светло-голубой', tone: 'accent' },
  { code: '070', name: 'жёлтый', tone: 'yellow' },
  { code: '071', name: 'песочный', tone: 'beige' },
  { code: '073', name: 'жёлто-зелёный', tone: 'accent' },
  { code: '083', name: 'медный', tone: 'brown' },
];

/** ── Серии ───────────────────────────────────────────────────────────────────── */

export interface SeriesRef {
  id: SeriesId;
  brand: Brand;
  /** как называем на сайте */
  name: string;
  /** коротко: «для керамического кирпича 5–12 %» */
  short: string;
  purpose: Purpose;
  /** для какого кирпича (у расшивочных — не задано: по водопоглощению они не делятся) */
  brickType?: BrickType;
  colors: Color[];
  /** фасовка, которую держит дилер, кг */
  packKg: number;
  /** префикс артикула Perel: '00' + '05' = 0005 */
  articlePrefix?: string;
  /** страница бренда на нашем сайте и якорь серии */
  page: string;
}

export const SERIES: SeriesRef[] = [
  { id: 'perel-sl', brand: 'perel', name: 'Perel SL', short: 'для керамического кирпича', purpose: 'kladka', brickType: 'obychnyj', colors: PEREL_COLORS, packKg: 50, articlePrefix: '00', page: 'perel' },
  { id: 'perel-vl', brand: 'perel', name: 'Perel VL', short: 'для кирпича ручной формовки', purpose: 'kladka', brickType: 'ruchnoj', colors: PEREL_COLORS, packKg: 50, articlePrefix: '02', page: 'perel' },
  { id: 'perel-nl', brand: 'perel', name: 'Perel NL', short: 'для клинкерного кирпича', purpose: 'kladka', brickType: 'klinker', colors: PEREL_COLORS, packKg: 50, articlePrefix: '01', page: 'perel' },
  { id: 'osnovit-mc11', brand: 'osnovit', name: 'Основит Брикформ МС11', short: 'для облицовочного кирпича до 12 % и клинкера', purpose: 'kladka', brickType: 'obychnyj', colors: OSNOVIT_COLORS, packKg: 25, page: 'osnovit' },
  { id: 'osnovit-mc11-1', brand: 'osnovit', name: 'Основит Брикформ МС11/1', short: 'для кирпича с водопоглощением выше 12 % и ручной формовки', purpose: 'kladka', brickType: 'ruchnoj', colors: OSNOVIT_COLORS, packKg: 25, page: 'osnovit' },
  { id: 'perel-rl', brand: 'perel', name: 'Perel RL', short: 'затирка для швов', purpose: 'rasshivka', colors: PEREL_RL_COLORS, packKg: 25, articlePrefix: '04', page: 'perel' },
  { id: 'osnovit-xc30', brand: 'osnovit', name: 'Основит Бриксэйв ХС30', short: 'раствор для расшивки швов', purpose: 'rasshivka', colors: OSNOVIT_COLORS, packKg: 20, page: 'osnovit' },
];

export const BRANDS: Record<Brand, { name: string; maker: string; site: string }> = {
  perel: { name: 'Perel', maker: 'Perel (группа компаний «Текато»), завод в Щёлкове, Московская область', site: 'https://td-perel.ru' },
  osnovit: { name: 'Основит', maker: 'ТМ «Основит» (ООО «Седрус»), производство в Коломне, Московская область', site: 'https://osnovit.ru' },
};

/** Клинкер у Основит: МС11 по назначению производителя подходит и для клинкерного кирпича
 *  («Керамический, силикатный облицовочный кирпич с нормальным водопоглощением до 12%.
 *  Клинкерный кирпич.» — osnovit.ru, блок «Рекомендуемые материалы»). У дилера МС11 лежит
 *  в подразделе «обычный кирпич», поэтому в фильтре «клинкер» МС11 показываем вторым. */
export const ALSO_FOR: Partial<Record<SeriesId, BrickType[]>> = {
  'osnovit-mc11': ['klinker'],
};

/** ── Позиции ─────────────────────────────────────────────────────────────────── */

export interface Position {
  /** уникальный id: 'perel-sl-05' */
  id: string;
  series: SeriesId;
  color: Color;
  /** артикул или код, как его называет производитель: '0005', '010' */
  article: string;
  packKg: number;
  /** полное название для карточки и заявки */
  title: string;
}

function articleOf(s: SeriesRef, c: Color): string {
  return s.articlePrefix ? `${s.articlePrefix}${c.code}` : c.code;
}

export const POSITIONS: Position[] = SERIES.flatMap((s) =>
  s.colors.map((c) => ({
    id: `${s.id}-${c.code}`,
    series: s.id,
    color: c,
    article: articleOf(s, c),
    packKg: s.packKg,
    title: `${s.name}, ${c.name} ${articleOf(s, c)}, ${s.packKg} кг`,
  })),
);

export const seriesById = (id: SeriesId): SeriesRef => {
  const s = SERIES.find((x) => x.id === id);
  if (!s) throw new Error(`Нет серии ${id}`);
  return s;
};

/** Серии, подходящие к типу кирпича (кладочные). */
export const seriesFor = (t: BrickType): SeriesRef[] =>
  SERIES.filter((s) => s.purpose === 'kladka' && (s.brickType === t || ALSO_FOR[s.id]?.includes(t)));

/** Позиции заданных групп оттенка. */
export const positionsByTone = (tones: Tone[], purpose?: Purpose): Position[] =>
  POSITIONS.filter((p) => tones.includes(p.color.tone) && (!purpose || seriesById(p.series).purpose === purpose));
