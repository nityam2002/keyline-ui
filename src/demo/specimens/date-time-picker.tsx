import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Form,FormActions } from "@/registry/keyline/ui/field"
import { DatePicker,DateTimePicker } from "@/registry/keyline/ui/date-picker"
import { Panel,PanelHeader,PanelBody } from "@/registry/keyline/ui/panel"
import { TODAY,isUnavailable } from "@/registry/keyline/blocks/shipments/shipments-data"

const at = (d: Date, h: number, m: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m)
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const stamp = (d: Date | null) =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "null"
/* ------------------------------------------------------------------ *
 * 2. DateTimePicker
 * ------------------------------------------------------------------ */
export function DateTimeSpecimen() {
  const [v, setV] = React.useState<Date | null>(at(TODAY, 14, 30))
  const [submitted, setSubmitted] = React.useState<string>("—")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const presets = [
    { label: "Today", date: () => TODAY },
    { label: "Tomorrow 08:00", date: () => at(addDays(TODAY, 1), 8, 0) },
  ]
  return (
    <div className={ui.stack} data-testid="specimen-dtp">
      <div className={ui.grid2}>
        <DateTimePicker
          label="Collection"
          value={v}
          onValueChange={setV}
          today={TODAY}
          zone="CET"
          minuteStep={5}
          presets={presets}
          isDateUnavailable={isUnavailable}
        />
        <DateTimePicker label="Delivery window opens (12-hour)" defaultValue={at(addDays(TODAY, 2), 9, 0)} today={TODAY} hourCycle={12} locale="en-US" />
        <DateTimePicker label="Empty" today={TODAY} defaultMonth={TODAY} />
        <DateTimePicker label="Customs inspection (booked by the broker)" defaultValue={at(addDays(TODAY, 3), 11, 15)} today={TODAY} disabled />
      </div>
      <p className={ui.note} data-testid="dtp-log">
        Collection: {stamp(v)}
      </p>

      <div className={ui.split}>
        <Panel style={{ flex: "1 1 360px", minWidth: 0, maxWidth: 520 }}>
          <PanelHeader title="Book a dock slot" description="Base UI Form: required, validate and a server error, by name." />
          <PanelBody>
            <Form
              errors={errors}
              onFormSubmit={(values) => {
                setSubmitted(JSON.stringify(values))
                setErrors({})
              }}
              data-testid="dtp-form"
            >
              <DateTimePicker
                label="Slot"
                name="slot"
                required
                today={TODAY}
                defaultMonth={TODAY}
                validate={(val) => (typeof val === "string" && val && +val.slice(11, 13) < 6 ? "The dock opens at 06:00." : null)}
              />
              <DatePicker label="Day only (uncontrolled)" name="day" defaultValue={TODAY} today={TODAY} />
              <FormActions>
                <Button type="submit" variant="primary">
                  Book slot
                </Button>
                <Button type="button" variant="quiet" onClick={() => setErrors({ slot: "Dock 4 was just booked for that time." })}>
                  Simulate server error
                </Button>
              </FormActions>
            </Form>
            <p className={ui.note} data-testid="dtp-submitted">
              Submitted: {submitted}
            </p>
          </PanelBody>
        </Panel>
        <div className={ui.group} style={{ flex: "1 1 300px", minWidth: 0 }}>
          <h3 className={ui.cap}>As a cell of a frame (a filter row)</h3>
          <div className="kl-ctl kl-cells" style={{ maxWidth: 520 }} data-testid="dtp-cell-row">
            <DateTimePicker layout="cell" label="From" today={TODAY} defaultValue={at(TODAY, 6, 0)} />
            <DateTimePicker layout="cell" label="To" today={TODAY} defaultValue={at(TODAY, 18, 0)} invalid error="Ends before it starts." />
          </div>
        </div>
      </div>
    </div>
  )
}
