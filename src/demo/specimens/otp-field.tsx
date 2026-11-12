import * as React from "react";
import * as ui from "../demo-ui";
import { OtpField, type OtpSignal } from "@/registry/keyline/ui/otp-field";
import { Button, ButtonAffix } from "@/registry/keyline/ui/button";
import { Form, FormActions } from "@/registry/keyline/ui/field";
import { Panel, PanelHeader, PanelFooter } from "@/registry/keyline/ui/panel";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@/registry/keyline/ui/dialog";

/* ------------------------------------------------------------------ *
 * 3. OTP field
 * ------------------------------------------------------------------ */
const GOOD = "246810";
/** The verification flow: complete → pending → done or failed, with a resend that counts down. */
function VerifyFlow({ onDone }: { onDone?: () => void }) {
  const [code, setCode] = React.useState("");
  const [signal, setSignal] = React.useState<OtpSignal>("idle");
  const [wait, setWait] = React.useState(0);
  const [sent, setSent] = React.useState(1);
  React.useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);
  const verify = (v: string) => {
    setSignal("pending");
    setTimeout(() => {
      if (v === GOOD) {
        setSignal("done");
        setTimeout(() => onDone?.(), 900);
      } else setSignal("failed");
    }, 900);
  };
  return (
    <div className={ui.stackTight}>
      <OtpField
        label="Verification code"
        length={6}
        groups={[3, 3]}
        value={code}
        onValueChange={(v) => {
          setCode(v);
          if (signal === "failed" || signal === "done") setSignal("idle");
        }}
        onValueComplete={verify}
        signal={signal}
        error={
          signal === "failed" ? "That code doesn't match. Check the latest message, or send a new code." : undefined
        }
        description={`Sent to +31 6 •••• 0412 (message ${sent}). Try ${GOOD}.`}
        data-testid="otp-verify"
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          size="compact"
          disabled={wait > 0}
          onClick={() => {
            setSent((s) => s + 1);
            setWait(30);
            setCode("");
            setSignal("idle");
          }}
        >
          Send a new code
          {wait > 0 ? <ButtonAffix aria-label={`available in ${wait} seconds`}>{wait}s</ButtonAffix> : null}
        </Button>
      </div>
    </div>
  );
}
export function OtpSpecimen() {
  const [submitted, setSubmitted] = React.useState("—");
  const [open, setOpen] = React.useState(false);
  return (
    <div className={ui.stack} data-testid="specimen-otp">
      <div className={ui.split}>
        <div className={ui.group} data-testid="otp-flow" style={{ maxWidth: 360 }}>
          <h3 className={ui.cap}>Verify: complete → pending → ✓ or ! (try a wrong code)</h3>
          <VerifyFlow />
        </div>
        <div className={ui.group}>
          <h3 className={ui.cap}>In a dialog</h3>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="primary" />}>Release shipment…</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm release</DialogTitle>
                <DialogDescription>Releasing SH-20483 to DSV Road needs a second factor.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <VerifyFlow onDone={() => setOpen(false)} />
              </DialogBody>
              <DialogFooter>
                <DialogClose render={<Button layout="cell" />}>Cancel</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className={ui.grid2}>
        <Form onFormSubmit={(v) => setSubmitted(JSON.stringify(v))} data-testid="otp-form">
          <OtpField
            label="Recovery code"
            name="recovery"
            length={8}
            groups={[4, 4]}
            validationType="alphanumeric"
            required
            validate={(v) =>
              typeof v === "string" && v.length === 8 && !/\d/.test(v)
                ? "Recovery codes contain at least one digit."
                : null
            }
            description="Letters and digits, from your saved codes."
          />
          <FormActions>
            <Button type="submit" variant="primary">
              Use code
            </Button>
          </FormActions>
          <p className={ui.note} data-testid="otp-submitted">
            Submitted: {submitted}
          </p>
        </Form>
        <div className={ui.stackTight}>
          <OtpField label="Terminal PIN" length={4} mask defaultValue="12" description="Masked." />
          <OtpField label="Disabled" length={6} defaultValue="135" disabled />
          <OtpField label="Read-only" length={6} defaultValue="864209" readOnly />
        </div>
        <div className={ui.group} style={{ maxWidth: 230 }} data-testid="otp-narrow">
          <h3 className={ui.cap}>230px column</h3>
          <OtpField label="Code" length={6} groups={[3, 3]} />
        </div>
        <div className={ui.group} style={{ maxWidth: 290 }} data-testid="otp-tight">
          <h3 className={ui.cap}>290px column: 8 characters, a join and the ! cell</h3>
          <OtpField
            label="Recovery code"
            length={8}
            groups={[4, 4]}
            validationType="alphanumeric"
            defaultValue="svsdvdsf"
            invalid
            error="Recovery codes contain at least one digit."
          />
          <div data-kl-density="compact">
            <OtpField
              label="Recovery code, compact"
              length={8}
              groups={[4, 4]}
              validationType="alphanumeric"
              defaultValue="mwmwmwmw"
              invalid
              error="Recovery codes contain at least one digit."
            />
          </div>
        </div>
        <div className={ui.group} data-testid="otp-rtl">
          <h3 className={ui.cap}>Right to left: the code keeps its order; the ! cell and message follow the page</h3>
          <div dir="rtl">
            <OtpField
              label="رمز التحقق"
              length={6}
              defaultValue="2468"
              invalid
              error="الرمز غير صحيح"
              slotLabel={(n, t) => `الحرف ${n} من ${t}`}
            />
          </div>
        </div>
      </div>
      <Panel style={{ maxWidth: 520 }}>
        <PanelHeader title="Gate check-in" description="layout=cell: the code is a cell of the panel's footer row." />
        <PanelFooter data-testid="otp-cell">
          <OtpField label="Gate code" layout="cell" length={4} />
          <Button layout="cell" variant="primary">
            Open gate
          </Button>
        </PanelFooter>
      </Panel>
    </div>
  );
}
