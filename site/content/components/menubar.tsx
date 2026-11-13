import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import { MenubarReport } from "@site/components/action-previews";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";

const IMPORT = `import {
  Menubar,
  MenubarPopup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/keyline/ui/menubar"`;

const USAGE = `<Menubar aria-label="Sales report">
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarPopup>
      <MenubarItem onClick={print}>Print</MenubarItem>
    </MenubarPopup>
  </MenubarMenu>
</Menubar>`;

const PROPS: Prop[] = [
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame, for a menubar that is the top row of a Panel or an app shell header.
      </>
    ),
  },
  { name: "aria-label", type: "string", default: "—", description: "Name the bar for what its menus act on." },
  {
    name: "loopFocus",
    type: "boolean",
    default: "true",
    description: "Left and Right wrap from the last title to the first.",
  },
  {
    name: "side \u00b7 align \u00b7 anchor",
    type: "Base UI side \u00b7 align \u00b7 Element | ref",
    default: '"bottom" \u00b7 "start" \u00b7 the title',
    description: (
      <>
        On <code>MenubarPopup</code>: where the menu docks. It flips when there&apos;s no room.
      </>
    ),
  },
  {
    name: "sideOffset \u00b7 alignOffset \u00b7 collisionPadding",
    type: "number",
    default: "0 \u00b7 0 \u00b7 12",
    description: (
      <>
        On <code>MenubarPopup</code>: the positioner&apos;s props, lifted onto the popup.
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>MenubarPopup</code>: where the menu&apos;s portal renders, and props for the portal. It keeps the
        theme, density, motion and direction of the place it is written either way.
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
  seo: "A React menubar: a row of menus in one frame. Each menu docks under its title, and with one open, Left and Right move to the next. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A row of menus in one frame. Each title is a cell; its menu docks to the frame&rsquo;s bottom edge under it.
        With one menu open, Left and Right move to the next.
      </p>

      <ComponentDemo
        widths
        label="Menubar example"
        preview={<MenubarReport />}
        code={code("menubar-report.tsx", "example code")}
      />
    </>
  ),
  usage: (
    <>
      <p>
        The rows are Menu&rsquo;s, re-exported under Menubar names: <code>MenubarItem</code>,{" "}
        <code>MenubarCheckboxItem</code>, <code>MenubarRadioGroup</code>, <code>MenubarRadioItem</code>,{" "}
        <code>MenubarSeparator</code> and the submenu parts.
      </p>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: null,
  reference: (
    <>
      <p className="s-small">
        At narrow widths the titles scroll inside the frame and the hidden edge is shaded. Parts, named as Base UI names
        them: <code>Menubar</code>, <code>MenubarMenu</code> (Base UI&apos;s Menu.Root), <code>MenubarTrigger</code> and{" "}
        <code>MenubarPopup</code> (Base UI&apos;s Portal, Positioner and Popup in one part), with Menu&apos;s rows
        re-exported as <code>MenubarItem</code>, <code>MenubarCheckboxItem</code>, <code>MenubarRadioGroup</code>,{" "}
        <code>MenubarRadioItem</code>, <code>MenubarSeparator</code>, <code>MenubarGroup</code>,{" "}
        <code>MenubarGroupLabel</code>, <code>MenubarSubmenuRoot</code>, <code>MenubarSubmenuTrigger</code> and{" "}
        <code>MenubarSubmenuPopup</code>. Every part takes <code>render</code>, and a <code>className</code> or{" "}
        <code>style</code> that may be a function of its state. Each carries a <code>data-slot</code>:{" "}
        <code>menubar</code> (with <code>data-kl-layout</code>), <code>menubar-trigger</code> (with Base UI&apos;s{" "}
        <code>data-popup-open</code> and <code>data-disabled</code>), <code>menu-popup</code> (Menu&apos;s surface, with
        Base UI&apos;s <code>data-side</code> and <code>data-align</code>) and Menu&apos;s row slots. Built on{" "}
        <a href="https://base-ui.com/react/components/menubar">Base UI Menubar</a>; its other props pass through.
      </p>
    </>
  ),
};
