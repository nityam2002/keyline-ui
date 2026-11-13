import type { ComponentContent } from "@site/content/types";
import { CodeBlock } from "@site/components/code-block";
import { ComponentDemo } from "@site/components/component-demo";
import type { Prop } from "@site/components/props-reference";
import { ExampleCode } from "@site/components/example-code";
import type { TocGroup } from "@site/components/page-toc";
import { DatePickerDelivery, DatePickerMeeting } from "@site/components/input-previews";

const IMPORT = `import { DatePicker } from "@/components/keyline/ui/date-picker"`;

const USAGE = `<DatePicker
  label="Deliver on"
  locale="en-US"
  min={tomorrow}
  value={date}
  onValueChange={setDate}
  isDateUnavailable={(d) => d.getDay() % 6 === 0 && "no weekend deliveries"}
/>`;

const PARTS = `<DatePickerRoot>
  <DatePickerTrigger aria-label="Deliver on">
    <DatePickerAffix />
    <DatePickerValue placeholder="Choose a date">{date ? format(date) : null}</DatePickerValue>
  </DatePickerTrigger>
  <DatePickerPopup>
    <Calendar value={date} onValueChange={setDate} />
    <DatePickerPresets>
      <DatePickerPreset onClick={() => setDate(tomorrow)}>Tomorrow</DatePickerPreset>
    </DatePickerPresets>
  </DatePickerPopup>
</DatePickerRoot>`;

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  {
    name: "value",
    type: "Date | null",
    default: "—",
    description: (
      <>
        With <code>onValueChange</code>, or start with <code>defaultValue</code>.
      </>
    ),
  },
  {
    name: "min / max",
    type: "Date",
    default: "—",
    description: "The first and last day you can choose. Month navigation stops there.",
  },
  {
    name: "isDateUnavailable",
    type: "(day: Date) => string | boolean",
    default: "—",
    description:
      "Return true, or a short reason that is read out, for a day that can't be chosen. It is hatched and the arrow keys skip it.",
  },
  {
    name: "presets",
    type: "{ label, date: () => Date }[]",
    default: "[]",
    description: "Quick choices under the calendar.",
  },
  {
    name: "locale",
    type: "string",
    default: '"en-GB"',
    description: "Names the months and days, and formats the field.",
  },
  { name: "weekStartsOn", type: "number", default: "1", description: "0 for Sunday." },
  {
    name: "name",
    type: "string",
    default: "—",
    description: (
      <>
        Submits the day as <code>YYYY-MM-DD</code>.
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
  { label: "Examples", items: [{ id: "day-and-time", label: "Day and time" }] },
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
  title: "Date picker and calendar",
  seo: "A React date picker and calendar on react-day-picker: a day, or a day and a time, from a calendar docked to its field. Unavailable days are skipped and say why.",
  toc: TOC,
  props: PROPS,
  lede: (
    <>
      <p className="s-doc-lede">
        A day from a calendar that docks to its field. The chosen day is ink and today is underlined; days you
        can&apos;t choose are hatched, skipped by the arrow keys and say why.
      </p>

      <ComponentDemo
        label="Date picker example"
        preview={<DatePickerDelivery />}
        code={code("date-picker-delivery.tsx", "example code")}
      />
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

      <h3 id="day-and-time">Day and time</h3>
      <p>
        <code>DateTimePicker</code> adds a time row under the calendar. Given <code>slots</code>, the row offers those
        times; <code>isTimeUnavailable</code> marks a booked one, and a day with no slot left is unavailable.
      </p>
      <ComponentDemo
        label="Day and time example"
        preview={<DatePickerMeeting />}
        code={code("date-picker-meeting.tsx", "day and time example code")}
      />
    </>
  ),
  reference: (
    <>
      <p className="s-small">
        Also exported: <code>Calendar</code>, the grid on its own, and <code>DateTimePicker</code>, which also takes{" "}
        <code>hourCycle</code>, <code>slots</code>, <code>minTime</code>, <code>maxTime</code>, <code>required</code>{" "}
        and <code>error</code>. Built on <a href="https://daypicker.dev">React DayPicker</a> and{" "}
        <a href="https://base-ui.com/react/components/popover">Base UI Popover</a>.
      </p>

      <h3 id="parts">Parts</h3>
      <p>
        <code>DatePicker</code> is built from parts you can compose yourself. <code>DatePickerRoot</code> is Base
        UI&apos;s Popover root, <code>DatePickerTrigger</code> its trigger drawn as a field frame (with{" "}
        <code>layout</code>), <code>DatePickerPopup</code> its Portal, Positioner and Popup in one part, docked to the
        trigger (with the placement props, <code>layout</code>, <code>container</code> and <code>portalProps</code>),
        and <code>DatePickerClose</code> its close button, a key cell. <code>DatePickerAffix</code> (the calendar
        glyph&apos;s cell), <code>DatePickerValue</code> (with <code>placeholder</code>), <code>DatePickerPresets</code>{" "}
        and <code>DatePickerPreset</code> are Keyline&apos;s. Every part takes <code>render</code>, and a{" "}
        <code>className</code> or <code>style</code> that may be a function of its state.
      </p>
      <CodeBlock code={PARTS} lang="tsx" copyLabel="parts" />
      <p className="s-small">
        Each part carries a <code>data-slot</code> named after it (<code>date-picker-trigger</code>,{" "}
        <code>date-picker-value</code>, <code>date-picker-popup</code>, <code>date-picker-preset</code> and so on; the
        fields are <code>date-picker</code> and <code>date-time-picker</code>, the grid <code>calendar</code>). The
        trigger has <code>data-kl-layout</code> and Base UI&apos;s <code>data-popup-open</code>; the popup{" "}
        <code>data-side</code> and <code>data-align</code>. A day carries <code>data-today</code>,{" "}
        <code>data-unavailable</code> and <code>data-kl-on</code> when chosen.
      </p>
    </>
  ),
};
