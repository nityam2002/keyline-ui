import * as React from "react";
import * as ui from "../demo-ui";
import { Stat } from "@/registry/keyline/ui/stat";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerPopup,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/keyline/ui/drawer";
import { Button } from "@/registry/keyline/ui/button";
import { Field, FieldFrame, FieldControl, FieldLabel } from "@/registry/keyline/ui/field";

/* ------------------------------------------------------------------ *
 * 4. Drawer (Base UI Drawer: swipe to dismiss)
 * ------------------------------------------------------------------ */
function DamageForm() {
  return (
    <>
      <Field>
        <FieldLabel>Pallet</FieldLabel>
        <FieldFrame>
          <FieldControl defaultValue="PLT-4492-07" />
        </FieldFrame>
      </Field>
      <Field>
        <FieldLabel>What is damaged</FieldLabel>
        <FieldFrame>
          <FieldControl defaultValue="Corner block crushed, wrap torn" />
        </FieldFrame>
      </Field>
    </>
  );
}
export function DrawerSpecimen() {
  const [log, setLog] = React.useState("—");
  return (
    <div className={ui.stack} data-testid="specimen-drawer">
      <div className={ui.group}>
        <h3 className={ui.cap}>
          Swipe down (or Escape, or Cancel) to dismiss; start or end drawers swipe toward their side
        </h3>
        <div className={ui.row}>
          <Drawer onOpenChange={(o, d) => !o && setLog(`closed (${d.reason})`)}>
            <DrawerTrigger render={<Button />} data-testid="dr-bottom">
              Report damage
            </DrawerTrigger>
            <DrawerPopup data-testid="dr-bottom-pop">
              <DrawerHeader>
                <DrawerTitle>Report a damaged pallet</DrawerTitle>
                <DrawerDescription>TR-4492 at bay 2. The shipper gets a copy.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <DamageForm />
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose render={<Button layout="cell" />}>Cancel</DrawerClose>
                <DrawerClose render={<Button layout="cell" variant="primary" />} onClick={() => setLog("reported")}>
                  Report
                </DrawerClose>
              </DrawerFooter>
            </DrawerPopup>
          </Drawer>
          <Drawer side="end" onOpenChange={(o, d) => !o && setLog(`closed (${d.reason})`)}>
            <DrawerTrigger render={<Button />} data-testid="dr-end">
              Trailer details
            </DrawerTrigger>
            <DrawerPopup data-testid="dr-end-pop">
              <DrawerHeader>
                <DrawerTitle>TR-4492</DrawerTitle>
                <DrawerDescription>From Antwerp, 18 pallets, reefer at 4 °C.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <Stat label="Pallets" value={18} unit="PLT" />
                <p className={ui.note}>Seal 448 210 (manifest 448 201, confirmed by the shipper).</p>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose render={<Button layout="cell" />}>Close</DrawerClose>
              </DrawerFooter>
            </DrawerPopup>
          </Drawer>
          <Drawer snapPoints={[0.45, 1]} onOpenChange={(o, d) => !o && setLog(`closed (${d.reason})`)}>
            <DrawerTrigger render={<Button />} data-testid="dr-snap">
              Bay 2 log (snap points)
            </DrawerTrigger>
            <DrawerPopup data-testid="dr-snap-pop">
              <DrawerHeader>
                <DrawerTitle>Bay 2 log</DrawerTitle>
                <DrawerDescription>Opens at 45% of the screen; drag up for the full log.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                {Array.from({ length: 24 }, (_, i) => (
                  <p className={ui.note} key={i} style={{ margin: 0 }}>
                    <span className="kl-code">{`14:${String(10 + i).padStart(2, "0")}`}</span> Reefer at 4 °C, door
                    closed.
                  </p>
                ))}
              </DrawerBody>
            </DrawerPopup>
          </Drawer>
        </div>
        <p className={ui.note} data-testid="dr-log">
          Last: {log}
        </p>
      </div>
      <div className={ui.group} dir="rtl">
        <h3 className={ui.cap}>RTL: an end drawer is on the left and swipes away to the left</h3>
        <Drawer side="end">
          <DrawerTrigger render={<Button />} data-testid="dr-rtl">
            تفاصيل المقطورة
          </DrawerTrigger>
          <DrawerPopup data-testid="dr-rtl-pop">
            <DrawerHeader>
              <DrawerTitle>TR-4492</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <p className={ui.note}>من أنتويرب، 18 منصة.</p>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button layout="cell" />}>إغلاق</DrawerClose>
            </DrawerFooter>
          </DrawerPopup>
        </Drawer>
      </div>
    </div>
  );
}
