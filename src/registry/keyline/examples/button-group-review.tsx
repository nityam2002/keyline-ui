"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { ButtonGroup, ButtonGroupText } from "../ui/button-group";

const ORDERS = [
  { id: "DM-4102", client: "Scranton Business Park", paper: "40 cases, 20 lb copy", rep: "Dwight Schrute" },
  { id: "DM-4087", client: "Lackawanna County", paper: "12 cases, cardstock", rep: "Jim Halpert" },
  { id: "DM-4120", client: "Wilkes-Barre Library", paper: "6 cases, recycled bond", rep: "Phyllis Vance" },
  { id: "DM-4131", client: "Blue Cross of Pennsylvania", paper: "25 cases, letterhead", rep: "Stanley Hudson" },
  { id: "DM-4136", client: "Harper Collins, Scranton", paper: "8 cases, legal pads", rep: "Andy Bernard" },
];

export function OrderReview() {
  const [i, setI] = useState(0);
  const order = ORDERS[i];
  if (!order) return null;

  return (
    <div className="grid gap-4">
      <ButtonGroup aria-label="Today’s orders" className="justify-self-start">
        <Button layout="cell" disabled={i === 0} onClick={() => setI(i - 1)}>
          Previous
        </Button>
        <ButtonGroupText aria-live="polite">
          {i + 1} of {ORDERS.length}
        </ButtonGroupText>
        <Button layout="cell" disabled={i === ORDERS.length - 1} onClick={() => setI(i + 1)}>
          Next
        </Button>
      </ButtonGroup>
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[14px]">
        <dt className="text-kl-ink-3">Order</dt>
        <dd className="m-0 font-kl-mono">{order.id}</dd>
        <dt className="text-kl-ink-3">Client</dt>
        <dd className="m-0">{order.client}</dd>
        <dt className="text-kl-ink-3">Paper</dt>
        <dd className="m-0">{order.paper}</dd>
        <dt className="text-kl-ink-3">Sales rep</dt>
        <dd className="m-0">{order.rep}</dd>
      </dl>
    </div>
  );
}
