// Independent consumer: four compositions built from the installed Keyline items (public API only,
// page layout with Tailwind utilities) next to stock shadcn components. No kl- classes beyond the public kl-code, no overrides.
import * as React from "react";

import { Button as ShadButton } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Button, ButtonAffix } from "@/components/keyline/ui/button";
import { CheckboxField } from "@/components/keyline/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPopup,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/keyline/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldFrame,
  FieldControl,
  FieldAffix,
  FieldDescription,
  FieldError,
} from "@/components/keyline/ui/field";
import { Inspector, InspectorHeader, InspectorFacts, InspectorActions } from "@/components/keyline/ui/inspector";
import { Nav, NavIdentity } from "@/components/keyline/ui/nav";
import { AppShell } from "@/components/keyline/ui/app-shell";
import { Panel, PanelHeader, PanelBody, PanelFooter, PanelGrid } from "@/components/keyline/ui/panel";
import { RadioGroup, RadioGroupItem } from "@/components/keyline/ui/radio-group";
import { Select } from "@/components/keyline/ui/select";
import { Stat, Meter } from "@/components/keyline/ui/stat";
import { Status, Badge } from "@/components/keyline/ui/status";
import { SwitchField } from "@/components/keyline/ui/switch";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/keyline/ui/tabs";
import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented";
import {
  TableFrame,
  TableViews,
  TableToolbar,
  TableSearch,
  TableBulkBar,
  TableScroll,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableIndexCell,
  TablePagination,
} from "@/components/keyline/ui/table";
import { ToastProvider, ToastFloating, useToast } from "@/components/keyline/ui/toast";
import { Tooltip, TooltipProvider } from "@/components/keyline/ui/tooltip";
import { useSelection, patchWithUndo } from "@/components/keyline/lib/selection";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/components/keyline/ui/accordion";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/components/keyline/ui/collapsible";
import { Combobox, type ComboboxOption } from "@/components/keyline/ui/combobox";
import { Multiselect, type MultiselectOption } from "@/components/keyline/ui/multiselect";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPopup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSubmenuRoot,
  ContextMenuSubmenuTrigger,
  ContextMenuSubmenuPopup,
} from "@/components/keyline/ui/context-menu";
import { Item, ItemList, ItemMeta, ItemContent, ItemMedia } from "@/components/keyline/ui/item";
import { Progress } from "@/components/keyline/ui/progress";
import {
  SelectRoot,
  SelectLabel,
  SelectTrigger,
  SelectPopup,
  SelectList,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
} from "@/components/keyline/ui/select";
import { Slider } from "@/components/keyline/ui/slider";
import { useForm, Controller } from "react-hook-form";
import { Form, FormActions } from "@/components/keyline/ui/field";
import { NumberField } from "@/components/keyline/ui/number-field";
import { Empty } from "@/components/keyline/ui/empty";
import { Breadcrumb } from "@/components/keyline/ui/breadcrumb";
import { Pagination } from "@/components/keyline/ui/pagination";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
} from "@/components/keyline/ui/menu";
import { TableSortHeader, TableState, nextSort, sortOf, compareValues, type Sort } from "@/components/keyline/ui/table";
import { nextSortList, sortLevel, compareBy, type SortList } from "@/components/keyline/ui/table";
// Field participants in a Base UI Form, time field, skeleton, menubar, and a TanStack Table
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { TimeField } from "@/components/keyline/ui/time-field";
import { DateTimePicker } from "@/components/keyline/ui/date-picker";
import { Avatar, AvatarGroup } from "@/components/keyline/ui/avatar";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardPopup,
  HoverCardHeader,
  HoverCardFacts,
} from "@/components/keyline/ui/hover-card";
import { OtpField } from "@/components/keyline/ui/otp-field";
import { FieldBar } from "@/components/keyline/ui/field";
import { NativeSelect } from "@/components/keyline/ui/native-select";
import { Kbd, KbdGroup } from "@/components/keyline/ui/kbd";
import { Toggle } from "@/components/keyline/ui/toggle";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/keyline/ui/resizable";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuGrid,
  NavigationMenuCard,
} from "@/components/keyline/ui/navigation-menu";
import { Skeleton, SkeletonGroup } from "@/components/keyline/ui/skeleton";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPopup,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarSeparator,
} from "@/components/keyline/ui/menubar";
// A toolbar over a queue, and checkbox groups in a popover and in a form
import {
  Toolbar,
  ToolbarButton,
  ToolbarToggle,
  ToolbarToggleGroup,
  ToolbarSpacer,
  ToolbarInput,
  ToolbarMenu,
  ToolbarMenuTrigger,
  ToolbarMenuContent,
  ToolbarMenuCheckboxItem,
} from "@/components/keyline/ui/toolbar";
import { CheckboxGroup } from "@/components/keyline/ui/checkbox-group";
import { Popover, PopoverTrigger, PopoverPopup, PopoverHeader } from "@/components/keyline/ui/popover";

// Questionnaire, sidebar (nested links, row actions), toast outside React, button group, marker, direction
import {
  Questionnaire,
  QuestionnaireProgress,
  QuestionnaireItem,
  QuestionnaireTitle,
  QuestionnaireChoices,
  QuestionnaireChoice,
  QuestionnaireInput,
  QuestionnaireError,
  QuestionnaireActions,
  QuestionnairePrevious,
  QuestionnaireSkip,
  QuestionnaireNext,
  QuestionnaireSubmit,
} from "@/components/keyline/ui/questionnaire";
import { NavAction } from "@/components/keyline/ui/nav";
import { MenuItem } from "@/components/keyline/ui/menu";
import { ToastDock, createToaster } from "@/components/keyline/ui/toast";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/components/keyline/ui/dialog";
import { ButtonGroup, ButtonGroupText } from "@/components/keyline/ui/button-group";
import { Marker, MarkerContent } from "@/components/keyline/ui/marker";
import { DirectionProvider } from "@/components/keyline/ui/direction";

type Cut = "on" | "quiet" | "off";

export default function App() {
  const [cut, setCut] = React.useState<Cut>(() => (new URLSearchParams(location.search).get("cut") as Cut) || "off"); // square is the default
  const [section, setSection] = React.useState("records");
  return (
    <TooltipProvider>
      <ToastProvider>
        <div data-kl-cut={cut} className="grid min-h-screen grid-cols-1 gap-6 p-6 md:grid-cols-[220px_1fr]">
          <Nav
            label="Workspace"
            header="Acme Freight"
            orientation="responsive"
            value={section}
            onValueChange={setSection}
            items={[
              { value: "records", label: "Records", count: 42 },
              { value: "settings", label: "Settings" },
              { value: "dashboard", label: "Dashboard" },
            ]}
          />
          <main className="grid min-w-0 content-start gap-8">
            <div className="flex flex-wrap items-center gap-4">
              <Segmented value={cut} onValueChange={(v) => setCut(v as Cut)} aria-label="Cut">
                <SegmentedItem value="on">Cut</SegmentedItem>
                <SegmentedItem value="quiet">Quiet</SegmentedItem>
                <SegmentedItem value="off">Off</SegmentedItem>
              </Segmented>
              <CreateDialog />
            </div>
            <Records />
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <Settings />
              <Coexistence />
            </div>
            <Dashboard />
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <CarrierRules />
              <Uploads />
            </div>
            <Dispatch />
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <Pickup />
              <Lanes />
            </div>
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Exceptions />
              <Alerts />
            </div>
            <Manifests />
            <DockBooking />
            <WorkspaceShell />
            <Handover />
            <ManifestLookup />
            <YardPlanner />
            <Intake />
            <CarrierSearch />
          </main>
        </div>
        <ToastFloating />
      </ToastProvider>
    </TooltipProvider>
  );
}

/* ---------- 1. settings form ---------- */
function Settings() {
  const [saving, setSaving] = React.useState<"idle" | "pending" | "done">("idle");
  const [email, setEmail] = React.useState("ops@acme.test");
  const invalid = !/^\S+@\S+\.\S+$/.test(email);
  return (
    <Panel aria-labelledby="settings-title">
      <PanelHeader
        title={<span id="settings-title">Notifications</span>}
        code="SET-02"
        description="Who hears about delays, and how often."
      />
      <PanelBody className="grid gap-5">
        <Field invalid={invalid}>
          <FieldLabel>Alert address</FieldLabel>
          <FieldFrame>
            <FieldControl value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            <FieldAffix>@</FieldAffix>
          </FieldFrame>
          {invalid ? (
            <FieldError match>Enter an address like ops@company.com.</FieldError>
          ) : (
            <FieldDescription>Delays over 4 hours go here first.</FieldDescription>
          )}
        </Field>
        <Select
          label="Escalate to"
          defaultValue="lead"
          options={[
            { value: "lead", label: "Shift lead", code: "L1" },
            { value: "mgr", label: "Ops manager", code: "L2" },
            { value: "none", label: "Nobody", description: "Alerts stay in the inbox" },
          ]}
        />
        <div className="grid gap-0">
          <SwitchField label="Email alerts" description="One message per delayed shipment." defaultChecked />
          <SwitchField label="Weekend alerts" />
        </div>
        <RadioGroup defaultValue="daily" aria-label="Digest" name="digest">
          <RadioGroupItem value="live" label="Live" description="Every change, as it happens" />
          <RadioGroupItem value="daily" label="Daily digest" description="07:00, local time" meta="1×" />
          <RadioGroupItem value="weekly" label="Weekly digest" description="Mondays" meta="1/7" />
        </RadioGroup>
        <div className="grid gap-0">
          <CheckboxField label="Include cancelled shipments" />
          <CheckboxField label="Attach CSV" description="Up to 5,000 rows." defaultChecked />
        </div>
      </PanelBody>
      <PanelFooter>
        <Button layout="cell" variant="quiet">
          Reset
        </Button>
        <Button
          layout="cell"
          variant="primary"
          signal={saving}
          disabled={invalid}
          onClick={async () => {
            setSaving("pending");
            await new Promise((r) => setTimeout(r, 600));
            setSaving("done");
            setTimeout(() => setSaving("idle"), 900);
          }}
        >
          Save changes
        </Button>
      </PanelFooter>
    </Panel>
  );
}

/* ---------- 2. records view: filters, bulk actions, pagination, inspector ---------- */
type Rec = {
  id: string;
  customer: string;
  lane: string;
  status: "normal" | "waiting" | "attention" | "done";
  label: string;
  owner: string;
};
const SEED: Rec[] = Array.from({ length: 42 }, (_, i) => ({
  id: `PO-${4100 + i}`,
  customer: ["Northwind", "Contoso", "Fabrikam", "Tailspin", "Wingtip"][i % 5],
  lane: ["HAM → LYO", "RTM → MAD", "ANR → WAW", "GOT → MIL"][i % 4],
  status: (["normal", "waiting", "attention", "done"] as const)[i % 4],
  label: ["Open", "Awaiting docs", "Blocked", "Closed"][i % 4],
  owner: ["Ada", "Lin", "Sam"][i % 3],
}));

function Records() {
  const notify = useToast();
  const [rows, setRows] = React.useState(SEED);
  const [view, setView] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [owner, setOwner] = React.useState("any");
  const [page, setPage] = React.useState(0);
  const [open, setOpen] = React.useState<string | null>("PO-4102");
  const pageSize = 8;
  const filtered = React.useMemo(
    () =>
      rows.filter(
        (r) =>
          (view === "all" || r.status === view) &&
          (owner === "any" || r.owner === owner) &&
          (r.id + r.customer + r.lane).toLowerCase().includes(query.toLowerCase()),
      ),
    [rows, view, owner, query],
  );
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const matchingIds = React.useMemo(() => filtered.map((r) => r.id), [filtered]);
  const pageIds = React.useMemo(() => pageRows.map((r) => r.id), [pageRows]);
  const sel = useSelection(matchingIds, pageIds);
  React.useEffect(() => setPage(0), [view, owner, query]);
  const current = rows.find((r) => r.id === open);

  const reassign = (to: string) => {
    const { next, undo, count } = patchWithUndo(rows, sel.selected, (r) => ({ ...r, owner: to }));
    setRows(next);
    notify({ title: `${count} records moved to ${to}.`, action: { label: "Undo", onClick: () => setRows(undo) } });
  };

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[1fr_320px]">
      <TableFrame aria-label="Purchase orders">
        <TableViews
          label="Status"
          value={view}
          onValueChange={setView}
          views={[
            { value: "all", label: "All", count: rows.length },
            { value: "attention", label: "Blocked", count: rows.filter((r) => r.status === "attention").length },
            { value: "waiting", label: "Awaiting docs", count: rows.filter((r) => r.status === "waiting").length },
          ]}
        />
        <TableToolbar>
          <TableSearch
            label="Search orders"
            placeholder="Search ID, customer, lane"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            layout="cell"
            label="Owner"
            value={owner}
            onValueChange={(v) => setOwner(v as string)}
            options={[
              { value: "any", label: "Any owner" },
              { value: "Ada", label: "Ada" },
              { value: "Lin", label: "Lin" },
              { value: "Sam", label: "Sam" },
            ]}
          />
        </TableToolbar>
        <TableBulkBar
          count={sel.scope.count}
          scope={
            sel.scope.count ? (
              <span>
                {sel.scope.count} selected{sel.scope.hidden ? `, ${sel.scope.hidden} not in these results` : ""}.
              </span>
            ) : (
              <span>Select records to reassign them.</span>
            )
          }
        >
          <Button layout="cell" disabled={!sel.scope.count} onClick={() => reassign("Ada")}>
            Give to Ada <ButtonAffix>{sel.scope.count}</ButtonAffix>
          </Button>
          <Button layout="cell" variant="quiet" disabled={!sel.scope.count} onClick={sel.clear}>
            Clear
          </Button>
        </TableBulkBar>
        <TableScroll>
          <Table>
            <TableHead>
              <tr>
                <TableIndexCell
                  header
                  label="Select this page"
                  checked={sel.scope.page === "all"}
                  indeterminate={sel.scope.page === "some"}
                  onCheckedChange={sel.setPage}
                />
                <TableHeaderCell>Order</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Lane</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {pageRows.map((r, i) => (
                <TableRow
                  key={r.id}
                  selected={sel.selected.has(r.id)}
                  onClick={() => setOpen(r.id)}
                  aria-current={open === r.id || undefined}
                >
                  <TableIndexCell
                    code={String(page * pageSize + i + 1).padStart(2, "0")}
                    label={`Select ${r.id}`}
                    checked={sel.selected.has(r.id)}
                    onCheckedChange={(v) => sel.toggle(r.id, v)}
                  />
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.customer}</TableCell>
                  <TableCell>{r.lane}</TableCell>
                  <TableCell>
                    <Status kind={r.status}>{r.label}</Status>
                  </TableCell>
                  <TableCell>{r.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
        <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} noun="orders" />
      </TableFrame>

      {current ? (
        <Inspector aria-label={`Order ${current.id}`}>
          <InspectorHeader
            code="PO"
            title={current.id}
            status={<Status kind={current.status}>{current.label}</Status>}
            onClose={() => setOpen(null)}
          />
          <InspectorFacts
            items={[
              { label: "Customer", value: current.customer },
              { label: "Lane", value: current.lane },
              { label: "Owner", value: current.owner },
            ]}
          />
          <InspectorActions>
            <Tooltip content="Moves the order to the top of the queue" shortcut="P">
              <Button layout="cell" variant="primary">
                Prioritise
              </Button>
            </Tooltip>
            <Button layout="cell">Open order</Button>
          </InspectorActions>
        </Inspector>
      ) : null}
    </div>
  );
}

/* ---------- 3. dialog: fields, selection controls, async operation (cancellable) ---------- */
function CreateDialog() {
  const notify = useToast();
  const [open, setOpen] = React.useState(false);
  const [signal, setSignal] = React.useState<"idle" | "pending" | "failed">("idle");
  const [attempt, setAttempt] = React.useState(0);
  const ctrl = React.useRef<AbortController | null>(null);
  const onOpenChange = (o: boolean) => {
    if (!o) ctrl.current?.abort(); // closing cancels the request; nothing is created
    setOpen(o);
    if (!o) setSignal("idle");
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = (ctrl.current = new AbortController());
    setSignal("pending");
    try {
      await new Promise<void>((res, rej) => {
        const t = setTimeout(() => (attempt === 0 ? rej(new Error("Carrier API timed out")) : res()), 900);
        c.signal.addEventListener("abort", () => (clearTimeout(t), rej(new DOMException("aborted", "AbortError"))));
      });
      setOpen(false);
      setSignal("idle");
      notify({ title: "Pickup booked for tomorrow, 08:00–10:00." });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setAttempt((a) => a + 1);
      setSignal("failed");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="primary" />}>Book pickup…</DialogTrigger>
      <DialogPopup>
        <form onSubmit={submit} className="contents">
          <DialogHeader>
            <DialogTitle>Book a pickup</DialogTitle>
            <DialogDescription>The carrier confirms the slot by email.</DialogDescription>
          </DialogHeader>
          <DialogBody contentClassName="gap-5">
            <Field>
              <FieldLabel>Reference</FieldLabel>
              <FieldFrame>
                <FieldControl name="ref" defaultValue="PO-4102" required />
              </FieldFrame>
            </Field>
            <Select
              label="Carrier"
              defaultValue="dhl"
              options={[
                { value: "dhl", label: "DHL Freight", code: "DHL" },
                { value: "dsv", label: "DSV Road", code: "DSV" },
              ]}
            />
            <RadioGroup defaultValue="am" aria-label="Slot" name="slot">
              <RadioGroupItem value="am" label="08:00–10:00" meta="€" />
              <RadioGroupItem value="pm" label="14:00–16:00" meta="€€" />
            </RadioGroup>
            <CheckboxField label="Tail-lift needed" />
            {signal === "failed" ? (
              <p role="alert">The carrier did not answer. Nothing was booked; try again.</p>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button layout="cell" variant="quiet" />}>Cancel</DialogClose>
            <Button layout="cell" variant="primary" type="submit" signal={signal}>
              {signal === "failed" ? "Try again" : "Book pickup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

/* ---------- 4. dashboard section ---------- */
function Dashboard() {
  return (
    <section aria-label="Today" className="grid gap-4">
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTab value="today">Today</TabsTab>
          <TabsTab value="week" count={128}>
            This week
          </TabsTab>
        </TabsList>
        <TabsPanel value="today">
          <PanelGrid min={200}>
            <Stat
              label="Open orders"
              value="42"
              delta={{ value: "+6", direction: "up", tone: "neutral", label: "6 more than yesterday" }}
            />
            <Stat
              label="Blocked"
              value="10"
              delta={{ value: "+3", direction: "up", tone: "bad", label: "3 more than yesterday" }}
            />
            <Stat label="Dock use" value="83" unit="%" meter={{ value: 83 }} />
            <Panel layout="cell">
              <PanelHeader title="Carriers" actions={<Badge tone="signal">LIVE</Badge>} />
              <PanelBody className="grid gap-2">
                <Meter value={18} max={20} high={17} label="DHL slots" />
                <Meter value={6} max={20} label="DSV slots" />
              </PanelBody>
            </Panel>
          </PanelGrid>
        </TabsPanel>
        <TabsPanel value="week">
          <Panel>
            <PanelBody>Weekly numbers arrive on Monday.</PanelBody>
          </Panel>
        </TabsPanel>
      </Tabs>
    </section>
  );
}

/* ---------- coexistence: stock shadcn on the same page ---------- */
function Coexistence() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock shadcn card</CardTitle>
        <CardDescription>Unchanged by Keyline: own radius, font, colours and focus ring.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Input placeholder="shadcn input" />
        <div className="flex gap-2">
          <ShadButton>shadcn button</ShadButton>
          <Button variant="primary">Keyline button</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- 5. carrier rules: accordion of cells, combobox, sliders, select parts, collapsible ---------- */
const TERMINALS: ComboboxOption[] = [
  { value: "RTM-ECT", label: "Rotterdam ECT Delta", code: "RTM-1", group: "Rotterdam" },
  { value: "RTM-APM", label: "Rotterdam APM Maasvlakte II", code: "RTM-2", group: "Rotterdam" },
  { value: "ANR-PSA", label: "Antwerp Noordzee PSA", code: "ANR-2", group: "Antwerp" },
  { value: "HAM-CTA", label: "Hamburg Altenwerder", code: "HAM-1", group: "Hamburg" },
  {
    value: "HAM-CTT",
    label: "Hamburg Tollerort",
    code: "HAM-3",
    group: "Hamburg",
    disabled: true,
    description: "Closed for works",
  },
];
const PEOPLE = { none: "No escalation", lead: "Shift lead", ops: "Operations manager", dir: "Regional director" };

function CarrierRules() {
  const [terminal, setTerminal] = React.useState<string | null>("RTM-ECT");
  const [gross, setGross] = React.useState(40);
  const [hours, setHours] = React.useState<number[]>([6, 18]);
  const [owner, setOwner] = React.useState<keyof typeof PEOPLE>("lead");
  const notify = useToast();
  return (
    <Panel>
      <PanelHeader title="Carrier rules" code="CR-7" description="Applied to new bookings from the next cut-off." />
      <Accordion layout="cell" multiple defaultValue={["route", "limits"]}>
        <AccordionItem value="route">
          <AccordionTrigger meta={terminal ?? "none"}>Route</AccordionTrigger>
          <AccordionPanel>
            <Combobox
              label="Delivery terminal"
              options={TERMINALS}
              value={terminal}
              onValueChange={(v) => setTerminal(v)}
              noun={["terminal", "terminals"]}
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="limits">
          <AccordionTrigger meta={`${gross} t`}>Limits</AccordionTrigger>
          <AccordionPanel contentClassName="grid gap-4">
            <Slider
              label="Max gross weight"
              unit="t"
              min={0}
              max={44}
              value={gross}
              onValueChange={(v) => setGross(v as number)}
              name="gross"
            />
            <Slider
              label="Delivery window"
              unit="h"
              min={0}
              max={24}
              value={hours}
              onValueChange={(v) => setHours([...(v as number[])])}
              minStepsBetweenValues={1}
            />
            <Collapsible>
              <CollapsibleTrigger meta="2">Tolerances</CollapsibleTrigger>
              <CollapsiblePanel contentClassName="grid gap-4">
                <Slider label="Weight tolerance" unit="%" defaultValue={5} max={20} />
              </CollapsiblePanel>
            </Collapsible>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="escalation">
          <AccordionTrigger meta={PEOPLE[owner]}>Escalation</AccordionTrigger>
          <AccordionPanel>
            <Field>
              <SelectRoot value={owner} onValueChange={(v) => setOwner(v as keyof typeof PEOPLE)} items={PEOPLE}>
                <SelectLabel>Escalate to</SelectLabel>
                <SelectTrigger />
                <SelectPopup>
                  <SelectList>
                    <SelectItem value="none" description="Alerts stay in the inbox">
                      No escalation
                    </SelectItem>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectGroupLabel>On shift</SelectGroupLabel>
                      <SelectItem value="lead" code="L1">
                        Shift lead
                      </SelectItem>
                      <SelectItem value="ops" code="L2">
                        Operations manager
                      </SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectGroupLabel>Off shift</SelectGroupLabel>
                      <SelectItem value="dir" code="L3">
                        Regional director
                      </SelectItem>
                    </SelectGroup>
                  </SelectList>
                </SelectPopup>
              </SelectRoot>
            </Field>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <PanelFooter>
        <Button
          layout="cell"
          variant="primary"
          onClick={() =>
            notify({
              title: `Rules saved: ${terminal ?? "any terminal"}, ${gross} t, ${hours[0]}–${hours[1]} h, ${PEOPLE[owner]}`,
            })
          }
        >
          Save rules
        </Button>
      </PanelFooter>
    </Panel>
  );
}

/* ---------- 6. uploads: progress rows with a context menu on each document ---------- */
function Uploads() {
  const [done, setDone] = React.useState(64);
  const [failed, setFailed] = React.useState(true);
  const [last, setLast] = React.useState("");
  const docs = [
    { id: "INV-2207", name: "Commercial invoice", value: 100 },
    { id: "PL-2207", name: "Packing list", value: done },
    { id: "EUR1", name: "EUR.1 certificate", value: failed ? 38 : 0 },
  ];
  return (
    <Panel>
      <PanelHeader title="Uploads" description="Right-click a document for more actions." />
      <ItemList layout="cell" aria-label="Documents">
        {docs.map((d) => (
          <ContextMenu key={d.id}>
            <ContextMenuTrigger render={<Item tabIndex={0} aria-label={`${d.name}. Context menu available.`} />}>
              <div className="min-w-0 px-4 py-3">
                <Progress
                  label={d.name}
                  value={d.value}
                  failed={d.id === "EUR1" && failed}
                  detail={d.id === "EUR1" && failed ? "The connection dropped. Retry resumes the upload." : undefined}
                />
              </div>
              <ItemMeta>{d.id}</ItemMeta>
            </ContextMenuTrigger>
            <ContextMenuPopup>
              <ContextMenuItem onClick={() => setLast(`Opened ${d.name}`)}>Open</ContextMenuItem>
              <ContextMenuItem
                disabled={!(d.id === "EUR1" && failed)}
                onClick={() => {
                  setFailed(false);
                  setLast(`Retrying ${d.name}`);
                }}
              >
                Retry upload
              </ContextMenuItem>
              <ContextMenuSubmenuRoot>
                <ContextMenuSubmenuTrigger>Send to</ContextMenuSubmenuTrigger>
                <ContextMenuSubmenuPopup>
                  <ContextMenuItem onClick={() => setLast(`Sent ${d.name} to the broker`)}>
                    Customs broker
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => setLast(`Sent ${d.name} to the consignee`)}>
                    Consignee
                  </ContextMenuItem>
                </ContextMenuSubmenuPopup>
              </ContextMenuSubmenuRoot>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive" onClick={() => setLast(`Removed ${d.name}`)}>
                Remove
              </ContextMenuItem>
            </ContextMenuPopup>
          </ContextMenu>
        ))}
      </ItemList>
      <PanelFooter>
        <Button layout="cell" onClick={() => setDone((v) => Math.min(100, v + 12))}>
          Advance
        </Button>
        <p role="status" className="self-center px-4 text-sm">
          {last}
        </p>
      </PanelFooter>
    </Panel>
  );
}

/* ---------- dispatch. A react-hook-form booking form (Field, NumberField, Select, Combobox
   through Controller, server error with setError) whose submissions land in a sortable bookings table
   (column and page-size menus with checkbox and radio items, Empty on no match, standalone Pagination). */
type Booking = { reference: string; pallets: number | null; service: string; carrier: string | null };
type BookingRow = { ref: string; carrier: string; pallets: number; kg: number };
const SERVICES = [
  { value: "eco", label: "Economy" },
  { value: "std", label: "Standard" },
  { value: "exp", label: "Express" },
];
const CARRIER_OPTS: ComboboxOption[] = [
  { value: "DSV", label: "DSV Road" },
  { value: "DHL", label: "DHL Freight" },
  { value: "RHE", label: "Rhenus Logistics" },
  { value: "GEO", label: "Geodis" },
];
const BOOKINGS: BookingRow[] = Array.from({ length: 13 }, (_, i) => ({
  ref: `BK-${[7, 12, 3, 21, 9, 15, 1, 30, 18, 5, 26, 11, 2][i]}`,
  carrier: ["DSV", "DHL", "RHE", "GEO"][i % 4],
  pallets: [4, 33, 12, 8, 20, 1, 16, 26, 6, 10, 2, 14, 30][i],
  kg: [3100, 23900, 9800, 6400, 15200, 700, 12100, 19800, 4300, 7600, 1500, 10400, 22100][i],
}));
type Col = "ref" | "carrier" | "pallets" | "kg";

function Dispatch() {
  const notify = useToast();
  const [rows, setRows] = React.useState<BookingRow[]>(BOOKINGS);
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Booking>({ defaultValues: { reference: "", pallets: 12, service: "std", carrier: null } });
  const onSubmit = async (v: Booking) => {
    await new Promise((r) => setTimeout(r, 300));
    if (rows.some((r) => r.ref.toUpperCase() === v.reference.trim().toUpperCase())) {
      setError("reference", { message: `${v.reference} is already booked.` });
      return;
    }
    setRows((rs) => [
      {
        ref: v.reference.trim().toUpperCase(),
        carrier: v.carrier ?? "DSV",
        pallets: v.pallets ?? 1,
        kg: (v.pallets ?? 1) * 750,
      },
      ...rs,
    ]);
    notify({
      title: `Booked ${v.reference.trim().toUpperCase()}: ${v.pallets} PLT, ${v.service}, ${v.carrier ?? "any carrier"}.`,
    });
    reset();
  };
  // table state
  const [sort, setSort] = React.useState<Sort<Col>>(null);
  const [cols, setCols] = React.useState({ carrier: true, kg: true });
  const [size, setSize] = React.useState("5");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const per = Number(size);
  const found = React.useMemo(() => {
    const f = rows.filter((r) => !q || `${r.ref} ${r.carrier}`.toLowerCase().includes(q.toLowerCase()));
    return sort ? [...f].sort((a, b) => compareValues(a[sort.key], b[sort.key], sort.direction)) : f;
  }, [rows, q, sort]);
  const pages = Math.max(1, Math.ceil(found.length / per));
  const shown = found.slice((Math.min(page, pages) - 1) * per, Math.min(page, pages) * per);
  const colCount = 2 + (cols.carrier ? 1 : 0) + (cols.kg ? 1 : 0);
  const head = (key: Col, label: string, align?: "end", first?: "descending") => (
    <TableSortHeader
      align={align}
      sort={sortOf(sort, key)}
      onSort={() => (setSort((s) => nextSort(s, key, { first })), setPage(1))}
    >
      {label}
    </TableSortHeader>
  );
  return (
    <section className="grid min-w-0 gap-4" aria-labelledby="dispatch-h">
      <Breadcrumb
        items={[{ label: "Operations", href: "#ops" }, { label: "Dispatch", href: "#dispatch" }, { label: "Bookings" }]}
      />
      <h2 id="dispatch-h" className="text-xl font-semibold">
        Bookings
      </h2>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Panel>
          <PanelHeader title="New booking" />
          <PanelBody>
            <Form orientation="responsive" aria-label="New booking" onSubmit={handleSubmit(onSubmit)}>
              <Field name="reference" invalid={!!errors.reference}>
                <FieldLabel>Reference</FieldLabel>
                <FieldFrame>
                  <FieldControl
                    placeholder="BK-40"
                    autoComplete="off"
                    {...register("reference", {
                      required: "Enter a booking reference.",
                      pattern: { value: /^BK-\d+$/i, message: "Use the form BK-123." },
                    })}
                  />
                </FieldFrame>
                {errors.reference ? <FieldError match>{errors.reference.message}</FieldError> : null}
              </Field>
              <Controller
                name="pallets"
                control={control}
                rules={{ required: true, min: 1, max: 33 }}
                render={({ field, fieldState }) => (
                  <NumberField
                    label="Pallets"
                    unit="PLT"
                    min={1}
                    max={33}
                    value={field.value}
                    onValueChange={field.onChange}
                    invalid={!!fieldState.error}
                    error="Between 1 and 33 pallets."
                  />
                )}
              />
              <Controller
                name="service"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Service level"
                    options={SERVICES}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  />
                )}
              />
              <Controller
                name="carrier"
                control={control}
                render={({ field }) => (
                  <Combobox
                    label="Carrier"
                    options={CARRIER_OPTS}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    placeholder="Any carrier"
                    noun={["carrier", "carriers"]}
                  />
                )}
              />
              <FormActions>
                <Button type="submit" variant="primary" signal={isSubmitting ? "pending" : "idle"}>
                  Add booking
                </Button>
                <Button type="button" variant="quiet" onClick={() => reset()}>
                  Clear
                </Button>
              </FormActions>
            </Form>
          </PanelBody>
        </Panel>
        <div className="grid min-w-0 gap-3">
          <TableFrame>
            <TableToolbar aria-label="Bookings tools">
              <TableSearch
                label="Search bookings"
                placeholder="Search bookings"
                value={q}
                onChange={(e) => (setQ(e.target.value), setPage(1))}
              />
              <Menu>
                <MenuTrigger render={<Button layout="cell" />}>View</MenuTrigger>
                <MenuPopup attachWeight={1} align="end">
                  <MenuGroup>
                    <MenuGroupLabel>Columns</MenuGroupLabel>
                    <MenuCheckboxItem
                      checked={cols.carrier}
                      onCheckedChange={(v) => setCols((c) => ({ ...c, carrier: v }))}
                    >
                      Carrier
                    </MenuCheckboxItem>
                    <MenuCheckboxItem checked={cols.kg} onCheckedChange={(v) => setCols((c) => ({ ...c, kg: v }))}>
                      Gross weight
                    </MenuCheckboxItem>
                  </MenuGroup>
                  <MenuSeparator />
                  <MenuGroup>
                    <MenuGroupLabel>Rows per page</MenuGroupLabel>
                    <MenuRadioGroup value={size} onValueChange={(v) => (setSize(v as string), setPage(1))}>
                      <MenuRadioItem value="5">5</MenuRadioItem>
                      <MenuRadioItem value="10">10</MenuRadioItem>
                    </MenuRadioGroup>
                  </MenuGroup>
                </MenuPopup>
              </Menu>
            </TableToolbar>
            <TableScroll>
              <Table aria-label="Bookings">
                <TableHead>
                  <tr>
                    {head("ref", "Reference")}
                    {cols.carrier ? head("carrier", "Carrier") : null}
                    {head("pallets", "Pallets", "end", "descending")}
                    {cols.kg ? head("kg", "Gross (kg)", "end", "descending") : null}
                  </tr>
                </TableHead>
                <TableBody>
                  {shown.length ? (
                    shown.map((r) => (
                      <TableRow key={r.ref}>
                        <TableCell>
                          <span className="kl-code">{r.ref}</span>
                        </TableCell>
                        {cols.carrier ? <TableCell>{r.carrier}</TableCell> : null}
                        <TableCell align="end">{r.pallets}</TableCell>
                        {cols.kg ? <TableCell align="end">{r.kg.toLocaleString("en-GB")}</TableCell> : null}
                      </TableRow>
                    ))
                  ) : (
                    <TableState
                      kind="empty"
                      count={0}
                      title={`No bookings match “${q}”`}
                      body="Search looks at the reference and the carrier code."
                      action={<Button onClick={() => setQ("")}>Clear search</Button>}
                      colSpan={colCount}
                    />
                  )}
                </TableBody>
              </Table>
            </TableScroll>
          </TableFrame>
          <Pagination
            page={Math.min(page, pages)}
            pageCount={found.length ? pages : null}
            onPageChange={setPage}
            label="Bookings pages"
          />
          {rows.length === 0 ? <Empty kind="start" title="No bookings yet" /> : null}
        </div>
      </div>
    </section>
  );
}

/* ---------- Base UI Form with Select, Combobox and TimeField; Skeleton while the slots load ---------- */
function Pickup() {
  const notify = useToast();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [slots, setSlots] = React.useState<string[] | null>(null);
  React.useEffect(() => {
    const t = setTimeout(() => setSlots(["08:00–10:00", "10:00–12:00", "14:00–16:00"]), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <Panel>
      <PanelHeader title="Pickup" description="A Base UI Form: values come from the controls' names." />
      <PanelBody>
        <Form
          aria-label="Pickup"
          errors={errors}
          onFormSubmit={(v) => {
            if (v.pickup && String(v.pickup) >= "16:00") return setErrors({ pickup: "The dock closes at 16:00." });
            setErrors({});
            notify({ title: `Pickup ${v.pickup} with ${v.carrier}, ${v.service}.` });
          }}
        >
          <Select label="Service" name="service" options={SERVICES} defaultValue="std" />
          <Combobox
            label="Pickup carrier"
            name="carrier"
            options={CARRIER_OPTS}
            required
            placeholder="Choose a carrier"
          />
          <TimeField label="Pickup time" name="pickup" zone="CET" minuteStep={15} required />
          <div className="grid gap-2">
            {slots ? (
              <ItemList aria-label="Free dock slots">
                {slots.map((s) => (
                  <Item key={s}>
                    <ItemContent title={s} />
                    <ItemMeta>Dock 4</ItemMeta>
                  </Item>
                ))}
              </ItemList>
            ) : (
              <SkeletonGroup label="Loading dock slots">
                <Skeleton shape="line" lines={3} />
              </SkeletonGroup>
            )}
          </div>
          <FormActions>
            <Button type="submit" variant="primary">
              Request pickup
            </Button>
          </FormActions>
        </Form>
      </PanelBody>
    </Panel>
  );
}

/* ---------- TanStack Table rendered with Keyline parts; a Menubar drives column visibility ---------- */
type Lane = { lane: string; carrier: string; days: number; eur: number };
const LANES: Lane[] = [
  { lane: "NLRTM → DEHAM", carrier: "DSV", days: 2, eur: 1180 },
  { lane: "NLRTM → PLWAW", carrier: "DHL", days: 3, eur: 1640 },
  { lane: "BEANR → FRPAR", carrier: "GEO", days: 1, eur: 720 },
  { lane: "DEHAM → CZPRG", carrier: "RHE", days: 2, eur: 980 },
  { lane: "NLRTM → ITMIL", carrier: "DSV", days: 4, eur: 2310 },
];
const LANE_COLS: ColumnDef<Lane>[] = [
  { accessorKey: "lane", header: "Lane", cell: (c) => <span className="kl-code">{c.getValue<string>()}</span> },
  { accessorKey: "carrier", header: "Carrier" },
  { accessorKey: "days", header: "Transit (d)", sortDescFirst: true, meta: { align: "end" } },
  {
    accessorKey: "eur",
    header: "Rate (EUR)",
    sortDescFirst: true,
    meta: { align: "end" },
    cell: (c) => c.getValue<number>().toLocaleString("en-GB"),
  },
];
function Lanes() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [visibility, setVisibility] = React.useState<VisibilityState>({});
  const table = useReactTable({
    data: LANES,
    columns: LANE_COLS,
    state: { sorting, columnVisibility: visibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const align = (m: unknown) => (m as { align?: "end" } | undefined)?.align;
  return (
    <div className="grid min-w-0 gap-3">
      <Menubar aria-label="Lanes">
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPopup>
            {table
              .getAllLeafColumns()
              .filter((c) => c.id !== "lane")
              .map((c) => (
                <MenubarCheckboxItem
                  key={c.id}
                  checked={c.getIsVisible()}
                  onCheckedChange={(v) => c.toggleVisibility(v)}
                >
                  {String(c.columnDef.header)}
                </MenubarCheckboxItem>
              ))}
            <MenubarSeparator />
            <MenubarItem disabled={!sorting.length} onClick={() => setSorting([])}>
              Clear sort
            </MenubarItem>
          </MenubarPopup>
        </MenubarMenu>
      </Menubar>
      <TableFrame>
        <TableScroll>
          <Table aria-label="Lanes">
            <TableHead>
              {table.getHeaderGroups().map((g) => (
                <tr key={g.id}>
                  {g.headers.map((h) => {
                    const dir = h.column.getIsSorted();
                    return (
                      <TableSortHeader
                        key={h.id}
                        align={align(h.column.columnDef.meta)}
                        sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : null}
                        priority={dir ? h.column.getSortIndex() + 1 : undefined}
                        levels={sorting.length}
                        // Shift + press is TanStack's multi-sort; a plain press cycles this column alone
                        onSort={({ additive }) => h.column.toggleSorting(undefined, additive)}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </TableSortHeader>
                    );
                  })}
                </tr>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((r) => (
                <TableRow key={r.id}>
                  {r.getVisibleCells().map((c) => (
                    <TableCell key={c.id} align={align(c.column.columnDef.meta)}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScroll>
      </TableFrame>
    </div>
  );
}

/* ---------- a cell Toolbar heads a queue; CheckboxGroups filter it (popover) and drive a form ---------- */
type Exc = { id: string; carrier: string; kind: string; open: boolean };
const EXCS: Exc[] = [
  { id: "EX-201", carrier: "DSV", kind: "Late pickup", open: true },
  { id: "EX-202", carrier: "DHL", kind: "Damaged pallet", open: true },
  { id: "EX-203", carrier: "GEO", kind: "Address mismatch on the delivery note for the consignee", open: false },
  { id: "EX-204", carrier: "DSV", kind: "Customs hold", open: true },
];
const EXC_CARRIERS = ["DSV", "DHL", "GEO"];
function Exceptions() {
  const notify = useToast();
  const [q, setQ] = React.useState("");
  const [state, setState] = React.useState(["open"]);
  const [carriers, setCarriers] = React.useState<string[]>(EXC_CARRIERS);
  const [kinds, setKinds] = React.useState<string[]>([]);
  const [mine, setMine] = React.useState<string[]>([]);
  const rows = EXCS.filter(
    (e) =>
      (state[0] === "all" || e.open === (state[0] === "open")) &&
      carriers.includes(e.carrier) &&
      (!q || e.kind.toLowerCase().includes(q.toLowerCase())) &&
      (!kinds.length || kinds.includes(e.kind)),
  );
  return (
    <Panel>
      <PanelHeader
        title="Exceptions"
        description="A cell toolbar: search, an exclusive filter, a menu and the commit."
      />
      <Toolbar layout="cell" aria-label="Exceptions">
        <ToolbarInput
          label="Search exceptions"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
        />
        <ToolbarToggleGroup
          aria-label="State"
          multiple={false}
          value={state}
          onValueChange={(v) => v.length && setState(v)}
        >
          <ToolbarToggle value="open">Open</ToolbarToggle>
          <ToolbarToggle value="closed">Closed</ToolbarToggle>
          <ToolbarToggle value="all">All</ToolbarToggle>
        </ToolbarToggleGroup>
        <ToolbarMenu>
          <ToolbarMenuTrigger>Carrier</ToolbarMenuTrigger>
          <ToolbarMenuContent>
            {EXC_CARRIERS.map((c) => (
              <ToolbarMenuCheckboxItem
                key={c}
                checked={carriers.includes(c)}
                onCheckedChange={(on) => setCarriers((cs) => (on ? [...cs, c] : cs.filter((x) => x !== c)))}
              >
                {c}
              </ToolbarMenuCheckboxItem>
            ))}
          </ToolbarMenuContent>
        </ToolbarMenu>
        <ToolbarToggle value="mine" pressed={mine.length > 0} onPressedChange={(on) => setMine(on ? ["mine"] : [])}>
          Assigned to me
        </ToolbarToggle>
        <ToolbarSpacer />
        <ToolbarButton
          primary
          disabled={!rows.some((r) => r.open)}
          onClick={() => notify({ title: `${rows.filter((r) => r.open).length} exceptions resolved.` })}
        >
          Resolve
        </ToolbarButton>
      </Toolbar>
      <PanelBody>
        <div className="grid gap-3">
          <Popover>
            <PopoverTrigger render={<Button />}>Kind · {kinds.length || "any"}</PopoverTrigger>
            <PopoverPopup>
              <PopoverHeader title="Kind" />
              <CheckboxGroup
                layout="cell"
                legend="Kind"
                value={kinds}
                onValueChange={setKinds}
                selectAll="Every kind"
                options={[...new Set(EXCS.map((e) => e.kind))].map((k) => ({
                  value: k,
                  label: k,
                  meta: EXCS.filter((e) => e.kind === k).length,
                }))}
              />
            </PopoverPopup>
          </Popover>
          {rows.length ? (
            <ItemList aria-label="Exception list">
              {rows.map((e) => (
                <Item key={e.id}>
                  <ItemContent title={e.kind} description={e.id} />
                  <ItemMeta>{e.carrier}</ItemMeta>
                </Item>
              ))}
            </ItemList>
          ) : (
            <Empty title="No exceptions match" description="Change the state or the carriers." />
          )}
        </div>
      </PanelBody>
    </Panel>
  );
}
function Alerts() {
  const notify = useToast();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  return (
    <Panel>
      <PanelHeader
        title="Alerts"
        description="A checkbox group is a form participant: its checked values arrive under its name."
      />
      <PanelBody>
        <Form
          aria-label="Alerts"
          errors={errors}
          onFormSubmit={(v) => {
            const ev = (v.events as string[] | undefined) ?? [];
            if (ev.includes("customs") && !ev.includes("late"))
              return setErrors({ events: "Customs alerts need late-pickup alerts too." });
            setErrors({});
            notify({ title: `Alerts: ${ev.join(", ") || "none"}.` });
          }}
        >
          <CheckboxGroup
            legend="Alert me about"
            name="events"
            selectAll="All events"
            defaultValue={["late"]}
            validate={(v) => ((v as string[]).length ? null : "Choose at least one event.")}
            options={[
              { value: "late", label: "Late pickup", meta: 12 },
              { value: "damage", label: "Damage", description: "Reported by the driver or at the dock.", meta: 3 },
              { value: "customs", label: "Customs hold", meta: 1 },
              { value: "pod", label: "Proof of delivery", disabled: true, meta: 0 },
            ]}
          />
          <FormActions>
            <Button type="submit" variant="primary">
              Save alerts
            </Button>
          </FormActions>
        </Form>
      </PanelBody>
    </Panel>
  );
}

/* ---------- table command rows on Toolbar (overflow into More), multi-column sort ---------- */
type Manifest = { id: string; dock: string; carrier: string; pallets: number };
const MANIFESTS: Manifest[] = [
  { id: "MF-31", dock: "D2", carrier: "DSV", pallets: 12 },
  { id: "MF-32", dock: "D1", carrier: "DHL", pallets: 8 },
  { id: "MF-33", dock: "D2", carrier: "DHL", pallets: 20 },
  { id: "MF-34", dock: "D1", carrier: "GEO", pallets: 8 },
  { id: "MF-35", dock: "D1", carrier: "DSV", pallets: 33 },
  { id: "MF-36", dock: "D2", carrier: "DSV", pallets: 5 },
];
type MfKey = "dock" | "carrier" | "pallets";
function Manifests() {
  const [narrow, setNarrow] = React.useState("wide");
  const [sort, setSort] = React.useState<SortList<MfKey>>([{ key: "dock", direction: "ascending" }]);
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [showCarrier, setShowCarrier] = React.useState(true);
  const [sig, setSig] = React.useState<"idle" | "pending" | "done">("idle");
  const [log, setLog] = React.useState("—");
  const rows = React.useMemo(() => [...MANIFESTS].sort(compareBy(sort, (r, k) => r[k], "en-GB")), [sort]);
  const seal = () => {
    setSig("pending");
    setTimeout(() => (setSig("done"), setLog(`Sealed ${sel.size}`)), 500);
  };
  const head = (key: MfKey, label: string, first?: "descending", align?: "end") => {
    const lv = sortLevel(sort, key);
    return (
      <TableSortHeader
        key={key}
        align={align}
        sort={lv?.direction ?? null}
        priority={lv?.priority}
        levels={sort.length}
        onSort={({ additive }) => setSort((x) => nextSortList(x, key, { first, additive }))}
      >
        {label}
      </TableSortHeader>
    );
  };
  return (
    <section className="grid min-w-0 gap-3" aria-labelledby="mf-h">
      <div className="flex flex-wrap items-center gap-4">
        <h2 id="mf-h" className="text-lg font-semibold">
          Manifests
        </h2>
        <Segmented value={narrow} onValueChange={setNarrow} aria-label="Manifest width">
          <SegmentedItem value="wide">Wide</SegmentedItem>
          <SegmentedItem value="narrow">Narrow</SegmentedItem>
        </Segmented>
        <span data-testid="mf-log" className="text-sm">
          {log} · {sort.map((s) => `${s.key} ${s.direction}`).join(", then ") || "unsorted"}
        </span>
      </div>
      <div style={{ width: narrow === "narrow" ? 300 : "auto", maxWidth: "100%", minWidth: 0 }}>
        <TableFrame aria-label="Manifest table">
          <TableViews
            views={[{ value: "open", label: "Open", count: MANIFESTS.length }]}
            value="open"
            onValueChange={() => {}}
            label="Manifest views"
          >
            <Toolbar layout="cell" overflow="menu" aria-label="Manifest tools">
              <ToolbarMenu>
                <ToolbarMenuTrigger>Columns</ToolbarMenuTrigger>
                <ToolbarMenuContent align="end">
                  <ToolbarMenuCheckboxItem checked={showCarrier} onCheckedChange={setShowCarrier}>
                    Carrier
                  </ToolbarMenuCheckboxItem>
                </ToolbarMenuContent>
              </ToolbarMenu>
              <ToolbarButton onClick={() => setLog("Exported")}>Export</ToolbarButton>
            </Toolbar>
          </TableViews>
          <TableBulkBar count={sel.size} scope={sel.size ? `${sel.size} selected` : "Select manifests to seal them."}>
            <Toolbar layout="cell" overflow="menu" aria-label="Manifest actions">
              <ToolbarButton disabled={!sel.size} onClick={() => setLog(`Held ${sel.size}`)}>
                Hold
              </ToolbarButton>
              <ToolbarButton disabled={!sel.size} onClick={() => setLog(`Split ${sel.size}`)}>
                Split by dock
              </ToolbarButton>
              <ToolbarButton disabled={!sel.size} onClick={() => setLog(`Printed ${sel.size}`)}>
                Print labels
              </ToolbarButton>
              <ToolbarButton primary signal={sig} disabled={!sel.size} onClick={seal}>
                Seal
              </ToolbarButton>
            </Toolbar>
          </TableBulkBar>
          <TableScroll>
            <Table aria-label="Manifest rows">
              <TableHead>
                <tr>
                  <TableHeaderCell>ID</TableHeaderCell>
                  {head("dock", "Dock")}
                  {showCarrier ? head("carrier", "Carrier") : null}
                  {head("pallets", "Pallets", "descending", "end")}
                </tr>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} selected={sel.has(r.id)}>
                    <TableCell>
                      <CheckboxField
                        label={r.id}
                        checked={sel.has(r.id)}
                        onCheckedChange={(on) =>
                          setSel((x) => {
                            const n = new Set(x);
                            if (on) n.add(r.id);
                            else n.delete(r.id);
                            return n;
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>{r.dock}</TableCell>
                    {showCarrier ? <TableCell>{r.carrier}</TableCell> : null}
                    <TableCell align="end">{r.pallets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableScroll>
        </TableFrame>
      </div>
    </section>
  );
}

/* ---------- a stock shadcn Card holding a Keyline Form: DateTimePicker and TimeField on a
   12-hour clock, a Slider whose validate opens its ! cell, a shadcn submit button ---------- */
function DockBooking() {
  const notify = useToast();
  return (
    <section className="grid max-w-xl min-w-0 gap-3" aria-labelledby="db-h">
      <h2 id="db-h" className="text-lg font-semibold">
        Dock booking
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Book a reefer slot</CardTitle>
          <CardDescription>Keyline fields in a stock shadcn card; the button is shadcn's.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            aria-label="Dock booking"
            onFormSubmit={(v) =>
              notify({ title: `Booked: ${v.slot} · cut-off ${v.cutoff} · ${v.temp} °C.`, type: "done", timeout: 0 })
            }
          >
            <DateTimePicker
              label="Slot"
              name="slot"
              required
              hourCycle={12}
              locale="en-US"
              today={new Date(2026, 10, 7)}
              defaultMonth={new Date(2026, 10, 7)}
              zone="CET"
              minTime="06:00"
              maxTime="22:00"
            />
            <TimeField label="Paperwork cut-off" name="cutoff" hourCycle={12} locale="en-US" defaultValue="17:30" />
            <Slider
              label="Set point"
              name="temp"
              unit="°C"
              min={-25}
              max={25}
              defaultValue={4}
              validate={(t) => ((t as number) > 8 ? "Chilled goods ride at 8 °C or colder." : null)}
            />
            <FormActions>
              <ShadButton type="submit">Book slot</ShadButton>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}

/* ---------- an AppShell in a bounded pane, with a grouped Nav (icons, identity, footer) that
   collapses to a rail; a stock shadcn Card is the page ---------- */
const Ico = ({ d }: { d: string }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d={d} />
  </svg>
);
function WorkspaceShell() {
  const [v, setV] = React.useState("queue");
  return (
    <section className="grid min-w-0 gap-3" aria-labelledby="ws-h">
      <h2 id="ws-h" className="text-lg font-semibold">
        Workspace shell
      </h2>
      <div className="min-w-0" style={{ width: "100%", maxWidth: 1000 }}>
        <AppShell
          narrowAt={560}
          collapse="rail"
          navSize="13rem"
          header={<span className="self-center px-3 font-semibold">Queue</span>}
          nav={
            <Nav
              label="Workspace sections"
              layout="cell"
              value={v}
              onValueChange={setV}
              header={<NavIdentity mark="AF" title="Acme Freight" meta="EU-W" />}
              footer={<NavIdentity mark="RK" title="R. Kovač" meta="Planner" />}
              groups={[
                {
                  label: "Work",
                  items: [
                    { value: "queue", label: "Queue", count: 12, icon: <Ico d="M2 4h12M2 8h12M2 12h8" /> },
                    { value: "lanes", label: "Lanes", icon: <Ico d="M2 13 14 3M2 3h5M9 13h5" /> },
                  ],
                },
                {
                  label: "Admin",
                  items: [
                    {
                      value: "settings",
                      label: "Settings",
                      icon: <Ico d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" />,
                    },
                  ],
                },
              ]}
            />
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>{v[0].toUpperCase() + v.slice(1)}</CardTitle>
              <CardDescription>The page is a stock shadcn Card.</CardDescription>
            </CardHeader>
            <CardContent style={{ minHeight: 320 }}>Section content.</CardContent>
          </Card>
        </AppShell>
      </div>
    </section>
  );
}

/* ---------- night handover. Avatars as item media, names that preview on hover or focus,
   watchers as an avatar group in the panel header, and a second factor in a stock shadcn Card ---------- */
const CREW18 = [
  { name: "Nora van der Berg", role: "Dispatcher", code: "U-0412", open: 12, status: "normal" as const },
  { name: "Ade Okafor", role: "Carrier liaison", code: "U-0388", open: 7, status: "waiting" as const },
  { name: "María José Núñez", role: "Customs broker", code: "U-0291", open: 3, status: "attention" as const },
];
function Handover() {
  const notify = useToast();
  return (
    <section aria-labelledby="ho-h" className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <h2 id="ho-h" className="sr-only">
        Night handover
      </h2>
      <Panel>
        <PanelHeader
          title="Night handover"
          code="RTM"
          actions={
            <AvatarGroup label="Watchers" size="sm" max={3} total={5}>
              {CREW18.map((c) => (
                <Avatar key={c.code} name={c.name} />
              ))}
            </AvatarGroup>
          }
        />
        <PanelBody flush>
          <ItemList layout="cell">
            {CREW18.map((c) => (
              <Item key={c.code}>
                <ItemMedia>
                  <Avatar name={c.name} status={c.status} decorative />
                </ItemMedia>
                <ItemContent
                  title={
                    <HoverCard>
                      <HoverCardTrigger href={`#person-${c.code}`}>{c.name}</HoverCardTrigger>
                      <HoverCardPopup>
                        <HoverCardHeader
                          media={<Avatar layout="cell" name={c.name} decorative />}
                          title={c.name}
                          description={c.role}
                          code={c.code}
                        />
                        <HoverCardFacts
                          facts={[
                            ["Open shipments", c.open],
                            ["Status", c.status],
                          ]}
                        />
                      </HoverCardPopup>
                    </HoverCard>
                  }
                  description={c.role}
                />
                <ItemMeta>{c.open} open</ItemMeta>
              </Item>
            ))}
          </ItemList>
        </PanelBody>
      </Panel>
      <Card>
        <CardHeader>
          <CardTitle>Confirm handover</CardTitle>
          <CardDescription>Enter the code sent to the incoming planner.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onFormSubmit={(v) => notify({ title: `Handover confirmed: ${String(v.handover)}.` })}>
            <OtpField
              label="Handover code"
              name="handover"
              length={4}
              required
              validate={(v) => (v === "4821" ? null : "That code doesn't match the latest message.")}
            />
            <FormActions>
              <Button type="submit" variant="primary">
                Confirm
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}

/* ---------- manifest lookup. An input group (search affix, clear Button cell, match-case Toggle cell,
   a FieldBar with a Kbd hint), a NativeSelect in a Form, all inside a stock shadcn Card ---------- */
function ManifestLookup() {
  const notify = useToast();
  const [q, setQ] = React.useState("");
  const [exact, setExact] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);
  return (
    <section aria-labelledby="ml-h">
      <h2 id="ml-h" className="sr-only">
        Manifest lookup
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Manifest lookup</CardTitle>
          <CardDescription>Search one terminal's manifests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            onFormSubmit={(v) =>
              notify({ title: `Lookup: ${String(v.terminal)} · ${String(v.q)}${exact ? " · exact" : ""}.` })
            }
          >
            <NativeSelect
              label="Terminal"
              name="terminal"
              placeholder="Choose a terminal"
              required
              options={[
                { value: "RTM-ECT", label: "ECT Delta" },
                { value: "ANR-PSA", label: "PSA Europa Terminal" },
              ]}
            />
            <Field>
              <FieldLabel>Container or booking</FieldLabel>
              <FieldFrame>
                <FieldControl ref={input} name="q" value={q} onChange={(e) => setQ(e.target.value)} />
                {q ? (
                  <Button
                    layout="cell"
                    size="icon"
                    aria-label="Clear"
                    onClick={() => {
                      setQ("");
                      input.current?.focus();
                    }}
                  >
                    ×
                  </Button>
                ) : null}
                <Toggle layout="cell" icon pressed={exact} onPressedChange={setExact} aria-label="Exact match">
                  =
                </Toggle>
                <FieldBar>
                  <FieldAffix>
                    <span>
                      Press <Kbd>Enter</Kbd> to search
                    </span>
                  </FieldAffix>
                </FieldBar>
              </FieldFrame>
            </Field>
            <p className="text-sm">
              Open the command menu with{" "}
              <KbdGroup>
                <Kbd label="Command">⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </p>
            <FormActions>
              <Button type="submit" variant="primary">
                Search
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}

/* ---------- yard planner. A site NavigationMenu above a stock shadcn Card holding a Resizable
   split (a collapsible block list beside the bay view), sizes kept in the app's state ---------- */
function YardPlanner() {
  const [layout, setLayout] = React.useState<Record<string, number>>({ blocks: 30, bay: 70 });
  return (
    <section aria-labelledby="yp-h" className="grid gap-3">
      <h2 id="yp-h" className="sr-only">
        Yard planner
      </h2>
      <NavigationMenu aria-label="Yard site">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Yards</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuGrid>
                <NavigationMenuCard
                  href="#yard-north"
                  title="North yard"
                  code="YN"
                  description="Reefer stacks and empties."
                  active
                />
                <NavigationMenuCard href="#yard-south" title="South yard" code="YS" description="Dry boxes, export." />
              </NavigationMenuGrid>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#reports">Reports</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Card>
        <CardHeader>
          <CardTitle>North yard</CardTitle>
          <CardDescription data-testid="yp-sizes">
            Blocks {Math.round(layout.blocks ?? 0)}% · bay {Math.round(layout.bay ?? 0)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: 180, border: "2px solid var(--kl-line)" }}>
            <ResizablePanelGroup onLayoutChange={setLayout}>
              <ResizablePanel id="blocks" defaultSize="30%" minSize="20%" maxSize="60%" collapsible>
                <p className="p-3 text-sm">A1 · A2 · B1 · B2</p>
              </ResizablePanel>
              <ResizableHandle withHandle aria-label="Blocks" />
              <ResizablePanel id="bay">
                <p className="p-3 text-sm">Bay B2-07: 4 high, 2 reefers</p>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/* ---------- carrier intake. A Questionnaire whose submission is tracked by a toast raised outside
   React (a module-level createToaster, docked in the section), a sidebar with nested links and a row action,
   a button group, a pending marker, an alert dialog and an RTL region under DirectionProvider ---------- */
const intakeToaster = createToaster();
const INTAKE = [
  { name: "mode", required: true, choices: [{ value: "road" }, { value: "rail" }] },
  { name: "ref" },
] as const;
/** Not a component: the way a data layer would report a submission. */
function sendIntake(fd: FormData) {
  const mode = fd.get("mode");
  return intakeToaster.promise(
    new Promise<string>((ok) => setTimeout(() => ok(typeof mode === "string" ? mode : ""), 500)),
    {
      loading: "Sending intake…",
      done: (mode) => ({ title: "Intake sent", description: `Mode: ${mode}` }),
      failed: "Intake failed",
    },
  );
}
function Intake() {
  const [place, setPlace] = React.useState("open");
  const [views, setViews] = React.useState(["Reefers", "Hazmat"]);
  const [page, setPage] = React.useState(1);
  return (
    <section aria-labelledby="in-h" className="grid gap-4">
      <h2 id="in-h" className="text-lg font-semibold">
        Carrier intake
      </h2>
      <ToastProvider toastManager={intakeToaster}>
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Questionnaire
            items={INTAKE}
            onSubmit={(e) => {
              e.preventDefault();
              sendIntake(new FormData(e.currentTarget));
            }}
            aria-label="Intake"
          >
            <QuestionnaireProgress />
            <QuestionnaireItem name="mode" required>
              <QuestionnaireTitle>Which mode?</QuestionnaireTitle>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="road">Road</QuestionnaireChoice>
                <QuestionnaireChoice value="rail">Rail</QuestionnaireChoice>
              </QuestionnaireChoices>
              <QuestionnaireError>Choose a mode.</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="ref">
              <QuestionnaireTitle>Booking reference</QuestionnaireTitle>
              <QuestionnaireInput placeholder="BK-…" />
              <QuestionnaireError>Enter a reference or Skip.</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireActions>
              <QuestionnairePrevious />
              <QuestionnaireSkip />
              <QuestionnaireNext />
              <QuestionnaireSubmit />
            </QuestionnaireActions>
          </Questionnaire>
          <div className="grid gap-4">
            <div className="flex flex-wrap items-start gap-4">
              <ButtonGroup aria-label="Intake pages">
                <Button layout="cell" onClick={() => setPage(Math.max(1, page - 1))}>
                  Previous
                </Button>
                <ButtonGroupText>Page {page}</ButtonGroupText>
                <Button layout="cell" onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </ButtonGroup>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" />}>Discard intake…</AlertDialogTrigger>
                <AlertDialogContent
                  title="Discard this intake?"
                  cancelLabel="Keep"
                  confirmLabel="Discard"
                  onConfirm={() => intakeToaster.notify({ title: "Intake discarded" })}
                />
              </AlertDialog>
            </div>
            <Marker pending>
              <MarkerContent>Checking carrier insurance…</MarkerContent>
            </Marker>
            <DirectionProvider direction="rtl">
              <div data-testid="in-rtl" className="flex gap-4">
                <Tooltip side="inline-end" content="إرسال">
                  <Button>إرسال</Button>
                </Tooltip>
              </div>
            </DirectionProvider>
            <div className="flex h-12" data-testid="in-dock">
              <ToastDock aria-label="Intake messages" className="flex-1" />
            </div>
          </div>
        </div>
      </ToastProvider>
      <div className="w-[900px] max-w-full" data-testid="in-shell">
        <AppShell
          narrowAt={500}
          asideInlineAt={2000}
          collapse="rail"
          nav={
            <Nav
              layout="cell"
              label="Intake"
              value={place}
              onValueChange={setPlace}
              groups={[
                {
                  label: "Queues",
                  items: [
                    { value: "open", label: "Open" },
                    {
                      value: "triage",
                      label: "Triage",
                      items: [
                        { value: "new", label: "New" },
                        { value: "stale", label: "Stale" },
                      ],
                    },
                  ],
                },
                {
                  label: "Views",
                  items: views.map((v) => ({
                    value: v,
                    label: v,
                    action: (
                      <Menu>
                        <MenuTrigger render={<NavAction label={`More for ${v}`} />} />
                        <MenuPopup align="end" attachWeight={1}>
                          <MenuItem onClick={() => setViews(views.filter((x) => x !== v))}>Remove</MenuItem>
                        </MenuPopup>
                      </Menu>
                    ),
                  })),
                },
              ]}
            />
          }
          header={<span className="px-3 font-semibold">{place}</span>}
        >
          <div className="min-h-64" />
        </AppShell>
      </div>
    </section>
  );
}

/* ---------- async carrier search. The source holds every request on window.__klc
   until flows.mjs settles it, and ignores the abort signal, so a superseded response really arrives late. ---------- */
type HeldSearch = { field: string; q: string; aborted: boolean; settle: () => void };
const CARRIER_NAMES = ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "Evergreen", "ONE", "COSCO"];
function heldSearch<T>(field: string, make: (label: string) => T) {
  return (q: string, signal: AbortSignal) =>
    new Promise<T[]>((resolve) => {
      const r: HeldSearch = {
        field,
        q,
        aborted: false,
        settle: () => resolve(CARRIER_NAMES.filter((c) => c.toLowerCase().includes(q.toLowerCase())).map(make)),
      };
      signal.addEventListener("abort", () => (r.aborted = true));
      const w = window as unknown as { __klc?: HeldSearch[] };
      (w.__klc ??= []).push(r);
    });
}
const searchCarrier = heldSearch("cs-cb", (label): ComboboxOption => ({ value: label, label }));
const searchCarriers = heldSearch("cs-ms", (label): MultiselectOption => ({ value: label, label }));

function CarrierSearch() {
  const [carrier, setCarrier] = React.useState<string | null>(null);
  const [carriers, setCarriers] = React.useState<string[]>([]);
  return (
    <section className="grid gap-3 sm:grid-cols-2" aria-label="Carrier search">
      <div className="grid gap-1" data-testid="cs-cb">
        <Combobox
          label="Booking carrier"
          noun={["carrier", "carriers"]}
          loadOptions={searchCarrier}
          value={carrier}
          onValueChange={setCarrier}
        />
        <output data-testid="cs-cb-value">{carrier ?? "none"}</output>
      </div>
      <div className="grid gap-1" data-testid="cs-ms">
        <Multiselect
          label="Partner carriers"
          noun={["carrier", "carriers"]}
          loadOptions={searchCarriers}
          onValueChange={(v) => setCarriers(v.map((o) => o.value))}
        />
        <output data-testid="cs-ms-value">{carriers.join(",") || "none"}</output>
      </div>
    </section>
  );
}
