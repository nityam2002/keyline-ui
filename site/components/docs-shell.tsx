"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AppShell } from "@/components/keyline/ui/app-shell"
import { Breadcrumb } from "@/components/keyline/ui/breadcrumb"
import { INDEX } from "@site/lib/catalog"
import { DocsNav } from "./docs-nav"
import { PageToc, type TocGroup } from "./page-toc"
import { SiteControls } from "./site-controls"

const NARROW = 900
const ASIDE_AT = 1180

/** The catalogue name of the page at `path` ("" off the catalogue). */
export const pageName = (path: string) => INDEX.flatMap((g) => g.items).find((e) => e.href === path)?.name ?? ""

/* The shell lives in the docs layout; each page hands it the page's own index through this. */
const SetToc = React.createContext<(toc: TocGroup[]) => void>(() => {})

/** Registers a page's index with the shell's aside (rendered by DocPage). */
export function useDocToc(toc: TocGroup[]) {
  const set = React.useContext(SetToc)
  React.useLayoutEffect(() => set(toc), [set, toc])
}

/** Docs page: Keyline's AppShell. The component index is the sidebar (a sheet on narrow screens), the page's own index the aside. */
export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const current = pageName(pathname)
  const [toc, setToc] = React.useState<TocGroup[]>([])
  // the aside is shown only where the shell sets it beside the page; below that it would open as a sheet,
  // and an index nobody asked for must not cover the page. Measured on the shell's own box, as AppShell does.
  // It starts open: the server's HTML then has the aside, and AppShell's CSS hides it where there is no room, so a
  // wide screen does not gain a column (and move the page) once this measures. The first measurement runs in the
  // same commit as AppShell's, so a narrow screen never sees the aside open as a sheet.
  const ref = React.useRef<HTMLDivElement>(null)
  const [wide, setWide] = React.useState(true)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWide(el.getBoundingClientRect().width >= ASIDE_AT)
    measure() // now, not at the observer's first report: in the same commit as AppShell's own measurement
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <SetToc.Provider value={setToc}>
      <div ref={ref} className="s-docs">
        <AppShell
          className="s-shell"
          stickyHeader
          navLabel="Component index"
          nav={<DocsNav current={current} />}
          narrowAt={NARROW}
          asideInlineAt={ASIDE_AT}
          navSize={248}
          asideSize={220}
          header={<Breadcrumb layout="cell" items={[{ label: "Keyline UI", href: "/" }, { label: current }]} />}
          actions={<SiteControls layout="cells" />}
          // a new page is a new index: its band starts on its first section, it does not travel from the last page's
          aside={<PageToc key={pathname} title="On this page" groups={toc} />}
          asideOpen={wide}
          asideLabel="On this page"
          mainProps={{ id: "main", className: "s-read" }}
        >
          {children}
        </AppShell>
      </div>
    </SetToc.Provider>
  )
}
