# Converting a component

The steps every component follows to move from `ui/<name>.css` to Tailwind utilities on Keyline's tokens. Button,
Menu and Combobox were converted this way first; their diffs are the worked examples at the end. Read
[design.md](design.md) for what a component must look like; this page is how its source is written.

## 1. Files

- `ui/<name>.tsx` and `ui/<name>.meta.ts`. No `ui/<name>.css`: delete it, drop `cssFile` from the meta, and remove
  its `@import` from `site/app/globals.css` and `src/demo/globals.css`.
- Add `@keyline-ui/keyline-render` to the meta's `registryDependencies` when the source imports
  `../lib/keyline-render` (`pnpm registry:build` tells you which dependencies the source needs).
- Rebuild with `pnpm registry:build` and commit `site/public/r/`.

## 2. Parts

- **Name parts as Base UI names them**, prefixed with the component: `MenuPopup`, `MenuGroupLabel`,
  `ComboboxInputGroup`. A Base UI part with no element of its own (`Root`, `Collection`) is re-exported as it is,
  which keeps its generics: `const ComboboxRoot = ComboboxPrimitive.Root`.
- **Each part wraps one Base UI part** and passes every prop through. Its `className` and `style` may be functions of
  the part's state, so resolve them with `resolveClassName(base, className)` and `resolveStyle(base, style)` from
  `lib/keyline-render`. A part Keyline renders itself uses `useRender` with `mergeProps` (see `ButtonAffix`).
- **Set `data-slot` after the spread props.** The slot names the part that renders the element, so a part rendered
  through another part keeps its own: `<MenuTrigger render={<Button />}>` is a button, styled by Button and found by
  the rules that key on `[data-slot="button"]`. A component that reuses another's styled part (Context Menu's popup
  is `MenuSurface`) carries that part's slot.
- **Mirror variant props as attributes**: `{...dataAttrs({ variant, size })}` writes `data-variant` and
  `data-size`; `data-kl-layout` carries `layout`. Base UI's own state attributes (`data-highlighted`,
  `data-popup-open`, `data-disabled`, `data-invalid`) are styled directly; never invent a parallel one.
- **A popup flattens Portal, Positioner and Popup into one part** (`MenuPopup`, `ComboboxPopup`). It lifts the
  positioner's placement props (`anchor`, `side`, `align`, `sideOffset`, `alignOffset`, `collisionPadding`), takes
  `container` and `portalProps`, renders `useKeylineScope(false, container)`'s marker beside the portal and its probe
  inside it, and spreads `scopeProps(scope)` on the positioner. Export the styled popup on its own too when other
  components position it themselves (`MenuSurface`).
- **A field component keeps its convenience API** (`Combobox` with `options` and `loadOptions`), built from the
  exported parts in the same file. Change callbacks pass Base UI's `eventDetails` through as their last argument.
- **A button that shows only an icon requires a name in its type**: `ComboboxClear` and `ComboboxChipRemove` take
  `{ "aria-label": string }`.

## 3. Classes

### Tokens

Use the token utilities from `theme/tokens.ts` for colours (`bg-kl-cell`, `text-kl-ink-2`, `border-kl-seam`).
For sizes, fonts and weights, write the arbitrary-variable form instead of the named utility:

| Write | Not | Why |
|---|---|---|
| `h-(--kl-ctl)`, `min-h-(--kl-row)`, `px-(--kl-inset)` | `h-kl-ctl` | `cn()` can't tell that `h-kl-ctl` and a consumer's `h-10` conflict, so both stay and CSS order picks one. |
| `text-(length:--kl-text-body)` | `text-kl-body` | `cn()` reads `text-kl-*` as a colour and drops it beside `text-kl-ink`. |
| `font-(family-name:--kl-font-mono)` | `font-kl-mono` | `cn()` reads both `font-kl-*` as weights and keeps only the last. |
| `font-(--kl-weight-strong)` | `font-kl-strong` | The same. |
| `border-(length:--kl-k1)` | `border-kl-k1` | A width, not a colour. |

- **Pair size with line height in one class**: `text-(length:--kl-text-code)/[1.2]`. A font-size class removes an
  earlier `leading-*` when merged.
- **Font sizes come from the type scale** (`--kl-text-code`, `meta`, `label`, `body`, `lead`, `title`, `display`), so
  they follow density. A fixed pixel size is a bug unless the design pins it.
- **Every `cva` result goes through `cn()`**: `cn(labelVariants({ size }))`. Raw `cva` output keeps both of two
  conflicting classes.

### Variants

- `hover:` is wrapped in `@media (hover: hover)`, so it never sticks on touch.
- RTL uses `kl-rtl:` (defined in the foundation), never Tailwind's `rtl:`: `kl-rtl:` follows the nearest `dir`,
  including an LTR island inside RTL.
- No `dark:`. Colours come from tokens, which follow `.dark` (lint fails on `dark:`).
- Forced colours: `forced-colors:` with system colours (`forced-colors:bg-[Highlight]`).
- A child styles itself from its part's state with a named group: `group/menu-item` on the row,
  `group-data-highlighted/menu-item:text-inherit` on the cell.

### Edges and the cascade

- **One edge, one owner.** A part that is a cell of a row sets no border at all: the row's `.kl-cells` rule draws
  the dividers, and a border utility on the cell (even `border-0`) beats it. Frame colours apply only in the
  `control` layout.
- **Utilities beat `@layer components`.** A parent component that is not converted yet and overrides a converted
  part's property moves that rule into `@layer utilities`, keyed on attributes (`[data-slot="button"]
  [data-kl-layout="cell"]`), with a comment saying why. It goes back when the parent converts. A rule that doesn't
  compete keeps its layer and only swaps its class selector for the attribute.
- **Foundation classes stay as classes**: `kl-ctl`, `kl-frame`, `kl-cells`, `kl-edge`, `kl-attached kl-dock`,
  `kl-slot`, `kl-pending`, `kl-code`, `kl-count`, `kl-key`. They carry the construction rules that utilities can't
  express. A rule that only one component used moves into its classes; a rule shared across components moves into
  `theme/foundation.css` with a flat selector.

## 4. Tests

- **Part test** `tests/parts/<name>.browser.test.tsx`:
  - `describeConformance` over every exported part with an element, each wrapped in the context it needs (its
    Root, an open popup). A button part sets `button: true`; one Base UI keeps out of the tab order sets
    `buttonTabIndex: -1`.
  - axe, closed and open. Portal the popup into the test's `<main>` (`container`), as a page would put it in its
    landmark.
  - keyboard: Escape, and Tab out at both edges. Use text fields as the neighbours: WebKit on macOS doesn't Tab to
    buttons.
  - Remove the component's entries from `tests/parts/known-failures.ts`.
- **Page specs** select by `data-slot` and roles, never by the removed `kl-` classes. Run them in Chromium and WebKit.
- `pnpm test` checks that every `--kl-*` a part reads, including the `(--kl-x)` forms, is defined.
- **Parity.** Before you delete the CSS, dump the computed styles of the component on the specimen and the records
  app (closed and open, in default, compact-dark and comfortable-cut modes). Dump them again after converting, and
  diff the two. Each remaining difference must be invisible (a zero-width border's colour) or intended (a size now
  on the type scale).

## 5. Site and demo

- The component's page lists its parts with their Base UI names, and documents any new props (`portalProps`,
  `container`, the function `className`).
- Demos and examples use the public parts and props, and `data-slot` attribute variants for any styling
  (`**:data-[slot=button]:min-h-[44px]`), never `.kl-*` selectors.

## Worked examples

**Button** (`ui/button.tsx`): the CSS's states became attribute and pseudo-class variants on one `cva`, and the
frame colours became compound variants limited to the `control` layout.

```diff
- .kl-button[data-variant="primary"] { background: var(--kl-cobalt); border-color: var(--kl-cobalt); }
- .kl-button[data-variant="primary"]:hover { background: var(--kl-cobalt-hi); }
+ variant: { primary: "bg-kl-cobalt text-kl-on-cobalt hover:bg-kl-cobalt-hi active:not-data-disabled:bg-kl-cobalt-lo" },
+ compoundVariants: [{ layout: "control", variant: "primary", className: "border-kl-cobalt [--kl-cut-line:var(--kl-cobalt)]" }],
```

**Menu** (`ui/menu.tsx`): `MenuContent` became `MenuPopup` with the positioner flattened in, and the row rules
moved onto the rows and their cells.

```diff
- <MenuContent align="end">…</MenuContent>
+ <MenuPopup align="end" sideOffset={-2} portalProps={{ keepMounted: true }}>…</MenuPopup>
- .kl-menu-item[data-highlighted] { background: var(--kl-inverse); color: var(--kl-on-inverse); }
+ "data-highlighted:bg-kl-inverse data-highlighted:text-kl-on-inverse"
- .kl-menu-item[data-disabled] { color: var(--kl-dis); }   /* won over destructive by source order */
+ "data-[variant=destructive]:not-data-disabled:text-kl-red-text"   /* utilities have no source order to lean on */
```

**Combobox** (`ui/combobox.tsx`): the one component became parts, and the field is built from them.

```diff
- <ComboboxPrimitive.InputGroup className="kl-ctl kl-cells kl-field-frame kl-edge kl-cb-frame">
-   <ComboboxPrimitive.Input className="kl-cb-input" />
+ <ComboboxInputGroup layout={layout}>
+   <ComboboxInput id={id} placeholder={placeholder} />
- .kl-combobox[data-invalid] .kl-cb-frame { border-color: var(--kl-red); }
+ "data-invalid:border-kl-red data-invalid:[--kl-cut-line:var(--kl-red)]"   /* the input group carries field state */
```
