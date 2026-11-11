"use client"

import Link from "next/link"
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

/**
 * Every component, grouped, in Keyline's Nav. The identity stays put at the top of the column; only the
 * list scrolls, in Keyline's ScrollArea, so its bar starts below the identity.
 *
 * The band follows the URL, not the press. The next page's render is one long task (its JS, style and layout), and
 * the band is drawn frame by frame on the same thread: a band that set off on the press was always mid-flight when
 * that task landed, so it stood still several rows tall, over labels it had not flipped, for as long as the render
 * took. Following the URL, the render comes first and the travel runs after it, uninterrupted. Until then the press
 * shows on the link itself (its press fill, and the Nav's lean toward it, held until the selection lands).
 */
export function DocsNav({ current }: { current: string }) {
  return (
    <>
      <Link href="/" className="s-dnav-home flex min-h-[60px] flex-none border-be-3 border-kl-line text-kl-ink no-underline hover:bg-kl-paper focus-visible:outline-offset-[-4px]">
        <NavIdentity mark={<Mark />} title="Keyline UI" meta="Components" />
      </Link>
      <ScrollArea label="Component index" className="s-dnav">
        <Nav linkComponent={Link} layout="cell" label="Components" value={current} groups={GROUPS} />
      </ScrollArea>
    </>
  )
}
