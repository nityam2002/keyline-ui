"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The Navigation pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const TabsAccount = dynamic(() => import("@site/examples/tabs-account").then((m) => m.ClientAccount), {
  ssr: false,
  loading,
});
export const TabsViews = dynamic(() => import("@site/examples/tabs-views").then((m) => m.CallViews), {
  ssr: false,
  loading,
});
export const BreadcrumbDrive = dynamic(() => import("@site/examples/breadcrumb-drive").then((m) => m.DriveFolder), {
  ssr: false,
  loading,
});
export const PaginationInvoices = dynamic(
  () => import("@site/examples/pagination-invoices").then((m) => m.InvoiceArchive),
  { ssr: false, loading },
);
export const NavSidebar = dynamic(() => import("@site/examples/nav-sidebar").then((m) => m.OfficeSidebar), {
  ssr: false,
  loading,
});
export const NavigationMenuSite = dynamic(
  () => import("@site/examples/navigation-menu-site").then((m) => m.PaperSiteNav),
  { ssr: false, loading },
);
export const CommandOffice = dynamic(() => import("@site/examples/command-office").then((m) => m.OfficeCommands), {
  ssr: false,
  loading,
});
