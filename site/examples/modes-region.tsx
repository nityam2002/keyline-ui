"use client";

import { useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import { DirectionProvider } from "@/components/keyline/ui/direction";
import { Field, FieldFrame, FieldControl, FieldLabel } from "@/components/keyline/ui/field";
import { Segmented, SegmentedItem } from "@/components/keyline/ui/segmented";
import { Select, type SelectOption } from "@/components/keyline/ui/select";

const REPS: SelectOption[] = [
  { value: "dwight", label: "Dwight Schrute" },
  { value: "jim", label: "Jim Halpert" },
  { value: "phyllis", label: "Phyllis Vance" },
];

type Theme = "page" | "light" | "dark";
type Density = "compact" | "default" | "comfortable";
type Cut = "off" | "quiet" | "on";

// Every mode is an attribute or a class on the region, so it applies to this subtree only. The Select's list
// opens in a portal under <body> and still takes the region's theme, density, cut and direction.
export function ModesRegion() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [density, setDensity] = useState<Density>("compact");
  const [cut, setCut] = useState<Cut>("off");
  const [reduce, setReduce] = useState(false);
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");
  const [rep, setRep] = useState<string | null>("jim");

  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <Segmented size="compact" aria-label="Theme" value={theme} onValueChange={(v: string) => setTheme(v as Theme)}>
          <SegmentedItem value="page">Page</SegmentedItem>
          <SegmentedItem value="light">Light</SegmentedItem>
          <SegmentedItem value="dark">Dark</SegmentedItem>
        </Segmented>
        <Segmented
          size="compact"
          aria-label="Density"
          value={density}
          onValueChange={(v: string) => setDensity(v as Density)}
        >
          <SegmentedItem value="compact">Compact</SegmentedItem>
          <SegmentedItem value="default">Default</SegmentedItem>
          <SegmentedItem value="comfortable">Comfortable</SegmentedItem>
        </Segmented>
        <Segmented size="compact" aria-label="Cut" value={cut} onValueChange={(v: string) => setCut(v as Cut)}>
          <SegmentedItem value="off">Cut off</SegmentedItem>
          <SegmentedItem value="quiet">Quiet</SegmentedItem>
          <SegmentedItem value="on">On</SegmentedItem>
        </Segmented>
        <Segmented
          size="compact"
          aria-label="Motion"
          value={reduce ? "reduce" : "full"}
          onValueChange={(v: string) => setReduce(v === "reduce")}
        >
          <SegmentedItem value="full">Full motion</SegmentedItem>
          <SegmentedItem value="reduce">Reduced</SegmentedItem>
        </Segmented>
        <Segmented
          size="compact"
          aria-label="Direction"
          value={dir}
          onValueChange={(v: string) => setDir(v as "ltr" | "rtl")}
        >
          <SegmentedItem value="ltr">LTR</SegmentedItem>
          <SegmentedItem value="rtl">RTL</SegmentedItem>
        </Segmented>
      </div>

      <DirectionProvider direction={dir}>
        <div
          data-testid="mode-region"
          className={`${theme === "page" ? "" : theme} grid gap-kl-gutter border-3 border-kl-line bg-kl-paper p-kl-gutter text-kl-ink`}
          data-kl-density={density}
          data-kl-cut={cut}
          data-kl-motion={reduce ? "reduce" : undefined}
        >
          <div className="grid gap-kl-gutter sm:grid-cols-2">
            <Select label="Assign the reorder to" options={REPS} value={rep} onValueChange={setRep} />
            <Field name="cases">
              <FieldLabel>Cases</FieldLabel>
              <FieldFrame>
                <FieldControl type="number" inputMode="numeric" defaultValue="40" align="end" />
              </FieldFrame>
            </Field>
          </div>
          <div className="flex gap-2">
            <Button variant="primary">Place reorder</Button>
            <Button>Save draft</Button>
          </div>
        </div>
      </DirectionProvider>
    </div>
  );
}
