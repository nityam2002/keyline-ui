import * as React from "react";
import * as ui from "../demo-ui";
import { Avatar } from "@/registry/keyline/ui/avatar";
import { Button } from "@/registry/keyline/ui/button";
import { Segmented, SegmentedItem } from "@/registry/keyline/ui/segmented";
import { Field, FieldFrame, FieldControl, FieldLabel } from "@/registry/keyline/ui/field";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/registry/keyline/ui/message";
import { Bubble, BubbleContent, BubbleReactions } from "@/registry/keyline/ui/bubble";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerSeparator,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/registry/keyline/ui/message-scroller";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGlyph,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/keyline/ui/attachment";

/* ------------------------------------------------------------------ *
 * 3. Chat family: Message, Bubble, MessageScroller, Attachment
 *    One reading edge. A sender's run is one Message; files are cells of their bubble.
 * ------------------------------------------------------------------ */
type FileState = "uploading" | "processing" | "error" | "done";
type ChatFile = {
  id: string;
  name: string;
  size: string;
  kind: "image" | "file";
  state: FileState;
  progress?: number;
  failAt?: number;
  reason?: string;
};
type Delivery = "sending" | "sent" | "read" | "failed";
type Msg = {
  id: string;
  who: "clerk" | "driver";
  at: string;
  text?: string;
  files?: ChatFile[];
  status?: Delivery;
  readAt?: string;
  failReason?: string;
  react?: string;
  /** The first message of a day carries the day's divider. */
  day?: string;
};
const PEOPLE = {
  clerk: { name: "Ines Duarte", role: "Dock 4" },
  driver: { name: "Tomasz Wolak", role: "TR-4492" },
};
const done = (id: string, name: string, size: string, kind: ChatFile["kind"]): ChatFile => ({
  id,
  name,
  size,
  kind,
  state: "done",
});
/* m4 to m8 are the original conversation; the rest completes it. */
const SEED: Msg[] = [
  {
    id: "m1",
    day: "TODAY",
    who: "driver",
    at: "13:58",
    text: "At the gate for dock 4. Seal on the rear door reads 448 210.",
  },
  {
    id: "m2",
    who: "clerk",
    at: "14:01",
    text: "The manifest says 448 201. Can you send a photo of the seal?",
    status: "read",
    readAt: "14:02",
  },
  {
    id: "m3",
    who: "driver",
    at: "14:03",
    text: "Here it is.",
    files: [done("f3", "seal-rear-door.jpg", "2.4 MB", "image")],
  },
  {
    id: "m4",
    who: "driver",
    at: "14:03",
    text: "And the CMR with the seal number written in.",
    files: [done("f4", "CMR-2026-11-09-TR4492-signed.pdf", "480 KB", "file")],
    react: "1",
  },
  {
    id: "m5",
    who: "clerk",
    at: "14:06",
    text: "Thanks. The shipper made a typo; I've raised it with them. Please wait in bay 2 until they confirm.",
    status: "read",
    readAt: "14:06",
  },
  {
    id: "m6",
    who: "clerk",
    at: "14:07",
    text: "Bay 2 has power for the reefer.",
    status: "failed",
    failReason: "Not sent: no signal.",
  },
  { id: "m7", who: "driver", at: "14:09", text: "Moving to bay 2 now." },
  { id: "m8", who: "driver", at: "14:12", text: "Parked. Reefer plugged in, set to 4 °C." },
  {
    id: "m9",
    who: "driver",
    at: "14:13",
    text: "It has held 4 °C since Poznań, but the door alarm tripped twice on the A2 near Świecko, both times for under a minute. If the shipper asks, the unit log is here:\nhttps://telematics.example.com/units/TR-4492/reefer/log?from=2026-11-09T05:00&to=2026-11-09T14:12&format=csv",
  },
  {
    id: "m10",
    who: "clerk",
    at: "14:15",
    text: "Thanks. The export declaration for the return load:",
    status: "read",
    readAt: "14:15",
    files: [
      {
        id: "f10",
        name: "customs-T1-export-declaration-full-scan-2026.pdf",
        size: "18.4 MB",
        kind: "file",
        state: "error",
        progress: 61,
        reason: "Connection lost at 61%. Retry resumes from there.",
      },
    ],
  },
];
const EARLIER: Msg[] = [
  {
    id: "e1",
    day: "YESTERDAY",
    who: "clerk",
    at: "17:40",
    text: "Your slot tomorrow is 14:00 at dock 4. Gate code 7316.",
    status: "read",
    readAt: "17:41",
  },
  { id: "e2", who: "driver", at: "17:42", text: "Understood. I'll be there from 13:45." },
];
const REPLIES = [
  "Shipper confirmed: 448 210 is correct.",
  "You're cleared for dock 4. Back in when the light is green.",
  "Unloading starts in 5 minutes.",
  "Ok.",
  "Copy that, reversing now.",
];
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
/** A run is never empty: it starts with the message that opened it. */
type MsgRun = [Msg, ...Msg[]];
/** A run: consecutive messages from one sender, each within 5 minutes of the one before. */
function toRuns(msgs: Msg[]) {
  const runs: MsgRun[] = [];
  for (const m of msgs) {
    const run = runs.at(-1);
    const prev = run?.at(-1);
    if (run && prev && !m.day && prev.who === m.who && minutes(m.at) - minutes(prev.at) <= 5) run.push(m);
    else runs.push([m]);
  }
  return runs;
}
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/\S+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noreferrer">
            {p}
          </a>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}
type FileActions = { retry: (fid: string) => void; cancel: (fid: string) => void };
function ChatFileCell({ f, on }: { f: ChatFile; on?: FileActions }) {
  return (
    <Attachment layout="cell" state={f.state} progress={f.progress} data-testid={`file-${f.id}`}>
      <AttachmentMedia>
        <AttachmentGlyph name={f.kind} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{f.name}</AttachmentTitle>
        <AttachmentDescription>{f.state === "error" ? f.reason : f.size}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        {f.state === "error" ? (
          <AttachmentAction aria-label={`Retry ${f.name}`} onClick={() => on?.retry(f.id)}>
            <AttachmentGlyph name="retry" />
          </AttachmentAction>
        ) : f.state === "done" ? (
          <AttachmentAction aria-label={`Download ${f.name}`}>
            <AttachmentGlyph name="download" />
          </AttachmentAction>
        ) : (
          <AttachmentAction aria-label={`Cancel ${f.name}`} onClick={() => on?.cancel(f.id)}>
            <AttachmentGlyph name="close" />
          </AttachmentAction>
        )}
      </AttachmentActions>
      {f.state === "done" ? <AttachmentTrigger aria-label={`Open ${f.name}`} /> : null}
    </Attachment>
  );
}
function Receipt({ m }: { m: Msg }) {
  if (m.files?.some((f) => f.state === "error")) return null;
  const busy = m.status === "sending" || m.files?.some((f) => f.state !== "done");
  return (
    <MessageFooter data-testid="receipt">
      {busy ? "Sending…" : m.status === "sent" ? "Sent" : `Read ${m.readAt}`}
    </MessageFooter>
  );
}
function Run({ run, retry, file }: { run: MsgRun; retry?: (id: string) => void; file?: (mid: string) => FileActions }) {
  const own = run[0].who === "clerk";
  const p = PEOPLE[run[0].who];
  // each run says how its last delivered message stands; a message that failed says so under itself
  const lastOk = own ? run.findLastIndex((m) => m.status !== "failed") : -1;
  return (
    <Message align={own ? "end" : "start"}>
      {own ? null : (
        <MessageAvatar>
          <Avatar name={p.name} decorative />
        </MessageAvatar>
      )}
      <MessageContent>
        <MessageHeader>
          <span>{own ? "You" : p.name}</span>
          <time dateTime={`2026-11-09T${run[0].at}`}>{run[0].at}</time>
        </MessageHeader>
        {run.map((m, i) => (
          <React.Fragment key={m.id}>
            <Bubble
              tone={m.status === "failed" ? "attention" : own ? "tint" : "plain"}
              pending={m.status === "sending" && !m.files?.length}
              data-msg={m.id}
            >
              {m.text ? (
                <BubbleContent>
                  <Linkified text={m.text} />
                </BubbleContent>
              ) : null}
              {m.files?.map((f) => (
                <ChatFileCell key={f.id} f={f} on={file?.(m.id)} />
              ))}
              {m.react ? (
                <BubbleReactions>
                  <button type="button" aria-pressed="true" aria-label="Thumbs up, 1, you reacted">
                    👍 <span className="kl-code">{m.react}</span>
                  </button>
                </BubbleReactions>
              ) : null}
            </Bubble>
            {own && m.status === "failed" ? (
              <MessageFooter tone="attention">
                <bdi>{m.failReason}</bdi>
                <button type="button" onClick={() => retry?.(m.id)}>
                  Retry
                </button>
              </MessageFooter>
            ) : own && i === lastOk ? (
              <Receipt m={m} />
            ) : null}
          </React.Fragment>
        ))}
      </MessageContent>
    </Message>
  );
}
function Conversation() {
  return (
    <MessageScrollerProvider>
      <ConversationLog />
    </MessageScrollerProvider>
  );
}
function ConversationLog() {
  const { scrollToEnd } = useMessageScroller();
  const sent = React.useRef(false);
  const [msgs, setMsgs] = React.useState<Msg[]>(SEED);
  const live = React.useRef(msgs);
  live.current = msgs;
  const [width, setWidth] = React.useState("wide");
  // after the reader sends, the log goes to the end once the new row is in
  React.useEffect(() => {
    if (sent.current) {
      sent.current = false;
      scrollToEnd();
    }
  }, [msgs, scrollToEnd]);

  /* a fake network: every timer is cleared when the specimen unmounts */
  const timers = React.useRef(new Set<ReturnType<typeof setTimeout>>());
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => (timers.current.delete(t), fn()), ms);
    timers.current.add(t);
  };
  const clock = React.useRef(16);
  const now = () => `14:${String(Math.min(59, clock.current)).padStart(2, "0")}`;
  const tick = () => (clock.current += 1);
  const n = React.useRef(0);
  const id = (p: string) => `${p}${++n.current}`;
  const add = (m: Msg) => setMsgs((ms) => [...ms, m]);
  const patch = (mid: string, fn: (m: Msg) => Msg) => setMsgs((ms) => ms.map((m) => (m.id === mid ? fn(m) : m)));
  const patchFile = (mid: string, fid: string, fn: (f: ChatFile) => ChatFile) =>
    patch(mid, (m) => ({ ...m, files: m.files?.map((f) => (f.id === fid ? fn(f) : f)) }));

  /* delivery: sent after a beat, read a little later (the driver has the conversation open) */
  const deliver = (mid: string) => {
    later(() => patch(mid, (m) => (m.status === "sending" ? { ...m, status: "sent" } : m)), 450);
    later(() => patch(mid, (m) => (m.status === "sent" ? { ...m, status: "read", readAt: now() } : m)), 2200);
  };
  const send = (text: string) => {
    const mid = id("s");
    sent.current = true;
    add({ id: mid, who: "clerk", at: now(), text, status: "sending" });
    deliver(mid);
  };
  const retry = (mid: string) => {
    patch(mid, (m) => ({ ...m, status: "sending", failReason: undefined }));
    deliver(mid);
  };

  /* uploads: the bar fills in steps; a scan fails at 61% and a retry resumes from there */
  const upload = (mid: string, fid: string, from: number, failAt?: number) => {
    let pct = from;
    const step = () => {
      const f = live.current.find((m) => m.id === mid)?.files?.find((x) => x.id === fid);
      if (!f || f.state !== "uploading") return; // cancelled
      pct = Math.min(100, pct + 9);
      if (failAt != null && pct >= failAt) {
        patchFile(mid, fid, (x) => ({
          ...x,
          state: "error",
          progress: failAt,
          reason: `Connection lost at ${failAt}%. Retry resumes from there.`,
        }));
        return;
      }
      if (pct >= 100) {
        patchFile(mid, fid, (x) => ({ ...x, state: "processing", progress: 100 }));
        later(() => {
          patchFile(mid, fid, (x) => ({ ...x, state: "done" }));
          patch(mid, (m) => ({ ...m, status: "sending" }));
          deliver(mid);
        }, 700);
        return;
      }
      patchFile(mid, fid, (x) => ({ ...x, progress: pct }));
      later(step, 140);
    };
    later(step, 140);
  };
  const attach = (fail: boolean) => {
    const mid = id("u");
    const fid = id("f");
    const file: ChatFile = fail
      ? {
          id: fid,
          name: "pallet-damage-bay2-all-sides-and-the-torn-wrap.jpg",
          size: "6.8 MB",
          kind: "image",
          state: "uploading",
          progress: 0,
        }
      : { id: fid, name: "pallet-damage-bay2.jpg", size: "3.1 MB", kind: "image", state: "uploading", progress: 0 };
    sent.current = true;
    add({ id: mid, who: "clerk", at: now(), files: [file], status: "sending" });
    upload(mid, fid, 0, fail ? 61 : undefined);
  };
  const fileActions = (mid: string): FileActions => ({
    retry: (fid) => {
      const f = live.current.find((m) => m.id === mid)?.files?.find((x) => x.id === fid);
      patchFile(mid, fid, (x) => ({ ...x, state: "uploading", reason: undefined }));
      upload(mid, fid, f?.progress ?? 0);
    },
    cancel: (fid) =>
      setMsgs((ms) =>
        ms.flatMap((m) => {
          if (m.id !== mid) return [m];
          const files = m.files?.filter((f) => f.id !== fid);
          return files?.length || m.text ? [{ ...m, files }] : [];
        }),
      ),
  });
  const replies = React.useRef(0);
  const incoming = (count: number) => {
    for (let k = 0; k < count; k++)
      later(() => {
        tick();
        add({ id: id("r"), who: "driver", at: now(), text: REPLIES[replies.current++ % REPLIES.length] });
      }, k * 350);
  };

  const [draft, setDraft] = React.useState("");
  const runs = React.useMemo(() => toRuns(msgs), [msgs]);
  return (
    <div className={ui.stack}>
      <div className="flex flex-wrap items-center gap-kl-gutter">
        <Segmented
          size="compact"
          aria-label="Panel width"
          value={width}
          onValueChange={setWidth}
          data-testid="ms-width"
        >
          <SegmentedItem value="wide">Wide</SegmentedItem>
          <SegmentedItem value="narrow">Narrow panel</SegmentedItem>
        </Segmented>
      </div>
      <div className={ui.stack} style={{ maxWidth: width === "wide" ? 600 : 340 }}>
        <MessageScroller style={{ height: 460 }} data-testid="ms-frame">
          <MessageScrollerViewport aria-label="Conversation with Tomasz Wolak">
            <MessageScrollerContent>
              {runs.map((run) => (
                <MessageScrollerItem key={run[0].id} messageId={run[0].id}>
                  {/* a day's divider belongs to its first message, so loading older days never moves it */}
                  {run[0].day ? <MessageScrollerSeparator>{run[0].day}</MessageScrollerSeparator> : null}
                  <Run run={run} retry={retry} file={fileActions} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
        <form
          className="flex items-end gap-kl-gutter"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) send(draft.trim());
            setDraft("");
          }}
        >
          <Field style={{ flex: 1 }}>
            <FieldLabel className="sr-only">Message</FieldLabel>
            <FieldFrame>
              <FieldControl
                value={draft}
                onValueChange={(v) => setDraft(String(v))}
                placeholder="Write to Tomasz"
                data-testid="ms-input"
              />
            </FieldFrame>
          </Field>
          <Button type="submit" variant="primary" data-testid="ms-send">
            Send
          </Button>
        </form>
      </div>
      <div className={ui.row}>
        <Button size="compact" onClick={() => incoming(1)} data-testid="ms-incoming">
          Receive a reply
        </Button>
        <Button size="compact" onClick={() => incoming(3)} data-testid="ms-three">
          Receive three
        </Button>
        <Button
          size="compact"
          onClick={() => setMsgs((ms) => (ms[0]?.id === "e1" ? ms : [...EARLIER, ...ms]))}
          data-testid="ms-earlier"
        >
          Load earlier
        </Button>
        <Button size="compact" onClick={() => attach(false)} data-testid="ms-attach">
          Attach a photo
        </Button>
        <Button size="compact" onClick={() => attach(true)} data-testid="ms-attach-fail">
          Attach a photo that fails
        </Button>
      </div>
    </div>
  );
}
/* Bubble cases, outside a log: compact and long, a long link, files only, text with files */
function BubbleCases() {
  const longName = "warehouse-inbound-checklist-dock-4-november-week-45-revised-final.xlsx";
  return (
    <MessageGroup data-testid="bubble-cases">
      <Message>
        <MessageAvatar>
          <Avatar name="Tomasz Wolak" decorative />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <span>Tomasz Wolak</span> <time>09:12</time>
          </MessageHeader>
          <Bubble>
            <BubbleContent>Ok.</BubbleContent>
          </Bubble>
          <Bubble>
            <BubbleContent>
              {"Two pallets on the left are double-stacked.\nThe top one is the light one, so unload it first."}
            </BubbleContent>
          </Bubble>
          <Bubble>
            <BubbleContent>
              <a
                href="https://example.com/track/TR4492/stops/dock-4/arrival-photos/2026-11-09"
                target="_blank"
                rel="noreferrer"
              >
                https://example.com/track/TR4492/stops/dock-4/arrival-photos/2026-11-09
              </a>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageContent>
          <MessageHeader>
            <span>You</span> <time>09:15</time>
          </MessageHeader>
          <Bubble tone="tint" data-testid="files-only">
            <ChatFileCell f={done("c1", longName, "92 KB", "file")} />
            <ChatFileCell f={done("c2", "dock-4.jpg", "1.1 MB", "image")} />
          </Bubble>
          <Bubble tone="tint">
            <BubbleContent>Both signed. The scan is still going.</BubbleContent>
            <ChatFileCell f={done("c3", "POD-TR4492.pdf", "210 KB", "file")} />
            <ChatFileCell
              f={{
                id: "c4",
                name: "seal-log-scan.pdf",
                size: "4.2 MB",
                kind: "file",
                state: "processing",
                progress: 100,
              }}
            />
          </Bubble>
          <MessageFooter>Sent</MessageFooter>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}
export function ChatSpecimen() {
  const [pct, setPct] = React.useState(42);
  return (
    <div className={ui.stack} data-testid="specimen-chat">
      <div className={ui.group}>
        <h3 className={ui.cap}>
          A conversation: send, receive while reading older messages, load earlier history, upload and retry
        </h3>
        <Conversation />
      </div>
      <div className={ui.group}>
        <h3 className={ui.cap}>Bubbles: a short reply, multiline, a long link, files only, text with files</h3>
        <div style={{ maxWidth: 560 }}>
          <BubbleCases />
        </div>
      </div>
      <div className={ui.group} data-testid="at-states">
        <h3 className={ui.cap}>Standalone attachments: idle, uploading, processing, failed, done</h3>
        <div className={ui.stackTight} style={{ maxWidth: 520 }}>
          <Attachment state="idle" data-testid="at-idle">
            <AttachmentMedia>
              <AttachmentGlyph name="file" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>packing-list.xlsx</AttachmentTitle>
              <AttachmentDescription>36 KB · not sent</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Remove packing-list.xlsx">
                <AttachmentGlyph name="close" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
          <Attachment state="uploading" progress={pct} data-testid="at-up">
            <AttachmentMedia>
              <AttachmentGlyph name="image" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>pallet-damage-bay2.jpg</AttachmentTitle>
              <AttachmentDescription>3.1 MB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                aria-label="Cancel pallet-damage-bay2.jpg"
                onClick={() => setPct((p) => Math.min(100, p + 20))}
              >
                <AttachmentGlyph name="close" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
          <Attachment state="processing" data-testid="at-proc">
            <AttachmentMedia>
              <AttachmentGlyph name="file" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>delivery-note-scan.pdf</AttachmentTitle>
              <AttachmentDescription>1.2 MB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment state="error" progress={61} data-testid="at-err">
            <AttachmentMedia>
              <AttachmentGlyph name="file" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>customs-T1-export-declaration-full-scan-2026.pdf</AttachmentTitle>
              <AttachmentDescription>Over the 25 MB limit. Split the scan and try again.</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Retry customs-T1-export-declaration-full-scan-2026.pdf">
                <AttachmentGlyph name="retry" />
              </AttachmentAction>
              <AttachmentAction aria-label="Remove customs-T1-export-declaration-full-scan-2026.pdf">
                <AttachmentGlyph name="close" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
          <div className={ui.row}>
            <Attachment state="done" size="tile" data-testid="at-tile">
              <AttachmentMedia>
                <AttachmentGlyph name="image" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>seal-rear-door.jpg</AttachmentTitle>
                <AttachmentDescription>2.4 MB</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Remove seal-rear-door.jpg">
                  <AttachmentGlyph name="close" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
            <Attachment state="done" size="compact">
              <AttachmentMedia>
                <AttachmentGlyph name="file" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>CMR.pdf</AttachmentTitle>
                <AttachmentDescription>480 KB</AttachmentDescription>
              </AttachmentContent>
              <AttachmentTrigger aria-label="Open CMR.pdf" />
            </Attachment>
          </div>
        </div>
      </div>
      <div className={ui.group} dir="rtl" data-testid="chat-rtl">
        <h3 className={ui.cap}>
          RTL: your run at the inline end (left); each run still hangs from its text's leading edge
        </h3>
        <div style={{ maxWidth: 480 }}>
          <MessageGroup>
            <Message>
              <MessageAvatar>
                <Avatar name="Tomasz Wolak" decorative />
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <span>توماس</span> <time>14:03</time>
                </MessageHeader>
                <Bubble>
                  <BubbleContent>وصلت إلى البوابة.</BubbleContent>
                </Bubble>
                <Bubble>
                  <BubbleContent>الختم على الباب الخلفي يقرأ 448 210.</BubbleContent>
                  <ChatFileCell f={done("r1", "seal-rear-door.jpg", "2.4 MB", "image")} />
                </Bubble>
              </MessageContent>
            </Message>
            <Message align="end">
              <MessageContent>
                <MessageHeader>
                  <span>أنت</span> <time>14:05</time>
                </MessageHeader>
                <Bubble tone="tint">
                  <BubbleContent>انتظر في الرصيف 2.</BubbleContent>
                </Bubble>
                <Bubble tone="tint">
                  <BubbleContent>شكرًا.</BubbleContent>
                </Bubble>
                <MessageFooter>قُرئت 14:06</MessageFooter>
              </MessageContent>
            </Message>
          </MessageGroup>
        </div>
      </div>
    </div>
  );
}
