import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import { MenuOrderActions, MenuNotifications } from "@site/components/action-previews";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";

const IMPORT = `import { Button } from "@/components/keyline/ui/button"
import { Menu, MenuPopup, MenuItem, MenuTrigger } from "@/components/keyline/ui/menu"`;

const USAGE = `<Menu>
  <MenuTrigger render={<Button />}>Actions</MenuTrigger>
  <MenuPopup>
    <MenuItem onClick={duplicate}>Duplicate order</MenuItem>
    <MenuItem variant="destructive" onClick={cancel}>Cancel order</MenuItem>
  </MenuPopup>
</Menu>`;

const PROPS: Prop[] = [
  {
    name: "align",
    type: '"start" | "end"',
    default: '"start"',
    description: (
      <>
        On <code>MenuPopup</code>: which edge of the trigger the menu lines up with.
      </>
    ),
  },
  {
    name: "side",
    type: '"bottom" | "top"',
    default: '"bottom"',
    description: (
      <>
        On <code>MenuPopup</code>: the trigger edge it docks to.
      </>
    ),
  },
  {
    name: "attachWeight",
    type: "1 | 2 | 3",
    default: "2",
    description: (
      <>
        On <code>MenuPopup</code>: the weight of the edge it shares. Use 1 when the trigger is a cell.
      </>
    ),
  },
  {
    name: "anchor",
    type: "Element | Ref",
    default: "the trigger",
    description: (
      <>
        On <code>MenuPopup</code>: dock to another element, such as the frame around the trigger.
      </>
    ),
  },
  {
    name: "container",
    type: "Element | Ref",
    default: "<body>",
    description: (
      <>
        On <code>MenuPopup</code>: where the menu&apos;s portal renders. It keeps the theme, density and direction of
        the place it is written either way. <code>portalProps</code> passes props to the portal.
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

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React dropdown menu that docks to its trigger's edge, with submenus and checkbox and radio rows. On Base UI.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A list of commands that docks to its trigger: its top edge lies on the trigger&rsquo;s keyline and it unfolds
        from there. Rows can open submenus or hold checkbox and radio choices.
      </p>

      <ComponentDemo
        label="Menu example"
        preview={<MenuOrderActions />}
        code={code("menu-order-actions.tsx", "example code")}
      />
    </>
  ),
  usage: (
    <>
      <p>
        <code>MenuTrigger</code> renders whatever you pass to <code>render</code>; a Keyline <code>Button</code> is the
        usual choice.
      </p>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: (
    <>
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
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Parts: <code>Menu</code>, <code>MenuTrigger</code>, <code>MenuPopup</code>, <code>MenuItem</code>,{" "}
        <code>MenuCheckboxItem</code>, <code>MenuRadioGroup</code>, <code>MenuRadioItem</code>,{" "}
        <code>MenuSeparator</code>, <code>MenuGroup</code>, <code>MenuGroupLabel</code>, <code>MenuSubmenuRoot</code>,{" "}
        <code>MenuSubmenuTrigger</code>, and <code>MenuSurface</code> (the styled popup without a portal, for a menu you
        position yourself). <code>MenuPopup</code> also takes the positioner&apos;s <code>sideOffset</code>,{" "}
        <code>alignOffset</code> and <code>collisionPadding</code>. Every part takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state. Built on{" "}
        <a href="https://base-ui.com/react/components/menu">Base UI Menu</a>.
      </p>
    </>
  ),
};
