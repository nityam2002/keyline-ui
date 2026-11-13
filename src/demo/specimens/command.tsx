import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/keyline/ui/command";

/* ------------------------------------------------------------------ *
 * Command dialog: a grouped index that gives way to one flat, ranked list while searching (the docs site's ⌘K)
 * ------------------------------------------------------------------ */
const GROUPS: [string, string[]][] = [
  ["Get started", ["Installation", "Theming", "Modes", "Configuration", "Composition", "Changelog"]],
  [
    "Layout",
    [
      "Accordion",
      "App shell",
      "Aspect ratio",
      "Carousel",
      "Collapsible",
      "Dock",
      "Grid",
      "Panel",
      "Resizable",
      "Scroll area",
      "Separator",
      "Sidebar",
      "Stack",
    ],
  ],
  ["Inputs", ["Checkbox", "Combobox", "Native select", "Number field", "OTP field", "Slider", "Switch"]],
  ["Overlays", ["Dialog", "Drawer", "Hover card", "Menu", "Popover", "Tooltip", "Toast"]],
  ["Navigation", ["Breadcrumb", "Command menu", "Menubar", "Navigation menu", "Pagination", "Tabs"]],
];
const ROWS = GROUPS.flatMap(([group, names]) => names.map((name) => ({ group, name })));

export function CommandSpecimen() {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  return (
    <div className={ui.row} data-testid="specimen-command">
      <Button onClick={() => setOpen(true)}>Search</Button>
      <CommandDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQ("");
        }}
        label="Search components"
      >
        <CommandInput placeholder="Search components…" value={q} onValueChange={setQ} />
        <CommandList data-testid="command-list">
          <CommandEmpty query={q} />
          {q.trim()
            ? ROWS.map((r) => (
                <CommandItem key={r.name} value={`${r.name} ${r.group}`} meta={r.group}>
                  {r.name}
                </CommandItem>
              ))
            : GROUPS.map(([group, names]) => (
                <CommandGroup key={group} heading={group}>
                  {names.map((name) => (
                    <CommandItem key={name} value={`${name} ${group}`}>
                      {name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
