import * as ui from "../demo-ui"
import { Avatar } from "@/registry/keyline/ui/avatar"
import { HoverCard,HoverCardTrigger,HoverCardContent,HoverCardHeader,HoverCardFacts,HoverCardBody } from "@/registry/keyline/ui/hover-card"
import { Button } from "@/registry/keyline/ui/button"
import { Panel,PanelHeader,PanelBody,PanelFooter } from "@/registry/keyline/ui/panel"
import { Status } from "@/registry/keyline/ui/status"
import { CREW } from "./avatar"

/* ------------------------------------------------------------------ *
 * 2. Hover card
 * ------------------------------------------------------------------ */
function PersonCard({ p }: { p: (typeof CREW)[number] }) {
  return (
    <HoverCard>
      <HoverCardTrigger href={`#/specimen?person=${p.code}`}>{p.name}</HoverCardTrigger>
      <HoverCardContent>
        <HoverCardHeader media={<Avatar layout="cell" name={p.name} src={p.src} status={p.status} decorative />} title={p.name} description={p.role} code={p.code} />
        <HoverCardFacts facts={[["Shift", p.shift], ["Open shipments", p.open]]} />
        {p.status === "attention" ? (
          <HoverCardBody>
            <Status kind="attention">2 entries held at customs</Status>
          </HoverCardBody>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  )
}
export function HoverCardSpecimen() {
  return (
    <div className={ui.stack} data-testid="specimen-hover">
      <Panel style={{ maxWidth: 620 }}>
        <PanelHeader title="SH-20483 · Rotterdam → Basel" code="R3/12" />
        <PanelBody>
          <p style={{ margin: 0, lineHeight: 1.6 }} data-testid="hc-text">
            Assigned by <PersonCard p={CREW[0]} /> this morning; <PersonCard p={CREW[1]} /> is confirming the carrier, and{" "}
            <PersonCard p={CREW[2]} /> holds the customs entries. Night handover goes to <PersonCard p={CREW[3]} />.
          </p>
        </PanelBody>
        <PanelFooter>
          <Button layout="cell">Reassign</Button>
        </PanelFooter>
      </Panel>
      <div className={ui.split}>
        <div className={ui.group} style={{ maxWidth: 240 }} data-testid="hc-narrow">
          <h3 className={ui.cap}>Long name in a narrow column</h3>
          <p style={{ margin: 0 }}>
            Yard: <PersonCard p={CREW[5]} />
          </p>
        </div>
        <div className={ui.group} data-testid="hc-rtl">
          <h3 className={ui.cap}>Right to left</h3>
          <p style={{ margin: 0 }} dir="rtl">
            المسؤول: <PersonCard p={CREW[1]} />
          </p>
        </div>
      </div>
    </div>
  )
}
