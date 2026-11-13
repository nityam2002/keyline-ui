"use client";

import { useEffect, useRef, useState } from "react";
import { OtpField, type OtpSignal } from "../ui/otp-field";

const CODE = "271828"; // what your server would check

export function SignInCode() {
  const [code, setCode] = useState("");
  const [signal, setSignal] = useState<OtpSignal>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="grid max-w-[360px] gap-3">
      <OtpField
        label="Code from your phone"
        length={6}
        groups={[3, 3]}
        value={code}
        signal={signal}
        error="That code doesn't match. Codes last 10 minutes."
        description={`Sent to the number ending 4417. For this demo, it is ${CODE}.`}
        onValueChange={(v) => {
          // after a wrong code, the first new character starts a fresh code, so completing it checks again
          if (signal === "failed") {
            setSignal("idle");
            setCode(v.slice(0, 1));
          } else setCode(v);
        }}
        onValueComplete={(v) => {
          setSignal("pending");
          timer.current = setTimeout(() => setSignal(v === CODE ? "done" : "failed"), 900);
        }}
      />
      <p role="status" className="text-[14px] text-kl-ink-2">
        {signal === "done" ? "Signed in to Dunder Mifflin Infinity." : "Type or paste the six digits."}
      </p>
    </div>
  );
}
