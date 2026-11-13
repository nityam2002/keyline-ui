"use client";

import { useState } from "react";
import { Button } from "../ui/button";

type Decision = "approved" | "receipt" | "skipped" | "rejected" | null;

export function ExpenseReview() {
  const [decision, setDecision] = useState<Decision>(null);
  const result = {
    approved: "Approved. Accounting pays it with Friday's run.",
    receipt: "Kevin has been asked for the receipt.",
    skipped: "Skipped. It comes back to the top of tomorrow’s queue.",
    rejected: "Rejected. Kevin gets a note from Angela.",
  };

  return (
    <div className="grid gap-4">
      <p className="m-0 text-[14px]">
        Kevin Malone · <span className="tabular-nums">$14.99</span> · “Cookies for the 3 o’clock meeting”
      </p>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => setDecision("approved")}>
          Approve
        </Button>
        <Button onClick={() => setDecision("receipt")}>Ask for receipt</Button>
        <Button variant="quiet" onClick={() => setDecision("skipped")}>
          Skip
        </Button>
        <Button variant="destructive" onClick={() => setDecision("rejected")}>
          Reject
        </Button>
      </div>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {decision ? result[decision] : "Waiting for a decision."}
      </p>
    </div>
  );
}
