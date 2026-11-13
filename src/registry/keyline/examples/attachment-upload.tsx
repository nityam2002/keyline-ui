"use client";

import { useEffect, useRef, useState } from "react";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGlyph,
  AttachmentMedia,
  AttachmentTitle,
} from "../ui/attachment";
import { Button } from "../ui/button";

type File = {
  id: number;
  name: string;
  size: string;
  kind: "file" | "image";
  state: "uploading" | "error" | "done";
  progress: number;
  fails: boolean;
};

const NEXT = [
  { name: "invoice-DM-4107.pdf", size: "212 KB", kind: "file" as const, fails: false },
  { name: "loading-dock.jpg", size: "1.8 MB", kind: "image" as const, fails: true },
  { name: "q4-price-list.pdf", size: "96 KB", kind: "file" as const, fails: false },
];

export function InvoiceUploads() {
  const [files, setFiles] = useState<File[]>([
    {
      id: 0,
      name: "signed-delivery-note.pdf",
      size: "88 KB",
      kind: "file",
      state: "done",
      progress: 100,
      fails: false,
    },
  ]);
  const n = useRef(1);

  // a pretend upload: 20% a tick; the dock photo fails at 60% the first time
  useEffect(() => {
    if (!files.some((f) => f.state === "uploading")) return;
    const t = setInterval(() => {
      setFiles((fs) =>
        fs.map((f) => {
          if (f.state !== "uploading") return f;
          if (f.fails && f.progress >= 60) return { ...f, state: "error", fails: false };
          const p = Math.min(100, f.progress + 20);
          return { ...f, progress: p, state: p === 100 ? "done" : "uploading" };
        }),
      );
    }, 400);
    return () => clearInterval(t);
  }, [files]);

  const attach = () => {
    const id = n.current++;
    const next = NEXT[(id - 1) % NEXT.length];
    if (!next) return;
    setFiles((fs) => [...fs, { id, ...next, state: "uploading", progress: 0 }]);
  };

  return (
    <div className="grid max-w-[460px] gap-3">
      <ul aria-label="Attachments" className="m-0 grid list-none gap-2 p-0">
        {files.map((f) => (
          <li key={f.id}>
            <Attachment state={f.state} progress={f.progress}>
              <AttachmentMedia>
                <AttachmentGlyph name={f.kind} />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{f.name}</AttachmentTitle>
                <AttachmentDescription>
                  {f.state === "error" ? "The connection dropped at 60%." : f.size}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                {f.state === "error" ? (
                  <AttachmentAction
                    aria-label={`Retry ${f.name}`}
                    onClick={() =>
                      setFiles((fs) => fs.map((x) => (x.id === f.id ? { ...x, state: "uploading", progress: 0 } : x)))
                    }
                  >
                    <AttachmentGlyph name="retry" />
                  </AttachmentAction>
                ) : null}
                <AttachmentAction
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((fs) => fs.filter((x) => x.id !== f.id))}
                >
                  <AttachmentGlyph name="close" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </li>
        ))}
      </ul>
      <Button size="compact" className="justify-self-start" onClick={attach}>
        Attach a file
      </Button>
    </div>
  );
}
