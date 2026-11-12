import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { DirectionRtl } from "@site/components/layout-previews";

const ITEM = "direction";

export const metadata = componentMetadata(
  "Direction",
  "Set right-to-left or left-to-right for a React subtree in both places Keyline reads it: the DOM's dir and Base UI's direction provider. It renders no box.",
  "direction",
);

const IMPORT = `import { DirectionProvider } from "@/components/keyline/ui/direction"`;

const USAGE = `<DirectionProvider direction="rtl">
  <App />
</DirectionProvider>`;

const PROPS: Prop[] = [
  { name: "direction", type: '"ltr" | "rtl"', default: "\u2014", description: "The direction of everything inside." },
  {
    name: "useDirection",
    type: '() => "ltr" | "rtl"',
    default: "\u2014",
    description: "Reads the direction from Base UI\u2019s provider.",
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

export default function DirectionPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Direction" toc={TOC}>
      <h1>Direction</h1>
      <p className="s-doc-lede">
        Sets the writing direction of a subtree in both places Keyline reads it: the DOM&apos;s <code>dir</code>, for
        layout and mirrored glyphs, and Base UI&apos;s provider, for which side a tooltip or menu opens on and which way
        arrow keys go. It adds no box.
      </p>

      <ComponentDemo
        label="Direction example"
        preview={<DirectionRtl />}
        code={code("direction-rtl.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Direction props" props={PROPS} />
      <p className="s-small">
        Wrap the app once, or only a region whose language differs from the page. Without it, Keyline still follows the
        DOM&apos;s <code>dir</code>; only the side Base UI places a popup on needs the provider.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>DirectionProvider</code> is one part; Keyline renders it. It takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state (<code>direction</code>). It
        carries <code>data-slot=&quot;direction&quot;</code> and the <code>dir</code> it was given.
      </p>
    </DocPage>
  );
}
