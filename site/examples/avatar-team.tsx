"use client";

import { useState } from "react";
import { Avatar, AvatarGroup } from "@/components/keyline/ui/avatar";
import { CheckboxGroup } from "@/components/keyline/ui/checkbox-group";

const STAFF = [
  { value: "dwight", label: "Dwight Schrute", photo: "/avatars/dwight-schrute.svg" },
  { value: "jim", label: "Jim Halpert", photo: "/avatars/jim-halpert.svg" },
  { value: "phyllis", label: "Phyllis Vance", photo: "/avatars/phyllis-vance.svg" },
  { value: "stanley", label: "Stanley Hudson", photo: "/avatars/stanley-hudson.svg" },
  { value: "andy", label: "Andy Bernard", photo: "/avatars/andy-bernard.svg" },
  { value: "pam", label: "Pam Beesly", photo: "/avatars/pam-beesly.svg" },
];

export function AccountTeam() {
  const [team, setTeam] = useState(["dwight", "jim", "phyllis"]);
  const people = STAFF.filter((s) => team.includes(s.value));

  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
      <CheckboxGroup
        legend="Lackawanna County account"
        description="Who gets the county's orders and calls."
        options={STAFF}
        value={team}
        onValueChange={setTeam}
      />
      <div className="grid gap-2 sm:justify-items-end">
        <span className="text-[13px] font-semibold text-kl-ink-2">On the account</span>
        {people.length ? (
          <AvatarGroup label="On the Lackawanna County account" max={4}>
            {people.map((p) => (
              <Avatar key={p.value} name={p.label} src={p.photo} />
            ))}
          </AvatarGroup>
        ) : (
          <span className="text-[14px] text-kl-ink-3">Nobody yet</span>
        )}
      </div>
    </div>
  );
}
