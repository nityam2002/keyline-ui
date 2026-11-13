"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Notice } from "../ui/notice";

export function PaperStock() {
  const [state, setState] = useState<"low" | "ordered" | "gone">("low");

  return (
    <div className="grid gap-3">
      <Notice
        open={state !== "gone"}
        live={state === "ordered"}
        tone={state === "low" ? "attention" : "done"}
        title={state === "low" ? "Letter paper is down to 30 cases" : "120 cases reordered from the mill"}
        description={
          state === "low"
            ? "That covers two days of deliveries. Darryl needs a week's notice."
            : "They arrive Thursday. Darryl has the dock booked."
        }
        actions={
          state === "low" ? (
            <Button layout="cell" variant="primary" onClick={() => setState("ordered")}>
              Reorder 120 cases
            </Button>
          ) : null
        }
        onDismiss={state === "ordered" ? () => setState("gone") : undefined}
      />
      {state === "gone" ? (
        <Button size="compact" variant="quiet" className="justify-self-start" onClick={() => setState("low")}>
          Show the warning again
        </Button>
      ) : null}
    </div>
  );
}
