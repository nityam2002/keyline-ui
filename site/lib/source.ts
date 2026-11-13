import fs from "node:fs";
import path from "node:path";

/* Read files from the Keyline package at render time, wherever `next` was started from (keyline/ or site/). */
export function locate(rel: string): string {
  const roots = [process.cwd(), path.join(process.cwd(), ".."), path.join(process.cwd(), "site")];
  for (const r of roots) {
    const p = path.join(/*turbopackIgnore: true*/ r, rel);
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) return p;
  }
  throw new Error(`Keyline site: cannot find ${rel} from ${process.cwd()}`);
}

/**
 * The installable source of an example: the example is a registry:block (src/registry/keyline/examples), and the
 * code shown is `files[0].content` of its built item, site/public/r/<name>.json: what `shadcn add` writes is what
 * the reader copies, and what the preview renders.
 */
export function exampleSource(file: string): string {
  const name = file.replace(/\.tsx$/, "");
  const item = JSON.parse(
    fs.readFileSync(
      /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ locate("public/r"), `${name}.json`),
      "utf8",
    ),
  ) as { type: string; files: { content: string }[] };
  if (item.type !== "registry:block") throw new Error(`Keyline site: ${name} is not an example block`);
  const content = item.files[0]?.content;
  if (content === undefined) throw new Error(`Keyline site: ${name}.json has no files`);
  return content;
}
