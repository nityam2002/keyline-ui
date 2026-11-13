import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { AvatarTeam, AvatarStatus } from "@site/components/data-previews";

const IMPORT = `import { Avatar, AvatarGroup } from "@/components/keyline/ui/avatar"`;

const USAGE = `<AvatarGroup label="On the account" max={4}>
  <Avatar name="Dwight Schrute" />
  <Avatar name="Jim Halpert" src={jim.photo} />
</AvatarGroup>`;

const PARTS = `import { Avatar, AvatarImage, AvatarFallback } from "@/components/keyline/ui/avatar"

<Avatar name="Jim Halpert" status="waiting" size="lg">
  <AvatarImage src={jim.photo} />
  <AvatarFallback />
</Avatar>`;

const PROPS: Prop[] = [
  { name: "name", type: "string", default: "\u2014", description: "Names the avatar and gives the initials." },
  {
    name: "src",
    type: "string",
    default: "\u2014",
    description: "Photo or logo. The initials show until it loads, and if it fails.",
  },
  { name: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "24, 32, 40 or 56px." },
  {
    name: "status",
    type: '"normal" | "waiting" | "attention" | "done" | "none"',
    default: "\u2014",
    description: "Active, away, needs attention, done or offline.",
  },
  { name: "statusLabel", type: "string", default: "by kind", description: "The words for the status." },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description:
      "Control: its own keyline. Cell: a square filling a cell of an enclosing frame, with no edge of its own.",
  },
  {
    name: "decorative",
    type: "boolean",
    default: "false",
    description: "The name is printed beside it: hide the avatar from screen readers.",
  },
  {
    name: "fallback",
    type: "ReactNode",
    default: "initials",
    description: "Something other than the initials, such as an org code.",
  },
  {
    name: "fallbackDelay",
    type: "number",
    default: "0",
    description: "Wait this long before showing the initials, so a fast photo never flashes them.",
  },
  {
    name: "max",
    type: "number",
    default: "\u2014",
    description: (
      <>
        On <code>AvatarGroup</code>: show at most this many cells; the rest become a count.
      </>
    ),
  },
  {
    name: "total",
    type: "number",
    default: "\u2014",
    description: (
      <>
        On <code>AvatarGroup</code>: everyone, when more exist than you pass.
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
      { id: "status", label: "Status and a missing photo" },
      { id: "parts", label: "Parts" },
      { id: "props", label: "Props" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React avatar as a square cell: photo or initials while it loads or fails, an optional status line, and groups that fold the overflow into one count.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A person or organisation as a square cell, never a circle. The photo fills it; while it loads or if it fails,
        the initials hold the cell. A group shares its seams and folds the overflow into one count cell.
      </p>

      <ComponentDemo label="Avatar example" preview={<AvatarTeam />} code={code("avatar-team.tsx", "example code")} />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />
    </>
  ),
  examples: (
    <>
      <h2 id="examples">Examples</h2>

      <h3 id="status">Status and a missing photo</h3>
      <p>
        <code>status</code> turns the avatar&apos;s floor into a line with its own shape for each kind, and joins the
        words to its name. Toby&apos;s photo fails to load, so his initials show.
      </p>
      <ComponentDemo
        label="Status and a missing photo example"
        preview={<AvatarStatus />}
        code={code("avatar-status.tsx", "status and a missing photo example code")}
      />

      <h3 id="parts">Parts</h3>
      <p>
        Given <code>name</code> and <code>src</code>, an avatar renders its image and initials itself. To compose them,
        pass the parts as children, named as Base UI names them: <code>Avatar</code> is Base UI&apos;s{" "}
        <code>Avatar.Root</code>, <code>AvatarImage</code> its <code>Avatar.Image</code>, and{" "}
        <code>AvatarFallback</code> its <code>Avatar.Fallback</code>, showing the initials of the avatar&apos;s name
        unless given children.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        <code>AvatarGroup</code> (a <code>div</code>, <code>role=&quot;group&quot;</code>) joins avatars on shared seams
        at its own <code>size</code>; <code>AvatarGroupCount</code> (a <code>span</code>) is its +N cell. For a count
        that opens the full list, leave out <code>max</code> and put <code>AvatarGroupCount</code> in a popover trigger.
        Every part takes <code>render</code>, and a <code>className</code> or <code>style</code> that may be a function
        of its state. The avatar carries <code>data-slot=&quot;avatar&quot;</code>, <code>data-size</code>,{" "}
        <code>data-kl-layout</code> and <code>data-status</code>; the others <code>data-slot</code>{" "}
        <code>avatar-image</code>, <code>avatar-fallback</code>, <code>avatar-group</code> (with <code>data-size</code>)
        and <code>avatar-group-count</code>. <code>avatarInitials(name)</code> is exported too. Built on{" "}
        <a href="https://base-ui.com/react/components/avatar">Base UI Avatar</a>.
      </p>
    </>
  ),
};
