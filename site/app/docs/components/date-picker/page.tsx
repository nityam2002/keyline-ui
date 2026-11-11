import { CodeBlock } from "@site/components/code-block"
import { InstallCommand } from "@site/components/install-command"
import { ComponentDemo } from "@site/components/component-demo"
import { PropsReference, type Prop } from "@site/components/props-reference"
import { DocPage } from "@site/components/doc-page"
import { ExampleCode } from "@site/components/example-code"
import type { TocGroup } from "@site/components/page-toc"
import { componentMetadata } from "@site/lib/seo"
import { DatePickerDelivery, DatePickerMeeting } from "@site/components/input-previews"

const ITEM = "date-picker"

export const metadata = componentMetadata("Date picker and calendar", "A React date picker and calendar on react-day-picker: a day, or a day and a time, from a calendar docked to its field. Unavailable days are skipped and say why.", "date-picker")

const IMPORT = `import { DatePicker } from "@/components/keyline/ui/date-picker"`

const USAGE = `<DatePicker
  label="Deliver on"
  locale="en-US"
  min={tomorrow}
  value={date}
  onValueChange={setDate}
  isDateUnavailable={(d) => d.getDay() % 6 === 0 && "no weekend deliveries"}
/>`

const PROPS: Prop[] = [
  { name: "label", type: "ReactNode", default: "—", description: "Names the field. Required." },
  { name: "value", type: "Date | null", default: "—", description: <>With <code>onValueChange</code>, or start with <code>defaultValue</code>.</> },
  { name: "min / max", type: "Date", default: "—", description: "The first and last day you can choose. Month navigation stops there." },
  { name: "isDateUnavailable", type: "(day: Date) => string | boolean", default: "—", description: "Return true, or a short reason that is read out, for a day that can't be chosen. It is hatched and the arrow keys skip it." },
  { name: "presets", type: "{ label, date: () => Date }[]", default: "[]", description: "Quick choices under the calendar." },
  { name: "locale", type: "string", default: '"en-GB"', description: "Names the months and days, and formats the field." },
  { name: "weekStartsOn", type: "number", default: "1", description: "0 for Sunday." },
  { name: "name", type: "string", default: "—", description: <>Submits the day as <code>YYYY-MM-DD</code>.</> },
]

const TOC: TocGroup[] = [
  { label: "Setup", items: [{ id: "installation", label: "Installation" }, { id: "usage", label: "Usage" }] },
  { label: "Examples", items: [{ id: "day-and-time", label: "Day and time" }] },
  { label: "Reference", items: [{ id: "props", label: "Props" }] },
]

export default function DatePickerPage() {
  const code = (file: string, label: string) => <ExampleCode file={file} label={label} />

  return (
    <DocPage name="Date picker and calendar" toc={TOC}>
      <h1>Date picker and calendar</h1>
      <p className="s-doc-lede">
        A day from a calendar that docks to its field. The chosen day is ink and today is underlined; days you can&apos;t choose are hatched, skipped by the arrow keys and say why.
      </p>

      <ComponentDemo label="Date picker example" preview={<DatePickerDelivery />} code={code("date-picker-delivery.tsx", "example code")} />

      <h2 id="installation">Installation</h2>
      <InstallCommand item={ITEM} />

      <h2 id="usage">Usage</h2>
      <CodeBlock code={IMPORT} lang="tsx" copyLabel="import" />
      <CodeBlock code={USAGE} lang="tsx" copyLabel="usage" />

      <h2 id="examples">Examples</h2>

      <h3 id="day-and-time">Day and time</h3>
      <p>
        <code>DateTimePicker</code> adds a time row under the calendar. Given <code>slots</code>, the row offers those times; <code>isTimeUnavailable</code> marks a booked one, and a day with no slot left is unavailable.
      </p>
      <ComponentDemo label="Day and time example" preview={<DatePickerMeeting />} code={code("date-picker-meeting.tsx", "day and time example code")} />

      <h2 id="props">Props</h2>
      <PropsReference label="Date picker props" props={PROPS} />
      <p className="s-small">
        Also exported: <code>Calendar</code>, the grid on its own, and <code>DateTimePicker</code>, which also takes <code>hourCycle</code>, <code>slots</code>, <code>minTime</code>, <code>maxTime</code>, <code>required</code> and <code>error</code>. Built on{" "}
        <a href="https://daypicker.dev">React DayPicker</a> and <a href="https://base-ui.com/react/components/popover">Base UI Popover</a>.
      </p>
    </DocPage>
  )
}
