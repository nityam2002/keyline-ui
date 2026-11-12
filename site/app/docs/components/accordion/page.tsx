import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { AccordionPolicies } from "@site/components/layout-previews";

const ITEM = "accordion";

export const metadata = componentMetadata(
  "Accordion",
  "A React accordion on Base UI: stacked sections in one frame, real heading triggers, Tab between headers, and find-in-page that opens the matching panel.",
  "accordion",
);

const IMPORT = `import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/keyline/ui/accordion"`;

const USAGE = `<Accordion multiple defaultValue={["returns"]}>
  <AccordionItem value="returns">
    <AccordionTrigger meta="30 days">Returns</AccordionTrigger>
    <AccordionPanel>…</AccordionPanel>
  </AccordionItem>
</Accordion>`;

const PROPS: Prop[] = [
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>Accordion</code>: let several panels stay open.
      </>
    ),
  },
  {
    name: "value \u00b7 defaultValue",
    type: "string[]",
    default: "\u2014",
    description: (
      <>
        The open items, controlled with <code>onValueChange</code>.
      </>
    ),
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> puts the rows straight into an enclosing frame.
      </>
    ),
  },
  {
    name: "meta \u00b7 description",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>AccordionTrigger</code>: text before the caret, and a line under the title.
      </>
    ),
  },
  {
    name: "level",
    type: "2 \u2013 6",
    default: "3",
    description: (
      <>
        On <code>AccordionTrigger</code>: the header&apos;s heading level.
      </>
    ),
  },
  {
    name: "flush",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>AccordionPanel</code>: no inset, for content with its own cells.
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
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function AccordionPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Accordion" toc={TOC}>
      <h1>Accordion</h1>
      <p className="s-doc-lede">
        Stacked sections in one frame. A panel unfolds from its header&apos;s bottom keyline while the header stays
        still, and the caret turns. Headers are headings, Tab moves between them, and find-in-page opens a closed panel
        that holds the match.
      </p>

      <ComponentDemo
        label="Accordion example"
        preview={<AccordionPolicies />}
        code={code("accordion-policies.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Accordion props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://base-ui.com/react/components/accordion">Base UI Accordion</a>. For one disclosure on
        its own, use Collapsible.
      </p>
    </DocPage>
  );
}
