// States the visual-parity harness shoots besides each fixture at rest (pnpm test:visual; docs/recipe.md, "Visual
// parity"). Keyed by fixture: a specimen entry id (src/demo/App.tsx) or a route ("app", "playground"). Each state is
//
//   { name, do: [step, …], show?, reducedMotion? }
//
// shot after its steps, in every configuration and engine, on a fresh load of the fixture. Steps, in order:
//
//   ["focus", sel]          keyboard focus (fails unless the element then matches :focus-visible)
//   ["hover", sel]          the pointer over the element
//   ["click", sel]          a pointer click
//   ["press", key]          a key on whatever has focus ("ArrowRight", "Enter", "Shift+Tab")
//   ["wait", sel]           until the element is visible (a popup, a tooltip after its delay)
//   ["wheel", sel, dy]      the pointer over the element, then the mouse wheel by dy px (negative: up)
//
// `sel` is a Playwright selector: CSS, `role=button[name="Bold"]` (`s` after the quotes matches the name exactly and
// case-sensitively), `data-testid=…`, chained with `>>`. Only the fixture's own entry is on the page, so `#<entry>`
// as the first link is enough scope. Use the public API (roles, names, data-testid, data-slot), never `.kl-*`.
// A visible tooltip, menu, listbox or dialog is part of the shot wherever it is portaled; `show` names any other
// element outside the entry's section that the shot must include. The harness waits for both to stop moving, and
// after the steps waits out a tooltip's open delay (1s), so a hover or focus that opens one shows it every time. `reducedMotion: true` loads the page with prefers-reduced-motion:
// reduce, for a state whose motion comes to rest at a point that depends on frame timing (say why beside it).
//
// Add a state when a conversion touches a style that only shows under interaction (hover, focus, open, pressed, a
// scroll position). The name becomes part of the shot's file name: `<engine>/<config>/<entry>@<state>.png`.

const role = (r, name) => `role=${r}[name=${JSON.stringify(name)}s]`;
const MAIN = role("navigation", "Main");

export const STATES = {
  toolbar: [
    { name: "focus-toggle", do: [["focus", `#toolbar >> ${role("button", "Italic")}`]] },
    { name: "focus-primary", do: [["focus", `#toolbar >> ${role("button", "Publish")}`]] },
    // a button with no tooltip: an open tooltip sets data-popup-open on its trigger, which drops the hover tint
    { name: "hover-button", do: [["hover", `#toolbar >> ${role("button", "Export")}`]] },
    { name: "hover-tooltip", do: [["hover", `#toolbar >> ${role("button", "Undo")}`]] },
    { name: "hover-pressed", do: [["hover", `#toolbar >> ${role("button", "Align start")}`]] },
    { name: "focus-input", do: [["focus", `#toolbar >> ${role("textbox", "Search records")}`]] },
    { name: "hover-primary", do: [["hover", `#toolbar >> ${role("button", "Publish")}`]] },
    { name: "hover-menu-trigger", do: [["hover", `#toolbar >> ${role("button", "Insert")}`]] },
    { name: "hover-flooded", do: [["hover", `#toolbar >> ${role("button", "Comments 3")}`]] },
    { name: "hover-disabled", do: [["hover", `#toolbar >> ${role("button", "Redo")}`]] },
    { name: "hover-link", do: [["hover", `#toolbar >> ${role("link", "Help")}`]] },
    { name: "focus-link", do: [["focus", `#toolbar >> ${role("link", "Help")}`]] },
    { name: "focus-choice", do: [["focus", `#toolbar >> ${role("button", "Align start")}`]] },
    { name: "focus-palette", do: [["focus", `#toolbar >> ${role("button", "Pan")}`]] },
    { name: "narrow-scrolled", do: [["click", `#toolbar >> ${role("radio", "300px")}`]] },
    {
      name: "menu-open",
      do: [
        ["focus", `#toolbar >> ${role("button", "Insert")}`],
        ["press", "Enter"],
        ["wait", "role=menu"],
      ],
      show: "role=menu",
    },
  ],
  "toolbar-overflow": [
    {
      name: "more-open",
      do: [
        // the narrowest width, chosen from the keyboard (a click would end :focus-visible for the next focus)
        ["focus", `#toolbar-overflow >> ${role("radio", "Fits")}`],
        ["press", "ArrowDown"],
        ["press", "ArrowDown"],
        ["press", "ArrowDown"],
        ["focus", `#toolbar-overflow >> role=button[name=/^More/] >> nth=0`],
        ["press", "Enter"],
        ["wait", "role=menu"],
      ],
      show: "role=menu",
    },
    { name: "at-560", do: [["click", `#toolbar-overflow >> ${role("radio", "560px")}`]] },
    { name: "at-380", do: [["click", `#toolbar-overflow >> ${role("radio", "380px")}`]] },
    {
      name: "more-open-380",
      do: [
        // chosen from the keyboard: a click would end :focus-visible for the next focus
        ["focus", `#toolbar-overflow >> ${role("radio", "Fits")}`],
        ["press", "ArrowDown"],
        ["press", "ArrowDown"],
        ["focus", `#toolbar-overflow >> role=button[name=/^More/] >> nth=0`],
        ["press", "Enter"],
        ["wait", "role=menu"],
      ],
      show: "role=menu",
    },
    {
      name: "hover-more",
      do: [
        ["click", `#toolbar-overflow >> ${role("radio", "220px")}`],
        ["hover", `#toolbar-overflow >> role=button[name=/^More/] >> nth=0`],
      ],
    },
  ],
  "toolbar-group-overflow": [
    { name: "at-220", do: [["click", `#toolbar-group-overflow >> ${role("radio", "220px")}`]] },
    {
      name: "more-open-150",
      do: [
        ["focus", `#toolbar-group-overflow >> ${role("radio", "Fits")}`],
        ["press", "ArrowDown"],
        ["press", "ArrowDown"],
        ["press", "ArrowDown"],
        ["focus", `#toolbar-group-overflow >> role=button[name=/^More/] >> nth=0`],
        ["press", "Enter"],
        ["wait", "role=menu"],
      ],
      show: "role=menu",
    },
  ],
  "toolbar-vertical-overflow": [
    { name: "at-160", do: [["click", `#toolbar-vertical-overflow >> ${role("radio", "160px")}`]] },
    {
      name: "more-open-110",
      do: [
        ["focus", `#toolbar-vertical-overflow >> ${role("radio", "400px")}`],
        ["press", "ArrowDown"],
        ["press", "ArrowDown"],
        ["focus", `#toolbar-vertical-overflow >> role=button[name=/^More/] >> nth=0`],
        ["press", "Enter"],
        ["wait", "role=menu"],
      ],
      show: "role=menu",
    },
  ],
  // the shipments route: cell toolbars with overflow="menu" in the shell header, the views row, the status row and
  // the bulk bar
  app: [
    {
      name: "alerts-open",
      do: [
        ["focus", `${role("toolbar", "Page actions")} >> role=button[name=/^Alerts/]`],
        ["press", "Enter"],
        ["wait", "role=menu"],
      ],
      show: "role=menu",
    },
    { name: "hover-status", do: [["hover", `${role("toolbar", "Status filters")} >> role=button >> nth=1`]] },
    { name: "focus-status", do: [["focus", `${role("toolbar", "Status filters")} >> role=button >> nth=0`]] },
    // the shell around it: a nav link hovered, the sidebar collapsed to its rail
    { name: "hover-nav", do: [["hover", `${MAIN} >> role=link >> nth=2`]] },
    { name: "rail", do: [["click", role("button", "Collapse navigation")]] },
    // the table: a row selected (the bulk bar's count and scope), a page selected, sort headers sorted, hovered and
    // focused, a row hovered and one expanded
    { name: "select-row", do: [["click", "role=checkbox[name=/^Select SH-/] >> nth=0"]] },
    { name: "select-page", do: [["click", role("checkbox", "Select this page")]] },
    { name: "sorted", do: [["click", "th >> role=button >> nth=1"]] },
    { name: "hover-sort-header", do: [["hover", "th >> role=button >> nth=2"]] },
    { name: "focus-sort-header", do: [["focus", "th >> role=button >> nth=0"]] },
    { name: "hover-row", do: [["hover", "tbody tr >> nth=3"]] },
    // the shot waits for the detail to be open: its unfold starts two frames after it mounts, and under load the
    // chevron's turn can end before then, a gap in which the page looks at rest mid-unfold
    {
      name: "expanded",
      do: [
        ["click", "role=button[name=/^Show legs for/] >> nth=0"],
        ["wait", "[data-slot=table-detail] [data-open]"],
      ],
    },
    // a status filter applied (the rows narrow, Clear appears); a view with no matches (the empty state)
    { name: "filtered", do: [["click", `${role("toolbar", "Status filters")} >> role=button[name=/^Delayed/]`]] },
    {
      name: "empty",
      do: [
        ["click", "role=tab[name=/^Delivered/]"],
        ["click", `${role("toolbar", "Status filters")} >> role=button[name=/^Delayed/]`],
      ],
    },
    // a row's actions from the keyboard: the ID that opens the inspector, the expand toggle
    { name: "focus-row-open", do: [["focus", "tbody >> role=button[name=/^SH-/] >> nth=1"]] },
    { name: "focus-expand", do: [["focus", "role=button[name=/^Show legs for/] >> nth=1"]] },
    // a row inspected: its ID pressed, the Inspector as the shell's aside
    { name: "inspect", do: [["click", "tbody >> role=button[name=/^SH-/] >> nth=2"]] },
    // two rows selected, then Cancel from Actions: the alert's list of shipments
    {
      name: "confirm-cancel",
      do: [
        ["click", "role=checkbox[name=/^Select SH-/] >> nth=0"],
        ["click", "role=checkbox[name=/^Select SH-/] >> nth=1"],
        ["click", `${role("toolbar", "Bulk actions")} >> role=button[name=/^Actions/]`],
        ["click", "role=menuitem[name=/^Cancel 2 shipments/]"],
        ["wait", "role=alertdialog"],
      ],
      show: "role=alertdialog",
    },
  ],
  shell: [
    { name: "hover-nav", do: [["hover", `#shell >> ${MAIN} >> role=button[name=/^Carriers/]`]] },
    { name: "focus-nav", do: [["focus", `#shell >> ${MAIN} >> role=button[name=/^Carriers/]`]] },
    { name: "focus-current", do: [["focus", `#shell >> ${MAIN} >> role=button[name=/^Shipments/]`]] },
    { name: "focus-hide", do: [["focus", `#shell >> ${role("button", "Hide navigation")}`]] },
    { name: "hover-hide", do: [["hover", `#shell >> ${role("button", "Hide navigation")}`]] },
    { name: "nav-hidden", do: [["click", `#shell >> ${role("button", "Hide navigation")}`]] },
    // a row opens the aside: inline beside the page at this width
    { name: "aside-open", do: [["click", `#shell >> role=button[name=/^Rotterdam Europoort/]`]] },
    // 600px: below narrowAt, the sidebar and the aside are sheets
    { name: "narrow", do: [["click", `#shell >> ${role("radio", "600px (sheets)")}`]] },
    {
      name: "narrow-nav-open",
      do: [
        // chosen from the keyboard: a click would end :focus-visible for the next focus
        ["focus", `#shell >> ${role("radio", "Wide")}`],
        ["press", "ArrowRight"],
        ["focus", `#shell >> ${role("button", "Show navigation")}`],
        ["press", "Enter"],
        ["wait", "role=dialog"],
      ],
    },
    {
      name: "narrow-aside-open",
      do: [
        ["click", `#shell >> ${role("radio", "600px (sheets)")}`],
        ["click", `#shell >> role=button[name=/^Hamburg Waltershof/]`],
        ["wait", "role=dialog"],
      ],
    },
  ],
  sidebar: [
    { name: "hover-nav", do: [["hover", `#sidebar >> ${MAIN} >> role=button[name=/^Carriers/]`]] },
    { name: "focus-nav", do: [["focus", `#sidebar >> ${MAIN} >> role=button[name=/^Carriers/]`]] },
    { name: "focus-child", do: [["focus", `#sidebar >> ${MAIN} >> ${role("button", "On-time")}`]] },
    { name: "hover-parent", do: [["hover", `#sidebar >> ${MAIN} >> role=button[name=/^Reports/]`]] },
    { name: "hover-action", do: [["hover", `#sidebar >> ${role("button", "More for Customs holds")}`]] },
    // the nested list folded: the band rests on its parent (reduced motion: the fold and the band land at once)
    {
      name: "parent-closed",
      reducedMotion: true,
      do: [["click", `#sidebar >> ${MAIN} >> role=button[name=/^Reports/]`]],
    },
    {
      name: "item-menu-open",
      do: [
        ["focus", `#sidebar >> ${role("button", "More for Late arrivals")}`],
        ["press", "Enter"],
        ["wait", "role=menu"],
      ],
      show: "role=menu",
    },
    // the icon rail: key cells only, a label as a tooltip on hover and on keyboard focus
    { name: "rail", do: [["click", `#sidebar >> ${role("button", "Collapse navigation")}`]] },
    {
      name: "rail-hover",
      do: [
        ["focus", `#sidebar >> ${role("button", "Collapse navigation")}`],
        ["press", "Enter"],
        ["hover", `#sidebar >> ${MAIN} >> role=button[name=/^Carriers/]`],
      ],
    },
    {
      name: "rail-focus-current",
      do: [
        ["focus", `#sidebar >> ${role("button", "Collapse navigation")}`],
        ["press", "Enter"],
        ["focus", `#sidebar >> ${MAIN} >> role=button[name=/^Reports/]`],
      ],
    },
    // 600px: the sidebar is a start sheet
    { name: "narrow", do: [["click", `#sidebar >> ${role("radio", "600px (sheet)")}`]] },
    {
      name: "narrow-sheet-open",
      do: [
        ["focus", `#sidebar >> ${role("radio", "Wide (toggle: rail)")}`],
        ["press", "ArrowRight"],
        ["focus", `#sidebar >> ${role("button", "Show navigation")}`],
        ["press", "Enter"],
        ["wait", "role=dialog"],
      ],
    },
    {
      name: "narrow-sheet-menu-open",
      do: [
        ["focus", `#sidebar >> ${role("radio", "Wide (toggle: rail)")}`],
        ["press", "ArrowRight"],
        ["focus", `#sidebar >> ${role("button", "Show navigation")}`],
        ["press", "Enter"],
        ["wait", "role=dialog"],
        ["focus", `role=dialog >> ${role("button", "More for Late arrivals")}`],
        ["press", "Enter"],
        ["wait", "role=menu"],
      ],
    },
  ],
  // Nav on its own: a disabled item, the current item under the band, a plain item
  location: [
    {
      name: "hover-nav",
      do: [["hover", `#location >> ${role("navigation", "Specimen nav")} >> ${role("button", "Shipments 64")}`]],
    },
    {
      name: "focus-current",
      do: [["focus", `#location >> ${role("navigation", "Specimen nav")} >> ${role("button", "Carriers 9")}`]],
    },
    {
      name: "hover-disabled",
      do: [["hover", `#location >> ${role("navigation", "Specimen nav")} >> ${role("button", "Invoices 3")}`]],
    },
  ],
  // Nav: the demo bar's page links on a whole route
  playground: [
    { name: "hover-nav", do: [["hover", `${role("navigation", "Demo pages")} >> ${role("link", "Specimen")}`]] },
    { name: "focus-nav", do: [["focus", `${role("navigation", "Demo pages")} >> ${role("link", "Specimen")}`]] },
    // a button in a body cell takes the inset ring: an outside one crosses the row keylines, and in the last row the
    // scroller clips it
    { name: "focus-row-action", do: [["focus", role("button", "Actions for PO-4102")]] },
    { name: "focus-row-action-last", do: [["focus", role("button", "Actions for PO-4105")]] },
  ],
  carousel: [
    { name: "focus-next", do: [["focus", `data-testid=cr-one >> ${role("button", "Next slide")}`]] },
    { name: "hover-next", do: [["hover", `data-testid=cr-one >> ${role("button", "Next slide")}`]] },
    {
      // reduced motion: Embla's eased scroll closes on the slide asymptotically, so near the end two frames in a row
      // can raster the same while the track is still a fraction of a pixel short (seen: 1 shot in 8 differed at the
      // slides' edges); the instant move under reduced motion lands on the slide (-414px) at once
      name: "moved",
      reducedMotion: true,
      do: [
        ["focus", `data-testid=cr-one >> ${role("button", "Next slide")}`],
        ["press", "Enter"],
      ],
      show: "data-testid=cr-one >> [data-slot=carousel-content]",
    },
    // position ticks: the hover tint and the focus ring on a tick that is not the current one
    { name: "hover-tick", do: [["hover", `data-testid=cr-one >> ${role("button", "Go to 3 of 5")}`]] },
    { name: "focus-tick", do: [["focus", `data-testid=cr-one >> ${role("button", "Go to 3 of 5")}`]] },
    { name: "focus-tick-rtl", do: [["focus", `data-testid=cr-rtl >> ${role("button", "Go to 2 of 5")}`]] },
  ],
  chart: [
    {
      // the keyboard path: focus the plot, step to a point; the inverse tooltip shows it
      name: "tooltip",
      do: [
        ["focus", "data-testid=ch-bars >> role=application"],
        ["press", "ArrowRight"],
        ["press", "ArrowRight"],
      ],
    },
    { name: "hover-bar", do: [["hover", "data-testid=ch-bars >> .recharts-bar-rectangle >> nth=3"]] },
    { name: "table-view", do: [["click", `#chart >> ${role("radio", "Table")} >> nth=0`]] },
    // the plot's focus ring, before a point is chosen
    { name: "focus-plot", do: [["focus", "data-testid=ch-line >> role=application"]] },
    // a line: the crosshair, the active dot on its surface ring, the reference line's label
    {
      name: "line-tooltip",
      do: [
        ["focus", "data-testid=ch-line >> role=application"],
        ["press", "ArrowRight"],
        ["press", "ArrowRight"],
      ],
    },
    // stacked bars: the category band and the 2px surface gap between segments
    {
      name: "stack-tooltip",
      do: [
        ["focus", "data-testid=ch-stack >> role=application"],
        ["press", "ArrowRight"],
      ],
    },
    { name: "table-view-stack", do: [["click", `data-testid=ch-stack >> ${role("radio", "Table")}`]] },
  ],
  chat: [
    // attachment
    { name: "hover-attachment-action", do: [["hover", `#chat >> role=button[name=/^Retry customs/]`]] },
    { name: "focus-attachment-open", do: [["focus", `#chat >> role=button[name=/^Open CMR/]`]] },
    { name: "hover-attachment-open", do: [["hover", `#chat >> role=button[name=/^Open CMR/]`]] },
    { name: "focus-attachment-action", do: [["focus", `#chat >> ${role("button", "Remove packing-list.xlsx")}`]] },
    {
      name: "hover-attachment-tile-action",
      do: [["hover", `#chat >> ${role("button", "Remove seal-rear-door.jpg")}`]],
    },
    // a file that is a cell of a bubble: the press fill on hover, the inset ring on its open trigger
    {
      name: "hover-attachment-cell",
      do: [["hover", `data-testid=files-only >> ${role("button", "Open dock-4.jpg")}`]],
    },
    {
      name: "hover-attachment-cell-action",
      do: [["hover", `data-testid=files-only >> ${role("button", "Download dock-4.jpg")}`]],
    },
    {
      name: "focus-attachment-cell",
      do: [["focus", `data-testid=files-only >> ${role("button", "Open dock-4.jpg")}`]],
    },
    // bubble reactions
    { name: "focus-reaction", do: [["focus", `#chat >> role=button[name=/^Thumbs up/] >> nth=0`]] },
    { name: "hover-reaction", do: [["hover", `#chat >> role=button[name=/^Thumbs up/] >> nth=0`]] },
    // message
    { name: "hover-link", do: [["hover", "data-testid=bubble-cases >> role=link >> nth=0"]] },
    // message scroller: scrolled up, the jump-to-latest cell shows
    {
      name: "scrolled-up",
      do: [
        ["wheel", "data-testid=ms-frame >> [data-slot=message-scroller-viewport]", -2000],
        ["wait", "data-testid=ms-frame >> [data-slot=message-scroller-button][data-active=true]"],
      ],
    },
    { name: "focus-composer", do: [["focus", "data-testid=ms-input"]] },
    // bubble: the focus ring on a link in a message's text
    { name: "focus-link", do: [["focus", "data-testid=bubble-cases >> role=link >> nth=0"]] },
    // message footer: the Retry button under a message that was not sent
    { name: "focus-retry", do: [["focus", `data-testid=ms-frame >> ${role("button", "Retry")}`]] },
    { name: "hover-retry", do: [["hover", `data-testid=ms-frame >> ${role("button", "Retry")}`]] },
    // a narrow log (the kl-log container): a smaller face, more of the row for the words
    { name: "narrow-panel", do: [["click", `data-testid=ms-width >> ${role("radio", "Narrow panel")}`]] },
    {
      name: "narrow-panel-scrolled",
      do: [
        ["click", `data-testid=ms-width >> ${role("radio", "Narrow panel")}`],
        ["wheel", "data-testid=ms-frame >> [data-slot=message-scroller-viewport]", -400],
        ["wait", "data-testid=ms-frame >> [data-slot=message-scroller-button][data-active=true]"],
      ],
    },
    // message scroller: the jump cell under the pointer and under keyboard focus
    {
      name: "scrolled-up-hover-jump",
      do: [
        ["wheel", "data-testid=ms-frame >> [data-slot=message-scroller-viewport]", -2000],
        ["wait", "data-testid=ms-frame >> [data-slot=message-scroller-button][data-active=true]"],
        ["hover", "data-testid=ms-frame >> [data-slot=message-scroller-button]"],
      ],
    },
    {
      name: "scrolled-up-focus-jump",
      do: [
        ["wheel", "data-testid=ms-frame >> [data-slot=message-scroller-viewport]", -2000],
        ["wait", "data-testid=ms-frame >> [data-slot=message-scroller-button][data-active=true]"],
        ["focus", "data-testid=ms-frame >> [data-slot=message-scroller-button]"],
      ],
    },
  ],
  questionnaire: [
    { name: "hover-choice", do: [["hover", "#questionnaire >> [data-slot=questionnaire-choice] >> nth=1"]] },
    { name: "focus-choice", do: [["focus", "#questionnaire >> [data-slot=questionnaire-choice] input >> nth=0"]] },
    {
      name: "error",
      do: [
        ["click", `#questionnaire >> ${role("button", "Next")}`],
        ["wait", "#questionnaire >> [data-slot=questionnaire-error]"],
      ],
    },
    // a chosen row under the ink band
    { name: "choice-selected", do: [["click", "#questionnaire >> [data-slot=questionnaire-choice] >> nth=1"]] },
    // by keyboard: Space chooses, Enter goes on, and the next step's heading takes focus (its ring)
    {
      name: "focus-title",
      do: [
        ["focus", "#questionnaire >> [data-slot=questionnaire-choice] input >> nth=0"],
        ["press", "Space"],
        ["press", "Enter"],
        ["wait", "#questionnaire >> [data-slot=questionnaire-choice] >> text=Rotterdam"],
      ],
    },
    // the multiple-choice step: checkbox rows, one checked, another under the pointer; Back shows
    {
      name: "multiple-hover",
      do: [
        ["click", "#questionnaire >> [data-slot=questionnaire-choice] >> nth=0"],
        ["click", `#questionnaire >> ${role("button", "Next")}`],
        ["click", `#questionnaire >> [data-slot=questionnaire-choice]:has-text("Rotterdam")`],
        ["hover", `#questionnaire >> [data-slot=questionnaire-choice]:has-text("Antwerp")`],
      ],
    },
    // the free-text step, invalid: the field frame turns red with its ! cell, and the error
    {
      name: "input-error",
      do: [
        ["click", "#questionnaire >> [data-slot=questionnaire-choice] >> nth=0"],
        ["click", `#questionnaire >> ${role("button", "Next")}`],
        ["click", `#questionnaire >> ${role("button", "Skip")}`],
        ["click", `#questionnaire >> ${role("button", "Next")}`],
        ["wait", "#questionnaire >> [data-slot=questionnaire-error] >> text=Enter an email"],
      ],
    },
    { name: "focus-next", do: [["focus", `#questionnaire >> ${role("button", "Next")}`]] },
  ],
  table: [
    { name: "hover-row", do: [["hover", "#table >> tbody tr >> nth=2"]] },
    { name: "focus-checkbox", do: [["focus", "#table >> tbody >> role=checkbox >> nth=0"]] },
    // the selected row hovered; the bulk bar emptied, then every row selected
    { name: "hover-selected-row", do: [["hover", "#table >> tbody tr >> nth=1"]] },
    { name: "bulk-empty", do: [["click", `#table >> ${role("checkbox", "Select SH-20482")}`]] },
    { name: "select-all", do: [["click", `#table >> ${role("checkbox", "Select all")}`]] },
    { name: "hover-expand", do: [["hover", `#table >> ${role("button", "Legs for SH-20481")}`]] },
    { name: "focus-expand", do: [["focus", `#table >> ${role("button", "Legs for SH-20481")}`]] },
  ],
  sort: [
    { name: "focus-header", do: [["focus", "#sort >> th >> role=button >> nth=0"]] },
    { name: "hover-header", do: [["hover", "#sort >> th >> role=button >> nth=1"]] },
    // the sorted header hovered and focused; descending on a numeric (end-aligned) column
    { name: "hover-sorted", do: [["hover", "#sort >> th >> role=button >> nth=2"]] },
    { name: "focus-sorted", do: [["focus", "#sort >> th >> role=button >> nth=2"]] },
    {
      name: "sorted-numeric",
      do: [
        ["focus", "#sort >> th >> role=button >> nth=3"],
        ["press", "Enter"],
      ],
    },
    { name: "empty", do: [["click", `#sort >> ${role("button", "Filter to nothing")}`]] },
  ],
  "multi-sort": [
    { name: "focus-first-level", do: [["focus", "#multi-sort >> th >> role=button >> nth=0"]] },
    { name: "hover-second-level", do: [["hover", "#multi-sort >> th >> role=button >> nth=2"]] },
    { name: "hover-unsorted", do: [["hover", "#multi-sort >> th >> role=button >> nth=1"]] },
  ],
};
