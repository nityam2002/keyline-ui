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
  ],
  chat: [
    // attachment
    { name: "hover-attachment-action", do: [["hover", `#chat >> role=button[name=/^Retry customs/]`]] },
    { name: "focus-attachment-open", do: [["focus", `#chat >> role=button[name=/^Open CMR/]`]] },
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
  ],
  table: [
    { name: "hover-row", do: [["hover", "#table >> tbody tr >> nth=2"]] },
    { name: "focus-checkbox", do: [["focus", "#table >> tbody >> role=checkbox >> nth=0"]] },
  ],
  sort: [
    { name: "focus-header", do: [["focus", "#sort >> th >> role=button >> nth=0"]] },
    { name: "hover-header", do: [["hover", "#sort >> th >> role=button >> nth=1"]] },
  ],
};
