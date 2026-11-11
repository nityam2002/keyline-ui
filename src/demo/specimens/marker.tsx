import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Marker,MarkerIcon,MarkerContent } from "@/registry/keyline/ui/marker"
import { ICONS } from "./sidebar"

export function MarkerSpecimen() {
  const [busy, setBusy] = React.useState(true)
  return (
    <div className={ui.stack} style={{ maxWidth: 420 }} data-testid="specimen-marker">
      <Marker variant="separator">
        <MarkerContent>Yesterday</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>{ICONS.ship}</MarkerIcon>
        <MarkerContent>Assigned SH-20483 to DHL Freight</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>Customs · 2 steps</MarkerContent>
      </Marker>
      <Marker pending={busy}>
        <MarkerIcon>{busy ? ICONS.report : <span className="kl-glyph" data-kind="done" />}</MarkerIcon>
        <MarkerContent>{busy ? "Checking the customs declaration…" : "Customs declaration checked"}</MarkerContent>
      </Marker>
      <Button onClick={() => setBusy(!busy)}>{busy ? "Finish the check" : "Run the check again"}</Button>
    </div>
  )
}
