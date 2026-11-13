// The playground's representative composition. It uses ONLY public Keyline components and Tailwind
// utilities for page layout, so the consumer test can copy it verbatim (imports rewritten from
// @/registry/keyline/ to @/components/keyline/) and screenshot it against the installed CSS.
import * as React from "react";

import { Button, ButtonAffix } from "@/registry/keyline/ui/button";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  SplitButtonPopup,
  SplitButtonTrigger,
} from "@/registry/keyline/ui/split-button";
import { Menu, MenuTrigger, MenuPopup, MenuItem, MenuSeparator } from "@/registry/keyline/ui/menu";
import { Segmented, SegmentedItem } from "@/registry/keyline/ui/segmented";
import { ToggleGroup, ToggleGroupItem } from "@/registry/keyline/ui/toggle-group";
import {
  Field,
  FieldLabel,
  FieldFrame,
  FieldControl,
  FieldAffix,
  FieldDescription,
  FieldError,
} from "@/registry/keyline/ui/field";
import { Select } from "@/registry/keyline/ui/select";
import { RadioGroup, RadioGroupItem } from "@/registry/keyline/ui/radio-group";
import { CheckboxField } from "@/registry/keyline/ui/checkbox";
import { SwitchField, Switch } from "@/registry/keyline/ui/switch";
import { DatePicker } from "@/registry/keyline/ui/date-picker";
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
} from "@/registry/keyline/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPopup,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/registry/keyline/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverClose,
} from "@/registry/keyline/ui/popover";
import { Tooltip, TooltipProvider } from "@/registry/keyline/ui/tooltip";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/registry/keyline/ui/tabs";
import { Nav } from "@/registry/keyline/ui/nav";
import { Notice } from "@/registry/keyline/ui/notice";
import { ItemList, Item, ItemMedia, ItemContent, ItemMeta, ItemActions } from "@/registry/keyline/ui/item";
import { ScrollArea } from "@/registry/keyline/ui/scroll-area";
import { Panel, PanelHeader, PanelBody, PanelFooter, PanelGrid } from "@/registry/keyline/ui/panel";
import { Stat, Meter } from "@/registry/keyline/ui/stat";
import { Status, Badge } from "@/registry/keyline/ui/status";
import {
  TableFrame,
  TableViews,
  TableToolbar,
  TableSearch,
  TableBulkBar,
  TableScroll,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableIndexCell,
} from "@/registry/keyline/ui/table";
import { ToastProvider, ToastFloating, useToast } from "@/registry/keyline/ui/toast";

/** Fixed "today" so screenshots of the preview and the installed consumer are comparable. */
export const PREVIEW_TODAY = new Date(2026, 10, 9);

export function Preview() {
  return (
    <TooltipProvider>
      <ToastProvider>
        {/* layout follows the preview's own width (container queries), not the viewport: the same at 390px
            in the playground's narrow frame as on a phone, and inside any column of a consumer's app */}
        <div className="@container/preview grid min-w-0 gap-6" data-slot="preview">
          <Actions />
          <div className="grid items-start gap-6 @5xl/preview:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <Settings />
            <Records />
          </div>
          <div className="grid items-start gap-6 @3xl/preview:grid-cols-[220px_minmax(0,1fr)]">
            <Nav
              label="Workspace"
              header="Acme Freight"
              orientation="responsive"
              className="self-start"
              value="orders"
              items={[
                { value: "orders", label: "Orders", count: 42 },
                { value: "carriers", label: "Carriers" },
                { value: "reports", label: "Reports" },
                { value: "settings", label: "Settings" },
              ]}
            />
            <div className="grid min-w-0 gap-6">
              <Feedback />
              <div className="grid items-start gap-6 @6xl/preview:grid-cols-2">
                <Integrations />
                <Dashboard />
              </div>
              <Activity />
            </div>
          </div>
        </div>
        <ToastFloating />
      </ToastProvider>
    </TooltipProvider>
  );
}

/* ---------- actions: buttons, connected actions, overlays ---------- */
function Actions() {
  const [signal, setSignal] = React.useState<"idle" | "pending" | "done" | "failed">("idle");
  const [view, setView] = React.useState("week");
  const run = (end: "done" | "failed") => {
    setSignal("pending");
    setTimeout(() => {
      setSignal(end);
      setTimeout(() => setSignal("idle"), 1400);
    }, 700);
  };
  return (
    <div className="flex flex-wrap items-start gap-3" data-slot="preview-actions">
      <Button variant="primary" signal={signal} onClick={() => run("done")}>
        Assign carrier <ButtonAffix>3</ButtonAffix>
      </Button>
      <Button onClick={() => run("failed")}>Retry sync</Button>
      <SplitButton>
        <SplitButtonAction>Export</SplitButtonAction>
        <SplitButtonMenu>
          <SplitButtonTrigger aria-label="More export formats" />
          <SplitButtonPopup>
            <MenuItem code="1" shortcut="C">
              CSV
            </MenuItem>
            <MenuItem code="2">Excel workbook</MenuItem>
            <MenuSeparator />
            <MenuItem code="3" disabled description="Needs an admin">
              Scheduled export
            </MenuItem>
          </SplitButtonPopup>
        </SplitButtonMenu>
      </SplitButton>
      <Segmented aria-label="Period" value={view} onValueChange={setView}>
        <SegmentedItem value="day">Day</SegmentedItem>
        <SegmentedItem value="week">Week</SegmentedItem>
        <SegmentedItem value="quarter">Fiscal quarter</SegmentedItem>
      </Segmented>
      <ToggleGroup aria-label="Show" defaultValue={["late"]}>
        <ToggleGroupItem value="late" count={7}>
          Late
        </ToggleGroupItem>
        <ToggleGroupItem value="hazmat">Hazmat</ToggleGroupItem>
      </ToggleGroup>
      <BookDialog />
      <CarrierSheet />
      <Tooltip content="Disabled while the import runs" side="bottom">
        <Button variant="quiet" disabled focusableWhenDisabled>
          Archive
        </Button>
      </Tooltip>
    </div>
  );
}

function BookDialog() {
  const notify = useToast();
  const [open, setOpen] = React.useState(false);
  const [day, setDay] = React.useState<Date | null>(PREVIEW_TODAY);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Book pickup…</DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Book a pickup</DialogTitle>
          <DialogDescription>
            The carrier confirms the slot by email. Nothing is charged until the driver scans the first pallet.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>Reference</FieldLabel>
            <FieldFrame>
              <FieldControl defaultValue="PO-4102" />
            </FieldFrame>
          </Field>
          <Select
            label="Carrier"
            defaultValue="dhl"
            options={[
              { value: "dhl", label: "DHL Freight", code: "DHL" },
              { value: "dsv", label: "DSV Road", code: "DSV" },
              { value: "rhenus", label: "Rhenus Road", code: "RHE", description: "Max. 5 pallets", disabled: true },
            ]}
          />
          <DatePicker
            label="Pickup day"
            name="pickup"
            value={day}
            onValueChange={setDay}
            today={PREVIEW_TODAY}
            isDateUnavailable={(d) => d.getDay() === 0 && "Depot closed"}
          />
          <RadioGroup defaultValue="am" aria-label="Slot" name="slot">
            <RadioGroupItem value="am" label="08:00–10:00" meta="€" />
            <RadioGroupItem value="pm" label="14:00–16:00" meta="€€" />
          </RadioGroup>
          <CheckboxField label="Tail-lift needed" description="Adds 20 minutes to the slot." />
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button layout="cell" variant="quiet" />}>Cancel</DialogClose>
          <Button
            layout="cell"
            variant="primary"
            onClick={() => {
              setOpen(false);
              notify({ title: "Pickup booked for 9 Nov, 08:00–10:00.", action: { label: "Undo", onClick: () => {} } });
            }}
          >
            Book pickup
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function CarrierSheet() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="quiet" />}>Carrier details</SheetTrigger>
      <SheetPopup>
        <SheetHeader>
          <SheetTitle>DHL Freight</SheetTitle>
          <SheetDescription>Contract FR-2291 · renews 1 March 2027</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <Notice
            tone="attention"
            title="Insurance certificate expires in 6 days"
            description="Upload the renewed certificate, or new bookings pause on 15 November."
          />
          <PanelGrid min={140}>
            <Stat label="On time" value="94.2" unit="%" />
            <Stat label="Open claims" value="2" />
          </PanelGrid>
          <Field>
            <FieldLabel>Account manager</FieldLabel>
            <FieldFrame>
              <FieldControl defaultValue="Ines Brandt" />
            </FieldFrame>
          </Field>
          <SwitchField label="Allow weekend pickups" description="Saturday 08:00–12:00 only." defaultChecked />
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button layout="cell" variant="quiet" />}>Close</SheetClose>
          <Button layout="cell" variant="primary">
            Upload certificate
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  );
}

/* ---------- settings form: fields, validation, selection controls ---------- */
function Settings() {
  const [email, setEmail] = React.useState("ops@acme");
  const [saving, setSaving] = React.useState<"idle" | "pending" | "done">("idle");
  const invalid = !/^\S+@\S+\.\S+$/.test(email);
  return (
    <Panel aria-labelledby="pv-settings">
      <PanelHeader
        title={<span id="pv-settings">Delay alerts</span>}
        code="SET-02"
        description="Who hears about late shipments, and how often."
      />
      <PanelBody>
        <Field invalid={invalid}>
          <FieldLabel>Alert address</FieldLabel>
          <FieldFrame>
            <FieldControl value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </FieldFrame>
          {invalid ? (
            <FieldError match>Enter a full address, like ops@acme.com.</FieldError>
          ) : (
            <FieldDescription>Delays over 4 hours go here first.</FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel>Escalate after</FieldLabel>
          <FieldFrame>
            <FieldControl defaultValue="4" inputMode="numeric" align="end" />
            <FieldAffix>hours</FieldAffix>
          </FieldFrame>
        </Field>
        <Select
          label="Escalate to"
          defaultValue="lead"
          options={[
            { value: "lead", label: "Shift lead", code: "L1" },
            { value: "mgr", label: "Operations manager for the Rhine–Rhône corridor", code: "L2" },
            { value: "none", label: "Nobody", description: "Alerts stay in the inbox" },
          ]}
        />
        <RadioGroup defaultValue="daily" aria-label="Digest" name="digest">
          <RadioGroupItem value="live" label="Live" description="Every change, as it happens" />
          <RadioGroupItem value="daily" label="Daily digest" description="07:00, local time" meta="1×" />
          <RadioGroupItem value="weekly" label="Weekly digest" description="Mondays" meta="1/7" disabled />
        </RadioGroup>
        <div className="grid">
          <SwitchField label="Email alerts" description="One message per delayed shipment." defaultChecked />
          <SwitchField label="SMS alerts" description="Needs a verified number." disabled />
          <CheckboxField label="Include cancelled shipments" />
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
          onClick={() => {
            setSaving("pending");
            setTimeout(() => {
              setSaving("done");
              setTimeout(() => setSaving("idle"), 900);
            }, 600);
          }}
        >
          Save changes
        </Button>
      </PanelFooter>
    </Panel>
  );
}

/* ---------- records: views, filter popover, selection, row menu ---------- */
const ROWS = [
  {
    id: "PO-4101",
    customer: "Northwind Traders",
    lane: "HAM → LYO",
    status: "normal",
    label: "In transit",
    eta: "Mon 9",
  },
  { id: "PO-4102", customer: "Contoso", lane: "RTM → MAD", status: "attention", label: "Customs hold", eta: "—" },
  {
    id: "PO-4103",
    customer: "Fabrikam Industrial Supplies and Logistics GmbH",
    lane: "ANR → WAW",
    status: "waiting",
    label: "Awaiting docs",
    eta: "Wed 11",
  },
  { id: "PO-4104", customer: "Tailspin", lane: "GOT → MIL", status: "done", label: "Delivered", eta: "Fri 6" },
  { id: "PO-4105", customer: "Wingtip", lane: "HAM → LYO", status: "normal", label: "In transit", eta: "Tue 10" },
] as const;

function Records() {
  const [selected, setSelected] = React.useState(() => new Set(["PO-4102", "PO-4103"]));
  const [view, setView] = React.useState("all");
  const toggle = (id: string, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  const all = selected.size === ROWS.length;
  return (
    <TableFrame aria-label="Shipments">
      <TableViews
        label="Status"
        value={view}
        onValueChange={setView}
        views={[
          { value: "all", label: "All", count: 64 },
          { value: "late", label: "Late", count: 7 },
          { value: "hold", label: "On hold", count: 2 },
        ]}
      />
      <TableToolbar>
        <TableSearch label="Search shipments" placeholder="Search ID, customer, lane" />
        <FilterPopover />
      </TableToolbar>
      <TableBulkBar count={selected.size} scope={<span>{selected.size} selected.</span>}>
        <Button layout="cell" disabled={!selected.size}>
          Reassign <ButtonAffix>{selected.size}</ButtonAffix>
        </Button>
        <Button layout="cell" variant="destructive" disabled={!selected.size}>
          Cancel
        </Button>
      </TableBulkBar>
      <TableScroll>
        <Table>
          <TableHeader>
            <tr>
              <TableIndexCell
                header
                label="Select all"
                checked={all}
                indeterminate={!all && selected.size > 0}
                onCheckedChange={(v) => setSelected(v ? new Set(ROWS.map((r) => r.id)) : new Set())}
              />
              <TableHead>Shipment</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {ROWS.map((r, i) => (
              <TableRow key={r.id} selected={selected.has(r.id)}>
                <TableIndexCell
                  code={String(i + 1).padStart(2, "0")}
                  label={`Select ${r.id}`}
                  checked={selected.has(r.id)}
                  onCheckedChange={(v) => toggle(r.id, v)}
                />
                <TableCell>
                  <span className="kl-code">{r.id}</span>
                </TableCell>
                <TableCell>{r.customer}</TableCell>
                <TableCell>
                  <Status kind={r.status}>{r.label}</Status>
                </TableCell>
                <TableCell>{r.eta}</TableCell>
                <TableCell>
                  <Menu>
                    <MenuTrigger render={<Button size="icon" variant="quiet" aria-label={`Actions for ${r.id}`} />}>
                      ⋯
                    </MenuTrigger>
                    <MenuPopup align="end">
                      <MenuItem code="1" shortcut="R">
                        Reschedule
                      </MenuItem>
                      <MenuItem code="2">Open documents</MenuItem>
                      <MenuSeparator />
                      <MenuItem code="3" variant="destructive">
                        Cancel shipment
                      </MenuItem>
                    </MenuPopup>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableScroll>
    </TableFrame>
  );
}

function FilterPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button layout="cell" />}>
        Filters <ButtonAffix>2</ButtonAffix>
      </PopoverTrigger>
      <PopoverPopup align="end" attachWeight={1}>
        <PopoverHeader title="Filter shipments" description="Applies to every view." />
        <PopoverBody>
          <div className="grid">
            <CheckboxField label="Late only" defaultChecked />
            <CheckboxField label="Hazardous goods" defaultChecked />
            <CheckboxField label="Temperature controlled" />
          </div>
          <Select
            label="Carrier"
            defaultValue="any"
            options={[
              { value: "any", label: "Any carrier" },
              { value: "dhl", label: "DHL Freight" },
              { value: "dsv", label: "DSV Road" },
            ]}
          />
        </PopoverBody>
        <PopoverFooter>
          <PopoverClose render={<Button layout="cell" variant="quiet" />}>Clear</PopoverClose>
          <PopoverClose render={<Button layout="cell" variant="primary" />}>Apply</PopoverClose>
        </PopoverFooter>
      </PopoverPopup>
    </Popover>
  );
}

/* ---------- feedback: notices, status ---------- */
function Feedback() {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="grid gap-3" data-slot="preview-feedback">
      <Notice
        tone="attention"
        title="3 shipments are held at customs in Rotterdam"
        description="Commercial invoices are missing their HS codes. Shipments leave as soon as the documents are corrected."
        actions={
          <>
            <Button layout="cell" variant="primary">
              Fix documents
            </Button>
            <Button layout="cell">View shipments</Button>
          </>
        }
      />
      <Notice
        tone="info"
        open={open}
        onDismiss={() => setOpen(false)}
        title="Carrier rates update on 1 December"
        description="New DHL and DSV rate cards apply to bookings made from that day."
      />
      <Notice
        tone="done"
        title="Rate cards imported"
        description="214 lanes updated. 2 lanes kept their old rate because the new one was missing."
      />
    </div>
  );
}

/* ---------- a scrolling region inside a panel: Scroll Area ---------- */
const ACTIVITY = [
  ["08:02", "SH-20481", "Departed Hamburg hub", "DHL"],
  ["08:15", "SH-20482", "Held at customs: commercial invoice missing HS codes", "MSK"],
  ["08:31", "SH-20487", "Pickup booked for 9 Nov, 08:00–10:00", "DHL"],
  ["08:44", "SH-20484", "Awaiting export documents from the shipper", "RAB"],
  ["09:03", "SH-20489", "Delivered, signed by M. Costa", "K+N"],
  ["09:12", "SH-20485", "ETA moved from 15 Nov to 16 Nov", "MSK"],
  ["09:40", "SH-20490", "Temperature log uploaded (2–8 °C held)", "DBS"],
  ["10:05", "SH-20486", "Rate request sent to 3 carriers", "—"],
  ["10:18", "SH-20488", "Booked on DSV Road, trailer 44-RT-9", "DSV"],
  ["10:52", "SH-20483", "Weight corrected to 12,004.0 kg", "DHL"],
];
function Activity() {
  return (
    <Panel>
      <PanelHeader title="Activity" description="Today, newest last. Scrolls inside the panel." />
      <PanelBody flush>
        <ScrollArea className="h-56" label="Today's activity">
          <ItemList layout="cell">
            {ACTIVITY.map(([t, id, what, who]) => (
              <Item key={t}>
                <ItemMedia>{who}</ItemMedia>
                <ItemContent title={what} description={id} />
                <ItemMeta>{t}</ItemMeta>
              </Item>
            ))}
          </ItemList>
        </ScrollArea>
      </PanelBody>
    </Panel>
  );
}

function Integrations() {
  return (
    <Panel>
      <PanelHeader
        title="Integrations"
        description="Data that flows in and out of shipments."
        actions={<Badge tone="signal">3 LIVE</Badge>}
      />
      <PanelBody flush>
        <ItemList layout="cell">
          <Item current>
            <ItemMedia>ERP</ItemMedia>
            <ItemContent title="SAP S/4HANA" description="Orders and invoices, every 5 minutes" />
            <ItemMeta>2 min ago</ItemMeta>
            <ItemActions>
              <Switch aria-label="SAP S/4HANA sync" defaultChecked />
            </ItemActions>
          </Item>
          <Item>
            <ItemMedia>EDI</ItemMedia>
            <ItemContent title="Carrier EDI (DESADV, IFTSTA)" description="Status messages from 11 carriers" />
            <ItemMeta>live</ItemMeta>
            <ItemActions>
              <Switch aria-label="Carrier EDI" defaultChecked />
            </ItemActions>
          </Item>
          <Item render={<a href="#integrations" />}>
            <ItemMedia>+</ItemMedia>
            <ItemContent title="Connect a warehouse system" description="Manhattan, Blue Yonder or a CSV drop" />
          </Item>
        </ItemList>
      </PanelBody>
    </Panel>
  );
}

function Dashboard() {
  return (
    <Tabs defaultValue="today">
      <TabsList>
        <TabsTab value="today">Today</TabsTab>
        <TabsTab value="week" count={128}>
          This week
        </TabsTab>
      </TabsList>
      <TabsPanel value="today">
        <PanelGrid min={160}>
          <Stat
            label="Open shipments"
            value="64"
            delta={{ value: "+6", direction: "up", tone: "neutral", label: "6 more than yesterday" }}
          />
          <Stat
            label="Late"
            value="7"
            delta={{ value: "+3", direction: "up", tone: "bad", label: "3 more than yesterday" }}
          />
          <Stat label="Dock use" value="83" unit="%" meter={{ value: 83 }} />
          <Panel layout="cell">
            <PanelHeader title="Carrier slots" headingLevel={3} />
            <PanelBody>
              <Meter value={18} max={20} high={17} label="DHL" />
              <Meter value={6} max={20} label="DSV" />
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
  );
}
