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
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/keyline/ui/context-menu"`;

const USAGE = `<ContextMenu>
  <ContextMenuTrigger tabIndex={0} aria-label="Lackawanna County">
    Lackawanna County
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onClick={call}>Call</ContextMenuItem>
  </ContextMenuContent>
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
    name: "container",
    type: "Element",
    default: "body",
    description: (
      <>
        On <code>ContextMenuContent</code>: where the menu is portalled.
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
        The rows are Menu&rsquo;s, re-exported as <code>ContextMenuItem</code>, <code>ContextMenuSeparator</code>,{" "}
        <code>ContextMenuSubmenu</code> and the rest. Built on{" "}
        <a href="https://base-ui.com/react/components/context-menu">Base UI Context Menu</a>.
      </p>
    </DocPage>
  );
}
