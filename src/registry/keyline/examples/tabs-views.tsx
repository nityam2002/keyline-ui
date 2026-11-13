"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTab } from "../ui/tabs";

const CALLS = [
  { who: "Lackawanna County", rep: "Dwight", done: true },
  { who: "Blue Cross of Pennsylvania", rep: "Jim", done: false },
  { who: "Harper Collins", rep: "Phyllis", done: true },
  { who: "Mount Airy Casino", rep: "Jim", done: false },
  { who: "Penn Paper Supply", rep: "Stanley", done: false },
];

const VIEWS = [
  { value: "all", label: "All", test: () => true },
  { value: "todo", label: "To call", test: (c: (typeof CALLS)[number]) => !c.done },
  { value: "done", label: "Called", test: (c: (typeof CALLS)[number]) => c.done },
];

export function CallViews() {
  const [view, setView] = useState("todo");
  const shown = CALLS.filter(VIEWS.find((v) => v.value === view)!.test);

  return (
    <div className="grid gap-4">
      {/* no panels: the tabs switch a view of one list */}
      <Tabs value={view} onValueChange={(v) => setView(v as string)}>
        <TabsList aria-label="Calls this week">
          {VIEWS.map((v) => (
            <TabsTab key={v.value} value={v.value} count={CALLS.filter(v.test).length}>
              {v.label}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      <ul aria-label="Calls" className="m-0 grid list-none gap-2 p-0 text-[14px]">
        {shown.map((c) => (
          <li key={c.who}>
            {c.who} <span className="text-kl-ink-3">· {c.rep}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
