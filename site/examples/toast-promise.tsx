"use client"

import { useRef } from "react"
import { Button } from "@/components/keyline/ui/button"
import { ToastFloating, ToastProvider, useToaster } from "@/components/keyline/ui/toast"

function Send() {
  const toast = useToaster()
  const tries = useRef(0)

  const send = () => {
    tries.current += 1
    // the first send fails (corporate's fax is jammed), the retry gets through
    const fails = tries.current === 1
    const sent = new Promise<number>((ok, no) => setTimeout(() => (fails ? no(new Error("busy")) : ok(14)), 1600))
    toast
      .promise(sent, {
        loading: { title: "Sending the quarterly report to corporate…" },
        done: (pages) => ({ title: "Report sent to Jan", description: `${pages} pages, received in New York.` }),
        failed: { title: "Corporate didn't pick up", description: "Their fax line is busy.", action: { label: "Retry", onClick: send } },
      })
      .catch(() => {})
  }

  return <Button onClick={send}>Send to corporate</Button>
}

export function SendReport() {
  return (
    <ToastProvider>
      <Send />
      <ToastFloating />
    </ToastProvider>
  )
}
