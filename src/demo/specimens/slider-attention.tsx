import * as ui from "../demo-ui";
import { Slider } from "@/registry/keyline/ui/slider";
import { NumberField } from "@/registry/keyline/ui/number-field";

/* ------------------------------------------------------------------ *
 * 3. Slider ! cell and units in RTL
 * ------------------------------------------------------------------ */
export function SliderAttentionSpecimen() {
  return (
    <div className={ui.stack} data-testid="specimen-slider">
      <div className={ui.grid2}>
        <Slider
          label="Set point"
          unit="°C"
          min={-25}
          max={25}
          step={0.5}
          defaultValue={12}
          invalid
          error="Chilled goods ride at 8 °C or colder."
        />
        <Slider label="Humidity band" unit="%" min={50} max={100} defaultValue={[75, 90]} />
        <NumberField label="Set point" unit="°C" min={-25} max={25} defaultValue={4} />
      </div>
      <div className={ui.group}>
        <h3 className={ui.cap}>layout="cell": the ! cell is the mark (no frame of its own to turn red)</h3>
        <div className="kl-ctl kl-cells" style={{ maxWidth: 560 }} data-testid="slider-cell-row">
          <Slider
            layout="cell"
            label="Fill level"
            unit="%"
            min={0}
            max={100}
            defaultValue={96}
            invalid
            error="Above 95 % the reefer cannot circulate air."
          />
          <NumberField layout="cell" label="Pallets" unit="PLT" min={1} max={33} defaultValue={18} />
        </div>
      </div>
      <div className={ui.group} dir="rtl" data-testid="slider-rtl">
        <h3 className={ui.cap}>dir="rtl": units keep their order ("°C", not "C°")</h3>
        <div className={ui.grid2}>
          <Slider label="نقطة الضبط" unit="°C" min={-25} max={25} step={0.5} defaultValue={4} />
          <Slider label="نطاق الرطوبة" unit="%" min={50} max={100} defaultValue={[75, 90]} />
          <NumberField label="نقطة الضبط" unit="°C" min={-25} max={25} defaultValue={-18} />
        </div>
      </div>
    </div>
  );
}
