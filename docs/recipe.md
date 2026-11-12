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
- **A modal flattens Portal, Backdrop and Popup** (`DialogPopup`, `SheetPopup`, `AlertDialogPopup`). It has no
  positioner to carry the scope, so the backdrop spreads `scopeProps(scope)` and the popup sits in a
  `<div {...scopeProps(scope, { className: "contents" })}>`, which configures it without a box of its own. Export the
  backdrop too (`DialogBackdrop`). Drawer adds Base UI's Viewport to the same part; its root renders the marker,
  because the root needs the direction to pick its physical swipe side.
- **A part that is another Keyline component** (`DialogBody` is a Scroll Area) sends `className` and `style` to that
  component's root, resolved with an empty state, and takes a second prop for what it holds (`contentClassName`).
  A component that reuses another's whole popup (Command's dialog is `DialogPopup`) passes its own classes in
  `className`; `cn()` drops the popup's conflicting ones.
- **A field component keeps its convenience API** (`Combobox` with `options` and `loadOptions`), built from the
  exported parts in the same file. Change callbacks pass Base UI's `eventDetails` through as their last argument.
- **A display component composes from its parts too** (`Progress`, `Meter`): its props are a union of the
  convenience props (`label`, `detail`) and `children` (the parts). A wrapper that only laid out parts (a head row
  for the label and the value) becomes a grid on the root, so composed parts are its direct children and land in
  the same cells: `grid-cols-[minmax(0,1fr)_auto]` with the label in column 1, the value in column 2, and the
  track `col-span-full`. A state the parts need that Base UI doesn't carry (`failed`) goes on the root as an
  attribute (`data-failed`) for a named group (`group-data-failed/progress:`), and through context for content.
- **A preset over another component's parts** (`Multiselect` is Combobox with `multiple`) exports no parts of its
  own. It imports the other component's parts, depends on that item in its meta, and restyles them only through
  `className` on each part and slot variants from the row (`**:data-[slot=combobox-item-indicator]:…`), never by
  forking them. Its own elements (a count cell, a list head) take `data-slot`s under its name. Its root is a Base
  UI `Field.Root` with `Field.Label`, as the other component's field is, so the label stays the input's name
  while the list is open. The part test runs the preset's keyboard, axe and style guards; the parts' contract
  is the other component's test.
- **Parts of a library that is not Base UI** (cmdk's `Command`) keep that library's names and props. They take no
  `render` and no function `className`, so their part test checks what they do forward (props, ref, `className`,
  `data-slot`) and runs `describeConformance` only over the parts Keyline renders itself (`CommandFooter`).
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
- **Write every class out literally.** Tailwind generates only the classes it finds as text in the source, so a
  class built in a template or helper (`${side}:min-w-3`) is never generated. Repeat the class instead.
- **A `font` shorthand also reset what it didn't name.** `font: 500 11px/1 var(--kl-font-mono)` set
  `font-variant-numeric` and `font-style` back to normal; the utilities don't, so add `normal-nums not-italic`
  where the part must not inherit them (a code badge in a tabular row).
- **The foundation's focus ring keys on a `kl-` class.** A part with none (Hover Card's trigger is a plain link with
  utilities) writes its own: `focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-2
  focus-visible:outline-kl-focus focus-visible:outline-solid`.
- **Reduced motion zeroes the `--kl-t-*` tokens, nothing else.** A duration that doesn't come from them (the hover
  card's underline runs for its open delay) adds `motion-reduce:transition-none
  in-data-[kl-motion=reduce]:transition-none`.
- **Where clip-path is the cut, a clip-path entrance erases the corner.** Unfold with clip-path only under
  `supports-[corner-start-start-shape:bevel]:`, and fade under `not-supports-[corner-start-start-shape:bevel]:`.
  Chromium and WebKit both support corner shapes, so only Firefox runs the fade.

### Variants

- `hover:` is wrapped in `@media (hover: hover)`, so it never sticks on touch.
- RTL uses `kl-rtl:` (defined in the foundation), never Tailwind's `rtl:`: `kl-rtl:` follows the nearest `dir`,
  including an LTR island inside RTL.
- No `dark:`. Colours come from tokens, which follow `.dark` (lint fails on `dark:`).
- Forced colours: `forced-colors:` with system colours (`forced-colors:bg-[Highlight]`).
- A child styles itself from its part's state with a named group: `group/menu-item` on the row,
  `group-data-highlighted/menu-item:text-inherit` on the cell.
- **A `font:` shorthand reset more than it set.** It put `font-variant-numeric` (and `font-style`) back to
  `normal`, so a mono label or digit cell inside a tabular list needs `normal-nums not-italic` beside its font
  utilities, or it inherits the list's tabular figures.
- **Container breakpoints keep the stylesheet's inclusive bound.** A part that is its own size container
  (`@container/kl-empty`) writes its narrow rules as `[@container_kl-empty_(max-width:520px)]:…`.
  `@max-[520px]/kl-empty:` compiles to `width < 520px`, which moves the bound by a pixel.
- **`in-data-[…]:` adds no specificity**: it compiles to `:where([data-…]) &`. An ancestor setting that must
  outrank another variant on the same property (compact density over a container query) is written as a
  descendant selector, `[[data-kl-density=compact]_&]:min-w-32`, one attribute more. Use `in-data-` where nothing
  competes (`in-data-[kl-motion=reduce]:`).

### Edges and the cascade

- **One edge, one owner.** A part that is a cell of a row sets no border at all: the row's `.kl-cells` rule draws
  the dividers, and a border utility on the cell (even `border-0`) beats it. Frame colours apply only in the
  `control` layout.
- **Utilities beat `@layer components`.** A parent component that is not converted yet and overrides a converted
  part's property moves that rule into `@layer utilities`, keyed on attributes (`[data-slot="button"]
  [data-kl-layout="cell"]`), with a comment saying why. It goes back when the parent converts. A rule that doesn't
  compete keeps its layer and only swaps its class selector for the attribute.
- **A flood owns the filled state.** A `kl-flood` part (Toggle, ToggleGroupItem) sets its own background and text
  colour only while it is off (`not-data-pressed:bg-kl-cell`): a utility would beat the foundation's flood fill.
  Change the fill through its variables (`data-disabled:data-pressed:[--kl-fc:var(--kl-press)]`).
- **A container that sizes its parts wins by specificity, not order.** The part sets its size variables with plain
  classes (`[--kl-av:32px]`); the container keys a child rule on the part's slot (`*:data-[slot=avatar]:…`, one
  attribute more), which beats them in any order. Don't pass the size through context when the part can also sit
  in a portal under the container (a popover's list inside AvatarGroup).
- **A stretch row styles each element on itself.** The stretch engine clones the row for a move and drops the
  clone's `data-slot`, so a rule keyed on a part's slot (`**:data-[slot=…]`) misses the clone. Give each item its
  classes, pass sizes down through context, and key covered labels on `data-kl-covered`. The clone keeps a hidden
  placeholder for the band in first place, so position rules count children (`[&>:nth-child(2)]:` for the first
  cell after the band) rather than read the band's markers.
- **Know which element is the outermost Keyline element.** The foundation gives Keyline's type and ink to the first
  element with a `kl-` class and no `kl-` ancestor, and a `kl-rtl:` utility counts as one. When a part's root carries
  no foundation class (a toast on its ink fill, a portalled viewport), the outermost element is somewhere inside it
  and turns ink: put Keyline's type and ink on the portalled root, and `text-inherit` on inner `kl-` elements that sit
  on a coloured fill.
- **Foundation classes stay as classes**: `kl-ctl`, `kl-frame`, `kl-cells`, `kl-edge`, `kl-attached kl-dock`,
  `kl-slot`, `kl-pending`, `kl-code`, `kl-count`, `kl-key`. They carry the construction rules that utilities can't
  express. A rule that only one component used moves into its classes; a rule shared across components moves into
  `theme/foundation.css` with a flat selector.
- **A component whose rules other components share** (Field: Select, NumberField, OTP field, Time field, Date
  picker, Slider and more draw `kl-field-frame`, `kl-field-input`, `kl-field-bang`) moves those rules into the
  foundation under its own heading, and its classes stay. That includes rules consumers reach through an attribute
  (`.kl-field-input[data-align="end"]`, which NumberField sets) and the parent-state rules (`.kl-field[data-invalid]
  .kl-field-frame`). Only the parts nobody else draws become utilities. Check every consumer's markup, not only its
  CSS, before calling a rule "own".
- **An unconverted component that draws a converted one's look over its own markup** (Questionnaire draws radio
  rows, checkbox boxes and field messages over its native inputs) imports the converted component's exported style
  constants (`radioStyles`, `checkboxStyles`, `choiceStyles`, `fieldStyles`, as `toggleVariants` is for Toggle) and
  puts the state attributes those utilities read (`data-checked`, `data-unchecked`, `data-disabled`) on its own
  elements. Its own overrides of those utilities go to `@layer utilities`, as above.

## 4. Tests

- **Part test** `tests/parts/<name>.browser.test.tsx`:
  - `describeConformance` over every exported part with an element, each wrapped in the context it needs (its
    Root, an open popup). A button part sets `button: true`; one Base UI keeps out of the tab order sets
    `buttonTabIndex: -1`. A part that renders after an event (Base UI's `Avatar.Image`, once loaded) passes
    `ready`, which the harness awaits after mounting.
  - axe, closed and open. Portal the popup into the test's `<main>` (`container`), as a page would put it in its
    landmark.
  - keyboard: Escape, and Tab out at both edges. Use text fields as the neighbours: WebKit on macOS doesn't Tab to
    buttons. To reach a native `<button>` the component renders itself (a dismiss cell, an Item rendered as a
    button), press Option+Tab in WebKit, the key a Safari user presses for the same order:
    `const TAB = server.browser === "webkit" ? "{Alt>}{Tab}{/Alt}" : "{Tab}"`.
  - axe judges the part's markup, not Base UI's: `tests/parts/axe.ts` leaves out Base UI's focus guards, including
    as disallowed children of a composite (a menubar's menus write their portal, and so the guards, inside the
    menubar). For markup Base UI hides on purpose in one state (a toast's close cell is `aria-hidden` until the
    stack expands), pass those elements as `exclude` in that state, say why, and judge everything in the state
    where it is shown.
  - a keyboard command the browser turns into an event (Shift+F10 and the Menu key fire `contextmenu`) doesn't
    happen for synthetic key presses in every engine: send the event the browser would, and press the real key
    where the engine delivers it (`it.runIf(server.browser === "chromium")`).
  - modal (dialog, sheet, drawer): Base UI makes the page inert while it is open, so judge the open state with axe
    on the popup. Test the focus trap at its two ends: Tab from the last control lands on the first, Shift+Tab
    from the first on the last.
  - a position guard measures after the entry has landed: wait for `data-starting-style` to go and for
    `popup.getAnimations()` to finish, not for a time. Give the fixture whole-pixel rows and line heights, so the
    edges it compares are whole.
  - style guards: prove each one fails by breaking the class it guards, then restore it. A guard that compares
    parts with each other can pass on broken code (size-contained stats with no flex basis all collapse to the same
    width); assert the expected value.
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
