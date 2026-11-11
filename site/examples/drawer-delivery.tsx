"use client"

import { useState } from "react"
import { Button } from "@/components/keyline/ui/button"
import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/keyline/ui/drawer"

const STOPS = [
  ["9:40", "Left the warehouse"],
  ["10:15", "Scranton Business Park, 40 cases"],
  ["11:05", "Lackawanna County, 120 cases"],
  ["12:30", "Lunch at Cugino's"],
  ["13:20", "Vance Refrigeration, held: no one to sign"],
  ["14:10", "Blue Cross of Pennsylvania, 60 cases"],
]

export function TruckRoute() {
  const [called, setCalled] = useState(false)

  return (
    <div className="grid gap-4">
      <Drawer>
        <DrawerTrigger render={<Button className="justify-self-start" />}>Darryl&apos;s route</DrawerTrigger>
        <DrawerContent size="min(70vh, 480px)">
          <DrawerHeader>
            <DrawerTitle>Darryl&apos;s route today</DrawerTitle>
            <DrawerDescription>Swipe down, press Escape or Close to put it away.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <ol className="m-0 grid list-none gap-3 p-0 text-[14px]">
              {STOPS.map(([at, what]) => (
                <li key={at} className="grid grid-cols-[3.5rem_1fr] gap-3">
                  <span className="font-kl-mono text-[13px] text-kl-ink-2">{at}</span>
                  <span>{what}</span>
                </li>
              ))}
            </ol>
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button layout="cell" />}>Close</DrawerClose>
            <DrawerClose render={<Button layout="cell" variant="primary" onClick={() => setCalled(true)} />}>Call Bob Vance</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <p role="status" className="m-0 min-h-5 text-[14px] text-kl-ink-2">
        {called ? "Calling Vance Refrigeration about the held delivery." : ""}
      </p>
    </div>
  )
}
