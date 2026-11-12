import * as React from "react";
import * as ui from "../demo-ui";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPopup,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarGroup,
  MenubarGroupLabel,
  MenubarSubmenuRoot,
  MenubarSubmenuTrigger,
  MenubarSubmenuPopup,
} from "@/registry/keyline/ui/menubar";

/* ------------------------------------------------------------------ *
 * 6. Menubar
 * ------------------------------------------------------------------ */
export function MenubarSpecimen() {
  const [last, setLast] = React.useState("nothing yet");
  const [cols, setCols] = React.useState({ status: true, eta: true, value: false });
  const [rows, setRows] = React.useState("24");
  return (
    <div className={ui.stack}>
      <Menubar aria-label="Shipments">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPopup>
            <MenubarItem shortcut="⌘N" onClick={() => setLast("New shipment")}>
              New shipment
            </MenubarItem>
            <MenubarItem shortcut="⌘O" onClick={() => setLast("Open")}>
              Open…
            </MenubarItem>
            <MenubarSubmenuRoot>
              <MenubarSubmenuTrigger>Export</MenubarSubmenuTrigger>
              <MenubarSubmenuPopup>
                <MenubarItem onClick={() => setLast("Export CSV")}>CSV</MenubarItem>
                <MenubarItem onClick={() => setLast("Export XLSX")}>Excel workbook</MenubarItem>
              </MenubarSubmenuPopup>
            </MenubarSubmenuRoot>
            <MenubarSeparator />
            <MenubarItem variant="destructive" onClick={() => setLast("Cancel shipment")}>
              Cancel shipment…
            </MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPopup>
            <MenubarItem shortcut="⌘Z" onClick={() => setLast("Undo")}>
              Undo
            </MenubarItem>
            <MenubarItem disabled shortcut="⇧⌘Z">
              Redo
            </MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPopup>
            <MenubarGroup>
              <MenubarGroupLabel>Columns</MenubarGroupLabel>
              <MenubarCheckboxItem checked={cols.status} onCheckedChange={(v) => setCols((c) => ({ ...c, status: v }))}>
                Status
              </MenubarCheckboxItem>
              <MenubarCheckboxItem checked={cols.eta} onCheckedChange={(v) => setCols((c) => ({ ...c, eta: v }))}>
                ETA
              </MenubarCheckboxItem>
              <MenubarCheckboxItem checked={cols.value} onCheckedChange={(v) => setCols((c) => ({ ...c, value: v }))}>
                Value
              </MenubarCheckboxItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarGroup>
              <MenubarGroupLabel>Rows per page</MenubarGroupLabel>
              <MenubarRadioGroup value={rows} onValueChange={setRows}>
                {["12", "24", "48"].map((n) => (
                  <MenubarRadioItem key={n} value={n}>
                    {n} rows
                  </MenubarRadioItem>
                ))}
              </MenubarRadioGroup>
            </MenubarGroup>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu disabled>
          <MenubarTrigger>Automations</MenubarTrigger>
          <MenubarPopup>
            <MenubarItem>Rules</MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Help</MenubarTrigger>
          <MenubarPopup>
            <MenubarItem onClick={() => setLast("Shortcuts")}>Keyboard shortcuts</MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
      </Menubar>
      <p className={ui.note} data-testid="specimen-menubar">
        Last command: {last} · Columns:{" "}
        {Object.entries(cols)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(", ") || "none"}{" "}
        · {rows} rows
      </p>
    </div>
  );
}
