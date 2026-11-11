"use client"

import dynamic from "next/dynamic"
import { ExampleLoading as loading } from "./example-loading"

// The Actions pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const ButtonInvoice = dynamic(() => import("@site/examples/button-invoice").then((m) => m.InvoiceActions), { ssr: false, loading })
export const ButtonVariants = dynamic(() => import("@site/examples/button-variants").then((m) => m.ExpenseReview), { ssr: false, loading })
export const ButtonRetry = dynamic(() => import("@site/examples/button-retry").then((m) => m.CorporateSync), { ssr: false, loading })
export const ButtonAffixExample = dynamic(() => import("@site/examples/button-affix").then((m) => m.WarehouseQueue), { ssr: false, loading })

export const ButtonGroupReview = dynamic(() => import("@site/examples/button-group-review").then((m) => m.OrderReview), { ssr: false, loading })
export const ButtonGroupZoom = dynamic(() => import("@site/examples/button-group-zoom").then((m) => m.ReportZoom), { ssr: false, loading })
export const ButtonGroupMenu = dynamic(() => import("@site/examples/button-group-menu").then((m) => m.TrackingLink), { ssr: false, loading })

export const SplitButtonDelivery = dynamic(() => import("@site/examples/split-button-delivery").then((m) => m.BookDelivery), { ssr: false, loading })
export const SplitButtonExport = dynamic(() => import("@site/examples/split-button-export").then((m) => m.ExportReport), { ssr: false, loading })

export const ToggleReceipts = dynamic(() => import("@site/examples/toggle-receipts").then((m) => m.ExpenseFilter), { ssr: false, loading })
export const ToggleIcon = dynamic(() => import("@site/examples/toggle-icon").then((m) => m.PinClient), { ssr: false, loading })

export const ToggleGroupReps = dynamic(() => import("@site/examples/toggle-group-reps").then((m) => m.OrdersByRep), { ssr: false, loading })
export const ToggleGroupPanel = dynamic(() => import("@site/examples/toggle-group-panel").then((m) => m.SupplyRoom), { ssr: false, loading })

export const MenuOrderActions = dynamic(() => import("@site/examples/menu-order-actions").then((m) => m.OrderActions), { ssr: false, loading })
export const MenuNotifications = dynamic(() => import("@site/examples/menu-notifications").then((m) => m.NotificationMenu), { ssr: false, loading })

export const MenubarReport = dynamic(() => import("@site/examples/menubar-report").then((m) => m.SalesReportMenus), { ssr: false, loading })

export const ContextMenuClients = dynamic(() => import("@site/examples/context-menu-clients").then((m) => m.ClientList), { ssr: false, loading })
