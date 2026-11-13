"use client";

import { Tabs, TabsList, TabsPanel, TabsTab } from "../ui/tabs";

const ORDERS = [
  ["DM-4107", "120 cases, copy paper", "Thu 12 Nov"],
  ["DM-4126", "80 cases, copy paper", "Delivered"],
  ["DM-4031", "20 cases, cardstock", "Delivered"],
];

export function ClientAccount() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Lackawanna County">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="orders" count={ORDERS.length}>
          Orders
        </TabsTab>
        <TabsTab value="notes">Notes</TabsTab>
      </TabsList>
      <TabsPanel value="overview" className="grid gap-2 pt-4 text-[14px]">
        <p className="m-0">
          Lackawanna County has bought from the Scranton branch since 2003, through the purchasing office on North
          Washington Avenue.
        </p>
        <p className="m-0 text-kl-ink-2">Account rep: Dwight Schrute. Billing: Angela Martin.</p>
      </TabsPanel>
      <TabsPanel value="orders" className="pt-4">
        <ul className="m-0 grid list-none gap-2 p-0 text-[14px]">
          {ORDERS.map(([id, what, when]) => (
            <li key={id} className="grid grid-cols-[auto_1fr_auto] gap-3">
              <span className="font-kl-mono text-[13px]">{id}</span>
              <span>{what}</span>
              <span className="text-kl-ink-2">{when}</span>
            </li>
          ))}
        </ul>
      </TabsPanel>
      <TabsPanel value="notes" className="pt-4 text-[14px]">
        <p className="m-0">
          The new purchasing officer prefers calls to email. Deliveries go to the loading dock, not reception.
        </p>
      </TabsPanel>
    </Tabs>
  );
}
