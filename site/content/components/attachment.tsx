import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { AttachmentUpload } from "@site/components/conversation-previews";

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
  seo: "A React file attachment row: glyph or thumbnail, name and size, upload progress along its foot, and a failed state that says why and offers Retry.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
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
        Attach the dock photo in the example: it fails part way the first time, so you can see the error and Retry.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>Attachment</code> is the frame; <code>AttachmentMedia</code>, <code>AttachmentContent</code> (with{" "}
        <code>AttachmentTitle</code> and <code>AttachmentDescription</code>) and <code>AttachmentActions</code> are its
        cells, <code>AttachmentAction</code> a key in the action cell, and <code>AttachmentTrigger</code> the overlay
        that opens the file. Each is a part Keyline renders: it takes <code>render</code> (an{" "}
        <code>AttachmentTrigger</code> rendered as a link opens the file by its URL), and a <code>className</code> or{" "}
        <code>style</code> that may be a function of its state.
      </p>
      <p className="s-small">
        Every element carries a <code>data-slot</code> for styling from outside: <code>attachment</code>,{" "}
        <code>attachment-media</code> (with <code>attachment-mark</code>, where the outcome lands),{" "}
        <code>attachment-content</code>, <code>attachment-title</code> (with <code>attachment-title-stem</code> and{" "}
        <code>attachment-title-extension</code>), <code>attachment-description</code>, <code>attachment-actions</code>,{" "}
        <code>attachment-action</code>, <code>attachment-trigger</code> and <code>attachment-bar</code>, the progress
        along the foot. The frame mirrors its state as <code>data-status</code>, <code>data-size</code> and{" "}
        <code>data-kl-layout</code>, and the outcome in its media cell as <code>data-mark</code>.
      </p>
    </>
  ),
};
