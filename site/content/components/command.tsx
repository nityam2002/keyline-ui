import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { CommandOffice } from "@site/components/nav-previews";

const IMPORT = `import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/keyline/ui/command"`;

const USAGE = `<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Type a command or a client…" value={q} onValueChange={setQ} />
  <CommandList>
    <CommandEmpty query={q}>Try “order” or a client.</CommandEmpty>
    <CommandGroup heading="Actions">
      <CommandItem value="new order" shortcut="N" onSelect={newOrder}>New order</CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`;

const PARTS = `<Command label="Commands" loop>
  <CommandInput placeholder="Type a command…" />
  <CommandList>
    <CommandEmpty query={q} />
    <CommandGroup heading="Actions" code="A">
      <CommandItem shortcut="N" onSelect={newOrder}>New order</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Views">
      <CommandItem meta="12" onSelect={showOverdue}>Show overdue</CommandItem>
    </CommandGroup>
  </CommandList>
  <CommandFooter>
    <span><Kbd>↵</Kbd> run</span>
  </CommandFooter>
</Command>`;

const PROPS: Prop[] = [
  {
    name: "open \u00b7 onOpenChange",
    type: "boolean \u00b7 (open, eventDetails) => void",
    default: "\u2014",
    description: (
      <>
        On <code>CommandDialog</code>. Bind your own shortcut to open it. <code>onOpenChange</code> also gets Base
        UI&apos;s event details (the reason, such as <code>escape-key</code>, and the event).
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>CommandDialog</code>: where the dialog&apos;s portal renders, and props for Base UI&apos;s portal.
      </>
    ),
  },
  {
    name: "className",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>CommandDialog</code>: classes for the dialog&apos;s frame (Dialog&apos;s <code>DialogPopup</code>).
      </>
    ),
  },
  {
    name: "label",
    type: "string",
    default: '"Command menu"',
    description: (
      <>
        On <code>CommandDialog</code>: names the dialog.
      </>
    ),
  },
  {
    name: "finalFocus",
    type: "false | element",
    default: "the opener",
    description: (
      <>
        On <code>CommandDialog</code>: return false when a command moves focus elsewhere, such as into another dialog.
      </>
    ),
  },
  {
    name: "value",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>CommandItem</code>: the words it matches, which can include more than its label.
      </>
    ),
  },
  {
    name: "onSelect",
    type: "() => void",
    default: "\u2014",
    description: (
      <>
        On <code>CommandItem</code>: runs it. Close the dialog here.
      </>
    ),
  },
  {
    name: "meta \u00b7 shortcut",
    type: "ReactNode \u00b7 string",
    default: "\u2014",
    description: (
      <>
        On <code>CommandItem</code>: a note at the row&apos;s end, and its key.
      </>
    ),
  },
  {
    name: "query",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>CommandEmpty</code>: quoted in the no-match line.
      </>
    ),
  },
  {
    name: "heading",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>CommandGroup</code>.
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
  seo: "A React command menu (⌘K palette) on cmdk: type to filter, results numbered so ⌥ and a digit runs one, and the chosen row floods as it runs.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        Commands by name. Typing filters the list, and results are numbered in the order they show, so ⌥ and a number
        runs one without moving to it. The chosen row floods as it runs. You open it; the dialog doesn&apos;t bind ⌘K
        for you.
      </p>

      <ComponentDemo
        label="Command menu example"
        preview={<CommandOffice />}
        code={code("command-office.tsx", "example code")}
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
        Filtering and keyboard are <a href="https://cmdk.paco.me">cmdk</a>&apos;s; the dialog is Base UI&apos;s.{" "}
        <code>CommandFooter</code> holds key hints.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as cmdk names them: <code>Command</code> (the menu, with the ⌥-digit keys),{" "}
        <code>CommandInput</code>, <code>CommandList</code>, <code>CommandEmpty</code>, <code>CommandGroup</code> (with
        an optional <code>code</code>), <code>CommandSeparator</code> and <code>CommandItem</code>, with Keyline&apos;s{" "}
        <code>CommandFooter</code>. <code>CommandDialog</code> is <code>Command</code> in Dialog&apos;s{" "}
        <code>DialogPopup</code>; compose <code>Command</code> yourself to put the menu in a popover or on a page.
        cmdk&apos;s parts take its own props and a string <code>className</code>; <code>CommandFooter</code> also takes{" "}
        <code>render</code> and a function <code>className</code> or <code>style</code>.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>command</code>, <code>command-input</code>,{" "}
        <code>command-list</code>, <code>command-item</code>, <code>command-item-index</code> for the digit cell,{" "}
        <code>command-footer</code>, …). The row under the cursor has cmdk&apos;s{" "}
        <code>data-selected=&quot;true&quot;</code>, a disabled row <code>data-disabled=&quot;true&quot;</code>, and a
        row that is running <code>data-kl-on</code> while it floods.
      </p>
    </>
  ),
};
