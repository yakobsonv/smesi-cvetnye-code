/** Общие типы данных сайта «Цветные кладочные смеси».
 *  Контент лежит в данных (src/data), вёрстка их только показывает. */

/** Сайт один: цветные кладочные смеси для облицовочного кирпича. */
export type SiteKey = 'smesi';

/** Цена. value — строкой ровно как на боевом сайте («32,40»), либо числом.
 *  Округлять и пересчитывать запрещено: переносим дословно. */
export interface Price {
  /** «32,40» или 32.4 */
  value: string | number;
  /** «₽» по умолчанию */
  currency?: string;
  /** подпись под ценой: «Цена за 1 шт», «₽/м²» */
  unit?: string;
  /** «от» перед ценой */
  prefix?: string;
  /** откуда взято: сайт / прайс / подтверждено клиентом */
  source?: 'site' | 'pricelist' | 'confirmed' | 'unconfirmed';
  /** сноска: расхождение, «под заказ» и т.п. */
  note?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  /** выпадающий список (мега-меню Стелларда) */
  children?: NavItem[];
  /** пометка «текущая страница» */
  current?: boolean;
}

export interface ImageItem {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Badge {
  text: string;
  /** hit — «ХИТ ПРОДАЖ», new — «НОВИНКА», top — «ТОП-3» */
  tone?: 'hit' | 'new' | 'top';
}

export interface Product {
  id?: string;
  title: string;
  /** производитель: «ООО "ОСМиБТ", г. Старый Оскол» */
  subtitle?: string;
  image?: string;
  alt?: string;
  price?: Price;
  badge?: Badge;
  /** текст кнопки карточки */
  ctaLabel?: string;
  /** ссылка на страницу позиции */
  href?: string;
  /** id модального окна с формой (вместо ссылки) */
  modalId?: string;
  /** характеристики для страницы/модалки */
  specs?: SpecRow[];
  note?: string;
}

export interface SpecRow {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}

export interface FaqItem {
  q: string;
  /** ответ: HTML или простой текст */
  a: string;
  /** показывать в коротком блоке на других страницах */
  top?: boolean;
}

export interface ColorItem {
  id?: string;
  name: string;
  image: string;
  alt?: string;
  /** ссылка на страницу цвета (свотчи Оскола кликабельны) */
  href?: string;
  /** «образец снят на брусчатке» и т.п. */
  note?: string;
}

export interface ColorGroup {
  id?: string;
  title: string;
  subtitle?: string;
  /** ограничение коллекции: «только 60 мм» */
  restriction?: string;
  colors: ColorItem[];
}

export interface Advantage {
  title?: string;
  text?: string;
  /** число-счётчик для варианта stats: «19+», «1200+» */
  value?: string;
  icon?: string;
  image?: string;
  alt?: string;
}

export interface RelatedItem {
  href: string;
  label: string;
  note?: string;
  image?: string;
  alt?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Поле лид-формы. Больше типов не нужно: на боевых везде имя + телефон. */
export interface FieldDef {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'tel' | 'email' | 'textarea' | 'select';
  required?: boolean;
  options?: string[];
  autocomplete?: string;
}

/** Строка прайса для PriceTable в режиме list */
export interface PriceRow {
  title: string;
  price?: Price;
  note?: string;
}

/** Конфигурация сайта (см. src/lib/sites.ts) */
export interface SiteConfig {
  key: SiteKey;
  /** название бренда, оно же name в микроразметке */
  brand: string;
  /** домен кириллицей — для показа людям */
  domain: string;
  /** домен в punycode — для canonical и og:url */
  punycode: string;
  /** боевой origin: https://<punycode>. У новых проектов домена ещё нет — см. hasLiveDomain */
  origin: string;
  /** false — боевого домена не существует: canonical ведём на превью, а не на выдуманный адрес */
  hasLiveDomain?: boolean;
  /** префикс копии в этом репозитории: /oskol, /zhkz, /stellard */
  base: string;
  phone: { display: string; href: string };
  /** дополнительные телефоны, если есть */
  phonesExtra?: { display: string; href: string }[];
  hours: string;
  /** описание организации для JSON-LD */
  orgDescription: string;
  legal: { name: string; inn: string; ogrn?: string; postalCode?: string };
  /** готовая строка прав в подвале; {year} подставляется. Не задана — собирается из legal */
  legalLine?: string;
  address: { street: string; locality: string; country: string };
  geo: { lat: number; lng: number };
  /** id счётчика Метрики боевого сайта (на копии счётчик по умолчанию ВЫКЛЮЧЕН) */
  metrikaId: string;
  sameAs: string[];
  /** картинка по умолчанию для og:image */
  ogImage?: string;
  /** sub — вторая строка под текстовым знаком («цветные кладочные смеси») */
  logo?: { src?: string; srcOnDark?: string; text?: string; sub?: string; alt?: string };
}
