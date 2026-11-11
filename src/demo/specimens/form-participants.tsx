import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Form,FormActions } from "@/registry/keyline/ui/field"
import { Select } from "@/registry/keyline/ui/select"
import { Combobox } from "@/registry/keyline/ui/combobox"
import { Slider } from "@/registry/keyline/ui/slider"
import { NumberField } from "@/registry/keyline/ui/number-field"
import { TimeField } from "@/registry/keyline/ui/time-field"
import { Panel,PanelHeader,PanelBody } from "@/registry/keyline/ui/panel"
import { CARRIERS,searchCarriers } from "@/registry/keyline/blocks/shipments/shipments-data"

const SERVICES = [
  { value: "eco", label: "Economy" },
  { value: "std", label: "Standard" },
  { value: "exp", label: "Express", description: "Same-day pickup before 11:00" },
]
/* ------------------------------------------------------------------ *
 * 1. Select, Combobox, Slider (and TimeField) as Field participants
 * ------------------------------------------------------------------ */
export function FieldParticipantsSpecimen() {
  const [values, setValues] = React.useState<Record<string, unknown> | null>(null)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  return (
    <div className={ui.split}>
      <Panel>
        <PanelHeader title="Reefer booking" description="Everything here is read from Base UI Form's values." />
        <PanelBody>
          <Form
            orientation="responsive"
            errors={errors}
            aria-label="Reefer booking"
            onFormSubmit={(v) => {
              setValues(v)
              setErrors({})
            }}
          >
            <Select label="Service level" name="service" options={SERVICES} placeholder="Choose a service" validate={(v) => (v ? null : "Choose a service level.")} />
            <Combobox label="Carrier" name="carrier" options={CARRIERS} placeholder="Any carrier" required description="Required: the carrier signs the reefer log." />
            <Combobox label="Backup carrier" name="backup" noun={["carrier", "carriers"]} loadOptions={searchCarriers} placeholder="Type to search" />
            <Slider label="Set point" name="setpoint" unit="°C" min={-25} max={25} step={0.5} defaultValue={4} validate={(v) => ((v as number) > 8 ? "Chilled goods ride at 8 °C or colder." : null)} />
            <Slider label="Humidity band" name="humidity" unit="%" min={50} max={100} defaultValue={[75, 90]} />
            <NumberField label="Pallets" name="pallets" unit="PLT" min={1} max={33} defaultValue={18} />
            <TimeField label="Pickup" name="pickup" zone="CET" minuteStep={15} required defaultValue="09:30" />
            <FormActions>
              <Button type="submit" variant="primary">
                Check booking
              </Button>
              <Button
                type="button"
                variant="quiet"
                onClick={() =>
                  setErrors({
                    service: "Express is sold out for Friday.",
                    carrier: "This carrier has no reefer slots this week.",
                    setpoint: "The unit on this trailer holds 2 °C at best.",
                    pickup: "The dock closes at 16:00 on Fridays.",
                  })
                }
              >
                Simulate server errors
              </Button>
            </FormActions>
          </Form>
        </PanelBody>
      </Panel>
      <div className={ui.stack}>
        <p className={ui.note}>Base UI Form values on submit (one key per named Field participant):</p>
        <pre className="m-0 min-h-[6em] px-3 py-2.5 [border:var(--kl-k1)_solid_var(--kl-line-soft)] bg-kl-tint [font:12px/1.45_var(--kl-font-mono)] whitespace-pre-wrap [overflow-wrap:anywhere]" data-testid="specimen-values">
          {values ? JSON.stringify(values, null, 2) : "Not submitted yet."}
        </pre>
        <Panel>
          <PanelHeader title="As cells" description="The message is visually hidden; the ! cell and red edge are the visible signal." />
          <div className="kl-cells">
            <Select layout="cell" label="Service level" options={SERVICES} defaultValue="exp" invalid error="Express is sold out for Friday." />
            <Combobox layout="cell" label="Carrier" options={CARRIERS} defaultValue="Maersk" invalid error="No reefer slots this week." />
          </div>
        </Panel>
        <Select label="Service level (disabled)" options={SERVICES} defaultValue="std" disabled />
      </div>
    </div>
  )
}
