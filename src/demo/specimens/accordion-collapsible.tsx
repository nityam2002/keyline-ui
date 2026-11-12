import * as ui from "../demo-ui";
import { Slider } from "@/registry/keyline/ui/slider";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/registry/keyline/ui/accordion";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/registry/keyline/ui/collapsible";
import { Panel, PanelHeader, PanelBody } from "@/registry/keyline/ui/panel";
import { ItemList, Item, ItemContent, ItemMeta } from "@/registry/keyline/ui/item";
import { Field, FieldLabel, FieldFrame, FieldControl } from "@/registry/keyline/ui/field";
import { Status } from "@/registry/keyline/ui/status";

/* ------------------------------------------------------------------ */
export function DisclosureSpecimen() {
  return (
    <div className={ui.split}>
      <Accordion defaultValue={["docs"]} className="max-w-[520px] flex-[1_1_360px]">
        <AccordionItem value="docs">
          <AccordionTrigger
            meta={<Status kind="attention">1 missing</Status>}
            description="Commercial invoice, packing list, EUR.1"
          >
            Customs documents
          </AccordionTrigger>
          <AccordionPanel>
            <p>
              The EUR.1 certificate is missing. Upload it before the 14:00 cut-off or the container will be held at the
              terminal.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="billing">
          <AccordionTrigger meta="€ 2,410">Billing</AccordionTrigger>
          <AccordionPanel>
            <p>Invoiced to Brightwater Retail BV on 30-day terms.</p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="hazmat" disabled>
          <AccordionTrigger description="Not applicable to this shipment">Dangerous goods declaration</AccordionTrigger>
          <AccordionPanel>—</AccordionPanel>
        </AccordionItem>
        <AccordionItem value="long">
          <AccordionTrigger>
            A very long section title that has to wrap inside its cell without pushing the caret column out of line
          </AccordionTrigger>
          <AccordionPanel>
            <p>Long titles wrap; the caret column stays straight.</p>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <div className={ui.panel}>
        <Panel>
          <PanelHeader title="Carrier rules" code="CR-7" headingLevel={3} />
          <PanelBody flush>
            <Accordion layout="cell" multiple defaultValue={["weights"]}>
              <AccordionItem value="weights">
                <AccordionTrigger level={4} meta="2 limits">
                  Weights
                </AccordionTrigger>
                <AccordionPanel>
                  <div className={ui.stack}>
                    <Slider label="Max gross weight" unit="t" min={0} max={44} defaultValue={40} />
                    <Collapsible>
                      <CollapsibleTrigger meta="3">Advanced limits</CollapsibleTrigger>
                      <CollapsiblePanel>
                        <div className={ui.stack}>
                          <Field>
                            <FieldLabel>Max axle load</FieldLabel>
                            <FieldFrame>
                              <FieldControl align="end" defaultValue="11.5" />
                            </FieldFrame>
                          </Field>
                          <Slider label="Tolerance" unit="%" defaultValue={5} max={20} />
                        </div>
                      </CollapsiblePanel>
                    </Collapsible>
                  </div>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="lanes">
                <AccordionTrigger level={4} meta="NL → DE">
                  Lanes
                </AccordionTrigger>
                <AccordionPanel flush>
                  <ItemList layout="cell">
                    <Item>
                      <ItemContent title="Rotterdam → Duisburg" description="Rail, 3× weekly" />
                      <ItemMeta>DUI</ItemMeta>
                    </Item>
                    <Item>
                      <ItemContent title="Rotterdam → Hamburg" description="Road" />
                      <ItemMeta>HAM</ItemMeta>
                    </Item>
                  </ItemList>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
