// Per-item versions with a file-hash lock (after ballmac-ui's scripts/versions.ts), so a shipped change cannot reach
// users unannounced.
//
//   pnpm versions:check   fails on any problem below, or when versions.lock.json is not up to date
//   pnpm versions:lock    rewrites versions.lock.json, refusing while there is a problem
//
// An item's hash covers everything `shadcn add` installs from it, read from the built item (the same JSON as
// site/public/r/<name>.json): every file's path, target and content, its dependencies, registryDependencies,
// css, cssVars, tailwind and envVars. Only the descriptive keys (title, description, docs, categories, author) are
// left out, so a key that is added to the build later is hashed by default. ballmac hashed one file per item and
// missed the rest; this hashes all of it.
//
// Against the committed lock it fails when:
//   - an item's hash changed and its version did not (bump it and write a changelog entry);
//   - a version went backwards;
//   - the meta's `changelog[0]` is not for its `version`, or `updated` is not that entry's date;
//   - a breaking entry ships in a version whose major did not go up;
//   - an item in the lock has no meta and was not a tombstone (removed without one, see docs/releasing.md);
//   - an item reuses a name that was retired (a published name never comes back as something else);
//   - a tombstone's `deprecated` does not name a live item.
//
// The build publishes the same data, with each item's changelog, as site/public/r/versions.json (publishedVersions).
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

import type { KeylineItem } from "../../src/registry/item.ts";

export const LOCK = "versions.lock.json";
export const VERSIONS = "versions.json";

type Lock = {
  items: Record<string, { version: string; hash: string; deprecated?: string }>;
  /** Names whose tombstone was deleted, with their last version: never reused. */
  retired: Record<string, string>;
};

/* ---------------------------------------------------------------- semver */
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const parts = (v: string) => (SEMVER.exec(v) ?? []).slice(1).map(Number);
export function compare(a: string, b: string): number {
  const [x, y] = [parts(a), parts(b)];
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
}

/* ---------------------------------------------------------------- the hash */
// descriptive keys: shown by the CLI and the docs, never written into the consumer's project
const DESCRIPTIVE = new Set(["$schema", "name", "title", "description", "docs", "categories", "author", "meta"]);

const canonical = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(canonical)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.keys(v)
            .toSorted()
            .map((k) => [k, canonical((v as Record<string, unknown>)[k])]),
        )
      : v;

/** The hash of what installing the built item (its registry JSON) writes into a project. */
export function itemHash(builtJson: string): string {
  const item = JSON.parse(builtJson) as Record<string, unknown>;
  const installed = Object.fromEntries(Object.entries(item).filter(([k]) => !DESCRIPTIVE.has(k)));
  return (
    "sha256-" +
    createHash("sha256")
      .update(JSON.stringify(canonical(installed)))
      .digest("hex")
  );
}

/* ---------------------------------------------------------------- the checks */
type Meta = Pick<KeylineItem, "name" | "version" | "updated" | "changelog" | "deprecated">;

/** What is wrong with one meta on its own: the release fields agree with each other. */
function metaProblems(m: Meta, names: Map<string, Meta>): string[] {
  const out: string[] = [];
  if (!SEMVER.test(m.version ?? "")) out.push(`${m.name}: version "${m.version}" is not x.y.z`);
  const log = m.changelog ?? [];
  const [latest] = log;
  if (!latest) return [...out, `${m.name}: changelog[] is empty; write the entry for ${m.version}`];
  if (latest.version !== m.version)
    out.push(
      `${m.name}: version is ${m.version} but the newest changelog entry is for ${latest.version}; write its entry`,
    );
  if (m.updated !== latest.date)
    out.push(`${m.name}: updated (${m.updated}) is not the newest entry's date (${latest.date})`);
  log.forEach((e, i) => {
    if (!SEMVER.test(e.version)) out.push(`${m.name}: changelog entry "${e.version}" is not x.y.z`);
    if (!ISO_DATE.test(e.date) || Number.isNaN(Date.parse(e.date)))
      out.push(`${m.name}: changelog ${e.version} date "${e.date}" is not YYYY-MM-DD`);
    if (!e.note.trim()) out.push(`${m.name}: changelog ${e.version} has no note`);
    const next = log[i + 1];
    if (next && compare(e.version, next.version) <= 0)
      out.push(`${m.name}: changelog is not newest first (${e.version} before ${next.version})`);
    if (next && e.date < next.date) out.push(`${m.name}: changelog ${e.version} is dated before ${next.version}`);
    if (e.breaking === true) {
      const mig = (e as { migration?: Record<string, unknown> }).migration;
      for (const k of ["diff", "modified", "prompt"])
        if (typeof mig?.[k] !== "string" || !(mig[k] as string).trim())
          out.push(`${m.name}: breaking entry ${e.version} needs migration.${k} (see .github/CONTRIBUTING.md)`);
    }
  });
  if (m.deprecated !== undefined) {
    const to = names.get(m.deprecated);
    if (!to) out.push(`${m.name}: deprecated names ${m.deprecated}, which is not an item`);
    else if (to.deprecated !== undefined) out.push(`${m.name}: deprecated names ${m.deprecated}, itself a tombstone`);
  }
  return out;
}

export type Current = Map<string, { meta: Meta; hash: string }>;

/** Every problem between the committed lock and the current items. */
export function versionProblems(lock: Lock, current: Current): string[] {
  const names = new Map([...current].map(([n, c]) => [n, c.meta]));
  const out: string[] = [];
  for (const [name, { meta, hash }] of current) {
    out.push(...metaProblems(meta, names));
    const was = lock.items[name];
    if (!was) {
      if (name in lock.retired)
        out.push(`${name}: the name was published and retired at ${lock.retired[name]}; pick a new name`);
      continue;
    }
    const step = compare(meta.version, was.version);
    if (step < 0) out.push(`${name}: version went backwards (${was.version} -> ${meta.version})`);
    else if (step === 0 && hash !== was.hash)
      out.push(
        `${name}: its shipped files changed but its version is still ${meta.version}; bump it and add a changelog entry`,
      );
    else if (step > 0) {
      const shipped = meta.changelog.filter((e) => compare(e.version, was.version) > 0);
      if (shipped.some((e) => e.breaking === true) && (parts(meta.version)[0] ?? 0) <= (parts(was.version)[0] ?? 0))
        out.push(`${name}: a breaking entry needs a major bump (${was.version} -> ${meta.version} is not one)`);
    }
  }
  for (const [name, was] of Object.entries(lock.items))
    if (!current.has(name) && was.deprecated === undefined)
      out.push(
        `${name}: removed without a tombstone; keep its meta with deprecated: "<replacement>" for one release (docs/releasing.md)`,
      );
  return out;
}

/** The lock that records the current items (a deleted tombstone's name moves to `retired`). */
export function nextLock(lock: Lock, current: Current): Lock {
  const items: Lock["items"] = {};
  for (const [name, { meta, hash }] of [...current].toSorted(([a], [b]) => (a < b ? -1 : 1)))
    items[name] = { version: meta.version, hash, ...(meta.deprecated ? { deprecated: meta.deprecated } : {}) };
  const retired = { ...lock.retired };
  for (const [name, was] of Object.entries(lock.items)) if (!current.has(name)) retired[name] = was.version;
  return { items, retired: Object.fromEntries(Object.entries(retired).toSorted(([a], [b]) => (a < b ? -1 : 1))) };
}

/** The current items: each meta with the hash of its built JSON. */
export function currentItems(metas: Meta[], built: Map<string, string>): Current {
  return new Map(
    metas.map((m) => {
      const json = built.get(`${m.name}.json`);
      if (json === undefined) throw new Error(`versions: ${m.name} was not built`);
      return [m.name, { meta: m, hash: itemHash(json) }];
    }),
  );
}

/** site/public/r/versions.json: one entry per item, what a consumer (or a future update command) compares with. */
export function publishedVersions(current: Current): string {
  const out: Record<string, unknown> = {};
  for (const [name, { meta, hash }] of [...current].toSorted(([a], [b]) => (a < b ? -1 : 1)))
    out[name] = {
      version: meta.version,
      updated: meta.updated,
      hash,
      ...(meta.deprecated ? { deprecated: meta.deprecated } : {}),
      changelog: meta.changelog,
    };
  return JSON.stringify(out, null, 2) + "\n";
}

/* ---------------------------------------------------------------- as a script */
async function main() {
  const { buildRegistry, loadMetas, ROOT } = await import("./build.ts");
  const write = process.argv.includes("--write");
  const lock: Lock = existsSync(ROOT + LOCK)
    ? (JSON.parse(readFileSync(ROOT + LOCK, "utf8")) as Lock)
    : { items: {}, retired: {} };
  const current = currentItems(await loadMetas(), (await buildRegistry()).items);
  const problems = versionProblems(lock, current);
  const next = JSON.stringify(nextLock(lock, current), null, 2) + "\n";
  const stale = existsSync(ROOT + LOCK) ? readFileSync(ROOT + LOCK, "utf8") !== next : true;
  if (problems.length) {
    for (const p of problems) console.error(`versions: ${p}`);
    process.exitCode = 1;
    return;
  }
  if (write) {
    writeFileSync(ROOT + LOCK, next);
    console.log(`${LOCK}: ${current.size} items`);
  } else if (stale) {
    console.error(`versions: ${LOCK} does not record the current items; run pnpm versions:lock and commit it`);
    process.exitCode = 1;
  } else console.log(`versions: ${current.size} items match ${LOCK}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href)
  main().catch((e: unknown) => {
    console.error(e);
    process.exitCode = 1;
  });
