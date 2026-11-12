"use client";

import { useState } from "react";
import { Panel, PanelBody, PanelHeader } from "@/components/keyline/ui/panel";
import { RadioGroup, RadioGroupItem } from "@/components/keyline/ui/radio-group";

const PAPER = [
  { value: "20", label: "20 lb copy", description: "The everyday sheet", price: 42 },
  { value: "24", label: "24 lb premium", description: "Brighter, for letters", price: 58 },
  { value: "110", label: "110 lb cardstock", description: "Menus and invitations", price: 96 },
];

export function PaperWeight() {
  const [weight, setWeight] = useState("24");
  const chosen = PAPER.find((p) => p.value === weight)!;

  return (
    <Panel className="max-w-[440px]">
      <PanelHeader title="Paper for the Wilkes-Barre Library quote" />
      <RadioGroup layout="cell" aria-label="Paper weight" value={weight} onValueChange={setWeight}>
        {PAPER.map((p) => (
          <RadioGroupItem
            key={p.value}
            value={p.value}
            label={p.label}
            description={p.description}
            meta={`$${p.price}`}
          />
        ))}
      </RadioGroup>
      <PanelBody>
        <p role="status" className="m-0 text-[14px] text-kl-ink-2">
          12 cases at ${chosen.price} a case:{" "}
          <span className="tabular-nums">${(12 * chosen.price).toLocaleString("en-US")}</span>.
        </p>
      </PanelBody>
    </Panel>
  );
}
