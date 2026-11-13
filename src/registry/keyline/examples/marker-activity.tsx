"use client";

import { Package, Phone, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Marker, MarkerContent, MarkerIcon } from "../ui/marker";
import { Status } from "../ui/status";

const PHONE = <Phone size={16} aria-hidden="true" />;
const BOX = <Package size={16} aria-hidden="true" />;
const TRUCK = <Truck size={16} aria-hidden="true" />;

type Step = "idle" | "picking" | "picked";

export function OrderActivity() {
  const [step, setStep] = useState<Step>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = () => {
    setStep("picking");
    timer.current = setTimeout(() => setStep("picked"), 2400);
  };

  return (
    <div className="grid max-w-[460px] gap-3">
      <Marker variant="border">
        <MarkerContent>DM-4107 · Lackawanna County</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Yesterday</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>{PHONE}</MarkerIcon>
        <MarkerContent>Dwight took the order by phone: 120 cases</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>{BOX}</MarkerIcon>
        <MarkerContent>Angela approved the credit check</MarkerContent>
      </Marker>
      {step !== "idle" ? (
        <Marker pending={step === "picking"}>
          <MarkerIcon>{step === "picking" ? TRUCK : <Status kind="done" />}</MarkerIcon>
          <MarkerContent>
            {step === "picking" ? "Darryl's team is picking 120 cases…" : "Picked and on the truck for Thursday"}
          </MarkerContent>
        </Marker>
      ) : null}
      <Button className="mt-2 justify-self-start" disabled={step !== "idle"} onClick={send}>
        {step === "idle" ? "Send to the warehouse" : "Sent to the warehouse"}
      </Button>
    </div>
  );
}
