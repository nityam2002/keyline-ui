"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Empty } from "../ui/empty";
import { Field, FieldFrame, FieldControl, FieldLabel } from "../ui/field";

const CLIENTS = [
  "Blue Cross of Pennsylvania",
  "Harper Collins",
  "Lackawanna County",
  "Scranton Business Park",
  "Scranton White Pages",
  "Vance Refrigeration",
];

export function ClientSearch() {
  const [q, setQ] = useState("Stamford");
  const hits = CLIENTS.filter((c) => c.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="grid max-w-[560px] gap-4">
      <Field>
        <FieldLabel>Search clients</FieldLabel>
        <FieldFrame>
          <FieldControl type="search" value={q} onChange={(e) => setQ(e.target.value)} spellCheck={false} />
        </FieldFrame>
      </Field>
      {hits.length ? (
        <ul className="m-0 grid list-none gap-2 p-0 text-[14px]" aria-label="Clients">
          {hits.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ) : (
        <Empty
          live
          title={`No clients match “${q.trim()}”`}
          description="Stamford's clients moved to Scranton under their own names. Try the company, not the branch."
          actions={<Button onClick={() => setQ("")}>Clear search</Button>}
        />
      )}
    </div>
  );
}
