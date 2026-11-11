"use client"

import { Fragment, useEffect, useRef, useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Panel, PanelBody, PanelHeader } from "@/components/keyline/ui/panel"
import {
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
} from "@/components/keyline/ui/questionnaire"
import { Status } from "@/components/keyline/ui/status"

const STEPS = [
  { name: "cake", required: true, choices: [{ value: "chocolate" }, { value: "carrot" }, { value: "ice-cream" }] },
  { name: "diet", choices: [{ value: "vegetarian" }, { value: "no-nuts" }, { value: "no-dairy" }] },
  { name: "name", required: true },
  { name: "note" },
] as const
const LABEL: Record<string, string> = {
  chocolate: "Chocolate",
  carrot: "Carrot",
  "ice-cream": "Ice cream cake",
  vegetarian: "Vegetarian",
  "no-nuts": "No nuts",
  "no-dairy": "No dairy",
}
const TERM: Record<string, string> = { cake: "Cake", diet: "Dietary needs", name: "Name", note: "Note" }

export function BirthdaySurvey() {
  const [run, setRun] = useState(0)
  const [answers, setAnswers] = useState<[string, string][] | null>(null)
  const done = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (answers) done.current?.focus()
  }, [answers])

  if (answers)
    return (
      <Panel className="max-w-[520px]">
        <PanelHeader
          headingLevel={3}
          title={
            <span ref={done} tabIndex={-1}>
              Thanks, Angela has it
            </span>
          }
        />
        <PanelBody>
          <Status kind="done">Your answers are in for Meredith&apos;s birthday.</Status>
          <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-[14px]">
            {answers.map(([k, v]) => (
              <Fragment key={k}>
                <dt className="font-semibold">{TERM[k]}</dt>
                <dd className="m-0 [overflow-wrap:anywhere]">{v}</dd>
              </Fragment>
            ))}
          </dl>
          <Button
            className="justify-self-start"
            onClick={() => {
              setAnswers(null)
              setRun((r) => r + 1)
            }}
          >
            Answer again
          </Button>
        </PanelBody>
      </Panel>
    )

  return (
    <Questionnaire
      key={run}
      className="max-w-[520px]"
      items={STEPS}
      shortcuts="letters"
      aria-label="Meredith's birthday"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        setAnswers(STEPS.map((s) => [s.name, fd.getAll(s.name).map((v) => LABEL[String(v)] ?? String(v)).join(", ") || "Skipped"]))
      }}
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="cake" required>
        <QuestionnaireTitle level={3}>Which cake for Meredith&apos;s birthday?</QuestionnaireTitle>
        <QuestionnaireDescription>The committee orders one. Angela has the final say.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="chocolate">Chocolate</QuestionnaireChoice>
          <QuestionnaireChoice value="carrot" description="From the bakery on Wyoming Avenue">
            Carrot
          </QuestionnaireChoice>
          <QuestionnaireChoice value="ice-cream" description="Needs the freezer cleared">
            Ice cream cake
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError>Choose a cake to continue.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireItem name="diet" multiple>
        <QuestionnaireTitle level={3}>Any dietary needs?</QuestionnaireTitle>
        <QuestionnaireDescription>Choose any, or Skip.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="vegetarian">Vegetarian</QuestionnaireChoice>
          <QuestionnaireChoice value="no-nuts">No nuts</QuestionnaireChoice>
          <QuestionnaireChoice value="no-dairy">No dairy</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError>Choose one, or Skip.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireItem name="name" required>
        <QuestionnaireTitle level={3}>Who&apos;s answering?</QuestionnaireTitle>
        <QuestionnaireDescription>So Angela knows who asked for what.</QuestionnaireDescription>
        <QuestionnaireInput autoComplete="name" />
        <QuestionnaireError>Enter your name to continue.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireItem name="note">
        <QuestionnaireTitle level={3}>Anything else?</QuestionnaireTitle>
        <QuestionnaireDescription>A message for the card, or Skip.</QuestionnaireDescription>
        <QuestionnaireInput />
        <QuestionnaireError>Write a note, or Skip.</QuestionnaireError>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit>Send answers</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  )
}
