import fs from "node:fs";
import path from "node:path";

/* Read files from the Keyline package at render time, wherever `next` was started from (keyline/ or site/). */
function locate(rel: string): string {
  const roots = [process.cwd(), path.join(process.cwd(), ".."), path.join(process.cwd(), "site")];
  for (const r of roots) {
    const p = path.join(/*turbopackIgnore: true*/ r, rel);
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) return p;
  }
  throw new Error(`Keyline site: cannot find ${rel} from ${process.cwd()}`);
}

/** The exact text of a site example: what the preview renders is what the reader copies. */
export function exampleSource(name: string): string {
  return fs.readFileSync(
    /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ locate("examples"), name),
    "utf8",
  );
}
