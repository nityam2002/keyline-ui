"use client";

import { useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/keyline/ui/combobox";

const CLIENTS: ComboboxOption[] = [
  { value: "blue-cross", label: "Blue Cross of Pennsylvania", code: "BC", group: "Scranton" },
  { value: "business-park", label: "Scranton Business Park", code: "SBP", group: "Scranton" },
  { value: "lackawanna", label: "Lackawanna County", code: "LC", group: "Scranton" },
  { value: "library", label: "Wilkes-Barre Library", code: "WBL", group: "Wilkes-Barre" },
  { value: "harper", label: "Harper Collins, regional office", code: "HC", group: "Wilkes-Barre" },
  {
    value: "steamtown",
    label: "Steamtown Mall",
    code: "STM",
    group: "Scranton",
    disabled: true,
    description: "Account on hold",
  },
];

export function FindClient() {
  const [client, setClient] = useState<ComboboxOption | null>(null);

  return (
    <div className="grid max-w-[400px] gap-3">
      <Combobox
        label="Client"
        placeholder="Search clients"
        noun={["client", "clients"]}
        options={CLIENTS}
        onValueChange={(_, o) => setClient(o)}
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {client ? `New order for ${client.label}.` : "Type part of a name, such as “barre”."}
      </p>
    </div>
  );
}
