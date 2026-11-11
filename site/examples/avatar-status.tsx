"use client"

import { Avatar, type AvatarStatus } from "@/components/keyline/ui/avatar"

const PEOPLE: { name: string; role: string; status: AvatarStatus; where: string; src?: string }[] = [
  { name: "Michael Scott", role: "Regional Manager", status: "normal", where: "In his office", src: "/avatars/michael-scott.svg" },
  { name: "Jim Halpert", role: "Sales", status: "waiting", where: "At a client, back at 2", src: "/avatars/jim-halpert.svg" },
  { name: "Dwight Schrute", role: "Assistant to the Regional Manager", status: "attention", where: "Three missed calls from corporate", src: "/avatars/dwight-schrute.svg" },
  // this photo is damaged on purpose: the initials hold the cell and no broken image shows
  { name: "Toby Flenderson", role: "Human Resources", status: "none", where: "Out today", src: "data:image/jpeg;base64,AAAA" },
]

export function WhosIn() {
  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {PEOPLE.map((p) => (
        <li key={p.name} className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Avatar name={p.name} src={p.src} status={p.status} size="lg" />
          <div className="grid min-w-0 gap-0.5 text-[14px]">
            <span className="font-semibold">{p.name}</span>
            <span className="text-kl-ink-2">
              {p.role} · {p.where}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
