"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Empty } from "@/components/keyline/ui/empty"

type State = "loading" | "error" | "retrying" | "ready"

export function CallLog() {
  const [state, setState] = useState<State>("loading")
  const [calls, setCalls] = useState<string[]>([])
  const failed = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const load = () => {
    setState(failed.current ? "retrying" : "loading")
    // the first load fails, as the call log server does every Monday morning; the retry works
    timer.current = setTimeout(() => {
      setState(failed.current ? "ready" : "error")
      failed.current = true
    }, 900)
  }
  useEffect(() => {
    load()
    return () => clearTimeout(timer.current)
  }, [])

  if (state === "loading")
    return (
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        Loading Phyllis&apos;s calls from this week…
      </p>
    )

  if (state !== "ready")
    return (
      <Empty
        live
        kind="error"
        title="The call log didn't load"
        description="The server in the annex didn't answer. Nothing was lost; try again."
        actions={
          <Button signal={state === "retrying" ? "pending" : "idle"} onClick={load}>
            Retry
          </Button>
        }
      />
    )

  if (!calls.length)
    return (
      <Empty
        live
        kind="start"
        title="No calls logged this week"
        description="Phyllis logs each sales call here, with who she spoke to and what they ordered."
        actions={<Button variant="primary" onClick={() => setCalls(["Called Lackawanna County. 120 cases of copy paper, delivered Thursday."])}>Log a call</Button>}
      />
    )

  return (
    <div className="grid gap-3">
      <ul className="m-0 grid list-none gap-2 p-0 text-[14px]">
        {calls.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      <Button className="justify-self-start" onClick={() => setCalls([])}>
        Clear the log
      </Button>
    </div>
  )
}
