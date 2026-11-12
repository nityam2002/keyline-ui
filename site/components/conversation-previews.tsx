"use client";

import dynamic from "next/dynamic";
import { ExampleLoading as loading } from "./example-loading";

// The Conversation pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const MessageThread = dynamic(() => import("@site/examples/message-thread").then((m) => m.ThreadWithJim), {
  ssr: false,
  loading,
});
export const BubbleReactions = dynamic(
  () => import("@site/examples/bubble-reactions").then((m) => m.PartyAnnouncement),
  { ssr: false, loading },
);
export const MessageScrollerChat = dynamic(
  () => import("@site/examples/message-scroller-chat").then((m) => m.DriverChat),
  { ssr: false, loading },
);
export const AttachmentUpload = dynamic(
  () => import("@site/examples/attachment-upload").then((m) => m.InvoiceUploads),
  { ssr: false, loading },
);
export const QuestionnaireParty = dynamic(
  () => import("@site/examples/questionnaire-party").then((m) => m.BirthdaySurvey),
  { ssr: false, loading },
);
