"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/keyline/ui/toggle-group";

const ORDERS = [
  { id: "DM-4102", client: "Scranton Business Park", rep: "Dwight" },
  { id: "DM-4087", client: "Lackawanna County", rep: "Jim" },
  { id: "DM-4120", client: "Wilkes-Barre Library", rep: "Phyllis" },
  { id: "DM-4131", client: "Blue Cross of Pennsylvania", rep: "Stanley" },
  { id: "DM-4133", client: "Pennsylvania Power & Light", rep: "Dwight" },
  { id: "DM-4136", client: "Harper Collins, Scranton", rep: "Andy" },
  { id: "DM-4140", client: "Vance Refrigeration", rep: "Phyllis" },
];
const REPS = ["Dwight", "Jim", "Phyllis", "Stanley", "Andy"];

export function OrdersByRep() {
  const [reps, setReps] = useState<string[]>(["Dwight", "Phyllis"]);
  // no rep chosen means no filter: every order shows
  const rows = reps.length ? ORDERS.filter((o) => reps.includes(o.rep)) : ORDERS;

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      <ToggleGroup aria-label="Sales rep" value={reps} onValueChange={setReps} className="justify-self-start">
        {REPS.map((r) => (
          <ToggleGroupItem key={r} value={r} count={ORDERS.filter((o) => o.rep === r).length}>
            {r}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ul className="m-0 grid list-none gap-1 p-0 text-[14px]" aria-label="Open orders">
        {rows.map((o) => (
          <li key={o.id} className="truncate">
            <span className="font-kl-mono whitespace-nowrap">{o.id}</span> · {o.client}
          </li>
        ))}
      </ul>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {reps.length ? `${rows.length} open orders for ${reps.join(", ")}.` : `All ${ORDERS.length} open orders.`}
      </p>
    </div>
  );
}
