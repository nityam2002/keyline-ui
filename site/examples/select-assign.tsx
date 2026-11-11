"use client"

import { useState } from "react"
import { Select, type SelectOption } from "@/components/keyline/ui/select"

const PEOPLE: SelectOption[] = [
  { value: "dwight", label: "Dwight Schrute", description: "41 open accounts", code: "DS", group: "Sales" },
  { value: "jim", label: "Jim Halpert", description: "33 open accounts", code: "JH", group: "Sales" },
  { value: "phyllis", label: "Phyllis Vance", description: "28 open accounts", code: "PV", group: "Sales" },
  { value: "stanley", label: "Stanley Hudson", description: "On a crossword until 3", code: "SH", group: "Sales", disabled: true },
  { value: "michael", label: "Michael Scott", description: "Regional Manager", code: "MS", group: "Management" },
]

export function AssignLead() {
  const [rep, setRep] = useState<string | null>(null)
  const who = PEOPLE.find((p) => p.value === rep)

  return (
    <div className="grid max-w-[360px] gap-3">
      <Select label="Assign the Lackawanna County lead to" placeholder="Choose a rep" options={PEOPLE} value={rep} onValueChange={setRep} />
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {who ? `${String(who.label).split(" ")[0]} has the lead. The county wants a call by Friday.` : "Unassigned since Monday."}
      </p>
    </div>
  )
}
