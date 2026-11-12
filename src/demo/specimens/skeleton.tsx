import * as React from "react";
import { cn } from "@/lib/utils";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Select } from "@/registry/keyline/ui/select";
import { Skeleton, SkeletonGroup } from "@/registry/keyline/ui/skeleton";
import { Stat } from "@/registry/keyline/ui/stat";
import { Panel, PanelHeader, PanelBody } from "@/registry/keyline/ui/panel";
import { CARRIERS } from "@/registry/keyline/blocks/shipments/shipments-data";

/* ------------------------------------------------------------------ *
 * 3a. Skeleton
 * ------------------------------------------------------------------ */
export function SkeletonSpecimen() {
  const [busy, setBusy] = React.useState(true);
  const reload = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 1400);
  };
  return (
    <div className={ui.stack}>
      <div className={ui.row}>
        <Button onClick={reload}>Reload</Button>
        <Button variant="quiet" onClick={() => setBusy((b) => !b)}>
          {busy ? "Show content" : "Show skeleton"}
        </Button>
      </div>
      <SkeletonGroup label="Loading the carrier summary" busy={busy} data-testid="specimen-skel">
        <div className={cn(ui.grid2, "max-w-[880px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]")}>
          <Panel>
            <PanelHeader title="Maersk, this week" />
            <PanelBody flush>
              <div className="kl-cells">
                <Stat label="On time" value={busy ? <Skeleton shape="value" /> : "94.2"} unit="%" />
                <Stat label="Shipments" value={busy ? <Skeleton shape="value" width="3ch" /> : "298"} />
              </div>
            </PanelBody>
            <PanelBody className="[border-block-start:var(--kl-k1)_solid_var(--kl-line)]">
              {busy ? (
                <Skeleton shape="block" height={120} />
              ) : (
                <div
                  className="grid place-items-center text-kl-ink-2 [border:var(--kl-k1)_solid_var(--kl-line)] [font:500_12px/1_var(--kl-font-mono)]"
                  style={{ height: 120 }}
                >
                  Transit-time chart
                </div>
              )}
            </PanelBody>
          </Panel>
          <div className={ui.stack}>
            <Panel>
              <PanelHeader title="Notes from the account manager" />
              <PanelBody>
                {busy ? (
                  <Skeleton lines={3} />
                ) : (
                  <p className={ui.p}>
                    Rotterdam gate congestion eased on Tuesday. Reefer plugs at Europoort are back to full capacity;
                    expect normal dwell times from Thursday.
                  </p>
                )}
              </PanelBody>
            </Panel>
            <div className={ui.stackTight}>
              <span className="kl-field-label">Default carrier</span>
              {busy ? (
                <Skeleton shape="control" />
              ) : (
                <Select
                  label="Default carrier"
                  options={CARRIERS.slice(0, 5)}
                  defaultValue="Maersk"
                  className="[&>[data-slot=select-label]]:sr-only"
                />
              )}
            </div>
          </div>
        </div>
      </SkeletonGroup>
    </div>
  );
}
