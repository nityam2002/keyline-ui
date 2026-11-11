import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Field,FieldLabel,FieldFrame,FieldInput,FieldTextarea,FieldAffix,FieldBar,FieldDescription,FieldError } from "@/registry/keyline/ui/field"
import { Toggle } from "@/registry/keyline/ui/toggle"

export const Icon = ({ d, label }: { d: string; label?: string }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" aria-hidden={label ? undefined : true}>
    <path d={d} />
  </svg>
)
const EYE = "M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8 12.1 12.5 8 12.5 1.5 8 1.5 8Zm6.5 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
const SEARCH = "M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10Zm3.5-1.5L14 14"
const CLEAR = "M4 4l8 8M12 4l-8 8"
/* ------------------------------------------------------------------ *
 * 1. Input group: buttons, toggles and bars inside the field frame
 * ------------------------------------------------------------------ */
function PasswordField() {
  const [shown, setShown] = React.useState(false)
  return (
    <Field>
      <FieldLabel>Password</FieldLabel>
      <FieldFrame>
        <FieldInput type={shown ? "text" : "password"} defaultValue="harbour-light-42" autoComplete="current-password" />
        <Toggle layout="cell" icon pressed={shown} onPressedChange={setShown} aria-label="Show password" data-testid="ig-reveal">
          <Icon d={EYE} />
        </Toggle>
      </FieldFrame>
    </Field>
  )
}
function CopyLink() {
  const [signal, setSignal] = React.useState<"idle" | "done">("idle")
  React.useEffect(() => {
    if (signal !== "done") return
    const t = setTimeout(() => setSignal("idle"), 1600)
    return () => clearTimeout(t)
  }, [signal])
  return (
    <Field>
      <FieldLabel>Tracking link</FieldLabel>
      <FieldFrame>
        <FieldInput readOnly defaultValue="https://track.freightdesk.io/SH-20483" />
        <Button layout="cell" signal={signal} onClick={() => { void navigator.clipboard?.writeText("https://track.freightdesk.io/SH-20483").catch(() => {}); setSignal("done") }} data-testid="ig-copy">
          Copy
        </Button>
      </FieldFrame>
      <FieldDescription>Anyone with the link sees the shipment's status, not its documents.</FieldDescription>
    </Field>
  )
}
function SearchField({ testid }: { testid?: string }) {
  const [q, setQ] = React.useState("Maasvlakte")
  const [matchCase, setMatchCase] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  return (
    <Field data-testid={testid}>
      <FieldLabel>Search manifests</FieldLabel>
      <FieldFrame>
        <FieldAffix>
          <Icon d={SEARCH} />
        </FieldAffix>
        <FieldInput ref={input} value={q} onChange={(e) => setQ(e.target.value)} type="search" />
        {q ? (
          <Button layout="cell" size="icon" aria-label="Clear search" onClick={() => { setQ(""); input.current?.focus() /* the button leaves with the text: focus goes back to the input, not the page */ }}>
            <Icon d={CLEAR} />
          </Button>
        ) : null}
        <Toggle layout="cell" icon pressed={matchCase} onPressedChange={setMatchCase} aria-label="Match case">
          <span style={{ font: "700 13px/1 var(--kl-font)" }} aria-hidden>
            Aa
          </span>
        </Toggle>
      </FieldFrame>
    </Field>
  )
}
function MessageField() {
  const [text, setText] = React.useState("Gate 4 closes at 22:00 tonight; trucks after that go to gate 7.")
  const [bold, setBold] = React.useState(false)
  const [urgent, setUrgent] = React.useState(true)
  const max = 160
  const over = text.length > max
  return (
    <Field invalid={over} data-testid="ig-message">
      <FieldLabel>Driver notice</FieldLabel>
      <FieldFrame>
        <FieldBar side="start">
          <Toggle layout="cell" icon pressed={bold} onPressedChange={setBold} aria-label="Bold">
            <span style={{ font: "800 14px/1 var(--kl-font)" }} aria-hidden>
              B
            </span>
          </Toggle>
          <Toggle layout="cell" pressed={urgent} onPressedChange={setUrgent}>
            Urgent
          </Toggle>
        </FieldBar>
        <FieldTextarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
        <FieldBar side="end">
          <FieldAffix data-testid="ig-count" aria-live="polite">
            {text.length}/{max}
          </FieldAffix>
          <span data-kl-spacer />
          <Button layout="cell" variant="primary" disabled={over || !text.trim()}>
            Send to 14 drivers
          </Button>
        </FieldBar>
      </FieldFrame>
      <FieldError match={over}>The notice is {text.length - max} characters too long for a text message.</FieldError>
    </Field>
  )
}
export function InputGroupSpecimen() {
  return (
    <div className={ui.stack} data-testid="specimen-ig">
      <div className={ui.grid2}>
        <PasswordField />
        <CopyLink />
        <SearchField testid="ig-search" />
        <Field invalid data-testid="ig-invalid">
          <FieldLabel>Container number</FieldLabel>
          <FieldFrame>
            <FieldInput defaultValue="MSCU 123456" />
            <Button layout="cell">Check</Button>
          </FieldFrame>
          <FieldError match>Container numbers have 7 digits after the owner code.</FieldError>
        </Field>
      </div>
      <MessageField />
      <div className={ui.group} style={{ maxWidth: 260 }} data-testid="ig-narrow">
        <h3 className={ui.cap}>260px column</h3>
        <SearchField />
      </div>
      <div className={ui.group} dir="rtl" data-testid="ig-rtl">
        <h3 className={ui.cap}>Right to left</h3>
        <Field>
          <FieldLabel>رابط التتبع</FieldLabel>
          <FieldFrame>
            <FieldInput readOnly defaultValue="https://track.freightdesk.io/SH-20483" dir="ltr" />
            <Button layout="cell">نسخ</Button>
          </FieldFrame>
        </Field>
      </div>
    </div>
  )
}
