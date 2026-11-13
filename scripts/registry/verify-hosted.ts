// Checks the hosted registry against this commit: every file in site/public/r (the index registry.json, the
// version list versions.json and every item) is fetched from the production site and must equal the committed
// file, as parsed JSON. Run by .github/workflows/release.yml after a push to main.
//
//   node scripts/registry/verify-hosted.ts [--origin <url>] [--wait <seconds>]
//
//   --origin  the site to check (default: package.json "homepage"); files are fetched from <origin>/r/<file>
//   --wait    keep re-checking for up to this many seconds while any file differs or fails to load, for a host
//             that deploys main on its own (default 0: check once)
//
// The comparison is against the commit, not just internal consistency: a deploy that is late, failed or serves an
// older build fails here, and so does a hosted file missing from the commit's registry index.
import { readFileSync, readdirSync } from "node:fs";

const ROOT = new URL("../../", import.meta.url);
const DIR = new URL("site/public/r/", ROOT);
const RETRY_MS = 15_000;
const PARALLEL = 8;

const args = process.argv.slice(2).filter((a) => a !== "--");
const opt = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};
const pkg = JSON.parse(readFileSync(new URL("package.json", ROOT), "utf8")) as { homepage?: string };
const origin = (opt("--origin") ?? pkg.homepage ?? "").replace(/\/+$/, "");
const wait = Number(opt("--wait") ?? 0);
if (!/^https?:\/\//.test(origin))
  throw new Error(`no origin to check: pass --origin or set "homepage" in package.json`);
if (!Number.isFinite(wait) || wait < 0) throw new Error(`--wait must be a number of seconds, got ${opt("--wait")}`);

const files = readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .sort();
const local = new Map(files.map((f) => [f, JSON.stringify(JSON.parse(readFileSync(new URL(f, DIR), "utf8")))]));
// The index and the version list (scripts/registry/versions.ts) are what the tag and consumers rely on.
for (const required of ["registry.json", "versions.json"])
  if (!local.has(required)) throw new Error(`site/public/r/${required} is missing; run pnpm registry:build`);

// Every item the committed index lists must be a committed file, so the comparison below covers the whole index.
const index = JSON.parse(local.get("registry.json") ?? "{}") as { items?: { name: string }[] };
const listed = (index.items ?? []).map((it) => `${it.name}.json`);
const unlisted = listed.filter((f) => !local.has(f));
if (unlisted.length) throw new Error(`registry.json lists items with no built file: ${unlisted.join(", ")}`);

async function check(file: string): Promise<string | undefined> {
  const url = `${origin}/r/${file}`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { "cache-control": "no-cache" }, signal: AbortSignal.timeout(30_000) });
  } catch (error) {
    return `${url}: ${error instanceof Error ? error.message : String(error)}`;
  }
  if (!res.ok) return `${url}: HTTP ${res.status}`;
  const body = await res.text();
  let hosted: string;
  try {
    hosted = JSON.stringify(JSON.parse(body));
  } catch {
    return `${url}: not JSON (${body.slice(0, 80).replace(/\s+/g, " ")})`;
  }
  return hosted === local.get(file) ? undefined : `${url}: differs from the committed site/public/r/${file}`;
}

async function checkAll(): Promise<string[]> {
  const problems: string[] = [];
  const queue = [...files];
  const worker = async () => {
    for (let file = queue.shift(); file !== undefined; file = queue.shift()) {
      const problem = await check(file);
      if (problem) problems.push(problem);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  return problems.sort();
}

const commit = process.env["GITHUB_SHA"] ?? "the working tree";
const deadline = Date.now() + wait * 1000;
for (let attempt = 1; ; attempt++) {
  const problems = await checkAll();
  if (!problems.length) {
    console.log(`hosted registry matches ${commit}: ${files.length} files at ${origin}/r/ (attempt ${attempt})`);
    break;
  }
  if (Date.now() + RETRY_MS > deadline) {
    console.error(problems.join("\n"));
    console.error(
      `hosted registry at ${origin}/r/ does not match ${commit}: ${problems.length} of ${files.length} files`,
    );
    process.exit(1);
  }
  console.log(`attempt ${attempt}: ${problems.length} of ${files.length} files differ or failed; retrying`);
  await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
}
