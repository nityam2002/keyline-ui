"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The Layout pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const AppShellOffice = dynamic(() => import("@site/examples/app-shell-office").then((m) => m.OfficeShell), {
  ssr: false,
  loading,
});
export const SidebarRail = dynamic(() => import("@site/examples/sidebar-rail").then((m) => m.RailSidebar), {
  ssr: false,
  loading,
});
export const PanelTargets = dynamic(() => import("@site/examples/panel-targets").then((m) => m.SalesTargets), {
  ssr: false,
  loading,
});
export const PanelGridBoard = dynamic(() => import("@site/examples/panel-grid").then((m) => m.BranchBoard), {
  ssr: false,
  loading,
});
export const ResizableCalls = dynamic(() => import("@site/examples/resizable-calls").then((m) => m.CallLog), {
  ssr: false,
  loading,
});
export const ScrollAreaLog = dynamic(() => import("@site/examples/scroll-area-log").then((m) => m.ActivityLog), {
  ssr: false,
  loading,
});
export const AccordionPolicies = dynamic(
  () => import("@site/examples/accordion-policies").then((m) => m.BranchPolicies),
  { ssr: false, loading },
);
export const CollapsibleOptions = dynamic(
  () => import("@site/examples/collapsible-options").then((m) => m.DeliveryOptions),
  { ssr: false, loading },
);
export const CarouselPosters = dynamic(
  () => import("@site/examples/carousel-posters").then((m) => m.EmployeeOfTheMonth),
  { ssr: false, loading },
);
export const InspectorOrder = dynamic(() => import("@site/examples/inspector-order").then((m) => m.OrderInspector), {
  ssr: false,
  loading,
});
export const ItemSettings = dynamic(() => import("@site/examples/item-settings").then((m) => m.AlertSettings), {
  ssr: false,
  loading,
});
export const DirectionRtl = dynamic(() => import("@site/examples/direction-rtl").then((m) => m.MirroredInvoices), {
  ssr: false,
  loading,
});
