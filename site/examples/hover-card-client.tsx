"use client"

import { Avatar } from "@/components/keyline/ui/avatar"
import { HoverCard, HoverCardBody, HoverCardContent, HoverCardFacts, HoverCardHeader, HoverCardTrigger } from "@/components/keyline/ui/hover-card"
import { Status } from "@/components/keyline/ui/status"

const CLIENTS = {
  county: {
    name: "Lackawanna County",
    contact: "Procurement office",
    code: "C-0112",
    facts: [
      ["Rep", "Dwight Schrute"],
      ["Since", "2003"],
      ["Orders this year", "48"],
      ["Spend", "$61,240"],
    ],
    status: <Status kind="done">Paid up</Status>,
  },
  vance: {
    name: "Vance Refrigeration",
    contact: "Bob Vance",
    code: "C-0187",
    facts: [
      ["Rep", "Phyllis Vance"],
      ["Since", "2007"],
      ["Orders this year", "12"],
    ],
    status: <Status kind="attention">Invoice 31 days overdue</Status>,
  },
} as const

function Client({ id }: { id: keyof typeof CLIENTS }) {
  const c = CLIENTS[id]
  return (
    <HoverCard>
      <HoverCardTrigger href={`?client=${c.code}`} onClick={(e) => e.preventDefault()}>
        {c.name}
      </HoverCardTrigger>
      <HoverCardContent className="w-[min(320px,calc(100vw-24px))]">
        <HoverCardHeader media={<Avatar layout="cell" decorative name={c.contact} />} title={c.name} description={c.contact} code={c.code} />
        <HoverCardFacts facts={c.facts} />
        <HoverCardBody>{c.status}</HoverCardBody>
      </HoverCardContent>
    </HoverCard>
  )
}

export function ClientCards() {
  return (
    <p className="m-0 max-w-[60ch] text-[15px] leading-7">
      This week Dwight closed a renewal with <Client id="county" />, and Phyllis is still chasing <Client id="vance" /> for last
      month&apos;s invoice. Hover or focus a client for their account.
    </p>
  )
}
