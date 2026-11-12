"use client";

import { Badge } from "@/components/keyline/ui/status";

const INVOICES = [
  { id: "INV-2207", client: "Scranton Business Park", amount: "$1,284.00", tone: "plain" as const, tag: "SENT" },
  { id: "INV-2208", client: "Lackawanna County", amount: "$9,610.00", tone: "signal" as const, tag: "NEW" },
  { id: "INV-2164", client: "Harper Collins", amount: "$2,450.00", tone: "attention" as const, tag: "OVERDUE" },
];

export function InvoiceBadges() {
  return (
    <ul className="m-0 grid list-none gap-3 p-0 text-[14px]">
      {INVOICES.map((i) => (
        <li key={i.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge>{i.id}</Badge>
          <span className="min-w-0 flex-1">{i.client}</span>
          <span className="tabular-nums">{i.amount}</span>
          <Badge tone={i.tone}>{i.tag}</Badge>
        </li>
      ))}
    </ul>
  );
}
