"use client";

import { useState } from "react";
import { CheckboxGroup } from "@/components/keyline/ui/checkbox-group";

const REPS = [
  { value: "dwight", label: "Dwight Schrute", meta: "41" },
  { value: "jim", label: "Jim Halpert", meta: "33" },
  { value: "phyllis", label: "Phyllis Vance", meta: "28" },
  { value: "stanley", label: "Stanley Hudson", meta: "26" },
  { value: "andy", label: "Andy Bernard", description: "Away until Friday", meta: "19", disabled: true },
];

export function PriceListRecipients() {
  const [to, setTo] = useState(["dwight", "jim"]);
  const names = REPS.filter((r) => to.includes(r.value)).map((r) => r.label.split(" ")[0]);

  return (
    <div className="grid max-w-[420px] gap-3">
      <CheckboxGroup
        legend="Send the new price list to"
        description="Open accounts per rep."
        selectAll="All of sales"
        options={REPS}
        value={to}
        onValueChange={setTo}
      />
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {names.length ? `${names.join(", ")} will get it at 9 tomorrow.` : "Nobody gets it yet."}
      </p>
    </div>
  );
}
