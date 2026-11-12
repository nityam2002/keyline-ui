# Keyline design model

This is the model every Keyline component follows, and the rules a new component must meet. Consumer-facing
setup is in [usage.md](usage.md); per-component APIs are on the documentation site (`npm run site:dev`).

## The idea

> **A component is an instrument panel: one frame, divided into cells, where every keyline is shared and
> every state change happens inside a cell.**

The cut is not the idea; it is an optional accent, off by default. The idea is carried by five things that
all hold with `--kl-cut: 0`:

| | Carrier | Rule |
|---|---|---|
| C1 | **Attached or apart** | Related parts touch and share one keyline (gap 0). Unrelated parts sit one full gutter apart (`--kl-gutter`, 12px or more). No 4–8px "nearly touching" gaps. A split button, a field and its unit, a toolbar, a bulk bar and a pager are each one frame with cells. |
| C2 | **Weight says what a box is** | Region frame 3px (`--kl-k3`) · standalone control 2px (`--kl-k2`) · cell keyline 1px (`--kl-k1`). Weight is set by role, never by size or taste. |
| C3 | **One edge, one owner** | Two cells never both draw a shared edge. Keylines meet in clean T- and L-junctions. Corners are square; there is no radius in the language. |
| C4 | **Signal floods** | State is shown by filling a whole cell with one of four signals. No tints for state, no outlines for selection, no colour that means nothing. |
| C5 | **Two voices** | The **Count** (`kl-count`: strong weight, tabular, large) and the **Code** (`kl-code`: mono 11px for IDs, units, row numbers). Everything else is the plain UI voice. |

Motion is the sixth carrier: state arrives in a cell from where you acted, and moves within a frame without
crossing a keyline.

```
┌──────────────────┬────┐   button: 2px frame · strong label · square corners
│ Assign carrier   │ 3  │   affix cell divided by a 1px keyline
└──────────────────┴────┘   press: contents travel 1px, the frame never moves

┌────┬────────────────┬────┐   field: the unit is a cell, not placeholder text
│ !  │        12,004.0│ kg │   invalid: a red ! cell is inserted at the start
└────┴────────────────┴────┘
```

## Construction

- **Frames and controls.** `.kl-frame` is a region (3px, cell background); `.kl-ctl` is a control (2px).
  Both get their weight from `--kl-bw` and have `border-radius: 0`.
- **Layout is declared, never inferred.** A control that can sit inside another frame takes
  `layout?: "control" | "cell"` and renders `data-kl-layout`. `cell` gives up its border, cut and background,
  and stretches to the cell; the frame's keylines are its edges. No rule may drop a border because of an
  ancestor.
- **Rows of cells own their dividers.** `.kl-cells` (inline) and `.kl-rows` (block) draw a 1px divider on
  every child but the first. A cell control never draws its own.
- **Docked surfaces continue their owner.** A menu, listbox or date panel docked to a trigger has no cut and
  takes the owner's weight on the shared edge: 2px from a standalone control, 1px from a cell.
  `dockGeometry(layout)` in `src/registry/keyline/lib/keyline-scope.ts` is the one place that decides the offsets; use it for any
  new docked surface. A docked panel is capped at the available height and scrolls inside.
- **Widths are equal or clearly different, never nearly equal.** A docked end closer than `--kl-snap` (48px)
  to the owner's end snaps to it.
- **Long content stays inside.** A long label wraps inside its frame; affix cells keep full height. A row of
  cells that does not fit scrolls inside its own frame (`useScrollEdges` marks the hidden edge). The page
  never scrolls sideways.
- **Narrow layout belongs to the component**, measured with a container query on the component, never the
  viewport.
- **Glyphs are drawn, and survive forced colours.** Status shapes and ticks are built from borders or masks;
  a check mark is not a direction and never mirrors in RTL. Numeric ranges are bidi-isolated.

## Signals

| Signal | Source token | Job, and only this job | Text on it |
|---|---|---|---|
| **Yellow** | `--kl-working` | The working set: data you are about to act on (selected rows, tokens, a date range, pressed toggles) | dark |
| **Cobalt** | `--kl-commit` | Location and commitment: current nav item, view, step, the primary action; also focus | white |
| **Ink** (`--kl-inverse`) | neutral | The current choice among exclusive options, and the cursor (active option, menu item) | `--kl-on-inverse` |
| **Red-orange** | `--kl-attention` | Attention: invalid, failed, destructive, overdue | white |

- A button performs an action and holds no state, so it never floods. Its outcome arrives as a signal cell.
- Undo is an action, not a selection; an exclusive setting (density) is ink, not yellow.
- Budget: at most one persistent yellow region per pane and one cobalt primary per region.
- Every signal has a non-colour cue: a lamp, a glyph, position or `aria-*`.
- Selected text never changes weight.
- **Lamps** (a 10px border-drawn square, hollow off, solid on) mark independent binary state only. Exclusive
  choices use the moving band instead.
- **Hatch** (`--kl-hatch`) means out of service only. Loading is a running keyline segment; disabled is hatch
  plus a dimmed frame, with the reason as a description, never strikethrough (except unavailable dates).
- **Codes appear only when something refers to them** or a key triggers them: row numbers an inspector cites,
  command digits, field codes in messages. Never as decoration on labels.

## Shape: the cut

One knob, `--kl-cut`, from 0 to 1 (0 off · 0.5 quiet · 1 full). Square is the default. It is a custom
property, so it inherits and can be set on any subtree; `data-kl-cut="off" | "quiet" | "on"` sets it too.

| Role | Cut at `--kl-cut: 1` (default density) |
|---|---|
| Region frame | `--kl-cut-region` 18px |
| Control frame | `--kl-cut-control` 9px |
| Small control | `--kl-cut-nested` 5px |
| Cell, `layout="cell"` control, attached surface, tooltip, skeleton, chart, badge, checkbox | never, by construction |

- Only the **top-start** corner is cut, and it mirrors in RTL.
- **Cut is not radius.** `--kl-cut` never produces a rounded corner, and Keyline never touches shadcn's
  `--radius` unless the app opts in with `keyline-shadcn`.
- **Removing the cut removes everything that serves it.** Reserved corner space is `inset + cut × size`,
  which collapses to the plain inset. No cover element exists in any configuration.
- **Engines.** Where `corner-start-start-shape: bevel` is supported it draws the cut. Elsewhere a
  `clip-path` polygon clips the corner and a gradient draws the diagonal keyline, with no knowledge of the
  backdrop. Known limitation: there, a focus outline stops at the diagonal.
- A local override (`data-kl-cut="off"`) is for compositions only, such as a frame over an image or flush
  against a cut parent's corner. There is no per-component cut prop.
- Density scales cut sizes; theme, RTL and motion read no cut values.
- The cut must be equally crafted on and off: every component is reviewed in both.

## Motion

**The rule:** motion happens inside a frame and along keylines. Frames don't move, scale or bounce. Semantics
commit first; motion explains them afterwards. Never two behaviours on one transition.

| Behaviour | Used for | Mechanics |
|---|---|---|
| **Key** | Press and release | Contents travel 1px (`--kl-key-y`) and the fill darkens at pointerdown; a coloured fill deepens its own colour (`--kl-cobalt-lo`, `--kl-red-lo`), never turns ink. The frame and its cells stay put. Releases on the next frame. |
| **Flood** | A cell's own state toggles (check, toggle on, row selected, command run) | The fill grows from the input point with `clip-path: circle()` (`--kl-t-flood` 140ms, ease-out), from the leading edge for keyboard. Retracts toward the same point (`--kl-t-unflood` 110ms). A held press shows a seed (`--kl-flood-seed` 7px). |
| **Stretch** | Selection moves between cells of one group (segmented, tabs, nav, radio, carousel position, range endpoint) | One band. The leading edge settles in `--kl-stretch-lead` (100ms), the trailing edge in `--kl-stretch-trail` (220ms): critically damped springs, zero bounce, clamped inside the frame, retargeting from current position and velocity. A held press leans the band toward the pressed item (`--kl-stretch-tug`, 12px). The move is planned up front and played as transform animations on the compositor, so a long task on the main thread (a route commit, a lazy mount) never freezes it mid-stretch. Labels read covered exactly where the band is: a covered copy of the labels rides inside it, and the real labels take the covered colours when it lands. Keyboard moves land the leading edge at once. |
| **Unfold** | Expansion and docked surfaces (menu, listbox, date panel, row detail, accordion) | Grows from the owner's shared keyline (`--kl-t-unfold` 160ms); the owner never moves. Folds back to the same keyline (`--kl-t-fold` 120ms). |
| **Signal** | Pending, done, failed, recovered | Pending: a segment runs along the inside of the bottom keyline. Done: a ✓ cell floods yellow for 900ms. Failed: a red `!` cell is inserted. Recovered: the cell retracts. |

- Flood is for a cell's own state; stretch is for a choice moving within a group. A segmented control
  stretches and does not flood; a toggle group floods and does not stretch.
- No staggers: twelve rows flood together.
- No animation over 220ms on an everyday action. Nothing waits for an animation.
- No shadows, gradients, glows, counters that tick up, or confetti.
- **Every timing is a token** and `keyline-motion` reads them (`tokenMs`, `useStretch`). No component
  hard-codes a duration. `data-kl-motion="reduce"` and `prefers-reduced-motion` zero them all: every behaviour
  becomes an instant state change, and pending becomes a static hatched segment.
- **Performance is part of the bar.** An idle page does no work; infinite animations (pending, progress,
  skeleton) animate only `transform` or `opacity`. A closed overlay reads no styles. Handlers read, then
  write, and only on change. State lives where it changes.
- Rejected: overshoot (it crosses a rigid keyline and reads as a glitch), body compress (`scale(.97)`),
  drawn connectors between panes, and reduced-motion emphasis rings (a full-cell flood is already salient).

## Colour hierarchy

Components name a **role**; `keyline.css` decides its tone per theme. No per-component dark overrides.

| Role | Tokens | Purpose |
|---|---|---|
| Surfaces | `paper` < `cell` < `raised` < `tint` < `press` | Page, panel/control, overlay, hover, press |
| Text | `ink` > `ink-2` > `ink-3` | Primary, secondary, supporting |
| Edges | `line` > `seam` > `line-soft` | Frames and control boundaries (3px/2px) · 1px dividers inside a frame · decorative row rules |
| Fill | `inverse` / `on-inverse` | The ink role painted as a fill (cursor, checked, tooltip, toast) |

- **Light and dark are tuned, not mirrored.** Every neutral interpolates on `--kl-dark` (0 or 1) with its own
  lightness per theme. In light every edge is ink: the black keyline is the identity. In dark, surfaces lift
  off black, text stops short of white, and each edge role steps down in tone, because a light line on a dark
  ground reads heavier.
- **Weights carry the role; tone supports it.**
- **Targets.** Text ≥ 4.5:1. `line` and `focus` ≥ 3:1 against page and overlay (SC 1.4.11). `seam` ≥ 3:1
  against cell and raised, because it can be the only edge between two toolbar buttons. `line-soft` is
  decorative and never the only cue.
- **Overlays lift what they hold:** an overlay sets `--kl-cell: var(--kl-raised)`.
- **Signal foregrounds are chosen by lightness** (white below L 0.575). Dark commit and attention fills lift
  no higher than L 0.54 and lose a little chroma, so that threshold holds and fills don't out-shout text.
  `roleColor()` in `keyline-config` fits free hues the same way.
- **Data colours are roles, not a rainbow:** focal (`data-1`), comparison (`data-2`), the rest (`data-3`),
  a marked value (`data-mark`), a breach (`data-alert`). `ChartFigure` offers a table view of the same rows, which covers series whose marks are low-contrast.
- **Mix colours in oklab**, not oklch: hue interpolation in oklch turns a red tint blue.

## Focus

One owner, one indicator, `:focus-visible` only, in `--kl-focus`.

| Element | Indicator |
|---|---|
| Standalone control (button, trigger, checkbox, switch, link) | 2px ring outside the frame (`--kl-ring-out`) |
| Cell, or something that fills one (cell buttons, rows, days, tabs, segments, menu items) | 2px ring flush inside the cell's own edges (`--kl-ring-in`); an outside ring would cross the shared keyline |
| Text-entry frame (`.kl-edge`: fields, select/picker triggers, table search) | No ring: the frame's own border turns the focus colour, with a `--kl-edge-band` band inside it, so it reads as one thicker edge that follows the cut. Drawn by a pseudo-element: nothing moves or overflows |

- **Never `:focus-within`.** Base UI returns focus to a trigger programmatically after a pointer choice; that
  is not `:focus-visible`, and must not draw a ring. A clicked text field does show its edge, because the
  caret is there.
- **One indicator per composite.** A button cell inside a field frame draws its own inset ring, never the edge.
- **A ring on a fill takes the fill's text colour** (`currentColor`, via `data-kl-covered` or
  `data-kl-ring="on-fill"`), which already holds contrast against the fill.
- **Open is not focus.** An open trigger shows the inverse caret cell, not a ring.
- **Invalid, focus, open and selected coexist and stay distinct**: red border + `!` cell, focus edge, inverse
  caret, yellow.
- **Forced colours:** rings and focused edges become `Highlight`; glyphs use `CanvasText`/`Highlight`.
- Focus-related rules use `:where()` to keep specificity fixed, so state rules win in any install order.

## Accessibility commitments

- The target is WCAG 2.2 AA in both themes, in every density and cut setting, in RTL and with reduced motion.
- Every state has a non-colour cue; on and off differ by more than colour (SC 1.4.1).
- Behaviour, roles and keyboard handling come from the primitive (Base UI, or the wrapped library). Keyline
  adds names, descriptions and announcements the primitive leaves to the author, and does not patch the
  primitive's keyboard model.
- Composite widgets are one Tab stop where the pattern says so (toolbar, radio group); disabled items in a
  toolbar stay focusable so the row's shape is learnable.
- **A closing surface is inert**, so a resting pointer can't pull focus into it.
- **When an action hands off to another surface** (menu → confirmation), the closing surface does not return
  focus; the new surface's safe action receives it.
- **Focus never falls to the page:** when the focused item leaves (removed, folded into More), focus moves to
  a neighbour.
- Supplementary surfaces say so: HoverCard holds nothing that is not on the linked page; a context menu is
  never the only path to an action.
- Draggable things have a pointer alternative (SC 2.5.7).
- Text takes its own direction; RTL mirrors layout and arrow keys, not glyphs.

## Foundations: Base UI and wrapped libraries

- **Base UI is the primitive layer.** It is unstyled, owns behaviour, ARIA and keyboard models (menus,
  dialogs, toolbar, scroll area, forms, fields, drawer, toast), and composes through `render` props, which
  lets Keyline add cells and frames without forking behaviour. Keyline's CSS styles its state attributes.
- **Wrap the maintained library; draw it in Keyline.** Where the reference libraries (shadcn and its
  ecosystem) build on a library, Keyline wraps the same one, pinned exactly, and never re-implements its
  behaviour:

  | Component | Library | What the library owns |
  |---|---|---|
  | Resizable | `react-resizable-panels` | Separator ARIA, keys, collapse, double-click reset, touch targets, persistence |
  | Calendar, DatePicker, DateRange | `react-day-picker` | Grid, roving focus, keys, disabled-day skipping, RTL keys, month navigation |
  | Chart | `recharts` | Rendering, the keyboard accessibility layer |
  | Carousel | `embla-carousel-react` | Dragging, snapping, scrolling |
  | Message scroller, Questionnaire | `@shadcn/react` | Log behaviour, stick-to-newest; multi-step form flow |
  | Command | `cmdk` | Filtering, active-item scrolling |

  Keyline adds construction, tokens, RTL, reduced motion and the accessibility the library leaves to the
  author. Hand-written behaviour drifts from platform conventions, misses edge cases the library has fixed,
  and has to be re-tested in every engine; a wrapped library stays current by updating a pin.
- **Primitive scrollers keep their own DOM.** Select, Multiselect, Menu and Command lists stay native because
  the primitive owns their scroll position; they share the Scroll Area's tones through one CSS rule.

## Rules for a new component

1. Build on a Base UI primitive or the library the references use; don't hand-code behaviour.
2. Declare its role: region (`.kl-frame`), control (`.kl-ctl`) or cell. If it can sit in another frame,
   accept `layout="control" | "cell"`.
3. One edge, one owner: let the row of cells draw dividers; never double a line.
4. Name colour roles, never colours. No per-component dark values.
5. Use the five motion behaviours and their tokens only; never a hard-coded duration.
6. Pick the focus placement by role (outside, inside, or edge) from the tokens.
7. Overlays: carry configuration with `useKeylineScope` / `scopeProps`, use `--kl-z-overlay`, dock with
   `dockGeometry`.
8. Write only Keyline's own names. Outermost elements carry Keyline type; components that reset
   `font: inherit` re-state `font-family: var(--kl-font)`.
9. Never depend on CSS order across items: the CLI appends CSS in install order. Where two items' rules meet,
   the owning rule gets one more class, or the shared rule uses `:where()`.
10. Measure narrow layouts on the component, and keep the page from scrolling sideways.
11. Work in light and dark, every density, cut off and on, RTL, reduced motion and forced colours.
12. Register it in its `<name>.meta.ts`. Dependencies are derived from imports and from the `kl-` classes
    it uses; the build fails on a missing file, an import outside the registry, an ambiguous class owner, a
    CSS rule that does not reach its item, or declared dependencies that differ from the derived ones.
