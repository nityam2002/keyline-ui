"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The guides' and blocks' example modules, loaded after the page: headings, prose and code are already in the HTML.

export const ThemingRoles = dynamic(
  () => import("@/components/keyline/examples/theming-roles").then((m) => m.RoleCards),
  {
    ssr: false,
    loading,
  },
);
export const ModesRegion = dynamic(
  () => import("@/components/keyline/examples/modes-region").then((m) => m.ModesRegion),
  {
    ssr: false,
    loading,
  },
);
export const ConfigScope = dynamic(
  () => import("@/components/keyline/examples/config-scope").then((m) => m.BranchTheme),
  {
    ssr: false,
    loading,
  },
);
export const CompositionCells = dynamic(
  () => import("@/components/keyline/examples/composition-cells").then((m) => m.DeclaredCells),
  {
    ssr: false,
    loading,
  },
);
export const ShipmentsBlock = dynamic(
  () => import("@/components/keyline/examples/shipments-block").then((m) => m.ShipmentsBlock),
  {
    ssr: false,
    loading,
  },
);
