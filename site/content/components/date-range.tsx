import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { DateRangeVacation } from "@site/components/input-previews";

const IMPORT = `import { DateRangePicker, type DateRange } from "@/components/keyline/ui/date-range"`;

const USAGE = `const [range, setRange] = useState<DateRange | null>(null)

<DateRangePicker label="Vacation" locale="en-US" value={range} onValueChange={setRange} />`;

const PARTS = `<DateRangeRoot>
  <DateRangeTrigger aria-label="Vacation">
    <DateRangeAffix />
    <DateRangeValue placeholder="Any date">{range ? formatRange(range) : null}</DateRangeValue>
    <DateRangeCount>{countAvailable(range)}</DateRangeCount>
  </DateRangeTrigger>
  <DateRangePopup>
    <RangeCalendar value={range} onValueChange={setRange} />
    <DateRangeFooter>
      <DateRangeTotal>{countAvailable(range)} days</DateRangeTotal>
      <DateRangeCaption>Vacation</DateRangeCaption>
    </DateRangeFooter>
  </DateRangePopup>
</DateRangeRoot>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  {
    name: "value",
    type: "DateRange | null",
    default: "—",
    description: (
      <>
        <code>{"{ from, to }"}</code>. Required, with <code>onValueChange</code>: the picker is always controlled.
      </>
    ),
  },
  {
    name: "isDateUnavailable",
    type: "(day: Date) => string | boolean",
    default: "—",
    description: "Days that can't start or end a range. Inside one, they are hatched and left out of the count.",
  },
  { name: "min / max", type: "Date", default: "—", description: "The first and last day you can choose." },
  {
    name: "presets",
    type: "{ label, range: () => DateRange }[]",
    default: "[]",
    description: "Quick ranges under the calendar.",
  },
  {
    name: "caption",
    type: "(range) => ReactNode",
    default: "—",
    description: "Replaces the day count under the calendar.",
  },
  {
    name: "locale",
    type: "string",
    default: '"en-GB"',
    description: "Names the months and days, and formats the field.",
  },
  {
    name: "layout",
    type: '"control" | "cell"',
    default: '"control"',
    description: (
      <>
        <code>cell</code> drops the frame and hides the label, for a toolbar.
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
  title: "Date range",
  seo: "A React date range picker on react-day-picker: choose a first and last day; the range floods with ink ends and the field counts only the days that count.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A first and a last day. The range floods yellow with ink ends, and where it breaks across weeks a notch says it
        continues. The field counts only the days that count.
      </p>

      <ComponentDemo
        label="Date range example"
        preview={<DateRangeVacation />}
        code={code("date-range-vacation.tsx", "example code")}
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
        Choose the first day, then the last; moving between them previews the range, and Escape drops a half-made one.
        Also exported: <code>RangeCalendar</code>, <code>formatRange</code> and <code>countAvailable</code>. Built on{" "}
        <a href="https://daypicker.dev">React DayPicker</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>DateRangePicker</code> is built from parts you can compose yourself. <code>DateRangeRoot</code> is Base
        UI&apos;s Popover root, <code>DateRangeTrigger</code> its trigger drawn as a field frame (with{" "}
        <code>layout</code>), and <code>DateRangePopup</code> its Portal, Positioner and Popup in one part, docked to
        the trigger (with the placement props, <code>layout</code>, <code>container</code> and <code>portalProps</code>
        ). <code>DateRangeAffix</code>, <code>DateRangeValue</code> (with <code>placeholder</code>),{" "}
        <code>DateRangeCount</code>, <code>DateRangeFooter</code>, <code>DateRangeTotal</code>,{" "}
        <code>DateRangeCaption</code>, <code>DateRangePresets</code> and <code>DateRangePreset</code> are
        Keyline&apos;s. Every part takes <code>render</code>, and a <code>className</code> or <code>style</code> that
        may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>date-range-trigger</code>,{" "}
        <code>date-range-value</code>, <code>date-range-popup</code> and so on; the field is <code>date-range</code>,
        the grid <code>range-calendar</code>). The trigger has <code>data-kl-layout</code> and Base UI&apos;s{" "}
        <code>data-popup-open</code>. A day carries <code>data-in-range</code>, <code>data-end</code>,{" "}
        <code>data-preview</code> while a range is previewed, <code>data-today</code> and <code>data-unavailable</code>.
      </p>
    </>
  ),
};
