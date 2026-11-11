import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Slider } from "@/registry/keyline/ui/slider"
import { Panel,PanelHeader,PanelFooter } from "@/registry/keyline/ui/panel"

/* ------------------------------------------------------------------ */
export function SliderSpecimen() {
  const [load, setLoad] = React.useState(12)
  const [hours, setHours] = React.useState<number[]>([8, 17])
  const [hue, setHue] = React.useState(262)
  return (
    <>
      <div className={ui.grid2}>
        <Slider label="Axle load" unit="t" min={0} max={40} step={0.5} value={load} onValueChange={setLoad} format={{ minimumFractionDigits: 1 }} name="axle" />
        <Slider label="Delivery window" unit="h" min={0} max={24} value={hours} onValueChange={(v) => setHours([...v])} minStepsBetweenValues={1} />
        <Slider label="Commit hue" unit="°" min={0} max={359} value={hue} onValueChange={setHue} railStyle={{ background: "linear-gradient(to right in oklch longer hue, oklch(0.62 0.17 0), oklch(0.62 0.17 359))" }} />
        <Slider label="Buffer (disabled)" unit="%" defaultValue={30} disabled />
      </div>
      <div className={ui.split}>
        <div className={ui.panel} data-kl-density="compact">
          <Panel>
            <PanelHeader title="Compact, as a cell" description="A slider can be a cell of a footer row" headingLevel={3} />
            <PanelFooter>
              <Slider layout="cell" label="Zoom" unit="%" min={50} max={200} step={10} defaultValue={100} />
              <Button layout="cell">Reset</Button>
            </PanelFooter>
          </Panel>
        </div>
      </div>
    </>
  )
}
