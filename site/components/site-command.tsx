"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/keyline/ui/command";
import { BLOCKS, CATALOG, GUIDES } from "@site/lib/catalog";
import { storeChoice, THEME_LABEL, type ThemeChoice } from "@site/lib/theme";
import { useThemeChoice } from "@site/lib/use-theme";
import { search, type SearchRecord } from "@site/lib/search";

/* The site's ⌘K: one Keyline CommandDialog for every page. It finds a page by name, searches the text of every docs
   page (the build-time index at /search-index.json, fetched the first time it opens), and sets the theme.
   Mounted once in the root layout; anything on the page opens it through useSiteCommand(). */

const LABEL = "Search the docs";

const OpenCommand = React.createContext<() => void>(() => {});
export const useSiteCommand = () => React.useContext(OpenCommand);

export function SiteCommand({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const theme = useThemeChoice();
  const [index, setIndex] = React.useState<SearchRecord[] | null>(null);

  React.useEffect(() => {
    if (!open || index) return;
    let live = true;
    fetch("/search-index.json")
      .then((r) => (r.ok ? (r.json() as Promise<SearchRecord[]>) : []))
      .then((i) => live && setIndex(i))
      .catch(() => live && setIndex([]));
    return () => {
      live = false;
    };
  }, [open, index]);

  React.useEffect(() => {
    // The Command page's example binds ⌘K too. The site's search yields to any other dialog that is open, or
    // that the page opened for this same key press (its handler runs after this one), so the two never stack.
    const otherDialog = () => document.querySelector(`[role="dialog"][data-open]:not([aria-label="${LABEL}"])`);
    let pending = 0;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== "k" || otherDialog()) return;
      e.preventDefault();
      clearTimeout(pending);
      pending = window.setTimeout(() => {
        if (!otherDialog()) setOpen((o) => !o);
      });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(pending);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const change = (o: boolean) => {
    setOpen(o);
    if (!o) setQ("");
  };
  const go = (href: string) => {
    change(false);
    router.push(href);
  };
  const openIt = React.useCallback(() => setOpen(true), []);

  type Row = { key: string; group: string; label: string; value: string; meta?: string; run: () => void };
  const rows: Row[] = [
    ...GUIDES.map((e): Row => ({
      key: e.href,
      group: "Get started",
      label: e.name,
      value: `${e.name} ${e.keywords}`,
      run: () => go(e.href),
    })),
    ...[...CATALOG, BLOCKS].flatMap((g) =>
      g.items
        .filter((e) => e.href)
        .map((e): Row => ({
          key: e.href!,
          group: g.group,
          label: e.name,
          value: `${e.name} ${e.item} ${g.group}`,
          run: () => go(e.href!),
        })),
    ),
    ...(Object.keys(THEME_LABEL) as ThemeChoice[]).map((c): Row => ({
      key: `theme-${c}`,
      group: "Theme",
      label: `${THEME_LABEL[c]} theme`,
      value: `${THEME_LABEL[c]} theme mode appearance`,
      meta: c === theme ? "Current" : undefined,
      run: () => storeChoice(c),
    })),
    { key: "home", group: "Site", label: "Home", value: "home sheet start keyline ui", run: () => go("/") },
  ];
  const groups = [...new Set(rows.map((r) => r.group))];
  // full-text hits are ranked here, not by cmdk: forceMount keeps cmdk's filter from hiding them, after the name matches
  const hits = q.trim() && index ? search(index, q, 8) : [];

  return (
    <OpenCommand.Provider value={openIt}>
      {children}
      <CommandDialog open={open} onOpenChange={change} label={LABEL}>
        <CommandInput placeholder="Search components and guides…" value={q} onValueChange={setQ} />
        <CommandList>
          {hits.length ? null : <CommandEmpty query={q}>Try “table”, “menu” or “dark mode”.</CommandEmpty>}
          {/* cmdk 1.1.1 never reorders groups by score (it looks groups up by id but tags them by heading), so a query
              renders one flat list it can rank, each row naming its group; the empty query keeps the grouped index */}
          {q.trim()
            ? [
                ...rows.map((r) => (
                  <CommandItem key={r.key} value={r.value} meta={r.meta ?? r.group} onSelect={r.run}>
                    {r.label}
                  </CommandItem>
                )),
                ...hits.map((h) => (
                  <CommandItem
                    key={`text-${h.href}`}
                    value={`text ${h.href}`}
                    meta={h.page}
                    forceMount
                    data-testid="search-text-hit"
                    onSelect={() => go(h.href)}
                  >
                    {h.heading === h.page ? h.snippet || h.page : h.heading}
                  </CommandItem>
                )),
              ]
            : groups.map((g) => (
                <CommandGroup key={g} heading={g}>
                  {rows
                    .filter((r) => r.group === g)
                    .map((r) => (
                      <CommandItem key={r.key} value={r.value} meta={r.meta} onSelect={r.run}>
                        {r.label}
                      </CommandItem>
                    ))}
                </CommandGroup>
              ))}
        </CommandList>
      </CommandDialog>
    </OpenCommand.Provider>
  );
}
