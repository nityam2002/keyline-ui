/**
 * The component catalogue as the docs index lists it. Every entry names the registry item it installs
 * (`item`, checked against site/public/r/registry.json by scripts/site-check.mjs) and `href` only where a page exists.
 * Related APIs that ship inside another item are listed where a reader looks for them, under their own
 * name: Alert dialog (in dialog), Sidebar (app-shell + nav), Badge (in status), Meter (in stat).
 * Calendar and DateTimePicker share the "Date picker and calendar" page; Meter shares "Stat and meter". Every catalogue entry has a page.
 */
export type Entry = { name: string; item: string; href?: string; description?: string }
export type Group = { group: string; items: Entry[] }

const page = (name: string) => `/docs/components/${name}`

export const CATALOG: Group[] = [
  {
    group: "Actions",
    items: [
      { name: "Button", item: "button", href: page("button") },
      { name: "Button group", item: "button-group", href: page("button-group") },
      { name: "Split button", item: "split-button", href: page("split-button") },
      { name: "Toggle", item: "toggle", href: page("toggle") },
      { name: "Toggle group", item: "toggle-group", href: page("toggle-group") },
      { name: "Toolbar", item: "toolbar", href: page("toolbar") },
      { name: "Menu", item: "menu", href: page("menu") },
      { name: "Menubar", item: "menubar", href: page("menubar") },
      { name: "Context menu", item: "context-menu", href: page("context-menu") },
    ],
  },
  {
    group: "Inputs",
    items: [
      { name: "Field and form", item: "field", href: page("field") },
      { name: "Checkbox", item: "checkbox", href: page("checkbox") },
      { name: "Checkbox group", item: "checkbox-group", href: page("checkbox-group") },
      { name: "Radio group", item: "radio-group", href: page("radio-group") },
      { name: "Switch", item: "switch", href: page("switch") },
      { name: "Slider", item: "slider", href: page("slider") },
      { name: "Segmented", item: "segmented", href: page("segmented") },
      { name: "Select", item: "select", href: page("select") },
      { name: "Native select", item: "native-select", href: page("native-select") },
      { name: "Combobox", item: "combobox", href: page("combobox") },
      { name: "Multiselect", item: "multiselect", href: page("multiselect") },
      { name: "Number field", item: "number-field", href: page("number-field") },
      { name: "OTP field", item: "otp-field", href: page("otp-field") },
      { name: "Time field", item: "time-field", href: page("time-field") },
      { name: "Date picker and calendar", item: "date-picker", href: page("date-picker") },
      { name: "Date range", item: "date-range", href: page("date-range") },
    ],
  },
  {
    group: "Data",
    items: [
      { name: "Table", item: "table", href: page("table") },
      { name: "Chart", item: "chart", href: page("chart") },
      { name: "Stat and meter", item: "stat", href: page("stat") },
      { name: "Status and badge", item: "status", href: page("status") },
      { name: "Progress", item: "progress", href: page("progress") },
      { name: "Skeleton", item: "skeleton", href: page("skeleton") },
      { name: "Empty", item: "empty", href: page("empty") },
      { name: "Avatar", item: "avatar", href: page("avatar") },
      { name: "Kbd", item: "kbd", href: page("kbd") },
      { name: "Marker", item: "marker", href: page("marker") },
    ],
  },
  {
    group: "Navigation",
    items: [
      { name: "Tabs", item: "tabs", href: page("tabs") },
      { name: "Breadcrumb", item: "breadcrumb", href: page("breadcrumb") },
      { name: "Pagination", item: "pagination", href: page("pagination") },
      { name: "Nav", item: "nav", href: page("nav") },
      { name: "Navigation menu", item: "navigation-menu", href: page("navigation-menu") },
      { name: "Command menu", item: "command", href: page("command") },
    ],
  },
  {
    group: "Overlays",
    items: [
      { name: "Dialog", item: "dialog", href: page("dialog") },
      { name: "Alert dialog", item: "alert-dialog", href: page("alert-dialog") },
      { name: "Drawer", item: "drawer", href: page("drawer") },
      { name: "Sheet", item: "sheet", href: page("sheet") },
      { name: "Popover", item: "popover", href: page("popover") },
      { name: "Hover card", item: "hover-card", href: page("hover-card") },
      { name: "Tooltip", item: "tooltip", href: page("tooltip") },
      { name: "Toast", item: "toast", href: page("toast") },
      { name: "Notice", item: "notice", href: page("notice") },
    ],
  },
  {
    group: "Layout",
    items: [
      { name: "App shell", item: "app-shell", href: page("app-shell") },
      { name: "Sidebar", item: "sidebar", href: page("sidebar") },
      { name: "Panel", item: "panel", href: page("panel") },
      { name: "Resizable", item: "resizable", href: page("resizable") },
      { name: "Scroll area", item: "scroll-area", href: page("scroll-area") },
      { name: "Accordion", item: "accordion", href: page("accordion") },
      { name: "Collapsible", item: "collapsible", href: page("collapsible") },
      { name: "Carousel", item: "carousel", href: page("carousel") },
      { name: "Inspector", item: "inspector", href: page("inspector") },
      { name: "Item", item: "item", href: page("item") },
      { name: "Direction", item: "direction", href: page("direction") },
    ],
  },
  {
    group: "Conversation",
    items: [
      { name: "Message", item: "message", href: page("message") },
      { name: "Bubble", item: "bubble", href: page("bubble") },
      { name: "Message scroller", item: "message-scroller", href: page("message-scroller") },
      { name: "Attachment", item: "attachment", href: page("attachment") },
      { name: "Questionnaire", item: "questionnaire", href: page("questionnaire") },
    ],
  },
]

/** Pages that are not a component: read before the catalogue, listed first in the index. Not registry items.
 *  `keywords` feed the site search, so a reader typing "dark" or "tokens" finds the guide that answers it.
 *  `description` is the page's meta description and its line in /llms.txt (pageDescription). */
export type Guide = { name: string; href: string; keywords: string; description: string }
export const GUIDES: Guide[] = [
  { name: "Installation", href: "/docs/installation", keywords: "install setup get started shadcn registry namespace components.json troubleshooting error", description: "Install Keyline components into a React app with the shadcn CLI: map the @keyline-ui registry once, then add components by name. Requirements, updates and troubleshooting." },
  { name: "Theming", href: "/docs/theming", keywords: "theme tokens colour color palette brand roles tailwind utilities fonts atkinson plex system shadcn keyline-shadcn", description: "Theme Keyline with ten source tokens: brand colours, the colours derived from them, colour roles as Tailwind utilities, fonts, and the opt-in theme for shadcn components." },
  { name: "Modes", href: "/docs/modes", keywords: "dark mode light density compact comfortable cut rtl direction reduced motion", description: "Dark mode, density, the cut (Keyline's corner shape), right-to-left and reduced motion. Each is a class or attribute, so it applies to the whole app or one region." },
  { name: "Configuration", href: "/docs/configuration", keywords: "configuration config scope KeylineConfigScope playground export css portals overlays tenant", description: "Configure Keyline for a whole React app or one region with KeylineConfigScope, generate the matching CSS, and keep portalled overlays in their region's configuration." },
  { name: "Composition", href: "/docs/composition", keywords: "composition layout cell control frame seam edges sizing overlays z-index public classes limitations helpers", description: "How Keyline components fit together: controls and cells, one owner per edge, sizing, overlay stacking, the public API, shared helpers and known limitations." },
]

/** Registry blocks: whole screens composed from the components. Each names the item it installs, like the catalogue. */
export const BLOCKS: Group = {
  group: "Blocks",
  items: [{ name: "Shipments", item: "shipments-demo", href: "/docs/blocks/shipments", description: "A complete React records screen built from Keyline: app shell, filterable and sortable table, selection with bulk actions and undo, an inspector, command menu and toasts." }],
}

/** The docs index: the guides, then the catalogue, then the blocks built from it. */
export const INDEX: { group: string; items: { name: string; href?: string }[] }[] = [{ group: "Get started", items: GUIDES }, ...CATALOG, BLOCKS]

/** Written pages in index order: sheet 1 is the homepage, so a page's sheet number is its position + 2. */
export const WRITTEN = INDEX.flatMap((g) => g.items).filter((e) => e.href)

export function sheet(name: string) {
  const i = WRITTEN.findIndex((e) => e.name === name)
  return { n: i + 2, of: WRITTEN.length + 1, prev: WRITTEN[i - 1], next: WRITTEN[i + 1] }
}

/** A guide's or block's description, kept here so its page metadata and /llms.txt say the same thing. */
export function pageDescription(href: string): string {
  const d = [...GUIDES, ...BLOCKS.items].find((e) => e.href === href)?.description
  if (!d) throw new Error(`Keyline site: no catalogue description for ${href}`)
  return d
}
