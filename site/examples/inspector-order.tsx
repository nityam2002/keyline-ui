"use client"

import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Inspector, InspectorActions, InspectorBody, InspectorFacts, InspectorHeader, InspectorRow, InspectorSection } from "@/components/keyline/ui/inspector"
import { Item, ItemContent, ItemList, ItemMedia } from "@/components/keyline/ui/item"
import { Status } from "@/components/keyline/ui/status"

const ORDERS = [
  { id: "DM-4107", client: "Lackawanna County", cases: 120, rep: "Dwight Schrute", due: "Thu 12 Nov", held: false },
  { id: "DM-4109", client: "Vance Refrigeration", cases: 12, rep: "Phyllis Vance", due: "Wed 11 Nov", held: true },
  { id: "DM-4112", client: "Scranton Business Park", cases: 40, rep: "Jim Halpert", due: "Fri 13 Nov", held: false },
]

export function OrderInspector() {
  const [id, setId] = useState<string | null>("DM-4109")
  const [released, setReleased] = useState<string[]>([])
  const o = ORDERS.find((x) => x.id === id)
  const held = o ? o.held && !released.includes(o.id) : false

  return (
    <div className="grid items-start gap-4 @container md:grid-cols-[1fr_minmax(0,300px)]">
      <ItemList aria-label="Orders">
        {ORDERS.map((x) => (
          <Item key={x.id} current={x.id === id} render={<button type="button" />} onClick={() => setId(x.id)}>
            <ItemMedia>{x.id.slice(3)}</ItemMedia>
            <ItemContent title={x.client} description={x.rep} />
          </Item>
        ))}
      </ItemList>
      {o ? (
        <Inspector aria-label={`Order ${o.id}`}>
          <InspectorHeader
            code={o.id}
            title={o.client}
            status={held ? <Status kind="attention">Held</Status> : <Status kind="normal">Scheduled</Status>}
            onClose={() => setId(null)}
          />
          <InspectorBody>
            <InspectorFacts
              items={[
                { label: "Cases", value: o.cases },
                { label: "Due", value: o.due },
              ]}
            />
            <InspectorRow>
              <InspectorSection>
                <h3 className="m-0 text-[13px] font-semibold">Rep</h3>
                <p className="m-0 text-[14px]">{o.rep}</p>
              </InspectorSection>
              <InspectorSection>
                <h3 className="m-0 text-[13px] font-semibold">Note</h3>
                <p className="m-0 text-[14px]">{held ? "No one at the dock to sign." : "None."}</p>
              </InspectorSection>
            </InspectorRow>
          </InspectorBody>
          <InspectorActions>
            <Button layout="cell" variant="primary" disabled={!held} onClick={() => setReleased((r) => [...r, o.id])}>
              {held ? "Release the hold" : "Not held"}
            </Button>
          </InspectorActions>
        </Inspector>
      ) : (
        <p className="m-0 text-[14px] text-kl-ink-2">Choose an order to inspect it.</p>
      )}
    </div>
  )
}
