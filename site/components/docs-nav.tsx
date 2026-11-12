"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Nav, NavIdentity, type NavGroup } from "@/components/keyline/ui/nav"
import { ScrollArea } from "@/components/keyline/ui/scroll-area"
import { INDEX } from "@site/lib/catalog"
import { Mark } from "./land"

const GROUPS: NavGroup[] = INDEX.map((g) => ({
  label: g.group,
  items: g.items.map((it) => ({
    value: it.name,
    label: it.name,
    href: it.href,
    // registry items whose pages are not written yet: listed, not links
    disabled: !it.href,
  })),
}))

/* Set by DocsNav: records the page a link was just pressed for, so the band moves on the press. */
const Choose = React.createContext<(href: string) => void>(() => {})

/**
 * The Nav's link: Next's Link (client-side navigation), which also reports a plain left click at once. A
 * click that opens a new tab or window, or that something prevented, chooses nothing here.
 */
function NavLink({ onClick, ...props }: React.ComponentProps<typeof Link>) {
  const choose = React.useContext(Choose)
  return (
    <Link
      {...props}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        choose(typeof props.href === "string" ? props.href : (props.href.pathname ?? ""))
      }}
    />
  )
}

const nameOf = (href: string) => INDEX.flatMap((g) => g.items).find((e) => e.href === href)?.name

/**
 * Every component, grouped, in Keyline's Nav. The identity stays put at the top of the column; only the
 * list scrolls, in Keyline's ScrollArea, so its bar starts below the identity.
 *
 * The band follows the press, not the page: the next page takes a server round trip to arrive (a second or more
 * on a slow link), and a band that waited for it sat still under the pointer and then leapt. The band's move runs
 * on the compositor, so the next page's render (one long task) landing mid-move does not freeze it. The choice
 * holds only while the URL is the one it was made on; once the page lands (or the reader goes back) the URL is the
 * truth again.
 */
export function DocsNav({ current }: { current: string }) {
  const pathname = usePathname()
  const [chosen, setChosen] = React.useState<{ on: string; name: string } | null>(null)
  const choose = React.useCallback(
    (href: string) => {
      const name = nameOf(href)
      if (name) setChosen({ on: pathname, name })
    },
    [pathname],
  )
  // the URL moved (the page landed, or back/forward): the choice is spent, never applied again on return
  if (chosen && chosen.on !== pathname) setChosen(null)
  const value = chosen && chosen.on === pathname ? chosen.name : current
  return (
    <Choose.Provider value={choose}>
      <Link href="/" className="s-dnav-home flex min-h-[60px] flex-none border-be-3 border-kl-line text-kl-ink no-underline hover:bg-kl-paper focus-visible:outline-offset-[-4px]">
        <NavIdentity mark={<Mark />} title="Keyline UI" meta="Components" />
      </Link>
      <ScrollArea label="Component index" className="s-dnav">
        <Nav linkComponent={NavLink} layout="cell" label="Components" value={value} groups={GROUPS} />
      </ScrollArea>
    </Choose.Provider>
  )
}
