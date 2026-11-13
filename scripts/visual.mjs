// Visual parity: screenshots of the demo app at a base commit and in the working tree, compared pixel for pixel.
// A conversion (docs/recipe.md, "Visual parity") must leave every shot identical except the ones it means to change.
//
//   pnpm test:visual [--base <git-ref>] [--only <entry>,<entry>] [--engines chromium,webkit] [--workers <n>] [--verbose]
//
//   --base     the commit to compare against (default HEAD). Its shots are cached by commit, so it is shot once.
//   --only     specimen entry ids (src/demo/App.tsx) and/or the routes "app" and "playground"; default: all of them
//   --engines  default chromium,webkit
//   --workers  pages at once per engine (default 6)
//   --verbose  print where the time went
//
// The fixtures are the demo app itself: each specimen entry's section (?only=<entry>), and the app and playground
// routes, in light/dark × default/compact density × ltr/rtl, at rest and in the states listed in
// tests/visual/states.mjs. Exit status: 0 when every shot matches, 1 when any differs or could not be taken.
//
// The base is a git worktree of the commit under .artifacts/visual/trees/, removed after its shots are taken. It
// shares this checkout's node_modules (a symlink) when its pnpm-lock.yaml is the same as this checkout's; when it
// differs, the worktree gets its own install (pnpm install --frozen-lockfile --prefer-offline), so the base is built
// with the dependencies it was committed with. Each tree's app is built by its own scripts/test-app.mjs, in a child
// process whose working directory is that tree, and served on a free port; every server is closed before exit.
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { serveApp } from "./test-app.mjs";
import { settle, idle, stable } from "../tests/browser/fixtures.mjs";
import { ENGINES, ROUTES, fontsFirst, launch, listEntries, plan, shoot, shotFile } from "../tests/visual/shoot.mjs";
import { comparePng } from "../tests/visual/png.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const VIS = join(ROOT, ".artifacts/visual");
const rel = (p) => relative(process.cwd(), p) || ".";
const t0 = Date.now();
const secs = (ms) => `${(ms / 1000).toFixed(1)}s`;

// ---- arguments
const argv = process.argv.slice(2).filter((a) => a !== "--");
const opts = { base: "HEAD", only: [], engines: ENGINES, workers: 6, verbose: false };
for (let i = 0; i < argv.length; i++) {
  const [k, inline] = argv[i].split(/=(.*)/s);
  const val = () => inline ?? argv[++i];
  if (k === "--base") opts.base = val();
  else if (k === "--only") opts.only.push(...val().split(",").filter(Boolean));
  else if (k === "--engines") opts.engines = val().split(",").filter(Boolean);
  else if (k === "--workers") opts.workers = Number(val());
  else if (k === "--verbose") opts.verbose = true;
  else {
    console.error(
      `unknown argument ${argv[i]}\nusage: pnpm test:visual [--base <git-ref>] [--only <entries>] [--engines chromium,webkit] [--workers <n>] [--verbose]`,
    );
    process.exit(2);
  }
}
const badEngine = opts.engines.find((e) => !ENGINES.includes(e));
if (badEngine) {
  console.error(`unknown engine "${badEngine}" (have ${ENGINES.join(", ")})`);
  process.exit(2);
}

const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const sha = git("rev-parse", "--verify", `${opts.base}^{commit}`);
const short = sha.slice(0, 9);

const phases = [];
const phase = async (name, fn) => {
  const s = Date.now();
  try {
    return await fn();
  } finally {
    phases.push(`${name} ${secs(Date.now() - s)}`);
  }
};

/** Builds the app of the tree at `root` into `out`, with that tree's own scripts/test-app.mjs, in a child process
 * whose working directory is the tree (Vite and Tailwind resolve from it). */
const build = (root, out) =>
  new Promise((resolve, reject) => {
    // the paths go by environment, not argv: test-app.mjs starts its own server when argv[1] names it
    const code = "await (await import(process.env.KL_APP)).buildApp(process.env.KL_OUT);";
    const c = spawn(process.execPath, ["--input-type=module", "-e", code], {
      cwd: root,
      env: { ...process.env, KL_APP: join(root, "scripts/test-app.mjs"), KL_OUT: out },
      stdio: ["ignore", "inherit", "pipe"],
    });
    let err = "";
    c.stderr.on("data", (d) => (err += d));
    c.on("error", reject);
    c.on("exit", (status) =>
      status === 0 ? resolve() : reject(new Error(`building ${rel(root)} failed:\n${err.slice(-2000)}`)),
    );
  });

// ---- cleanup: servers, browsers and the base worktree go whatever happens
const cleanups = [];
const cleanup = async () => {
  for (const f of cleanups.splice(0).reverse()) await Promise.resolve(f()).catch(() => {});
};
for (const sig of ["SIGINT", "SIGTERM"])
  process.on(sig, () => {
    void cleanup().then(() => process.exit(130));
  });

// one run at a time: two would share .artifacts/visual/work and the base cache
const lockFile = join(VIS, "run.lock");
mkdirSync(VIS, { recursive: true });
try {
  const other = Number(readFileSync(lockFile, "utf8"));
  process.kill(other, 0);
  console.error(`visual: another run (pid ${other}) is using ${rel(VIS)}; wait for it to finish`);
  process.exit(2);
} catch {
  // no lock, or its process is gone
}
writeFileSync(lockFile, String(process.pid));
cleanups.push(() => rmSync(lockFile, { force: true }));

let status = 1;
try {
  status = await main();
} catch (e) {
  console.error(`visual: ${e?.message ?? e}`);
} finally {
  await cleanup();
}
process.exit(status);

async function main() {
  const workApp = join(VIS, "app/work");
  const workBuilt = phase("build work", () => build(ROOT, workApp));

  const engines = await phase("launch", () => launch(opts.engines));
  cleanups.push(engines.close);

  // the base cache: one folder per commit and version of the shooting code, holding the
  // shots taken so far and the definition each was taken with
  const harness = [
    readFileSync(join(ROOT, "tests/visual/shoot.mjs"), "utf8"),
    String(settle) + String(idle) + String(stable),
  ];
  const env = createHash("sha1").update(harness.join("\0")).digest("hex").slice(0, 10);
  const cache = join(VIS, "base", `${short}-${env}`);
  // caches made by other versions of the shooting code can never be read again
  for (const d of existsSync(join(VIS, "base")) ? readdirSync(join(VIS, "base")) : [])
    if (!d.endsWith(`-${env}`)) rmSync(join(VIS, "base", d), { recursive: true, force: true });
  const manifestFile = join(cache, "manifest.json");
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : {};

  await workBuilt;
  fontsFirst(workApp);
  const work = await serveApp(workApp, 0);
  cleanups.push(work.close);

  const entries = opts.only.length ? opts.only : [...(await listEntries(work.url)), ...ROUTES];
  const shots = plan({ entries, engines: opts.engines });

  const workDir = join(VIS, "work"),
    diffDir = join(VIS, "diff");
  rmSync(workDir, { recursive: true, force: true });
  rmSync(diffDir, { recursive: true, force: true });

  const jobs = shots.map((shot) => ({ shot, base: work.url, file: shotFile(workDir, shot), side: "work" }));
  // a shot is taken again when its state's definition or its engine's version has changed
  const current = (s) => manifest[s.name]?.def === s.def && manifest[s.name]?.version === engines.versions[s.engine];
  const missing = shots.filter((s) => !current(s));
  if (missing.length) {
    const base = await phase("base tree", () => baseServer());
    for (const shot of missing) jobs.push({ shot, base: base.url, file: shotFile(cache, shot), side: "base" });
  }

  let done = 0;
  const tty = process.stderr.isTTY;
  const failures = await phase(`shoot ${jobs.length}`, () =>
    shoot(engines.browsers, jobs, {
      workers: opts.workers,
      onShot: () => {
        done++;
        if (tty && (done % 10 === 0 || done === jobs.length))
          process.stderr.write(`\r  shooting ${done}/${jobs.length}`);
      },
    }),
  );
  if (tty) process.stderr.write("\r\x1b[K");

  // record the base shots (and the base's own failures, so a fixture it lacks is not retried every run)
  const failed = new Map(failures.map((f) => [f.job, f.error]));
  for (const j of jobs)
    if (j.side === "base")
      manifest[j.shot.name] = {
        def: j.shot.def,
        version: engines.versions[j.shot.engine],
        error: failed.get(j) ?? null,
      };
  if (missing.length) {
    mkdirSync(cache, { recursive: true });
    writeFileSync(manifestFile, JSON.stringify(manifest, null, 1));
  }

  // ---- compare
  const diffs = [];
  const errors = [];
  const workErr = new Map(failures.filter((f) => f.job.side === "work").map((f) => [f.job.shot.name, f.error]));
  await phase("compare", () => {
    for (const shot of shots) {
      const be = manifest[shot.name]?.error,
        we = workErr.get(shot.name);
      if (be || we) {
        if (be !== we) errors.push({ shot, base: be, work: we });
        else errors.push({ shot, both: be });
        continue;
      }
      const before = shotFile(cache, shot),
        after = shotFile(workDir, shot);
      const r = comparePng(readFileSync(before), readFileSync(after));
      if (!r) continue;
      const diff = shotFile(diffDir, shot);
      mkdirSync(dirname(diff), { recursive: true });
      writeFileSync(diff, r.diff);
      diffs.push({ shot, before, after, diff, r });
    }
  });

  const took = secs(Date.now() - t0);
  const timing = opts.verbose ? `\n  time: ${phases.join(", ")}` : "";
  if (!diffs.length && !errors.length) {
    console.log(`visual: ${shots.length} shots match ${short} (${opts.engines.join(", ")}) in ${took}${timing}`);
    return 0;
  }

  const lines = [];
  for (const { shot, before, after, diff, r } of diffs) {
    const what = r.size
      ? `size ${r.size}`
      : `${r.pixels} px in ${r.box.width}x${r.box.height} at ${r.box.x},${r.box.y}`;
    lines.push(
      `  ${shot.name}  ${what}`,
      `    before ${rel(before)}`,
      `    after  ${rel(after)}`,
      `    diff   ${rel(diff)}`,
    );
  }
  for (const e of errors)
    lines.push(
      e.both
        ? `  ${e.shot.name}  not shot in either tree: ${e.both}`
        : `  ${e.shot.name}  ${e.base ? `not shot at ${short}: ${e.base}` : `not shot in the working tree: ${e.work}`}`,
    );
  const report = join(VIS, "report.txt");
  writeFileSync(report, lines.join("\n") + "\n");
  const LIMIT = 30 * 4;
  const byFixture = {};
  for (const d of [...diffs, ...errors]) byFixture[d.shot.fixture] = (byFixture[d.shot.fixture] ?? 0) + 1;
  console.log(
    `visual: ${diffs.length} of ${shots.length} shots differ from ${short}` +
      (errors.length ? `, ${errors.length} could not be compared` : "") +
      ` (${took})\n  by fixture: ${Object.entries(byFixture)
        .map(([f, n]) => `${f} ${n}`)
        .join(", ")}`,
  );
  console.log(lines.slice(0, LIMIT).join("\n"));
  if (lines.length > LIMIT) console.log(`  … the full list is in ${rel(report)}`);
  if (timing) console.log(timing.trimStart());
  return 1;
}

/** A worktree of the base commit, its app built and served; the server and the worktree are cleaned up at exit. */
async function baseServer() {
  const tree = join(VIS, "trees", short);
  const prune = () => {
    if (existsSync(tree)) git("worktree", "remove", "--force", tree);
    rmSync(tree, { recursive: true, force: true });
    git("worktree", "prune");
  };
  prune();
  git("worktree", "add", "--detach", "--force", tree, sha);
  cleanups.push(prune);
  // dependencies: this checkout's when the lockfile is the same; else the commit's own, installed into the worktree
  const lock = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);
  if (lock(join(tree, "pnpm-lock.yaml")) === lock(join(ROOT, "pnpm-lock.yaml")))
    symlinkSync(join(ROOT, "node_modules"), join(tree, "node_modules"), "dir");
  else {
    console.error(`visual: ${short} has a different pnpm-lock.yaml; installing its dependencies into the worktree`);
    execFileSync("pnpm", ["install", "--frozen-lockfile", "--prefer-offline", "--ignore-scripts"], {
      cwd: tree,
      stdio: ["ignore", "ignore", "inherit"],
    });
  }
  // a commit from before scripts/test-app.mjs exported buildApp is built with this checkout's copy
  const own = join(tree, "scripts/test-app.mjs");
  if (!existsSync(own) || !/export async function buildApp/.test(readFileSync(own, "utf8"))) {
    mkdirSync(dirname(own), { recursive: true });
    copyFileSync(join(ROOT, "scripts/test-app.mjs"), own);
  }
  const out = join(VIS, "app", short);
  await build(tree, out);
  fontsFirst(out);
  const s = await serveApp(out, 0);
  cleanups.push(s.close);
  return s;
}
