"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { CheckboxField } from "../ui/checkbox";
import { Badge } from "../ui/status";
import { Segmented, SegmentedItem } from "../ui/segmented";
import { Select, type SelectOption } from "../ui/select";
import {
  DEFAULT_CONFIG,
  KeylineConfigScope,
  PALETTES,
  configToCss,
  type KeylineConfig,
  type PaletteId,
} from "../lib/keyline-config";

const BRANCHES: SelectOption[] = [
  { value: "scranton", label: "Scranton" },
  { value: "stamford", label: "Stamford" },
  { value: "nashua", label: "Nashua" },
];

// One branch's portal in its own palette. theme "system" follows the page, so only the palette changes here.
// configToCss prints the same configuration as CSS: what you would paste or install to make it permanent.
export function BranchTheme() {
  const [palette, setPalette] = useState<PaletteId>("harbor");
  const [branch, setBranch] = useState<string | null>("stamford");
  const config: KeylineConfig = { ...DEFAULT_CONFIG, theme: "system", palette: { ...PALETTES[palette] } };

  return (
    <div className="grid w-full gap-4">
      <Segmented
        size="compact"
        aria-label="Palette"
        value={palette}
        onValueChange={(v: string) => setPalette(v as PaletteId)}
        className="justify-self-start"
      >
        {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
          <SegmentedItem key={id} value={id}>
            {PALETTES[id].label}
          </SegmentedItem>
        ))}
      </Segmented>

      <KeylineConfigScope
        config={config}
        name="branch"
        data-testid="config-scope"
        className="grid gap-kl-gutter border-3 border-kl-line bg-kl-paper p-kl-gutter text-kl-ink"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="signal">NEW</Badge>
          <Badge tone="attention">OVERDUE</Badge>
          <span className="text-[14px] text-kl-ink-2">Branch portal</span>
        </div>
        <Select label="Branch" options={BRANCHES} value={branch} onValueChange={setBranch} />
        <CheckboxField label="Send the weekly report to corporate" defaultChecked />
        <div className="flex gap-2">
          <Button variant="primary">Approve orders</Button>
          <Button>Later</Button>
        </div>
      </KeylineConfigScope>

      <pre
        data-testid="config-css"
        className="m-0 overflow-x-auto border-2 border-kl-line-soft bg-kl-cell p-3 font-kl-mono text-[12px]/[1.6] text-kl-ink-2"
      >
        {configToCss(config, { scope: "branch" })}
      </pre>
    </div>
  );
}
