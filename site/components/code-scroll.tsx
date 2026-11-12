"use client";

import { ScrollArea } from "@/components/keyline/ui/scroll-area";

/** Keyline's ScrollArea around highlighted code: long lines scroll sideways, a capped block scrolls down too. */
export function CodeScroll({ html, label, tall }: { html: string; label: string; tall?: boolean }) {
  return (
    <ScrollArea
      scrollbars={tall ? "both" : "horizontal"}
      track="rail"
      label={label}
      className="min-w-0 data-[tall]:max-h-[480px]"
      data-tall={tall ? "" : undefined}
    >
      {/* Shiki escapes the source when it serializes the highlighted HTML. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </ScrollArea>
  );
}
