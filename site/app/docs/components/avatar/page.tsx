import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { AvatarTeam, AvatarStatus } from "@site/components/data-previews";

const ITEM = "avatar";

export const metadata = componentMetadata(
  "Avatar",
  "A React avatar as a square cell: photo or initials while it loads or fails, an optional status line, and groups that fold the overflow into one count.",
  "avatar",
);

const IMPORT = `import { Avatar, AvatarGroup } from "@/components/keyline/ui/avatar"`;

const USAGE = `<AvatarGroup label="On the account" max={4}>
  <Avatar name="Dwight Schrute" />
  <Avatar name="Jim Halpert" src={jim.photo} />
</AvatarGroup>`;

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
      { id: "props", label: "Props" },
    ],
  },
];

export default function AvatarPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Avatar" toc={TOC}>
      <h1>Avatar</h1>
      <p className="s-doc-lede">
        A person or organisation as a square cell, never a circle. The photo fills it; while it loads or if it fails,
        the initials hold the cell. A group shares its seams and folds the overflow into one count cell.
      </p>

      <ComponentDemo label="Avatar example" preview={<AvatarTeam />} code={code("avatar-team.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

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

      <h2 id="props">Props</h2>
      <PropsReference label="Avatar props" props={PROPS} />
      <p className="s-small">
        For a count that opens the full list, leave out <code>max</code> and put <code>AvatarGroupCount</code> in a
        popover trigger. <code>avatarInitials(name)</code> is exported too. Built on{" "}
        <a href="https://base-ui.com/react/components/avatar">Base UI Avatar</a>.
      </p>
    </DocPage>
  );
}
