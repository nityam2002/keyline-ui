"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Field, FieldFrame, FieldControl, FieldLabel } from "../ui/field";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "../ui/panel";
import { Segmented, SegmentedItem } from "../ui/segmented";

// The same footer twice. Putting a Button inside the Panel's footer changes nothing by itself: as a control it
// keeps its own 2px frame and doubles the footer's edges. Declared as a cell, it fills its cell and the footer
// draws the one seam between the parts.
export function DeclaredCells() {
  const [layout, setLayout] = useState<"cell" | "control">("cell");
  const [sent, setSent] = useState(false);

  return (
    <div className="grid w-full max-w-[520px] gap-4">
      <Segmented
        size="compact"
        aria-label="Footer buttons"
        value={layout}
        onValueChange={(v: string) => setLayout(v as "cell" | "control")}
        className="justify-self-start"
      >
        <SegmentedItem value="cell">layout=&quot;cell&quot;</SegmentedItem>
        <SegmentedItem value="control">layout=&quot;control&quot;</SegmentedItem>
      </Segmented>
      <Panel>
        <PanelHeader
          code="PO-118"
          title="Reorder copy paper"
          description="Stamford asked for the order to arrive before the audit."
        />
        <PanelBody>
          <Field name="cases">
            <FieldLabel>Cases</FieldLabel>
            <FieldFrame>
              <FieldControl type="number" inputMode="numeric" defaultValue="40" align="end" />
              <Button layout="cell">Add 10</Button>
            </FieldFrame>
          </Field>
        </PanelBody>
        <PanelFooter data-testid="footer">
          <span className="flex flex-1 items-center px-3 text-[13px] text-kl-ink-2" role="status">
            {sent ? "Sent to Jan." : "Draft"}
          </span>
          <Button layout={layout}>Save draft</Button>
          <Button layout={layout} variant="primary" disabled={sent} onClick={() => setSent(true)}>
            Send order
          </Button>
        </PanelFooter>
      </Panel>
    </div>
  );
}
