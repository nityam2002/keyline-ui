import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Panel,PanelHeader,PanelBody } from "@/registry/keyline/ui/panel"
import { Notice } from "@/registry/keyline/ui/notice"
import { SwitchField } from "@/registry/keyline/ui/switch"
import { Status } from "@/registry/keyline/ui/status"
import { Questionnaire,QuestionnaireProgress,QuestionnaireItem,QuestionnaireTitle,QuestionnaireDescription,QuestionnaireChoices,QuestionnaireChoice,QuestionnaireInput,QuestionnaireError,QuestionnaireActions,QuestionnairePrevious,QuestionnaireSkip,QuestionnaireNext,QuestionnaireSubmit } from "@/registry/keyline/ui/questionnaire"

/* ------------------------------------------------------------------ *
 * 1. Questionnaire: a complete flow, submission failure and retry
 * ------------------------------------------------------------------ */
const STEPS = [
  { name: "mode", required: true, choices: [{ value: "road" }, { value: "rail" }, { value: "sea" }, { value: "air", disabled: true }] },
  { name: "docks", choices: [{ value: "rtm" }, { value: "ant" }, { value: "ham" }] },
  { name: "email", required: true },
  { name: "notes" },
] as const
const LABEL: Record<string, string> = { road: "Road", rail: "Rail", sea: "Sea", air: "Air", rtm: "Rotterdam", ant: "Antwerp", ham: "Hamburg" }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function QuestionnaireSpecimen() {
  const [run, setRun] = React.useState(0)
  const [failFirst, setFailFirst] = React.useState(true)
  const [phase, setPhase] = React.useState<"form" | "pending" | "failed" | "done">("form")
  const [answers, setAnswers] = React.useState<[string, string][]>([])
  const [email, setEmail] = React.useState("")
  const [emailLeft, setEmailLeft] = React.useState(false)
  const attempts = React.useRef(0)
  const form = React.useRef<HTMLFormElement>(null)
  const doneHeading = React.useRef<HTMLHeadingElement>(null)
  const emailBad = emailLeft && email !== "" && !EMAIL.test(email)

  React.useEffect(() => {
    if (phase === "done") doneHeading.current?.focus()
  }, [phase])

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setPhase("pending")
    window.setTimeout(() => {
      attempts.current += 1
      if (failFirst && attempts.current === 1) return setPhase("failed")
      setAnswers(STEPS.map((s) => [s.name, fd.getAll(s.name).map((v) => (typeof v === "string" ? (LABEL[v] ?? v) : v.name)).join(", ") || "Skipped"]))
      setPhase("done")
    }, 900)
  }
  const again = () => {
    attempts.current = 0
    setEmail("")
    setEmailLeft(false)
    setPhase("form")
    setRun((r) => r + 1)
  }

  return (
    <div className={ui.stack} data-testid="specimen-questionnaire">
      <SwitchField label="Fail the first submission" description="The planner is offline once; Retry sends the same answers." checked={failFirst} onCheckedChange={setFailFirst} />
      <div style={{ maxWidth: 560 }}>
        {phase === "done" ? (
          <Panel data-testid="q-done">
            <PanelHeader title={<span ref={doneHeading} tabIndex={-1}>Request sent</span>} code="RQ-2207" headingLevel={3} />
            <PanelBody>
              <Status kind="done">The planner has your answers and replies within one working day.</Status>
              <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-[14px]">
                {answers.map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt className="font-kl-strong">{k === "mode" ? "Mode" : k === "docks" ? "Reefer docks" : k === "email" ? "Reply to" : "Notes"}</dt>
                    <dd className="m-0 [overflow-wrap:anywhere]">{v}</dd>
                  </React.Fragment>
                ))}
              </dl>
              <Button onClick={again}>Start again</Button>
            </PanelBody>
          </Panel>
        ) : (
          <Questionnaire key={run} ref={form} items={STEPS} shortcuts="letters" onSubmit={submit} aria-label="Capacity request">
            <QuestionnaireProgress />
            <QuestionnaireItem name="mode" required>
              <QuestionnaireTitle level={3}>How should the load travel?</QuestionnaireTitle>
              <QuestionnaireDescription>One mode per request. Air is closed this week.</QuestionnaireDescription>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="road" description="Door to door, 2–4 days">Road</QuestionnaireChoice>
                <QuestionnaireChoice value="rail" description="Terminal to terminal, 4–6 days">Rail</QuestionnaireChoice>
                <QuestionnaireChoice value="sea" description="Port to port, 12–30 days">Sea</QuestionnaireChoice>
                <QuestionnaireChoice value="air" disabled description="No capacity until Monday">Air</QuestionnaireChoice>
              </QuestionnaireChoices>
              <QuestionnaireError>Choose a mode to continue.</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="docks" multiple>
              <QuestionnaireTitle level={3}>Which docks can take reefers?</QuestionnaireTitle>
              <QuestionnaireDescription>Choose any. Skip if the load is not refrigerated.</QuestionnaireDescription>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="rtm">Rotterdam</QuestionnaireChoice>
                <QuestionnaireChoice value="ant">Antwerp</QuestionnaireChoice>
                <QuestionnaireChoice value="ham">Hamburg</QuestionnaireChoice>
              </QuestionnaireChoices>
              <QuestionnaireError>Choose a dock, or Skip.</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="email" required invalid={emailBad}>
              <QuestionnaireTitle level={3}>Where should the planner reply?</QuestionnaireTitle>
              <QuestionnaireDescription>A work address. We send one reply, nothing else.</QuestionnaireDescription>
              <QuestionnaireInput type="email" autoComplete="email" placeholder="name@company.com" onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailLeft(true)} />
              <QuestionnaireError>{email === "" ? "Enter an email address to continue." : "Enter an address like name@company.com."}</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="notes">
              <QuestionnaireTitle level={3}>Anything the planner should know?</QuestionnaireTitle>
              <QuestionnaireDescription>Optional: write a note, or Skip to send without one.</QuestionnaireDescription>
              <QuestionnaireInput placeholder="Tail lift, hazardous goods, a booking reference" />
              <QuestionnaireError>Write a note, or Skip to send without one.</QuestionnaireError>
            </QuestionnaireItem>
            {phase === "failed" ? (
              <Notice
                layout="cell"
                tone="attention"
                live
                title="Couldn't send the request"
                description="The planner is offline. Your answers are kept; nothing was sent."
                actions={<Button layout="cell" variant="primary" onClick={() => form.current?.requestSubmit()}>Retry</Button>}
              />
            ) : null}
            <QuestionnaireActions>
              <QuestionnairePrevious />
              <QuestionnaireSkip />
              <QuestionnaireNext />
              <QuestionnaireSubmit signal={phase === "pending" ? "pending" : phase === "failed" ? "failed" : "idle"}>Send request</QuestionnaireSubmit>
            </QuestionnaireActions>
          </Questionnaire>
        )}
      </div>
    </div>
  )
}
