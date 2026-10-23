/** Ассортимент сайта: какие позиции показываем и как они устроены.
 *
 *  ИСТОЧНИК СОСТАВА — действующий магазин смесей клиента tk-sm.ru («ТОРГКОМПЛЕКТ»), разделы
 *  «Цветные смеси» (подразделы по водопоглощению кирпича) и «Затирки для швов», снято 09.10.2026:
 *    https://tk-sm.ru/products/2369 — клинкерный кирпич 0–5 %: Perel NL × 14
 *    https://tk-sm.ru/products/2370 — обычный кирпич 5–12 %: Perel SL × 14, Основит Брикформ МС11 × 22,
 *                                     Promix CKS 512 × 12, Стройбриг Кирпирок MC11 × 8
 *    https://tk-sm.ru/products/2371 — ручная формовка 10–17 %: Perel VL × 14, Основит Брикформ МС11/1 × 22,
 *                                     Promix CKS 017 × 12
 *    https://tk-sm.ru/products/2389 — затирки для швов: Perel RL × 12, Основит Бриксэйв ХС30 × 22
 *  PROMIX И СТРОЙБРИГ взяты 23.10.2026 по решению Паши («добавить всех производителей, которые есть
 *  на изначальном сайте»); вопрос Владу (план, вопрос 2) — в журнале доски. До этого не брали:
 *  источники фактов по заданию — только Perel, Основит, Dauer (Dauer в каталоге дилера нет, позиций 0).
 *  По этим двум маркам у нас ТОЛЬКО ассортимент дилера: серия, подраздел (тип кирпича), фасовка,
 *  название и код цвета — из названий позиций tk-sm.ru (снимок 09.10.2026: Promix CKS 512 —
 *  /products/2221, 2396–2406; CKS 017 — /products/2410–2421; Стройбриг — /products/2454–2461).
 *  Сайты марок perel-promix.ru и stroybrig.ru 23.10 не открывались (таймаут) — характеристик,
 *  расхода, прочности и своих страниц у этих серий нет и не пишем; в series-facts.ts их нет.
 *  Водопоглощение у них — диапазон подраздела дилера (у производителя не подтверждено).
 *
 *  НАЗВАНИЯ И КОДЫ ЦВЕТОВ — по палитрам производителей (у дилера в названиях встречается род
 *  «белая/белый», это одно и то же):
 *    Perel — https://td-perel.ru/catalog/palitra-14-tsvetov/ (14 цветов, коды 01–65; артикул
 *    = серия 00 / 01 / 02 + код: SL 0005, NL 0105, VL 0205); затирка RL — 12 цветов, артикул 04 + код.
 *    Основит — палитра Брикформ и Бриксэйв на osnovit.ru, коды трёхзначные (010 белый …).
 *    Promix — коды четырёхзначные, как у дилера: CKS 512 — …00 (0300 супер-белый … 6400 чёрный),
 *    CKS 017 — те же цвета с «20» на конце (0320 … 6420). Названия — как у одноимённых цветов Perel.
 *    Стройбриг — коды и названия как у Основит (010 белый … 040 коричневый).
 *
 *  DAUER добавлен 24.10.2026 по просьбе Паши («нужен Dauer производитель») — как полноценный бренд, с данными
 *  производителя (series-facts.ts) и своей палитрой (swatches.ts). В магазине tk-sm.ru позиций Dauer нет (0),
 *  поэтому состав — по производителю: три цветные смеси BRICK.COLOR 250 / 251 / 252 (одна палитра 25 цветов),
 *  мешки 25 и 50 кг; какие серии, цвета и фасовки держит дилер — вопрос Владу. Кодов цвета у производителя нет
 *  (ни на сайте, ни в техкартах) — код позиции = номер полосы на официальной палитре (01…25), на сайте
 *  показывается как «№ 7 на палитре» (codeKind: 'palette'); артикулы чужих дилеров не используем.
 *  Снято 09.10.2026 (Обсидиан Влада: «Палитры смесей — официальные», разведка «Цветные смеси — разведка, данные»);
 *  dauer.ru 24.10 недоступен (таймаут).
 *  ⚠️ У белой NL на сайте Perel ошибка: 0105 в заголовке и 0101 в свойствах. По палитре
 *  01 = супер-белый, 05 = белый — так и у дилера (супер-белая 0101, белая 0105).
 *  ⚠️ Код Основит 041: на новой палитре производителя «светло-кирпичный», везде ещё
 *  (калькулятор, старая палитра, ХС30, магазин производителя, дилер) — «светло-коричневый».
 *  Берём «светло-коричневый».
 *
 *  ЦЕН НЕТ НАМЕРЕННО: цены производителей на сайт не ставим, дилерские — только по слову
 *  Влада (план, вопрос 3). Кнопка позиции — «Узнать цену».
 */

import { localPath } from '../lib/sites';

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

export type Brand = 'perel' | 'osnovit' | 'dauer' | 'promix' | 'stroybrig';

/** Бренды со своей страницей на сайте (/perel/, /osnovit/, /dauer/): по ним есть данные производителя (series-facts.ts). */
export type BrandPage = 'perel' | 'osnovit' | 'dauer';

/** Серии, по которым есть данные производителя (series-facts.ts → SERIES_FACTS) и страница бренда. */
export type FactSeriesId = 'perel-nl' | 'perel-sl' | 'perel-vl' | 'perel-rl' | 'osnovit-mc11' | 'osnovit-mc11-1' | 'osnovit-xc30' | 'dauer-250' | 'dauer-251' | 'dauer-252';

/** Все серии: с данными производителя и только по ассортименту дилера (Promix, Стройбриг). */
export type SeriesId = FactSeriesId | 'promix-cks512' | 'promix-cks017' | 'stroybrig-mc11';

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

/** Dauer BRICK.COLOR 250 / 251 / 252 — одна палитра на три серии, 25 цветов. Названия и порядок — по подписям
 *  на официальном фото палитры производителя «Палитра_BRICK_COLOR.png» (dauer.ru, у трёх карточек один файл):
 *  «Ультра-белый … Шоколадный», у производителя без «ё». Кодов цвета у Dauer нет — код здесь = номер полосы
 *  на палитре (01…25), выводится как «№ N на палитре» (codeKind: 'palette' у серий).
 *  Нормализация типографики, как у остальных марок: строчные буквы и «ё» («тёмно-серый», «чёрный», «жёлтый»,
 *  «зелёный», «вишнёвый»). Группа оттенка — наша навигация: зелёный и синий — «цветные», терракотовый,
 *  вишнёвый и кирпичный — к красным, слоновая кость и пудра — к бежевым. */
export const DAUER_COLORS: Color[] = [
  { code: '01', name: 'ультра-белый', tone: 'white' },
  { code: '02', name: 'белый', tone: 'white' },
  { code: '03', name: 'светло-серый', tone: 'grey' },
  { code: '04', name: 'серый', tone: 'grey' },
  { code: '05', name: 'тёмно-серый', tone: 'grey' },
  { code: '06', name: 'графитовый', tone: 'black' },
  { code: '07', name: 'антрацитовый', tone: 'black' },
  { code: '08', name: 'чёрный', tone: 'black' },
  { code: '09', name: 'жёлтый', tone: 'yellow' },
  { code: '10', name: 'зелёный', tone: 'accent' },
  { code: '11', name: 'синий', tone: 'accent' },
  { code: '12', name: 'красный', tone: 'red' },
  { code: '13', name: 'слоновая кость', tone: 'beige' },
  { code: '14', name: 'кремово-бежевый', tone: 'beige' },
  { code: '15', name: 'бежевый', tone: 'beige' },
  { code: '16', name: 'светло-бежевый', tone: 'beige' },
  { code: '17', name: 'пудра', tone: 'beige' },
  { code: '18', name: 'кремовый', tone: 'beige' },
  { code: '19', name: 'терракотовый', tone: 'red' },
  { code: '20', name: 'вишнёвый', tone: 'red' },
  { code: '21', name: 'кирпичный', tone: 'red' },
  { code: '22', name: 'светло-коричневый', tone: 'brown' },
  { code: '23', name: 'коричневый', tone: 'brown' },
  { code: '24', name: 'тёмно-коричневый', tone: 'brown' },
  { code: '25', name: 'шоколадный', tone: 'brown' },
];

/** Promix CKS 512 и CKS 017 — у дилера 12 одинаковых цветов, коды — как в названиях позиций tk-sm.ru.
 *  Названия — как у одноимённых цветов палитры Perel (Promix — марка Perel), группа оттенка — как у них. */
const PROMIX_BASE: Color[] = [
  { code: '03', name: 'супер-белый', tone: 'white' },
  { code: '04', name: 'белый', tone: 'white' },
  { code: '08', name: 'серый', tone: 'grey' },
  { code: '14', name: 'тёмно-серый', tone: 'grey' },
  { code: '18', name: 'бежевый', tone: 'beige' },
  { code: '24', name: 'кремово-бежевый', tone: 'beige' },
  { code: '28', name: 'кремово-жёлтый', tone: 'beige' },
  { code: '38', name: 'кремовый', tone: 'beige' },
  { code: '44', name: 'светло-коричневый', tone: 'brown' },
  { code: '48', name: 'коричневый', tone: 'brown' },
  { code: '54', name: 'шоколадный', tone: 'brown' },
  { code: '64', name: 'чёрный', tone: 'black' },
];
/** Promix CKS 512: 0300 … 6400. */
export const PROMIX_CKS512_COLORS: Color[] = PROMIX_BASE.map((c) => ({ ...c, code: `${c.code}00` }));
/** Promix CKS 017: те же цвета, код с «20» на конце — 0320 … 6420. */
export const PROMIX_CKS017_COLORS: Color[] = PROMIX_BASE.map((c) => ({ ...c, code: `${c.code}20` }));

/** Стройбриг Кирпирок MC11 — 8 цветов у дилера; коды и названия совпадают с палитрой Основит
 *  (тот же производитель, ООО «Седрус»), группа оттенка — как у Основит. */
export const STROYBRIG_COLORS: Color[] = [
  { code: '010', name: 'белый', tone: 'white' },
  { code: '011', name: 'супербелый', tone: 'white' },
  { code: '021', name: 'светло-серый', tone: 'grey' },
  { code: '022', name: 'тёмно-серый', tone: 'grey' },
  { code: '023', name: 'графит', tone: 'black' },
  { code: '030', name: 'бежевый', tone: 'beige' },
  { code: '034', name: 'светло-бежевый', tone: 'beige' },
  { code: '040', name: 'коричневый', tone: 'brown' },
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
  /** водопоглощение кирпича ПО ПРОИЗВОДИТЕЛЮ (series-facts.ts, forBrick). Диапазоны дилера
   *  (BRICK_TYPES) — только для типа кирпича; серии их не приписываем: у Perel VL 5–17 %,
   *  а не 10–17 %, у МС11/1 «более 12 %» (сквозная проверка 11.10).
   *  Исключение — Promix и Стройбриг (23.10): данных производителя нет, стоит диапазон подраздела дилера. */
  absorption?: string;
  colors: Color[];
  /** фасовка, которую держит дилер, кг */
  packKg: number;
  /** префикс артикула Perel: '00' + '05' = 0005 */
  articlePrefix?: string;
  /** как показывать код позиции: по умолчанию — код/артикул производителя как есть; 'palette' — у производителя
   *  кодов нет, код = номер полосы на его палитре, на сайте «№ 7 на палитре» (Dauer) */
  codeKind?: 'palette';
  /** страница бренда на нашем сайте (якорь — id серии). Не задано — своей страницы нет (Promix, Стройбриг:
   *  данных производителя нет); адрес серии в любом случае — seriesHref (без страницы — серия в каталоге). */
  page?: BrandPage;
}

export const SERIES: SeriesRef[] = [
  { id: 'perel-sl', brand: 'perel', name: 'Perel SL', short: 'для керамического кирпича', purpose: 'kladka', brickType: 'obychnyj', absorption: '5–12 %', colors: PEREL_COLORS, packKg: 50, articlePrefix: '00', page: 'perel' },
  { id: 'perel-vl', brand: 'perel', name: 'Perel VL', short: 'для кирпича ручной формовки', purpose: 'kladka', brickType: 'ruchnoj', absorption: '5–17 %', colors: PEREL_COLORS, packKg: 50, articlePrefix: '02', page: 'perel' },
  { id: 'perel-nl', brand: 'perel', name: 'Perel NL', short: 'для клинкерного кирпича', purpose: 'kladka', brickType: 'klinker', absorption: '0–5 %', colors: PEREL_COLORS, packKg: 50, articlePrefix: '01', page: 'perel' },
  { id: 'osnovit-mc11', brand: 'osnovit', name: 'Основит Брикформ МС11', short: 'для облицовочного кирпича до 12 % и клинкера', purpose: 'kladka', brickType: 'obychnyj', absorption: 'до 12 %, а также клинкер', colors: OSNOVIT_COLORS, packKg: 25, page: 'osnovit' },
  { id: 'osnovit-mc11-1', brand: 'osnovit', name: 'Основит Брикформ МС11/1', short: 'для кирпича с водопоглощением выше 12 % и ручной формовки', purpose: 'kladka', brickType: 'ruchnoj', absorption: 'более 12 %', colors: OSNOVIT_COLORS, packKg: 25, page: 'osnovit' },
  // Dauer — по производителю (см. шапку): водопоглощение — с карточек dauer.ru (series-facts.ts); тип кирпича для
  // фильтра: 250 (6–12 %) — обычный, 251 (5–18 %, «все виды кирпича», в т. ч. ручной формовки) — ручная формовка
  // и обычный (ALSO_FOR), 252 (1–5 %) — клинкер. Мешок: у производителя 25 и 50 кг, какой держит дилер — не знаем,
  // показываем 50 (как у Perel); 25 кг — в фактах упаковки.
  { id: 'dauer-250', brand: 'dauer', name: 'Dauer BRICK.COLOR 250', short: 'для кирпича с водопоглощением 6–12 %', purpose: 'kladka', brickType: 'obychnyj', absorption: '6–12 %', colors: DAUER_COLORS, packKg: 50, page: 'dauer', codeKind: 'palette' },
  { id: 'dauer-251', brand: 'dauer', name: 'Dauer BRICK.COLOR 251', short: 'для всех видов кирпича, в том числе ручной формовки', purpose: 'kladka', brickType: 'ruchnoj', absorption: '5–18 %', colors: DAUER_COLORS, packKg: 50, page: 'dauer', codeKind: 'palette' },
  { id: 'dauer-252', brand: 'dauer', name: 'Dauer BRICK.COLOR 252', short: 'для клинкерного кирпича', purpose: 'kladka', brickType: 'klinker', absorption: '1–5 %', colors: DAUER_COLORS, packKg: 50, page: 'dauer', codeKind: 'palette' },
  // Promix и Стройбриг — только по ассортименту дилера (см. шапку): short и absorption — по подразделу tk-sm.ru,
  // артикул = код цвета, как в названии позиции у дилера; страницы бренда нет.
  { id: 'promix-cks512', brand: 'promix', name: 'Promix CKS 512', short: 'для обычного кирпича', purpose: 'kladka', brickType: 'obychnyj', absorption: '5–12 %', colors: PROMIX_CKS512_COLORS, packKg: 50 },
  { id: 'promix-cks017', brand: 'promix', name: 'Promix CKS 017', short: 'для кирпича ручной формовки', purpose: 'kladka', brickType: 'ruchnoj', absorption: '10–17 %', colors: PROMIX_CKS017_COLORS, packKg: 50 },
  { id: 'stroybrig-mc11', brand: 'stroybrig', name: 'Стройбриг Кирпирок MC11', short: 'для обычного кирпича', purpose: 'kladka', brickType: 'obychnyj', absorption: '5–12 %', colors: STROYBRIG_COLORS, packKg: 25 },
  { id: 'perel-rl', brand: 'perel', name: 'Perel RL', short: 'затирка для швов', purpose: 'rasshivka', colors: PEREL_RL_COLORS, packKg: 25, articlePrefix: '04', page: 'perel' },
  { id: 'osnovit-xc30', brand: 'osnovit', name: 'Основит Бриксэйв ХС30', short: 'раствор для расшивки швов', purpose: 'rasshivka', colors: OSNOVIT_COLORS, packKg: 20, page: 'osnovit' },
];

export const BRANDS: Record<Brand, { name: string; maker: string; site: string }> = {
  perel: { name: 'Perel', maker: 'Perel (группа компаний «Текато»), завод в Щёлкове, Московская область', site: 'https://td-perel.ru' },
  osnovit: { name: 'Основит', maker: 'ТМ «Основит» (ООО «Седрус»), производство в Коломне, Московская область', site: 'https://osnovit.ru' },
  // по декларациям соответствия на dauer.ru: изготовитель ООО «Качественные смеси», площадка — МО, г. Жуковский
  dauer: { name: 'Dauer', maker: 'Dauer (Daüer®), ООО «Качественные смеси», производство в Жуковском, Московская область', site: 'https://dauer.ru' },
  // ⚠️ Promix и Стройбриг: производитель указан по вторичным источникам, с сайтов производителей НЕ подтверждён —
  // perel-promix.ru и stroybrig.ru 23.10.2026 не открывались (таймаут). maker и site на страницы сейчас не выводятся.
  promix: { name: 'Promix', maker: 'марка Perel (эконом-линейка)', site: 'https://perel-promix.ru' },
  stroybrig: { name: 'Стройбриг', maker: 'ТМ «Стройбриг» (ООО «Седрус» — производитель Основит)', site: 'https://stroybrig.ru' },
};

/** Все марки через запятую и «и» — для текстов, где перечислены бренды: «Perel, Основит, Promix и Стройбриг». */
export const andList = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} и ${xs[xs.length - 1]}` : xs.join(''));
export const BRAND_LIST = andList(Object.values(BRANDS).map((b) => b.name));

/** Клинкер у Основит: МС11 по назначению производителя подходит и для клинкерного кирпича
 *  («Керамический, силикатный облицовочный кирпич с нормальным водопоглощением до 12%.
 *  Клинкерный кирпич.» — osnovit.ru, блок «Рекомендуемые материалы»). У дилера МС11 лежит
 *  в подразделе «обычный кирпич», поэтому в фильтре «клинкер» МС11 показываем вторым. */
export const ALSO_FOR: Partial<Record<SeriesId, BrickType[]>> = {
  'osnovit-mc11': ['klinker'],
  // Dauer 251 — «для кладки всех видов кирпича с водопоглощением от 5 до 18 %» (карточка): это и обычный кирпич 5–12 %
  'dauer-251': ['obychnyj'],
};

/** ── Позиции ─────────────────────────────────────────────────────────────────── */

export interface Position {
  /** уникальный id: 'perel-sl-05' */
  id: string;
  series: SeriesId;
  color: Color;
  /** артикул или код, как его называет производитель: '0005', '010'; у Dauer — номер на палитре '07' */
  article: string;
  /** код для показа: '0005', '010' или «№ 7 на палитре» (Dauer, codeKind 'palette') */
  articleText: string;
  packKg: number;
  /** полное название для карточки и заявки */
  title: string;
}

function articleOf(s: SeriesRef, c: Color): string {
  return s.articlePrefix ? `${s.articlePrefix}${c.code}` : c.code;
}

/** Код позиции словами: у Perel и Основит — как есть ('0005', '010'), у Dauer кодов нет — «№ 7 на палитре»
 *  (коротко — «№ 7»: для строк, где рядом уже стоит название серии). */
export function codeText(s: SeriesRef, article: string, short = false): string {
  if (s.codeKind !== 'palette') return article;
  const n = Number(article);
  return short ? `№ ${n}` : `№ ${n} на палитре`;
}

export const POSITIONS: Position[] = SERIES.flatMap((s) =>
  s.colors.map((c) => ({
    id: `${s.id}-${c.code}`,
    series: s.id,
    color: c,
    article: articleOf(s, c),
    articleText: codeText(s, articleOf(s, c)),
    packKg: s.packKg,
    title: `${s.name}, ${c.name} ${codeText(s, articleOf(s, c))}, ${s.packKg} кг`,
  })),
);

export const seriesById = (id: SeriesId): SeriesRef => {
  const s = SERIES.find((x) => x.id === id);
  if (!s) throw new Error(`Нет серии ${id}`);
  return s;
};

/** Адрес серии на сайте: на странице бренда, у серий без своей страницы — в каталоге. */
export const seriesHref = (s: SeriesRef): string => `${localPath('smesi', s.page ?? 'katalog')}#${s.id}`;

/** Серии, подходящие к типу кирпича (кладочные). */
export const seriesFor = (t: BrickType): SeriesRef[] =>
  SERIES.filter((s) => s.purpose === 'kladka' && (s.brickType === t || ALSO_FOR[s.id]?.includes(t)));

/** Позиции заданных групп оттенка. */
export const positionsByTone = (tones: Tone[], purpose?: Purpose): Position[] =>
  POSITIONS.filter((p) => tones.includes(p.color.tone) && (!purpose || seriesById(p.series).purpose === purpose));
