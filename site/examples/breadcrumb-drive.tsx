"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/keyline/ui/breadcrumb";
import { Button } from "@/components/keyline/ui/button";

const PATH = ["Shared drive", "Scranton", "Sales", "Clients", "Lackawanna County", "Q4 orders"];
const FILES: Record<string, string[]> = {
  "Shared drive": ["Scranton", "Stamford (archived)", "Corporate"],
  Scranton: ["Sales", "Accounting", "Warehouse", "Party Planning Committee"],
  Sales: ["Clients", "Price lists", "Leads"],
  Clients: ["Blue Cross of Pennsylvania", "Harper Collins", "Lackawanna County"],
  "Lackawanna County": ["Q3 orders", "Q4 orders", "Contract 2026.pdf"],
  "Q4 orders": ["DM-4107.pdf", "DM-4126.pdf"],
};

export function DriveFolder() {
  const [depth, setDepth] = useState(PATH.length);
  const here = PATH[depth - 1] ?? "Shared drive";

  return (
    <div className="grid gap-4">
      <Breadcrumb
        items={PATH.slice(0, depth).map((label, i) => ({
          label,
          // a link whose click opens the folder in place; a <button> here breaks in the folded menu
          render: (
            <a href={`?folder=${encodeURIComponent(label)}`} onClick={(e) => (e.preventDefault(), setDepth(i + 1))} />
          ),
        }))}
      />
      <ul aria-label={`In ${here}`} className="m-0 grid min-h-8 list-none items-center gap-2 p-0 text-[14px]">
        {(FILES[here] ?? []).map((f) => {
          const next = PATH[depth];
          return (
            <li key={f}>
              {f === next ? (
                <Button size="compact" variant="quiet" onClick={() => setDepth(depth + 1)}>
                  {f}
                </Button>
              ) : (
                f
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
