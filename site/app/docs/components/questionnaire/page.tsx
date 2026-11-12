import { CodeBlock } from "@site/components/code-block";
import { InstallCommand } from "@site/components/install-command";
import { ComponentDemo } from "@site/components/component-demo";
import { PropsReference, type Prop } from "@site/components/props-reference";
import { DocPage } from "@site/components/doc-page";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { componentMetadata } from "@site/lib/seo";
import { QuestionnaireParty } from "@site/components/conversation-previews";

const ITEM = "questionnaire";

export const metadata = componentMetadata(
  "Questionnaire",
  "A React step-by-step form, one question at a time: progress, Skip for optional steps, answers kept when you go back, and letter keys to pick a choice.",
  "questionnaire",
);

const IMPORT = `import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
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
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
];

export default function QuestionnairePage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />;

  return (
    <DocPage name="Questionnaire" toc={TOC}>
      <h1>Questionnaire</h1>
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

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="props">Props</h2>
      <PropsReference label="Questionnaire props" props={PROPS} />
      <p className="s-small">
        Built on <a href="https://github.com/shadcn-ui/ui">@shadcn/react</a>&apos;s Questionnaire, drawn with
        Keyline&apos;s radio rows, checkboxes, field frame, Progress and Button cells.
      </p>
    </DocPage>
  );
}
