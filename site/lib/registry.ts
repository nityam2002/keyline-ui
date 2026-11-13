import manifest from "../public/r/registry.json";
import pkg from "../../package.json";

type Item = { name: string };
const items: Item[] = manifest.items;

/**
 * The site serves the registry it is built with (site/public/r) at /r/{name}.json. Items name each other as
 * @keyline-ui/<name>, so a project maps the namespace to this path once, then adds items by name.
 */
export const REGISTRY_PATH = "/r/{name}.json";

/**
 * The public address of this site, when known at build: package.json "homepage" (the release sets it), else
 * KEYLINE_SITE_URL from the build environment. Without either, the page fills in its own origin in the browser,
 * which is right wherever the site is deployed, since the site is what serves the registry.
 */
export const SITE_ORIGIN: string | undefined =
  ((pkg as { homepage?: string }).homepage ?? process.env["KEYLINE_SITE_URL"])?.replace(/\/+$/, "") || undefined;

/** Stands for the site's origin in a command until the browser knows it (see SITE_ORIGIN). */
export const ORIGIN_SLOT = "https://<keyline-site>";
/** ORIGIN_SLOT while highlighting: Shiki splits "<" into its own token, this stays one word to swap afterwards. */
export const ORIGIN_SENTINEL = "https://KEYLINESITEORIGIN";

/** The one-time step: map @keyline-ui to this site's registry in the project's components.json. */
export function registryAddCommand(origin: string = SITE_ORIGIN ?? ORIGIN_SLOT) {
  return `npx shadcn@latest registry add @keyline-ui=${origin}${REGISTRY_PATH}`;
}

/** Fails the build when a page names an item the registry does not ship. */
export function installCommand(...names: string[]) {
  for (const n of names) if (!items.some((i) => i.name === n)) throw new Error(`Keyline site: no registry item "${n}"`);
  return `npx shadcn@latest add ${names.map((n) => `@keyline-ui/${n}`).join(" ")}`;
}
