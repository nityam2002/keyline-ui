import * as ui from "../demo-ui";
import { Kbd, KbdGroup } from "@/registry/keyline/ui/kbd";
import { Panel, PanelHeader, PanelBody } from "@/registry/keyline/ui/panel";

/* ------------------------------------------------------------------ *
 * 3. Kbd and 4. Toggle
 * ------------------------------------------------------------------ */
export function KbdSpecimen() {
  return (
    <div className={ui.stack} data-testid="specimen-kbd">
      <Panel style={{ maxWidth: 560 }}>
        <PanelHeader title="Keyboard shortcuts" code="HELP" />
        <PanelBody>
          <p data-testid="kbd-prose" style={{ margin: 0, lineHeight: 1.5 }}>
            Press{" "}
            <KbdGroup>
              <Kbd label="Command">⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>{" "}
            to open the command menu, <Kbd>/</Kbd> to search manifests, and{" "}
            <KbdGroup separator="then" data-testid="kbd-seq">
              <Kbd>G</Kbd>
              <Kbd>I</Kbd>
            </KbdGroup>{" "}
            to go to the inbox. <Kbd>Esc</Kbd> closes any panel;{" "}
            <KbdGroup>
              <Kbd label="Shift">⇧</Kbd>
              <Kbd>Enter</Kbd>
            </KbdGroup>{" "}
            sends without closing.
          </p>
        </PanelBody>
      </Panel>
      <p className={ui.note} dir="rtl" data-testid="kbd-rtl">
        اضغط{" "}
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>{" "}
        لفتح القائمة.
      </p>
    </div>
  );
}
