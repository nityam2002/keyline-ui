# Review

The checklist for anyone reviewing a Keyline pull request, human or agent. Keyline ships copy-paste items through
a shadcn registry: what a consumer gets is the code in `site/public/r/` at the moment they run `shadcn add`. A
failure is an item that installs broken or incomplete, behaves differently from its docs or across engines,
breaks people who already copied it, or drifts from the design model.

The rules themselves live in [docs/design.md](docs/design.md), [docs/recipe.md](docs/recipe.md) and
[.github/CONTRIBUTING.md](.github/CONTRIBUTING.md). This page says what to check; read those for why.

## Checks

CI runs every check as a job, and the `ci` check passes only when all of them did
([CONTRIBUTING, "Continuous integration"](.github/CONTRIBUTING.md#continuous-integration)). Do not restate a
failing job's output as a finding; point at the job. Read the advisory **Visual parity** job's report when the
change claims not to alter the look.

## What to look for

- **The recipe** ([docs/recipe.md](docs/recipe.md)). Parts are named as Base UI names them and each wraps one
  Base UI part, passing every prop through; `className` and `style` go through `resolveClassName` and
  `resolveStyle`; a popup flattens Portal, Positioner and Popup and carries the scope; a modal flattens Portal,
  Backdrop and Popup. No `ui/<name>.css` for a converted component.
- **The attribute contract.** `data-slot` is set after the spread props and names the part that renders the
  element. Variant props are mirrored as `data-*` attributes through `dataAttrs`; Base UI's own state attributes
  are styled directly, never shadowed by a parallel one. A removed or renamed export, `data-slot`, `data-*`
  attribute or CSS custom property is a breaking change: the item's latest `changelog[]` entry must say
  `breaking: true` with the migration fields.
- **The fixed rules in [docs/design.md](docs/design.md)**, "Rules for a new component" and "Foundations":
  behaviour comes from Base UI or the wrapped library, pinned exactly, never hand-coded; one edge, one owner;
  colour roles, not colours, and no per-component dark values; the five motion behaviours and their tokens, never
  a hard-coded duration; focus placement by role; no dependence on CSS order across items. It works in light and
  dark, every density, cut on and off, RTL, reduced motion and forced colours.
- **Accessibility** ("Accessibility commitments" in design.md). Roles, names, `aria-*` state, focus management and
  keyboard support match the WAI-ARIA pattern; an icon-only button requires a name in its type. A new
  known failure in `tests/parts/known-failures.ts` needs a reason.
- **What installs.** An item whose shipped files changed is rebuilt (`site/public/r/` committed), bumped, and has a
  `changelog[]` entry. Its meta declares what the source imports; anything the build cannot see is under
  `requires` with a reason.
- **Tests.** New behaviour has a part test and page specs in every engine. A check is never loosened to pass: no
  wider tolerance, no retry, no `test.skip` without the engine limitation that requires it. A fix for a
  position- or timing-dependent failure removes the bias and shows the guard failing on the old code.
- **Public API in demos, the site and consumer tests.** Props, Tailwind utilities, `kl-` role utilities and
  `data-testid` hooks; never an internal `.kl-*` selector. The site is built from Keyline's own components.
- **Docs match the code.** A new prop, part or behaviour appears on the component's page and in its example; a
  removed one is gone from them.
- **Fixes name the cause.** A bug fix says what caused it and fixes that, not the symptom.
- **Workflows.** A change under `.github/workflows/` keeps actions pinned to a full SHA with a version comment,
  `permissions` per job, `persist-credentials: false`, a `timeout-minutes`, no `pull_request_target`, and every
  required job in the `ci` job's `needs`.

## Skip

- Formatting and anything oxlint enforces.
- `pnpm-lock.yaml`, `CHANGELOG.md`, `site/public/r/`, `registry.json` and the generated theme files, except to
  confirm they were regenerated.

## Format

- Start with a count: `N important, N nit, N pre-existing`. Say plainly when nothing needs fixing.
- Every finding gives `file:line` and the input, state, engine or mode that breaks.
- At most three nits.
