"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/keyline/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/keyline/ui/command";
import { Kbd, KbdGroup } from "@/components/keyline/ui/kbd";

const PAGES = ["Orders", "Clients", "Invoices", "Warehouse"];

export function OfficeCommands() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [last, setLast] = useState("Nothing run yet.");

  // ⌘K or Ctrl+K opens it from anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (said: string) => () => {
    setOpen(false);
    setQ("");
    setLast(said);
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setOpen(true)}>Commands</Button>
        <span className="text-[14px] text-kl-ink-2">
          or press{" "}
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </span>
      </div>
      <p role="status" className="m-0 text-[14px] text-kl-ink-2">
        {last}
      </p>
      <CommandDialog open={open} onOpenChange={(o) => (setOpen(o), o || setQ(""))}>
        <CommandInput placeholder="Type a command or a client…" value={q} onValueChange={setQ} />
        <CommandList>
          <CommandEmpty query={q}>Try “order”, “call” or a client.</CommandEmpty>
          <CommandGroup heading="Go to">
            {PAGES.map((p) => (
              <CommandItem key={p} value={`go to ${p}`} onSelect={run(`Opened ${p}.`)}>
                {p}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem value="new order" shortcut="N" onSelect={run("Started a new order.")}>
              New order
            </CommandItem>
            <CommandItem value="call lackawanna county" meta="Dwight" onSelect={run("Calling Lackawanna County.")}>
              Call Lackawanna County
            </CommandItem>
            <CommandItem value="print invoices" onSelect={run("Sent 40 invoices to the printer.")}>
              Print today&apos;s invoices
            </CommandItem>
            <CommandItem value="order from stamford" disabled>
              Order from Stamford (closed)
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span>
            <Kbd>↑↓</Kbd> move
          </span>
          <span>
            <Kbd>↵</Kbd> run
          </span>
          <span>
            <Kbd>⌥1–9</Kbd> run by number
          </span>
        </CommandFooter>
      </CommandDialog>
    </div>
  );
}
