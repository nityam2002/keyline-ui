"use client";

import { useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import { Form, FormActions } from "@/components/keyline/ui/field";
import { NativeSelect } from "@/components/keyline/ui/native-select";

const BRANCHES = [
  {
    group: "Pennsylvania",
    options: [
      { value: "scranton", label: "Scranton (your branch)", disabled: true },
      { value: "pittsburgh", label: "Pittsburgh" },
    ],
  },
  {
    group: "New York",
    options: [
      { value: "utica", label: "Utica" },
      { value: "albany", label: "Albany" },
      { value: "buffalo", label: "Buffalo (closed)", disabled: true },
    ],
  },
  {
    group: "New England",
    options: [
      { value: "nashua", label: "Nashua" },
      { value: "stamford", label: "Stamford (merged into Scranton)", disabled: true },
    ],
  },
];

const START = [
  { value: "monday", label: "Next Monday" },
  { value: "two-weeks", label: "In two weeks" },
  { value: "month", label: "First of the month" },
];

export function TransferRequest() {
  const [sent, setSent] = useState<string | null>(null);
  const label = (v: unknown) => BRANCHES.flatMap((g) => g.options).find((o) => o.value === v)?.label;

  return (
    <Form
      className="max-w-[400px]"
      onFormSubmit={(v) => setSent(`Request sent to ${label(v["branch"])}. Toby has a copy.`)}
    >
      <NativeSelect
        name="branch"
        label="Transfer to"
        placeholder="Choose a branch"
        required
        options={BRANCHES}
        description="Closed branches can't take transfers."
        error="Choose a branch to send the request to."
      />
      <NativeSelect name="start" label="Starting" defaultValue="two-weeks" options={START} />
      <FormActions>
        <Button type="submit" variant="primary">
          Request transfer
        </Button>
      </FormActions>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {sent}
      </p>
    </Form>
  );
}
