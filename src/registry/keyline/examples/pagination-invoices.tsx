"use client";

import { useState } from "react";
import { Pagination } from "../ui/pagination";

const CLIENTS = [
  "Lackawanna County",
  "Blue Cross of Pennsylvania",
  "Harper Collins",
  "Scranton Business Park",
  "Mount Airy Casino",
  "Penn Paper Supply",
  "Wilkes-Barre Library",
];
const PER = 4;
const TOTAL = 76;

// a stand-in for the page your server returns
const invoices = (page: number) =>
  Array.from({ length: Math.min(PER, TOTAL - (page - 1) * PER) }, (_, i) => {
    const n = (page - 1) * PER + i;
    return { id: `INV-${2207 - n}`, client: CLIENTS[(n * 3) % CLIENTS.length], amount: 180 + ((n * 437) % 9000) };
  });

export function InvoiceArchive() {
  const [page, setPage] = useState(1);

  return (
    <div className="grid gap-4">
      <ul aria-label={`Invoices, page ${page}`} className="m-0 grid list-none gap-2 p-0 text-[14px]">
        {invoices(page).map((inv) => (
          <li key={inv.id} className="grid grid-cols-[auto_1fr_auto] gap-3">
            <span className="font-kl-mono text-[13px]">{inv.id}</span>
            <span className="min-w-0 truncate">{inv.client}</span>
            <span className="tabular-nums">${inv.amount.toLocaleString("en-US")}.00</span>
          </li>
        ))}
      </ul>
      <Pagination page={page} pageCount={Math.ceil(TOTAL / PER)} onPageChange={setPage} label="Invoice pages" />
    </div>
  );
}
