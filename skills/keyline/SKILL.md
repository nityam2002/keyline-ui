---
name: keyline
description: Add, compose and upgrade Keyline UI components (React + Base UI, installed from the @keyline-ui shadcn registry). Use when a project has components/keyline/, mentions @keyline-ui, or asks for Keyline components, and when updating installed Keyline items to a newer version.
---

# Keyline UI

Keyline is a shadcn registry of React components on Base UI. The shadcn CLI copies each item's source into the
project; the copied code belongs to the project and nothing updates on its own.

Requirements: React 19, TypeScript, Tailwind CSS v4 and a shadcn project (a `components.json` and the `cn()` helper).
Never convert Keyline code to Tailwind v3 or to Radix; it depends on Tailwind v4 (`@theme inline`) and Base UI.

The docs are at https://keyline-ui.dev. Read a page as Markdown with `Accept: text/markdown` or by adding `.md` to
its URL (`https://keyline-ui.dev/docs/components/button.md`). `https://keyline-ui.dev/llms.txt` indexes every page;
`https://keyline-ui.dev/llms-full.txt` holds all of them in one file. Prefer those over memory: item and part names
there are current.

## Add items

1. Work in the folder that holds `components.json`.
2. Map the namespace once (it is not in shadcn's public directory, so an unmapped add fails with
   `Unknown registry "@keyline-ui"`):

   ```bash
   npx shadcn@latest registry add @keyline-ui=https://keyline-ui.dev/r/{name}.json
   ```

3. Add items by name. Dependencies (other Keyline items, Base UI, fonts, CSS) come along:

   ```bash
   npx shadcn@latest add @keyline-ui/button @keyline-ui/toolbar
   ```

4. Use them from `@/components/keyline/ui/<name>` (with the project's alias in place of `@`), for example
   `Button` from `@/components/keyline/ui/button`.

Find an item's name, parts and props on its docs page, or list everything in `https://keyline-ui.dev/r/registry.json`.

## Compose

- Use Keyline's own parts before writing markup: a toolbar is `Toolbar`, a record list is `Table` or `DataTable`,
  a side panel is `Inspector` or `Panel`, a page frame is `AppShell`. Check the docs index before building one.
- Pass props and Tailwind classes. Do not style Keyline's internal class names or reach into its DOM; they are not
  public API and change between versions.
- Controls sit in frames; a control inside another component's frame takes `layout="cell"` where the docs offer it,
  so one keyline owns each edge (see the Composition guide).
- Theme with the source tokens on the Theming page and the colour-role utilities (`bg-kl-cell`, `text-kl-ink-2`),
  not raw colours. Dark mode, density and direction are classes or attributes (Modes guide).
- `render` replaces the rendered element (Base UI's composition prop); there is no `asChild`.

## Upgrade

Installed items do not update themselves. To upgrade:

1. Read `https://keyline-ui.dev/r/versions.json` (each item's current `version`, `updated` date and `changelog`).
   If it is not served yet, read each installed item's `https://keyline-ui.dev/r/<name>.json` instead.
2. List what is installed: the files under `components/keyline/` (`ui`, `lib`, `blocks`, `theme`), and the version
   each was installed at if the project recorded it (a `keyline.lock.json` or the commit that added it).
3. For each item whose version is newer, read its changelog entries between the installed and current versions.
   Each breaking entry names what changed and what to do; apply those instructions to the project's own call sites.
4. Note local edits before overwriting: diff the installed files against the registry content you fetched for the
   installed version, if you have it. Keep the project's intentional changes.
5. Re-add the items with `npx shadcn@latest add @keyline-ui/<name> --overwrite`, then re-apply the local edits.
6. Run the project's typecheck, lint and tests. Fix call sites the changelog named; do not pin or patch around a
   breaking change.
7. Report what changed per item: versions, breaking entries applied, and local edits kept.
