// Keyline's colour roles as Tailwind utilities (bg-kl-cell, text-kl-ink-2, border-kl-seam …).
// The @theme block must stay in step with the derived roles, and must be `inline`: a plain @theme would resolve
// var(--kl-cell) once on :root, so a .dark subtree or a [data-kl-config] scope would paint the page's colours.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import postcss from "postcss"
import { defined } from "./defined.ts"

const css = postcss.parse(readFileSync(new URL("../src/registry/keyline/theme/keyline.css", import.meta.url), "utf8"))
const decls = (node: postcss.Container) => (node.nodes ?? []).filter((n): n is postcss.Declaration => n.type === "decl")

// the roles every scope re-derives (keyline.css: `:root, .light, .dark, [data-kl-config]`), less the one that is not a colour
let derived: string[] = []
css.walkRules((r) => {
  if (r.selector.replace(/\s+/g, " ") === ":root, .light, .dark, [data-kl-config]") derived = decls(r).map((d) => d.prop.slice("--kl-".length))
})
const roles = derived.filter((n) => n !== "hatch")
const themes = (css.nodes ?? []).filter((n): n is postcss.AtRule => n.type === "atrule" && n.name === "theme")
const [theme] = themes

test("the derived roles were found", () => {
  assert.ok(roles.length >= 30, `found ${roles.length}`)
  assert.ok(roles.includes("cell") && roles.includes("ink-2") && roles.includes("data-alert"))
})

test("one top-level @theme block, and it is inline", () => {
  assert.equal(themes.length, 1)
  assert.ok(theme)
  assert.equal(theme.params, "inline")
})

test("every colour role is a Tailwind colour of the same name, and nothing else is", () => {
  const colours = Object.fromEntries(decls(defined(theme, "@theme block")).filter((d) => d.prop.startsWith("--color-")).map((d) => [d.prop, d.value]))
  assert.deepEqual(colours, Object.fromEntries(roles.map((r) => [`--color-kl-${r}`, `var(--kl-${r})`])))
})

test("the two type voices are Tailwind fonts", () => {
  const fonts = Object.fromEntries(decls(defined(theme, "@theme block")).filter((d) => d.prop.startsWith("--font-") && !d.prop.startsWith("--font-weight-")).map((d) => [d.prop, d.value]))
  assert.deepEqual(fonts, { "--font-kl": "var(--kl-font)", "--font-kl-mono": "var(--kl-font-mono)" })
})

test("the two weights are Tailwind font weights", () => {
  const weights = Object.fromEntries(decls(defined(theme, "@theme block")).filter((d) => d.prop.startsWith("--font-weight-")).map((d) => [d.prop, d.value]))
  assert.deepEqual(weights, { "--font-weight-kl-strong": "var(--kl-weight-strong)", "--font-weight-kl-display": "var(--kl-weight-display)" })
})

test("the density spacing is Tailwind spacing", () => {
  const spacing = Object.fromEntries(decls(defined(theme, "@theme block")).filter((d) => d.prop.startsWith("--spacing-")).map((d) => [d.prop, d.value]))
  assert.deepEqual(spacing, { "--spacing-kl-inset": "var(--kl-inset)", "--spacing-kl-gutter": "var(--kl-gutter)" })
})
