"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The example modules themselves, loaded after the page: headings, install command and code are already in the HTML.

export const ToolbarEditorExample = dynamic(
  () => import("@/components/keyline/examples/toolbar-editor").then((m) => m.MemoEditor),
  {
    ssr: false,
    loading,
  },
);
export const ToolbarPanelExample = dynamic(
  () => import("@/components/keyline/examples/toolbar-panel").then((m) => m.OrdersPanel),
  {
    ssr: false,
    loading,
  },
);
export const ToolbarVerticalExample = dynamic(
  () => import("@/components/keyline/examples/toolbar-vertical").then((m) => m.FloorPlanTools),
  { ssr: false, loading },
);
export const ToolbarScrollExample = dynamic(
  () => import("@/components/keyline/examples/toolbar-scroll").then((m) => m.OrderCommands),
  { ssr: false, loading },
);
