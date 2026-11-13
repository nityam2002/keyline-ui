"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The Layout pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const AppShellOffice = dynamic(
  () => import("@/components/keyline/examples/app-shell-office").then((m) => m.OfficeShell),
  {
    ssr: false,
    loading,
  },
);
export const SidebarRail = dynamic(
  () => import("@/components/keyline/examples/sidebar-rail").then((m) => m.RailSidebar),
  {
    ssr: false,
    loading,
  },
);
export const PanelTargets = dynamic(
  () => import("@/components/keyline/examples/panel-targets").then((m) => m.SalesTargets),
  {
    ssr: false,
    loading,
  },
);
export const PanelGridBoard = dynamic(
  () => import("@/components/keyline/examples/panel-grid").then((m) => m.BranchBoard),
  {
    ssr: false,
    loading,
  },
);
export const ResizableCalls = dynamic(
  () => import("@/components/keyline/examples/resizable-calls").then((m) => m.CallLog),
  {
    ssr: false,
    loading,
  },
);
export const ScrollAreaLog = dynamic(
  () => import("@/components/keyline/examples/scroll-area-log").then((m) => m.ActivityLog),
  {
    ssr: false,
    loading,
  },
);
export const AccordionPolicies = dynamic(
  () => import("@/components/keyline/examples/accordion-policies").then((m) => m.BranchPolicies),
  { ssr: false, loading },
);
export const CollapsibleOptions = dynamic(
  () => import("@/components/keyline/examples/collapsible-options").then((m) => m.DeliveryOptions),
  { ssr: false, loading },
);
export const CarouselPosters = dynamic(
  () => import("@/components/keyline/examples/carousel-posters").then((m) => m.EmployeeOfTheMonth),
  { ssr: false, loading },
);
export const InspectorOrder = dynamic(
  () => import("@/components/keyline/examples/inspector-order").then((m) => m.OrderInspector),
  {
    ssr: false,
    loading,
  },
);
export const ItemSettings = dynamic(
  () => import("@/components/keyline/examples/item-settings").then((m) => m.AlertSettings),
  {
    ssr: false,
    loading,
  },
);
export const DirectionRtl = dynamic(
  () => import("@/components/keyline/examples/direction-rtl").then((m) => m.MirroredInvoices),
  {
    ssr: false,
    loading,
  },
);
