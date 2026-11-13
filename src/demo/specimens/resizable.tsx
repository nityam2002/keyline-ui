import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Panel, PanelHeader, PanelBody } from "@/registry/keyline/ui/panel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  usePanelRef,
  useGroupRef,
} from "@/registry/keyline/ui/resizable";

/* ------------------------------------------------------------------ *
 * 1. Resizable
 * ------------------------------------------------------------------ */
const MANIFESTS = ["MSCU 1234567", "MAEU 7781204", "CMAU 3301877", "HLXU 6620193", "ONEU 0049921"];
function Pane({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="p-3">
      <h4 className="m-0 mb-2 text-[14px] font-kl-strong">{title}</h4>
      {children}
    </div>
  );
}
function Workbench({ testid, defaultList = 32 }: { testid?: string; defaultList?: number }) {
  const [sizes, setSizes] = React.useState<number[] | null>(null);
  return (
    <Panel data-testid={testid}>
      <PanelHeader title="Gate workbench" code={sizes ? sizes.map((n) => Math.round(n)).join(" / ") : "RTM"} />
      <PanelBody flush>
        <div style={{ height: 300 }}>
          <ResizablePanelGroup onLayoutChanged={(l) => setSizes(Object.values(l))}>
            <ResizablePanel defaultSize={`${defaultList}%`} minSize="20%" maxSize="50%" collapsible>
              <Pane title="Manifests">
                <ul className="m-0 list-none p-0 whitespace-nowrap text-kl-ink-2 [font:500_12px/1.9_var(--kl-font-mono)]">
                  {MANIFESTS.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </Pane>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Manifests" />
            <ResizablePanel minSize="30%">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize="62%" minSize="30%">
                  <Pane title="MSCU 1234567">
                    <p className={ui.note} dir="auto">
                      40' high cube · 26,410 kg · Gate 4 at 21:40 · Customs released.
                    </p>
                  </Pane>
                </ResizablePanel>
                <ResizableHandle aria-label="Container detail" />
                <ResizablePanel minSize="20%" collapsible>
                  <Pane title="Events">
                    <p className={ui.note} dir="auto">
                      21:40 gate in · 21:52 stacked at B-14-03
                    </p>
                  </Pane>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PanelBody>
    </Panel>
  );
}
/** Buttons are the pointer alternative to dragging (WCAG 2.5.7), through the library's imperative API. */
function ControlledLayout() {
  const filters = usePanelRef();
  const group = useGroupRef();
  const [layout, setLayout] = React.useState<Record<string, number>>({ filters: 25, results: 75 });
  return (
    <div className={ui.stackTight} data-testid="rz-controlled">
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Button onClick={() => filters.current?.collapse()} data-testid="rz-collapse">
          Hide filters
        </Button>
        <Button onClick={() => group.current?.setLayout({ filters: 25, results: 75 })} data-testid="rz-reset">
          Reset layout
        </Button>
      </div>
      <div className="bg-kl-cell [border:var(--kl-k2)_solid_var(--kl-line)]" style={{ height: 160 }}>
        <ResizablePanelGroup groupRef={group} onLayoutChange={setLayout}>
          <ResizablePanel id="filters" panelRef={filters} defaultSize="25%" minSize="15%" collapsible>
            <Pane title="Filters" />
          </ResizablePanel>
          <ResizableHandle aria-label="Filters" />
          <ResizablePanel id="results">
            <Pane title="Results">
              <p className={ui.note} data-testid="rz-readout">
                Filters {Math.round(layout["filters"] ?? 0)}% · results {Math.round(layout["results"] ?? 0)}%
              </p>
            </Pane>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
export function ResizableSpecimen() {
  return (
    <div className={ui.stack} data-testid="specimen-rz">
      <Workbench testid="rz-work" />
      <ControlledLayout />
      <div dir="rtl" data-testid="rz-rtl">
        <Workbench defaultList={40} />
      </div>
    </div>
  );
}
