"use client";

import * as React from "react";

import { Button } from "../../ui/button";
import {
  Menu,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuGroup,
  MenuGroupLabel,
  MenuSubmenuRoot,
  MenuSubmenuTrigger,
  MenuPopup,
} from "../../ui/menu";
import {
  Toolbar,
  ToolbarButton,
  ToolbarToggle,
  ToolbarToggleGroup,
  ToolbarMenuTrigger,
  ToolbarMenuContent,
  ToolbarLink,
} from "../../ui/toolbar";
import {
  Field,
  FieldLabel,
  FieldFrame,
  FieldControl,
  FieldAffix,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldGroupPart,
  FieldGroupJoin,
  FieldGroupError,
} from "../../ui/field";
import { Multiselect, type MultiselectOption } from "../../ui/multiselect";
import { DateRangePicker, formatRange, type DateRange } from "../../ui/date-range";
import {
  TableFrame,
  TableViews,
  TableToolbar,
  TableSearch,
  FilterToken,
  TableBulkBar,
  TableScroll,
  Table,
  TableHead,
  TableBody,
  TableRow,
  useRowMotion,
  TableSortHeader,
  TableCell,
  TableIndexCell,
  TableExpandCell,
  TableDetail,
  useDetailPresence,
  TableState,
  TableLoadingRows,
  TablePagination,
  nextSortList,
  sortLevel,
  compareBy,
  type SortList,
  type SortDirection,
} from "../../ui/table";
import { Status } from "../../ui/status";
import { Kbd } from "../../ui/kbd";
import { Nav, NavIdentity, type NavItem } from "../../ui/nav";
import { AppShell } from "../../ui/app-shell";
import { Breadcrumb } from "../../ui/breadcrumb";
import { Notice } from "../../ui/notice";
import { AlertDialog, AlertDialogContent } from "../../ui/dialog";
import {
  Inspector,
  InspectorHeader,
  InspectorFacts,
  InspectorBody,
  InspectorSection,
  InspectorRow,
  InspectorActions,
} from "../../ui/inspector";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandFooter,
} from "../../ui/command";
import { ToastProvider, ToastDock, useToast } from "../../ui/toast";
import { useSelection, patchWithUndo, removeWithUndo } from "../../lib/selection";
import {
  CARRIERS,
  LEGS,
  STATUS,
  TODAY,
  fmtDay,
  fmtEur,
  fmtKg,
  isUnavailable,
  makeShipments,
  searchCarriers,
  type Shipment,
  type StatusKey,
} from "./shipments-data";

const PAGE = 12;
/* Columns after the index, expand and ID cells. Each sorts; each but ID can be hidden from the View menu.
   `first` is the direction a column starts in: the latest ETA, heaviest and costliest first would hide the
   shipments that need action, so every column starts ascending except weight and value. */
type ColKey = "dest" | "carrier" | "status" | "eta" | "kg" | "eur";
type SortKey = "id" | ColKey;
const COLUMNS: { key: ColKey; label: string; unit?: string; align?: "end"; first?: SortDirection }[] = [
  { key: "dest", label: "Destination" },
  { key: "carrier", label: "Carrier" },
  { key: "status", label: "Status" },
  { key: "eta", label: "ETA", align: "end" },
  { key: "kg", label: "Weight", unit: "kg", align: "end", first: "descending" },
  { key: "eur", label: "Value", unit: "€", align: "end", first: "descending" },
];
/* status sorts by urgency, not by label: what needs action first */
const STATUS_RANK: Record<StatusKey, number> = { none: 0, delayed: 1, docs: 2, booked: 3, transit: 4, delivered: 5 };
const sortValue = (s: Shipment, key: SortKey) =>
  key === "status" ? STATUS_RANK[s.status] : key === "eur" ? s.eur || null : s[key];
const DENSITIES = [
  { value: "12", label: "12 rows" },
  { value: "24", label: "24 rows" },
  { value: "48", label: "48 rows" },
];
const VIEWS = [
  { value: "all", label: "All", test: () => true },
  { value: "active", label: "Active", test: (s: Shipment) => s.status !== "delivered" },
  {
    value: "attention",
    label: "Needs attention",
    test: (s: Shipment) => s.status === "delayed" || s.status === "docs" || s.status === "none",
  },
  { value: "delivered", label: "Delivered", test: (s: Shipment) => s.status === "delivered" },
];
const FLAG_STATUS: StatusKey[] = ["transit", "docs", "delayed", "booked"];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const plural = (n: number, one: string, many = one + "s") => `${n.toLocaleString("en-GB")} ${n === 1 ? one : many}`;

type Load = "ready" | "loading" | "error";
type Signal = "idle" | "pending" | "done" | "failed";

/* --------------------------------------------------------------------------------------------- *
 * App navigation: location is cobalt and STRETCHES vertically between items.
 * --------------------------------------------------------------------------------------------- */
/* 16px glyphs in the nav's key cells: one stroke weight, square caps, like the shell's toggle glyph */
const Glyph = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="square"
    aria-hidden
  >
    <path d={d} />
  </svg>
);
const NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Operations",
    items: [
      // a parcel; a truck; a dock door; a sheet with lines
      {
        value: "shipments",
        label: "Shipments",
        count: 64,
        icon: <Glyph d="M2.5 4.5 8 2l5.5 2.5v7L8 14l-5.5-2.5zM2.5 4.5 8 7l5.5-2.5M8 7v7" />,
      },
      {
        value: "carriers",
        label: "Carriers",
        count: 9,
        icon: (
          <Glyph d="M1.5 4h8v7h-8zM9.5 6.5h3l2 2.5v2h-5M4 13.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 13.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        ),
      },
      { value: "docks", label: "Dock schedule", icon: <Glyph d="M2 14V5l6-3 6 3v9M4.5 14V8h7v6M4.5 10.5h7" /> },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        value: "invoices",
        label: "Invoices",
        count: 3,
        icon: <Glyph d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3M6 8h4.5M6 10.5h4.5" />,
      },
    ],
  },
];

/* --------------------------------------------------------------------------------------------- *
 * One row + its detail. The row's index cell spans the detail while the detail is mounted.
 * --------------------------------------------------------------------------------------------- */
function ShipmentRow({
  s,
  code,
  cols,
  selected,
  expanded,
  inspecting,
  onSelect,
  onExpand,
  onInspect,
}: {
  s: Shipment;
  code: string;
  cols: Set<ColKey>;
  selected: boolean;
  expanded: boolean;
  inspecting: boolean;
  onSelect: (v: boolean) => void;
  onExpand: () => void;
  onInspect: (opener: HTMLElement | null) => void;
}) {
  const presence = useDetailPresence(expanded);
  const openRef = React.useRef<HTMLButtonElement>(null);
  const st = STATUS[s.status];
  const late = s.status !== "delivered" && s.eta < TODAY;
  return (
    <>
      <TableRow
        selected={selected}
        expanded={expanded}
        data-inspecting={inspecting || undefined}
        onClick={() => onInspect(openRef.current)}
      >
        <TableIndexCell
          rowSpan={presence.mounted ? 2 : undefined}
          checked={selected}
          onCheckedChange={onSelect}
          code={code}
          label={`Select ${s.id}`}
        />
        <TableExpandCell
          expanded={expanded}
          onToggle={onExpand}
          label={`${expanded ? "Hide" : "Show"} legs for ${s.id}`}
        />
        <TableCell className="kl-sx-id">
          <button
            ref={openRef}
            type="button"
            className="kl-sx-open"
            aria-pressed={inspecting}
            onClick={(e) => (e.stopPropagation(), onInspect(e.currentTarget))}
          >
            {s.id}
          </button>
        </TableCell>
        {cols.has("dest") ? <TableCell className="kl-sx-dest">{s.dest}</TableCell> : null}
        {cols.has("carrier") ? <TableCell>{s.carrier}</TableCell> : null}
        {cols.has("status") ? (
          <TableCell>
            <Status kind={st.kind}>{st.label}</Status>
          </TableCell>
        ) : null}
        {cols.has("eta") ? (
          <TableCell align="end" data-late={late || undefined}>
            {fmtDay(s.eta)}
          </TableCell>
        ) : null}
        {cols.has("kg") ? <TableCell align="end">{fmtKg(s.kg)}</TableCell> : null}
        {cols.has("eur") ? <TableCell align="end">{s.eur ? fmtEur(s.eur) : "—"}</TableCell> : null}
      </TableRow>
      <TableDetail open={expanded} presence={presence} colSpan={cols.size + 2} id={`legs-${s.id}`}>
        <ol className="kl-sx-legs" aria-label={`Legs for ${s.id}`}>
          {LEGS.map((l) => (
            <li key={l.at} data-status={l.state}>
              <span className="kl-code">{l.at}</span>
              <b>{l.place}</b>
              <span>{l.what}</span>
            </li>
          ))}
        </ol>
      </TableDetail>
    </>
  );
}

/* --------------------------------------------------------------------------------------------- *
 * Inspector with validation and a save signal.
 * --------------------------------------------------------------------------------------------- */
type Draft = { reference: string; kg: string; l: string; w: string; h: string };
function validate(d: Draft) {
  const e: Partial<Record<keyof Draft, string>> = {};
  if (!d.reference.trim()) e.reference = "Enter the customer's PO reference.";
  else if (!/^PO-\d{5}-[A-Z]{3}$/.test(d.reference.trim()))
    e.reference = "Use the format PO-88201-LYO (5 digits, 3 letters).";
  const kg = Number(d.kg.replace(/,/g, ""));
  if (d.kg.trim() === "" || !Number.isFinite(kg) || kg <= 0) e.kg = "Enter a weight above 0 kg.";
  else if (kg > 24000) e.kg = "Over 24,000 kg needs two trucks. Split the shipment first.";
  for (const k of ["l", "w", "h"] as const) {
    const v = Number(d[k]);
    if (!Number.isFinite(v) || v <= 0) e[k] = "Each side must be above 0 cm.";
    else if (k === "h" && v > 270) e.h = "Height over 270 cm doesn't fit a standard trailer.";
  }
  return e;
}

function ShipmentInspector({
  s,
  code,
  state,
  onClose,
  onSave,
  onRestore,
  onShow,
}: {
  s: Shipment;
  code: string;
  state: "live" | "hidden" | "cancelled";
  onClose: () => void;
  onSave: (patch: Partial<Shipment>) => Promise<void>;
  onRestore: () => void;
  onShow: () => void;
}) {
  const initial = React.useCallback(
    (): Draft => ({
      reference: s.reference,
      kg: s.kg == null ? "" : String(s.kg),
      l: "120",
      w: "80",
      h: s.pallets > 10 ? "240" : "160",
    }),
    [s],
  );
  const [draft, setDraft] = React.useState<Draft>(initial);
  const [touched, setTouched] = React.useState<Partial<Record<keyof Draft, boolean>>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [signal, setSignal] = React.useState<Signal>("idle");
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    setDraft(initial());
    setTouched({});
    setSubmitted(false);
    setSignal("idle");
  }, [s.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const errors = validate(draft);
  const show = (k: keyof Draft) => (submitted || touched[k]) && errors[k];
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial());
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((d) => ({ ...d, [k]: e.target.value }));
    if (signal !== "pending") setSignal("idle");
  };
  const blur = (k: keyof Draft) => () => setTouched((t) => ({ ...t, [k]: true }));
  const st = STATUS[s.status];
  const dimErr = show("l") || show("w") || show("h");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      setSignal("failed");
      const first = (["reference", "kg", "l", "w", "h"] as const).find((k) => errors[k]);
      formRef.current?.querySelector<HTMLInputElement>(`[data-insp-field="${first}"]`)?.focus();
      return;
    }
    setSignal("pending");
    await onSave({ reference: draft.reference.trim(), kg: Number(draft.kg.replace(/,/g, "")) });
    setSignal("done");
    setTimeout(() => setSignal((x) => (x === "done" ? "idle" : x)), 900);
  };

  return (
    <Inspector aria-label={`Shipment ${s.id}`} className="kl-sx-insp">
      <InspectorHeader
        code={code}
        title={s.id}
        status={
          <Status kind={state === "cancelled" ? "attention" : st.kind}>
            {state === "cancelled" ? "Cancelled" : st.label}
          </Status>
        }
        onClose={onClose}
      />
      <Notice
        layout="cell"
        open={state !== "live"}
        tone={state === "cancelled" ? "attention" : "neutral"}
        live
        title={state === "cancelled" ? "This shipment was cancelled." : "Hidden by the current filters."}
        description={state === "cancelled" ? "Edits are off until it's restored." : "You can still edit it."}
        actions={
          <Button layout="cell" onClick={state === "cancelled" ? onRestore : onShow}>
            {state === "cancelled" ? "Restore" : "Show in table"}
          </Button>
        }
      />
      <InspectorFacts
        items={[
          { label: "Destination", value: s.dest },
          { label: "Carrier", value: s.carrier },
          { label: "ETA", value: fmtDay(s.eta) },
          { label: "Value €", value: s.eur ? fmtEur(s.eur) : "—" },
        ]}
      />
      <form ref={formRef} className="kl-sx-insp-form" onSubmit={save} noValidate>
        <fieldset disabled={state === "cancelled" || signal === "pending"} className="kl-sx-fs">
          <InspectorBody>
            <InspectorSection>
              <Field invalid={!!show("reference")} disabled={state === "cancelled"}>
                <FieldLabel>Customer reference</FieldLabel>
                <FieldFrame>
                  <FieldControl
                    data-insp-field="reference"
                    value={draft.reference}
                    onChange={set("reference")}
                    onBlur={blur("reference")}
                    autoComplete="off"
                    spellCheck={false}
                    className="kl-sx-mono"
                  />
                </FieldFrame>
                {show("reference") ? (
                  <FieldError match>{errors.reference}</FieldError>
                ) : (
                  <FieldDescription>Printed on the delivery note.</FieldDescription>
                )}
              </Field>
            </InspectorSection>
            <InspectorSection>
              <Field invalid={!!show("kg")} disabled={state === "cancelled"}>
                <FieldLabel>Gross weight</FieldLabel>
                <FieldFrame>
                  <FieldControl
                    data-insp-field="kg"
                    inputMode="decimal"
                    align="end"
                    value={draft.kg}
                    onChange={set("kg")}
                    onBlur={blur("kg")}
                  />
                  <FieldAffix className="kl-code">kg</FieldAffix>
                </FieldFrame>
                {show("kg") ? (
                  <FieldError match>{errors.kg}</FieldError>
                ) : (
                  <FieldDescription>{plural(s.pallets, "pallet")} · max 24,000 kg per truck.</FieldDescription>
                )}
              </Field>
            </InspectorSection>
            <InspectorSection>
              <FieldGroup
                legend={
                  <>
                    Pallet size <span className="kl-code">cm</span>
                  </>
                }
                invalid={!!dimErr}
              >
                <FieldGroupPart
                  label="L"
                  invalid={!!show("l")}
                  inputProps={{
                    value: draft.l,
                    onChange: set("l"),
                    onBlur: blur("l"),
                    inputMode: "numeric",
                    ...({ "data-insp-field": "l" } as object),
                  }}
                />
                <FieldGroupJoin />
                <FieldGroupPart
                  label="W"
                  invalid={!!show("w")}
                  inputProps={{
                    value: draft.w,
                    onChange: set("w"),
                    onBlur: blur("w"),
                    inputMode: "numeric",
                    ...({ "data-insp-field": "w" } as object),
                  }}
                />
                <FieldGroupJoin />
                <FieldGroupPart
                  label="H"
                  invalid={!!show("h")}
                  inputProps={{
                    value: draft.h,
                    onChange: set("h"),
                    onBlur: blur("h"),
                    inputMode: "numeric",
                    ...({ "data-insp-field": "h" } as object),
                  }}
                />
              </FieldGroup>
              <FieldGroupError>{dimErr || null}</FieldGroupError>
            </InspectorSection>
            <InspectorRow>
              <InspectorSection>
                <span className="kl-code">Pallets</span>
                <div className="kl-sx-big">{s.pallets}</div>
              </InspectorSection>
              <InspectorSection>
                <span className="kl-code">Legs</span>
                <div className="kl-sx-big">{LEGS.length}</div>
              </InspectorSection>
            </InspectorRow>
          </InspectorBody>
        </fieldset>
        <InspectorActions>
          <Button
            layout="cell"
            disabled={!dirty || signal === "pending"}
            onClick={() => (setDraft(initial()), setTouched({}), setSubmitted(false), setSignal("idle"))}
          >
            Discard
          </Button>
          <Button
            type="submit"
            layout="cell"
            variant="primary"
            signal={signal}
            disabled={state === "cancelled" || (!dirty && signal !== "done")}
          >
            {signal === "pending" ? "Saving…" : signal === "done" ? "Saved" : "Save changes"}
          </Button>
        </InspectorActions>
      </form>
    </Inspector>
  );
}

/* --------------------------------------------------------------------------------------------- *
 * The application.
 * --------------------------------------------------------------------------------------------- */
export type ShipmentsProps = {
  initialLoad?: Load;
  portalContainer?: React.RefObject<HTMLElement | null>;
  className?: string;
};

function ShipmentsApp({ initialLoad = "ready", portalContainer, className }: ShipmentsProps) {
  const notify = useToast();
  const [rows, setRows] = React.useState<Shipment[]>(() => makeShipments(64));
  const [load, setLoad] = React.useState<Load>(initialLoad);
  const failNext = React.useRef(false);
  const [nav, setNav] = React.useState("shipments");
  const [view, setView] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [carriers, setCarriers] = React.useState<MultiselectOption[]>([]);
  const [flags, setFlags] = React.useState<string[]>([]);
  const [eta, setEta] = React.useState<DateRange | null>(null);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [inspect, setInspect] = React.useState<string | null>(null);
  // the row's open button: the aside's sheet returns focus to it on close
  const opener = React.useRef<HTMLElement | null>(null);
  const [cancelled, setCancelled] = React.useState<Map<string, { row: Shipment; index: number }>>(new Map());
  const [page, setPage] = React.useState(0);
  const [sort, setSort] = React.useState<SortList<SortKey>>([]);
  const [cols, setCols] = React.useState<Set<ColKey>>(() => new Set(COLUMNS.map((c) => c.key)));
  const [pageSize, setPageSize] = React.useState(PAGE);
  const COLS = cols.size + 3;
  const [assignSig, setAssignSig] = React.useState<Signal>("idle");
  const [confirm, setConfirm] = React.useState(false);
  const [cmd, setCmd] = React.useState(false);
  const [cmdQ, setCmdQ] = React.useState("");
  // When a menu or command opens the confirmation, the closing surface must not pull focus back to its trigger.
  const handoff = React.useRef(false);
  const keepFocus = () => {
    const go = !handoff.current;
    handoff.current = false;
    return go;
  };
  const askCancel = () => {
    handoff.current = true;
    setConfirm(true);
  };
  const container = portalContainer;
  // cancelled rows close up where they were, and Undo opens them back in the same place
  const rowMotion = useRowMotion();

  /* ---- filtering: every control affects results ---- */
  const viewTest = VIEWS.find((v) => v.value === view)!.test;
  const base = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const cs = new Set(carriers.map((c) => c.value));
    return rows.filter(
      (s) =>
        (!needle || [s.id, s.dest, s.carrier, s.reference].some((t) => t.toLowerCase().includes(needle))) &&
        (!cs.size || cs.has(s.carrier)) &&
        (!eta || (s.eta >= eta.from && s.eta <= eta.to)),
    );
  }, [rows, q, carriers, eta]);
  const afterView = base.filter(viewTest);
  const unsorted = flags.length ? afterView.filter((s) => flags.includes(s.status)) : afterView;
  // a stable sort over the filtered rows, before paging: page 2 continues page 1's order
  // several levels: each later column breaks the ties the earlier ones leave
  const filtered = React.useMemo(
    () => (sort.length ? [...unsorted].sort(compareBy(sort, sortValue, "en-GB")) : unsorted),
    [unsorted, sort],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pg = Math.min(page, pages - 1);
  const pageRows = filtered.slice(pg * pageSize, pg * pageSize + pageSize);
  React.useEffect(() => setPage(0), [view, q, carriers, flags, eta, sort, pageSize]);
  // a plain press sorts by that column alone; Shift + press adds it as a further level (or flips, then drops it)
  const sortHeader = (key: SortKey, label: React.ReactNode, opts: { align?: "end"; first?: SortDirection } = {}) => {
    const level = sortLevel(sort, key);
    return (
      <TableSortHeader
        key={key}
        align={opts.align}
        sort={level?.direction ?? null}
        priority={level?.priority}
        levels={sort.length}
        onSort={({ additive }) => setSort((x) => nextSortList(x, key, { first: opts.first, additive }))}
      >
        {label}
      </TableSortHeader>
    );
  };
  const colLabel = (key: SortKey) => (key === "id" ? "ID" : COLUMNS.find((c) => c.key === key)!.label);
  const colFirst = (key: SortKey) => (key === "id" ? undefined : COLUMNS.find((c) => c.key === key)!.first);
  const sortable: SortKey[] = ["id", ...COLUMNS.map((c) => c.key)];

  /* ---- selection scope (ids survive filtering and paging; the scope says what is hidden) ---- */
  const filteredIds = React.useMemo(() => new Set(filtered.map((s) => s.id)), [filtered]);
  const matchingIdList = React.useMemo(() => filtered.map((s) => s.id), [filtered]);
  const pageIdList = React.useMemo(() => pageRows.map((s) => s.id), [pageRows]);
  const {
    selected,
    scope,
    toggle,
    setPage: selectPage,
    selectAllMatching,
    keepVisibleOnly,
    clear: clearSel,
  } = useSelection(matchingIdList, pageIdList);
  const nSel = scope.count;
  const hidden = scope.hidden;
  const pageSel = pageRows.filter((s) => selected.has(s.id)).length;
  const allMatching = scope.allMatching;

  // recovery: a failed bulk signal clears as soon as the working set changes
  React.useEffect(() => setAssignSig((x) => (x === "failed" ? "idle" : x)), [selected]);

  /* ---- data load (loading / error / retry) ---- */
  const reload = React.useCallback(async () => {
    setLoad("loading");
    await wait(900);
    if (failNext.current) {
      failNext.current = false;
      setLoad("error");
    } else setLoad("ready");
  }, []);
  React.useEffect(() => {
    if (initialLoad === "loading") void reload();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- bulk: assign carrier (pending → done/failed; Undo restores previous carriers exactly) ---- */
  const assign = async (carrier: string) => {
    const ids = [...selected];
    if (!ids.length) return;
    setAssignSig("pending");
    await wait(700);
    if (carrier === "Rhenus Road" && ids.length > 5) {
      setAssignSig("failed");
      notify({
        title: `Rhenus Road can take 5 shipments this week; ${ids.length} selected. Nothing was changed.`,
        type: "failed",
        timeout: 0,
      });
      return;
    }
    const { next, undo, count } = patchWithUndo(rows, selected, (s) => ({ ...s, carrier }));
    setRows(next);
    setAssignSig("done");
    setTimeout(() => setAssignSig((x) => (x === "done" ? "idle" : x)), 900);
    notify({
      title: `${carrier} assigned to ${plural(count, "shipment")}.`,
      action: {
        label: "Undo",
        onClick: () => {
          setRows(undo);
          notify({
            title: `Restored the previous carrier on ${plural(count, "shipment")}.`,
            type: "info",
            timeout: 3000,
          });
        },
      },
    });
  };

  /* ---- bulk: reschedule ---- */
  const reschedule = (days: number) => {
    if (!selected.size) return;
    const { next, undo, count } = patchWithUndo(rows, selected, (s) => ({ ...s, eta: addDays(s.eta, days) }));
    setRows(next);
    notify({
      title: `Moved ${plural(count, "ETA")} ${days < 0 ? "earlier" : "later"} by ${plural(Math.abs(days), "day")}.`,
      action: { label: "Undo", onClick: () => setRows(undo) },
    });
  };

  /* ---- bulk: cancel (confirm → remove → Undo reinserts at the original positions) ---- */
  const cancelSelected = () => {
    const { next, removed: list } = removeWithUndo(rows, selected);
    const removed = new Map(list.map((r) => [r.row.id, r]));
    rowMotion.arm();
    setRows(next);
    setCancelled((c) => new Map([...c, ...removed]));
    clearSel();
    notify({
      title: `Cancelled ${plural(removed.size, "shipment")}.`,
      timeout: 8000,
      action: { label: "Undo", onClick: () => restore([...removed.keys()]) },
    });
  };
  const restore = (ids: string[]) => {
    rowMotion.arm();
    setCancelled((c) => {
      const back = ids.map((id) => c.get(id)).filter(Boolean) as { row: Shipment; index: number }[];
      setRows((rs) => {
        const out = rs.filter((s) => !ids.includes(s.id));
        back
          .sort((a, b) => a.index - b.index)
          .forEach(({ row, index }) => out.splice(Math.min(index, out.length), 0, row));
        return out;
      });
      const n = new Map(c);
      ids.forEach((id) => n.delete(id));
      return n;
    });
  };

  /* ---- inspector ---- */
  const inspected = inspect ? (rows.find((s) => s.id === inspect) ?? cancelled.get(inspect)?.row) : undefined;
  const inspState: "live" | "hidden" | "cancelled" = !inspect
    ? "live"
    : cancelled.has(inspect)
      ? "cancelled"
      : filteredIds.has(inspect)
        ? "live"
        : "hidden";
  const inspIndex = inspected ? filtered.findIndex((s) => s.id === inspected.id) : -1;
  const inspCode = inspIndex >= 0 ? `R${inspIndex + 1}/${filtered.length}` : "R—";
  const saveInspector = async (patch: Partial<Shipment>) => {
    await wait(650);
    setRows((rs) => rs.map((s) => (s.id === inspect ? { ...s, ...patch } : s)));
  };
  const clearFilters = () => {
    setQ("");
    setCarriers([]);
    setFlags([]);
    setEta(null);
    setView("all");
  };
  const showInTable = () => {
    clearFilters();
    const i = rows.findIndex((s) => s.id === inspect);
    setTimeout(() => setPage(Math.floor(i / pageSize)), 0);
  };

  /* ---- ⌘K ---- */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const run = (fn: () => void) => () => {
    setCmd(false);
    setCmdQ("");
    fn();
  };

  const activeFilters =
    (q ? 1 : 0) + (carriers.length ? 1 : 0) + (flags.length ? 1 : 0) + (eta ? 1 : 0) + (view !== "all" ? 1 : 0);
  const viewCounts = VIEWS.map((v) => ({
    value: v.value,
    label: v.label,
    count: load === "ready" ? base.filter(v.test).length : "–",
  }));
  const alerts = rows.filter((s) => s.status === "delayed" || s.status === "docs");
  const flagCount = (k: StatusKey) => afterView.filter((s) => s.status === k).length;
  const headerChecked = pageRows.length > 0 && pageSel === pageRows.length;

  return (
    <AppShell
      className={["kl-sx", className].filter(Boolean).join(" ")}
      data-inspector={inspected ? "" : undefined}
      narrowAt={760}
      collapse="rail"
      asideInlineAt={1180}
      navSize="13rem"
      asideSize="22.5rem"
      container={container}
      navLabel="Navigation"
      nav={
        <Nav
          label="Main"
          layout="cell"
          header={<NavIdentity mark={<span className="kl-sx-mark" />} title="Freightdesk" meta="RTM · Rotterdam" />}
          footer={<NavIdentity mark="MJ" title="Mila Jansen" meta="Dispatch" />}
          value={nav}
          onValueChange={setNav}
          groups={NAV.map((g) => ({
            ...g,
            items: g.items.map((n) => ({
              ...n,
              href: `#${n.value}`,
              count: n.value === "shipments" ? rows.length : n.count,
            })),
          }))}
        />
      }
      header={
        <Breadcrumb
          layout="cell"
          items={[
            { label: "Freightdesk", href: "#shipments" },
            { label: "Shipments", href: "#shipments" },
            { label: inspected ? inspected.id : VIEWS.find((v) => v.value === view)!.label },
          ]}
        />
      }
      actions={
        // the page's own commands: one Tab stop beside the crumbs; when the header narrows they move into
        // More (the crumbs fold first, down to their minimum)
        <Toolbar layout="cell" overflow="menu" aria-label="Page actions">
          <Menu>
            <ToolbarMenuTrigger affix={<span className="kl-code">{alerts.length}</span>}>Alerts</ToolbarMenuTrigger>
            <ToolbarMenuContent container={container} align="end">
              <MenuGroup>
                <MenuGroupLabel>
                  {alerts.length ? `${plural(alerts.length, "shipment")} need attention` : "Nothing needs attention"}
                </MenuGroupLabel>
                {alerts.slice(0, 6).map((s) => (
                  <MenuItem
                    key={s.id}
                    code={s.id}
                    onClick={(e) => {
                      // the sheet returns focus to whichever trigger opened this menu (Alerts, or More)
                      opener.current = e.currentTarget.ownerDocument.querySelector<HTMLElement>(
                        '[data-slot="app-shell-actions"] [aria-expanded="true"]',
                      );
                      setInspect(s.id);
                    }}
                  >
                    {s.dest} · {STATUS[s.status].label}
                  </MenuItem>
                ))}
              </MenuGroup>
            </ToolbarMenuContent>
          </Menu>
          <ToolbarButton
            onClick={() =>
              notify({
                title: `Export of ${plural(afterView.length, "shipment")} started. The file arrives by email.`,
                type: "info",
                timeout: 4000,
              })
            }
          >
            Export
          </ToolbarButton>
          <ToolbarLink href="#help">Help</ToolbarLink>
        </Toolbar>
      }
      asideLabel={inspected ? `Shipment ${inspected.id}` : "Shipment"}
      asideOpen={!!inspected}
      onAsideOpenChange={(o) => !o && setInspect(null)}
      asideFinalFocus={opener}
      aside={
        inspected ? (
          <ShipmentInspector
            s={inspected}
            code={inspCode}
            state={inspState}
            onClose={() => setInspect(null)}
            onSave={saveInspector}
            onRestore={() => restore([inspected.id])}
            onShow={showInTable}
          />
        ) : null
      }
    >
      <TableFrame aria-label="Shipments" className="kl-sx-table" aria-busy={load === "loading" || undefined}>
        <TableViews views={viewCounts} value={view} onValueChange={setView} label="Shipment views">
          <Toolbar layout="cell" overflow="menu" aria-label="Table">
            <Menu>
              <ToolbarMenuTrigger
                affix={
                  <span className="kl-code">
                    {cols.size + 1}/{COLUMNS.length + 1}
                  </span>
                }
              >
                View
              </ToolbarMenuTrigger>
              <ToolbarMenuContent container={container} align="end">
                <MenuGroup>
                  <MenuGroupLabel>Columns</MenuGroupLabel>
                  <MenuCheckboxItem checked disabled description="Always shown">
                    ID
                  </MenuCheckboxItem>
                  {COLUMNS.map((c) => (
                    <MenuCheckboxItem
                      key={c.key}
                      checked={cols.has(c.key)}
                      onCheckedChange={(on) =>
                        setCols((p) => {
                          const n = new Set(p);
                          if (on) n.add(c.key);
                          else n.delete(c.key);
                          return n;
                        })
                      }
                    >
                      {c.label}
                    </MenuCheckboxItem>
                  ))}
                </MenuGroup>
                <MenuSeparator />
                <MenuGroup>
                  <MenuGroupLabel>Rows per page</MenuGroupLabel>
                  <MenuRadioGroup value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                    {DENSITIES.map((d) => (
                      <MenuRadioItem key={d.value} value={d.value}>
                        {d.label}
                      </MenuRadioItem>
                    ))}
                  </MenuRadioGroup>
                </MenuGroup>
                <MenuSeparator />
                {/* the sort, levels in order: the keyboard route to multi-column sort (headers take Shift + press) */}
                <MenuGroup>
                  <MenuGroupLabel>
                    {sort.length ? `Sorted by ${sort.length === 1 ? "1 column" : `${sort.length} columns`}` : "Sort"}
                  </MenuGroupLabel>
                  {sort.map((lv, i) => (
                    <MenuItem
                      key={lv.key}
                      code={i + 1}
                      closeOnClick={false}
                      description={`${lv.direction === "ascending" ? "Ascending" : "Descending"} · press to reverse`}
                      onClick={() =>
                        setSort((x) =>
                          x.map((y) =>
                            y.key === lv.key
                              ? { ...y, direction: y.direction === "ascending" ? "descending" : "ascending" }
                              : y,
                          ),
                        )
                      }
                    >
                      {colLabel(lv.key)}
                    </MenuItem>
                  ))}
                  {sort.length < sortable.length ? (
                    <MenuSubmenuRoot>
                      <MenuSubmenuTrigger>{sort.length ? "Then by" : "Sort by"}</MenuSubmenuTrigger>
                      <MenuPopup container={container}>
                        {sortable
                          .filter((k) => !sort.some((lv) => lv.key === k))
                          .map((k) => (
                            <MenuItem
                              key={k}
                              onClick={() => setSort((x) => nextSortList(x, k, { first: colFirst(k), additive: true }))}
                            >
                              {colLabel(k)}
                            </MenuItem>
                          ))}
                      </MenuPopup>
                    </MenuSubmenuRoot>
                  ) : null}
                  {sort.length ? (
                    <MenuItem
                      onClick={() => setSort([])}
                      description={`Now by ${sort.map((lv) => `${colLabel(lv.key)} ${lv.direction}`).join(", then ")}`}
                    >
                      Clear sort
                    </MenuItem>
                  ) : null}
                </MenuGroup>
              </ToolbarMenuContent>
            </Menu>
            <ToolbarButton
              onClick={() => setCmd(true)}
              aria-keyshortcuts="Meta+K"
              affix={<span className="kl-code">⌘K</span>}
            >
              Commands
            </ToolbarButton>
          </Toolbar>
        </TableViews>

        <TableToolbar aria-label="Filters">
          <TableSearch
            label="Search shipments"
            placeholder="Search ID, city, carrier or PO"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Multiselect
            className="kl-sx-carriers"
            layout="cell"
            label="Carrier"
            noun={["carrier", "carriers"]}
            placeholder="Carrier"
            value={carriers}
            onValueChange={setCarriers}
            loadOptions={searchCarriers}
            container={container}
          />
          <DateRangePicker
            className="kl-sx-eta"
            layout="cell"
            label="ETA"
            value={eta}
            onValueChange={setEta}
            today={TODAY}
            defaultMonth={TODAY}
            isDateUnavailable={isUnavailable}
            container={container}
            presets={[
              { label: "Next 7 days", range: () => ({ from: TODAY, to: addDays(TODAY, 6) }) },
              { label: "Next 14 days", range: () => ({ from: TODAY, to: addDays(TODAY, 13) }) },
              { label: "This month", range: () => ({ from: new Date(2026, 10, 1), to: new Date(2026, 10, 30) }) },
            ]}
            caption={(r) => (r ? `ETA ${formatRange(r)} · depot closed 17 and 22 Nov` : "Any ETA")}
          />
        </TableToolbar>

        <Toolbar
          layout="cell"
          overflow="menu"
          overflowLabel="More filters"
          overflowTrigger="label"
          aria-label="Status filters"
          className="kl-sx-filters"
        >
          <ToolbarToggleGroup value={flags} onValueChange={setFlags} aria-label="Status">
            {FLAG_STATUS.map((k) => (
              <ToolbarToggle key={k} value={k} affix={load === "ready" ? flagCount(k) : undefined}>
                {STATUS[k].label}
              </ToolbarToggle>
            ))}
          </ToolbarToggleGroup>
          {carriers.length ? (
            <FilterToken
              field="Carrier"
              op="is"
              value={carriers.length === 1 && carriers[0] ? carriers[0].label : `${carriers.length} carriers`}
              onRemove={() => setCarriers([])}
            />
          ) : null}
          {eta ? <FilterToken field="ETA" op="in" value={formatRange(eta)} onRemove={() => setEta(null)} /> : null}
          {q ? <FilterToken field="Text" op="has" value={q} onRemove={() => setQ("")} /> : null}
          {activeFilters ? (
            <ToolbarButton onClick={clearFilters}>
              Clear {activeFilters > 1 ? `all ${activeFilters}` : "filter"}
            </ToolbarButton>
          ) : null}
        </Toolbar>

        <TableBulkBar
          count={nSel}
          scope={
            nSel === 0 ? (
              <span className="kl-sx-muted">Select rows to assign, reschedule or cancel them.</span>
            ) : (
              <>
                <span>
                  {allMatching && filtered.length > pageRows.length
                    ? `All ${filtered.length} matching selected.`
                    : `${plural(nSel, "shipment")} selected.`}
                  {hidden ? ` ${hidden} not in these results.` : ""}
                </span>
                {hidden ? (
                  <button type="button" onClick={keepVisibleOnly}>
                    Keep only the {plural(nSel - hidden, "visible one", "visible ones")}
                  </button>
                ) : null}
                {headerChecked && !allMatching && filtered.length > pageRows.length ? (
                  <button type="button" onClick={selectAllMatching}>
                    Select all {filtered.length} matching
                  </button>
                ) : null}
                <button type="button" onClick={clearSel}>
                  Clear
                </button>
              </>
            )
          }
        >
          <Toolbar layout="cell" overflow="menu" aria-label="Bulk actions">
            <ToolbarButton disabled={!nSel} onClick={() => reschedule(1)}>
              Delay 1 day
            </ToolbarButton>
            <Menu>
              <ToolbarMenuTrigger>Actions</ToolbarMenuTrigger>
              <ToolbarMenuContent align="end" container={container} finalFocus={keepFocus}>
                <MenuItem shortcut="2" disabled={!nSel} onClick={() => reschedule(2)}>
                  Delay 2 days
                </MenuItem>
                <MenuItem shortcut="↩" disabled={!nSel} onClick={() => reschedule(-1)}>
                  Bring forward 1 day
                </MenuItem>
                <MenuItem disabled description="Needs customs documents on every selected shipment">
                  Request customs release
                </MenuItem>
                <MenuSeparator />
                <MenuItem variant="destructive" disabled={!nSel} onClick={askCancel}>
                  Cancel {nSel ? plural(nSel, "shipment") : "shipments"}…
                </MenuItem>
              </ToolbarMenuContent>
            </Menu>
            <Menu>
              <ToolbarMenuTrigger primary signal={assignSig} disabled={!nSel} affix={nSel}>
                Assign carrier
              </ToolbarMenuTrigger>
              <ToolbarMenuContent align="end" container={container}>
                <MenuGroup>
                  <MenuGroupLabel>Assign to {plural(nSel, "shipment")}</MenuGroupLabel>
                  {CARRIERS.map((c) => (
                    <MenuItem
                      key={c.value}
                      disabled={c.disabled}
                      description={c.description ?? (c.value === "Rhenus Road" ? "Capacity 5 this week" : undefined)}
                      onClick={() => void assign(c.value)}
                    >
                      {c.label}
                    </MenuItem>
                  ))}
                </MenuGroup>
              </ToolbarMenuContent>
            </Menu>
          </Toolbar>
        </TableBulkBar>

        <TableScroll>
          <Table aria-rowcount={filtered.length + 1}>
            <TableHead>
              <tr>
                <TableIndexCell
                  header
                  checked={headerChecked}
                  indeterminate={pageSel > 0 && !headerChecked}
                  onCheckedChange={selectPage}
                  label={headerChecked ? "Deselect this page" : "Select this page"}
                />
                <TableExpandCell header />
                {sortHeader("id", "ID")}
                {COLUMNS.filter((c) => cols.has(c.key)).map((c) =>
                  sortHeader(
                    c.key,
                    c.unit ? (
                      <>
                        {c.label} <span className="kl-code">{c.unit}</span>
                      </>
                    ) : (
                      c.label
                    ),
                    c,
                  ),
                )}
              </tr>
            </TableHead>
            <TableBody ref={rowMotion.ref}>
              {load === "loading" ? (
                <TableLoadingRows cols={COLS} rows={pageSize} />
              ) : load === "error" ? (
                <TableState
                  kind="error"
                  colSpan={COLS}
                  count="!"
                  title="Shipments couldn't load."
                  body="The carrier gateway timed out (504). Your filters and selection are kept."
                  action={<Button onClick={() => void reload()}>Try again</Button>}
                />
              ) : filtered.length === 0 ? (
                <TableState
                  kind="empty"
                  colSpan={COLS}
                  count={0}
                  title={rows.length === 0 ? "No shipments yet." : "No shipments match these filters."}
                  body={
                    rows.length === 0
                      ? "Cancelled shipments can be restored from the message below."
                      : `${plural(rows.length, "shipment")} in total. ${activeFilters} ${activeFilters === 1 ? "filter is" : "filters are"} hiding them.`
                  }
                  action={rows.length ? <Button onClick={clearFilters}>Clear filters</Button> : undefined}
                />
              ) : (
                pageRows.map((s, i) => (
                  <ShipmentRow
                    key={s.id}
                    s={s}
                    code={String(pg * pageSize + i + 1).padStart(2, "0")}
                    cols={cols}
                    selected={selected.has(s.id)}
                    expanded={expanded.has(s.id)}
                    inspecting={inspect === s.id}
                    onSelect={(v) => toggle(s.id, v)}
                    onExpand={() =>
                      setExpanded((p) => {
                        const n = new Set(p);
                        if (n.has(s.id)) n.delete(s.id);
                        else n.add(s.id);
                        return n;
                      })
                    }
                    onInspect={(el) => ((opener.current = el), setInspect(s.id))}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableScroll>

        <TablePagination
          page={pg}
          pageSize={pageSize}
          total={load === "ready" ? filtered.length : null}
          onPageChange={setPage}
          noun="shipments"
        >
          <ToastDock />
        </TablePagination>
      </TableFrame>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent
          title={`Cancel ${plural(nSel, "shipment")}?`}
          description="Carriers are told immediately. You can undo for 8 seconds; after that, rebook from Dock schedule."
          cancelLabel="Keep shipments"
          confirmLabel={`Cancel ${plural(nSel, "shipment")}`}
          onConfirm={cancelSelected}
          container={container}
        >
          <ul className="kl-sx-confirm-list">
            {rows
              .filter((s) => selected.has(s.id))
              .slice(0, 4)
              .map((s) => (
                <li key={s.id}>
                  <span className="kl-code">{s.id}</span> {s.dest}
                </li>
              ))}
            {nSel > 4 ? <li className="kl-sx-muted">and {nSel - 4} more</li> : null}
          </ul>
        </AlertDialogContent>
      </AlertDialog>

      <CommandDialog
        open={cmd}
        onOpenChange={(o) => (setCmd(o), o || setCmdQ(""))}
        container={container}
        finalFocus={keepFocus}
      >
        <CommandInput placeholder="Type a command or a carrier…" value={cmdQ} onValueChange={setCmdQ} />
        <CommandList>
          <CommandEmpty query={cmdQ}>Try “assign”, “view” or a carrier name.</CommandEmpty>
          {nSel ? (
            <CommandGroup heading={`Selected · ${plural(nSel, "shipment")}`}>
              {CARRIERS.filter((c) => !c.disabled)
                .slice(0, 5)
                .map((c) => (
                  <CommandItem
                    key={c.value}
                    value={`assign ${c.label}`}
                    meta={<span className="kl-code">{nSel}</span>}
                    onSelect={run(() => void assign(c.value))}
                  >
                    Assign {c.label}
                  </CommandItem>
                ))}
              <CommandItem value="delay 1 day reschedule" onSelect={run(() => reschedule(1))}>
                Delay 1 day
              </CommandItem>
              <CommandItem value="cancel shipments" onSelect={run(askCancel)}>
                Cancel {plural(nSel, "shipment")}…
              </CommandItem>
              <CommandItem value="clear selection" onSelect={run(clearSel)}>
                Clear selection
              </CommandItem>
            </CommandGroup>
          ) : null}
          <CommandGroup heading="View">
            {VIEWS.map((v) => (
              <CommandItem
                key={v.value}
                value={`show ${v.label} view`}
                meta={<span className="kl-code">{base.filter(v.test).length}</span>}
                onSelect={run(() => setView(v.value))}
              >
                Show {v.label.toLowerCase()}
              </CommandItem>
            ))}
            <CommandItem value="select all matching" disabled={!filtered.length} onSelect={run(selectAllMatching)}>
              Select all {filtered.length} matching
            </CommandItem>
            <CommandItem value="clear filters" disabled={!activeFilters} onSelect={run(clearFilters)}>
              Clear filters
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Data">
            <CommandItem value="reload" onSelect={run(() => void reload())}>
              Reload shipments
            </CommandItem>
            <CommandItem
              value="reload simulate gateway error failure"
              onSelect={run(() => ((failNext.current = true), void reload()))}
            >
              Reload and simulate a gateway error
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span>
            <Kbd>↑↓</Kbd> move
          </span>
          <span>
            <Kbd>↵</Kbd> run
          </span>
          <span>
            <Kbd>⌥1–9</Kbd> run by number
          </span>
        </CommandFooter>
      </CommandDialog>
    </AppShell>
  );
}

/** A complete, working composition. Wrap once; the toast docks into the table pager. */
export function Shipments(props: ShipmentsProps) {
  return (
    <ToastProvider>
      <ShipmentsApp {...props} />
    </ToastProvider>
  );
}
