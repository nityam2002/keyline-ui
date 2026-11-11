"use client"

import { Carousel, CarouselBar, CarouselContent, CarouselItem, CarouselNext, CarouselPosition, CarouselPrevious } from "@/components/keyline/ui/carousel"

const POSTERS = [
  { month: "January", who: "Stanley Hudson", why: "Closed the Hammermill account without leaving his chair." },
  { month: "February", who: "Phyllis Vance", why: "Most repeat clients in the branch, eleven months running." },
  { month: "March", who: "Dwight Schrute", why: "1,680 reams. He'd like you to know it was 1,680." },
  { month: "April", who: "Jim Halpert", why: "Won back Blue Cross of Pennsylvania." },
  { month: "May", who: "Darryl Philbin", why: "Not one late delivery, through three snowstorms." },
]

export function EmployeeOfTheMonth() {
  return (
    <Carousel aria-label="Employee of the month">
      <CarouselContent>
        {POSTERS.map((p) => (
          <CarouselItem key={p.month} basis="min(100%, 280px)">
            <div className="grid min-h-[180px] content-between gap-6 p-5">
              <span className="font-kl-mono text-[13px] text-kl-ink-2">{p.month}</span>
              <span className="grid gap-2">
                <span className="text-[22px] leading-tight font-semibold">{p.who}</span>
                <span className="text-[14px] text-kl-ink-2">{p.why}</span>
              </span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselBar>
        <CarouselPrevious />
        <CarouselPosition />
        <CarouselNext />
      </CarouselBar>
    </Carousel>
  )
}
