"use client";

import { useState } from "react";
import { Toggle } from "../ui/toggle";

const EXPENSES = [
  { who: "Kevin Malone", what: "Cookies for the 3 o’clock meeting", amount: "$14.99", receipt: false },
  { who: "Michael Scott", what: "Dundies trophies (12)", amount: "$186.40", receipt: false },
  { who: "Oscar Martinez", what: "Toner, Staples", amount: "$62.18", receipt: true },
  { who: "Meredith Palmer", what: "Client lunch, Cugino’s", amount: "$48.75", receipt: true },
];

export function ExpenseFilter() {
  const [missingOnly, setMissingOnly] = useState(false);
  const missing = EXPENSES.filter((e) => !e.receipt);
  const rows = missingOnly ? missing : EXPENSES;

  return (
    <div className="grid gap-4">
      <Toggle
        pressed={missingOnly}
        onPressedChange={setMissingOnly}
        count={missing.length}
        className="justify-self-start"
      >
        Missing receipt
      </Toggle>
      <ul className="m-0 grid list-none gap-1 p-0 text-[14px]" aria-label="Expenses this week">
        {rows.map((e) => (
          <li key={e.what} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
            <span className="min-w-0 truncate">
              {e.who} · <span className="text-kl-ink-2">{e.what}</span>
            </span>
            <span className="tabular-nums">{e.amount}</span>
          </li>
        ))}
      </ul>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {missingOnly
          ? `${missing.length} expenses Angela can’t approve yet.`
          : `${EXPENSES.length} expenses this week.`}
      </p>
    </div>
  );
}
