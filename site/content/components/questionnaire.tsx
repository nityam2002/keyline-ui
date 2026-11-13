import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { QuestionnaireParty } from "@site/components/conversation-previews";

const IMPORT = `import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/keyline/ui/questionnaire"`;

const USAGE = `<Questionnaire items={STEPS} shortcuts="letters" onSubmit={submit} aria-label="Meredith's birthday">
  <QuestionnaireProgress />
  <QuestionnaireItem name="cake" required>
    <QuestionnaireTitle>Which cake?</QuestionnaireTitle>
    <QuestionnaireChoices>
      <QuestionnaireChoice value="chocolate">Chocolate</QuestionnaireChoice>
    </QuestionnaireChoices>
    <QuestionnaireError>Choose a cake to continue.</QuestionnaireError>
  </QuestionnaireItem>
  <QuestionnaireActions>
    <QuestionnairePrevious />
    <QuestionnaireSkip />
    <QuestionnaireNext />
    <QuestionnaireSubmit>Send answers</QuestionnaireSubmit>
  </QuestionnaireActions>
</Questionnaire>`;

const PARTS = `<Questionnaire items={STEPS} onSubmit={submit} aria-label="Meredith's birthday">
  <QuestionnaireProgress />
  <QuestionnaireItem name="guests">
    <QuestionnaireTitle>Who's bringing a dish?</QuestionnaireTitle>
    <QuestionnaireDescription>Skip if nobody has said yet.</QuestionnaireDescription>
    <QuestionnaireChoices>
      <QuestionnaireChoice value="kevin" description="Chili">Kevin</QuestionnaireChoice>
    </QuestionnaireChoices>
  </QuestionnaireItem>
  <QuestionnaireItem name="email" required>
    <QuestionnaireTitle>Where should Angela reply?</QuestionnaireTitle>
    <QuestionnaireInput type="email" />
    <QuestionnaireError>Enter an email address to continue.</QuestionnaireError>
  </QuestionnaireItem>
  <QuestionnaireActions>
    <QuestionnairePrevious />
    <QuestionnaireSkip />
    <QuestionnaireNext />
    <QuestionnaireSubmit />
  </QuestionnaireActions>
</Questionnaire>`;

const PROPS: Prop[] = [
  {
    name: "items",
    type: "{ name, required?, choices? }[]",
    default: "\u2014",
    description: (
      <>
        On <code>Questionnaire</code>: the steps in order. It drives progress, navigation and validation.
      </>
    ),
  },
  {
    name: "onSubmit",
    type: "(event) => void",
    default: "\u2014",
    description: "Read the answers from the form&apos;s FormData.",
  },
  { name: "shortcuts", type: '"letters" | "numbers"', default: "\u2014", description: "Keys that pick a choice." },
  { name: "item \u00b7 onItemChange", type: "string", default: "\u2014", description: "Control which step shows." },
  {
    name: "required \u00b7 multiple \u00b7 invalid",
    type: "boolean",
    default: "false",
    description: (
      <>
        On <code>QuestionnaireItem</code>: blocks Next; takes several choices; marks the answer wrong.
      </>
    ),
  },
  {
    name: "level \u00b7 optionalText",
    type: "2 \u2013 6 \u00b7 ReactNode",
    default: '2 \u00b7 "Optional"',
    description: (
      <>
        On <code>QuestionnaireTitle</code>.
      </>
    ),
  },
  {
    name: "description",
    type: "ReactNode",
    default: "\u2014",
    description: (
      <>
        On <code>QuestionnaireChoice</code>: a line under the choice.
      </>
    ),
  },
  {
    name: "signal",
    type: '"idle" | "pending" | "failed"',
    default: '"idle"',
    description: (
      <>
        On <code>QuestionnaireSubmit</code>: shows that a send is under way, or failed.
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
      { id: "parts", label: "Parts" },
      { id: "props", label: "Props" },
    ],
  },
];

const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

/** The prose the generated page (site/app/docs/components/[name]/page.tsx) cannot derive from the item. */
export const content: ComponentContent = {
  seo: "A React step-by-step form, one question at a time: progress, Skip for optional steps, answers kept when you go back, and letter keys to pick a choice.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A form asked one question at a time, in one frame. Progress counts the steps behind you, a required question
        blocks Next until it&apos;s answered, and an optional one offers Skip. Going back keeps your answers. Each new
        step moves focus to its question, and letter keys pick a choice.
      </p>

      <ComponentDemo
        label="Questionnaire example"
        preview={<QuestionnaireParty />}
        code={code("questionnaire-party.tsx", "example code")}
      />
    </>
  ),
  usage: (
    <>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h3 id="parts">Parts</h3>
      <p>
        The parts are named as @shadcn/react names them: <code>Questionnaire</code> (the form),{" "}
        <code>QuestionnaireProgress</code>, <code>QuestionnaireItem</code> (one step, a fieldset),{" "}
        <code>QuestionnaireTitle</code>, <code>QuestionnaireDescription</code>, <code>QuestionnaireChoices</code>,{" "}
        <code>QuestionnaireChoice</code>, <code>QuestionnaireInput</code>, <code>QuestionnaireError</code> and the
        buttons <code>QuestionnairePrevious</code> (Back), <code>QuestionnaireSkip</code>,{" "}
        <code>QuestionnaireNext</code> and <code>QuestionnaireSubmit</code>. Keyline adds{" "}
        <code>QuestionnaireActions</code>, the row that holds the buttons. The library&apos;s parts take its own props
        and a string <code>className</code>; <code>QuestionnaireActions</code> also takes <code>render</code> and a
        function <code>className</code> or <code>style</code>.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
    </>
  ),
  examples: null,
  reference: (
    <>
      <p className="s-small">
        Built on <a href="https://github.com/shadcn-ui/ui">@shadcn/react</a>&apos;s Questionnaire, drawn with
        Keyline&apos;s radio rows, checkboxes, field frame, Progress and Button cells. Each part carries a{" "}
        <code>data-slot</code> named after it (<code>questionnaire</code>, <code>questionnaire-progress</code> with its
        count in <code>questionnaire-count</code>, <code>questionnaire-item</code>, <code>questionnaire-heading</code>,{" "}
        <code>questionnaire-choices</code>, <code>questionnaire-choice</code> with its native input in{" "}
        <code>questionnaire-choice-input</code>, <code>questionnaire-field</code>, <code>questionnaire-error</code>,{" "}
        <code>questionnaire-actions</code>, …). A step that fails validation has <code>data-invalid</code>.
      </p>
    </>
  ),
};
