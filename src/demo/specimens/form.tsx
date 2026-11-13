import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { NumberField } from "@/registry/keyline/ui/number-field";
import {
  Form,
  FormActions,
  Field,
  FieldLabel,
  FieldFrame,
  FieldControl,
  FieldTextarea,
  FieldDescription,
  FieldError,
  FieldAffix,
} from "@/registry/keyline/ui/field";
import { Select } from "@/registry/keyline/ui/select";
import { Combobox } from "@/registry/keyline/ui/combobox";
import { CheckboxField } from "@/registry/keyline/ui/checkbox";
import { Segmented, SegmentedItem } from "@/registry/keyline/ui/segmented";
import { Notice } from "@/registry/keyline/ui/notice";
import { Panel, PanelHeader, PanelBody } from "@/registry/keyline/ui/panel";
import { searchCarriers } from "@/registry/keyline/blocks/shipments/shipments-data";

/* ------------------------------------------------------------------ */
const CARRIERS = [
  { value: "rhenus", label: "Rhenus Logistics", code: "RHE" },
  { value: "dsv", label: "DSV Road", code: "DSV" },
  { value: "dhl", label: "DHL Freight", code: "DHL" },
];
export function FormSpecimen() {
  const [orientation, setOrientation] = React.useState<"responsive" | "horizontal" | "vertical">("responsive");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saved, setSaved] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  // Base UI Form's values hold every named Field participant: Field, NumberField and Select,
  // Combobox and Slider, so the form reads them all from `values`.
  const formRef = React.useRef<HTMLFormElement>(null);
  return (
    <div className={ui.stack}>
      <Segmented
        value={orientation}
        onValueChange={(v) => setOrientation(v as typeof orientation)}
        aria-label="Orientation"
      >
        <SegmentedItem value="responsive">Responsive</SegmentedItem>
        <SegmentedItem value="horizontal">Horizontal</SegmentedItem>
        <SegmentedItem value="vertical">Vertical</SegmentedItem>
      </Segmented>
      <Panel>
        <PanelHeader title="Book a pickup" />
        <PanelBody>
          <Form
            ref={formRef}
            orientation={orientation}
            errors={errors}
            aria-label="Book a pickup"
            onFormSubmit={(values) => {
              setSaved(null);
              setPending(true);
              setTimeout(() => {
                setPending(false);
                const ref = String(values["reference"] ?? "");
                if (ref.toUpperCase().startsWith("DUP"))
                  setErrors({ reference: `${ref} is already booked for this week.` });
                else {
                  setErrors({});
                  setSaved(
                    `${ref} · ${values["pallets"]} PLT · ${values["service"]}${values["carrier"] ? ` · ${values["carrier"]}` : ""}`,
                  );
                }
              }, 500);
            }}
          >
            {saved ? (
              <Notice tone="done" title="Pickup booked" description={saved} live data-kl-span="control" />
            ) : null}
            <Field
              name="reference"
              validate={(v) => ((typeof v === "string" ? v : "").trim() ? null : "Enter the shipment reference.")}
            >
              <FieldLabel>Reference</FieldLabel>
              <FieldFrame>
                <FieldControl placeholder="SH-24-0193" autoComplete="off" />
              </FieldFrame>
              <FieldDescription>Type “DUP-1” to see a server error.</FieldDescription>
              <FieldError />
            </Field>
            <NumberField
              label="Pallets"
              name="pallets"
              unit="PLT"
              min={1}
              max={33}
              defaultValue={12}
              required
              error="Between 1 and 33 pallets."
            />
            <Select
              label="Service level"
              name="service"
              defaultValue="std"
              options={[
                { value: "eco", label: "Economy" },
                { value: "std", label: "Standard" },
                { value: "exp", label: "Express" },
              ]}
            />
            <Combobox label="Carrier" name="carrier" options={CARRIERS} placeholder="Any carrier" />
            <Combobox
              label="Backup carrier (search)"
              name="backup"
              noun={["carrier", "carriers"]}
              loadOptions={searchCarriers}
              placeholder="Type to search"
            />
            <Field name="window">
              <FieldLabel>Loading window at the shipper’s dock, local time</FieldLabel>
              <FieldFrame>
                <FieldControl placeholder="08:00" />
                <FieldAffix>to</FieldAffix>
                <FieldControl placeholder="16:00" aria-label="Window end" />
              </FieldFrame>
            </Field>
            <Field name="notes">
              <FieldLabel>Notes for the driver</FieldLabel>
              <FieldFrame>
                <FieldTextarea placeholder="Gate 4, ask for Marta" />
              </FieldFrame>
            </Field>
            <div data-kl-span="control" className={ui.stackTight}>
              <CheckboxField label="Tail-lift needed" name="taillift" />
              <CheckboxField
                label="Notify the consignee"
                description="Sends the ETA by e-mail when the truck leaves."
                name="notify"
                defaultChecked
              />
            </div>
            <FormActions>
              <Button type="submit" variant="primary" signal={pending ? "pending" : "idle"}>
                Book pickup
              </Button>
              <Button type="reset" variant="quiet" onClick={() => (setErrors({}), setSaved(null))}>
                Reset
              </Button>
            </FormActions>
          </Form>
        </PanelBody>
      </Panel>
    </div>
  );
}
