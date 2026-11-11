"use client"

import { Phone } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Item, ItemContent, ItemList, ItemMedia, ItemMeta } from "@/components/keyline/ui/item"
import { Panel, PanelBody, PanelHeader } from "@/components/keyline/ui/panel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, usePanelRef } from "@/components/keyline/ui/resizable"

const CALLS = [
  { id: "c1", who: "Lackawanna County", when: "9:12", note: "Wants 40 more cases before the county fair. Dwight promised Thursday." },
  { id: "c2", who: "Blue Cross of Pennsylvania", when: "10:40", note: "Asked about the recycled stock. Jim is sending samples." },
  { id: "c3", who: "Vance Refrigeration", when: "13:05", note: "Nobody at the dock to sign. Bob says try again tomorrow at nine." },
]

const phone = <Phone size={16} aria-hidden="true" />

export function CallLog() {
  const [chosen, setChosen] = useState("c1")
  const [listHidden, setListHidden] = useState(false)
  const list = usePanelRef()
  const call = CALLS.find((c) => c.id === chosen)!

  return (
    <Panel>
      <PanelHeader
        title="Today's calls"
        actions={
          // dragging needs a pointer alternative: this button collapses and restores the list
          <Button layout="cell" onClick={() => (listHidden ? list.current?.expand() : list.current?.collapse())}>
            {listHidden ? "Show list" : "Hide list"}
          </Button>
        }
      />
      <PanelBody flush>
        {/* the group fills its parent's height, and a Panel body's rows size to their content: give it a box */}
        <div className="h-[340px]">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel id="calls" panelRef={list} defaultSize="55%" minSize="35%" collapsible onResize={(s) => setListHidden(s.asPercentage === 0)}>
              {/* the pane is usually taller than three rows: close the last row so it doesn't dangle */}
              <ItemList layout="cell" aria-label="Today's calls" className="[&>:last-child]:border-b [&>:last-child]:border-kl-line">
                {CALLS.map((c) => (
                  <Item key={c.id} current={c.id === chosen} render={<button type="button" />} onClick={() => setChosen(c.id)}>
                    {/* the media cell is what floods for the current row */}
                    <ItemMedia>{phone}</ItemMedia>
                    <ItemContent title={c.who} />
                    <ItemMeta>{c.when}</ItemMeta>
                  </Item>
                ))}
              </ItemList>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Call list height" />
            <ResizablePanel id="note" minSize="25%">
              <div className="grid gap-2 p-4 text-[14px]">
                <h3 className="m-0 text-[15px] font-semibold">{call.who}</h3>
                <p className="m-0 text-kl-ink-2">{call.note}</p>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PanelBody>
    </Panel>
  )
}
