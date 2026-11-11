"use client";

import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { DirectionProvider } from "@base-ui/react/direction-provider"

import { cn } from "@/lib/utils"
import { scopeProps, useDomDirection, useKeylineScope, useMergedRef } from "../lib/keyline-scope"
import { useScrollEdges } from "../lib/scroll-edges"
import { useStretch } from "../lib/keyline-motion"

/**
 * Navigation menu: site navigation whose sections open a panel of links (Base UI Navigation
 * Menu). For an application's own commands use Menubar; for an app's sections, Nav.
 *
 *   ┌──────────┬────────────┬─────────┬──────────┐
 *   │ Services▾│ Terminals ▾│ Pricing │ Contact  │   a control frame of cells: section triggers and links;
 *   └──────────┴────────────┼─────────┴──────────┘   the open trigger is the inverse cell, the current
 *   ┌───────────────────────┴──┬───────────────────┐  page's link is cobalt (location)
 *   │ Ocean freight     OCN    │ Customs     CUS   │   the panel docks to the frame's bottom keyline at its
 *   │ Door to door by sea      │ Filing, permits   │   weight, cells of links on shared seams (title, a
 *   ├──────────────────────────┼───────────────────┤   description, an optional code)
 *
 * - Behaviour is Base UI's: Tab moves between top-level items, Enter, Space or Down opens a section and
 *   moves into its panel; hover opens after a short delay; Escape closes and returns to the trigger.
 *   Left/Right follow the reading direction (the DOM `dir` is passed to Base UI).
 * - The panel never animates its size between sections (frames don't move); it unfolds from the frame's
 *   keyline when it opens (Unfold) and is instant under reduced motion. Moving from one open section to the
 *   next, the inverse cell stretches across to the new trigger (Stretch): the panel swaps in
 *   place, so the band is what says which section it now belongs to. Opening and closing do not stretch.
 * - Narrow: the frame scrolls sideways and marks its hidden edge; the panel is one column.
 */
/** The list (the control frame) the panel docks to; set by NavigationMenuList. */
const FrameContext = React.createContext<React.Dispatch<React.SetStateAction<HTMLElement | null>> | null>(null)

function NavigationMenu({ className, children, ref: refProp, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [frame, setFrame] = React.useState<HTMLElement | null>(null)
  const [dir] = useDomDirection(ref)
  const [marker, scope, probe] = useKeylineScope(false)
  const setRef = useMergedRef(ref, refProp)
  return (
    <DirectionProvider direction={dir}>
      <FrameContext.Provider value={setFrame}>
      <NavigationMenuPrimitive.Root ref={setRef} data-slot="navigation-menu" className={cn("kl-nmenu", className)} {...props}>
        {children}
        {marker}
        <NavigationMenuPrimitive.Portal>
          {probe}
          {/* docked to the frame, not the open trigger: the trigger sits inside the frame's k2 border, so a
              trigger-anchored panel ran k2 inside the frame's edge. On the frame, the panel's top border lies on
              the frame's bottom border (sideOffset -k2) and their outer start edges coincide; the panel stays put
              between sections. */}
          <NavigationMenuPrimitive.Positioner anchor={frame ?? undefined} side="bottom" align="start" sideOffset={-2} collisionPadding={12} {...scopeProps(scope, { className: "kl-positioner kl-nmenu-positioner" })}>
            <NavigationMenuPrimitive.Popup data-slot="navigation-menu-popup" className="kl-attached kl-dock kl-nmenu-popup" style={{ "--kl-attach": "2px" } as React.CSSProperties}>
              <NavigationMenuPrimitive.Viewport className="kl-nmenu-viewport" />
            </NavigationMenuPrimitive.Popup>
          </NavigationMenuPrimitive.Positioner>
        </NavigationMenuPrimitive.Portal>
      </NavigationMenuPrimitive.Root>
      </FrameContext.Provider>
    </DirectionProvider>
  )
}

function NavigationMenuList({ className, children, ref: refProp, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  const ref = React.useRef<HTMLUListElement | null>(null)
  useScrollEdges(ref as React.RefObject<HTMLElement | null>)
  // the open trigger, as an index among the list's cells; Base UI owns the state, the band follows its attribute
  const [open, setOpen] = React.useState(-1)
  React.useLayoutEffect(() => {
    const list = ref.current
    if (!list) return
    // moving between sections, Base UI may close the old one a few ms before opening the next (WebKit):
    // a close is held briefly, so a section that opens within the grace makes the band travel instead of snap
    let grace = 0
    const read = () => {
      const items = Array.from(list.querySelectorAll<HTMLElement>("[data-kl-item]"))
      const i = items.findIndex((el) => el.hasAttribute("data-popup-open"))
      clearTimeout(grace)
      if (i >= 0) setOpen(i)
      else grace = window.setTimeout(() => setOpen(-1), 80)
    }
    read()
    const mo = new MutationObserver(read)
    mo.observe(list, { subtree: true, childList: true, attributeFilter: ["data-popup-open"] })
    return () => {
      mo.disconnect()
      clearTimeout(grace)
    }
  }, [])
  useStretch(ref as React.RefObject<HTMLElement | null>, open)
  const setFrame = React.useContext(FrameContext)
  React.useLayoutEffect(() => {
    if (!setFrame) return
    setFrame(ref.current)
    return () => setFrame(null)
  }, [setFrame])
  const setRef = useMergedRef(ref, refProp)
  return (
    <NavigationMenuPrimitive.List ref={setRef} data-slot="navigation-menu-list" data-kl-stretch="" className={cn("kl-ctl kl-cells kl-nmenu-list", className)} {...props}>
      {/* a presentational list item: a <ul> may only contain <li> */}
      <li data-kl-band="" role="presentation" className="kl-nmenu-band" aria-hidden hidden />
      {children}
    </NavigationMenuPrimitive.List>
  )
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("kl-nmenu-item", className)} {...props} />
}

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" data-kl-item="" className={cn("kl-key kl-nmenu-trigger", className)} {...props}>
      <span className="kl-nmenu-tl">{children}</span>
      <NavigationMenuPrimitive.Icon className="kl-nmenu-caret">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" aria-hidden>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </NavigationMenuPrimitive.Icon>
    </NavigationMenuPrimitive.Trigger>
  )
}

/** A top-level link cell (no panel). `active` marks the current page (aria-current="page", cobalt). */
function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return <NavigationMenuPrimitive.Link data-slot="navigation-menu-link" data-kl-item="" className={cn("kl-key kl-nmenu-link", className)} {...props} />
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return <NavigationMenuPrimitive.Content data-slot="navigation-menu-content" className={cn("kl-nmenu-content", className)} {...props} />
}

/** The panel's links as cells on shared seams: two columns where there is room, one where there is not. */
function NavigationMenuGrid({ className, children, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul data-slot="navigation-menu-grid" className={cn("kl-nmenu-grid", className)} {...props}>
      {React.Children.map(children, (c) => (c == null || c === false ? null : <li className="kl-nmenu-gi">{c}</li>))}
    </ul>
  )
}

type CardProps = Omit<React.ComponentProps<typeof NavigationMenuPrimitive.Link>, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** A Code-voice identifier at the cell's end (a service code, a terminal code). */
  code?: React.ReactNode
}

/** A link cell in a panel: title, description, code. `active` marks the current page. */
function NavigationMenuCard({ className, title, description, code, ...props }: CardProps) {
  return (
    <NavigationMenuPrimitive.Link data-slot="navigation-menu-card" className={cn("kl-nmenu-card", className)} {...props}>
      <span className="kl-nmenu-card-t">{title}</span>
      {code != null ? <span className="kl-nmenu-card-code">{code}</span> : null}
      {description != null ? <span className="kl-nmenu-card-d">{description}</span> : null}
    </NavigationMenuPrimitive.Link>
  )
}

export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuContent, NavigationMenuGrid, NavigationMenuCard }
