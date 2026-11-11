"use client"

import { ChartNoAxesColumn, FileText, PartyPopper, Plus, UserRound, Warehouse } from "lucide-react"
import { useState } from "react"
import { Nav, NavIdentity, type NavGroup } from "@/components/keyline/ui/nav"

const GROUPS: NavGroup[] = [
  {
    label: "Sales",
    items: [
      { value: "orders", label: "Orders", count: 11, icon: <FileText size={16} aria-hidden="true" /> },
      { value: "clients", label: "Clients", count: 64, icon: <UserRound size={16} aria-hidden="true" /> },
      {
        value: "reports",
        label: "Reports",
        icon: <ChartNoAxesColumn size={16} aria-hidden="true" />,
        items: [
          { value: "reports-weekly", label: "Weekly sales" },
          { value: "reports-quarter", label: "Quarter to date" },
        ],
      },
    ],
  },
  {
    label: "Office",
    items: [
      { value: "warehouse", label: "Warehouse", icon: <Warehouse size={16} aria-hidden="true" /> },
      { value: "parties", label: "Party planning", count: 2, icon: <PartyPopper size={16} aria-hidden="true" /> },
      { value: "hr", label: "Human resources", disabled: true, icon: <Plus size={16} aria-hidden="true" /> },
    ],
  },
]

const TITLES: Record<string, string> = {
  orders: "11 open orders, 2 held",
  clients: "64 active clients",
  "reports-weekly": "Weekly sales: 1,810 reams",
  "reports-quarter": "Quarter to date: 19,880 reams",
  warehouse: "88 pallets on the floor",
  parties: "Two parties this month. Angela has the budget.",
}

export function OfficeSidebar() {
  const [view, setView] = useState("orders")

  return (
    <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
      <Nav
        label="Scranton branch"
        value={view}
        onValueChange={setView}
        groups={GROUPS}
        header={<NavIdentity mark="DM" title="Scranton" meta="Branch 0418" />}
      />
      <p role="status" className="m-0 self-start text-[14px] text-kl-ink-2">
        {TITLES[view]}
      </p>
    </div>
  )
}
