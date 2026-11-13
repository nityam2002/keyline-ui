"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The Data pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const StatusDeliveries = dynamic(
  () => import("@/components/keyline/examples/status-deliveries").then((m) => m.DeliveryBoard),
  {
    ssr: false,
    loading,
  },
);
export const StatusBadges = dynamic(
  () => import("@/components/keyline/examples/status-badges").then((m) => m.InvoiceBadges),
  {
    ssr: false,
    loading,
  },
);

export const StatSales = dynamic(() => import("@/components/keyline/examples/stat-sales").then((m) => m.BranchStats), {
  ssr: false,
  loading,
});
export const StatWarehouse = dynamic(
  () => import("@/components/keyline/examples/stat-warehouse").then((m) => m.WarehouseSpace),
  {
    ssr: false,
    loading,
  },
);

export const ProgressUpload = dynamic(
  () => import("@/components/keyline/examples/progress-upload").then((m) => m.UploadReport),
  {
    ssr: false,
    loading,
  },
);
export const ProgressPrint = dynamic(
  () => import("@/components/keyline/examples/progress-print").then((m) => m.PrintInvoices),
  {
    ssr: false,
    loading,
  },
);

export const SkeletonClient = dynamic(
  () => import("@/components/keyline/examples/skeleton-client").then((m) => m.ClientCard),
  {
    ssr: false,
    loading,
  },
);

export const EmptySearch = dynamic(
  () => import("@/components/keyline/examples/empty-search").then((m) => m.ClientSearch),
  {
    ssr: false,
    loading,
  },
);
export const EmptyCalls = dynamic(() => import("@/components/keyline/examples/empty-calls").then((m) => m.CallLog), {
  ssr: false,
  loading,
});

export const AvatarTeam = dynamic(
  () => import("@/components/keyline/examples/avatar-team").then((m) => m.AccountTeam),
  {
    ssr: false,
    loading,
  },
);
export const AvatarStatus = dynamic(() => import("@/components/keyline/examples/avatar-status").then((m) => m.WhosIn), {
  ssr: false,
  loading,
});

export const KbdShortcuts = dynamic(
  () => import("@/components/keyline/examples/kbd-shortcuts").then((m) => m.OrderShortcuts),
  {
    ssr: false,
    loading,
  },
);

export const MarkerActivity = dynamic(
  () => import("@/components/keyline/examples/marker-activity").then((m) => m.OrderActivity),
  {
    ssr: false,
    loading,
  },
);

export const TableOrders = dynamic(
  () => import("@/components/keyline/examples/table-orders").then((m) => m.OpenOrders),
  {
    ssr: false,
    loading,
  },
);
export const TableLines = dynamic(() => import("@/components/keyline/examples/table-lines").then((m) => m.OrderLines), {
  ssr: false,
  loading,
});
export const TableLoading = dynamic(
  () => import("@/components/keyline/examples/table-loading").then((m) => m.InvoiceTable),
  {
    ssr: false,
    loading,
  },
);

export const ChartSales = dynamic(() => import("@/components/keyline/examples/chart-sales").then((m) => m.SalesByRep), {
  ssr: false,
  loading,
});
export const ChartTarget = dynamic(
  () => import("@/components/keyline/examples/chart-target").then((m) => m.WeeklyTarget),
  {
    ssr: false,
    loading,
  },
);
export const ChartReturns = dynamic(
  () => import("@/components/keyline/examples/chart-returns").then((m) => m.ReturnsByClient),
  {
    ssr: false,
    loading,
  },
);

export const DataTableOrders = dynamic(
  () => import("@/components/keyline/examples/data-table-orders").then((m) => m.OrdersDataTable),
  { ssr: false, loading },
);
