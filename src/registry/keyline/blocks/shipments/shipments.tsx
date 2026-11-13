"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
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
  FilterToken,
  TableScroll,
  useRowMotion,
  type SortDirection,
} from "../../ui/table";
import {
  useDataTable,
  DataTable,
  DataTableBulkBar,
  DataTablePagination,
  DataTableSearch,
  type DataTableColumnDef,
  type DataTableFilter,
  type DataTableState,
} from "../../ui/data-table";
import { matchesFilter, matchesSearch, nextSorting, selectionScope, toSortList } from "../../lib/data-table";
import { compareValues } from "../../lib/collection";
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
import { patchWithUndo, removeWithUndo } from "../../lib/selection";
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
 * The table's columns. TanStack sorts, filters and pages; the cells are Keyline's.
 * --------------------------------------------------------------------------------------------- */
/* the row being inspected, for the ID cell's pressed state; and the handler that opens a row */
const Inspecting = React.createContext<{ id: string | null; open: (id: string, opener: HTMLElement | null) => void }>({
  id: null,
  open: () => {},
});

/* KEY: the ID cell answers the press; the cobalt edge and the inspector follow on release */
function OpenButton({ id }: { id: string }) {
  const inspecting = React.useContext(Inspecting);
  return (
    <button
      type="button"
      data-testid="shipment-open"
      className={cn(
        "flex h-(--kl-row) w-full cursor-pointer items-center border-0 bg-transparent px-(--kl-inset) py-0 text-start",
        "font-(family-name:--kl-font-mono) text-[13px] text-inherit",
        "hover:underline hover:decoration-[1.5px] hover:underline-offset-[3px] active:bg-kl-press",
        "aria-pressed:shadow-[inset_3px_0_0_var(--kl-cobalt)] kl-rtl:aria-pressed:shadow-[inset_-3px_0_0_var(--kl-cobalt)]",
        "focus-visible:outline-(length:--kl-ring) focus-visible:outline-offset-[-5px] focus-visible:outline-kl-focus focus-visible:outline-solid",
      )}
      aria-pressed={inspecting.id === id}
      onClick={(e) => (e.stopPropagation(), inspecting.open(id, e.currentTarget))}
    >
      {id}
    </button>
  );
}

/* compares as the block always has: numbers and dates by value, text with an en-GB collator ("Box 9" before
   "Box 10"); TanStack reverses it for a descending level and breaks ties by the rows' order */
const byValue = (a: { getValue: (id: string) => unknown }, b: { getValue: (id: string) => unknown }, id: string) =>
  compareValues(a.getValue(id), b.getValue(id), "ascending", "en-GB");
const unitHeader = (label: string, unit: string) => () => (
  <>
    {label} <span className="kl-code">{unit}</span>
  </>
);

const COLUMN_DEFS: DataTableColumnDef<Shipment>[] = [
  {
    accessorKey: "id",
    header: "ID",
    enableHiding: false,
    sortFn: byValue,
    meta: { cellClassName: "p-0" },
    cell: ({ row }) => <OpenButton id={row.original.id} />,
  },
  {
    accessorKey: "dest",
    header: "Destination",
    sortFn: byValue,
    meta: { cellClassName: "max-w-[220px] overflow-hidden text-ellipsis" },
  },
  { accessorKey: "carrier", header: "Carrier", sortFn: byValue, filterFn: "keyline" },
  {
    accessorKey: "status",
    header: "Status",
    enableGlobalFilter: false,
    filterFn: "keyline",
    sortFn: (a, b) => STATUS_RANK[a.getValue("status") as StatusKey] - STATUS_RANK[b.getValue("status") as StatusKey],
    cell: ({ row }) => {
      const st = STATUS[row.original.status];
      return <Status kind={st.kind}>{st.label}</Status>;
    },
  },
  {
    accessorKey: "eta",
    header: "ETA",
    enableGlobalFilter: false,
    filterFn: "keyline",
    sortFn: byValue,
    meta: { align: "end" },
    cell: ({ row }) => {
      const s = row.original;
      return s.status !== "delivered" && s.eta < TODAY ? (
        <span className="font-(--kl-weight-strong) text-kl-red-text">{fmtDay(s.eta)}</span>
      ) : (
        fmtDay(s.eta)
      );
    },
  },
  {
    id: "kg",
    accessorFn: (s) => s.kg ?? undefined,
    header: unitHeader("Weight", "kg"),
    enableGlobalFilter: false,
    sortDescFirst: true,
    sortUndefined: "last",
    sortFn: byValue,
    meta: { align: "end" },
    cell: ({ row }) => fmtKg(row.original.kg),
  },
  {
    // a value of 0 is not yet priced: it prints "—" and sorts last, as an empty value does
    id: "eur",
    accessorFn: (s) => s.eur || undefined,
    header: unitHeader("Value", "€"),
    enableGlobalFilter: false,
    sortDescFirst: true,
    sortUndefined: "last",
    sortFn: byValue,
    meta: { align: "end" },
    cell: ({ row }) => (row.original.eur ? fmtEur(row.original.eur) : "—"),
  },
  // never shown: the search also reads the PO reference, and the view tabs filter by status
  { accessorKey: "reference", enableSorting: false },
  {
    id: "view",
    accessorFn: (s) => s.status,
    enableSorting: false,
    enableGlobalFilter: false,
    filterFn: (row, _id, view: string) => VIEWS.find((v) => v.value === view)?.test(row.original) ?? true,
  },
];
const HIDDEN = { reference: false, view: false };

/* --------------------------------------------------------------------------------------------- *
 * A row's detail: its legs as cells on one keyline.
 * --------------------------------------------------------------------------------------------- */
const renderLegs = (row: { original: Shipment }) => (
  <ol
    className="m-0 grid list-none grid-cols-[repeat(4,minmax(150px,1fr))] p-0 [@media(max-width:640px)]:grid-cols-[1fr_1fr]"
    aria-label={`Legs for ${row.original.id}`}
  >
    {LEGS.map((l) => (
      <li
        key={l.at}
        data-status={l.state}
        className={cn(
          "grid gap-0.5 border-s-(length:--kl-k1) border-s-kl-line-soft px-3.5 pt-2.5 pb-3 text-[13px] first:border-s-0",
          "data-[status=current]:shadow-[inset_0_3px_0_var(--kl-cobalt)] data-[status=next]:text-kl-ink-2",
          "[@media(max-width:640px)]:nth-3:border-s-0",
          "[@media(max-width:640px)]:nth-[n+3]:border-t-(length:--kl-k1) [@media(max-width:640px)]:nth-[n+3]:border-t-kl-line-soft",
        )}
      >
        <span className="kl-code">{l.at}</span>
        <b>{l.place}</b>
        <span>{l.what}</span>
      </li>
    ))}
  </ol>
);
const legsLabel = (row: { original: Shipment }, expanded: boolean) =>
  `${expanded ? "Hide" : "Show"} legs for ${row.original.id}`;
const selectLabel = (row: { original: Shipment }) => `Select ${row.original.id}`;

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
    <Inspector aria-label={`Shipment ${s.id}`} className="bg-kl-cell">
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
      <form ref={formRef} className="flex min-h-0 flex-[1_1_auto] flex-col" onSubmit={save} noValidate>
        <fieldset
          disabled={state === "cancelled" || signal === "pending"}
          className="m-0 flex min-h-0 min-w-0 flex-[1_1_auto] flex-col border-0 p-0"
        >
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
                    className="font-(family-name:--kl-font-mono)"
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
                <div className="text-[26px]/[1.1] font-(--kl-weight-strong) tabular-nums">{s.pallets}</div>
              </InspectorSection>
              <InspectorSection>
                <span className="kl-code">Legs</span>
                <div className="text-[26px]/[1.1] font-(--kl-weight-strong) tabular-nums">{LEGS.length}</div>
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
  const [inspect, setInspect] = React.useState<string | null>(null);
  // the row's open button: the aside's sheet returns focus to it on close
  const opener = React.useRef<HTMLElement | null>(null);
  const [cancelled, setCancelled] = React.useState<Map<string, { row: Shipment; index: number }>>(new Map());
  // the selection is the block's: the bulk bar, the command menu and the cancel alert all read it
  const [rowSelection, setRowSelection] = React.useState<DataTableState["rowSelection"]>({});
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

  /* ---- the table: TanStack holds the sort, the filters, the page, the open details and the column choice ---- */
  const table = useDataTable({
    data: rows,
    columns: COLUMN_DEFS,
    getRowId: (s) => s.id,
    state: { rowSelection },
    onStateChange: (next, { slice }) => {
      if (slice === "rowSelection") setRowSelection(next.rowSelection);
      // a new sort or filter starts on the first page; editing rows (assign, cancel, Undo) keeps the page
      else if (slice === "sorting" || slice === "columnFilters" || slice === "globalFilter") table.setPageIndex(0);
    },
    defaultState: { pagination: { pageIndex: 0, pageSize: PAGE }, columnVisibility: HIDDEN },
    autoResetPageIndex: false,
    autoResetExpanded: false,
  });
  const { columnFilters, globalFilter, sorting, pagination } = table.state as DataTableState;
  const pageSize = pagination.pageSize;

  /* ---- filtering: every control affects results ---- */
  const filterOf = (id: string) => columnFilters.find((f) => f.id === id)?.value;
  const setFilter = (id: string, value: unknown) => table.getColumn(id)?.setFilterValue(value);
  const q = globalFilter ?? "";
  const carrierFilter = filterOf("carrier") as Extract<DataTableFilter, { kind: "set" }> | undefined;
  const statusFilter = filterOf("status") as Extract<DataTableFilter, { kind: "set" }> | undefined;
  const etaFilter = filterOf("eta") as Extract<DataTableFilter, { kind: "range" }> | undefined;
  const view = (filterOf("view") as string | undefined) ?? "all";
  const flags = (statusFilter?.values ?? []) as string[];
  const eta = (etaFilter ?? null) as DateRange | null;
  const carriers = React.useMemo(
    () => (carrierFilter?.values ?? []).map((v) => CARRIERS.find((c) => c.value === v) ?? { value: v, label: v }),
    [carrierFilter],
  );
  const setView = (v: string) => setFilter("view", v === "all" ? undefined : v);
  const setFlags = (values: string[]) => setFilter("status", { kind: "set", values });
  const setCarriers = (o: MultiselectOption[]) => setFilter("carrier", { kind: "set", values: o.map((c) => c.value) });
  const setEta = (r: DateRange | null) => setFilter("eta", r ? { kind: "range", from: r.from, to: r.to } : undefined);
  const clearFilters = () => {
    table.setColumnFilters([]);
    table.setGlobalFilter("");
  };
  // the counts on the view tabs and status toggles: the rows each would show, under the other filters
  const base = React.useMemo(
    () =>
      rows.filter(
        (s) =>
          matchesSearch([s.id, s.dest, s.carrier, s.reference], q) &&
          matchesFilter(s.carrier, carrierFilter) &&
          matchesFilter(s.eta, etaFilter),
      ),
    [rows, q, carrierFilter, etaFilter],
  );
  const viewTest = VIEWS.find((v) => v.value === view)!.test;
  const afterView = base.filter(viewTest);
  // the rows that pass every filter, sorted, before paging
  const filtered = table.getPrePaginatedRowModel().rows;
  const pageRows = table.getRowModel().rows;
  // a removal can leave the page past the end: go back to the last page that has rows
  const pageCount = table.getPageCount();
  React.useLayoutEffect(() => {
    if (pagination.pageIndex > 0 && pagination.pageIndex >= pageCount) table.setPageIndex(Math.max(0, pageCount - 1));
  }, [pagination.pageIndex, pageCount, table]);
  const sort = toSortList(sorting) as { key: SortKey; direction: SortDirection }[];
  const setSort = (key: SortKey) =>
    table.setSorting((x) => nextSorting(x, key, { first: colFirst(key), additive: true }));
  const colLabel = (key: SortKey) => (key === "id" ? "ID" : COLUMNS.find((c) => c.key === key)!.label);
  const colFirst = (key: SortKey) => (key === "id" ? undefined : COLUMNS.find((c) => c.key === key)!.first);
  const sortable: SortKey[] = ["id", ...COLUMNS.map((c) => c.key)];
  const shown = COLUMNS.filter((c) => table.getColumn(c.key)?.getIsVisible());

  /* ---- selection scope (ids survive filtering and paging; the scope says what is hidden) ---- */
  const selected = React.useMemo(
    () => new Set(Object.keys(rowSelection).filter((id) => rowSelection[id])),
    [rowSelection],
  );
  const filteredIds = React.useMemo(() => new Set(filtered.map((r) => r.id)), [filtered]);
  const { count: nSel, hidden } = selectionScope(rowSelection, [...filteredIds]);
  const allMatching = filtered.length > 0 && nSel - hidden === filtered.length;
  const headerChecked = table.getIsAllPageRowsSelected();
  const selectAllMatching = () =>
    table.setRowSelection((s) => ({ ...s, ...Object.fromEntries(filtered.map((r) => [r.id, true])) }));
  const keepVisibleOnly = () =>
    table.setRowSelection((s) => Object.fromEntries(Object.entries(s).filter(([id, on]) => on && filteredIds.has(id))));
  const clearSel = () => table.setRowSelection({});

  // recovery: a failed bulk signal clears as soon as the working set changes
  React.useEffect(() => setAssignSig((x) => (x === "failed" ? "idle" : x)), [rowSelection]);

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
  const inspIndex = inspected ? filtered.findIndex((r) => r.id === inspected.id) : -1;
  const inspCode = inspIndex >= 0 ? `R${inspIndex + 1}/${filtered.length}` : "R—";
  const saveInspector = async (patch: Partial<Shipment>) => {
    await wait(650);
    setRows((rs) => rs.map((s) => (s.id === inspect ? { ...s, ...patch } : s)));
  };
  // clear the filters, then page to the shipment where the sort puts it
  const showInTable = () => {
    const id = inspect;
    clearFilters();
    setTimeout(() => {
      const i = table.getPrePaginatedRowModel().rows.findIndex((r) => r.id === id);
      if (i >= 0) table.setPageIndex(Math.floor(i / table.atoms.pagination.get().pageSize));
    }, 0);
  };
  const openRow = React.useCallback((id: string, el: HTMLElement | null) => {
    opener.current = el;
    setInspect(id);
  }, []);
  const inspecting = React.useMemo(() => ({ id: inspect, open: openRow }), [inspect, openRow]);
  // a press anywhere on the row inspects it, as its ID does
  const rowProps = React.useCallback(
    (row: { id: string }) => ({
      onClick: (e: React.MouseEvent<HTMLTableRowElement>) =>
        openRow(row.id, e.currentTarget.querySelector<HTMLElement>("[data-testid=shipment-open]")),
    }),
    [openRow],
  );

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

  return (
    <AppShell
      className={className}
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
          header={
            <NavIdentity
              mark={<span className="block size-3.5 bg-current" />}
              title="Freightdesk"
              meta="RTM · Rotterdam"
            />
          }
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
      <TableFrame
        aria-label="Shipments"
        data-testid="shipments-table"
        // the frame fills the viewport under the shell header; the grid scrolls inside it
        className="max-h-[calc(100dvh_-_3_*_var(--kl-gutter)_-_var(--kl-ctl)_-_2_*_var(--kl-k3))] min-h-[360px] bg-kl-cell"
        aria-busy={load === "loading" || undefined}
      >
        <TableViews views={viewCounts} value={view} onValueChange={setView} label="Shipment views">
          <Toolbar layout="cell" overflow="menu" aria-label="Table">
            <Menu>
              <ToolbarMenuTrigger
                affix={
                  <span className="kl-code">
                    {shown.length + 1}/{COLUMNS.length + 1}
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
                      checked={shown.includes(c)}
                      onCheckedChange={(on) => table.getColumn(c.key)?.toggleVisibility(on)}
                    >
                      {c.label}
                    </MenuCheckboxItem>
                  ))}
                </MenuGroup>
                <MenuSeparator />
                <MenuGroup>
                  <MenuGroupLabel>Rows per page</MenuGroupLabel>
                  <MenuRadioGroup
                    value={String(pageSize)}
                    onValueChange={(v) => table.setPagination({ pageIndex: 0, pageSize: Number(v) })}
                  >
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
                        table.setSorting((x) => x.map((y) => (y.id === lv.key ? { ...y, desc: !y.desc } : y)))
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
                            <MenuItem key={k} onClick={() => setSort(k)}>
                              {colLabel(k)}
                            </MenuItem>
                          ))}
                      </MenuPopup>
                    </MenuSubmenuRoot>
                  ) : null}
                  {sort.length ? (
                    <MenuItem
                      onClick={() => table.setSorting([])}
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
          <DataTableSearch table={table} label="Search shipments" placeholder="Search ID, city, carrier or PO" />
          <Multiselect
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
          className="min-h-(--kl-row)"
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
          {q ? <FilterToken field="Text" op="has" value={q} onRemove={() => table.setGlobalFilter("")} /> : null}
          {activeFilters ? (
            <ToolbarButton onClick={clearFilters}>
              Clear {activeFilters > 1 ? `all ${activeFilters}` : "filter"}
            </ToolbarButton>
          ) : null}
        </Toolbar>

        <DataTableBulkBar
          table={table}
          scope={
            nSel === 0 ? (
              <span className="text-kl-ink-2">Select rows to assign, reschedule or cancel them.</span>
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
        </DataTableBulkBar>

        <TableScroll>
          <Inspecting.Provider value={inspecting}>
            <DataTable
              table={table}
              aria-rowcount={filtered.length + 1}
              rowLabel={selectLabel}
              rowProps={rowProps}
              renderDetail={renderLegs}
              expandLabel={legsLabel}
              bodyProps={{ ref: rowMotion.ref }}
              loading={load === "loading"}
              error={
                load === "error"
                  ? {
                      title: "Shipments couldn't load.",
                      body: "The carrier gateway timed out (504). Your filters and selection are kept.",
                      action: <Button onClick={() => void reload()}>Try again</Button>,
                    }
                  : undefined
              }
              empty={{
                title: rows.length === 0 ? "No shipments yet." : "No shipments match these filters.",
                body:
                  rows.length === 0
                    ? "Cancelled shipments can be restored from the message below."
                    : `${plural(rows.length, "shipment")} in total. ${activeFilters} ${activeFilters === 1 ? "filter is" : "filters are"} hiding them.`,
                action: rows.length ? <Button onClick={clearFilters}>Clear filters</Button> : undefined,
              }}
            />
          </Inspecting.Provider>
        </TableScroll>

        <DataTablePagination table={table} noun="shipments" loading={load !== "ready"}>
          <ToastDock />
        </DataTablePagination>
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
          <ul className="m-0 grid list-none gap-1 p-0 text-[14px]">
            {rows
              .filter((s) => selected.has(s.id))
              .slice(0, 4)
              .map((s) => (
                <li key={s.id}>
                  <span className="kl-code">{s.id}</span> {s.dest}
                </li>
              ))}
            {nSel > 4 ? <li className="text-kl-ink-2">and {nSel - 4} more</li> : null}
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
