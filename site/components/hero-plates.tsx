"use client";

import { ArrowRight } from "lucide-react";
import * as React from "react";
import Link from "next/link";
import { Panel, PanelBody, PanelFooter, PanelHeader } from "@/components/keyline/ui/panel";
import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented";
import { Stat } from "@/components/keyline/ui/stat";
import { RadioGroup, RadioGroupItem } from "@/components/keyline/ui/radio-group";
import { Button } from "@/components/keyline/ui/button";
import { Toolbar, ToolbarButton, ToolbarToggle } from "@/components/keyline/ui/toolbar";
import {
  TableFrame,
  TableScroll,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Status,
} from "@/components/keyline/ui/table";
import { Item, ItemActions, ItemContent, ItemList, ItemMedia } from "@/components/keyline/ui/item";
import { Switch } from "@/components/keyline/ui/switch";

/* Sheet 1's plates: a few components at a time, joined in one frame, set on the land like a specimen in a
   printer's book. Synthetic data from the sheet's own world (a surveyed hill, a field guide in press). */

/* Plate 1 · a survey panel: header cells, a segmented control, three stats on shared seams */
const SEASONS = {
  autumn: { rain: 412, rainWas: 381, held: 64, dams: 3 },
  winter: { rain: 538, rainWas: 412, held: 81, dams: 4 },
};
function Survey() {
  const [s, setS] = React.useState<keyof typeof SEASONS>("autumn");
  const d = SEASONS[s];
  const up = Math.round(((d.rain - d.rainWas) / d.rainWas) * 100);
  return (
    <Panel className="w-full">
      <PanelHeader
        title="North paddock"
        code="KP-07"
        actions={
          <Segmented
            size="compact"
            aria-label="Season"
            value={s}
            onValueChange={(v) => setS(v as keyof typeof SEASONS)}
          >
            <SegmentedItem value="autumn">Autumn</SegmentedItem>
            <SegmentedItem value="winter">Winter</SegmentedItem>
          </Segmented>
        }
      />
      <PanelBody flush>
        <div className="@container">
          <div className="grid divide-y divide-kl-line @md:grid-cols-3 @md:divide-x @md:divide-y-0">
            <Stat
              label="Rainfall"
              value={d.rain}
              unit="MM"
              delta={{ value: `${up}%`, direction: "up", tone: "good", label: `up ${up}% on the season before` }}
            />
            <Stat
              label="Held on the keyline"
              value={d.held}
              unit="%"
              meter={{ value: d.held, label: "Water held on the keyline" }}
            />
            <Stat label="Dams full" value={`${d.dams} of 4`} />
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}

/* Plate 2 · a proof: radio cells inside the frame, a status cell and the commitment on the footer seam */
const STOCK = [
  { value: "uncoated", label: "Uncoated 120 gsm", description: "Soft, takes a pencil", price: 0.18 },
  { value: "silk", label: "Silk 150 gsm", description: "Holds the finest contour", price: 0.24 },
  { value: "board", label: "Board 300 gsm", description: "For the cover", price: 0.61 },
];
function Proof() {
  const [stock, setStock] = React.useState("silk");
  const [approved, setApproved] = React.useState<string | null>(null);
  const chosen = STOCK.find((p) => p.value === stock)!;
  return (
    <Panel className="w-full">
      <PanelHeader title="Paper for the field guide" code="J-2041" />
      <RadioGroup
        layout="cell"
        aria-label="Paper stock"
        value={stock}
        onValueChange={(v) => {
          setStock(v);
          setApproved(null);
        }}
      >
        {STOCK.map((p) => (
          <RadioGroupItem
            key={p.value}
            value={p.value}
            label={p.label}
            description={p.description}
            meta={`$${p.price.toFixed(2)}`}
          />
        ))}
      </RadioGroup>
      <PanelFooter>
        <span role="status" className="flex flex-1 items-center px-3 text-[13px] text-kl-ink-2">
          {approved === stock ? (
            `Approved on ${(chosen.label.split(" ")[0] ?? "").toLowerCase()}.`
          ) : (
            <>
              2,000 copies: <span className="ms-1 tabular-nums">${(2000 * chosen.price).toLocaleString("en-US")}</span>
            </>
          )}
        </span>
        <Button layout="cell" variant="primary" disabled={approved === stock} onClick={() => setApproved(stock)}>
          Approve proof
        </Button>
      </PanelFooter>
    </Panel>
  );
}

/* Plate 3 · a press run: a cell toolbar over a table, one frame, one seam between them */
type Run = { id: string; title: string; copies: number; status: "normal" | "attention" | "waiting"; label: string };
const RUNS: Run[] = [
  { id: "J-2041", title: "Field guide", copies: 2000, status: "waiting", label: "On press" },
  { id: "J-2038", title: "Trail maps", copies: 5000, status: "attention", label: "Late" },
  { id: "J-2032", title: "Survey sheets", copies: 400, status: "normal", label: "Delivered" },
];
function PressRuns() {
  const [late, setLate] = React.useState(false);
  const rows = late ? RUNS.filter((r) => r.status === "attention") : RUNS;
  return (
    <TableFrame aria-label="Press runs" className="w-full">
      <Toolbar layout="cell" overflow="menu" aria-label="Run actions">
        <ToolbarButton primary>New run</ToolbarButton>
        <ToolbarButton>Export</ToolbarButton>
        <ToolbarToggle pressed={late} onPressedChange={setLate}>
          Late only
        </ToolbarToggle>
      </Toolbar>
      <TableScroll>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Job</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Copies</TableHead>
              <TableHead>Status</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="font-kl-mono text-[13px] text-kl-ink-2">{r.id}</span>
                </TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>
                  <span className="tabular-nums">{r.copies.toLocaleString("en-US")}</span>
                </TableCell>
                <TableCell>
                  <Status kind={r.status}>{r.label}</Status>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </TableFrame>
  );
}

/* Plate 4 · a settings list: rows of items, each with its switch in the end cell */
const ALERTS = [
  { id: "rain", code: "RAIN", title: "Heavy rain", desc: "More than 20 mm in a day on the north paddock." },
  { id: "dam", code: "DAM", title: "A dam is full", desc: "Before it spills onto the lower track." },
  { id: "track", code: "TRK", title: "Track washed out", desc: "When a ranger marks it closed." },
];
function Alerts() {
  const [on, setOn] = React.useState<Record<string, boolean>>({ rain: true, dam: true, track: false });
  return (
    <ItemList aria-label="Tell me when" className="w-full">
      {ALERTS.map((a) => (
        <Item key={a.id}>
          <ItemMedia>{a.code}</ItemMedia>
          <ItemContent title={<span id={`hero-alert-${a.id}`}>{a.title}</span>} description={a.desc} />
          <ItemActions>
            <Switch
              aria-labelledby={`hero-alert-${a.id}`}
              checked={on[a.id]}
              onCheckedChange={(v) => setOn((s) => ({ ...s, [a.id]: v }))}
            />
          </ItemActions>
        </Item>
      ))}
    </ItemList>
  );
}

const doc = (slug: string) => `/docs/components/${slug}`;
type Plate = { name: string; parts: { label: string; href: string }[]; render: () => React.ReactNode };
const PLATES: [Plate, ...Plate[]] = [
  {
    name: "Survey",
    parts: [
      { label: "Panel", href: doc("panel") },
      { label: "Segmented", href: doc("segmented") },
      { label: "Stat", href: doc("stat") },
    ],
    render: () => <Survey />,
  },
  {
    name: "Proof",
    parts: [
      { label: "Panel", href: doc("panel") },
      { label: "Radio group", href: doc("radio-group") },
      { label: "Button", href: doc("button") },
    ],
    render: () => <Proof />,
  },
  {
    name: "Press runs",
    parts: [
      { label: "Toolbar", href: doc("toolbar") },
      { label: "Table", href: doc("table") },
      { label: "Status", href: doc("status") },
    ],
    render: () => <PressRuns />,
  },
  {
    name: "Alerts",
    parts: [
      { label: "Item", href: doc("item") },
      { label: "Switch", href: doc("switch") },
    ],
    render: () => <Alerts />,
  },
];

/** The hero: one plate on the land at a time, and a quiet line under it to turn to the next. Plates sit on
 * the stage's floor, so the line never moves and Next stays under the pointer. `onTurn` fires on
 * every turn (the title block's mark absorbs it). */
export function HeroPlates({ onTurn }: { onTurn?: () => void }) {
  const [i, setI] = React.useState(0);
  const plate = PLATES[i] ?? PLATES[0]; // i wraps modulo PLATES.length, so the fallback is never taken
  // a plate keeps the height it opened at: it stands on the stage's floor, so if a filter shortened it, its top
  // (and the control just pressed) would drop away from the pointer. The frame keeps its room instead.
  const plateRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const frame = plateRef.current?.firstElementChild as HTMLElement | null;
    if (!frame) return;
    frame.style.minHeight = "";
    frame.style.minHeight = `${frame.offsetHeight}px`;
  }, [i]);
  const go = (n: number) => {
    setI((n + PLATES.length) % PLATES.length);
    onTurn?.();
  };
  return (
    <div className="s-plates" data-testid="specimen">
      <div className="s-plate-stage grid min-h-[var(--s-plate-h,300px)] content-start">
        <div className="s-plate" ref={plateRef} key={plate.name} data-testid="plate" data-plate={plate.name}>
          {plate.render()}
        </div>
      </div>
      <nav className="s-pager" aria-label="Plates">
        <span className="-ms-2 flex">
          {PLATES.map((p, n) => (
            <button
              key={p.name}
              type="button"
              className="s-tick"
              aria-label={`Plate ${n + 1}: ${p.name}`}
              aria-current={n === i ? "true" : undefined}
              onClick={() => go(n)}
            >
              <i />
            </button>
          ))}
        </span>
        <button type="button" className="s-pager-next" onClick={() => go(i + 1)} data-testid="plate-next">
          <span>Next</span>
          <ArrowRight size={12} aria-hidden="true" />
        </button>
        <span className="s-pager-cap" aria-live="polite">
          <span className="me-2.5 font-kl-mono text-[12px]">
            {String(i + 1).padStart(2, "0")}/{String(PLATES.length).padStart(2, "0")}
          </span>
          {plate.parts.map((p, n) => (
            <React.Fragment key={p.label}>
              {n > 0 ? <span aria-hidden="true"> · </span> : null}
              <Link href={p.href}>{p.label}</Link>
            </React.Fragment>
          ))}
        </span>
      </nav>
    </div>
  );
}
