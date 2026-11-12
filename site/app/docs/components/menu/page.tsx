import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { MenuOrderActions, MenuNotifications } from "@site/components/action-previews";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";

const ITEM = "menu";

export const metadata = componentMetadata(
  "Menu",
  "A React dropdown menu that docks to its trigger's edge, with submenus and checkbox and radio rows. On Base UI.",
  "menu",
);

const IMPORT = `import { Button } from "@/components/keyline/ui/button"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/keyline/ui/menu"`;

const USAGE = `<Menu>
  <MenuTrigger render={<Button />}>Actions</MenuTrigger>
  <MenuContent>
    <MenuItem onClick={duplicate}>Duplicate order</MenuItem>
    <MenuItem variant="destructive" onClick={cancel}>Cancel order</MenuItem>
  </MenuContent>
</Menu>`;

const PROPS: Prop[] = [
  {
    name: "align",
    type: '"start" | "end"',
    default: '"start"',
    description: (
      <>
        On <code>MenuContent</code>: which edge of the trigger the menu lines up with.
      </>
    ),
  },
  {
    name: "side",
    type: '"bottom" | "top"',
    default: '"bottom"',
    description: (
      <>
        On <code>MenuContent</code>: the trigger edge it docks to.
      </>
    ),
  },
  {
    name: "attachWeight",
    type: "1 | 2 | 3",
    default: "2",
    description: (
      <>
        On <code>MenuContent</code>: the weight of the edge it shares. Use 1 when the trigger is a cell.
      </>
    ),
  },
  {
    name: "anchor",
    type: "Element | Ref",
    default: "the trigger",
    description: (
      <>
        On <code>MenuContent</code>: dock to another element, such as the frame around the trigger.
      </>
    ),
  },
  {
    name: "variant",
    type: '"default" | "destructive"',
    default: '"default"',
    description: (
      <>
        On <code>MenuItem</code>: destructive sets the row in red.
      </>
    ),
  },
  { name: "description", type: "ReactNode", default: "—", description: "On items: a second line under the label." },
  {
    name: "shortcut",
    type: "ReactNode",
    default: "—",
    description: "On items: a key shown at the row’s end. Showing it does not bind it.",
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
  { label: "Examples", items: [{ id: "checkbox-and-radio", label: "Checkbox and radio" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function MenuPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Menu" toc={TOC}>
      <h1>Menu</h1>
      <p className="s-doc-lede">
        A list of commands that docks to its trigger: its top edge lies on the trigger&rsquo;s keyline and it unfolds
        from there. Rows can open submenus or hold checkbox and radio choices.
      </p>

      <ComponentDemo
        label="Menu example"
        preview={<MenuOrderActions />}
        code={code("menu-order-actions.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <p>
        <code>MenuTrigger</code> renders whatever you pass to <code>render</code>; a Keyline <code>Button</code> is the
        usual choice.
      </p>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="checkbox-and-radio">Checkbox and radio</h3>
      <p>
        <code>MenuCheckboxItem</code> takes a tick, <code>MenuRadioItem</code> a filled square, so the kind reads
        without colour. Choosing one keeps the menu open.
      </p>
      <ComponentDemo
        label="Checkbox and radio example"
        preview={<MenuNotifications />}
        code={code("menu-notifications.tsx", "checkbox and radio example code")}
      />

      <h2 id="props">Props</h2>
      <PropsReference label="Menu props" props={PROPS} />
      <p className="s-small">
        Parts: <code>Menu</code>, <code>MenuTrigger</code>, <code>MenuContent</code>, <code>MenuItem</code>,{" "}
        <code>MenuCheckboxItem</code>, <code>MenuRadioGroup</code>, <code>MenuRadioItem</code>,{" "}
        <code>MenuSeparator</code>, <code>MenuGroup</code>, <code>MenuGroupLabel</code>, <code>MenuSubmenu</code>,{" "}
        <code>MenuSubmenuTrigger</code>, <code>MenuSubmenuContent</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/menu">Base UI Menu</a>.
      </p>
    </DocPage>
  );
}
