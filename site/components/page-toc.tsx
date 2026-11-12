"use client"

import * as React from "react"
import { Nav, type NavGroup } from "@/components/keyline/ui/nav"
import { pageScroller } from "./page-scroll"

export type TocGroup = { label: string; items: { id: string; label: string }[] }

// a section is current once its heading reaches this far from the top of the viewport: just below the
// sticky header, where a jump puts it (the page's scroll-padding), plus some slack
const LINE = 160

/** The headings of this page in Keyline's Nav; the band follows the section being read. */
export function PageToc({ title, groups }: { title: string; groups: TocGroup[] }) {
  const ids = React.useMemo(() => groups.flatMap((g) => g.items.map((i) => i.id)), [groups])
  const [active, setActive] = React.useState(ids[0] ?? "")
  // a section chosen in the index stays current until the reader scrolls by themselves: near the end of
  // the page a short section can't reach the line, and the band must not land on its neighbour
  const chosen = React.useRef<string | null>(null)
  React.useEffect(() => {
    let frame = 0
    const pick = () => {
      frame = 0
      if (chosen.current) {
        // still the section on screen: keep it. Scrolled away from it by any means: let the headings decide
        const t = document.getElementById(chosen.current)?.getBoundingClientRect().top ?? Infinity
        if (t > -40 && t < window.innerHeight / 2) return setActive(chosen.current)
        chosen.current = null
      }
      let cur = ids[0] ?? ""
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= LINE) cur = id
      }
      // at the very end of the page the last heading may never reach the line
      const sc = pageScroller()
      if (sc.clientHeight + sc.scrollTop >= sc.scrollHeight - 2) cur = ids.at(-1) ?? cur
      setActive(cur)
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(pick) }
    const release = () => { if (chosen.current) { chosen.current = null; queue() } }
    pick()
    // the page scrolls in its ScrollArea, not the document: scroll does not bubble, so listen in the capture phase
    window.addEventListener("scroll", queue, { passive: true, capture: true })
    window.addEventListener("resize", queue)
    for (const t of ["wheel", "touchstart", "keydown", "pointerdown"] as const) window.addEventListener(t, release, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", queue, { capture: true })
      window.removeEventListener("resize", queue)
      for (const t of ["wheel", "touchstart", "keydown", "pointerdown"] as const) window.removeEventListener(t, release)
    }
  }, [ids])
  // the link's own jump stays native (hash, focus, history); this only records which section was chosen
  const onClickCapture = (e: React.MouseEvent) => {
    const a = (e.target as Element).closest("a[href^='#']")
    if (!a) return
    const id = a.getAttribute("href")!.slice(1)
    chosen.current = id
    setActive(id)
  }
  const navGroups: NavGroup[] = groups.map((g) => ({ label: g.label, items: g.items.map((i) => ({ value: i.id, label: i.label, href: `#${i.id}` })) }))
  return (
    <div className="s-toc" onClickCapture={onClickCapture}>
      <Nav label={title} header={title} value={active} groups={navGroups} />
    </div>
  )
}
