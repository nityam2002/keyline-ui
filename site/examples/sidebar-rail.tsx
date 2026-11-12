"use client";

import { ChartNoAxesColumn, FileText, UserRound, Warehouse } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/keyline/ui/app-shell";
import { Breadcrumb } from "@/components/keyline/ui/breadcrumb";
import { Nav, type NavItem } from "@/components/keyline/ui/nav";

const ITEMS: NavItem[] = [
  { value: "orders", label: "Orders", count: 11, icon: <FileText size={16} aria-hidden="true" /> },
  { value: "clients", label: "Clients", count: 64, icon: <UserRound size={16} aria-hidden="true" /> },
  { value: "warehouse", label: "Warehouse", icon: <Warehouse size={16} aria-hidden="true" /> },
  { value: "reports", label: "Reports", icon: <ChartNoAxesColumn size={16} aria-hidden="true" /> },
];

const SAID: Record<string, string> = {
  orders: "11 open orders, 2 held.",
  clients: "64 active clients.",
  warehouse: "88 pallets on the floor.",
  reports: "Weekly sales: 1,810 reams.",
};

export function RailSidebar() {
  const [view, setView] = useState("orders");
  return (
    <AppShell
      narrowAt={400}
      mainProps={{ className: "min-h-[260px]" }}
      navSize={180}
      collapse="rail"
      navLabel="Scranton branch"
      nav={<Nav layout="cell" label="Scranton branch" value={view} onValueChange={setView} items={ITEMS} />}
      header={
        <Breadcrumb
          layout="cell"
          items={[
            {
              label: "Scranton",
              render: <a href="?view=orders" onClick={(e) => (e.preventDefault(), setView("orders"))} />,
            },
            { label: ITEMS.find((i) => i.value === view)!.label as string },
          ]}
        />
      }
    >
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {SAID[view]}
      </p>
    </AppShell>
  );
}
