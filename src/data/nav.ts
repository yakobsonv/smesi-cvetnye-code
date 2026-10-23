/** Меню сайта — одно на все страницы. Состав — по плану страниц волны 1
 *  (vault: «Цветные смеси — разведка и план страниц (09.10.2026)», «го» Влада 09.10). */
import { localPath } from '../lib/sites';
import type { NavItem } from '../lib/types';

const p = (slug = '') => localPath('smesi', slug);

/** Страницы сайта — один список, из него меню, подвал и 404. */
export const PAGES = {
  home: { href: p(), label: 'Главная' },
  katalog: { href: p('katalog'), label: 'Каталог' },
  perel: { href: p('perel'), label: 'Perel' },
  osnovit: { href: p('osnovit'), label: 'Основит' },
  dauer: { href: p('dauer'), label: 'Dauer' },
  belaya: { href: p('belaya-kladochnaya-smes'), label: 'Белая смесь' },
  chernaya: { href: p('chernaya-kladochnaya-smes'), label: 'Чёрная и графитовая смесь' },
  podbor: { href: p('podbor-shva'), label: 'Подбор шва под кирпич' },
  kalkulyator: { href: p('kalkulyator'), label: 'Калькулятор расхода' },
  klinker: { href: p('dlya-klinkernogo-kirpicha'), label: 'Для клинкерного кирпича' },
  dostavka: { href: p('dostavka'), label: 'Доставка и контакты' },
  regulation: { href: p('regulation'), label: 'Положение об обработке персональных данных' },
  consent: { href: p('consent'), label: 'Согласие на обработку персональных данных' },
} as const;

export type PageKey = keyof typeof PAGES;

/** current — ключ текущей страницы, пункт подсвечивается. */
export function mainNav(current?: PageKey): NavItem[] {
  const item = (k: PageKey, label?: string): NavItem => ({ href: PAGES[k].href, label: label ?? PAGES[k].label, current: k === current });
  return [
    {
      label: 'Смеси',
      href: PAGES.katalog.href,
      current: ['katalog', 'perel', 'osnovit', 'dauer', 'klinker', 'belaya', 'chernaya'].includes(current ?? ''),
      children: [
        item('katalog', 'Весь каталог'),
        item('perel', 'Perel — SL, VL, NL, затирка RL'),
        item('osnovit', 'Основит — Брикформ, Бриксэйв'),
        item('dauer', 'Dauer — BRICK.COLOR 250, 251, 252'),
        item('klinker'),
        item('belaya'),
        item('chernaya'),
      ],
    },
    item('podbor', 'Подбор шва'),
    item('kalkulyator', 'Калькулятор'),
    item('dostavka', 'Доставка и контакты'),
  ];
}

/** Колонки подвала. */
export function footerColumns() {
  return [
    { title: 'Смеси', links: [PAGES.katalog, PAGES.perel, PAGES.osnovit, PAGES.dauer, PAGES.klinker] },
    { title: 'Цвет шва', links: [PAGES.podbor, PAGES.belaya, PAGES.chernaya] },
    { title: 'Покупателю', links: [PAGES.kalkulyator, PAGES.dostavka] },
  ].map((c) => ({ title: c.title, links: c.links.map((l) => ({ href: l.href, label: l.label })) }));
}
