import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { AttachmentUpload } from "@site/components/conversation-previews";

const ITEM = "attachment";

export const metadata = componentMetadata(
  "Attachment",
  "A React file attachment row: glyph or thumbnail, name and size, upload progress along its foot, and a failed state that says why and offers Retry.",
  "attachment",
);

const IMPORT = `import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentGlyph, AttachmentMedia, AttachmentTitle } from "@/components/keyline/ui/attachment"`;

const USAGE = `<Attachment state="uploading" progress={40}>
  <AttachmentMedia><AttachmentGlyph name="file" /></AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>invoice-DM-4107.pdf</AttachmentTitle>
    <AttachmentDescription>212 KB</AttachmentDescription>
  </AttachmentContent>
  <AttachmentActions>
    <AttachmentAction aria-label="Remove invoice-DM-4107.pdf"><AttachmentGlyph name="close" /></AttachmentAction>
  </AttachmentActions>
</Attachment>`;

const PROPS: Prop[] = [
  {
    name: "state",
    type: '"idle" | "uploading" | "processing" | "error" | "done"',
    default: '"done"',
    description: "Where the file stands.",
  },
  {
    name: "progress",
    type: "number",
    default: "\u2014",
    description: "0\u2013100 while uploading; on error, where it stopped.",
  },
  {
    name: "size",
    type: '"default" | "compact" | "tile"',
    default: '"default"',
    description: (
      <>
        <code>compact</code> for a composer, <code>tile</code> for a thumbnail with the name under it.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> inside a Bubble, sharing its keylines.
      </>
    ),
  },
  {
    name: "AttachmentAction",
    type: "button",
    default: "\u2014",
    description: (
      <>
        A cell with a glyph. Needs an <code>aria-label</code> that names the file.
      </>
    ),
  },
  { name: "AttachmentTrigger", type: "button", default: "\u2014", description: "Makes the whole row open the file." },
  {
    name: "AttachmentGlyph",
    type: '{ name: "file" | "image" | "close" | "retry" | "download" }',
    default: "\u2014",
    description: "Keyline&apos;s glyphs for files and their actions.",
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

export default function AttachmentPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Attachment" toc={TOC}>
      <h1>Attachment</h1>
      <p className="s-doc-lede">
        A file as a row: a glyph or thumbnail, the name and size, and its actions as cells. While it uploads, progress
        fills along its foot; if it fails, the row says why and where it stopped, and Retry starts it again. Long names
        keep their extension in view.
      </p>

      <ComponentDemo
        label="Attachment example"
        preview={<AttachmentUpload />}
        code={code("attachment-upload.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Attachment props" props={PROPS} />
      <p className="s-small">
        Attach the dock photo in the example: it fails part way the first time, so you can see the error and Retry.
      </p>
    </DocPage>
  );
}
