import type { ComponentContent } from "@site/content/types";
import Link from "next/link";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { AppShellOffice } from "@site/components/layout-previews";

const IMPORT = `import { AppShell } from "@/components/keyline/ui/app-shell"`;

const USAGE = `<AppShell
  navLabel="Scranton branch"
  nav={<Nav layout="cell" label="Scranton branch" items={…} />}
  header={<Breadcrumb layout="cell" items={…} />}
  actions={<Button layout="cell" variant="primary">New order</Button>}
  aside={<Inspector>…</Inspector>}
  asideOpen={!!order}
  onAsideOpenChange={…}
>
  …the page
</AppShell>`;

const PARTS = `<AppShellRoot navLabel="Scranton branch" asideOpen={!!order} onAsideOpenChange={…}>
  <AppShellHeader>
    <AppShellToggle />
    <AppShellCrumbs>
      <Breadcrumb layout="cell" items={…} />
    </AppShellCrumbs>
    <AppShellActions>
      <Button layout="cell" variant="primary">New order</Button>
    </AppShellActions>
  </AppShellHeader>
  <AppShellNav>
    <Nav layout="cell" label="Scranton branch" items={…} />
  </AppShellNav>
  <AppShellMain>…the page</AppShellMain>
  <AppShellAside label="Order">
    <Inspector>…</Inspector>
  </AppShellAside>
</AppShellRoot>`;

const PROPS: Prop[] = [
  {
    name: "nav",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        The sidebar, usually <code>Nav layout=&quot;cell&quot;</code>.
      </>
    ),
  },
  {
    name: "navLabel",
    type: "string",
    default: "\u2014",
    description: "Names the sidebar: the toggle says &ldquo;Show&rdquo; it, and its narrow sheet takes the name.",
  },
  {
    name: "navOpen \u00b7 defaultNavOpen \u00b7 onNavOpenChange",
    type: "boolean",
    default: "true",
    description: "Whether the sidebar column shows on a wide layout.",
  },
  {
    name: "collapse",
    type: '"hide" | "rail"',
    default: '"hide"',
    description: (
      <>
        What closing the sidebar does. <code>rail</code> keeps a column of icons. See Sidebar.
      </>
    ),
  },
  {
    name: "header \u00b7 actions",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        The header after the toggle (usually a Breadcrumb) and the cells at its end (a Button, or a Toolbar with{" "}
        <code>overflow=&quot;menu&quot;</code>).
      </>
    ),
  },
  {
    name: "aside \u00b7 asideOpen \u00b7 onAsideOpenChange",
    type: "ReactNode \u00b7 boolean",
    default: "\u2014",
    description: "A panel at the end, such as an Inspector, shown while open.",
  },
  {
    name: "asideFinalFocus",
    type: "ref",
    default: "\u2014",
    description: "Where focus goes when the aside&apos;s sheet closes. Pass the control that opened it.",
  },
  {
    name: "narrowAt \u00b7 asideInlineAt",
    type: "number",
    default: "960 \u00b7 narrowAt + 440",
    description: "Shell widths where the sidebar and the aside turn into sheets.",
  },
  {
    name: "navSize \u00b7 asideSize",
    type: "number | string",
    default: "15rem \u00b7 22rem",
    description: "Column widths on a wide layout.",
  },
  {
    name: "stickyHeader",
    type: "boolean",
    default: "false",
    description: "Keeps the header in view; the columns stay put while the page scrolls past.",
  },
  { name: "mainProps", type: "props of <main>", default: "\u2014", description: "For the page&apos;s main element." },
];

const TOC: TocGroup[] = [
  {
    label: "Setup",
    items: [
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "props", label: "Props" },
      { id: "parts", label: "Parts" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React app shell: header, sidebar, page and aside laid out by the shell's own width, so it works in a pane too. When narrow, aside and sidebar become sheets.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        The page around an app&apos;s screens: a header frame, the <Link href="/docs/components/sidebar">sidebar</Link>,
        the page and an optional aside, one gutter apart. It lays itself out by its own width, not the window&apos;s, so
        it works in a pane too. Wide, everything sits side by side. Narrower, the aside opens as a sheet. Narrowest, the
        sidebar does too.
      </p>

      <ComponentDemo
        label="App shell example"
        preview={<AppShellOffice />}
        code={code("app-shell-office.tsx", "example code")}
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
        The example sets <code>narrowAt</code> low so the sidebar stays in a preview this size. Choose an order to open
        the aside: on this page&apos;s width it opens as a sheet. This site&apos;s docs pages are a Keyline AppShell.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>AppShell</code> is built from parts you can compose yourself: <code>AppShellRoot</code> (the grid, its
        width and the sidebar&apos;s state; it takes the props above but the slot ones), <code>AppShellHeader</code>{" "}
        holding <code>AppShellToggle</code>, <code>AppShellCrumbs</code> and <code>AppShellActions</code>, then{" "}
        <code>AppShellNav</code>, <code>AppShellMain</code> and <code>AppShellAside</code> (<code>label</code> and{" "}
        <code>finalFocus</code> for its sheet). Keyline renders each one; every part takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state (<code>layout</code> on the
        root, <code>expanded</code> on the toggle, <code>rail</code> on the sidebar). On the sidebar and the aside they
        reach the column; on a narrow shell those parts are sheets.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>app-shell</code>, <code>app-shell-header</code>
        , <code>app-shell-toggle</code>, <code>app-shell-crumbs</code>, <code>app-shell-actions</code>,{" "}
        <code>app-shell-nav</code>, <code>app-shell-main</code>, <code>app-shell-aside</code>); the root carries its
        layout as <code>data-kl-shell</code> (<code>wide</code>, <code>medium</code>, <code>narrow</code>) and{" "}
        <code>data-kl-nav</code> (<code>open</code>, <code>rail</code>, <code>closed</code>), and the sheets carry{" "}
        <code>data-kl-shell-sheet</code> (<code>nav</code> or <code>aside</code>). <code>onAsideOpenChange</code>{" "}
        receives Base UI&apos;s <code>eventDetails</code> as its second argument.
      </p>
    </>
  ),
};
