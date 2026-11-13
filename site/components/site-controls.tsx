"use client";

import { Contrast, Moon, Search, Sun } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/keyline/ui/button";
import { ButtonGroup } from "@/components/keyline/ui/button-group";
import { Kbd, KbdGroup } from "@/components/keyline/ui/kbd";
import { Menu, MenuPopup, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/keyline/ui/menu";
import { REPO_URL } from "@site/lib/repo";
import { storeChoice, THEME_LABEL, type ThemeChoice } from "@site/lib/theme";
import { useThemeChoice } from "@site/lib/use-theme";
import { useSiteCommand } from "./site-command";

const noop = () => () => {};
/** "⌘" on Apple platforms, "Ctrl" elsewhere. The server renders "⌘"; the client corrects it on hydration. */
function useModKey() {
  return React.useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"),
    () => "⌘",
  );
}

const THEME_ICONS = { light: Sun, dark: Moon, system: Contrast };

/** GitHub's mark (lucide no longer ships brand marks), at the 16px the other cells' icons use. */
function GitHubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** The site's own controls, the same on every page: search (⌘K), the source on GitHub and the colour theme.
 *  frame: their own ButtonGroup (standing alone, on the home sheet). cells: bare cells for a frame that already
 *  holds them (AppShell's header actions), so no second frame is drawn inside the header's. */
export function SiteControls({ className, layout = "frame" }: { className?: string; layout?: "frame" | "cells" }) {
  const open = useSiteCommand();
  const theme = useThemeChoice();
  const mod = useModKey();
  const ThemeIcon = THEME_ICONS[theme];
  const cells = (
    <>
      {/* reads as a field: "Search" at the start, its keys at the end; on a phone, just the icon, centred */}
      <Button
        layout="cell"
        onClick={open}
        aria-keyshortcuts="Meta+K Control+K"
        className="min-w-40 max-[561px]:min-w-0"
        data-testid="site-search"
      >
        <span className="flex flex-1 items-center justify-between gap-4 max-[561px]:justify-center">
          <Search size={16} className="hidden max-[561px]:block" aria-hidden="true" />
          <span className="max-[561px]:sr-only">Search</span>
          <KbdGroup className="my-0 max-[561px]:hidden">
            <Kbd label={mod === "⌘" ? "Command" : "Control"}>{mod}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </span>
      </Button>
      <Button
        layout="cell"
        size="icon"
        nativeButton={false}
        render={<a href={REPO_URL} target="_blank" rel="noreferrer" />}
        aria-label="Keyline UI on GitHub (opens in a new tab)"
        data-testid="site-github"
      >
        <GitHubMark />
      </Button>
      <Menu>
        <MenuTrigger
          render={
            <Button layout="cell" size="icon" aria-label={`Theme: ${THEME_LABEL[theme]}`} data-testid="site-theme" />
          }
        >
          <ThemeIcon size={16} aria-hidden="true" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuRadioGroup value={theme} onValueChange={(v) => storeChoice(v as ThemeChoice)}>
            {(Object.keys(THEME_LABEL) as ThemeChoice[]).map((c) => (
              <MenuRadioItem key={c} value={c}>
                {THEME_LABEL[c]}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuPopup>
      </Menu>
    </>
  );
  return layout === "cells" ? (
    cells
  ) : (
    <ButtonGroup aria-label="Site" className={className}>
      {cells}
    </ButtonGroup>
  );
}
