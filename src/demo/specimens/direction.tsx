import * as ui from "../demo-ui";
import { Button } from "@/registry/keyline/ui/button";
import { Segmented, SegmentedItem } from "@/registry/keyline/ui/segmented";
import { Tooltip } from "@/registry/keyline/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody } from "@/registry/keyline/ui/popover";
import { DirectionProvider } from "@/registry/keyline/ui/direction";

export function DirectionSpecimen() {
  return (
    <div className={ui.split} data-testid="specimen-direction">
      {(["ltr", "rtl"] as const).map((d) => (
        <DirectionProvider key={d} direction={d}>
          <div className={ui.group}>
            <h3 className={ui.cap}>{d === "rtl" ? "dir=rtl region (Arabic)" : "dir=ltr region"}</h3>
            <div className={ui.row}>
              <Tooltip side="inline-end" content={d === "rtl" ? "تصدير البيان" : "Export the manifest"}>
                <Button>{d === "rtl" ? "تصدير" : "Export"}</Button>
              </Tooltip>
              <Popover>
                <PopoverTrigger render={<Button />}>{d === "rtl" ? "الناقل" : "Carrier"}</PopoverTrigger>
                <PopoverContent align="start">
                  <PopoverHeader title={d === "rtl" ? "دي إتش إل للشحن" : "DHL Freight"} />
                  <PopoverBody>{d === "rtl" ? "الاستلام الخميس ٠٨:٠٠" : "Pickup Thu 08:00"}</PopoverBody>
                </PopoverContent>
              </Popover>
              <Segmented defaultValue="day" aria-label={d === "rtl" ? "الفترة" : "Period"}>
                <SegmentedItem value="day">{d === "rtl" ? "يوم" : "Day"}</SegmentedItem>
                <SegmentedItem value="week">{d === "rtl" ? "أسبوع" : "Week"}</SegmentedItem>
              </Segmented>
            </div>
          </div>
        </DirectionProvider>
      ))}
    </div>
  );
}
