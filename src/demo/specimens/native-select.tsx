import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Form, FormActions } from "@/registry/keyline/ui/field";
import { NativeSelect } from "@/registry/keyline/ui/native-select";

/* ------------------------------------------------------------------ *
 * 2. Native select
 * ------------------------------------------------------------------ */
const TERMINALS = [
  {
    group: "Rotterdam",
    options: [
      { value: "RTM-ECT", label: "ECT Delta" },
      { value: "RTM-APM2", label: "APM Terminals Maasvlakte II" },
      { value: "RTM-RWG", label: "Rotterdam World Gateway" },
    ],
  },
  {
    group: "Antwerp",
    options: [
      { value: "ANR-PSA", label: "PSA Europa Terminal" },
      { value: "ANR-MPET", label: "MSC PSA European Terminal", disabled: true },
    ],
  },
];
export function NativeSelectSpecimen() {
  const [submitted, setSubmitted] = React.useState("—");
  const [country, setCountry] = React.useState("NL");
  return (
    <div className={ui.stack} data-testid="specimen-ns">
      <div className={ui.grid2}>
        <Form onFormSubmit={(v) => setSubmitted(JSON.stringify(v))} data-testid="ns-form">
          <NativeSelect
            label="Delivery terminal"
            name="terminal"
            placeholder="Choose a terminal"
            required
            options={TERMINALS}
            description="Terminals closed for the night are not listed."
            data-testid="ns-terminal"
          />
          <NativeSelect
            label="Country"
            name="country"
            autoComplete="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            options={[
              { value: "NL", label: "Netherlands" },
              { value: "BE", label: "Belgium" },
              { value: "DE", label: "Germany" },
            ]}
          />
          <FormActions>
            <Button type="submit" variant="primary">
              Book slot
            </Button>
          </FormActions>
          <p className={ui.note} data-testid="ns-submitted">
            Submitted: {submitted}
          </p>
        </Form>
        <div className={ui.stackTight}>
          <NativeSelect
            label="Hazard class"
            invalid
            error="Class 1 cargo needs a permit number first."
            defaultValue="1"
            options={[
              { value: "1", label: "1 · Explosives" },
              { value: "3", label: "3 · Flammable liquids" },
              { value: "9", label: "9 · Miscellaneous" },
            ]}
          />
          <NativeSelect label="Carrier" disabled defaultValue="msc" options={[{ value: "msc", label: "MSC" }]} />
          <div style={{ maxWidth: 220 }} data-testid="ns-narrow">
            <NativeSelect
              label="Berth"
              defaultValue="long"
              options={[{ value: "long", label: "Amazonehaven berth 7, deep-sea container quay north" }]}
            />
          </div>
          <div dir="rtl" data-testid="ns-rtl">
            <NativeSelect
              label="المحطة"
              defaultValue="a"
              options={[
                { value: "a", label: "محطة روتردام الشرقية" },
                { value: "b", label: "محطة أنتويرب" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
