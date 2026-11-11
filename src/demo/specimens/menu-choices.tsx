import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Menu,MenuTrigger,MenuContent,MenuItem,MenuCheckboxItem,MenuRadioGroup,MenuRadioItem,MenuSeparator,MenuGroup,MenuGroupLabel } from "@/registry/keyline/ui/menu"
import { ContextMenu,ContextMenuTrigger,ContextMenuContent,ContextMenuItem,ContextMenuCheckboxItem,ContextMenuSeparator,ContextMenuRadioGroup,ContextMenuRadioItem,ContextMenuGroup,ContextMenuGroupLabel } from "@/registry/keyline/ui/context-menu"

/* ------------------------------------------------------------------ */
export function MenuChoicesSpecimen() {
  const [cols, setCols] = React.useState({ eta: true, weight: true, carrier: false })
  const [density, setDensity] = React.useState("default")
  const [sortBy, setSortBy] = React.useState("eta")
  return (
    <div className={ui.split}>
      <div className={ui.row}>
        <Menu>
          <MenuTrigger render={<Button />}>View options</MenuTrigger>
          <MenuContent>
            <MenuGroup>
              <MenuGroupLabel>Columns</MenuGroupLabel>
              <MenuCheckboxItem checked={cols.eta} onCheckedChange={(v) => setCols((c) => ({ ...c, eta: v }))} shortcut="E">
                ETA
              </MenuCheckboxItem>
              <MenuCheckboxItem checked={cols.weight} onCheckedChange={(v) => setCols((c) => ({ ...c, weight: v }))}>
                Gross weight
              </MenuCheckboxItem>
              <MenuCheckboxItem checked={cols.carrier} onCheckedChange={(v) => setCols((c) => ({ ...c, carrier: v }))} description="Adds the carrier’s own reference">
                Carrier reference
              </MenuCheckboxItem>
              <MenuCheckboxItem disabled checked>
                Reference (always shown)
              </MenuCheckboxItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuGroup>
              <MenuGroupLabel>Density</MenuGroupLabel>
              <MenuRadioGroup value={density} onValueChange={setDensity}>
                <MenuRadioItem value="default">Default</MenuRadioItem>
                <MenuRadioItem value="compact">Compact</MenuRadioItem>
              </MenuRadioGroup>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem code="R" closeOnClick>
              Reset view
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
      <p className={ui.note} data-testid="menu-choices-state">
        Columns: {Object.entries(cols).filter(([, v]) => v).map(([k]) => k).join(", ") || "none"} · density: {density} · sort: {sortBy}
      </p>
      <ContextMenu>
        <ContextMenuTrigger data-testid="ctx-target" className="grid place-items-center min-h-24 min-w-[260px] p-4 [border:var(--kl-k1)_dashed_var(--kl-line)] bg-kl-cell text-kl-ink-2 text-[14px] text-center focus-visible:[outline:var(--kl-ring)_solid_var(--kl-focus)] focus-visible:[outline-offset:var(--kl-ring-out)]" tabIndex={0} aria-label="Shipment board. Context menu available.">
          Right-click (or press the Menu key) on the board
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuGroupLabel>Sort by</ContextMenuGroupLabel>
            <ContextMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
              <ContextMenuRadioItem value="eta">ETA</ContextMenuRadioItem>
              <ContextMenuRadioItem value="weight">Weight</ContextMenuRadioItem>
              <ContextMenuRadioItem value="ref">Reference</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={cols.carrier} onCheckedChange={(v) => setCols((c) => ({ ...c, carrier: v }))}>
            Show carrier reference
          </ContextMenuCheckboxItem>
          <ContextMenuItem code="P">Print board</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}
