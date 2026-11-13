// A :has() that is not in the selector's subject compound (`.a:has(b) > c`, Tailwind's `has-[b]:*:…`,
// `group-has-*`) makes Chrome restyle the whole document on any DOM change anywhere: a docs page measured ~10ms a
// change instead of ~1.5ms, and a page navigation makes dozens. The parent reads its own children instead
// (`.a:has(b) { --x: … }`) and the children read the property. This finds the slow shape in CSS and in class strings.

/** The compounds of a selector, split at its top-level combinators (not inside parentheses or brackets). */
function compoundsOf(sel: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i]!;
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (depth === 0 && /[\s>+~]/.test(ch)) {
      if (cur) out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/** True when a :has() sits in a compound other than the last one (the subject), at any nesting of :is()/:where(). */
export function hasOutsideSubject(selector: string): boolean {
  const sel = selector.replace(/\/\*[\s\S]*?\*\//g, "").trim();
  if (!sel.includes(":has(")) return false;
  const compounds = compoundsOf(sel);
  if (compounds.slice(0, -1).some((c) => c.includes(":has("))) return true;
  // the subject's :is()/:where() arguments are selectors whose own subject is this compound: `:is(.a:has(b) > *)`
  const subject = compounds.at(-1) ?? "";
  for (const m of subject.matchAll(/:(is|where)\(/g)) {
    let depth = 0;
    let arg = "";
    for (const ch of subject.slice(m.index! + m[0].length)) {
      if (ch === "(") depth++;
      if (ch === ")" && depth-- === 0) break;
      arg += ch;
    }
    for (const part of splitTop(arg)) if (hasOutsideSubject(part)) return true;
  }
  return false;
}

function splitTop(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of list) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  return parts;
}

/** Every selector of a stylesheet (comments, at-rule preludes and declarations removed). */
export function selectorsOf(css: string): string[] {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: string[] = [];
  for (const m of src.matchAll(/([^{};]+)\{/g)) {
    const prelude = m[1]!.trim();
    if (!prelude || prelude.startsWith("@")) continue;
    out.push(...splitTop(prelude).map((s) => s.trim()));
  }
  return out;
}

/** Splits a Tailwind class into its variants and utility, at the top-level colons (not inside [] or ()). */
function variantsOf(cls: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of cls) {
    if (ch === "[" || ch === "(") depth++;
    if (ch === "]" || ch === ")") depth--;
    if (ch === ":" && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  return parts.slice(0, -1);
}

/** True when a Tailwind class puts :has() outside its subject. */
export function classHasOutsideSubject(cls: string): boolean {
  const vs = variantsOf(cls);
  for (const [i, v] of vs.entries()) {
    if (/^(group|peer)-(not-)?has-/.test(v) || /^(group|peer)-has\b/.test(v)) return true;
    // `has-[x]:*:…`: the element with the :has() is the parent of the styled one
    if (/^(not-)?has-/.test(v) && vs.slice(i + 1).some((w) => w === "*" || w === "**")) return true;
    // an arbitrary variant is a selector around `&`
    if (
      v.startsWith("[") &&
      v.includes(":has(") &&
      hasOutsideSubject(v.slice(1, -1).replace(/_/g, " ").replace(/&/g, ".SELF"))
    )
      return true;
  }
  return false;
}

/** The class tokens of a source file (every quoted string holding a variant) that put :has() outside the subject. */
export function sourceHits(src: string): string[] {
  const hits: string[] = [];
  for (const m of src.matchAll(/["'`]([^"'`\n]*:[^"'`\n]*)["'`]/g))
    for (const cls of m[1]!.split(/\s+/)) if (cls.includes(":") && classHasOutsideSubject(cls)) hits.push(cls);
  return hits;
}

/** The selectors of a stylesheet that put :has() outside the subject. */
export function cssHits(css: string): string[] {
  return selectorsOf(css).filter(hasOutsideSubject);
}
