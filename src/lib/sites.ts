/** Реестр сайта «Цветные кладочные смеси» — сайт один.
 *
 *  Новый сайт дилера (ООО «Кирпичный трест», Москва и МО) о цветных кладочных растворах
 *  для облицовочного кирпича. Собран 09.10.2026 по плану, на который Влад дал «го»
 *  (vault: «Цветные смеси — разведка и план страниц (09.10.2026)»). Механика (компоненты,
 *  формы, правовые страницы, проверки) — из репозитория recke-code.
 *
 *  ⚠️ Боевого домена ПОКА НЕТ. Пока его нет, canonical ведёт на адрес превью, на всех
 *  страницах noindex, в vercel.json — X-Robots-Tag, в robots.txt — Disallow.
 *  Когда домен появится — заполнить domain/punycode/origin и снять hasLiveDomain.
 */

import type { SiteConfig, SiteKey } from './types';

export const SITE_KEYS: SiteKey[] = ['smesi'];

/** Куда формы шлют заявку. Приём заявок по слову Влада пока НЕ подключаем:
 *  у проекта нет переменных окружения, функция api/lead.js отвечает 503,
 *  и форма честно показывает посетителю телефон. Хвостовой слэш обязателен (trailingSlash). */
export const LEAD_ENDPOINT = '/api/lead/';

/** Адрес превью этого репозитория. */
export const PREVIEW_ORIGIN = 'https://smesi-cvetnye-code.vercel.app';

/** Продавец. Контакты — со страницы «Контактная информация» действующего магазина смесей
 *  клиента tk-sm.ru («ТОРГКОМПЛЕКТ», снято 09.10.2026): два офиса продаж,
 *  Научный проезд, 10 (м. Калужская) +7 (495) 505-50-68 и Большая Почтовая, 55/59
 *  (м. Электрозаводская) +7 (495) 669-40-64. На карте дилеров dauer.ru «Кирпичный трест»
 *  записан с тем же сайтом, адресом и номером 505-50-68.
 *  ⚠️ Какой номер и какое имя ставить на сайт — вопрос Владу (план, вопрос 4). Пока основной —
 *  офис на Научном проезде: это и юридический адрес оператора в документах клиента.
 *  Реквизиты — из «Положения» и «Согласия» самого клиента (src/data/legal.ts). */
const SELLER = {
  phone: { display: '+7 (495) 505-50-68', href: 'tel:+74955055068' },
  phonesExtra: [{ display: '+7 (495) 669-40-64', href: 'tel:+74956694064' }],
  hours: 'Пн–Пт: 9:00–18:00',
  legal: { name: 'ООО «Кирпичный трест»', inn: '7727756057', ogrn: '1117746587727', postalCode: '117246' },
  address: { street: 'Научный проезд, 10', locality: 'Москва', country: 'RU' },
  geo: { lat: 55.656402, lng: 37.553388 },
  sameAs: [] as string[],
};

/** Офисы продаж — со страницы контактов tk-sm.ru (адреса, метро, телефоны). */
export const OFFICES = [
  {
    name: 'Офис продаж на Научном проезде',
    address: 'Москва, Научный проезд, 10',
    metro: 'м. Калужская',
    phone: { display: '+7 (495) 505-50-68', href: 'tel:+74955055068' },
  },
  {
    name: 'Офис продаж на Большой Почтовой',
    address: 'Москва, ул. Большая Почтовая, 55/59',
    metro: 'м. Электрозаводская',
    phone: { display: '+7 (495) 669-40-64', href: 'tel:+74956694064' },
  },
] as const;

/** Часы работы — со страницы контактов tk-sm.ru. Визит — по предварительной договорённости. */
export const HOURS_FULL = [
  { days: 'Понедельник — пятница', time: '9:00–18:00, до 20:00 по договорённости' },
  { days: 'Суббота', time: '10:00–16:00, по предварительной договорённости' },
  { days: 'Воскресенье', time: 'консультации по телефону' },
] as const;

export const SITES: Record<SiteKey, SiteConfig> = {
  smesi: {
    key: 'smesi',
    brand: 'Кирпичный трест',
    domain: '',
    punycode: '',
    origin: '',
    hasLiveDomain: false,
    base: '',
    ...SELLER,
    orgDescription:
      'Цветные кладочные смеси для облицовочного кирпича Perel, Основит, Promix и Стройбриг: подбор цвета шва под кирпич, расчёт расхода, продажа в Москве и Московской области.',
    legalLine: '© {year} ООО «Кирпичный трест», ИНН 7727756057. Perel, Основит, Promix и Стройбриг — товарные знаки производителей.',
    metrikaId: '',
    // Логотипа под этот сайт у клиента нет — текстовый знак (вопрос Владу, если нужен свой).
    logo: { text: 'Кирпичный трест', sub: 'цветные кладочные смеси', alt: 'Кирпичный трест — цветные кладочные смеси' },
  },
};

export function getSite(key: SiteKey): SiteConfig {
  const site = SITES[key];
  if (!site) throw new Error(`Неизвестный сайт: ${key}`);
  return site;
}

/** Локальный путь страницы: ('smesi', 'perel') → '/perel/'. */
export function localPath(key: SiteKey, slug = ''): string {
  const base = getSite(key).base;
  const clean = slug.replace(/^\/+|\/+$/g, '');
  return clean ? `${base}/${clean}/` : `${base}/`;
}

/** Адрес страницы для canonical и og:url. Домена нет — ведём на превью.
 *  Со слэшем на конце в обоих случаях: в vercel.json стоит trailingSlash. */
export function liveUrl(key: SiteKey, slug = ''): string {
  const site = getSite(key);
  const clean = slug.replace(/^\/+|\/+$/g, '');
  const root = site.hasLiveDomain === false ? `${PREVIEW_ORIGIN}${site.base}` : site.origin;
  return clean ? `${root}/${clean}/` : `${root}/`;
}
