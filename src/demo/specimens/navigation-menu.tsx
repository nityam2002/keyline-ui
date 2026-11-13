import * as ui from "../demo-ui";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuGrid,
  NavigationMenuCard,
} from "@/registry/keyline/ui/navigation-menu";

/* ------------------------------------------------------------------ *
 * 2. Navigation menu
 * ------------------------------------------------------------------ */
function SiteNav({ label = "Main", testid }: { label?: string; testid?: string }) {
  return (
    <NavigationMenu aria-label={label} data-testid={testid}>
      <NavigationMenuList>
        <NavigationMenuItem value="services">
          <NavigationMenuTrigger>Services</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuGrid>
              <NavigationMenuCard
                href="#ocean"
                title="Ocean freight"
                code="OCN"
                description="Port to port or door to door, full and part loads."
              />
              <NavigationMenuCard
                href="#air"
                title="Air freight"
                code="AIR"
                description="Next-flight-out and consolidated air cargo."
              />
              <NavigationMenuCard
                href="#customs"
                title="Customs"
                code="CUS"
                description="Declarations, permits and bonded storage."
                active
              />
              <NavigationMenuCard
                href="#warehousing"
                title="Warehousing"
                code="WHS"
                description="Cross-dock and long-term storage near the quay."
              />
            </NavigationMenuGrid>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="terminals">
          <NavigationMenuTrigger>Terminals</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuGrid>
              <NavigationMenuCard
                href="#rtm"
                title="Rotterdam"
                code="RTM"
                description="ECT Delta, APM Maasvlakte II, RWG."
              />
              <NavigationMenuCard href="#anr" title="Antwerp" code="ANR" description="PSA Europa, MPET." />
              <NavigationMenuCard href="#ham" title="Hamburg" code="HAM" description="Burchardkai, Altenwerder." />
            </NavigationMenuGrid>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#pricing" active>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#contact">Contact</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
export function NavigationMenuSpecimen() {
  return (
    <div className={ui.stack} data-testid="specimen-nm">
      <SiteNav testid="nm-main" />
      <p className={ui.note}>Hover or press a section; the panel docks under the frame. Pricing is the current page.</p>
      <div className={ui.group} style={{ maxWidth: 300 }} data-testid="nm-narrow">
        <h3 className={ui.cap}>300px column</h3>
        <SiteNav label="Main, narrow" />
      </div>
      <div className={ui.group} dir="rtl" data-testid="nm-rtl">
        <h3 className={ui.cap}>Right to left</h3>
        <NavigationMenu aria-label="الرئيسية">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>الخدمات</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuGrid>
                  <NavigationMenuCard
                    href="#ocean"
                    title="الشحن البحري"
                    code="OCN"
                    description="من الميناء إلى الميناء."
                  />
                  <NavigationMenuCard href="#air" title="الشحن الجوي" code="AIR" description="الرحلة التالية." />
                </NavigationMenuGrid>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#pricing" active>
                الأسعار
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
