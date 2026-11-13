import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import { ContextMenuClients } from "@site/components/action-previews";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";

const IMPORT = `import {
  ContextMenu,
  ContextMenuPopup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/keyline/ui/context-menu"`;

const USAGE = `<ContextMenu>
  <ContextMenuTrigger tabIndex={0} aria-label="Lackawanna County">
    Lackawanna County
  </ContextMenuTrigger>
  <ContextMenuPopup>
    <ContextMenuItem onClick={call}>Call</ContextMenuItem>
  </ContextMenuPopup>
</ContextMenu>`;

const PROPS: Prop[] = [
  {
    name: "render",
    type: "ReactElement",
    default: "<div>",
    description: (
      <>
        On <code>ContextMenuTrigger</code>: the object itself, such as a row or a card.
      </>
    ),
  },
  {
    name: "tabIndex",
    type: "number",
    default: "—",
    description: (
      <>
        On <code>ContextMenuTrigger</code>: 0 makes the object focusable, so Shift+F10 and the Menu key reach it.
      </>
    ),
  },
  {
    name: "side \u00b7 align \u00b7 anchor",
    type: "Base UI side \u00b7 align \u00b7 Element | ref",
    default: "at the pointer",
    description: (
      <>
        On <code>ContextMenuPopup</code>: the positioner&apos;s placement, lifted onto the popup. Base UI places the
        menu at the pointer (or at the focused object, from the keyboard).
      </>
    ),
  },
  {
    name: "sideOffset \u00b7 alignOffset \u00b7 collisionPadding",
    type: "number",
    default: "Base UI\u2019s \u00b7 Base UI\u2019s \u00b7 8",
    description: (
      <>
        On <code>ContextMenuPopup</code>: the positioner&apos;s offsets, lifted onto the popup.
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>ContextMenuPopup</code>: where the menu&apos;s portal renders, and props for the portal. It keeps the
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
  seo: "A React context menu on Base UI, opened by right-click, long-press or Shift+F10, with an ink keyline marking the object it acts on while it is open.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A menu opened on an object: right-click, long-press, or Shift+F10 on a focused target. While it is open, an ink
        keyline marks the object it acts on.
      </p>

      <ComponentDemo
        label="Context menu example"
        preview={<ContextMenuClients />}
        code={code("context-menu-clients.tsx", "example code")}
      />
    </>
  ),
  usage: (
    <>
      <p>
        A context menu is a shortcut. Put every action somewhere visible too, such as a row&rsquo;s Menu button, so
        people who never right-click can still reach it.
      </p>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: null,
  reference: (
    <>
      <p className="s-small">
        Parts, named as Base UI names them: <code>ContextMenu</code> (also <code>ContextMenuRoot</code>),{" "}
        <code>ContextMenuTrigger</code> and <code>ContextMenuPopup</code> (Base UI&apos;s Portal, Positioner and Popup
        in one part). The rows are Menu&rsquo;s, re-exported as <code>ContextMenuItem</code>,{" "}
        <code>ContextMenuCheckboxItem</code>, <code>ContextMenuRadioGroup</code>, <code>ContextMenuRadioItem</code>,{" "}
        <code>ContextMenuSeparator</code>, <code>ContextMenuGroup</code>, <code>ContextMenuGroupLabel</code>,{" "}
        <code>ContextMenuSubmenuRoot</code>, <code>ContextMenuSubmenuTrigger</code> and{" "}
        <code>ContextMenuSubmenuPopup</code>. Every part takes <code>render</code>, and a <code>className</code> or{" "}
        <code>style</code> that may be a function of its state. Each carries a <code>data-slot</code>:{" "}
        <code>context-menu-trigger</code> (with Base UI&apos;s <code>data-popup-open</code> while its menu is open; when
        it renders another part, such as an <code>Item</code>, the element keeps that part&apos;s slot),{" "}
        <code>menu-popup</code> (Menu&apos;s surface, with Base UI&apos;s <code>data-side</code> and{" "}
        <code>data-align</code>) and Menu&apos;s row slots. Built on{" "}
        <a href="https://base-ui.com/react/components/context-menu">Base UI Context Menu</a>; its other props pass
        through.
      </p>
    </>
  ),
};
