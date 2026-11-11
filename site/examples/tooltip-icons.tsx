"use client"

import { Archive, Copy, Mail, Printer } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Tooltip } from "@/components/keyline/ui/tooltip"

const TOOLS = [
  { name: "Print", key: "⌘P", Icon: Printer, done: "Sent to the printer by Kevin's desk." },
  { name: "Email to client", key: "⌘E", Icon: Mail, done: "Emailed to Lackawanna County." },
  { name: "Duplicate", key: "⌘D", Icon: Copy, done: "Duplicated as DM-4142." },
  { name: "Archive", key: "⌘⌫", Icon: Archive, done: "Archived. It stays in reports." },
]

export function InvoiceTools() {
  const [last, setLast] = useState("")
  return (
    <div className="grid gap-3">
      <div role="toolbar" aria-label="Invoice DM-4107" className="flex gap-2">
        {TOOLS.map((t) => (
          <Tooltip key={t.name} content={t.name} shortcut={t.key}>
            <Button size="icon" aria-label={t.name} onClick={() => setLast(t.done)}>
              <t.Icon size={16} aria-hidden="true" />
            </Button>
          </Tooltip>
        ))}
      </div>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {last}
      </p>
    </div>
  )
}
