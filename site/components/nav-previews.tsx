"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The Navigation pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const TabsAccount = dynamic(
  () => import("@/components/keyline/examples/tabs-account").then((m) => m.ClientAccount),
  {
    ssr: false,
    loading,
  },
);
export const TabsViews = dynamic(() => import("@/components/keyline/examples/tabs-views").then((m) => m.CallViews), {
  ssr: false,
  loading,
});
export const BreadcrumbDrive = dynamic(
  () => import("@/components/keyline/examples/breadcrumb-drive").then((m) => m.DriveFolder),
  {
    ssr: false,
    loading,
  },
);
export const PaginationInvoices = dynamic(
  () => import("@/components/keyline/examples/pagination-invoices").then((m) => m.InvoiceArchive),
  { ssr: false, loading },
);
export const NavSidebar = dynamic(
  () => import("@/components/keyline/examples/nav-sidebar").then((m) => m.OfficeSidebar),
  {
    ssr: false,
    loading,
  },
);
export const NavigationMenuSite = dynamic(
  () => import("@/components/keyline/examples/navigation-menu-site").then((m) => m.PaperSiteNav),
  { ssr: false, loading },
);
export const CommandOffice = dynamic(
  () => import("@/components/keyline/examples/command-office").then((m) => m.OfficeCommands),
  {
    ssr: false,
    loading,
  },
);
