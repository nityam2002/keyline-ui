import * as React from "react";
import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Empty } from "@/registry/keyline/ui/empty";
import { Panel, PanelHeader, PanelBody } from "@/registry/keyline/ui/panel";

/* ------------------------------------------------------------------ */
export function EmptySpecimen() {
  const [state, setState] = React.useState<"error" | "loading" | "ok">("error");
  const retry = () => {
    setState("loading");
    setTimeout(() => setState("ok"), 700);
  };
  return (
    <div className={ui.stack}>
      <Empty
        title="No shipments match these filters"
        description="Status is Delayed · Carrier is Rhenus Logistics · Pickup in the next 7 days"
        actions={
          <>
            <Button variant="primary">Clear all filters</Button>
            <Button variant="quiet">Remove “Carrier”</Button>
          </>
        }
      />
      {state === "ok" ? (
        <Empty
          kind="start"
          title="No documents yet"
          description="Customs documents for this shipment appear here once the broker files them."
          actions={<Button>Upload a document</Button>}
          live
        />
      ) : (
        <Empty
          kind="error"
          count="503"
          title="Documents could not be loaded"
          description="The document service did not answer. Nothing was lost."
          actions={
            <Button signal={state === "loading" ? "pending" : "idle"} onClick={retry}>
              Retry
            </Button>
          }
          live
        />
      )}
      <div className={ui.split}>
        <div style={{ width: 340 }}>
          <Empty
            title="No carriers within 50 km of Duisburg-Ruhrort for a reefer pickup on Saturday"
            actions={<Button>Widen to 100 km</Button>}
          />
        </div>
        <Panel style={{ flex: "1 1 320px" }}>
          <PanelHeader title="Exceptions" />
          <PanelBody flush>
            <Empty
              layout="cell"
              count={0}
              code="OPEN"
              title="No open exceptions"
              description="New delays and damages land here."
              headingLevel={4}
            />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
