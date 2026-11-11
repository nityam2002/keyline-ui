"use client"

import dynamic from "next/dynamic"
import { ExampleLoading as loading } from "./example-loading"

// The Data pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const StatusDeliveries = dynamic(() => import("@site/examples/status-deliveries").then((m) => m.DeliveryBoard), { ssr: false, loading })
export const StatusBadges = dynamic(() => import("@site/examples/status-badges").then((m) => m.InvoiceBadges), { ssr: false, loading })

export const StatSales = dynamic(() => import("@site/examples/stat-sales").then((m) => m.BranchStats), { ssr: false, loading })
export const StatWarehouse = dynamic(() => import("@site/examples/stat-warehouse").then((m) => m.WarehouseSpace), { ssr: false, loading })

export const ProgressUpload = dynamic(() => import("@site/examples/progress-upload").then((m) => m.UploadReport), { ssr: false, loading })
export const ProgressPrint = dynamic(() => import("@site/examples/progress-print").then((m) => m.PrintInvoices), { ssr: false, loading })

export const SkeletonClient = dynamic(() => import("@site/examples/skeleton-client").then((m) => m.ClientCard), { ssr: false, loading })

export const EmptySearch = dynamic(() => import("@site/examples/empty-search").then((m) => m.ClientSearch), { ssr: false, loading })
export const EmptyCalls = dynamic(() => import("@site/examples/empty-calls").then((m) => m.CallLog), { ssr: false, loading })

export const AvatarTeam = dynamic(() => import("@site/examples/avatar-team").then((m) => m.AccountTeam), { ssr: false, loading })
export const AvatarStatus = dynamic(() => import("@site/examples/avatar-status").then((m) => m.WhosIn), { ssr: false, loading })

export const KbdShortcuts = dynamic(() => import("@site/examples/kbd-shortcuts").then((m) => m.OrderShortcuts), { ssr: false, loading })

export const MarkerActivity = dynamic(() => import("@site/examples/marker-activity").then((m) => m.OrderActivity), { ssr: false, loading })

export const TableOrders = dynamic(() => import("@site/examples/table-orders").then((m) => m.OpenOrders), { ssr: false, loading })
export const TableLines = dynamic(() => import("@site/examples/table-lines").then((m) => m.OrderLines), { ssr: false, loading })
export const TableLoading = dynamic(() => import("@site/examples/table-loading").then((m) => m.InvoiceTable), { ssr: false, loading })

export const ChartSales = dynamic(() => import("@site/examples/chart-sales").then((m) => m.SalesByRep), { ssr: false, loading })
export const ChartTarget = dynamic(() => import("@site/examples/chart-target").then((m) => m.WeeklyTarget), { ssr: false, loading })
export const ChartReturns = dynamic(() => import("@site/examples/chart-returns").then((m) => m.ReturnsByClient), { ssr: false, loading })
