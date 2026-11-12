import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Segmented, SegmentedItem } from "@/registry/keyline/ui/segmented";
import { ToggleGroup, ToggleGroupItem } from "@/registry/keyline/ui/toggle-group";
import {
  TableFrame,
  TableScroll,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableIndexCell,
  useRowMotion,
} from "@/registry/keyline/ui/table";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from "@/registry/keyline/ui/drawer";

/* Motion lab: the alternatives compared while tuning, side by side on real components. Each one sets
   the documented motion token on its own subtree (tokens are the configuration API for motion; docs/design.md). */

const TUGS = [
  { v: "0", cap: "Off: nothing moves until release" },
  { v: "6", cap: "6px: a hint" },
  { v: "12", cap: "12px: the default (a lean never reaches a label; it stops short of the item's content)" },
] as const;
/** The held press, three ways. Press a cell and hold; slide to another; release elsewhere or press Escape to let go. */
export function TugCompare() {
  const [v, setV] = React.useState<Record<string, string>>({ "0": "b", "12": "b", "24": "b" });
  return (
    <div className={ui.stack} data-testid="lab-tug">
      {TUGS.map((t) => (
        <div key={t.v} className={ui.group} style={{ "--kl-stretch-tug": t.v } as React.CSSProperties} data-tug={t.v}>
          <p className={ui.cap}>{t.cap}</p>
          <div>
            <Segmented
              value={v[t.v]}
              onValueChange={(x) => setV((s) => ({ ...s, [t.v]: x }))}
              aria-label={`Tug ${t.v}`}
            >
              <SegmentedItem value="a">Day</SegmentedItem>
              <SegmentedItem value="b">Week</SegmentedItem>
              <SegmentedItem value="c">Month</SegmentedItem>
              <SegmentedItem value="d">Fiscal quarter</SegmentedItem>
            </Segmented>
          </div>
        </div>
      ))}
    </div>
  );
}
const SEEDS = [
  { v: "0px", cap: "Off: the cell answers at release" },
  { v: "7px", cap: "7px: the default" },
  { v: "14px", cap: "14px" },
] as const;
/** The flood's seed under a held press, three ways. */
export function SeedCompare() {
  return (
    <div className={ui.stack} data-testid="lab-seed">
      {SEEDS.map((s) => (
        <div key={s.v} className={ui.group} style={{ "--kl-flood-seed": s.v } as React.CSSProperties}>
          <p className={ui.cap}>{s.cap}</p>
          <div>
            <ToggleGroup aria-label={`Seed ${s.v}`} defaultValue={[]}>
              <ToggleGroupItem value="1">In transit</ToggleGroupItem>
              <ToggleGroupItem value="2">Awaiting docs</ToggleGroupItem>
              <ToggleGroupItem value="3">Delayed</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      ))}
    </div>
  );
}
const ROWS = [
  ["SH-20481", "Hamburg, DE"],
  ["SH-20482", "Antwerpen, BE"],
  ["SH-20483", "Lyon, FR"],
  ["SH-20484", "Kraków, PL"],
  ["SH-20485", "Göteborg, SE"],
] as const;
/** Rows that leave and come back: the gap closes where they were, and the room opens again in the same place. */
export function RowsLeaveReturn() {
  const [gone, setGone] = React.useState<Set<string>>(new Set());
  const motion = useRowMotion();
  const toggle = () => {
    motion.arm();
    setGone((g) => (g.size ? new Set() : new Set(["SH-20482", "SH-20483"])));
  };
  return (
    <div className={ui.stack} data-testid="lab-rows">
      <div className={ui.row}>
        <Button onClick={toggle} data-testid="lab-rows-toggle">
          {gone.size ? "Undo" : "Cancel 02 and 03"}
        </Button>
      </div>
      <TableFrame className="max-h-none max-w-[520px]">
        <TableScroll>
          <Table>
            <TableBody ref={motion.ref}>
              {ROWS.filter(([id]) => !gone.has(id)).map(([id, dest]) => (
                <TableRow key={id}>
                  <TableIndexCell
                    checked={false}
                    onCheckedChange={() => {}}
                    code={id.slice(-2)}
                    label={`Select ${id}`}
                  />
                  <TableCell className="font-kl-mono text-[13px]">{id}</TableCell>
                  <TableCell>{dest}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      </TableFrame>
    </div>
  );
}
/** A drawer to throw: fling it down, or drag it part way and let go at rest. */
export function ReleaseDrawer() {
  return (
    <div className={ui.row}>
      <Drawer>
        <DrawerTrigger render={<Button />} data-testid="lab-drawer">
          Open a drawer to throw
        </DrawerTrigger>
        <DrawerContent data-testid="lab-drawer-pop">
          <DrawerHeader>
            <DrawerTitle>Seal check, trailer TR-4492</DrawerTitle>
            <DrawerDescription>
              Fling down to dismiss: it leaves at the speed you let go. Drag part way and stop: it returns from rest.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p className="m-0">Rear door seal 0043 118, intact at Venlo 10 Nov 06:40.</p>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button layout="cell" variant="primary" />}>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
