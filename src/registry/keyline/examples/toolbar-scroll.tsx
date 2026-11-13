"use client";

import { Toolbar, ToolbarButton, ToolbarSeparator } from "../ui/toolbar";

export function OrderCommands() {
  return (
    <Toolbar aria-label="Order commands">
      <ToolbarButton>Assign sales rep</ToolbarButton>
      <ToolbarButton>Reschedule delivery window</ToolbarButton>
      <ToolbarButton affix={<kbd>⌘P</kbd>}>Print invoices</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton>Cancel order</ToolbarButton>
    </Toolbar>
  );
}
