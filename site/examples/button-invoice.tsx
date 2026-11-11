"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/keyline/ui/button"

type Signal = "idle" | "pending" | "done"

export function InvoiceActions() {
  const [signal, setSignal] = useState<Signal>("idle")
  const [sentAt, setSentAt] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const email = () => {
    setSignal("pending")
    // stands in for the request to your mail service
    timer.current = setTimeout(() => {
      setSentAt(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }))
      setSignal("done")
      timer.current = setTimeout(() => setSignal("idle"), 1600)
    }, 1200)
  }

  return (
    <div className="grid gap-4">
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[14px]">
        <dt className="text-kl-ink-3">Invoice</dt>
        <dd className="m-0">
          <span className="font-kl-mono whitespace-nowrap">INV-2207</span> for order{" "}
          <span className="font-kl-mono whitespace-nowrap">DM-4102</span>
        </dd>
        <dt className="text-kl-ink-3">Client</dt>
        <dd className="m-0">Scranton Business Park</dd>
        <dt className="text-kl-ink-3">Amount</dt>
        <dd className="m-0 tabular-nums">$1,284.00 · {paid ? "paid" : "due 12 Nov"}</dd>
      </dl>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" signal={signal} onClick={email}>
          {sentAt ? "Email again" : "Email invoice"}
        </Button>
        <Button disabled={paid} onClick={() => setPaid(true)}>
          {paid ? "Marked as paid" : "Mark as paid"}
        </Button>
      </div>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {signal === "pending"
          ? "Sending to accounts@scrantonbusinesspark.com…"
          : sentAt
            ? `Emailed at ${sentAt} to accounts@scrantonbusinesspark.com, copy to Angela Martin.`
            : "Not sent yet."}
      </p>
    </div>
  )
}
