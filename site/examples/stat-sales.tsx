"use client";

import { useState } from "react";
import { Panel, PanelBody, PanelHeader } from "@/components/keyline/ui/panel";
import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented";
import { Stat } from "@/components/keyline/ui/stat";

const QUARTERS = {
  q3: { reams: 18_240, reamsWas: 17_100, clients: 64, clientsWas: 66, quota: 81 },
  q4: { reams: 19_880, reamsWas: 18_240, clients: 61, clientsWas: 64, quota: 94 },
};

const pct = (now: number, was: number) => `${Math.abs(Math.round(((now - was) / was) * 1000) / 10)}%`;

export function BranchStats() {
  const [q, setQ] = useState<keyof typeof QUARTERS>("q4");
  const d = QUARTERS[q];
  const lost = d.clientsWas - d.clients;

  return (
    <Panel>
      <PanelHeader
        title="Scranton branch"
        code={q.toUpperCase()}
        actions={
          <Segmented
            aria-label="Quarter"
            size="compact"
            value={q}
            onValueChange={(v: string) => setQ(v as keyof typeof QUARTERS)}
          >
            <SegmentedItem value="q3">Q3</SegmentedItem>
            <SegmentedItem value="q4">Q4</SegmentedItem>
          </Segmented>
        }
      />
      <PanelBody flush>
        <div className="@container">
          <div className="grid divide-y divide-kl-line @md:grid-cols-3 @md:divide-x @md:divide-y-0">
            <Stat
              label="Paper sold"
              value={d.reams.toLocaleString("en-US")}
              unit="REAMS"
              delta={{
                value: pct(d.reams, d.reamsWas),
                direction: "up",
                tone: "good",
                label: `up ${pct(d.reams, d.reamsWas)} on the quarter before`,
              }}
            />
            <Stat
              label="Active clients"
              value={d.clients}
              delta={{ value: lost, direction: "down", tone: "bad", label: `${lost} fewer than the quarter before` }}
            />
            <Stat
              label="Corporate quota"
              value={d.quota}
              unit="%"
              meter={{ value: d.quota, label: "Corporate quota met" }}
            />
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}
