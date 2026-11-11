import * as React from "react"
import { cn } from "@/lib/utils"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Progress } from "@/registry/keyline/ui/progress"
import { Panel,PanelHeader,PanelBody,PanelFooter } from "@/registry/keyline/ui/panel"

/* ------------------------------------------------------------------ */
export function ProgressSpecimen() {
  const [v, setV] = React.useState(64)
  const [failed, setFailed] = React.useState(true)
  return (
    <div className={ui.split}>
      <div className={ui.panel}>
        <Panel>
          <PanelHeader title="Uploads" description="Customs pack for SH-2207" headingLevel={3} />
          <PanelBody className={ui.stack}>
            <Progress label="Commercial invoice.pdf" value={100} detail="212 KB · uploaded" />
            <Progress label="Packing list.xlsx" value={v} detail={`${((88 * v) / 100).toFixed(0)} of 88 KB · about ${Math.max(1, Math.round((100 - v) / 12))} s left`} />
            <Progress label="Scanning for viruses" value={null} detail="This usually takes under a minute" />
            <Progress label="EUR.1 certificate.pdf" value={failed ? 38 : 0} failed={failed} detail={failed ? "The connection dropped at 38%. Retry; the upload resumes where it stopped." : "Queued"} />
          </PanelBody>
          <PanelFooter>
            <Button layout="cell" onClick={() => setV((x) => (x >= 100 ? 0 : Math.min(100, x + 12)))}>Advance</Button>
            <Button layout="cell" onClick={() => setFailed((f) => !f)}>{failed ? "Retry" : "Fail again"}</Button>
          </PanelFooter>
        </Panel>
      </div>
      <div className={cn(ui.narrow, ui.stack)}>
        <Progress label="Label hidden (in a table cell)" hideLabel value={30} />
        <Progress label="A long task name that wraps onto a second line next to its readout" value={7} />
      </div>
    </div>
  )
}
