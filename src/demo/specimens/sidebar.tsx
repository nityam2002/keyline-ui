import * as React from "react"
import * as ui from "../demo-ui"
import { Segmented,SegmentedItem } from "@/registry/keyline/ui/segmented"
import { AppShell } from "@/registry/keyline/ui/app-shell"
import { Nav,NavIdentity,NavAction,type NavGroup } from "@/registry/keyline/ui/nav"
import { Menu,MenuTrigger,MenuContent,MenuItem,MenuSeparator } from "@/registry/keyline/ui/menu"
import { Panel,PanelHeader,PanelBody } from "@/registry/keyline/ui/panel"

/* ------------------------------------------------------------------ *
 * 3. Sidebar: AppShell + Nav (wide, rail, sheet, nested links, row actions)
 * ------------------------------------------------------------------ */
const ic = (d: string) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square">
    <path d={d} />
  </svg>
)
export const ICONS = {
  ship: ic("M1.5 4.5h9v7h-9zM10.5 7.5h3l1 2v2h-4M4 13.5a1 1 0 1 0 0-.01M12 13.5a1 1 0 1 0 0-.01"),
  dock: ic("M1.5 14.5v-8l6.5-4 6.5 4v8M4.5 14.5v-5h7v5"),
  report: ic("M2.5 14.5v-5M6.5 14.5v-9M10.5 14.5v-7M14.5 14.5v-12"),
  view: ic("M1.5 3.5h13M1.5 8h13M1.5 12.5h8"),
  people: ic("M5.5 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M1 14.5c.5-3 2-4.5 4.5-4.5s4 1.5 4.5 4.5M11 2.5a2.5 2.5 0 0 1 0 5M12.5 10c1.5.5 2.3 2 2.5 4.5"),
}
function ViewActions({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <Menu>
      <MenuTrigger render={<NavAction label={`More for ${name}`} />} />
      <MenuContent align="end" attachWeight={1}>
        <MenuItem>Rename</MenuItem>
        <MenuItem>Duplicate</MenuItem>
        <MenuSeparator />
        <MenuItem variant="destructive" onClick={onRemove}>Delete view</MenuItem>
      </MenuContent>
    </Menu>
  )
}
export function SidebarSpecimen() {
  const [width, setWidth] = React.useState("wide")
  const [place, setPlace] = React.useState("ontime")
  const [views, setViews] = React.useState(["Late arrivals", "Reefers this week", "Customs holds"])
  const label = (v: string) => ({ shipments: "Shipments", docks: "Dock schedule", ontime: "On-time", exceptions: "Exceptions", scorecards: "Carrier scorecards", carriers: "Carriers" })[v] ?? v
  const groups: NavGroup[] = [
    {
      label: "Operate",
      items: [
        { value: "shipments", label: "Shipments", count: 64, icon: ICONS.ship },
        { value: "docks", label: "Dock schedule", icon: ICONS.dock },
        {
          value: "reports",
          label: "Reports",
          icon: ICONS.report,
          items: [
            { value: "ontime", label: "On-time" },
            { value: "exceptions", label: "Exceptions", count: 3 },
            { value: "scorecards", label: "Carrier scorecards" },
          ],
        },
        { value: "carriers", label: "Carriers", count: 9, icon: ICONS.people },
      ],
    },
    {
      label: "Saved views",
      items: views.map((v) => ({ value: v, label: v, icon: ICONS.view, action: <ViewActions name={v} onRemove={() => setViews((all) => all.filter((x) => x !== v))} /> })),
    },
  ]
  return (
    <div className={ui.stack} data-testid="specimen-sidebar">
      <Segmented value={width} onValueChange={setWidth} aria-label="Sidebar demo width">
        <SegmentedItem value="wide">Wide (toggle: rail)</SegmentedItem>
        <SegmentedItem value="narrow">600px (sheet)</SegmentedItem>
      </Segmented>
      <div className={ui.shellBox} data-width={width}>
        <AppShell
          narrowAt={640}
          asideInlineAt={1000}
          collapse="rail"
          navLabel="Navigation"
          navSize={248}
          nav={<Nav layout="cell" label="Main" header={<NavIdentity mark="N" title="Northwind Freight" meta="EU-WEST" />} groups={groups} value={place} onValueChange={setPlace} />}
          header={<span className="flex items-center px-kl-inset font-kl-strong">{label(place)}</span>}
        >
          <Panel style={{ minHeight: 560 }}>
            <PanelHeader title={label(place)} headingLevel={3} />
            <PanelBody>
              <p className={ui.note}>Press the header's first cell to collapse the sidebar to its rail; a nested item on the rail widens it again. At 600px the sidebar is a start sheet.</p>
            </PanelBody>
          </Panel>
        </AppShell>
      </div>
    </div>
  )
}
