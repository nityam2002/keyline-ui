"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
  MenuSubmenuContent,
  MenuSubmenuTrigger,
  MenuTrigger,
} from "@/components/keyline/ui/menu"

const REPS = ["Dwight Schrute", "Jim Halpert", "Phyllis Vance", "Stanley Hudson"]

export function OrderActions() {
  const [rep, setRep] = useState("Dwight Schrute")
  const [due, setDue] = useState("Thu 12 Nov")
  const [copies, setCopies] = useState(0)
  const [cancelled, setCancelled] = useState(false)
  const [last, setLast] = useState("Nothing changed yet.")

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[14px]">
          <dt className="text-kl-ink-3">Order</dt>
          <dd className="m-0">
            <span className="font-kl-mono whitespace-nowrap">DM-4102</span> · Scranton Business Park
            {cancelled ? <strong className="ms-2">Cancelled</strong> : null}
          </dd>
          <dt className="text-kl-ink-3">Sales rep</dt>
          <dd className="m-0">{rep}</dd>
          <dt className="text-kl-ink-3">Delivery</dt>
          <dd className="m-0">{due}</dd>
        </dl>
        <Menu>
          <MenuTrigger render={<Button />}>
            Actions
            <ChevronDown size={16} aria-hidden="true" />
          </MenuTrigger>
          <MenuContent align="end">
            <MenuItem
              disabled={cancelled}
              onClick={() => {
                setDue("Mon 16 Nov")
                setLast("Delivery moved to Monday. The client gets an email.")
              }}
            >
              Move delivery to Monday
            </MenuItem>
            <MenuItem
              onClick={() => {
                setCopies(copies + 1)
                setLast(`Duplicated as DM-${4141 + copies}, same paper and client.`)
              }}
            >
              Duplicate order
            </MenuItem>
            <MenuSubmenu>
              <MenuSubmenuTrigger disabled={cancelled}>Assign to</MenuSubmenuTrigger>
              <MenuSubmenuContent>
                <MenuRadioGroup
                  value={rep}
                  onValueChange={(r: string) => {
                    setRep(r)
                    setLast(`${r.split(" ")[0]} has the account now.`)
                  }}
                >
                  {REPS.map((r) => (
                    <MenuRadioItem key={r} value={r}>
                      {r}
                    </MenuRadioItem>
                  ))}
                </MenuRadioGroup>
              </MenuSubmenuContent>
            </MenuSubmenu>
            <MenuSeparator />
            <MenuItem
              variant="destructive"
              disabled={cancelled}
              onClick={() => {
                setCancelled(true)
                setLast("Order cancelled. 40 cases go back on the shelf.")
              }}
            >
              Cancel order
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
      <div className="flex min-h-8 flex-wrap items-center gap-3">
        <p role="status" className="m-0 text-[14px] text-kl-ink-2">
          {last}
        </p>
        {cancelled ? (
          <Button
            size="compact"
            variant="quiet"
            onClick={() => {
              setCancelled(false)
              setLast("Order restored. Nothing went back on the shelf.")
            }}
          >
            Undo
          </Button>
        ) : null}
      </div>
    </div>
  )
}
