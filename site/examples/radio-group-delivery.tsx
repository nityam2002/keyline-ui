"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/keyline/ui/radio-group";

const OPTIONS = [
  {
    value: "truck",
    label: "Darryl's Thursday route",
    description: "Arrives Thu 12 Nov, before noon",
    meta: "Free",
    note: "On Thursday's truck.",
  },
  {
    value: "morning",
    label: "Next morning",
    description: "A courier from the Wilkes-Barre depot",
    meta: "$25",
    note: "Courier booked for 8 AM tomorrow.",
  },
  {
    value: "pickup",
    label: "Customer pickup",
    description: "Ready at reception from 3 PM today",
    meta: "Free",
    note: "Pam will have it at reception.",
  },
];

export function DeliveryChoice() {
  const [how, setHow] = useState("truck");

  return (
    <div className="grid max-w-[480px] gap-3">
      <p id="delivery-label" className="m-0 text-[14px] font-semibold">
        Delivery for <span className="font-kl-mono">DM-4142</span>
      </p>
      <RadioGroup aria-labelledby="delivery-label" value={how} onValueChange={setHow}>
        {OPTIONS.map((o) => (
          <RadioGroupItem key={o.value} value={o.value} label={o.label} description={o.description} meta={o.meta} />
        ))}
      </RadioGroup>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {OPTIONS.find((o) => o.value === how)?.note}
      </p>
    </div>
  );
}
