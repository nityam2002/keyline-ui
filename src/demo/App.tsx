import * as React from "react";
import { changedByKey, tokenMs } from "@/registry/keyline/lib/keyline-motion";
import { cn } from "@/lib/utils";
import * as ui from "./demo-ui";

import { Button, ButtonAffix } from "@/registry/keyline/ui/button";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  SplitButtonPopup,
  SplitButtonTrigger,
} from "@/registry/keyline/ui/split-button";
import { MenuItem, MenuSeparator } from "@/registry/keyline/ui/menu";
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
  FieldGroup,
  FieldGroupPart,
  FieldGroupJoin,
} from "@/registry/keyline/ui/field";
import { Multiselect } from "@/registry/keyline/ui/multiselect";
import { RangeCalendar, DateRangePicker, type DateRange } from "@/registry/keyline/ui/date-range";
import {
  TableFrame,
  TableViews,
  TableBulkBar,
  TableScroll,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableIndexCell,
  TableExpandCell,
  TableDetail,
  useDetailPresence,
  TableState,
  TablePager,
  Status,
} from "@/registry/keyline/ui/table";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/registry/keyline/ui/dialog";
import { Inspector, InspectorHeader, InspectorFacts, InspectorActions } from "@/registry/keyline/ui/inspector";
import { Checkbox, CheckboxField } from "@/registry/keyline/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/registry/keyline/ui/radio-group";
import { Switch, SwitchField } from "@/registry/keyline/ui/switch";
import { Select } from "@/registry/keyline/ui/select";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/registry/keyline/ui/tabs";
import { Tooltip } from "@/registry/keyline/ui/tooltip";
import { Panel, PanelHeader, PanelBody, PanelFooter, PanelGrid } from "@/registry/keyline/ui/panel";
import { Stat, Meter } from "@/registry/keyline/ui/stat";
import { Badge } from "@/registry/keyline/ui/status";
import { Nav } from "@/registry/keyline/ui/nav";
import { ScrollArea } from "@/registry/keyline/ui/scroll-area";
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
} from "@/registry/keyline/ui/popover";
import { Shipments } from "@/registry/keyline/blocks/shipments/shipments";
import { Playground } from "./playground/Playground";
import { revealFocus } from "./reveal-focus";
import { SelectMore } from "./specimens/select";
import { ComboboxSpecimen } from "./specimens/combobox";
import { SliderSpecimen } from "./specimens/slider";
import { DisclosureSpecimen } from "./specimens/accordion-collapsible";
import { ContextMenuSpecimen } from "./specimens/context-menu";
import { ProgressSpecimen } from "./specimens/progress";
import { NumberFieldSpecimen } from "./specimens/number-field";
import { MenuChoicesSpecimen } from "./specimens/menu-choices";
import { EmptySpecimen } from "./specimens/empty";
import { FormSpecimen } from "./specimens/form";
import { SortTableSpecimen } from "./specimens/table-sort";
import { WayfindingSpecimen } from "./specimens/breadcrumb-pagination";
import { FieldParticipantsSpecimen } from "./specimens/form-participants";
import { SkeletonSpecimen } from "./specimens/skeleton";
import { ScrollEdgesSpecimen } from "./specimens/scroll-edges";
import { AppShellSpecimen } from "./specimens/app-shell";
import { TimeFieldSpecimen } from "./specimens/time-field";
import { MenubarSpecimen } from "./specimens/menubar";
import { ToolbarSpecimen } from "./specimens/toolbar";
import { CheckboxGroupSpecimen } from "./specimens/checkbox-group";
import { ToolbarOverflowSpecimen } from "./specimens/toolbar-overflow";
import { MultiSortSpecimen } from "./specimens/table-multi-sort";
import { TimeCycleSpecimen } from "./specimens/time-field-12-hour";
import { DateTimeSpecimen } from "./specimens/date-time-picker";
import { SliderAttentionSpecimen } from "./specimens/slider-attention";
import { MonthJumpSpecimen } from "./specimens/calendar-month-year";
import { TimeBoundsSpecimen } from "./specimens/time-field-bounds";
import { AvatarSpecimen } from "./specimens/avatar";
import { HoverCardSpecimen } from "./specimens/hover-card";
import { OtpSpecimen } from "./specimens/otp-field";
import { InputGroupSpecimen } from "./specimens/input-group";
import { NativeSelectSpecimen } from "./specimens/native-select";
import { KbdSpecimen } from "./specimens/kbd";
import { CommandSpecimen } from "./specimens/command";
import { ToggleSpecimen } from "./specimens/toggle";
import { ResizableSpecimen } from "./specimens/resizable";
import { NavigationMenuSpecimen } from "./specimens/navigation-menu";
import { GroupOverflowSpecimen } from "./specimens/toolbar-group-overflow";
import { TimeSlotsSpecimen } from "./specimens/date-time-picker-slots";
import { VerticalOverflowSpecimen } from "./specimens/toolbar-vertical";
import { CarouselSpecimen } from "./specimens/carousel";
import { ChartSpecimen } from "./specimens/chart";
import { ChatSpecimen } from "./specimens/chat";
import { DrawerSpecimen } from "./specimens/drawer";
import { TugCompare, SeedCompare, RowsLeaveReturn, ReleaseDrawer } from "./specimens/motion-lab";
import { ScrollAreaSpecimen } from "./specimens/scroll-area";
import { AsyncRaceSpecimen } from "./specimens/combobox-async";
import { QuestionnaireSpecimen } from "./specimens/questionnaire";
import { DialogSpecimen, AlertDialogSpecimen } from "./specimens/dialog";
import { SidebarSpecimen } from "./specimens/sidebar";
import { ToastSpecimen } from "./specimens/toast";
import { ButtonGroupSpecimen } from "./specimens/button-group";
import { MarkerSpecimen } from "./specimens/marker";
import { DirectionSpecimen } from "./specimens/direction";
import { CARRIERS, TODAY, isUnavailable, searchCarriers } from "@/registry/keyline/blocks/shipments/shipments-data";

/* ------------------------------------------------------------------ *
 * Demo shell. All configuration is on <html>, so portaled surfaces
 * (menus, listboxes, dialogs, toasts) inherit it like everything else.
 * ------------------------------------------------------------------ */
type Cfg = {
  theme: "light" | "dark";
  cut: "on" | "quiet" | "off";
  density: "default" | "compact";
  motion: "normal" | "slow" | "reduce";
  dir: "ltr" | "rtl";
};
const ROUTES = [
  ["specimen", "Specimen"],
  ["app", "Application"],
  ["motion", "Motion lab"],
  ["playground", "Playground"],
] as const;
/* routes that are exactly one viewport tall and scroll inside Keyline scroll areas (wide layouts only) */
const FIT = new Set(["specimen", "motion", "playground"]);

/* a long list: navigation to off-screen options, reopening with a selection far down */
const PORTS = [
  "Antwerp",
  "Bremerhaven",
  "Hamburg",
  "Rotterdam",
  "Le Havre",
  "Felixstowe",
  "Gdańsk",
  "Valencia",
  "Algeciras",
  "Piraeus",
  "Genoa",
  "Barcelona",
  "Marseille-Fos",
  "Gioia Tauro",
  "Zeebrugge",
  "Southampton",
  "London Gateway",
  "Wilhelmshaven",
  "Gothenburg",
  "Aarhus",
  "Klaipėda",
  "Constanța",
  "Koper",
  "Trieste",
  "Sines",
  "Lisbon",
  "Bilbao",
  "Dublin",
  "Tallinn",
  "Riga",
  "Szczecin",
  "Duisburg (inland)",
  "Basel (inland)",
  "Mannheim (inland)",
  "Liège (inland)",
  "Vienna (inland)",
  "Budapest (inland)",
  "Belgrade (inland)",
  "Linz (inland)",
  "Nuremberg (inland)",
].map((l, i) => ({ value: `p${i}`, label: l, code: `P${String(i + 1).padStart(2, "0")}`, disabled: i === 7 }));

type Route = (typeof ROUTES)[number][0];
const toRoute = (h: string): Route => (ROUTES.some(([r]) => r === h) ? (h as Route) : "specimen");
const PAGES: Record<Route, React.ReactNode> = {
  specimen: <Specimen />,
  app: <Shipments />,
  motion: <MotionLab />,
  playground: <Playground />,
};

function useHash() {
  const [h, setH] = React.useState(() => toRoute(location.hash.replace(/^#\/?/, "")));
  React.useEffect(() => {
    const on = () => setH(toRoute(location.hash.replace(/^#\/?/, "")));
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return h;
}

function readCfg(): Cfg {
  const p = new URLSearchParams(location.search);
  return {
    theme: p.get("theme") === "dark" ? "dark" : "light",
    cut: (p.get("cut") as Cfg["cut"]) || "off",
    density: p.get("density") === "compact" ? "compact" : "default",
    motion: (p.get("motion") as Cfg["motion"]) || "normal",
    dir: p.get("dir") === "rtl" ? "rtl" : "ltr",
  };
}

const DEFAULT_CFG: Cfg = { theme: "light", cut: "off", density: "default", motion: "normal", dir: "ltr" };

/** One labelled exclusive setting of the display popover. */
function DisplaySetting<K extends keyof Cfg>({
  k,
  label,
  cfg,
  set,
  options,
}: {
  k: K;
  label: string;
  cfg: Cfg;
  set: (c: Partial<Cfg>) => void;
  options: [Cfg[K], string][];
}) {
  const id = React.useId();
  return (
    <div className="grid justify-items-start gap-1.5">
      <span id={id} className="text-[12px] font-bold text-kl-ink-2">
        {label}
      </span>
      <Segmented
        size="compact"
        aria-labelledby={id}
        value={cfg[k]}
        onValueChange={(v) => set({ [k]: v } as Partial<Cfg>)}
      >
        {options.map(([v, l]) => (
          <SegmentedItem key={v} value={v}>
            {l}
          </SegmentedItem>
        ))}
      </Segmented>
    </div>
  );
}

function Bar({
  cfg,
  set,
  route,
  prefetch,
}: {
  cfg: Cfg;
  set: (c: Partial<Cfg>) => void;
  route: string;
  prefetch: (r: Route) => void;
}) {
  const changed = (Object.keys(DEFAULT_CFG) as (keyof Cfg)[]).filter((k) => cfg[k] !== DEFAULT_CFG[k]).length;
  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-kl-gutter">
      <a
        className="pe-1 text-[17px] font-[weight:var(--kl-weight-display,800)] tracking-[-0.01em] text-kl-ink no-underline focus-visible:[outline:var(--kl-ring)_solid_var(--kl-focus)] focus-visible:outline-offset-2"
        href="#/specimen"
      >
        Keyline
      </a>
      {/* intent: pointing at or focusing a page's link starts rendering it, hidden, so the switch only reveals it */}
      <div
        className="contents"
        onPointerOver={(e) => {
          const r = (e.target as Element).closest("a")?.getAttribute("href")?.slice(2);
          if (r) prefetch(toRoute(r));
        }}
        onFocus={(e) => {
          const r = e.target.closest("a")?.getAttribute("href")?.slice(2);
          if (r) prefetch(toRoute(r));
        }}
      >
        <Nav
          label="Demo pages"
          orientation="horizontal"
          className="max-w-full min-w-0 [@media(max-width:720px)]:order-3 [@media(max-width:720px)]:basis-full"
          value={route}
          items={ROUTES.map(([r, l]) => ({ value: r, label: l, href: `#/${r}` }))}
        />
      </div>
      {/* the playground carries its own configuration; this applies to the rest of the demo, overlays included */}
      {route !== "playground" ? (
        <Popover>
          <PopoverTrigger render={<Button className="ms-auto" />}>
            Display {changed ? <ButtonAffix>{changed}</ButtonAffix> : null}
          </PopoverTrigger>
          <PopoverPopup align="end" className="w-[min(360px,calc(100vw-24px))]">
            <PopoverHeader title="Display" description="Applies to every page here, overlays included." />
            <PopoverBody>
              <DisplaySetting
                k="cut"
                label="Cut"
                cfg={cfg}
                set={set}
                options={[
                  ["off", "Off"],
                  ["quiet", "Quiet"],
                  ["on", "Full"],
                ]}
              />
              <DisplaySetting
                k="theme"
                label="Theme"
                cfg={cfg}
                set={set}
                options={[
                  ["light", "Light"],
                  ["dark", "Dark"],
                ]}
              />
              <DisplaySetting
                k="density"
                label="Density"
                cfg={cfg}
                set={set}
                options={[
                  ["default", "Default"],
                  ["compact", "Compact"],
                ]}
              />
              <DisplaySetting
                k="motion"
                label="Motion"
                cfg={cfg}
                set={set}
                options={[
                  ["normal", "Normal"],
                  ["slow", "×8 slow"],
                  ["reduce", "Reduced"],
                ]}
              />
              <DisplaySetting
                k="dir"
                label="Direction"
                cfg={cfg}
                set={set}
                options={[
                  ["ltr", "LTR"],
                  ["rtl", "RTL"],
                ]}
              />
            </PopoverBody>
            <PopoverFooter>
              <Button layout="cell" variant="quiet" disabled={!changed} onClick={() => set(DEFAULT_CFG)}>
                Reset to defaults
              </Button>
            </PopoverFooter>
          </PopoverPopup>
        </Popover>
      ) : null}
    </header>
  );
}

export function App() {
  const route = useHash();
  const [cfg, setCfg] = React.useState<Cfg>(readCfg);
  React.useLayoutEffect(() => {
    const h = document.documentElement;
    h.classList.toggle("dark", cfg.theme === "dark");
    h.dataset["klCut"] = cfg.cut;
    if (cfg.density === "compact") h.dataset["klDensity"] = "compact";
    else delete h.dataset["klDensity"];
    if (cfg.motion === "normal") delete h.dataset["klMotion"];
    else h.dataset["klMotion"] = cfg.motion;
    h.dir = cfg.dir;
    const p = new URLSearchParams();
    Object.entries(cfg).forEach(([k, v]) => p.set(k, v));
    history.replaceState(null, "", `?${p}${location.hash}`);
  }, [cfg]);
  const set = (c: Partial<Cfg>) => setCfg((p) => ({ ...p, ...c }));
  // Pages stay mounted once shown or asked for (React Activity): a hidden page keeps its state and DOM but runs no
  // effects (no listeners, observers or timers), so coming back to it is a reveal, not a fresh mount of every
  // component. A page is rendered ahead, hidden and at idle priority, when its link is pointed at or focused.
  // The bar takes the new route at once; the page follows once the nav band's leading edge has landed. Revealing a
  // page re-runs its effects in one task (52ms built, 74 in dev), and React ran it before the next frame: the band
  // stood still between release and travel, then went. From the keyboard the page swaps at once.
  const [page, setPage] = React.useState(route);
  React.useEffect(() => {
    if (page === route) return;
    if (changedByKey()) return setPage(route);
    let t = 0;
    const r = requestAnimationFrame(
      () => (t = window.setTimeout(() => setPage(route), tokenMs(document.documentElement, "--kl-stretch-lead", 100))),
    );
    return () => (cancelAnimationFrame(r), clearTimeout(t));
  }, [route, page]);
  const [kept, setKept] = React.useState<Route[]>(() => [route]);
  if (!kept.includes(page)) setKept([...kept, page]);
  const fit = FIT.has(page);
  const prefetch = React.useCallback(
    (r: Route) => React.startTransition(() => setKept((k) => (k.includes(r) ? k : [...k, r]))),
    [],
  );
  return (
    <div
      data-route={page}
      data-fit={fit || undefined}
      className={cn(
        // browser surfaces carry the palette too
        "[scrollbar-color:var(--kl-ink-3)_transparent] selection:bg-kl-yellow selection:text-kl-on-yellow",
        "grid min-h-dvh grid-cols-[minmax(0,1fr)] content-start gap-4 p-4",
        // fit routes (wide): exactly one viewport tall; the bar takes its height and the route fills the rest. Each
        // route scrolls inside Keyline scroll areas, so the document never scrolls and no pane nests in another's
        // scroller. Narrow (<=960px): one column in normal document flow, and the page scrolls.
        fit &&
          "h-dvh min-h-0 grid-rows-[auto_minmax(0,1fr)] content-stretch [@media(max-width:960px)]:h-auto [@media(max-width:960px)]:min-h-dvh [@media(max-width:960px)]:grid-rows-none [@media(max-width:960px)]:content-start",
      )}
    >
      <Bar cfg={cfg} set={set} route={route} prefetch={prefetch} />
      <main className={fit ? "min-h-0" : undefined}>
        {kept.map((r) => (
          <React.Activity key={r} mode={r === page ? "visible" : "hidden"}>
            {PAGES[r]}
          </React.Activity>
        ))}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * CATALOGUE: the shared layout of the specimen and the motion lab.
 * An index (Keyline Nav) beside the entries (a Keyline scroll area).
 * The index's cobalt band follows the entry you are reading.
 * ------------------------------------------------------------------ */
type Entry = {
  id: string;
  title: string;
  /** shorter name for the index */ short?: string;
  states?: string[];
  note?: string;
  children: React.ReactNode;
};

const instant = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset["klMotion"] === "reduce";

function Catalogue({
  label,
  entries,
  testId,
  stageClassName,
}: {
  label: string;
  entries: Entry[];
  testId?: string;
  stageClassName?: string;
}) {
  const [current, setCurrent] = React.useState(entries[0]?.id ?? "");
  const root = React.useRef<HTMLDivElement>(null);
  const steering = React.useRef(0);

  // scroll spy: the current entry is the last one whose top has passed the reading line. It listens to the
  // entries' own viewport (wide) and to the window (narrow, where the page scrolls instead).
  React.useEffect(() => {
    const vp = root.current?.querySelector<HTMLElement>(`[role=region][aria-label="${label}"]`);
    if (!vp) return;
    let raf = 0;
    const spy = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (Date.now() < steering.current) return;
        const scroller = vp.scrollHeight > vp.clientHeight + 1 ? vp : null;
        const top = scroller ? scroller.getBoundingClientRect().top : 0;
        const atEnd = scroller
          ? scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2
          : innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
        let id = entries[0]?.id ?? "";
        for (const e of entries) {
          const el = document.getElementById(e.id);
          if (el && el.getBoundingClientRect().top - top <= 96) id = e.id;
        }
        setCurrent(atEnd ? (entries.at(-1)?.id ?? id) : id);
      });
    };
    vp.addEventListener("scroll", spy, { passive: true });
    addEventListener("scroll", spy, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      vp.removeEventListener("scroll", spy);
      removeEventListener("scroll", spy);
    };
  }, [entries, label]);

  // Performance: while the page mounts or reappears (React Activity), entries off screen skip style, layout and
  // paint (data-cv → content-visibility: auto), so a page switch lays out one screen, not ~7000 nodes. Once the
  // first frame is painted and the browser is idle, every entry renders normally again: off-screen text,
  // geometry and observers then behave as on any page. Hiding the page (Activity) puts the attribute back.
  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    let idle = 0;
    const raf = requestAnimationFrame(() => {
      const done = () => el.removeAttribute("data-cv");
      idle =
        typeof requestIdleCallback === "function"
          ? requestIdleCallback(done, { timeout: 200 })
          : window.setTimeout(done, 50);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      window.clearTimeout(idle);
      el.setAttribute("data-cv", "");
    };
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setCurrent(id);
    // hold the spy while the smooth scroll runs, so the band goes straight to the chosen entry
    steering.current = Date.now() + (instant() ? 0 : 700);
    el.scrollIntoView({ block: "start", behavior: instant() ? "auto" : "smooth" });
    el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    // entries skip rendering off screen (content-visibility), so those a smooth scroll passes through take their
    // real height on the way; once the scroll settles, land on the entry again if it moved
    const vp = root.current?.querySelector<HTMLElement>(`[role=region][aria-label="${label}"]`);
    const top0 = () =>
      el.getBoundingClientRect().top -
      (vp && vp.scrollHeight > vp.clientHeight + 1 ? vp.getBoundingClientRect().top : 0);
    let done = false;
    const settle = () => {
      if (done) return;
      done = true;
      vp?.removeEventListener("scrollend", settle);
      removeEventListener("scrollend", settle);
      const at = top0();
      // still (not a reader scrolling on): an instant scrollIntoView is a no-op where the entry already sits
      requestAnimationFrame(() => Math.abs(top0() - at) < 1 && el.scrollIntoView({ block: "start" }));
    };
    vp?.addEventListener("scrollend", settle);
    addEventListener("scrollend", settle);
    setTimeout(settle, 900);
  };

  return (
    // wide: the index beside the entries, each in its own scroll area; narrow (<=960px): one column, no index
    <div
      ref={root}
      data-cv=""
      data-testid={testId}
      className="group/cat grid h-full min-h-0 grid-cols-[232px_minmax(0,1fr)] gap-kl-gutter [@media(max-width:960px)]:h-auto [@media(max-width:960px)]:grid-cols-[minmax(0,1fr)]"
    >
      <ScrollArea
        className="h-full [@media(max-width:960px)]:hidden"
        viewportClassName="scroll-p-4"
        track="rail"
        onFocus={revealFocus}
      >
        <Nav
          label={`${label} index`}
          header={label}
          value={current}
          onValueChange={go}
          items={entries.map((e) => ({ value: e.id, label: e.short ?? e.title, count: e.states?.length }))}
        />
      </ScrollArea>
      <ScrollArea
        data-testid="catalogue-pages"
        className="h-full [@media(max-width:960px)]:h-auto"
        viewportClassName="scroll-p-4"
        // the entries' container: an entry lays its title beside its stage when this is wide
        contentClassName="@container/cat pb-kl-gutter"
        track="rail"
        label={label}
        onFocus={revealFocus}
      >
        {entries.map((e) => (
          <section
            key={e.id}
            id={e.id}
            aria-labelledby={`${e.id}-h`}
            data-testid="entry"
            className={cn(
              "grid min-w-0 scroll-mt-0 gap-4 py-7 ps-4 pe-6 first:pt-1.5 [@media(max-width:960px)]:px-0",
              "not-first:[border-block-start:var(--kl-k1)_solid_var(--kl-line-soft)]",
              // while the catalogue mounts or reappears (data-cv, see above), an entry off screen skips style, layout
              // and paint (the specimen holds ~7000 nodes); its last rendered height is remembered
              "group-data-cv/cat:[contain-intrinsic-size:auto_480px] group-data-cv/cat:[content-visibility:auto]",
              // wide entries: the name and its states in a column beside the stage, like a parts catalogue
              "@min-[860px]/cat:grid-cols-[216px_minmax(0,1fr)] @min-[860px]/cat:gap-x-9",
            )}
          >
            <header className="grid content-start gap-2 @min-[860px]/cat:sticky @min-[860px]/cat:top-1.5 @min-[860px]/cat:self-start">
              {/* demo headings only: never a heading inside a component (the preview must match an install) */}
              <h2
                id={`${e.id}-h`}
                tabIndex={-1}
                className="m-0 text-[18px] leading-[1.25] font-kl-strong text-balance [outline:0]"
              >
                {e.title}
              </h2>
              {e.note ? <p className={ui.catNote}>{e.note}</p> : null}
              {e.states ? (
                <ul
                  className="m-0 grid list-none gap-1 p-0 text-[13px] leading-[1.4] text-kl-ink-2"
                  aria-label="States shown"
                >
                  {e.states.map((s) => (
                    <li
                      key={s}
                      className="flex gap-2 before:mt-[0.7em] before:h-(--kl-k1) before:w-2 before:flex-none before:bg-kl-line before:content-['']"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              ) : null}
            </header>
            <div
              data-testid="stage"
              className={cn("grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-5", stageClassName)}
            >
              {e.children}
            </div>
          </section>
        ))}
      </ScrollArea>
    </div>
  );
}

/** A labelled group inside an entry's stage: what the components next to the label demonstrate. */
function Group({
  label,
  children,
  className,
  testId,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={cn(ui.group, className)} data-testid={testId}>
      <h3 className={ui.cap}>{label}</h3>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * SPECIMEN: every component, every state, once. The cut follows the
 * Full / Quiet / Off setting in the bar.
 * ------------------------------------------------------------------ */
/** State owned by one demo, not the page: a click in one entry re-renders that entry, not all ~70. */
/** A detail row holding its own presence: TableDetail takes the presence from its caller, so the row's fold
 *  finishes before it unmounts. */
function DemoDetail({ open, colSpan, children }: { open: boolean; colSpan: number; children: React.ReactNode }) {
  const presence = useDetailPresence(open);
  return (
    <TableDetail presence={presence} colSpan={colSpan}>
      {children}
    </TableDetail>
  );
}

function Local<T>({
  init,
  children,
}: {
  init: T | (() => T);
  children: (v: T, set: React.Dispatch<React.SetStateAction<T>>) => React.ReactNode;
}) {
  const [v, set] = React.useState<T>(init);
  return children(v, set);
}

function Specimen() {
  const entries: Entry[] = [
    {
      id: "button",
      title: "Button",
      states: [
        "Primary, secondary, destructive, quiet",
        "Disabled",
        "Pending, done, failed",
        "Count and shortcut affix",
        "Compact",
        "Long label",
      ],
      children: (
        <>
          <Group label="Variants">
            <div className={ui.row}>
              <Button variant="primary">
                Assign carrier <ButtonAffix>3</ButtonAffix>
              </Button>
              <Button>Reschedule</Button>
              <Button variant="destructive">Cancel shipment</Button>
              <Button variant="quiet">Track</Button>
              <Button disabled>Customs release</Button>
            </div>
          </Group>
          <Group label="Signals">
            <div className={ui.row}>
              <Button signal="pending">Saving</Button>
              <Button variant="primary" signal="done">
                Saved
              </Button>
              <Button signal="failed">Retry upload</Button>
            </div>
          </Group>
          <div className={ui.split}>
            <Group label="Compact with shortcut">
              <div className={ui.row}>
                <Button size="compact">
                  Compact <ButtonAffix className="kl-code">⌘K</ButtonAffix>
                </Button>
              </div>
            </Group>
            <Group label="Long label wraps" className={ui.narrow}>
              <Button variant="primary">
                Request a delivery window from the consignee <ButtonAffix>12</ButtonAffix>
              </Button>
            </Group>
          </div>
        </>
      ),
    },
    {
      id: "split",
      title: "Split button and connected selection",
      short: "Split button and selection",
      states: [
        "One frame, many cells",
        "Exclusive choice stretches (ink)",
        "Independent toggles flood (yellow)",
        "Disabled cell",
      ],
      children: (
        <>
          <div className={ui.split}>
            <Group label="Split button">
              <div className={ui.row}>
                <SplitButton variant="primary">
                  <SplitButtonAction>Book pickup</SplitButtonAction>
                  <SplitButtonMenu>
                    <SplitButtonTrigger aria-label="More booking options" />
                    <SplitButtonPopup>
                      <MenuItem code="1" shortcut="B">
                        Book for tomorrow
                      </MenuItem>
                      <MenuItem code="2" description="Needs a dock slot first" disabled>
                        Book recurring
                      </MenuItem>
                      <MenuSeparator />
                      <MenuItem code="3" variant="destructive">
                        Release slot
                      </MenuItem>
                    </SplitButtonPopup>
                  </SplitButtonMenu>
                </SplitButton>
              </div>
            </Group>
            <Group label="Segmented">
              <div className={ui.row}>
                <Local init="week">
                  {(seg, setSeg) => (
                    <Segmented value={seg} onValueChange={setSeg} aria-label="Period">
                      <SegmentedItem value="day">Day</SegmentedItem>
                      <SegmentedItem value="week">Week</SegmentedItem>
                      <SegmentedItem value="month">Month</SegmentedItem>
                      <SegmentedItem value="quarter" disabled>
                        Quarter
                      </SegmentedItem>
                    </Segmented>
                  )}
                </Local>
              </div>
            </Group>
          </div>
          <Group label="Toggle group">
            <div className={ui.row}>
              <ToggleGroup defaultValue={["transit"]} aria-label="Status">
                <ToggleGroupItem value="transit" count={23}>
                  In transit
                </ToggleGroupItem>
                <ToggleGroupItem value="docs" count={4}>
                  Awaiting docs
                </ToggleGroupItem>
                <ToggleGroupItem value="delayed" count={2}>
                  Delayed
                </ToggleGroupItem>
                <ToggleGroupItem value="none" disabled>
                  Not booked
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </Group>
        </>
      ),
    },
    {
      id: "field",
      title: "Field and field group",
      short: "Field",
      states: ["Default with unit affix", "Invalid (inserted ! cell)", "Disabled", "Group of three"],
      children: (
        <div className={ui.grid2}>
          <Field>
            <FieldLabel>Gross weight</FieldLabel>
            <FieldFrame>
              <FieldControl defaultValue="12,004.0" align="end" />
              <FieldAffix className="kl-code">kg</FieldAffix>
            </FieldFrame>
            <FieldDescription>22 pallets · max 24,000 kg per truck.</FieldDescription>
          </Field>
          <Field invalid>
            <FieldLabel>Gross weight</FieldLabel>
            <FieldFrame>
              <FieldControl defaultValue="31,200.0" align="end" />
              <FieldAffix className="kl-code">kg</FieldAffix>
            </FieldFrame>
            <FieldError match>Over 24,000 kg needs two trucks. Split the shipment first.</FieldError>
          </Field>
          <Field disabled>
            <FieldLabel>Customs value</FieldLabel>
            <FieldFrame>
              <FieldAffix className="kl-code">€</FieldAffix>
              <FieldControl defaultValue="142,880.00" align="end" />
            </FieldFrame>
            <FieldDescription>Locked after the declaration is filed.</FieldDescription>
          </Field>
          <FieldGroup
            legend={
              <>
                Pallet size <span className="kl-code">cm</span>
              </>
            }
          >
            <FieldGroupPart label="L" inputProps={{ defaultValue: "120" }} />
            <FieldGroupJoin />
            <FieldGroupPart label="W" inputProps={{ defaultValue: "80" }} />
            <FieldGroupJoin />
            <FieldGroupPart label="H" invalid inputProps={{ defaultValue: "290" }} />
          </FieldGroup>
        </div>
      ),
    },
    {
      id: "choices",
      title: "Choices",
      states: [
        "Checkbox rows",
        "Radio rows (the ink band stretches)",
        "Switch rows (block stretches to on)",
        "Standalone and disabled",
      ],
      children: (
        <div className={ui.grid2}>
          <Group label="Checkbox rows">
            <div className="kl-ctl kl-rows">
              <CheckboxField
                layout="cell"
                label="Email the consignee"
                description="Sends the delivery window when it is booked."
                defaultChecked
              />
              <CheckboxField layout="cell" label="Attach the packing list" />
              <CheckboxField
                layout="cell"
                label="Require a signature on delivery"
                description="Not available for parcel carriers."
                disabled
              />
            </div>
          </Group>
          <Group label="Radio rows">
            <RadioGroup defaultValue="road" aria-label="Transport mode" name="mode">
              <RadioGroupItem value="road" label="Road" description="Door to door, 2–4 days" meta="€" />
              <RadioGroupItem value="rail" label="Rail" description="Terminal to terminal, 4–6 days" meta="€€" />
              <RadioGroupItem value="air" label="Air" description="Airport to airport, next day" meta="€€€" />
              <RadioGroupItem value="sea" label="Sea" description="Not offered on this lane" disabled />
            </RadioGroup>
          </Group>
          <Group label="Switch rows">
            <div className="kl-ctl kl-rows">
              <SwitchField
                layout="cell"
                label="Auto-assign carriers"
                description="Picks the cheapest carrier with capacity."
                defaultChecked
              />
              <SwitchField layout="cell" label="Weekend deliveries" />
            </div>
          </Group>
          <Group label="Standalone">
            <dl className="m-0 grid grid-cols-[minmax(0,1fr)] bg-kl-cell [border:var(--kl-k2)_solid_var(--kl-line)] *:flex *:min-h-10 *:items-center *:justify-between *:gap-3 *:px-kl-inset [&_dd]:m-0 [&_dd]:flex [&_dt]:text-[14px] [&>div+div]:[border-block-start:var(--kl-k1)_solid_var(--kl-line)]">
              <div>
                <dt>Checked</dt>
                <dd>
                  <Checkbox aria-label="Standalone" defaultChecked />
                </dd>
              </div>
              <div>
                <dt>Indeterminate</dt>
                <dd>
                  <Checkbox aria-label="Indeterminate" indeterminate />
                </dd>
              </div>
              <div>
                <dt>Off</dt>
                <dd>
                  <Switch aria-label="Standalone switch" />
                </dd>
              </div>
              <div>
                <dt>Disabled, on</dt>
                <dd>
                  <Switch aria-label="Disabled on" defaultChecked disabled />
                </dd>
              </div>
              <div>
                <dt>Disabled, off</dt>
                <dd>
                  <Switch aria-label="Disabled off" disabled />
                </dd>
              </div>
            </dl>
          </Group>
        </div>
      ),
    },
    {
      id: "select",
      title: "Select",
      states: [
        "Codes and a disabled option",
        "Long list, selection far down",
        "Narrow owner truncates",
        "Groups",
        "Parts: separator and group headings",
      ],
      children: (
        <div className={ui.grid2}>
          <Select
            label="Default carrier"
            defaultValue="dhl"
            options={[
              { value: "dhl", label: "DHL Freight", code: "DHL" },
              { value: "dsv", label: "DSV Road", code: "DSV" },
              { value: "ceva", label: "CEVA Logistics", description: "Paused", disabled: true },
              { value: "rhenus", label: "Rhenus Road with a much longer trading name GmbH & Co. KG", code: "RHE" },
            ]}
          />
          <Select label="Port of loading" name="port" defaultValue="p31" options={PORTS} />
          <div className="w-40 self-end">
            <Select
              label="Escalate to (narrow)"
              defaultValue="mgr"
              options={[
                { value: "lead", label: "Shift lead", code: "L1" },
                { value: "mgr", label: "Operations manager for the Rhine–Rhône corridor", code: "L2" },
                { value: "none", label: "Nobody", description: "Alerts stay in the inbox" },
              ]}
            />
          </div>
          <SelectMore />
        </div>
      ),
    },
    {
      id: "combobox",
      title: "Combobox",
      states: [
        "Local filter with groups",
        "Async: type “err” for the failure and Retry",
        "Clear cell while chosen",
        "Invalid",
        "Disabled",
        "Hamburg Tollerort is closed",
      ],
      children: <ComboboxSpecimen />,
    },
    {
      id: "slider",
      title: "Slider",
      states: ["Stepped with a unit", "Range", "Painted rail (hue)", "Disabled", "Compact, as a footer cell"],
      children: <SliderSpecimen />,
    },
    {
      id: "number",
      title: "Number field",
      states: [
        "Unit cell",
        "Step out of range is hatched",
        "Locale currency, no steppers",
        "Invalid with message",
        "Disabled",
        "Long label, paired with a slider",
        "Cells in a panel",
      ],
      children: <NumberFieldSpecimen />,
    },
    {
      id: "form",
      title: "Form and field orientation",
      short: "Form",
      states: [
        "Responsive (horizontal from 560px of form width)",
        "Horizontal",
        "Vertical",
        "Required and range validation on submit",
        "Server error on a field",
        "Pending, then a done notice",
      ],
      children: <FormSpecimen />,
    },
    {
      id: "async",
      title: "Async multiselect and date range",
      short: "Multiselect and date range",
      states: ["Type “err” for the failure and Retry", "CEVA is paused", "Disabled", "17 and 22 Nov are closed"],
      children: (
        <Local<DateRange | null> init={{ from: new Date(2026, 10, 12), to: new Date(2026, 10, 19) }}>
          {(range, setRange) => (
            <>
              <div className={ui.grid2}>
                <Multiselect
                  label="Carriers"
                  noun={["carrier", "carriers"]}
                  loadOptions={searchCarriers}
                  defaultValue={CARRIERS.filter((_, i) => i === 0 || i === 3)}
                />
                <Multiselect
                  label="Carriers (disabled)"
                  noun={["carrier", "carriers"]}
                  loadOptions={searchCarriers}
                  disabled
                />
                <DateRangePicker
                  label="ETA"
                  value={range}
                  onValueChange={setRange}
                  today={TODAY}
                  defaultMonth={TODAY}
                  isDateUnavailable={isUnavailable}
                  presets={[{ label: "Next 7 days", range: () => ({ from: TODAY, to: new Date(2026, 10, 13) }) }]}
                />
              </div>
              <Group label="Inline calendar, same range" className="max-w-[360px]" testId="inline-cal">
                <RangeCalendar
                  value={range}
                  onValueChange={setRange}
                  today={TODAY}
                  defaultMonth={TODAY}
                  isDateUnavailable={isUnavailable}
                />
              </Group>
            </>
          )}
        </Local>
      ),
    },
    {
      id: "location",
      title: "Tabs, nav and tooltip",
      short: "Tabs, nav, tooltip",
      states: ["Location is a cobalt band that stretches", "Disabled tab and item", "Tooltip docks to the focus ring"],
      children: (
        <>
          <Group label="Tabs" className="max-w-[640px]">
            <Tabs defaultValue="overview">
              <TabsList aria-label="Shipment sections">
                <TabsTab value="overview">Overview</TabsTab>
                <TabsTab value="legs">Legs</TabsTab>
                <TabsTab value="documents">Documents</TabsTab>
                <TabsTab value="audit" disabled>
                  Audit
                </TabsTab>
              </TabsList>
              <TabsPanel value="overview">Venlo → Metz → Lyon. On time.</TabsPanel>
              <TabsPanel value="legs">4 legs, 1 in progress.</TabsPanel>
              <TabsPanel value="documents">CMR, packing list, customs declaration.</TabsPanel>
            </Tabs>
          </Group>
          <div className={ui.split}>
            <Group label="Nav">
              <Nav
                label="Specimen nav"
                value="carriers"
                header={<b>Freightdesk</b>}
                className="w-[220px]"
                items={[
                  { value: "shipments", label: "Shipments", count: 64 },
                  { value: "carriers", label: "Carriers", count: 9 },
                  { value: "docks", label: "Dock schedule" },
                  { value: "invoices", label: "Invoices", count: 3, disabled: true },
                ]}
                onValueChange={() => {}}
              />
            </Group>
            <Group label="Tooltip">
              <div className={ui.row}>
                <Tooltip content="Open the command menu" shortcut="⌘K">
                  <Button>Commands</Button>
                </Tooltip>
                <Tooltip content="Weight includes pallets" side="bottom">
                  <Button variant="quiet">Gross weight</Button>
                </Tooltip>
              </div>
            </Group>
          </div>
        </>
      ),
    },
    {
      id: "disclosure",
      title: "Accordion and collapsible",
      short: "Accordion, collapsible",
      states: [
        "Meta text, description",
        "Disabled section",
        "Long title wraps",
        "As cells of a panel, several open",
        "Collapsible with a spine, nested",
      ],
      children: <DisclosureSpecimen />,
    },
    {
      id: "panel",
      title: "Panel, stat and status",
      states: ["PanelGrid joins panels into one frame", "Count voice", "Delta shape and text", "Meter"],
      children: (
        <>
          <PanelGrid min={180}>
            <Stat
              label="In transit"
              value="23"
              delta={{ value: "+4", direction: "up", tone: "neutral", label: "4 more than last week" }}
            />
            <Stat
              label="Delayed"
              value="2"
              delta={{ value: "+2", direction: "up", tone: "bad", label: "2 more than last week" }}
            />
            <Stat label="Truck fill" value="86" unit="%" meter={{ value: 86 }} />
            <Stat label="Spend" value="142,880" unit="€" delta={{ value: "0%", direction: "flat" }} />
          </PanelGrid>
          <Panel className={ui.panel}>
            <PanelHeader
              title="Dock schedule"
              code="DK-3"
              description="Venlo cross-dock · today"
              actions={<Badge tone="signal">3 free</Badge>}
            />
            <PanelBody>
              <Meter value={22} max={24} high={20} label="Doors in use" />
              <p className={ui.p}>
                <Status kind="attention">2 doors over capacity at 14:00</Status>
              </p>
            </PanelBody>
            <PanelFooter>
              <span className="kl-cell">Updated 2 min ago</span>
              <Button layout="cell">Open schedule</Button>
            </PanelFooter>
          </Panel>
        </>
      ),
    },
    {
      id: "progress",
      title: "Progress",
      states: ["Complete", "Progressing", "Indeterminate", "Failed, with recovery", "Label hidden", "Long label"],
      children: <ProgressSpecimen />,
    },
    {
      id: "empty",
      title: "Empty",
      states: [
        "No results, with the way out",
        "Error with Retry, recovers to first use",
        "Narrow (stacks)",
        "Cell in a panel",
        "Long title",
      ],
      children: <EmptySpecimen />,
    },
    {
      id: "table",
      title: "Table",
      states: ["Selected row", "Expanded, merged index cell", "Bulk scope", "Empty"],
      children: (
        <Local init={() => new Set([1])}>
          {(sel, setSel) => (
            <Local<number | null> init={2}>
              {(open, setOpen) => (
                <TableFrame className="max-h-none">
                  <TableViews
                    views={[
                      { value: "a", label: "All", count: 64 },
                      { value: "b", label: "Needs attention", count: 9 },
                    ]}
                    value="a"
                    onValueChange={() => {}}
                  />
                  <TableBulkBar
                    count={sel.size}
                    scope={sel.size ? `${sel.size} of 3 on this page` : "Select rows to act on them."}
                  >
                    <Button layout="cell" variant="primary" disabled={!sel.size}>
                      Assign carrier <ButtonAffix>{sel.size}</ButtonAffix>
                    </Button>
                  </TableBulkBar>
                  <TableScroll>
                    <Table>
                      <TableHeader>
                        <tr>
                          <TableIndexCell
                            header
                            checked={sel.size === 3}
                            indeterminate={sel.size > 0 && sel.size < 3}
                            onCheckedChange={(v) => setSel(v ? new Set([0, 1, 2]) : new Set())}
                            label="Select all"
                          />
                          <TableExpandCell header />
                          <TableHead>ID</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead align="end">
                            Weight <span className="kl-code">kg</span>
                          </TableHead>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {[
                          ["SH-20481", "Hamburg, DE", "normal", "In transit", "1,240.5"],
                          ["SH-20482", "Antwerpen, BE", "attention", "Delayed 2 d", "860.0"],
                          ["SH-20483", "Saint-Quentin-Fallavier, FR", "waiting", "Awaiting docs", "12,004.0"],
                        ].map(([id, d, k, l, w], i) => (
                          <React.Fragment key={id}>
                            <TableRow selected={sel.has(i)} expanded={open === i}>
                              <TableIndexCell
                                rowSpan={open === i ? 2 : undefined}
                                checked={sel.has(i)}
                                onCheckedChange={(v) =>
                                  setSel((p) => {
                                    const n = new Set(p);
                                    if (v) n.add(i);
                                    else n.delete(i);
                                    return n;
                                  })
                                }
                                code={String(i + 1).padStart(2, "0")}
                                label={`Select ${id}`}
                              />
                              <TableExpandCell
                                expanded={open === i}
                                onToggle={() => setOpen(open === i ? null : i)}
                                label={`Legs for ${id}`}
                              />
                              <TableCell className="font-(family-name:--kl-font-mono) text-[13px]">{id}</TableCell>
                              <TableCell>{d}</TableCell>
                              <TableCell>
                                <Status kind={k as "normal"}>{l}</Status>
                              </TableCell>
                              <TableCell align="end">{w}</TableCell>
                            </TableRow>
                            <DemoDetail open={open === i} colSpan={5}>
                              <p className={ui.detail}>Venlo cross-dock → Metz → {d}. On time.</p>
                            </DemoDetail>
                          </React.Fragment>
                        ))}
                        <TableState
                          kind="empty"
                          colSpan={6}
                          count={0}
                          title="No shipments match “Lyon” in Delivered."
                          body="3 filters are hiding 64 shipments."
                          action={<Button>Clear filters</Button>}
                        />
                      </TableBody>
                    </Table>
                  </TableScroll>
                  <TablePager>
                    <span className="kl-cell">
                      <b>1–3</b>&nbsp;of 64
                    </span>
                  </TablePager>
                </TableFrame>
              )}
            </Local>
          )}
        </Local>
      ),
    },
    {
      id: "sort",
      title: "Sortable table header",
      short: "Table sorting",
      states: [
        "Ascending, descending, none",
        "Numeric column starts high-to-low, mark before label",
        "Sort resets to page 1",
        "Empty row (Empty as a cell)",
      ],
      children: <SortTableSpecimen />,
    },
    {
      id: "wayfinding",
      title: "Breadcrumb and pagination",
      short: "Breadcrumb, pagination",
      states: [
        "Short path",
        "Folded by count into a menu",
        "Folded by width",
        "Constant-width page window",
        "Four-digit pages",
        "Unknown count",
        "Links",
        "Narrow (5 / 20)",
        "Cell of a panel",
      ],
      children: <WayfindingSpecimen />,
    },
    {
      id: "participants",
      title: "Field participants in a Form",
      short: "Field participants",
      states: [
        "Base UI Form values include Select, Combobox, Slider, TimeField",
        "validate and required messages",
        "Server errors from Form errors",
        "Cells: hidden message, visible ! cell",
        "Disabled",
      ],
      children: <FieldParticipantsSpecimen />,
    },
    {
      id: "time",
      title: "Time field",
      states: [
        "Zone affix",
        "15-minute steps",
        "Required, empty",
        "Invalid with message",
        "Disabled",
        "Long label",
        "Cells with a date picker; cross-field rule",
      ],
      children: <TimeFieldSpecimen />,
    },
    {
      id: "skeleton",
      title: "Skeleton",
      states: [
        "Value, lines, control and block shapes",
        "Busy group with one status",
        "Reload: skeleton, then content in place",
      ],
      children: <SkeletonSpecimen />,
    },
    {
      id: "edges",
      title: "Scroll edges on cell rows",
      short: "Scroll edges",
      states: [
        "Tabs, toggles, segmented and nav at 300px",
        "Faded edge where items are hidden",
        "Row that fits: no mark",
      ],
      children: <ScrollEdgesSpecimen />,
    },
    {
      id: "menubar",
      title: "Menubar",
      states: [
        "Arrow keys between titles",
        "Checkbox and radio items",
        "Submenu",
        "Disabled menu and item",
        "Destructive item",
      ],
      children: <MenubarSpecimen />,
    },
    {
      id: "toolbar",
      title: "Toolbar",
      states: [
        "One Tab stop, arrow keys wrap",
        "Groups on a 2px keyline",
        "Independent toggles flood",
        "Exclusive group: the ink band stretches",
        "Menu docked to the frame",
        "Spacer and primary action",
        "Disabled stays focusable",
        "As a panel's top cell: search, menu, separator, link",
        "Vertical palette",
        "Narrow: scroll edges",
      ],
      children: <ToolbarSpecimen />,
    },
    {
      id: "toolbar-overflow",
      title: "Toolbar overflow",
      short: "Toolbar overflow",
      states: [
        "Fits: no More item",
        "Narrow: last items move into More, in place",
        "Primary and inputs stay",
        "Toggle, exclusive group and menu keep their state in the menu",
        "Label trigger",
        "Signals: pending, done, failed",
      ],
      children: <ToolbarOverflowSpecimen />,
    },
    {
      id: "toolbar-group-overflow",
      title: "Toolbar overflow: groups",
      short: "Group overflow",
      states: [
        "A group gives up its items one at a time, under its label in More",
        "keepTogether leaves whole",
        "Uncontrolled toggles keep their state",
      ],
      children: <GroupOverflowSpecimen />,
    },
    {
      id: "toolbar-vertical-overflow",
      title: "Toolbar overflow: vertical",
      short: "Vertical overflow",
      states: ["Palette fits its column's height", "More at its foot, opening to the side", "RTL"],
      children: <VerticalOverflowSpecimen />,
    },
    {
      id: "chart",
      title: "Chart",
      short: "Chart",
      states: [
        "Series colours by role from the data tokens",
        "Inverse tooltip with tabular figures; arrows step through points",
        "Chart / Table switch with the same rows",
        "RTL axes; reduced motion stills the series",
      ],
      children: <ChartSpecimen />,
    },
    {
      id: "carousel",
      title: "Carousel",
      short: "Carousel",
      states: [
        "Slides on seams in a frame; a control row of cells at its foot",
        "Slides named n of N; out-of-view slides inert",
        "Arrow keys on the region, mirrored in RTL",
        "Moves announced politely; instant under reduced motion",
      ],
      children: <CarouselSpecimen />,
    },
    {
      id: "scroll-area",
      title: "Scroll area",
      short: "Scroll area",
      states: [
        "The thumb reveals while its axis scrolls and when the pointer is on the bar's cell, then fades",
        "Pointer on the cell widens and darkens the thumb; held, it inks",
        "A track press lands the thumb under the pointer and keeps dragging",
        "Vertical, horizontal, both with a corner; always shown on classic-scrollbar platforms",
      ],
      children: <ScrollAreaSpecimen />,
    },
    {
      id: "async-race",
      title: "Combobox and Multiselect: async order, Escape",
      short: "Async race",
      states: [
        "A pasted query is the search the list shows",
        "Out-of-order responses: only the latest query's is listed",
        "Escape on a closed field keeps the value",
        "Controlled and uncontrolled",
      ],
      children: <AsyncRaceSpecimen />,
    },
    {
      id: "chat",
      title: "Chat: message, bubble, message scroller, attachment",
      short: "Chat",
      states: [
        "The log keeps to the newest message; Latest cell when scrolled up",
        "Bubbles: plain (theirs), tint (yours), attention (not sent, ! cell)",
        "Attachments: idle, uploading progress on the keyline, processing, failed with reason",
        "RTL mirrors sides",
      ],
      children: <ChatSpecimen />,
    },
    {
      id: "drawer",
      title: "Drawer",
      short: "Drawer",
      states: [
        "Swipe toward its side to dismiss; Escape and Close always work",
        "Bottom with the cut, end and start full height",
        "Snap points",
        "End mirrors in RTL; reduced motion lands at once",
      ],
      children: <DrawerSpecimen />,
    },
    {
      id: "time-slots",
      title: "Date and time: unavailable slots",
      short: "Time slots",
      states: [
        "Offered times as one radio group of cells",
        "Booked slots hatched, disabled, named with the reason",
        "A day with no slot left is unavailable",
        "A typed booked time is invalid",
      ],
      children: <TimeSlotsSpecimen />,
    },
    {
      id: "multi-sort",
      title: "Multi-column sort",
      short: "Multi-sort",
      states: [
        "Shift + press adds a level",
        "Each sorted header prints its place",
        "aria-sort on the first level only",
        "A plain press sorts by one column",
      ],
      children: <MultiSortSpecimen />,
    },
    {
      id: "time-cycle",
      title: "Time field: 12-hour clock",
      short: "12-hour time",
      states: [
        "24 and 12 on one value",
        "Period by locale, before or after",
        "Typing advances; a/p sets the period",
        "Empty and required",
        "Invalid",
        "Disabled",
      ],
      children: <TimeCycleSpecimen />,
    },
    {
      id: "date-time",
      title: "Date-time picker",
      short: "Date-time picker",
      states: [
        "Day keeps the time",
        "Time row with Done",
        "Presets",
        "12-hour",
        "Form: required, validate, server error",
        "Cell layout",
        "Disabled",
      ],
      children: <DateTimeSpecimen />,
    },
    {
      id: "slider-attention",
      title: "Slider attention and RTL units",
      short: "Slider ! and units",
      states: ["! cell in control and cell layouts", "Units isolated in RTL"],
      children: <SliderAttentionSpecimen />,
    },
    {
      id: "month-jump",
      title: "Calendar: navigation and bounds",
      short: "Calendar",
      states: [
        "Month and year dropdowns",
        "Keyboard: arrows, PageUp/Down (Shift: a year), Home/End, Escape",
        "min and max",
        "Range calendar",
        "RTL",
      ],
      children: <MonthJumpSpecimen />,
    },
    {
      id: "time-bounds",
      title: "Time bounds",
      short: "Time bounds",
      states: [
        "min and max",
        "Arrows wrap to the other bound",
        "Typed time outside is invalid",
        "12-hour message",
        "Date-time picker in a form",
        "Disabled",
      ],
      children: <TimeBoundsSpecimen />,
    },
    {
      id: "avatar",
      title: "Avatar",
      short: "Avatar",
      states: [
        "sm · md · lg · xl",
        "Photo, failed photo, initials",
        "Grapheme-aware initials",
        "Status on the floor keyline",
        "Group with count",
        "Count opens everyone",
        "Avatar in an item row",
      ],
      children: <AvatarSpecimen />,
    },
    {
      id: "hover-card",
      title: "Hover card",
      short: "Hover card",
      states: [
        "Underline draws during the delay",
        "Opens on hover and keyboard focus",
        "Header, facts, body",
        "Long name in a narrow column",
        "RTL",
      ],
      children: <HoverCardSpecimen />,
    },
    {
      id: "otp",
      title: "OTP field",
      short: "OTP field",
      states: [
        "Groups",
        "Paste and autofill",
        "Verify: pending, done, failed",
        "Resend countdown",
        "In a dialog",
        "Form: alphanumeric, required, validate",
        "Masked, disabled, read-only",
        "Narrow",
        "RTL",
        "Cell of a footer row",
      ],
      children: <OtpSpecimen />,
    },
    {
      id: "input-group",
      title: "Input group",
      short: "Input group",
      states: [
        "Toggle cell: show password",
        "Button cell with a done signal",
        "Affix, clear button and match-case toggle",
        "Bars above and below a textarea",
        "Invalid with a button",
        "Narrow",
        "RTL",
      ],
      children: <InputGroupSpecimen />,
    },
    {
      id: "native-select",
      title: "Native select",
      short: "Native select",
      states: [
        "Groups, a disabled option",
        "Placeholder, required, Form values",
        "Controlled, autofill",
        "Invalid, disabled",
        "Long option in a narrow column",
        "RTL",
      ],
      children: <NativeSelectSpecimen />,
    },
    {
      id: "kbd",
      title: "Kbd",
      short: "Kbd",
      states: ["Keys in prose", "Chords on seams, symbols named", "A sequence", "RTL"],
      children: <KbdSpecimen />,
    },
    {
      id: "command",
      title: "Command",
      short: "Command",
      states: ["Grouped index", "Flat ranked results while searching"],
      children: <CommandSpecimen />,
    },
    {
      id: "toggle",
      title: "Toggle",
      short: "Toggle",
      states: ["Controlled with a count", "Uncontrolled", "Icon only", "Disabled off and on", "RTL"],
      children: <ToggleSpecimen />,
    },
    {
      id: "resizable",
      title: "Resizable",
      short: "Resizable",
      states: [
        "Seam with a grip, collapsible list",
        "Nested vertical group",
        "Controlled: hide and reset buttons",
        "Live sizes",
        "RTL",
      ],
      children: <ResizableSpecimen />,
    },
    {
      id: "navigation-menu",
      title: "Navigation menu",
      short: "Navigation menu",
      states: [
        "Sections with link panels",
        "Current page: a link and a card",
        "Codes and descriptions",
        "Narrow",
        "RTL",
      ],
      children: <NavigationMenuSpecimen />,
    },
    {
      id: "checkbox-group",
      title: "Checkbox group",
      short: "Checkbox group",
      states: [
        "Parent row: mixed, all, none, with a count",
        "Description and meta cells",
        "Long label wraps",
        "Disabled option keeps its state",
        "Form values, validate and server errors",
        "Cells of a popover",
        "Custom rows, invalid, disabled group",
      ],
      children: <CheckboxGroupSpecimen />,
    },
    {
      id: "shell",
      title: "App shell",
      states: [
        "Header frame: toggle, breadcrumb, actions",
        "Sidebar hides and shows",
        "Aside opens from a row",
        "Narrow: sidebar and aside are sheets",
      ],
      children: <AppShellSpecimen />,
    },
    {
      id: "sidebar",
      title: "Sidebar (AppShell + Nav)",
      short: "Sidebar",
      note: "Install: npx shadcn@latest add @keyline-ui/sidebar (AppShell and Nav). Import AppShell from app-shell; Nav and NavAction from nav.",
      states: [
        "Wide navigation with groups and icon keys",
        'Icon rail (collapse="rail"): labels as tooltips',
        "Nested links under a disclosure; the band rests on the closed parent",
        "Row actions: a ⋯ cell opening a Menu",
        "Narrow: a start sheet that closes on choosing a place",
      ],
      children: <SidebarSpecimen />,
    },
    {
      id: "dialog",
      title: "Dialog",
      note: "Install: npx shadcn@latest add @keyline-ui/dialog. Dialog, DialogTrigger, DialogPopup, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose.",
      states: [
        "Header, scrolling body, footer cells",
        "A form inside: Enter saves, invalid name keeps it open",
        "Escape and the scrim close; focus returns to the trigger",
      ],
      children: <DialogSpecimen />,
    },
    {
      id: "alert-dialog",
      title: "Alert dialog",
      note: "Install: npx shadcn@latest add @keyline-ui/alert-dialog (ships the dialog item). AlertDialog, AlertDialogTrigger, AlertDialogPopup, AlertDialogContent from dialog.",
      states: [
        "Destructive: the ! cell, focus on the safe action",
        "Primary tone: the ? cell",
        "The answer is reported",
      ],
      children: <AlertDialogSpecimen />,
    },
    {
      id: "toast",
      title: "Toast",
      note: "Install: npx shadcn@latest add @keyline-ui/toast. ToastProvider, ToastDock, ToastFloating, useToast, useToaster, createToaster.",
      states: [
        "Docked in a host cell; floating at the inline-end corner",
        "Done, failed, info, warning, loading",
        "Description line",
        "Undo and Retry actions close the toast",
        "Promise: loading → done or failed in one toast",
        "Raised outside React",
        "Dismiss one (×) or all",
      ],
      children: <ToastSpecimen />,
    },
    {
      id: "questionnaire",
      title: "Questionnaire",
      note: "Install: npx shadcn@latest add @keyline-ui/questionnaire. On @shadcn/react's Questionnaire, as the reference.",
      states: [
        "Single choice (ink band), multiple choice, free text",
        "Required and optional steps; Skip",
        "Back keeps answers",
        "Errors on the current step only",
        "Focus moves to the new step's heading",
        "Letter shortcuts",
        "Submit: pending, failed with Retry, then sent",
      ],
      children: <QuestionnaireSpecimen />,
    },
    {
      id: "button-group",
      title: "Button group",
      note: "Install: npx shadcn@latest add @keyline-ui/button-group.",
      states: [
        "Attached Button cells, each a Tab stop",
        "Text cell",
        "Heavier separator",
        "A menu trigger cell",
        "Vertical",
      ],
      children: <ButtonGroupSpecimen />,
    },
    {
      id: "marker",
      title: "Marker",
      note: "Install: npx shadcn@latest add @keyline-ui/marker.",
      states: ["Glyph and words", "Separator", "Border", "Pending (the pending segment, a polite status) → done"],
      children: <MarkerSpecimen />,
    },
    {
      id: "direction",
      title: "Direction",
      note: "Install: npx shadcn@latest add @keyline-ui/direction. DirectionProvider sets the DOM dir and Base UI's direction together.",
      states: [
        "LTR and RTL regions on one page",
        "Tooltip inline-end follows the region",
        "Popover and segmented mirror",
      ],
      children: <DirectionSpecimen />,
    },
    {
      id: "inspector",
      title: "Inspector and confirmation",
      short: "Inspector",
      states: ["Row code in the header", "Facts", "Alert dialog opens on the safe action"],
      children: (
        <Inspector className="max-w-[380px]">
          <InspectorHeader
            code="R3/12"
            title="SH-20483"
            status={<Status kind="normal">In transit</Status>}
            onClose={() => {}}
          />
          <InspectorFacts
            items={[
              { label: "Destination", value: "Lyon, FR" },
              { label: "Carrier", value: "DHL Freight" },
              { label: "ETA", value: "16 Nov" },
              { label: "Value €", value: "142,880.00" },
            ]}
          />
          <InspectorActions>
            <AlertDialog>
              <AlertDialogTrigger render={<Button layout="cell" />}>Cancel shipment…</AlertDialogTrigger>
              <AlertDialogContent
                title="Cancel SH-20483?"
                description="DHL Freight is told immediately. You can undo for 8 seconds."
                cancelLabel="Keep shipment"
                confirmLabel="Cancel shipment"
                onConfirm={() => {}}
              />
            </AlertDialog>
            <Button layout="cell" variant="primary">
              Save changes
            </Button>
          </InspectorActions>
        </Inspector>
      ),
    },
    {
      id: "context",
      title: "Context menu",
      states: [
        "Right-click, long-press, Menu key or Shift+F10",
        "The object is marked while open",
        "Submenu",
        "Disabled and destructive rows",
      ],
      children: <ContextMenuSpecimen />,
    },
    {
      id: "menu-choices",
      title: "Menu checkbox and radio items",
      short: "Menu choices",
      states: ["Checkbox items stay open", "Radio group", "Disabled checked item", "Same items in a context menu"],
      children: <MenuChoicesSpecimen />,
    },
  ];
  // ?only=<id>,<id> renders just those entries (the browser specs use it to load one specimen instead of all of
  // them; without the parameter the page is unchanged)
  const only = new URLSearchParams(location.search).get("only")?.split(",");
  return (
    <Catalogue
      label="Specimen"
      entries={only ? entries.filter((e) => only.includes(e.id)) : entries}
      testId="specimen"
    />
  );
}

/* ------------------------------------------------------------------ *
 * MOTION LAB: one behaviour per entry, with the rule it demonstrates.
 * Use the ×8 slow and Reduced switches in the bar.
 * ------------------------------------------------------------------ */
function MotionLab() {
  const [seg, setSeg] = React.useState("b");
  const [view, setView] = React.useState("a");
  const [sig, setSig] = React.useState<"idle" | "pending" | "done" | "failed">("idle");
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | null>(null);
  const run = async (fail: boolean) => {
    setSig("pending");
    await new Promise((r) => setTimeout(r, 1200));
    setSig(fail ? "failed" : "done");
    if (!fail) setTimeout(() => setSig("idle"), 900);
  };
  const entries: Entry[] = [
    {
      id: "m-key",
      title: "Key",
      note: "Press and release. Contents travel 1px; the frame never moves.",
      children: (
        <div className={ui.row}>
          <Button variant="primary">Press and hold</Button>
          <Button>Space or Enter</Button>
        </div>
      ),
    },
    {
      id: "m-flood",
      title: "Flood",
      note: "A cell's own state. Hold a press: a seed of the fill sits under the pointer. Release grows it from there; slide off and it shrinks back. The keyboard floods from the leading edge.",
      children: (
        <div className={ui.row}>
          <ToggleGroup aria-label="Flood demo" defaultValue={[]}>
            <ToggleGroupItem value="1">In transit</ToggleGroupItem>
            <ToggleGroupItem value="2">Awaiting docs</ToggleGroupItem>
            <ToggleGroupItem value="3">A deliberately long toggle label</ToggleGroupItem>
          </ToggleGroup>
        </div>
      ),
    },
    {
      id: "m-stretch",
      title: "Stretch",
      note: "Selection moving within a group. Hold a press and the leading edge leans toward it; release commits, slide to another choice to change your mind, Escape or leaving lets go. From the keyboard the leading edge lands at once and the trailing edge catches up in 220ms.",
      children: (
        <>
          <div className={ui.row}>
            <Segmented value={seg} onValueChange={setSeg} aria-label="Stretch demo">
              <SegmentedItem value="a">Day</SegmentedItem>
              <SegmentedItem value="b">Week</SegmentedItem>
              <SegmentedItem value="c">Month</SegmentedItem>
              <SegmentedItem value="d">Fiscal quarter</SegmentedItem>
            </Segmented>
          </div>
          <TableFrame className="max-w-[640px]">
            <TableViews
              views={[
                { value: "a", label: "All", count: 64 },
                { value: "b", label: "Active", count: 51 },
                { value: "c", label: "Needs attention", count: 9 },
                { value: "d", label: "Delivered", count: 13 },
              ]}
              value={view}
              onValueChange={setView}
            />
          </TableFrame>
        </>
      ),
    },
    {
      id: "m-tug",
      title: "Tug, compared",
      note: "The same group with the held press off, at half, and at the default. Off is dead between press and release; half is easy to miss on a long cell; the default is clear and still stops short of the label, so nothing reads as chosen before release.",
      children: <TugCompare />,
    },
    {
      id: "m-seed",
      title: "Seed, compared",
      note: "The flood's seed under a held press: off, the default, and doubled. The seed is where the fill will come from; it is never the state.",
      children: <SeedCompare />,
    },
    {
      id: "m-unfold",
      title: "Unfold",
      note: "Expansion grows from the owner's keyline; the owner row never moves.",
      children: (
        <TableFrame className="max-h-none">
          <TableScroll>
            <Table>
              <TableBody>
                <TableRow expanded={open}>
                  <TableIndexCell
                    rowSpan={open ? 2 : undefined}
                    checked={false}
                    onCheckedChange={() => {}}
                    code="01"
                    label="Select"
                  />
                  <TableExpandCell expanded={open} onToggle={() => setOpen(!open)} label="Show legs" />
                  <TableCell className="font-(family-name:--kl-font-mono) text-[13px]">SH-20483</TableCell>
                  <TableCell>Lyon, FR</TableCell>
                </TableRow>
                <DemoDetail open={open} colSpan={3}>
                  <p className={ui.detail}>
                    Picked up Rotterdam 09 Nov · Venlo 10 Nov · Metz 12 Nov · Lyon ETA 16 Nov.
                  </p>
                </DemoDetail>
                <TableRow>
                  <TableIndexCell checked={false} onCheckedChange={() => {}} code="02" label="Select" />
                  <TableExpandCell />
                  <TableCell className="font-(family-name:--kl-font-mono) text-[13px]">SH-20484</TableCell>
                  <TableCell>Kraków, PL</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableScroll>
        </TableFrame>
      ),
    },
    {
      id: "m-rows",
      title: "Leave and return",
      note: "Rows removed close up where they were; Undo opens the room again in the same place, the keyline leading. Filtering, sorting and paging stay instant.",
      children: <RowsLeaveReturn />,
    },
    {
      id: "m-release",
      title: "Release",
      note: "A released drawer starts at the speed of the hand: a fling leaves without a stall, a drag that stopped returns from rest.",
      children: <ReleaseDrawer />,
    },
    {
      id: "m-signal",
      title: "Signal",
      note: "Pending runs along the bottom keyline. Done inserts a ✓ cell, failed inserts a ! cell, and retry recovers.",
      children: (
        <div className={ui.row}>
          <Button variant="primary" signal={sig} onClick={() => run(false)}>
            Save
          </Button>
          <Button
            signal={sig === "failed" ? "failed" : sig === "pending" ? "pending" : "idle"}
            onClick={() => run(true)}
          >
            Save (will fail)
          </Button>
        </div>
      ),
    },
    {
      id: "m-range",
      title: "Range",
      note: "The moving end previews; the inner cells flood together (no stagger).",
      children: (
        <div className="max-w-[360px]" data-testid="inline-cal">
          <RangeCalendar
            value={range}
            onValueChange={setRange}
            today={TODAY}
            defaultMonth={TODAY}
            isDateUnavailable={isUnavailable}
          />
        </div>
      ),
    },
  ];
  return <Catalogue label="Motion lab" entries={entries} testId="motion-lab" stageClassName="max-w-[760px]" />;
}
