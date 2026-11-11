# Using Keyline

Keyline is a React + TypeScript component library built on [Base UI](https://base-ui.com) and distributed as a
[shadcn registry](https://ui.shadcn.com/docs/registry). You install the items you need into your own project;
the source is yours to read and edit.

Per-component APIs, examples and props live on the documentation site, which also carries this material for
people installing Keyline: Installation (with troubleshooting), Theming, Modes, Configuration, Composition and the
Shipments block. This page keeps the same reference in the repository, plus the playground, which runs only from a
checkout. Keep the two in step.

## Requirements

- React 19 and TypeScript.
- **Tailwind CSS 4.** Keyline's theme uses `@theme inline`, which needs Tailwind 4.
- A shadcn project: a `components.json` (any `style` and base) and the `cn()` helper at its `utils` alias.
  `npx shadcn@latest init` sets up both.
- Next.js App Router, Vite, or another framework the shadcn CLI supports. Interactive components start with
  `"use client";`, so App Router server components can import them; bundlers without React Server Components
  (Vite) ignore the directive.
- Network access to npm and to the Keyline site while the CLI runs. Nothing is fetched from it at runtime.

## Install

The documentation site serves the registry at `/r/{name}.json`. Items reference each other as
`@keyline-ui/<name>`, so a project maps that namespace once and then adds items by name. The registry
lives at `https://keyline-ui.dev/r/{name}.json`.

### New project

```sh
npx shadcn@latest init -t next          # or: -t vite
npx shadcn@latest registry add @keyline-ui=https://keyline-ui.dev/r/{name}.json
npx shadcn@latest add @keyline-ui/button
```

### Existing shadcn project

In the folder that holds `components.json`:

```sh
npx shadcn@latest registry add @keyline-ui=https://keyline-ui.dev/r/{name}.json
npx shadcn@latest add @keyline-ui/button @keyline-ui/table
```

The first command adds the mapping to `components.json`, which you can also write by hand:

```json
{ "registries": { "@keyline-ui": "https://keyline-ui.dev/r/{name}.json" } }
```

Item names are the ones in `src/registry/manifest.mjs` (for example `select`, `date-picker`, `scroll-area`,
`toolbar`, `app-shell`). A few names install other items: `sidebar` installs `app-shell` and `nav`;
`alert-dialog` installs `dialog`, which exports `AlertDialog`.

### Aliases and `src/`

Files follow your `components` alias and land in `<components>/keyline/{ui,lib,blocks}/`, so a project with
`src/` and a `~/*` alias imports `~/components/keyline/ui/button`. Keyline's files import each other by relative
path and `cn()` through your `utils` alias. The `keyline/` folder under your components directory is fixed:
the `ui` alias does not move it, which keeps Keyline apart from shadcn's `components/ui/`.

### What installing an item does

| | |
|---|---|
| **Files** | Go to `components/keyline/{ui,lib,blocks}/` (under `src/` if your project uses it). Import them as `@/components/keyline/ui/button`. shadcn's own `components/ui/*` are untouched, so Keyline's `Button` and shadcn's `Button` coexist. |
| **CSS** | Each item merges its own `kl-` rules (and the theme item its `--kl-*` tokens) into the CSS file named in `components.json`. Re-adding an item updates its rules in place rather than duplicating them. |
| **Theme** | Every component item depends on `@keyline-ui/keyline`, the theme item: the `--kl-*` tokens, the shared construction rules and the `kl-` Tailwind utilities. |
| **Dependencies** | Each item declares its npm and registry dependencies, so Base UI, the fonts and any wrapped library arrive with it. Libraries Keyline wraps are pinned exactly: `react-resizable-panels@4.14.8`, `react-day-picker@9.14.0`, `recharts@3.10.1`, `embla-carousel-react@8.6.0`, `@shadcn/react@0.3.1`. |
| **Fonts** | Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono come with `@keyline-ui/keyline`. |

npm records an exact registry pin as a caret range (`^4.14.8`) in your `package.json`. Edit it, or set
`save-exact`, if you want the version held.

### Keyline's CSS does not restyle your app

The theme item writes only Keyline's own names: `--kl-*` tokens, `kl-` classes and `data-kl-*` attributes.
It sets no `body` styles, no shadcn tokens, no `--radius`, no `--font-sans` and no global focus ring, so stock
shadcn components on the same page are unchanged.

Each outermost Keyline element carries Keyline's type and ink itself, so a component keeps its voice inside an
app that uses another font.

### Opt-in: `keyline-shadcn`

To make the whole app Keyline, including stock shadcn components:

```sh
npx shadcn@latest add @keyline-ui/keyline-shadcn
```

It maps shadcn's semantic colour tokens (sidebar tokens included) to Keyline roles in `:root`, `.light`,
`.dark` and `[data-kl-config]` scopes, sets `--radius: 0px`, maps `--font-sans`/`--font-mono` to Keyline's
fonts, styles `body`, adds a `:focus-visible` ring and sets `color-scheme` per theme. Notable mappings:
`--popover` is `raised`, `--border` is `seam`, `--input` is `line`, `--ring` is `focus`. `--chart-*` is left
to you.

## Configure

Configuration changes how Keyline is tuned, not what it is. Role weights (3/2/1px), square corners, the four
signal jobs, the motion behaviours and "one edge, one owner" are not configurable.

### Tokens

Ten source tokens are configurable. Keyline's defaults live in `@layer base`, so any unlayered declaration of
yours wins, wherever it sits in the file.

| Token | Default | Meaning |
|---|---|---|
| `--kl-working` | `oklch(0.9 0.17 98)` | The working set: selection, tokens, ranges |
| `--kl-commit` | `oklch(0.48 0.2 262)` | Location and commitment: current place, primary action, focus |
| `--kl-attention` | `oklch(0.55 0.2 33)` | Invalid, failed, destructive, overdue |
| `--kl-neutral-h` | `262` | Hue of paper, ink and keylines |
| `--kl-neutral-c` | `1` | Tint of the neutrals (0 grey, 1 default, up to 3) |
| `--kl-font` | Atkinson Hyperlegible Next | The UI voice |
| `--kl-font-mono` | Atkinson Hyperlegible Mono | The Code voice |
| `--kl-weight-strong` | `700` | Labels, headers, the Count |
| `--kl-weight-display` | `800` | Titles, glyph cells |
| `--kl-cut` | `0` | The cut accent: `0` off, `0.5` quiet, `1` full |

Every other colour (fills, foregrounds, text variants, focus, selection, data colours, both themes) is
derived from these. Derived colours are recomputed only on `:root`, `.light`, `.dark` and elements with
`data-kl-config`. Set palette tokens on one of those; on a plain element, a control there keeps the old colour
while its popup takes the new one.

Motion timings are tokens too (`--kl-t-flood`, `--kl-t-unfold`, `--kl-stretch-lead`, …). Set
`--kl-stretch-tug: 0` or `--kl-flood-seed: 0px` on a subtree to turn off the press tug or flood seed.

### The playground

`npm run dev`, then open `#/playground`. It builds a configuration on real components and exports it three
ways that produce the same tokens:

| Route | How |
|---|---|
| **shadcn CLI** | Download `keyline-config.json`, then `npx shadcn@latest add ./keyline-config.json`. It writes all ten tokens, unlayered, on `:root` or on `[data-kl-config="<name>"]`, and installs a non-default font package with its `@import` lines. |
| **CSS** | Paste the generated block (and any `@import` lines) into your CSS after Tailwind. |
| **Runtime** | `KeylineConfigScope` from `@/components/keyline/lib/keyline-config` (install `@keyline-ui/keyline-config`). |

A scope name in the playground targets `[data-kl-config="<name>"]` instead of the whole app. The playground
also warns when two signal hues are too close to tell apart, and fits free hues so on-colour text holds
contrast. Its diagnostics (compare, slow motion, RTL, narrow frame) are never exported.

```tsx
import { KeylineConfigScope, DEFAULT_CONFIG } from "@/components/keyline/lib/keyline-config"

<KeylineConfigScope config={{ ...DEFAULT_CONFIG, density: "compact" }} name="billing">
  …
</KeylineConfigScope>
```

`KeylineConfigScope` renders a `div` with `data-kl-config`, the mode attributes and the tokens as inline
style. Theme `"system"` sets no class, so the scope follows the page.

### Fonts

| Font | Installs |
|---|---|
| Atkinson Hyperlegible (default) | Nothing extra; it comes with `@keyline-ui/keyline` |
| IBM Plex | `@fontsource-variable/ibm-plex-sans` and `@fontsource/ibm-plex-mono`, through the config item |
| System UI | Nothing |

## Modes

Theme, density, cut, motion and direction are attributes or classes, so they can change per region. The
playground's export prints the line to add.

| To set | Use | Where |
|---|---|---|
| Theme | `.dark` or `.light` | Any subtree, including a light region inside a dark page |
| Density | `data-kl-density="compact" \| "default" \| "comfortable"` | Any subtree |
| Cut | `--kl-cut: 0 \| 0.5 \| 1`, or `data-kl-cut="off" \| "quiet" \| "on"` | `:root` or any subtree |
| Reduced motion | `data-kl-motion="reduce"`; `prefers-reduced-motion` is honoured anyway | Any subtree |
| Direction | `dir="rtl"`, or `DirectionProvider` from `@keyline-ui/direction` | Any subtree |

**Density** sets control height (28 / 36 / 40px), row height (28 / 40 / 48px), inset (8 / 12 / 16px), gutter
(12 / 12 / 16px), base type size (13 / 14 / 15px) and cut sizes. It never changes border weights.

**Reduced motion** zeroes every motion duration; state still changes, instantly.

**Direction.** Keyline's CSS and its DOM-reading components (Toolbar, Slider, Scroll Area, Carousel) follow the
DOM `dir`. Base UI decides which side a tooltip, popover, hover card or menu opens on, and its arrow keys, from
its own `DirectionProvider`. `DirectionProvider` from `@keyline-ui/direction` sets both and adds no box:

```tsx
<DirectionProvider direction="rtl">…</DirectionProvider>
```

### Portals

Menus, selects, popovers, date panels, dialogs, sheets, tooltips and toasts render in a portal under `<body>`.
They carry the configuration of the place they were written: the ten source tokens, `.dark`/`.light`,
density, motion and `dir`. A hidden marker stays where the component is written and the overlay copies its
resolved configuration when it opens, re-reading while open. There is no provider.

If you build your own overlay, `useKeylineScope()` and `scopeProps()` from `keyline-scope` do the same: render
the returned marker where the component is written and spread `scopeProps(scope)` on the portaled root.

### Dark mode

Keyline follows `.dark` / `.light` on an ancestor and does not read `prefers-color-scheme` itself. shadcn's
dark-mode setups (next-themes with `attribute="class"`, or its Vite theme provider) already set that class, so
nothing else is needed.

Dark is tuned, not mirrored: surfaces lift off black, primary text stops short of white, edges step down in
tone by role, and the inverse fill is a light grey rather than white.

### Brand colours

Commit and attention fills get white or dark text by lightness (the crossover is OKLCH L 0.575). A fill you
pick by hand between L 0.5 and 0.65 can fall below 4.5:1 with either. Keep those two fills outside that band,
or pick the hue in the playground, which fits it.

## Colour roles and utilities

You configure sources; the neutrals and their roles are derived per theme. When you build your own component,
pick the role, not a colour.

| Role | For |
|---|---|
| `paper` · `cell` · `raised` | Page, panel or control, and overlay surfaces. An overlay sets `--kl-cell: var(--kl-raised)`, so everything inside lifts with it |
| `tint` · `press` | Hover and press feedback |
| `ink` · `ink-2` · `ink-3` | Primary, secondary and supporting text |
| `line` · `seam` · `line-soft` | Frames and control boundaries · 1px dividers inside one frame · decorative row rules |
| `inverse` · `on-inverse` | The ink role painted as a fill (cursor, checked fill) and its text |
| `yellow` (+ `on-yellow`, `yellow-row`) · `cobalt` · `red` (+ `on-*`, `*-hi`, `*-lo`, `*-text`) | The working, commit and attention signals; `yellow-row` is a selected row |
| `focus` | Focus indicators (the commit colour's text variant) |
| `dis` · `dis-line` · `scrim` | Disabled text and edges, modal scrim |
| `data-1` · `data-2` · `data-3` · `data-mark` · `data-alert` | Chart and meter series by role: focal, comparison, the rest, a marked value, a breach |

A divider between cells of one frame is `seam`; a cursor or checked fill is `inverse` with `on-inverse` text.

Every role is also a Tailwind colour of the same name prefixed `kl-`, so your editor completes it:

```html
<div class="bg-kl-cell text-kl-ink-2 border-kl-seam">…</div>
<li class="bg-kl-inverse text-kl-on-inverse">…</li>
<rect class="fill-kl-data-1" />
```

Type and spacing utilities: `font-kl` and `font-kl-mono` (the two voices), `font-kl-strong` and
`font-kl-display` (the two weights), and the density spacing `kl-inset` and `kl-gutter` with any spacing
utility (`gap-kl-gutter`, `px-kl-inset`). They follow `.dark` and `data-kl-config` scopes like the tokens do,
and leave shadcn's `bg-primary`, `border-border` and so on alone. `text-(--kl-ink-2)` also works.

## Scroll Area

```sh
npx shadcn@latest add @keyline-ui/scroll-area
```

Dialog, Sheet, Inspector, Table and Message scroller build on it, so it also arrives with them.

```tsx
<ScrollArea className="h-64" label="Today's activity">…</ScrollArea>   // vertical (default)
<ScrollArea scrollbars="both" className="max-h-96">…</ScrollArea>      // "horizontal" | "both"
```

- **Size the root** with your own class (height or max-height).
- **Scrolling stays native**: wheel, trackpad, touch momentum, keyboard and find-in-page belong to the browser.
- **Bars are cells on the region's edge.** They exist only while their axis overflows, and content is padded
  clear of them, so a bar never covers text. `track="rail"` draws a 1px rail instead, for a region that is
  not inside a frame.
- **The thumb follows the platform** (`scrollbarVisibility="system"`): it reveals while scrolling and fades
  where native bars overlay content, and always shows where they take space, in forced colours and with
  `prefers-contrast: more`. `"scroll"` always fades; `"always"` always shows.
- **Name the region** with `label` when nothing else names it; the viewport is focusable while it overflows.
- **Don't wrap Select, Multiselect, Menu or Command lists.** They keep their own native scroller, which the
  theme styles to match.

## Composition rules

- **Layout is declared, never inferred.**
  - Controls take `layout="control"` (the default): their own 2px frame and, when on, the cut.
  - Or `layout="cell"`: the control is a cell of the frame it sits in, with no border, no cut and no
    background, and it fills the cell.
  - Putting a control inside a frame changes nothing by itself. Declare `layout="cell"`.
- **Edges have one owner.** Rows of cells (panel and dialog footers, bulk bars, pagers, inspector actions)
  draw the dividers. Don't add borders to cell controls.
- **Sizing is yours; the narrow layout is the component's.**
  - Give parts widths with your own classes; they describe the wide layout.
  - Components that rearrange when narrow measure themselves, not the viewport. A table frame narrower than
    560px stacks its toolbar and bulk bar; a `Form` with `orientation="responsive"` goes horizontal from
    560px of its own width.
- **Overlays share one level** (`--kl-z-overlay`) and stack by opening order, so a select inside a dialog
  opens above it. Floating toasts sit above, on `--kl-z-toast`.
- **Public classes** are `kl-code` (the Code voice: units, IDs) and `kl-count` (the Count voice: big numbers).
  Every other `kl-` class is internal and may change. Use props and Tailwind utilities; if a composition
  needs another `kl-` class, that is a gap to report.

## Updating and removing items

Installed items are your code; nothing changes until you add them again. To take a newer version, re-add with
`--overwrite`. It replaces the item's files, so commit your own edits first and compare afterwards:

```sh
npx shadcn@latest add @keyline-ui/button --overwrite
```

Without `--overwrite`, the CLI skips unchanged files and asks before replacing one you edited. Changed CSS rules
update in place. The CLI only adds or updates, so a rule removed or renamed in Keyline, or the `@import` lines of
a font you switched away from, stay in your CSS until you delete them. To remove an item, delete its files and
its `kl-` rules yourself.

## Known limitations

- **HoverCard content is not reachable by keyboard or screen reader** (Base UI Preview Card). Use it only to
  preview what the linked page already holds; never put actions in it.
- **ContextMenu is a shortcut.** Put every action somewhere visible too.
- **Toolbar Home/End do nothing**; arrow keys move and wrap (Base UI Toolbar leaves Home/End off).
- **A failed toast's action** sits in an `aria-hidden` root until the toast takes focus (Base UI announces
  high-priority toasts through its own live region). Keyboard users reach it with F6.
- **Resizable** dragging needs a pointer alternative (WCAG 2.5.7). Double-click resets the layout; where a
  panel can be hidden, add a button that calls `panelRef.current.collapse()` / `.expand()`. Name each handle
  after the panel it resizes.
- **Form participation is uneven.** `DatePicker` takes `name` but no `required`, `invalid`, `error` or
  `validate`; `DateRangePicker` and `Multiselect` take no `name`; `RadioGroup` has no `legend`, description
  or error props. `Multiselect` requires `loadOptions`, even for a fixed list.
- **`Button signal="done"`** stays until you set it back to `"idle"`.
- **With the cut on, outside Chromium**, the cut is drawn with `clip-path`, and a focus outline stops at the
  diagonal instead of following it.
- **Text-entry focus** (fields, select and picker triggers) meets WCAG 2.2 AA but not AAA 2.4.13 on standalone
  controls. Set `--kl-edge-band: 2px` if you need it.
