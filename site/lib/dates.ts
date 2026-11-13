import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { siteFile } from "./source";

/*
 * When a docs page last changed, for the sitemap's lastModified. A component's date is its registry item's
 * `updated` (an ISO date in src/registry/keyline/**\/<item>.meta.ts, Phase 13); an item without one, and a guide,
 * fall back to git's last commit date of the meta or the page source. No date at all (a shallow clone, a tarball)
 * gives undefined, and the sitemap leaves the field out rather than claim the build date.
 */

const ROOT = path.join(siteFile("app"), "..", "..");

/** The meta file of a registry item, if it has one. */
export function metaFile(item: string): string | undefined {
  for (const dir of ["ui", "blocks", "lib", "theme"]) {
    const direct = path.join(/*turbopackIgnore: true*/ ROOT, "src/registry/keyline", dir, `${item}.meta.ts`);
    if (fs.existsSync(/*turbopackIgnore: true*/ direct)) return direct;
    const nested = path.join(/*turbopackIgnore: true*/ ROOT, "src/registry/keyline", dir, item, `${item}.meta.ts`);
    if (fs.existsSync(/*turbopackIgnore: true*/ nested)) return nested;
  }
  return undefined;
}

/** `updated: "YYYY-MM-DD"` from a meta's source (read as text: the site does not execute meta files). */
export function metaUpdated(file: string): string | undefined {
  const m = /\bupdated:\s*["'](\d{4}-\d{2}-\d{2}(?:T[^"']*)?)["']/.exec(
    fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8"),
  );
  return m?.[1];
}

/** The date of the last commit that touched a file, or undefined outside a git checkout. */
export function gitDate(file: string): string | undefined {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out || undefined;
  } catch {
    return undefined;
  }
}

/** A docs page's lastModified: its item's `updated`, else git's date of the item's meta, else of the page source. */
export function pageModified(page: { href: string; item?: string }): Date | undefined {
  const meta = page.item ? metaFile(page.item) : undefined;
  const source = path.join(/*turbopackIgnore: true*/ ROOT, "site/app", page.href, "page.tsx");
  const iso = (meta && (metaUpdated(meta) ?? gitDate(meta))) ?? gitDate(source);
  return iso ? new Date(iso) : undefined;
}
