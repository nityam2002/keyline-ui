import type { ApiPage, ApiPart } from "./api";

/*
 * How a generated component page (app/docs/components/[name]/page.tsx) turns its item's API data into sections.
 * The page renders these as HTML and lib/docs-markdown.ts as the page's Markdown twin, so the two cannot disagree.
 */

export const pascal = (name: string) => name.replace(/(^|-)(\w)/g, (_, _d: string, c: string) => c.toUpperCase());
export const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** The part the page is about: the one named after the item, else the one with the most props. */
export function mainPart(api: ApiPage): ApiPart | undefined {
  return (
    api.parts.find((p) => p.name === pascal(api.name)) ??
    api.parts.toSorted((a, b) => b.props.length - a.props.length)[0]
  );
}

export type Row<D> = { name: string; type: string; default: string; description: D };

/** The generated rows (name, type, default from the source), described by the page's prose or else the JSDoc. */
export function propRows<D>(part: ApiPart, prose: { name: string; description: D }[]): Row<D | string>[] {
  const said = new Map(prose.map((p) => [p.name, p]));
  return part.props.map((p) => ({
    name: p.name,
    type: p.type,
    default: p.default || (p.required ? "required" : "—"),
    description: said.get(p.name)?.description ?? (p.description || "—"),
  }));
}

/** The Props table: the main part's generated rows, then the prose rows that name no generated prop. */
export function pageRows<D>(api: ApiPage, prose: Row<D>[]): Row<D | string>[] {
  const main = mainPart(api);
  const generated = new Set(main?.props.map((p) => p.name));
  return [...(main ? propRows(main, prose) : []), ...prose.filter((p) => !generated.has(p.name))];
}

/** The other parts that declare props of their own (the Parts API section). */
export function otherParts(api: ApiPage): ApiPart[] {
  const main = mainPart(api);
  return api.parts.filter((p) => p !== main && p.props.length);
}

/** What a data attribute means: the prop it mirrors, if any (the page sets that name in code). */
export function attributeMeaning(name: string, api: ApiPage): { mirrors: string } | { text: string } {
  if (name === "data-slot") return { text: "Names the part that rendered the element." };
  const prop = name.replace(/^data-(kl-)?/, "");
  if (api.parts.some((p) => p.props.some((x) => x.name === prop))) return { mirrors: prop };
  return { text: "Set by the component; style or test against it." };
}

export function cssVariableMeaning(variable: string, item: string): string {
  return variable.startsWith(`--kl-${item}`)
    ? "The component's own; set it on the part to change it."
    : "A theme token the component sets locally.";
}

export const PARTS_API_LEDE = "The props each part declares beyond the element or Base UI part it renders.";
