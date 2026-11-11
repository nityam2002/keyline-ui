import * as ui from "../demo-ui"
import { Avatar,AvatarGroup,AvatarGroupCount } from "@/registry/keyline/ui/avatar"
import { ItemList,Item,ItemMedia,ItemContent,ItemMeta } from "@/registry/keyline/ui/item"
import { Panel,PanelHeader,PanelBody } from "@/registry/keyline/ui/panel"
import { Popover,PopoverTrigger,PopoverContent,PopoverHeader } from "@/registry/keyline/ui/popover"

export const CREW = [
  { name: "Nora van der Berg", role: "Dispatcher", src: "/demo/person-1.svg", status: "normal" as const, code: "U-0412", shift: "06:00–14:00", open: 12 },
  { name: "Ade Okafor", role: "Carrier liaison", src: "/demo/person-2.svg", status: "waiting" as const, code: "U-0388", shift: "08:00–16:00", open: 7 },
  { name: "María José Núñez", role: "Customs broker", src: "/demo/missing.png", status: "attention" as const, code: "U-0291", shift: "10:00–18:00", open: 3 },
  { name: "李小龍", role: "Night planner", status: "none" as const, code: "U-0520", shift: "22:00–06:00", open: 0 },
  { name: "ops@freightdesk.io", role: "Shared inbox", status: undefined, code: "OPS", shift: "—", open: 31 },
  { name: "Wilhelmina Oostergetel-Vandersteen", role: "Yard supervisor, Maasvlakte II terminal", src: "/demo/person-3.svg", status: "normal" as const, code: "U-0107", shift: "14:00–22:00", open: 5 },
]
/* ------------------------------------------------------------------ *
 * 1. Avatar
 * ------------------------------------------------------------------ */
export function AvatarSpecimen() {
  const people = CREW.slice(0, 4)
  return (
    <div className={ui.stack} data-testid="specimen-avatar">
      <div className={ui.split}>
        <div className={ui.group} data-testid="av-sizes">
          <h3 className={ui.cap}>Sizes sm · md · lg · xl; photo, failed photo, initials</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
            <Avatar size="sm" name="Nora van der Berg" src="/demo/person-1.svg" />
            <Avatar name="Ade Okafor" src="/demo/person-2.svg" />
            <Avatar size="lg" name="María José Núñez" src="/demo/missing.png" data-testid="av-failed" />
            <Avatar size="xl" name="Joost Brandsma" src="/demo/person-4.svg" status="normal" statusLabel="on shift" />
            <Avatar size="xl" name="李小龍" status="none" />
            <Avatar size="lg" name="ops@freightdesk.io" />
            <Avatar size="lg" name="Wilhelmina Oostergetel-Vandersteen" />
          </div>
        </div>
        <div className={ui.group} data-testid="av-status">
          <h3 className={ui.cap}>Status on the floor: active solid, away dashed, attention red, done double, offline grayscale</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
            <Avatar size="lg" name="Nora van der Berg" src="/demo/person-1.svg" status="normal" />
            <Avatar size="lg" name="Ade Okafor" src="/demo/person-2.svg" status="waiting" />
            <Avatar size="lg" name="María José Núñez" status="attention" statusLabel="blocked at customs" />
            <Avatar size="lg" name="Wilhelmina Oostergetel-Vandersteen" src="/demo/person-3.svg" status="done" statusLabel="shift handed over" />
            <Avatar size="lg" name="Joost Brandsma" src="/demo/person-4.svg" status="none" />
            <Avatar size="lg" name="李小龍" status="none" />
            <Avatar size="sm" name="Ade Okafor" src="/demo/person-2.svg" status="waiting" />
            <Avatar size="sm" name="María José Núñez" status="attention" />
          </div>
        </div>
        <div className={ui.group}>
          <h3 className={ui.cap}>Group: cells on shared seams; overflow as a count</h3>
          <AvatarGroup label="Assignees" max={4} data-testid="av-group">
            {CREW.map((p) => (
              <Avatar key={p.code} name={p.name} src={p.src} />
            ))}
          </AvatarGroup>
          <AvatarGroup label="Watchers" size="sm" total={14}>
            {people.map((p) => (
              <Avatar key={p.code} name={p.name} src={p.src} />
            ))}
          </AvatarGroup>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AvatarGroup label="Approvers" size="lg">
              {people.slice(0, 2).map((p) => (
                <Avatar key={p.code} name={p.name} src={p.src} />
              ))}
              <Popover>
                <PopoverTrigger render={<AvatarGroupCount count={4} label="Show 4 more approvers" render={<button type="button" />} />} data-testid="av-more" />
                <PopoverContent detached>
                  <PopoverHeader title="Approvers" description="6 people" />
                  <ItemList layout="cell">
                    {CREW.map((p) => (
                      <Item key={p.code}>
                        <ItemMedia>
                          <Avatar name={p.name} src={p.src} decorative />
                        </ItemMedia>
                        <ItemContent title={p.name} description={p.role} />
                      </Item>
                    ))}
                  </ItemList>
                </PopoverContent>
              </Popover>
            </AvatarGroup>
            <span className={ui.note}>The count opens everyone (a real button).</span>
          </div>
        </div>
      </div>
      <Panel style={{ maxWidth: 560 }} data-testid="av-crew">
        <PanelHeader title="On shift" code="RTM" description="An avatar in each row's media cell; the name is beside it, so the avatar is decorative." />
        <PanelBody flush>
          <ItemList layout="cell">
            {CREW.map((p, i) => (
              <Item key={p.code} current={i === 0}>
                <ItemMedia>
                  <Avatar name={p.name} src={p.src} status={p.status} decorative />
                </ItemMedia>
                <ItemContent title={p.name} description={p.role} />
                <ItemMeta>{p.shift}</ItemMeta>
              </Item>
            ))}
          </ItemList>
        </PanelBody>
      </Panel>
    </div>
  )
}
