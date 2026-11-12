"use client";

import { useState } from "react";
import { MenuItem } from "@/components/keyline/ui/menu";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  SplitButtonPopup,
  SplitButtonTrigger,
} from "@/components/keyline/ui/split-button";

const FORMATS = ["PDF", "CSV", "Excel"] as const;
type Format = (typeof FORMATS)[number];

export function ExportReport() {
  // the action repeats the last format chosen from the menu
  const [format, setFormat] = useState<Format>("PDF");
  const [file, setFile] = useState<string | null>(null);

  const exportAs = (f: Format) => {
    setFormat(f);
    setFile(`scranton-q3-sales.${f === "Excel" ? "xlsx" : f.toLowerCase()}`);
  };

  return (
    <div className="grid gap-4">
      <SplitButton className="justify-self-start">
        <SplitButtonAction onClick={() => exportAs(format)}>Export as {format}</SplitButtonAction>
        <SplitButtonMenu>
          <SplitButtonTrigger aria-label="Export formats" />
          <SplitButtonPopup>
            {FORMATS.map((f) => (
              <MenuItem key={f} onClick={() => exportAs(f)}>
                {f}
              </MenuItem>
            ))}
          </SplitButtonPopup>
        </SplitButtonMenu>
      </SplitButton>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {file ? (
          <>
            Saved <span className="font-kl-mono">{file}</span> to Downloads.
          </>
        ) : (
          "Q3 sales report, Scranton branch."
        )}
      </p>
    </div>
  );
}
