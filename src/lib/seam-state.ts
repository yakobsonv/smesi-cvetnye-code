/** Общее состояние связки секций главной: волна образцов (первый экран) → шов на кладке → карусель сочетаний.
 *  Маленький store без библиотек: одно значение, подписка, уведомление только при изменении.
 *  Обновляется по действию человека (клик, клавиша), не на каждом кадре анимации. */

export interface SeamState {
  /** индекс оттенка в палитре волны (WAVE_PALETTE) */
  color: number;
  /** id кирпича кадра кладки */
  brick: string;
  /** шов, выбранный напрямую (карусель сочетаний); null — шов выводится из оттенка волны */
  seam: string | null;
  /** кто изменил: секции не реагируют на собственные изменения повторно */
  from: 'init' | 'wave' | 'studio' | 'carousel';
}

type Listener = (next: SeamState, prev: SeamState) => void;

let state: SeamState = { color: 0, brick: '', seam: null, from: 'init' };
const listeners = new Set<Listener>();

export const getSeamState = (): SeamState => state;

export function setSeamState(patch: Partial<SeamState>): void {
  const next = { ...state, ...patch };
  if (next.color === state.color && next.brick === state.brick && next.seam === state.seam) return;
  const prev = state;
  state = next;
  listeners.forEach((fn) => fn(next, prev));
}

export function subscribeSeamState(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
