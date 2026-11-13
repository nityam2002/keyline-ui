import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { DirectionRtl } from "@site/components/layout-previews";

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

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "Set right-to-left or left-to-right for a React subtree in both places Keyline reads it: the DOM's dir and Base UI's direction provider. It renders no box.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
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
        Wrap the app once, or only a region whose language differs from the page. Without it, Keyline still follows the
        DOM&apos;s <code>dir</code>; only the side Base UI places a popup on needs the provider.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>DirectionProvider</code> is one part; Keyline renders it. It takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state (<code>direction</code>). It
        carries <code>data-slot=&quot;direction&quot;</code> and the <code>dir</code> it was given.
      </p>
    </>
  ),
};
