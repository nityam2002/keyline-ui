"use client";

import { useState } from "react";
import { CheckboxField } from "@/components/keyline/ui/checkbox";

const TASKS = [
  { id: "copier", label: "Turn off the copier", description: "It overheats if it runs all night." },
  { id: "dock", label: "Lock the warehouse door", description: "Darryl leaves by the loading dock at 5." },
  { id: "fridge", label: "Clear the kitchen fridge", description: "Anything unlabelled goes. Ask Angela first." },
  { id: "alarm", label: "Set the alarm", description: "The code is on the card in Dwight's desk." },
];

export function ClosingChecklist() {
  const [done, setDone] = useState<string[]>(["copier"]);
  const toggle = (id: string, on: boolean) => setDone(on ? [...done, id] : done.filter((d) => d !== id));

  return (
    <div className="grid max-w-[480px] gap-3">
      <div className="grid gap-1">
        {TASKS.map((t) => (
          <CheckboxField
            key={t.id}
            label={t.label}
            description={t.description}
            checked={done.includes(t.id)}
            onCheckedChange={(on) => toggle(t.id, on)}
          />
        ))}
      </div>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {done.length === TASKS.length
          ? "Office closed for the night. See you at 9."
          : `${done.length} of ${TASKS.length} done before you leave.`}
      </p>
    </div>
  );
}
