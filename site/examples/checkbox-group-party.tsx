"use client"

import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { CheckboxGroup } from "@/components/keyline/ui/checkbox-group"
import { Form, FormActions } from "@/components/keyline/ui/field"

const SUPPLIES = [
  { value: "cake", label: "Sheet cake", meta: "$38" },
  { value: "balloons", label: "Balloons", meta: "$12" },
  { value: "streamers", label: "Streamers", description: "Not red. Angela was clear.", meta: "$6" },
  { value: "plates", label: "Plates and forks", meta: "$9" },
]

export function PartySupplies() {
  const [sent, setSent] = useState<string | null>(null)

  return (
    <Form className="max-w-[420px]" onFormSubmit={(v) => {
        const n = (v.supplies as string[]).length
        setSent(`List sent to Angela: ${n} ${n === 1 ? "item" : "items"}.`)
      }}>
      <CheckboxGroup
        name="supplies"
        legend="For Meredith's birthday, buy"
        options={SUPPLIES}
        validate={(value) => ((value as string[]).length ? null : "Pick at least one. The party is at 3.")}
      />
      <FormActions>
        <Button type="submit" variant="primary">
          Send to Angela
        </Button>
      </FormActions>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {sent}
      </p>
    </Form>
  )
}
