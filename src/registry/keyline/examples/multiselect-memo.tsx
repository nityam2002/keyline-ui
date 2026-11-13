"use client";

import { useState } from "react";
import { Multiselect, type MultiselectOption } from "../ui/multiselect";

const PEOPLE: MultiselectOption[] = [
  { value: "pam", label: "Pam Beesly", description: "Reception" },
  { value: "angela", label: "Angela Martin", description: "Accounting" },
  { value: "oscar", label: "Oscar Martinez", description: "Accounting" },
  { value: "kevin", label: "Kevin Malone", description: "Accounting" },
  { value: "darryl", label: "Darryl Philbin", description: "Warehouse" },
  { value: "toby", label: "Toby Flenderson", description: "HR" },
  { value: "creed", label: "Creed Bratton", description: "Quality assurance" },
];

// a local list behind Multiselect's async source
function findPeople(query: string, signal: AbortSignal): Promise<MultiselectOption[]> {
  return new Promise((resolve) => {
    const t = setTimeout(
      () => resolve(PEOPLE.filter((p) => `${p.label} ${p.description}`.toLowerCase().includes(query.toLowerCase()))),
      250,
    );
    signal.addEventListener("abort", () => clearTimeout(t));
  });
}

export function MemoRecipients() {
  const [to, setTo] = useState<MultiselectOption[]>(PEOPLE.slice(1, 2));

  return (
    <div className="grid max-w-[480px] gap-3">
      <Multiselect
        label="Send the expense memo to"
        placeholder="Add people"
        noun={["person", "people"]}
        loadOptions={findPeople}
        value={to}
        onValueChange={setTo}
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {to.length
          ? `${to.length} ${to.length === 1 ? "person" : "people"} will get it.${to.some((p) => p.value === "toby") ? " Michael will ask why Toby is on it." : ""}`
          : "Nobody yet. Accounting usually wants it."}
      </p>
    </div>
  );
}
