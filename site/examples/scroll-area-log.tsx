"use client"

import { Item, ItemContent, ItemList, ItemMeta } from "@/components/keyline/ui/item"
import { Panel, PanelBody, PanelHeader } from "@/components/keyline/ui/panel"
import { ScrollArea } from "@/components/keyline/ui/scroll-area"

const WHO = ["Dwight", "Jim", "Phyllis", "Stanley", "Andy", "Darryl"]
const WHAT = ["closed a sale with", "called", "emailed a quote to", "delivered to", "followed up with", "visited"]
const CLIENTS = ["Lackawanna County", "Blue Cross of Pennsylvania", "Vance Refrigeration", "Scranton Business Park", "Penn Paper Supply", "Mount Airy Casino"]

// a day's activity, a line every quarter of an hour from 9:00
const LOG = Array.from({ length: 32 }, (_, i) => {
  const m = 9 * 60 + i * 15
  return {
    at: `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`,
    line: `${WHO[i % 6]} ${WHAT[(i * 5) % 6]} ${CLIENTS[(i * 7) % 6]}`,
  }
})

export function ActivityLog() {
  return (
    <Panel>
      <PanelHeader title="Today's activity" description="32 entries since 9:00" />
      <PanelBody flush>
        <ScrollArea label="Today's activity" className="h-[260px]">
          <ItemList layout="cell" aria-label="Activity">
            {LOG.map((l) => (
              <Item key={l.at}>
                <ItemContent title={l.line} />
                <ItemMeta>{l.at}</ItemMeta>
              </Item>
            ))}
          </ItemList>
        </ScrollArea>
      </PanelBody>
    </Panel>
  )
}
