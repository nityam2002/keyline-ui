import * as React from "react";
import { cn } from "@/lib/utils";
import * as ui from "../demo-ui";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuSubmenu,
  ContextMenuSubmenuTrigger,
  ContextMenuSubmenuContent,
} from "@/registry/keyline/ui/context-menu";
import { ItemList, Item, ItemContent, ItemMeta, ItemMedia } from "@/registry/keyline/ui/item";
import { Status } from "@/registry/keyline/ui/status";

/* ------------------------------------------------------------------ */
type Doc = { id: string; name: string; size: string; state: "ok" | "missing" };
const DOCS: Doc[] = [
  { id: "INV-2207", name: "Commercial invoice", size: "212 KB", state: "ok" },
  { id: "PL-2207", name: "Packing list", size: "88 KB", state: "ok" },
  { id: "EUR1", name: "EUR.1 movement certificate", size: "—", state: "missing" },
];
export function ContextMenuSpecimen() {
  const [last, setLast] = React.useState("Right-click (or press the Menu key on) a row.");
  return (
    <div className={ui.split}>
      <div className="max-w-[560px] flex-[1_1_480px]">
        <ItemList aria-label="Documents">
          {DOCS.map((d) => (
            <ContextMenu key={d.id}>
              <ContextMenuTrigger
                render={
                  <Item
                    tabIndex={0}
                    aria-label={`${d.name}, ${d.state === "missing" ? "missing" : d.size}. Context menu available.`}
                  />
                }
              >
                <ItemMedia>
                  <span className="kl-glyph" data-kind={d.state === "missing" ? "attention" : "done"} aria-hidden />
                </ItemMedia>
                <ItemContent
                  title={d.name}
                  description={
                    d.state === "missing" ? <Status kind="attention">Missing: upload before 14:00</Status> : d.size
                  }
                />
                <ItemMeta>{d.id}</ItemMeta>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuGroup>
                  <ContextMenuGroupLabel>{d.id}</ContextMenuGroupLabel>
                  <ContextMenuItem
                    code="1"
                    shortcut="O"
                    disabled={d.state === "missing"}
                    onClick={() => setLast(`Opened ${d.name}`)}
                  >
                    Open
                  </ContextMenuItem>
                  <ContextMenuItem
                    code="2"
                    shortcut="U"
                    onClick={() => setLast(`Uploading a new version of ${d.name}`)}
                  >
                    Upload new version
                  </ContextMenuItem>
                  <ContextMenuSubmenu>
                    <ContextMenuSubmenuTrigger code="3">Send to</ContextMenuSubmenuTrigger>
                    <ContextMenuSubmenuContent>
                      <ContextMenuItem onClick={() => setLast(`Sent ${d.name} to the customs broker`)}>
                        Customs broker
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => setLast(`Sent ${d.name} to the consignee`)}>
                        Consignee
                      </ContextMenuItem>
                      <ContextMenuItem description="No e-mail on file" disabled>
                        Haulier
                      </ContextMenuItem>
                    </ContextMenuSubmenuContent>
                  </ContextMenuSubmenu>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive" onClick={() => setLast(`Removed ${d.name}`)}>
                  Remove
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </ItemList>
      </div>
      <p className={cn(ui.p, ui.catNote)} role="status">
        {last}
      </p>
    </div>
  );
}
