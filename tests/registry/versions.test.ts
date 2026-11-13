// The version lock's rules (scripts/registry/versions.ts) on small made-up registries, and the committed lock
// against the real one. `pnpm versions:check` runs the same check from the command line.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRegistry, loadMetas, ROOT } from "../../scripts/registry/build.ts";
import { currentItems, nextLock, versionProblems, LOCK, type Current } from "../../scripts/registry/versions.ts";
import type { ChangelogEntry } from "../../src/registry/item.ts";

const entry = (version: string, extra: Partial<ChangelogEntry> = {}): ChangelogEntry =>
  ({ version, date: "2026-11-13", note: `note ${version}`, ...extra }) as ChangelogEntry;
const item = (name: string, hash: string, versions: string[], extra: { deprecated?: string; breaking?: string } = {}) =>
  [
    name,
    {
      hash,
      meta: {
        name,
        version: versions[0] ?? "",
        updated: "2026-11-13",
        changelog: versions.map((v) =>
          entry(
            v,
            v === extra.breaking
              ? ({ breaking: true, migration: { diff: "-a\n+b", modified: "-a\n+b", prompt: "do it" } } as const)
              : {},
          ),
        ),
        ...(extra.deprecated ? { deprecated: extra.deprecated } : {}),
      },
    },
  ] as const;
const current = (...items: ReturnType<typeof item>[]): Current => new Map(items);
const lock = (items: Record<string, { version: string; hash: string; deprecated?: string }>, retired = {}) => ({
  items,
  retired,
});
const base = lock({ kbd: { version: "1.0.0", hash: "h1" }, button: { version: "1.0.0", hash: "b1" } });

test("an unchanged registry passes", () => {
  assert.deepEqual(versionProblems(base, current(item("kbd", "h1", ["1.0.0"]), item("button", "b1", ["1.0.0"]))), []);
});

test("a shipped change without a bump fails, naming the item", () => {
  const p = versionProblems(base, current(item("kbd", "h2", ["1.0.0"]), item("button", "b1", ["1.0.0"])));
  assert.equal(p.length, 1);
  assert.match(p[0] ?? "", /^kbd: its shipped files changed/);
});

test("a bump with its changelog entry passes; one without an entry fails", () => {
  assert.deepEqual(
    versionProblems(base, current(item("kbd", "h2", ["1.0.1", "1.0.0"]), item("button", "b1", ["1.0.0"]))),
    [],
  );
  const [, kbd] = item("kbd", "h2", ["1.0.0"]);
  const p = versionProblems(base, current(["kbd", { ...kbd, meta: { ...kbd.meta, version: "1.0.1" } }]));
  assert.ok(p.some((x) => /kbd: version is 1.0.1 but the newest changelog entry is for 1.0.0/.test(x)));
});

test("a version going backwards fails", () => {
  const p = versionProblems(lock({ kbd: { version: "1.2.0", hash: "h1" } }), current(item("kbd", "h1", ["1.1.0"])));
  assert.ok(p.some((x) => /kbd: version went backwards \(1.2.0 -> 1.1.0\)/.test(x)));
});

test("a breaking entry needs a major bump", () => {
  const minor = item("kbd", "h2", ["1.1.0", "1.0.0"], { breaking: "1.1.0" });
  assert.ok(versionProblems(base, current(minor)).some((x) => /kbd: a breaking entry needs a major bump/.test(x)));
  const major = item("kbd", "h2", ["2.0.0", "1.0.0"], { breaking: "2.0.0" });
  assert.ok(!versionProblems(base, current(major)).some((x) => x.startsWith("kbd")));
});

test("removing an item without a tombstone fails; a tombstone's removal retires its name for good", () => {
  assert.ok(
    versionProblems(base, current(item("button", "b1", ["1.0.0"]))).some((x) =>
      /kbd: removed without a tombstone/.test(x),
    ),
  );
  const tomb = lock({
    kbd: { version: "1.1.0", hash: "h1", deprecated: "button" },
    button: { version: "1.0.0", hash: "b1" },
  });
  const after = current(item("button", "b1", ["1.0.0"]));
  assert.deepEqual(versionProblems(tomb, after), []);
  const next = nextLock(tomb, after);
  assert.deepEqual(next.retired, { kbd: "1.1.0" });
  const reuse = versionProblems(next, current(item("button", "b1", ["1.0.0"]), item("kbd", "x", ["1.0.0"])));
  assert.ok(reuse.some((x) => /kbd: the name was published and retired at 1.1.0/.test(x)));
});

test("a tombstone must name a live item", () => {
  const p = versionProblems(lock({}), current(item("kbd", "h1", ["1.0.0"], { deprecated: "nothing" })));
  assert.ok(p.some((x) => /kbd: deprecated names nothing, which is not an item/.test(x)));
});

test("versions.lock.json records the current registry (run pnpm versions:lock)", async () => {
  const committed = JSON.parse(readFileSync(ROOT + LOCK, "utf8"));
  const now = currentItems(await loadMetas(), (await buildRegistry()).items);
  assert.deepEqual(versionProblems(committed, now), []);
  assert.deepEqual(nextLock(committed, now), committed);
});
