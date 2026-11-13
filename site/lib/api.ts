import fs from "node:fs";
import path from "node:path";
import { locate } from "./source";

// The shape scripts/docs/api.ts writes.
export type ApiProp = { name: string; type: string; default: string; required: boolean; description: string };
export type ApiPart = { name: string; description: string; props: ApiProp[] };
export type ApiAttribute = { name: string; values: string[] };
export type ApiCssVariable = { name: string; values: string[] };
export type ApiPage = {
  name: string;
  title: string;
  description: string;
  whenToUse: string;
  parts: ApiPart[];
  attributes: ApiAttribute[];
  cssVariables: ApiCssVariable[];
  examples: { name: string; title: string; file: string }[];
};
/** The generated page data of one component (pnpm docs:api; drift-checked by tests/docs/api.test.ts). */
export function apiPage(name: string): ApiPage {
  const file = path.join(/*turbopackIgnore: true*/ locate("generated/api"), `${name}.json`);
  return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8")) as ApiPage;
}
