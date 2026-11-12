import * as React from "react";
import * as ui from "../demo-ui";
import { Toggle } from "@/registry/keyline/ui/toggle";
import { Icon } from "./input-group";

export function ToggleSpecimen() {
  const [mine, setMine] = React.useState(true);
  return (
    <div className={ui.stack} data-testid="specimen-toggle">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <Toggle pressed={mine} onPressedChange={setMine} count={12} data-testid="tg-mine">
          Assigned to me
        </Toggle>
        <Toggle defaultPressed={false} data-testid="tg-follow">
          Follow shipment
        </Toggle>
        <Toggle icon aria-label="Pin to dashboard" defaultPressed data-testid="tg-pin">
          <Icon d="M6 1.5h4M7 1.5v4L4.5 9h7L9 5.5v-4M8 9v5.5" />
        </Toggle>
        <Toggle disabled>Archived</Toggle>
        <Toggle disabled defaultPressed>
          Locked
        </Toggle>
      </div>
      <p className={ui.note}>
        Showing {mine ? "12 shipments assigned to you" : "all 128 shipments"}. The label stays the same; the flood and
        the lamp say whether it is on.
      </p>
      <div dir="rtl" style={{ display: "flex", gap: 12 }} data-testid="tg-rtl">
        <Toggle defaultPressed count={3}>
          مهامي
        </Toggle>
      </div>
    </div>
  );
}
