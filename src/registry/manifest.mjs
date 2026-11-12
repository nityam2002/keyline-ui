// Registry manifest: what each item is and which files it ships.
// Package and registry dependencies are NOT listed here: scripts/build-registry.mjs derives them from imports
// and fails the build when a file is missing or an import points outside the registry.
// Items reference each other as "@keyline-ui/<name>"; consumers map the namespace once in components.json.

const ui = (name, title, description, { files = [], css = true, deps = [] } = {}) => ({
  name,
  type: "registry:ui",
  title,
  description,
  // the style item carries tokens + construction CSS; it is a CSS-level dependency imports cannot reveal
  registryDependencies: ["keyline", ...deps],
  files: [{ path: `src/registry/keyline/ui/${name}.tsx`, type: "registry:ui" }, ...files],
  ...(css ? { css: `src/registry/keyline/ui/${name}.css` } : {}),
});

export const items = [
  {
    name: "keyline",
    type: "registry:style",
    extends: "none",
    title: "Keyline",
    description:
      "Keyline tokens and construction primitives: role weights, the optional cut (--kl-cut), cells, flood, lamp, unfold, dock, pending.",
    dependencies: [
      "@fontsource-variable/atkinson-hyperlegible-next",
      "@fontsource-variable/atkinson-hyperlegible-mono",
    ],
    registryDependencies: [],
    files: [],
    css: "src/registry/keyline/theme/keyline.css",
    theme: true,
    docs: 'Shape: square by default (--kl-cut: 0). Set --kl-cut to 0.5 (quiet) or 1 (full) on :root or any subtree for the cut accent, or use data-kl-cut="quiet" | "on" | "off". Density: data-kl-density="compact". Reduced motion: honours prefers-reduced-motion; data-kl-motion="reduce" forces it.',
  },
  {
    name: "keyline-shadcn",
    type: "registry:theme",
    title: "Keyline for the whole app (opt-in)",
    description:
      "Maps shadcn's semantic tokens, radius, fonts, focus ring and page body to Keyline, so stock shadcn components take Keyline's look. Not needed to use Keyline components.",
    registryDependencies: ["keyline"],
    files: [],
    css: "src/registry/keyline/theme/keyline-shadcn.css",
    theme: true,
  },
  {
    name: "keyline-motion",
    type: "registry:lib",
    title: "Keyline motion",
    description: "Flood origin, zero-bounce stretch springs and the useStretch hook. No runtime provider.",
    files: [{ path: "src/registry/keyline/lib/keyline-motion.ts", type: "registry:lib" }],
  },
  {
    name: "keyline-scope",
    type: "registry:lib",
    title: "Keyline portal scope",
    description:
      "Carries subtree configuration (palette, font, weights, cut, density, motion, theme, dir) onto portaled overlays. No provider.",
    files: [{ path: "src/registry/keyline/lib/keyline-scope.ts", type: "registry:lib" }],
  },
  {
    name: "keyline-config",
    type: "registry:lib",
    title: "Keyline configuration",
    description:
      "The configuration contract as data: palette presets, fonts, weights, cut, density, theme, motion. Generates the CSS, attributes and registry item a configuration needs, and a runtime KeylineConfigScope.",
    // KeylineConfigScope only works with the theme's derivation rules: a CSS-level dependency
    registryDependencies: ["keyline"],
    files: [{ path: "src/registry/keyline/lib/keyline-config.ts", type: "registry:lib" }],
  },
  {
    name: "calendar",
    type: "registry:lib",
    title: "Calendar logic",
    description:
      "Pure range helpers: ordering, available-day count and locale-aware range formatting. The grid and keyboard are react-day-picker's.",
    files: [{ path: "src/registry/keyline/lib/calendar.ts", type: "registry:lib" }],
  },
  {
    name: "selection",
    type: "registry:lib",
    title: "Selection scope",
    description:
      "Pure helpers and a hook for page / all-matching selection with hidden-row accounting, plus snapshot-based undo.",
    files: [{ path: "src/registry/keyline/lib/selection.ts", type: "registry:lib" }],
  },
  {
    name: "options",
    type: "registry:lib",
    title: "Option and value helpers",
    description:
      "Pure helpers: group options under headings in first-appearance order, and the longest value a numeric scale prints.",
    files: [{ path: "src/registry/keyline/lib/options.ts", type: "registry:lib" }],
  },
  {
    name: "scroll-edges",
    type: "registry:lib",
    title: "Scroll edges",
    description:
      "Marks the edge of a sideways-scrolling cell row where items are hidden (data-kl-more); the theme casts an ink shadow inward from that edge.",
    files: [{ path: "src/registry/keyline/lib/scroll-edges.ts", type: "registry:lib" }],
  },
  {
    name: "collection",
    type: "registry:lib",
    title: "Collection helpers",
    description:
      "Pure helpers: the sort cycle of a column header, a numeric-aware locale comparator, and the constant-width window of page numbers.",
    files: [{ path: "src/registry/keyline/lib/collection.ts", type: "registry:lib" }],
  },
  ui("button", "Button", "Framed button with affix cells, key travel and pending/done/failed signals."),
  ui(
    "split-button",
    "Split button",
    "One control frame, two cells: the action and its menu. The menu docks to the frame.",
  ),
  ui(
    "menu",
    "Menu",
    "Docked menu with code cells, shortcut cells, ink cursor, destructive rows, checkbox and radio items, and submenus.",
  ),
  ui("segmented", "Segmented control", "Exclusive choice in one frame; the ink band stretches between cells."),
  ui(
    "toggle-group",
    "Toggle group",
    "Independent toggles in one frame; each cell floods from the press point and carries a lamp.",
  ),
  ui(
    "field",
    "Field",
    "Field, input, affix cells, field group and validation with an inserted attention cell. Form (Base UI Form) and vertical, horizontal or responsive field orientation.",
  ),
  ui(
    "multiselect",
    "Multiselect",
    "Searchable async multiselect: tokens are cells in the field frame, the list docks to it.",
  ),
  ui(
    "date-range",
    "Date range picker",
    "Range calendar on react-day-picker (pinned) styled as a Keyline grid: a flooded range with ink ends, row-break notches, hover and keyboard preview, hatched unavailable days, month and year dropdowns, min/max, presets and a day count.",
  ),
  ui(
    "date-picker",
    "Date picker",
    "Single-date calendar and picker on react-day-picker, sharing the range calendar's look, wording and bounds; the chosen day floods ink. DateTimePicker adds a time row (a TimeField cell, 24- or 12-hour, with optional minTime/maxTime) under the calendar.",
  ),
  ui("checkbox", "Checkbox", "Square check box and a labelled checkbox row with description; indeterminate supported."),
  ui("radio-group", "Radio group", "Exclusive choice as framed rows; the ink band stretches to the chosen row."),
  ui("switch", "Switch", "Binary setting: a two-cell frame whose block stretches to the on side."),
  ui(
    "select",
    "Select",
    "Single select: field-frame trigger with a caret cell; the list docks to the frame. Options form (with groups) or parts (SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectSeparator).",
  ),
  ui("tabs", "Tabs", "Tabs with a cobalt location band that stretches; optional count voice; panels."),
  ui(
    "tooltip",
    "Tooltip",
    "Ink label docked to the focus ring of its trigger, with an optional shortcut cell. Never cut.",
  ),
  ui(
    "panel",
    "Panel",
    "Region frame with header, body and footer cells; PanelGrid joins panels into one frame with shared keylines.",
  ),
  ui("stat", "Stat", "Count voice with label, unit, delta signal and an optional meter."),
  ui("status", "Status and badge", "Status glyph + text (shape survives forced colours); square code badge."),
  ui(
    "nav",
    "Nav",
    "Vertical (or wrapping) location list; the cobalt band stretches between items. Labelled groups, icon key cells, nested links under a disclosure, row actions (NavAction), a brand identity block and a footer; a rail of key cells with tooltips inside AppShell. With AppShell it is the sidebar (@keyline-ui/sidebar).",
  ),
  ui(
    "table",
    "Table",
    "Table frame parts: tabs, toolbar, bulk bar, index column, sortable headers, expanded detail, empty/error rows, pager.",
  ),
  ui(
    "dialog",
    "Dialog",
    "Dialog (header, scrolling body, footer cells) and AlertDialog (an attention cell; focus lands on the safe action): region-framed modals on Base UI. Also installable as @keyline-ui/alert-dialog.",
  ),
  ui(
    "inspector",
    "Inspector",
    "Non-modal contextual panel: header with the inspected object's code, key/value cells and a sticky action strip.",
  ),
  ui(
    "sheet",
    "Sheet",
    "A region docked to a viewport edge (end, start, bottom): Base UI Dialog behaviour, unfolds from its edge, cut on the inner corner.",
  ),
  ui(
    "popover",
    "Popover",
    "Arbitrary content docked to its trigger (or detached by one gutter), with optional header, body and footer cells.",
  ),
  ui(
    "notice",
    "Notice",
    "Inline message: a tone cell with a glyph, the message, and action cells; folds away; narrow layout drops actions to their own row.",
  ),
  {
    ...ui(
      "scroll-area",
      "Scroll Area",
      "A native scroll container with Keyline scrollbars (Base UI Scroll Area): a bar is a cell on the region's edge, owning its seam; content is padded only while an axis overflows; corner cell for both bars; focusable viewport with an inset ring. The thumb reveals while its axis scrolls and when the pointer is on the bar, widens and darkens there, inks while held, then fades (overlay platforms; always shown where native bars take space, in forced colours and for more contrast).",
    ),
    docs: 'Size the root (height or max-height) with your own class: <ScrollArea className="h-64" label="Activity">…</ScrollArea>. scrollbars="vertical" (default), "horizontal" or "both". Scrolling stays native (wheel, trackpad, touch, keyboard). Give label when nothing else names the region; the viewport is focusable while it overflows. Do not wrap Select or Multiselect lists in it: they keep their own native scroller, styled to match.',
  },
  ui(
    "slider",
    "Slider",
    "A continuous or stepped value (or a range) in one control frame: the Meter's rail with an ink fill, a 2px thumb with a grip keyline, and a readout cell sized for the longest value.",
  ),
  ui(
    "combobox",
    "Combobox",
    "Single-value combobox: a Select you can type into. Local filtering or an async source (abort, status, retry), optional groups; the list docks to the frame.",
  ),
  ui(
    "accordion",
    "Accordion",
    "Stacked sections in one frame: header rows on shared keylines, panels unfold from the header's keyline; one or many open.",
  ),
  ui(
    "collapsible",
    "Collapsible",
    "One unframed disclosure: a caret box whose keyline runs down the panel as a spine; the panel unfolds.",
  ),
  ui(
    "context-menu",
    "Context menu",
    "Menu opened on an object (right-click, long-press, Menu key): Menu's rows and submenus; marks the object while open.",
  ),
  ui(
    "progress",
    "Progress",
    "Task progress: the pending signal made determinate (yellow fill, ink leading edge), indeterminate, complete and failed states.",
  ),
  ui(
    "number-field",
    "Number field",
    "A number in a field frame with stepper key cells and a unit cell: Base UI NumberField (locale parsing, hold-to-repeat, min/max) inside a Field.",
  ),
  ui(
    "empty",
    "Empty",
    "Nothing here, said plainly: a count cell, the message and the way out, in one frame or as a cell. Empty, error and first-use kinds.",
  ),
  ui(
    "breadcrumb",
    "Breadcrumb",
    "Where a page sits: ancestor link cells and a cobalt cell for here; earlier levels fold into a menu by count or width.",
  ),
  ui(
    "pagination",
    "Pagination",
    'Page numbers as cells with a cobalt current page; constant width while paging; folds to "5 / 20" when narrow; buttons or links.',
  ),
  ui(
    "skeleton",
    "Skeleton",
    "A placeholder for content on its way: the table's loading cell outside the table, in line, block, value and control shapes; a busy group that names what is loading.",
  ),
  ui(
    "app-shell",
    "App shell",
    "Header frame (navigation toggle, breadcrumb, actions), a sidebar, the page and an aside, one gutter apart; the sidebar is a full-height column that can collapse to a rail; below a width of its own the sidebar and aside become sheets.",
  ),
  ui(
    "time-field",
    "Time field",
    'A time of day in one field frame: hour and minute spin-button cells that wrap, a day-period cell on a 12-hour clock, a zone affix, optional min/max bounds; the 24-hour "HH:MM" value reaches Base UI Form and FormData.',
  ),
  ui(
    "menubar",
    "Menubar",
    "A row of menus in one frame (Base UI Menubar): title key cells, the open title inverse, menus docked to the frame's edge with Menu's rows and checkbox and radio items.",
  ),
  ui(
    "toolbar",
    "Toolbar",
    "A row of commands that is one Tab stop (Base UI Toolbar): item cells on shared seams, groups on a 2px keyline, toggles that flood, an exclusive group whose ink band stretches, menus docked to the frame, a text input cell; horizontal or vertical.",
  ),
  ui(
    "checkbox-group",
    "Checkbox group",
    "Several independent choices to one question in one frame (Base UI CheckboxGroup): an optional parent row that checks or clears all with a count, rows with description and meta, Form participant.",
  ),
  ui(
    "avatar",
    "Avatar",
    "A person or organisation as a square cell (Base UI Avatar): the photo rises in from the bottom keyline, initials hold the cell while it loads or after it fails, status as its floor keyline (a line shape per kind, never over the face); AvatarGroup joins avatars on shared seams with a +N count cell.",
  ),
  ui(
    "hover-card",
    "Hover card",
    "A link that previews its destination (Base UI Preview Card): the underline draws along its keyline during the open delay; the card is a control frame of cells (media, title, code, facts on seams) one gutter from the link. Supplementary content only.",
  ),
  ui(
    "otp-field",
    "OTP field",
    "A one-time code in one field frame (Base UI OTP Field): a cell per character on shared seams, groups split by a join cell, paste and SMS autofill, a Field participant; verification signals pending, done and failed in the frame.",
  ),
  ui(
    "kbd",
    "Kbd",
    "A key in the Code voice: a key cell with a 2px floor; KbdGroup joins a chord's keys on seams (nested kbd), with the separator read, not drawn. Used by Command.",
  ),
  ui(
    "toggle",
    "Toggle",
    "One on/off button (Base UI Toggle, aria-pressed): pressed floods yellow and fills the lamp; icon toggles show a floor keyline. Control or cell, alone or as a cell of a field frame. ToggleGroup composes its cells.",
  ),
  ui(
    "native-select",
    "Native select",
    "The platform's own select in a Keyline field frame: the caret cell drawn over its end, the OS list in the page's scheme, options or groups, a Field participant (name, required, validate, Form errors).",
  ),
  ui(
    "resizable",
    "Resizable",
    "Panels that share a seam you can move, on react-resizable-panels v4: the 1px seam is the handle, thickening to 3px ink on hover or drag and drawn in the focus colour on keyboard focus; an optional grip cell. Keys, collapse, reset, touch targets and persistence are the library's.",
  ),
  ui(
    "chart",
    "Chart",
    "Charts on recharts, as the reference: series colours by role from the data tokens (focal, comparison, rest, mark, alert) as --color-<key>; solid hairline grid, Code-voice ticks, square marks and keys, an inverse tooltip with tabular figures. ChartFigure adds a title and a Chart / Table switch over the same rows. RTL axes and reduced motion are applied for you.",
    { deps: ["table"] },
  ),
  ui(
    "carousel",
    "Carousel",
    "Slides on Embla, as the reference: a frame of slides on travelling 1px seams with a control row of cells (previous, n / N with position ticks, next). APG carousel without rotation: named region, slides labelled n of N, out-of-view slides inert, arrow keys mirrored in RTL, moves announced politely, instant steps under reduced motion.",
  ),
  ui(
    "message",
    "Message",
    "A sender's run in a conversation, on one reading edge: the header (name, time), every bubble's text, the file glyphs and the receipt start on the same line. Consecutive bubbles stack on shared keylines; the avatar sits in the gutter level with the first bubble. align=\"end\" is the reader's own run, at the end of the log, mirrored with the writing direction.",
  ),
  ui(
    "bubble",
    "Bubble",
    'One message as a control-weight frame (2px, no radius) holding cells: the text, then files (Attachment layout="cell"). Consecutive bubbles attach on a 1px seam. Tone by role: plain (theirs), tint (yours), attention (not sent: the attention frame and an inserted ! cell). pending runs the Signal segment on the bottom keyline while it sends. Reactions sit on the bottom keyline.',
  ),
  ui(
    "message-scroller",
    "Message scroller",
    "A conversation log on @shadcn/react's MessageScroller, as the reference: stays on the newest message, holds the reader's place when scrolled up, keeps position when older messages are prepended; role=log inside a focusable region. Keyline adds: the place also holds when content above changes size (in every engine), arrivals unfold from their top keyline while the reader follows, and a Latest cell that counts what arrived below and jumps a bounded, interruptible distance. The log scrolls inside Keyline's Scroll Area, so its bar is the shared one; the jump reveals it, and pressing it is the reader taking over.",
  ),
  ui(
    "attachment",
    "Attachment",
    'A file as a frame of cells that never change: media, name (the extension stays in view) and detail, one action. Uploading fills the bottom keyline; processing runs the pending segment; error stops the bar in red and floods the media cell with !; an upload that lands floods it yellow with a tick for 900ms. layout="cell" makes it a cell of a Bubble.',
  ),
  ui(
    "drawer",
    "Drawer",
    "A sheet you swipe away, on Base UI Drawer as the reference: swipe with velocity, snap points, nested drawers, focus trap, Escape and the keyboard inset are the library's. Keyline: the page-facing edge at region weight, a grip on it, logical sides (end and start mirror in RTL), the system's motion timings.",
  ),
  ui(
    "navigation-menu",
    "Navigation menu",
    "Site navigation (Base UI Navigation Menu): a control frame of section triggers and links, the open trigger inverse, the current page cobalt; each section's panel docks to the frame's keyline with link cells on shared seams (title, description, code).",
  ),
  ui(
    "questionnaire",
    "Questionnaire",
    "A multi-step form on @shadcn/react's Questionnaire, as the reference: single choice (the radio group's rows and ink band), multiple choice (checkbox rows), free text (the field frame), required and optional steps, Back, Skip, Next and Submit as Button cells, answers kept when going back, errors described on the current step, focus on the new step's heading, Progress for the step.",
    { deps: ["radio-group", "checkbox"] },
  ),
  ui(
    "button-group",
    "Button group",
    "Buttons attached in one control frame: Button cells on shared seams, each its own Tab stop; text cells and a heavier separator; horizontal or vertical. Toolbar is the one-Tab-stop row; SplitButton the action with its menu.",
    { deps: ["button"] },
  ),
  ui(
    "marker",
    "Marker",
    "A step in a conversation or activity timeline in the Code voice: a glyph cell and words, a separator between seams, or a keyline under the words; pending runs the pending segment and is a polite status.",
  ),
  ui(
    "direction",
    "Direction",
    "DirectionProvider: sets a subtree's writing direction for both the DOM (Keyline's CSS and DOM-reading components) and Base UI (the sides tooltips, popovers and menus take; arrow keys). useDirection reads it.",
    { css: false },
  ),
  {
    name: "sidebar",
    type: "registry:ui",
    title: "Sidebar (AppShell + Nav)",
    description:
      "Installs the sidebar: AppShell (the column, its toggle, collapse to an icon rail, a start sheet on narrow layouts) and Nav (groups, icon keys, nested links, row actions, identity and footer). Import from app-shell and nav.",
    registryDependencies: ["keyline", "app-shell", "nav"],
    files: [],
    docs: '<AppShell collapse="rail" nav={<Nav layout="cell" groups={…} value={…} onValueChange={…} />}>…</AppShell>. Nested links: an item with items: [...]. Row actions: action: <Menu><MenuTrigger render={<NavAction label="More for …" />} />…</Menu>.',
  },
  {
    name: "alert-dialog",
    type: "registry:ui",
    title: "Alert dialog",
    description:
      "Installs the dialog item, which exports AlertDialog, AlertDialogTrigger and AlertDialogContent (focus on the safe action, destructive or primary tone) beside Dialog. Import from dialog.",
    registryDependencies: ["keyline", "dialog"],
    files: [],
  },
  ui(
    "item",
    "Item",
    "List rows on shared keylines: media cell, content, meta and action cells; render-prop rows for links and buttons.",
  ),
  ui("command", "Command menu", "⌘K command menu: digit cells run by index, grouped results, empty state."),
  ui(
    "toast",
    "Toast",
    "Actionable feedback on Base UI Toast that docks into a host cell or floats at the inline-end corner: done, failed, info, warning and loading kinds, a description line, one action (Undo, Retry), the countdown draining the keyline. useToaster() and createToaster() add promise tracking, update and dismiss, and calls from outside React.",
  ),
  {
    name: "shipments-demo",
    type: "registry:block",
    title: "Shipments (demo block)",
    description:
      "A working application composition: filterable, selectable table with expanded detail, inspector, bulk actions with undo.",
    registryDependencies: ["keyline"],
    files: [
      { path: "src/registry/keyline/blocks/shipments/shipments.tsx", type: "registry:component" },
      { path: "src/registry/keyline/blocks/shipments/shipments-data.ts", type: "registry:lib" },
    ],
    css: "src/registry/keyline/blocks/shipments/shipments.css",
  },
];
