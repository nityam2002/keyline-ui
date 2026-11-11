import * as React from "react"
import * as ui from "../demo-ui"
import { NumberField } from "@/registry/keyline/ui/number-field"
import { Slider } from "@/registry/keyline/ui/slider"
import { Panel,PanelHeader } from "@/registry/keyline/ui/panel"

/* ------------------------------------------------------------------ */
export function NumberFieldSpecimen() {
  const [pallets, setPallets] = React.useState<number | null>(24)
  const [temp, setTemp] = React.useState<number>(4)
  return (
    <div className={ui.grid2}>
      <NumberField label="Pallets" unit="PLT" min={1} max={33} value={pallets} onValueChange={setPallets} name="pallets" description="A 13.6 m trailer takes 33." />
      <NumberField label="Pallets (at the minimum)" unit="PLT" min={1} max={33} defaultValue={1} />
      <NumberField label="Declared value" format={{ style: "currency", currency: "EUR" }} locale="de-DE" defaultValue={12500} step={100} largeStep={1000} steppers={false} />
      <NumberField label="Gross weight" unit="kg" invalid error="Exceeds the trailer’s 24 000 kg payload." defaultValue={26400} step={100} />
      <NumberField label="Seals" defaultValue={2} disabled />
      <NumberField label="Reefer set point for the full journey, including the transshipment at Algeciras" unit="°C" min={-25} max={25} step={0.5} format={{ minimumFractionDigits: 1 }} value={temp} onValueChange={(v) => v != null && setTemp(v)} />
      <Slider label="Reefer set point (paired)" unit="°C" min={-25} max={25} step={0.5} value={temp} onValueChange={(v) => setTemp(v as number)} />
      <Panel>
        <PanelHeader title="Load (cells)" />
        <div className="kl-cells">
          <NumberField layout="cell" label="Length" unit="cm" defaultValue={120} />
          <NumberField layout="cell" label="Width" unit="cm" defaultValue={80} />
        </div>
      </Panel>
    </div>
  )
}
