/* Demo shell only: not part of the registry.
 * Layout recipes the specimen pages repeat, as Tailwind utility strings for className props.
 * One-off layout is written inline where it is used. Keyline tokens are read through var(--kl-*),
 * never redefined here. */

/** a labelled group inside an entry's stage: one column that may shrink below its content
 *  (a max-content toolbar keeps its max-width: 100%; */
export const group = "grid grid-cols-[minmax(0,1fr)] content-start gap-2 min-w-0";
/** the caption of a group */
export const cap = "m-0 text-[12px] font-bold text-kl-ink-2";
/** the note under an entry's title (also used as a live status line) */
export const catNote = "m-0 max-w-[46ch] text-[13.5px] leading-[1.45] text-kl-ink-2";

export const row = "flex flex-wrap items-start gap-kl-gutter";
export const split = "flex flex-wrap items-start gap-x-10 gap-y-5";
export const grid2 = "grid grid-cols-[repeat(auto-fill,minmax(264px,1fr))] items-start gap-x-kl-gutter gap-y-5";
export const stack = "grid grid-cols-[minmax(0,1fr)] gap-4 min-w-0";
export const stackTight = "grid gap-2 min-w-0";
export const note = "m-0 text-[13px] text-kl-ink-2";
export const p = "m-0";
export const narrow = "max-w-[300px]";
export const panel = "max-w-[520px] flex-[1_1_360px]";
export const detail = "m-0 px-3.5 py-3 text-[13px]";
export const chart = "aspect-auto h-[240px]";
/** a framed box that shows a nested layout at a chosen width */
export const shellBox =
  "max-w-full overflow-hidden p-kl-gutter [border:var(--kl-k1)_dashed_var(--kl-line-soft)] data-[width=wide]:w-[min(1100px,100%)] data-[width=narrow]:w-[min(600px,100%)]";
/** a demo-only text link (an unstyled button that reads as a link) */
export const link =
  "inline cursor-pointer text-start text-kl-cobalt-text underline underline-offset-2 focus-visible:[outline:var(--kl-ring)_solid_var(--kl-focus)] focus-visible:outline-offset-2";
