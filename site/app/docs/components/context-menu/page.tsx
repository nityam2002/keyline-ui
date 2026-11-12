import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { ContextMenuClients } from "@site/components/action-previews";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";

const ITEM = "context-menu";

export const metadata = componentMetadata(
  "Context menu",
  "A React context menu on Base UI, opened by right-click, long-press or Shift+F10, with an ink keyline marking the object it acts on while it is open.",
  "context-menu",
);

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

export default function ContextMenuPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Context menu" toc={TOC}>
      <h1>Context menu</h1>
      <p className="s-doc-lede">
        A menu opened on an object: right-click, long-press, or Shift+F10 on a focused target. While it is open, an ink
        keyline marks the object it acts on.
      </p>

      <ComponentDemo
        label="Context menu example"
        preview={<ContextMenuClients />}
        code={code("context-menu-clients.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <p>
        A context menu is a shortcut. Put every action somewhere visible too, such as a row&rsquo;s Menu button, so
        people who never right-click can still reach it.
      </p>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Context menu props" props={PROPS} />
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
    </DocPage>
  );
}
