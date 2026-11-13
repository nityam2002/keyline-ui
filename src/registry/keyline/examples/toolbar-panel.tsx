"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import {
  Toolbar,
  ToolbarButton,
  ToolbarInput,
  ToolbarLink,
  ToolbarMenuContent,
  ToolbarMenuTrigger,
  ToolbarSeparator,
} from "../ui/toolbar";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from "../ui/menu";
import { Panel, PanelBody } from "../ui/panel";

const LABELS = { client: "Client", rep: "Sales rep", branch: "Branch" };

export function OrdersPanel() {
  const [columns, setColumns] = useState({ client: true, rep: true, branch: false });
  const [rows, setRows] = useState("comfortable");
  const shown = (Object.keys(columns) as (keyof typeof columns)[])
    .filter((key) => columns[key])
    .map((key) => LABELS[key]);

  return (
    <Panel>
      <Toolbar layout="cell" overflow="menu" aria-label="Orders">
        <ToolbarInput
          label="Search orders"
          placeholder="Search orders"
          glyph={<Search size={16} aria-hidden="true" />}
        />
        <Menu>
          <ToolbarMenuTrigger>Columns</ToolbarMenuTrigger>
          <ToolbarMenuContent>
            <MenuGroup>
              <MenuGroupLabel>Shown</MenuGroupLabel>
              <MenuCheckboxItem checked={columns.client} onCheckedChange={(c) => setColumns({ ...columns, client: c })}>
                Client
              </MenuCheckboxItem>
              <MenuCheckboxItem checked={columns.rep} onCheckedChange={(c) => setColumns({ ...columns, rep: c })}>
                Sales rep
              </MenuCheckboxItem>
              <MenuCheckboxItem checked={columns.branch} onCheckedChange={(c) => setColumns({ ...columns, branch: c })}>
                Branch
              </MenuCheckboxItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuRadioGroup value={rows} onValueChange={setRows}>
              <MenuGroupLabel>Rows</MenuGroupLabel>
              <MenuRadioItem value="comfortable">Comfortable</MenuRadioItem>
              <MenuRadioItem value="compact">Compact</MenuRadioItem>
            </MenuRadioGroup>
          </ToolbarMenuContent>
        </Menu>
        <ToolbarSeparator />
        <ToolbarButton>Export</ToolbarButton>
        <ToolbarLink href="#props">Help</ToolbarLink>
      </Toolbar>
      <PanelBody>
        <p role="status">
          Columns: {shown.join(", ") || "none"} · rows {rows}
        </p>
      </PanelBody>
    </Panel>
  );
}
