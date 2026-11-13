import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { AccordionPolicies } from "@site/components/layout-previews";

const IMPORT = `import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/keyline/ui/accordion"`;

const USAGE = `<Accordion multiple defaultValue={["returns"]}>
  <AccordionItem value="returns">
    <AccordionTrigger meta="30 days">Returns</AccordionTrigger>
    <AccordionPanel>…</AccordionPanel>
  </AccordionItem>
</Accordion>`;

const PARTS = `<AccordionRoot>
  <AccordionItem value="returns">
    <AccordionHeader level={2}>
      <AccordionTrigger meta="30 days">Returns</AccordionTrigger>
    </AccordionHeader>
    <AccordionPanel contentClassName="grid gap-4">…</AccordionPanel>
  </AccordionItem>
</AccordionRoot>`;

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
  {
    name: "contentClassName",
    type: "string",
    default: "\u2014",
    description: (
      <>
        On <code>AccordionPanel</code>: classes for the content inside the panel&apos;s clip, such as its layout (
        <code>grid gap-4</code>). <code>className</code> goes to the panel itself.
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
  seo: "A React accordion on Base UI: stacked sections in one frame, real heading triggers, Tab between headers, and find-in-page that opens the matching panel.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
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
        Built on <a href="https://base-ui.com/react/components/accordion">Base UI Accordion</a>. For one disclosure on
        its own, use Collapsible.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as Base UI names them: <code>AccordionRoot</code> (also exported as <code>Accordion</code>),{" "}
        <code>AccordionItem</code>, <code>AccordionHeader</code>, <code>AccordionTrigger</code> and{" "}
        <code>AccordionPanel</code>. A trigger brings its own header at <code>level</code>; compose an{" "}
        <code>AccordionHeader</code> around it to set the heading yourself. Every part takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>accordion</code>, <code>accordion-item</code>,{" "}
        <code>accordion-header</code>, <code>accordion-trigger</code>, <code>accordion-panel</code>; inside them,{" "}
        <code>accordion-title</code>, <code>accordion-description</code>, <code>accordion-meta</code>,{" "}
        <code>accordion-caret</code> and <code>accordion-content</code>), and Base UI&apos;s state attributes:{" "}
        <code>data-open</code> on the item and panel, <code>data-panel-open</code> on the trigger,{" "}
        <code>data-disabled</code>, <code>data-index</code>, and <code>data-starting-style</code> and{" "}
        <code>data-ending-style</code> while a panel unfolds or folds.
      </p>
    </>
  ),
};
