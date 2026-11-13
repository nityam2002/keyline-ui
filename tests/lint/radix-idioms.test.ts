// Proves the keyline/no-radix-idioms guard works: linting a fixture that holds each banned idiom must fail with
// one diagnostic per idiom, and a fixture of near-misses must pass.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));

interface Diagnostic {
  code: string;
  message: string;
}

function lint(file: string): { status: number | null; diagnostics: Diagnostic[] } {
  const run = spawnSync("pnpm", ["exec", "oxlint", "--no-ignore", "-f", "json", file], { cwd: root, encoding: "utf8" });
  const report = JSON.parse(run.stdout) as { diagnostics: Diagnostic[] }; // oxlint's JSON reporter shape
  return { status: run.status, diagnostics: report.diagnostics.filter((d) => d.code.includes("no-radix-idioms")) };
}

test("every banned idiom in the registry source fails the lint run", () => {
  const { status, diagnostics } = lint("tests/lint/fixtures/src/registry/banned.tsx");
  assert.notEqual(status, 0);
  const messages = diagnostics.map((d) => d.message);
  const count = (fragment: string) => messages.filter((m) => m.includes(fragment)).length;
  assert.equal(count("Radix imports"), 1);
  assert.equal(count("data-[state="), 1);
  assert.equal(count("--radix-"), 1);
  assert.equal(count("`dark:`"), 2);
  assert.equal(count("asChild"), 1);
});

test("Base UI idioms and ordinary words pass", () => {
  const { diagnostics } = lint("tests/lint/fixtures/src/registry/clean.tsx");
  assert.deepEqual(diagnostics, []);
});
