"use client"

import { useState } from "react"
import { Combobox, type ComboboxOption } from "@/components/keyline/ui/combobox"

const STAFF = [
  ["Jan Levinson", "VP, Northeast Sales", "New York"],
  ["David Wallace", "CFO", "New York"],
  ["Karen Filippelli", "Regional Manager", "Utica"],
  ["Josh Porter", "Regional Manager", "Stamford"],
  ["Craig", "Regional Manager", "Albany"],
  ["Holly Flax", "HR", "Nashua"],
]

// stands in for the corporate directory API: slow, and it times out on "stamford"
function searchDirectory(query: string, signal: AbortSignal): Promise<ComboboxOption[]> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      if (query.toLowerCase().includes("stamford")) return reject(new Error("The corporate directory timed out."))
      const q = query.toLowerCase()
      resolve(
        STAFF.filter((s) => s.join(" ").toLowerCase().includes(q)).map(([name, role, branch]) => ({
          value: name,
          label: name,
          description: `${role}, ${branch}`,
        })),
      )
    }, 500)
    signal.addEventListener("abort", () => clearTimeout(t))
  })
}

export function CorporateDirectory() {
  const [who, setWho] = useState<string | null>(null)

  return (
    <div className="grid max-w-[400px] gap-3">
      <Combobox label="Escalate to" placeholder="Search corporate" noun={["person", "people"]} loadOptions={searchDirectory} value={who} onValueChange={setWho} />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {who ? `${who} gets the complaint. Michael will not be cc'd.` : "Try “utica”, or “stamford” to see a failed search."}
      </p>
    </div>
  )
}
