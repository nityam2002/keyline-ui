"use client";

import { Shipments } from "@/components/keyline/blocks/shipments/shipments";

// The installed block is one component: an AppShell with its own sidebar, header, table, inspector and command
// menu. Render it as a page; here it fills the preview frame, and its narrow layout follows the frame's width.
export function ShipmentsBlock() {
  return (
    <div className="w-full min-w-0" data-testid="shipments">
      <Shipments />
    </div>
  );
}
