import type { ComponentContent } from "@site/content/types";
import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { NavigationMenuSite } from "@site/components/nav-previews";

const IMPORT = `import {
  NavigationMenu, NavigationMenuCard, NavigationMenuContent, NavigationMenuGrid,
  NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "@/components/keyline/ui/navigation-menu"`;

const USAGE = `<NavigationMenu aria-label="Dunder Mifflin Paper">
  <NavigationMenuList>
    <NavigationMenuItem value="products">
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuGrid>
          <NavigationMenuCard href="/products/copy" title="Copy paper" code="CPY" description="Letter and legal, by the case." />
        </NavigationMenuGrid>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`;

const PROPS: Prop[] = [
  {
    name: "value",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>NavigationMenuItem</code>: names a section that opens a panel.
      </>
    ),
  },
  {
    name: "title \u00b7 description \u00b7 code",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>NavigationMenuCard</code>: the link&apos;s name, a line about it, and a code at its end.
      </>
    ),
  },
  {
    name: "active",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>NavigationMenuCard</code> and <code>NavigationMenuLink</code>: the current page.
      </>
    ),
  },
  { name: "href", type: "string", default: "\u2014", description: "Where the link goes." },
  {
    name: "aria-label",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>NavigationMenu</code>: names the landmark.
      </>
    ),
  },
  {
    name: "side \u00b7 align \u00b7 anchor",
    type: "Base UI side \u00b7 align \u00b7 Element | ref",
    default: '"bottom" \u00b7 "start" \u00b7 the list',
    description: (
      <>
        On <code>NavigationMenuPopup</code>: where the panel docks. It docks to the list&apos;s frame, not the open
        trigger, and flips when there&apos;s no room.
      </>
    ),
  },
  {
    name: "sideOffset \u00b7 alignOffset \u00b7 collisionPadding",
    type: "number",
    default: "-2 \u00b7 0 \u00b7 12",
    description: (
      <>
        On <code>NavigationMenuPopup</code>: the positioner&apos;s props, lifted onto the popup.
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>NavigationMenuPopup</code>: where the panel&apos;s portal renders, and props for the portal. It keeps
        the theme, density, motion and direction of the place it is written either way. To pass them, compose{" "}
        <code>NavigationMenuRoot</code>, the list and <code>NavigationMenuPopup</code> yourself.
      </>
    ),
  },
];

const TOC: TocGroup[] = [
  {
    label: "Setup",
    items: [
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React website navigation menu whose sections open a panel of links docked under the bar; the panel swaps in place without resizing. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A website&apos;s navigation, where sections open a panel of links docked under the bar. The open section is the
        inverse cell, and moving to the next one stretches it across; the panel swaps in place without resizing. For an
        app&apos;s own sections use <Link href="/docs/components/nav">Nav</Link>, and for its commands,{" "}
        <Link href="/docs/components/menubar">Menubar</Link>.
      </p>

      <ComponentDemo
        label="Navigation menu example"
        preview={<NavigationMenuSite />}
        code={code("navigation-menu-site.tsx", "example code")}
      />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: null,
  reference: (
    <>
      <p className="s-small">
        Hover opens a section after a short delay; Enter, Space or Down opens it from the keyboard, and Escape closes
        it. Parts, named as Base UI names them: <code>NavigationMenuRoot</code>, <code>NavigationMenuList</code>,{" "}
        <code>NavigationMenuItem</code>, <code>NavigationMenuTrigger</code> (with Base UI&apos;s Icon inside),{" "}
        <code>NavigationMenuLink</code>, <code>NavigationMenuContent</code> and <code>NavigationMenuPopup</code> (Base
        UI&apos;s Portal, Positioner, Popup and Viewport in one part), with Keyline&apos;s <code>NavigationMenu</code>{" "}
        (the root with its popup in place), <code>NavigationMenuGrid</code> and <code>NavigationMenuCard</code>. Every
        part takes <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function of its
        state. Each carries a <code>data-slot</code>: <code>navigation-menu</code>, <code>navigation-menu-list</code>,{" "}
        <code>navigation-menu-item</code>, <code>navigation-menu-trigger</code> (with Base UI&apos;s{" "}
        <code>data-popup-open</code>, and <code>data-kl-covered</code> while the moving band covers it),{" "}
        <code>navigation-menu-icon</code>, <code>navigation-menu-link</code> (<code>aria-current=&quot;page&quot;</code>{" "}
        when active), <code>navigation-menu-content</code>, <code>navigation-menu-popup</code>,{" "}
        <code>navigation-menu-viewport</code>, <code>navigation-menu-grid</code>, <code>navigation-menu-grid-item</code>{" "}
        and <code>navigation-menu-card</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/navigation-menu">Base UI Navigation Menu</a>; its other props pass
        through.
      </p>
    </>
  ),
};
