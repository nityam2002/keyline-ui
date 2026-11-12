"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Redo2, Underline, Undo2 } from "lucide-react";
import { useState } from "react";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarMenuContent,
  ToolbarMenuTrigger,
  ToolbarSpacer,
  ToolbarToggle,
  ToolbarToggleGroup,
} from "@/components/keyline/ui/toolbar";
import { Menu, MenuItem } from "@/components/keyline/ui/menu";
import { Tooltip } from "@/components/keyline/ui/tooltip";

export function MemoEditor() {
  const [style, setStyle] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState<string[]>(["start"]);
  const [comments, setComments] = useState(true);
  const [last, setLast] = useState("none");

  return (
    <>
      <Toolbar aria-label="Memo formatting" overflow="menu">
        <ToolbarGroup aria-label="History">
          <Tooltip content="Undo" shortcut="⌘Z">
            <ToolbarButton icon aria-label="Undo" onClick={() => setLast("Undo")}>
              <Undo2 size={16} aria-hidden="true" />
            </ToolbarButton>
          </Tooltip>
          <ToolbarButton icon aria-label="Redo" disabled>
            <Redo2 size={16} aria-hidden="true" />
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarToggleGroup aria-label="Text style" value={style} onValueChange={setStyle}>
          <ToolbarToggle icon value="bold" aria-label="Bold">
            <Bold size={16} aria-hidden="true" />
          </ToolbarToggle>
          <ToolbarToggle icon value="italic" aria-label="Italic">
            <Italic size={16} aria-hidden="true" />
          </ToolbarToggle>
          <ToolbarToggle icon value="underline" aria-label="Underline">
            <Underline size={16} aria-hidden="true" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
        <ToolbarToggleGroup
          aria-label="Alignment"
          multiple={false}
          value={align}
          onValueChange={(v) => v.length && setAlign(v)}
        >
          <ToolbarToggle icon value="start" aria-label="Align start">
            <AlignLeft size={16} aria-hidden="true" />
          </ToolbarToggle>
          <ToolbarToggle icon value="centre" aria-label="Align centre">
            <AlignCenter size={16} aria-hidden="true" />
          </ToolbarToggle>
          <ToolbarToggle icon value="end" aria-label="Align end">
            <AlignRight size={16} aria-hidden="true" />
          </ToolbarToggle>
        </ToolbarToggleGroup>
        <Menu>
          <ToolbarMenuTrigger>Insert</ToolbarMenuTrigger>
          <ToolbarMenuContent>
            <MenuItem onClick={() => setLast("Insert table")}>Table</MenuItem>
            <MenuItem onClick={() => setLast("Insert checklist")}>Checklist</MenuItem>
            <MenuItem description="From the Scranton letterhead" onClick={() => setLast("Insert signature")}>
              Signature block
            </MenuItem>
          </ToolbarMenuContent>
        </Menu>
        <ToolbarSpacer />
        <ToolbarToggle pressed={comments} onPressedChange={setComments} affix="3">
          Comments
        </ToolbarToggle>
        <ToolbarButton primary onClick={() => setLast("Send")}>
          Send memo
        </ToolbarButton>
      </Toolbar>
      <p role="status">
        Last command: {last} · style {style.join(", ") || "none"} · align {align[0]} · comments{" "}
        {comments ? "on" : "off"}
      </p>
    </>
  );
}
