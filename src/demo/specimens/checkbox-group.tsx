import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Form, FormActions, Field, FieldLabel, FieldFrame, FieldInput } from "@/registry/keyline/ui/field";
import { Panel, PanelHeader, PanelBody } from "@/registry/keyline/ui/panel";
import { Popover, PopoverTrigger, PopoverPopup, PopoverHeader, PopoverFooter } from "@/registry/keyline/ui/popover";
import { CheckboxGroup, CheckboxGroupItem } from "@/registry/keyline/ui/checkbox-group";
import { Badge } from "@/registry/keyline/ui/status";

/* ------------------------------------------------------------------ *
 * 2. Checkbox group
 * ------------------------------------------------------------------ */
const EVENTS = [
  { value: "delayed", label: "Delayed", meta: 12, description: "ETA moved by more than two hours" },
  { value: "arrived", label: "Arrived at the dock", meta: 48 },
  { value: "exception", label: "Exception raised by the carrier, customs or the receiving warehouse", meta: 3 },
  {
    value: "invoice",
    label: "Invoice ready",
    meta: 0,
    disabled: true,
    description: "Billing is managed by your finance admin",
  },
];
const REGIONS = ["Benelux", "DACH", "Nordics", "Iberia", "Baltics"].map((r) => ({ value: r.toLowerCase(), label: r }));
export function CheckboxGroupSpecimen() {
  const [events, setEvents] = React.useState<string[]>(["delayed", "exception"]);
  const [values, setValues] = React.useState<Record<string, unknown> | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<string[]>(["transit", "awaiting"]);
  return (
    <div className={ui.stack} data-testid="specimen-cbg">
      <div className={ui.split}>
        <div style={{ width: 380, maxWidth: "100%" }} data-testid="cbg-notify">
          <CheckboxGroup
            legend="Notify me about"
            description="Sent to the shift lead's inbox."
            selectAll="All events"
            options={EVENTS}
            value={events}
            onValueChange={setEvents}
          />
          <p className={ui.note}>Checked: {events.join(", ") || "none"}</p>
        </div>

        <Panel style={{ width: 420, maxWidth: "100%" }} data-testid="cbg-form">
          <PanelHeader title="Carrier access" description="Read from Base UI Form's values on submit." />
          <PanelBody>
            <Form
              orientation="responsive"
              errors={errors}
              aria-label="Carrier access"
              onFormSubmit={(v) => {
                setValues(v);
                setErrors(
                  (v["regions"] as string[]).includes("baltics")
                    ? { regions: "Baltics needs a customs bond on file. Remove it or upload the bond." }
                    : {},
                );
              }}
            >
              <Field name="carrier">
                <FieldLabel>Carrier</FieldLabel>
                <FieldFrame>
                  <FieldInput defaultValue="DSV Road" />
                </FieldFrame>
              </Field>
              <CheckboxGroup
                legend="Regions"
                name="regions"
                selectAll
                options={REGIONS}
                defaultValue={["benelux"]}
                validate={(v) => ((v as string[]).length ? null : "Choose at least one region.")}
              />
              <FormActions>
                <Button type="submit" variant="primary">
                  Save access
                </Button>
              </FormActions>
            </Form>
            <p className={ui.note} data-testid="cbg-values">
              {values ? JSON.stringify(values) : "Not submitted"}
            </p>
          </PanelBody>
        </Panel>
      </div>

      <div className={ui.split}>
        <div className={ui.group}>
          <h3 className={ui.cap}>Cells of a popover: the legend is the header</h3>
          <Popover>
            <PopoverTrigger render={<Button />}>Status · {status.length}</PopoverTrigger>
            <PopoverPopup>
              <PopoverHeader title="Status" />
              <CheckboxGroup
                layout="cell"
                legend="Status"
                value={status}
                onValueChange={setStatus}
                options={[
                  { value: "transit", label: "In transit", meta: 41 },
                  { value: "awaiting", label: "Awaiting pickup", meta: 9 },
                  { value: "late", label: "Late", meta: 6 },
                  { value: "delivered", label: "Delivered", meta: 8 },
                ]}
              />
              <PopoverFooter>
                <Button layout="cell" onClick={() => setStatus([])}>
                  Clear
                </Button>
              </PopoverFooter>
            </PopoverPopup>
          </Popover>
        </div>
        <div className={ui.group}>
          <h3 className={ui.cap}>Custom rows, invalid, disabled</h3>
          <div style={{ display: "grid", gap: 20, width: 340, maxWidth: "100%" }}>
            <CheckboxGroup legend="Labels to print" invalid error="Pick at least one label." defaultValue={[]}>
              <CheckboxGroupItem value="pallet" label="Pallet label" meta={<Badge>A6</Badge>} />
              <CheckboxGroupItem value="dg" label="Dangerous goods" meta={<Badge>A5</Badge>} />
            </CheckboxGroup>
            <CheckboxGroup
              legend="Archived channels"
              disabled
              defaultValue={["email"]}
              options={[
                { value: "email", label: "Email" },
                { value: "sms", label: "SMS" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
