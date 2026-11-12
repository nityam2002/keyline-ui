import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { NavigationMenuSite } from "@site/components/nav-previews";

const ITEM = "navigation-menu";

export const metadata = componentMetadata(
  "Navigation menu",
  "A React website navigation menu whose sections open a panel of links docked under the bar; the panel swaps in place without resizing. On Base UI.",
  "navigation-menu",
);

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

export default function NavigationMenuPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Navigation menu" toc={TOC}>
      <h1>Navigation menu</h1>
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

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Navigation menu props" props={PROPS} />
      <p className="s-small">
        Hover opens a section after a short delay; Enter, Space or Down opens it from the keyboard, and Escape closes
        it. Built on <a href="https://base-ui.com/react/components/navigation-menu">Base UI Navigation Menu</a>.
      </p>
    </DocPage>
  );
}
