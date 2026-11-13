import type { KeylineItem } from "../../item";

export default {
  name: "sidebar",
  type: "registry:ui",
  title: "Sidebar (AppShell + Nav)",
  description:
    "Installs the sidebar: AppShell (the column, its toggle, collapse to an icon rail, a start sheet on narrow layouts) and Nav (groups, icon keys, nested links, row actions, identity and footer). Import from app-shell and nav.",
  whenToUse:
    "Use it for an application's sidebar of sections that can collapse to an icon rail and becomes a sheet on narrow layouts. For a website's top navigation use Navigation menu.",
  docs: '<AppShell collapse="rail" nav={<Nav layout="cell" groups={…} value={…} onValueChange={…} />}>…</AppShell>. Nested links: an item with items: [...]. Row actions: action: <Menu><MenuTrigger render={<NavAction label="More for …" />} />…</Menu>.',
  files: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/app-shell", "@keyline-ui/nav"],
  requires: {
    // an alias with no files: it installs AppShell and Nav
    registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/app-shell", "@keyline-ui/nav"],
  },
} satisfies KeylineItem;
