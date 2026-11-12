/** Pure helpers shared by option lists (Select, Combobox) and value readouts (Slider). */

/**
 * Bucket options by their `group`, keeping first-appearance order of the groups and of the options
 * inside each. Options without a group share one unnamed bucket ("") in the position it first appears.
 */
export function groupBy<T extends { group?: string }>(options: readonly T[]): { group: string; items: T[] }[] {
  const order: string[] = [];
  const by = new Map<string, T[]>();
  for (const o of options) {
    const g = o.group ?? "";
    let bucket = by.get(g);
    if (!bucket) {
      bucket = [];
      by.set(g, bucket);
      order.push(g);
    }
    bucket.push(o);
  }
  return order.map((g) => ({ group: g, items: by.get(g)! }));
}

/** True when at least one option names a group (the list is then rendered with headings). */
export const hasGroups = (options: readonly { group?: string }[]) => options.some((o) => o.group);

/**
 * The longest string a numeric scale prints: the ends, the steps beside them and the middle (the sign,
 * group separators and decimals vary between them). A readout sized for this never changes width.
 */
export function longestValue(
  min: number,
  max: number,
  step = 1,
  locale?: Intl.LocalesArgument,
  format?: Intl.NumberFormatOptions,
) {
  const nf = new Intl.NumberFormat(locale, format);
  return [min, max, min + step, max - step, (min + max) / 2]
    .map((n) => nf.format(n))
    .reduce((a, b) => (b.length > a.length ? b : a));
}
