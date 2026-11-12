import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { DialogNewClient } from "@site/components/overlay-previews";

const ITEM = "dialog";

export const metadata = componentMetadata(
  "Dialog",
  "A React modal dialog on Base UI: one frame over a dimmed page, a body that scrolls when long, actions on the bottom edge, and focus that returns to the trigger.",
  "dialog",
);

const IMPORT = `import { Dialog, DialogBody, DialogClose, DialogPopup, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/keyline/ui/dialog"`;

const USAGE = `<Dialog>
  <DialogTrigger render={<Button />}>Add a client</DialogTrigger>
  <DialogPopup>
    <DialogHeader>
      <DialogTitle>Add a client</DialogTitle>
      <DialogDescription>…</DialogDescription>
    </DialogHeader>
    <DialogBody>…</DialogBody>
    <DialogFooter>
      <DialogClose render={<Button layout="cell" />}>Cancel</DialogClose>
      <Button layout="cell" variant="primary" type="submit" form="new-client">Add client</Button>
    </DialogFooter>
  </DialogPopup>
</Dialog>`;

const PROPS: Prop[] = [
  {
    name: "open \u00b7 defaultOpen",
    type: "boolean",
    default: "\u2014",
    description: (
      <>
        On <code>Dialog</code>: control it with <code>onOpenChange</code>, for example to close after a form submits.
      </>
    ),
  },
  {
    name: "render",
    type: "ReactElement",
    default: "\u2014",
    description: (
      <>
        On <code>DialogTrigger</code> and <code>DialogClose</code>: the element to render, usually a Button.
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>DialogPopup</code>: where the dialog&apos;s portal renders, and props for the portal. It keeps the
        theme, density, motion and direction of the place it is written either way.
      </>
    ),
  },
  {
    name: "DialogBody",
    type: "div",
    default: "\u2014",
    description: (
      <>
        Scrolls in a Keyline Scroll Area once the dialog reaches its maximum height; the header and footer stay put.{" "}
        <code>className</code> reaches the scroll area, <code>contentClassName</code> lays out what it holds (a grid,
        16px apart).
      </>
    ),
  },
  {
    name: "DialogFooter",
    type: "div",
    default: "\u2014",
    description: (
      <>
        A row of cells. Use <code>Button layout=&quot;cell&quot;</code>; a submit button can name a form in the body
        with <code>form</code>.
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

export default function DialogPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Dialog" toc={TOC}>
      <h1>Dialog</h1>
      <p className="s-doc-lede">
        A task the page waits for. The dialog is one frame over a dimmed page: a header, a body that scrolls when it
        runs long, and its actions as cells sharing the bottom keyline. Focus moves in, stays in, and returns to the
        trigger; Escape and the close cell put it away.
      </p>

      <ComponentDemo
        label="Dialog example"
        preview={<DialogNewClient />}
        code={code("dialog-new-client.tsx", "example code")}
      />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Dialog props" props={PROPS} />
      <p className="s-small">
        Parts, named as Base UI names them: <code>Dialog</code> (also <code>DialogRoot</code>),{" "}
        <code>DialogTrigger</code>, <code>DialogPopup</code> (Base UI&apos;s Portal, Backdrop and Popup in one part),{" "}
        <code>DialogBackdrop</code> (the scrim, for composing your own), <code>DialogTitle</code>,{" "}
        <code>DialogDescription</code> and <code>DialogClose</code>, with Keyline&apos;s <code>DialogHeader</code>,{" "}
        <code>DialogBody</code> and <code>DialogFooter</code>. Every part takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state. They carry{" "}
        <code>data-slot</code> <code>dialog-trigger</code>, <code>dialog-backdrop</code>, <code>dialog-popup</code>,{" "}
        <code>dialog-header</code>, <code>dialog-title</code>, <code>dialog-description</code>, <code>dialog-body</code>
        , <code>dialog-footer</code> and <code>dialog-close</code>, and Base UI&apos;s <code>data-open</code>,{" "}
        <code>data-starting-style</code> and <code>data-ending-style</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/dialog">Base UI Dialog</a>; its other props pass through. To
        confirm something that can&apos;t be undone, use Alert dialog.
      </p>
    </DocPage>
  );
}
