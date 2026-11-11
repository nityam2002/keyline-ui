import { cn } from "@/lib/utils"
import * as ui from "../demo-ui"
import { Segmented,SegmentedItem } from "@/registry/keyline/ui/segmented"
import { Tabs,TabsList,TabsTab } from "@/registry/keyline/ui/tabs"
import { ToggleGroup,ToggleGroupItem } from "@/registry/keyline/ui/toggle-group"
import { Nav } from "@/registry/keyline/ui/nav"

/* ------------------------------------------------------------------ *
 * 3b. Scroll edges on cell rows
 * ------------------------------------------------------------------ */
const VIEWS = ["All", "Active", "Needs attention", "Delivered", "Cancelled", "Drafts", "Archived"]
export function ScrollEdgesSpecimen() {
  return (
    <div className={cn(ui.stack, ui.narrow)} data-testid="specimen-edges">
      <Tabs defaultValue="All">
        <TabsList aria-label="Views (scrolls)">
          {VIEWS.map((v, i) => (
            <TabsTab key={v} value={v} count={[64, 41, 9, 23, 2, 5, 120][i]}>
              {v}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      <ToggleGroup aria-label="Status filters (scrolls)" defaultValue={["transit"]}>
        {["In transit", "Awaiting docs", "Delayed", "Booked", "Not booked"].map((v) => (
          <ToggleGroupItem key={v} value={v.toLowerCase().replace(/ /g, "-")}>
            {v}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Segmented defaultValue="day" aria-label="Range (scrolls)">
        {["Day", "Week", "Fortnight", "Month", "Quarter", "Year"].map((v) => (
          <SegmentedItem key={v} value={v.toLowerCase()}>
            {v}
          </SegmentedItem>
        ))}
      </Segmented>
      <Nav orientation="horizontal" label="Sections (scrolls)" value="docks" items={[
        { value: "shipments", label: "Shipments", count: 64 },
        { value: "carriers", label: "Carriers", count: 9 },
        { value: "docks", label: "Dock schedule" },
        { value: "invoices", label: "Invoices", count: 3 },
        { value: "reports", label: "Reports" },
      ]} />
      <Tabs defaultValue="All">
        <TabsList aria-label="Views (fits)">
          {VIEWS.slice(0, 2).map((v) => (
            <TabsTab key={v} value={v}>
              {v}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
