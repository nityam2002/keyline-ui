"use client"

import { useEffect, useRef, useState } from "react"
import { Kbd, KbdGroup } from "@/components/keyline/ui/kbd"

const SHORTCUTS = [
  { id: "new", keys: ["N"], does: "New order" },
  { id: "find", keys: ["/"], does: "Find a client" },
  { id: "save", keys: ["Ctrl", "S"], does: "Save the order" },
  { id: "invoices", keys: ["G", "I"], sep: "then", does: "Go to invoices" },
]

export function OrderShortcuts() {
  const [hit, setHit] = useState<string | null>(null)
  const pendingG = useRef(false)
  const area = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = area.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      let id: string | null = null
      if ((e.ctrlKey || e.metaKey) && k === "s") id = "save"
      else if (e.ctrlKey || e.metaKey || e.altKey) return
      else if (pendingG.current && k === "i") id = "invoices"
      else if (k === "n") id = "new"
      else if (k === "/") id = "find"
      pendingG.current = k === "g"
      if (id) {
        e.preventDefault()
        setHit(id)
      }
    }
    el.addEventListener("keydown", onKey)
    return () => el.removeEventListener("keydown", onKey)
  }, [])

  const done = SHORTCUTS.find((s) => s.id === hit)

  return (
    <div
      ref={area}
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the area takes focus so its shortcuts have somewhere to land
      tabIndex={0}
      aria-label="Order screen. Try a shortcut."
      className="grid gap-4 outline-offset-4 focus-visible:outline-2 focus-visible:outline-current"
    >
      <dl className="m-0 grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 text-[14px]">
        {SHORTCUTS.map((s) => (
          <div key={s.id} className="contents">
            <dt className="flex items-center gap-2">
              {s.sep === "then" ? (
                // a sequence: the group would draw it exactly like a chord, so the word "then" is printed between the keys
                s.keys.map((k, i) => (
                  <span key={k} className="contents">
                    {i > 0 ? <span className="text-[13px] text-kl-ink-3">then</span> : null}
                    <Kbd>{k}</Kbd>
                  </span>
                ))
              ) : s.keys.length > 1 ? (
                <KbdGroup>
                  {s.keys.map((k) => (
                    <Kbd key={k}>{k}</Kbd>
                  ))}
                </KbdGroup>
              ) : (
                <Kbd label={s.keys[0] === "/" ? "Slash" : undefined}>{s.keys[0]}</Kbd>
              )}
            </dt>
            <dd className={hit === s.id ? "m-0 font-semibold" : "m-0 text-kl-ink-2"}>{s.does}</dd>
          </div>
        ))}
      </dl>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {done ? `${done.does}. In the real order screen that would happen now.` : "Click here, then press a shortcut."}
      </p>
    </div>
  )
}
