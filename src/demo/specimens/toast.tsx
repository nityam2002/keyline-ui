import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Panel, PanelHeader } from "@/registry/keyline/ui/panel";
import { ItemList, Item, ItemContent, ItemActions } from "@/registry/keyline/ui/item";
import { SwitchField } from "@/registry/keyline/ui/switch";
import { ToastProvider, ToastDock, ToastFloating, useToaster, createToaster } from "@/registry/keyline/ui/toast";

/* ------------------------------------------------------------------ *
 * 4. Toast: docked and floating, kinds, Undo, promise, outside React
 * ------------------------------------------------------------------ */
const ROWS = [
  { id: "SH-20483", dest: "Lyon, FR" },
  { id: "SH-20491", dest: "Ghent, BE" },
  { id: "SH-20502", dest: "Bremen, DE" },
];
function DockedToasts() {
  const t = useToaster();
  const [rows, setRows] = React.useState(ROWS);
  const [fail, setFail] = React.useState(false);
  const archive = (r: (typeof ROWS)[number]) => {
    const before = rows;
    setRows(rows.filter((x) => x.id !== r.id));
    t.notify({
      title: `Archived ${r.id}`,
      description: `${before.length - 1} left in Ready`,
      action: { label: "Undo", onClick: () => setRows(before) },
    });
  };
  const exportManifest = () =>
    t
      .promise(
        new Promise<number>((ok, no) =>
          window.setTimeout(() => (fail ? no(new Error("timeout")) : ok(rows.length)), 1400),
        ),
        {
          loading: { title: "Exporting manifest…", description: "CSV, all columns" },
          done: (n) => ({ title: "Manifest exported", description: `${n} shipments · manifest.csv` }),
          failed: {
            title: "Export failed",
            description: "The file server did not answer.",
            action: { label: "Retry", onClick: () => exportManifest() },
          },
        },
      )
      .catch(() => {});
  return (
    <Panel data-testid="toast-docked">
      <PanelHeader title="Ready to load" code={String(rows.length)} headingLevel={3} />
      <ItemList layout="cell" aria-label="Ready to load">
        {rows.map((r) => (
          <Item key={r.id}>
            <ItemContent title={r.dest} description={r.id} />
            <ItemActions>
              <Button layout="cell" variant="quiet" onClick={() => archive(r)}>
                Archive
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemList>
      <div className="kl-cells flex-wrap [border-block-start:var(--kl-k1)_solid_var(--kl-line)] *:flex-auto">
        <Button layout="cell" onClick={exportManifest}>
          Export
        </Button>
        <Button
          layout="cell"
          onClick={() =>
            t.notify({ type: "warning", title: "Cut-off in 20 minutes", description: "DHL Freight collects at 16:00." })
          }
        >
          Warning
        </Button>
        <Button layout="cell" onClick={() => t.notify({ type: "info", title: "3 carriers updated rates" })}>
          Info
        </Button>
        <Button
          layout="cell"
          onClick={() =>
            t.notify({
              type: "failed",
              title: "Couldn't reach DSV Road",
              action: { label: "Retry", onClick: () => t.notify({ title: "DSV Road reached" }) },
            })
          }
        >
          Failed
        </Button>
        <SwitchField layout="cell" label="Export fails" checked={fail} onCheckedChange={setFail} />
      </div>
      {/* the dock: a cell on the panel's bottom keyline, so a message never covers the rows */}
      <div className="kl-cells min-h-12 [border-block-start:var(--kl-k3)_solid_var(--kl-line)]">
        <ToastDock aria-label="Notifications" className="flex-1" />
      </div>
    </Panel>
  );
}
/** A module-level manager: anything can raise a message, React or not (a socket, a fetch wrapper, a router guard). */
const toaster = createToaster();
/** Not a component and not a hook: a plain function, as a websocket handler would be. */
function onCarrierMessage(n: number) {
  toaster.notify({
    type: n % 2 ? "info" : "done",
    title: n % 2 ? "Rate change from Kuehne+Nagel" : "Pickup confirmed for SH-20491",
    description: n % 2 ? "Road, NL → DE, from 1 Dec" : "Thu 12 Nov, 08:00–10:00",
  });
}
let carrierCount = 0;
export function ToastSpecimen() {
  return (
    <div className={ui.split} data-testid="specimen-toast">
      <div className={ui.group}>
        <h3 className={ui.cap}>
          Docked in the panel's bottom cell: Archive (Undo), Export (loading → done or failed, Retry), kinds
        </h3>
        <ToastProvider>
          <DockedToasts />
        </ToastProvider>
      </div>
      <div className={ui.group}>
        <h3 className={ui.cap}>
          Floating at the inline-end corner, raised outside React (createToaster): a stack of up to three; hover or
          focus fans it out, swipe to dismiss
        </h3>
        <ToastProvider toastManager={toaster}>
          <div className={ui.row}>
            <Button onClick={() => window.setTimeout(() => onCarrierMessage(++carrierCount), 300)}>
              Simulate a carrier message
            </Button>
            <Button
              onClick={() => [0, 350, 700].forEach((d) => window.setTimeout(() => onCarrierMessage(++carrierCount), d))}
            >
              Three in a row
            </Button>
            <Button variant="quiet" onClick={() => toaster.dismiss()}>
              Dismiss all
            </Button>
          </div>
          <ToastFloating aria-label="Carrier messages" />
        </ToastProvider>
      </div>
    </div>
  );
}
