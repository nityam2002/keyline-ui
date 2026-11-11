"use client"

import { Panel, PanelBody, PanelGrid, PanelHeader } from "@/components/keyline/ui/panel"
import { Status } from "@/components/keyline/ui/status"

export function BranchBoard() {
  return (
    <PanelGrid min={200}>
      <Panel layout="cell">
        <PanelHeader headingLevel={3} title="Sales this week" />
        <PanelBody>
          <p className="m-0 text-[28px] leading-none font-semibold tabular-nums">1,810 reams</p>
        </PanelBody>
      </Panel>
      <Panel layout="cell">
        <PanelHeader headingLevel={3} title="Deliveries" />
        <PanelBody className="grid gap-2 text-[14px]">
          <Status kind="done">14 delivered</Status>
          <Status kind="attention">1 held at Vance Refrigeration</Status>
        </PanelBody>
      </Panel>
      <Panel layout="cell">
        <PanelHeader headingLevel={3} title="Paper stock" />
        <PanelBody>
          <p className="m-0 text-[14px]">30 cases of letter. Reorder by Friday.</p>
        </PanelBody>
      </Panel>
    </PanelGrid>
  )
}
