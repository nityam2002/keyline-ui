"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The Overlays pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const DialogNewClient = dynamic(
  () => import("@/components/keyline/examples/dialog-new-client").then((m) => m.NewClient),
  {
    ssr: false,
    loading,
  },
);
export const AlertDialogRemove = dynamic(
  () => import("@/components/keyline/examples/alert-dialog-remove").then((m) => m.RemoveClient),
  { ssr: false, loading },
);
export const DrawerDelivery = dynamic(
  () => import("@/components/keyline/examples/drawer-delivery").then((m) => m.TruckRoute),
  {
    ssr: false,
    loading,
  },
);
export const SheetOrder = dynamic(() => import("@/components/keyline/examples/sheet-order").then((m) => m.OrderSheet), {
  ssr: false,
  loading,
});
export const PopoverNote = dynamic(
  () => import("@/components/keyline/examples/popover-note").then((m) => m.DeliveryNote),
  {
    ssr: false,
    loading,
  },
);
export const HoverCardClient = dynamic(
  () => import("@/components/keyline/examples/hover-card-client").then((m) => m.ClientCards),
  {
    ssr: false,
    loading,
  },
);
export const TooltipIcons = dynamic(
  () => import("@/components/keyline/examples/tooltip-icons").then((m) => m.InvoiceTools),
  {
    ssr: false,
    loading,
  },
);
export const ToastUndo = dynamic(() => import("@/components/keyline/examples/toast-undo").then((m) => m.ArchiveUndo), {
  ssr: false,
  loading,
});
export const ToastPromise = dynamic(
  () => import("@/components/keyline/examples/toast-promise").then((m) => m.SendReport),
  {
    ssr: false,
    loading,
  },
);
export const NoticeStock = dynamic(
  () => import("@/components/keyline/examples/notice-stock").then((m) => m.PaperStock),
  {
    ssr: false,
    loading,
  },
);
