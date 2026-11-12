"use client";

import * as React from "react";
import { readChoice, subscribe, type ThemeChoice } from "./theme";

/** The reader's stored choice. The server renders "system"; the client takes over on hydration. */
export function useThemeChoice(): ThemeChoice {
  return React.useSyncExternalStore(subscribe, readChoice, () => "system" as ThemeChoice);
}
