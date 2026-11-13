import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { ToastUndo, ToastPromise } from "@site/components/overlay-previews";

const IMPORT = `import { ToastFloating, ToastProvider, useToaster } from "@/components/keyline/ui/toast"`;

const USAGE = `<ToastProvider>
  <App />
  <ToastFloating />
</ToastProvider>

const toast = useToaster()
toast.notify({ title: "DM-4103 archived", action: { label: "Undo", onClick: restore } })`;

const PROPS: Prop[] = [
  {
    name: "notify",
    type: "({ title, description?, type?, action?, timeout? }) => id",
    default: "\u2014",
    description: (
      <>
        From <code>useToaster()</code>. <code>type</code> is done, failed, info, warning or loading.
      </>
    ),
  },
  {
    name: "promise",
    type: "(p, { loading, done, failed }) => p",
    default: "\u2014",
    description:
      "One toast that follows a promise. Each state takes a title, a full toast, or a function of the result.",
  },
  {
    name: "update \u00b7 dismiss",
    type: "(id, \u2026) \u00b7 (id?)",
    default: "\u2014",
    description: "Change a toast in place, or close one or all.",
  },
  {
    name: "timeout \u00b7 limit",
    type: "number",
    default: "6000 \u00b7 3",
    description: (
      <>
        On <code>ToastProvider</code>: how long a toast stays, and how many show at once.
      </>
    ),
  },
  {
    name: "ToastDock",
    type: "Viewport",
    default: "\u2014",
    description: "Shows toasts inside a cell of your layout, such as a table's footer, so they never cover data.",
  },
  {
    name: "placement",
    type: '"dock" | "floating"',
    default: '"dock"',
    description: (
      <>
        On <code>ToastViewport</code>: in flow inside a host cell, or fixed at the bottom inline-end corner in a portal.{" "}
        <code>ToastDock</code> and <code>ToastFloating</code> are the two placements with the manager&apos;s toasts
        already inside.
      </>
    ),
  },
  {
    name: "container \u00b7 portalProps",
    type: "Element | ref \u00b7 Portal props",
    default: "<body>",
    description: (
      <>
        On <code>ToastFloating</code> (or a floating <code>ToastViewport</code>): where the portal renders, and props
        for the portal. It keeps the theme, density, motion and direction of the place it is written either way.
      </>
    ),
  },
  {
    name: "createToaster",
    type: "() => manager",
    default: "\u2014",
    description: "A toaster to call from outside React, such as a data layer.",
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
      { id: "track-a-promise", label: "Track a promise" },
      { id: "props", label: "Props" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "React toast notifications on Base UI: a short record of what just happened, with at most one action such as Undo. Hover or focus fans the stack and pauses it.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A short record of something that just happened, with at most one action. The newest sits in front and counts the
        ones waiting behind; hover or focus fans them out and pauses every timer. The bottom keyline drains as the time
        runs out. Swipe it away, or press its close cell.
      </p>

      <ComponentDemo label="Toast example" preview={<ToastUndo />} code={code("toast-undo.tsx", "example code")} />
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

      <h3 id="track-a-promise">Track a promise</h3>
      <p>
        <code>promise</code> shows one toast while the work runs and turns it into done or failed in place. The first
        send here fails so you can see the retry.
      </p>
      <ComponentDemo
        label="Track a promise example"
        preview={<ToastPromise />}
        code={code("toast-promise.tsx", "track a promise example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        For a condition that is still true, such as low stock, use Notice. F6 moves focus to the toasts (Base UI&apos;s
        hotkey); from there Tab reaches each toast&apos;s action and close cell. Parts, named as Base UI names them:{" "}
        <code>ToastProvider</code>, <code>ToastViewport</code>, <code>ToastRoot</code>, <code>ToastTitle</code>,{" "}
        <code>ToastDescription</code>, <code>ToastAction</code> and <code>ToastClose</code> (its <code>aria-label</code>{" "}
        is required), with Keyline&apos;s <code>ToastDock</code> and <code>ToastFloating</code>, which compose them for
        the manager&apos;s toasts. Every part takes <code>render</code>, and a <code>className</code> or{" "}
        <code>style</code> that may be a function of its state. Each carries a <code>data-slot</code>:{" "}
        <code>toast-viewport</code> (with <code>data-placement</code> and Base UI&apos;s <code>data-expanded</code>),{" "}
        <code>toast-root</code> (with <code>data-kind</code>: done, failed, info, warning or loading;{" "}
        <code>data-kl-front</code> on the newest, <code>data-kl-behind</code> on those waiting;{" "}
        <code>data-placement</code>; and Base UI&apos;s <code>data-expanded</code>, <code>data-limited</code>,{" "}
        <code>data-swiping</code> and <code>data-swipe-direction</code>), <code>toast-title</code>,{" "}
        <code>toast-description</code>, <code>toast-action</code> and <code>toast-close</code>. Built on{" "}
        <a href="https://base-ui.com/react/components/toast">Base UI Toast</a>; its other props pass through.
      </p>
    </>
  ),
};
