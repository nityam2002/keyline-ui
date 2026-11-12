"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The guides' and blocks' example modules, loaded after the page: headings, prose and code are already in the HTML.

export const ThemingRoles = dynamic(() => import("@site/examples/theming-roles").then((m) => m.RoleCards), {
  ssr: false,
  loading,
});
export const ModesRegion = dynamic(() => import("@site/examples/modes-region").then((m) => m.ModesRegion), {
  ssr: false,
  loading,
});
export const ConfigScope = dynamic(() => import("@site/examples/config-scope").then((m) => m.BranchTheme), {
  ssr: false,
  loading,
});
export const CompositionCells = dynamic(() => import("@site/examples/composition-cells").then((m) => m.DeclaredCells), {
  ssr: false,
  loading,
});
export const ShipmentsBlock = dynamic(() => import("@site/examples/shipments-block").then((m) => m.ShipmentsBlock), {
  ssr: false,
  loading,
});
