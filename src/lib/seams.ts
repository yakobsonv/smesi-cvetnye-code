/** Общее для кадров кладки (src/data/kladka.ts): порядок швов, группа оттенка каталога, подпись кирпича.
 *  Используют подбор шва (JointPicker) и связка первого экрана главной (волна → кадр кладки → карусель). */

/** Порядок швов в данных — от светлого к тёмному (kladka.ts, шапка файла). Соседний id = близкий цвет. */
export const SEAM_ORDER = [
  'white', 'superwhite', 'lightgrey', 'grey', 'darkgrey', 'black', 'blackbrown', 'darkbrown', 'brown', 'lightbrown', 'cream',
] as const;

/** Связь видимого оттенка шва с группой оттенка каталога — для ссылки «смеси этого тона» (/katalog/?ton=…). */
export const TONE_OF_SEAM: Record<string, string> = {
  white: 'white', superwhite: 'white', lightgrey: 'grey', grey: 'grey', darkgrey: 'grey', black: 'black',
  brown: 'brown', lightbrown: 'brown', darkbrown: 'brown', blackbrown: 'brown', cream: 'beige',
};

/** «красный кирпич», но «кирпич «крафт»»: прилагательное ставим перед словом «кирпич»,
 *  название-существительное — после, в кавычках. */
export const brickLabel = (name: string) => (/(ый|ий|ой)$/.test(name) ? `${name} кирпич` : `кирпич «${name}»`);

/** Кирпичи связки на главной (волна → шов на кладке → карусель): терракот, соломенный, коричневый ОСМиБТ.
 *  Кирпич вне /podbor-shva/ — по брифу 20.10, решение Влада — ожидается. */
export const HOME_BRICKS = ['osmibt-terrakot', 'osmibt-soloma', 'osmibt-korichnevyj'];
