"use client";

import Link from "next/link";
import { Button } from "@/components/keyline/ui/button";

/** A Keyline primary Button rendered as a link: the one cobalt commitment on the screen. */
export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="primary" nativeButton={false} render={<Link href={href} />}>
      {children}
    </Button>
  );
}
