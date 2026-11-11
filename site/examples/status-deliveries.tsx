"use client"

import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Badge, Status, type StatusKind } from "@/components/keyline/ui/status"

type Stop = { id: string; client: string; cases: number; state: "loading" | "out" | "delivered" | "held"; rush?: boolean; note?: string }

const START: Stop[] = [
  { id: "DM-4102", client: "Scranton Business Park", cases: 40, state: "out", rush: true },
  { id: "DM-4107", client: "Lackawanna County", cases: 120, state: "out" },
  { id: "DM-4111", client: "Vance Refrigeration", cases: 6, state: "held", note: "No one to sign. Call Bob Vance before 3 PM." },
  { id: "DM-4115", client: "Blue Cross of Pennsylvania", cases: 60, state: "loading" },
]

const SAY: Record<Stop["state"], [StatusKind, string]> = {
  loading: ["waiting", "Loading at the warehouse"],
  out: ["normal", "Out for delivery"],
  delivered: ["done", "Delivered"],
  held: ["attention", "Held"],
}

export function DeliveryBoard() {
  const [stops, setStops] = useState(START)
  const [last, setLast] = useState("Darryl's truck left at 9:40.")
  const advance = (s: Stop) => {
    const next = s.state === "loading" ? "out" : "delivered"
    setStops((all) => all.map((x) => (x.id === s.id ? { ...x, state: next } : x)))
    setLast(next === "out" ? `${s.id} is on the truck.` : `${s.id} signed for at ${s.client}.`)
  }
  const done = stops.filter((s) => s.state === "delivered").length

  return (
    <div className="grid gap-4">
      <ul className="m-0 grid list-none gap-0 p-0">
        {stops.map((s) => {
          const [kind, words] = SAY[s.state]
          return (
            <li key={s.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-kl-line py-3 first:pt-0 last:border-b-0">
              <div className="grid min-w-0 gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{s.id}</Badge>
                  {s.rush ? <Badge tone="signal">RUSH</Badge> : null}
                  <span className="text-[14px] font-semibold">{s.client}</span>
                  <span className="text-[14px] text-kl-ink-3 tabular-nums">{s.cases} cases</span>
                </div>
                <Status kind={kind}>{s.note ? `${words}: ${s.note}` : words}</Status>
              </div>
              {s.state === "loading" || s.state === "out" ? (
                <Button size="compact" onClick={() => advance(s)}>
                  {s.state === "loading" ? "Load truck" : "Mark delivered"}
                </Button>
              ) : null}
            </li>
          )
        })}
      </ul>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {done === stops.length - 1 ? "Every stop is done except Vance Refrigeration." : `${done} of ${stops.length} delivered. ${last}`}
      </p>
    </div>
  )
}
