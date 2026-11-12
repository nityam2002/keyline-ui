import * as ui from "../demo-ui";
import { Carousel, CarouselBar, CarouselContent, CarouselItem } from "@/registry/keyline/ui/carousel";
import { Stat } from "@/registry/keyline/ui/stat";
import { Status, type StatusKind } from "@/registry/keyline/ui/status";

/* ------------------------------------------------------------------ *
 * 2. Carousel (embla)
 * ------------------------------------------------------------------ */
const TRAILERS: {
  id: string;
  from: string;
  kind: StatusKind;
  state: string;
  pallets: number;
  eta: string;
}[] = [
  {
    id: "TR-4471",
    from: "Rotterdam",
    kind: "normal",
    state: "Unloading",
    pallets: 26,
    eta: "14:20",
  },
  {
    id: "TR-4480",
    from: "Duisburg",
    kind: "waiting",
    state: "At the gate",
    pallets: 33,
    eta: "14:45",
  },
  {
    id: "TR-4492",
    from: "Antwerp",
    kind: "attention",
    state: "Seal mismatch",
    pallets: 18,
    eta: "15:10",
  },
  {
    id: "TR-4503",
    from: "Lyon",
    kind: "waiting",
    state: "En route",
    pallets: 30,
    eta: "16:05",
  },
  {
    id: "TR-4518",
    from: "Milan",
    kind: "done",
    state: "Released",
    pallets: 22,
    eta: "13:30",
  },
];
function TrailerCard({ t }: { t: (typeof TRAILERS)[number] }) {
  return (
    <div className="grid min-h-[200px] content-start gap-2.5 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="kl-code">{t.id}</span>
        <Status kind={t.kind}>{t.state}</Status>
      </div>
      <p className="m-0 text-[15px] font-kl-strong">
        From {t.from}, <a href="#/specimen">manifest</a>
      </p>
      <Stat label="Pallets" value={t.pallets} unit="PLT" />
      <p className={ui.note}>Expected {t.eta}</p>
    </div>
  );
}
export function CarouselSpecimen() {
  return (
    <div className={ui.stack} data-testid="specimen-carousel">
      <div className={ui.group}>
        <h3 className={ui.cap}>One per view: arrows on the region, previous and next cells, position ticks</h3>
        <div style={{ maxWidth: 420 }}>
          <Carousel aria-label="Trailers at dock 4" data-testid="cr-one">
            <CarouselContent>
              {TRAILERS.map((t) => (
                <CarouselItem key={t.id}>
                  <TrailerCard t={t} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselBar />
          </Carousel>
        </div>
      </div>
      <div className={ui.group}>
        <h3 className={ui.cap}>Two per view on seams; a step moves one slide</h3>
        <div style={{ maxWidth: 640 }}>
          <Carousel aria-label="Trailers, two up" opts={{ align: "start", slidesToScroll: 1 }} data-testid="cr-two">
            <CarouselContent>
              {TRAILERS.map((t) => (
                <CarouselItem key={t.id} basis="50%">
                  <TrailerCard t={t} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselBar />
          </Carousel>
        </div>
      </div>
      <div className={ui.group} dir="rtl">
        <h3 className={ui.cap}>RTL: the first slide at the inline start; the arrows and keys mirror</h3>
        <div style={{ maxWidth: 420 }}>
          <Carousel aria-label="المقطورات" data-testid="cr-rtl">
            <CarouselContent>
              {TRAILERS.map((t) => (
                <CarouselItem key={t.id}>
                  <TrailerCard t={t} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselBar />
          </Carousel>
        </div>
      </div>
    </div>
  );
}
