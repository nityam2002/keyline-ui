"use client";

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/keyline/ui/accordion";

const POLICIES = [
  {
    value: "returns",
    title: "Returns",
    meta: "30 days",
    body: "Unopened cases come back within 30 days for a full refund. Darryl collects them on the next delivery run, so nobody needs to drive to the warehouse.",
  },
  {
    value: "delivery",
    title: "Delivery",
    meta: "Free over 20 cases",
    body: "Orders of 20 cases or more are delivered free anywhere in Lackawanna County. Smaller orders pay a flat $25, or the client can pick them up at the loading dock.",
  },
  {
    value: "discounts",
    title: "Volume discounts",
    meta: "Up to 12%",
    body: "Reps can take up to 8% off an order of 100 cases without asking. Anything past that, up to 12%, needs Michael's signature, which he'll give if you ask nicely.",
  },
];

export function BranchPolicies() {
  return (
    <Accordion multiple defaultValue={["returns"]}>
      {POLICIES.map((p) => (
        <AccordionItem key={p.value} value={p.value}>
          <AccordionTrigger meta={p.meta}>{p.title}</AccordionTrigger>
          <AccordionPanel>
            <p className="m-0 max-w-[60ch] text-[14px] leading-6">{p.body}</p>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
