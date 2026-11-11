"use client"

import { Contrast, Moon, Search, Sun } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/keyline/ui/button"
import { ButtonGroup } from "@/components/keyline/ui/button-group"
import { Kbd, KbdGroup } from "@/components/keyline/ui/kbd"
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/keyline/ui/menu"
import { storeChoice, THEME_LABEL, type ThemeChoice } from "@site/lib/theme"
import { useThemeChoice } from "@site/lib/use-theme"
import { useSiteCommand } from "./site-command"

const noop = () => () => {}
/** "⌘" on Apple platforms, "Ctrl" elsewhere. The server renders "⌘"; the client corrects it on hydration. */
function useModKey() {
  return React.useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl"),
    () => "⌘",
  )
}

const THEME_ICONS = { light: Sun, dark: Moon, system: Contrast }

/** The site's own controls, the same on every page: search (⌘K) and the colour theme.
 *  frame: their own ButtonGroup (standing alone, on the home sheet). cells: bare cells for a frame that already
 *  holds them (AppShell's header actions), so no second frame is drawn inside the header's. */
export function SiteControls({ className, layout = "frame" }: { className?: string; layout?: "frame" | "cells" }) {
  const open = useSiteCommand()
  const theme = useThemeChoice()
  const mod = useModKey()
  const ThemeIcon = THEME_ICONS[theme]
  const cells = (
    <>
      {/* reads as a field: "Search" at the start, its keys at the end; on a phone, just the icon, centred */}
      <Button layout="cell" onClick={open} aria-keyshortcuts="Meta+K Control+K" className="min-w-40 max-[561px]:min-w-0" data-testid="site-search">
        <span className="flex flex-1 items-center justify-between gap-4 max-[561px]:justify-center">
          <Search size={16} className="hidden max-[561px]:block" aria-hidden="true" />
          <span className="max-[561px]:sr-only">Search</span>
          <KbdGroup className="my-0 max-[561px]:hidden">
            <Kbd label={mod === "⌘" ? "Command" : "Control"}>{mod}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </span>
      </Button>
      <Menu>
        <MenuTrigger render={<Button layout="cell" size="icon" aria-label={`Theme: ${THEME_LABEL[theme]}`} data-testid="site-theme" />}>
          <ThemeIcon size={16} aria-hidden="true" />
        </MenuTrigger>
        <MenuContent align="end">
          <MenuRadioGroup value={theme} onValueChange={(v) => storeChoice(v as ThemeChoice)}>
            {(Object.keys(THEME_LABEL) as ThemeChoice[]).map((c) => (
              <MenuRadioItem key={c} value={c}>
                {THEME_LABEL[c]}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </>
  )
  return layout === "cells" ? (
    cells
  ) : (
    <ButtonGroup aria-label="Site" className={className}>
      {cells}
    </ButtonGroup>
  )
}
