"use client"

import { useState } from "react"
import {
  NavigationMenu,
  NavigationMenuCard,
  NavigationMenuContent,
  NavigationMenuGrid,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/keyline/ui/navigation-menu"

export function PaperSiteNav() {
  const [went, setWent] = useState<string | null>(null)
  // the example stays on this page: each link says where it would go instead of leaving
  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setWent(href)
  }

  return (
    <div className="grid min-h-[300px] content-start gap-4">
      <NavigationMenu aria-label="Dunder Mifflin Paper">
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuGrid>
                <NavigationMenuCard href="/products/copy" onClick={go("/products/copy")} title="Copy paper" code="CPY" description="Letter and legal, 20 to 32 lb, by the ream or case." />
                <NavigationMenuCard href="/products/cardstock" onClick={go("/products/cardstock")} title="Cardstock" code="CRD" description="65 to 110 lb, white and colours." />
                <NavigationMenuCard href="/products/envelopes" onClick={go("/products/envelopes")} title="Envelopes" code="ENV" description="#10, catalog and security tint." />
                <NavigationMenuCard href="/products/labels" onClick={go("/products/labels")} title="Labels" code="LBL" description="Shipping and file labels, laser and inkjet." />
              </NavigationMenuGrid>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="branches">
            <NavigationMenuTrigger>Branches</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuGrid>
                <NavigationMenuCard href="/branches/scranton" onClick={go("/branches/scranton")} title="Scranton" code="SCR" description="1725 Slough Avenue, Scranton, PA." active />
                <NavigationMenuCard href="/branches/nashua" onClick={go("/branches/nashua")} title="Nashua" code="NSH" description="Nashua, NH." />
                <NavigationMenuCard href="/branches/utica" onClick={go("/branches/utica")} title="Utica" code="UTC" description="Utica, NY." />
              </NavigationMenuGrid>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/pricing" onClick={go("/pricing")}>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/contact" onClick={go("/contact")}>
              Contact
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {went ? `Would open ${went}.` : "You are on the Scranton branch page."}
      </p>
    </div>
  )
}
