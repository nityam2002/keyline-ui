"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

const INVOICES = [
  { id: "INV-2201", client: "Blue Cross of Pennsylvania", amount: "$3,420.00" },
  { id: "INV-2204", client: "Lackawanna County", amount: "$812.50" },
  { id: "INV-2207", client: "Scranton Business Park", amount: "$1,284.00" },
];

export function PrintInvoices() {
  const [picked, setPicked] = useState<string[]>([]);
  const [printed, setPrinted] = useState<string | null>(null);

  return (
    <div className="grid max-w-[520px] gap-3">
      <ul className="m-0 grid list-none gap-2 p-0 text-[14px]" aria-label="Unpaid invoices">
        {INVOICES.map((inv) => (
          <li key={inv.id} className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-3">
            <Checkbox
              aria-label={`Print ${inv.id}`}
              checked={picked.includes(inv.id)}
              onCheckedChange={(on) => setPicked(on ? [...picked, inv.id] : picked.filter((p) => p !== inv.id))}
            />
            <span className="font-kl-mono whitespace-nowrap">{inv.id}</span>
            <span className="truncate">{inv.client}</span>
            <span className="text-kl-ink-2 tabular-nums">{inv.amount}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={!picked.length}
          onClick={() => {
            setPrinted(`Sent ${picked.length} to the printer by the kitchen.`);
            setPicked([]);
          }}
        >
          {picked.length ? `Print ${picked.length} ${picked.length === 1 ? "invoice" : "invoices"}` : "Print invoices"}
        </Button>
        <p role="status" className="m-0 text-[14px] text-kl-ink-2">
          {printed}
        </p>
      </div>
    </div>
  );
}
