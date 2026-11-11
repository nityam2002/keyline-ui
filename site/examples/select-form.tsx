"use client"

import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Form, FormActions } from "@/components/keyline/ui/field"
import { Select } from "@/components/keyline/ui/select"

const WEIGHTS = [
  { value: "20", label: "20 lb copy" },
  { value: "24", label: "24 lb premium" },
  { value: "110", label: "110 lb cardstock" },
]

export function QuoteForm() {
  const [sent, setSent] = useState<string | null>(null)

  return (
    <Form className="max-w-[360px]" onFormSubmit={(v) => setSent(`Quote sent with ${WEIGHTS.find((w) => w.value === v.weight)?.label}.`)}>
      <Select name="weight" label="Paper weight" placeholder="Choose a weight" required options={WEIGHTS} error="Choose a weight. The price depends on it." />
      <FormActions>
        <Button type="submit" variant="primary">
          Send quote
        </Button>
      </FormActions>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {sent}
      </p>
    </Form>
  )
}
