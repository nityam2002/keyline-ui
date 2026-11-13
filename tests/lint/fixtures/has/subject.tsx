// Near-misses the has-subject guard must pass: every :has() here is on the styled element itself.
export const subject = [
  "has-[>[data-slot=item-meta]]:[--kl-item-span:1/span_2]",
  "not-has-[>[data-slot=item-media]]:grid-cols-[minmax(0,1fr)_auto_auto]",
  "data-[tone=attention]:not-has-[>[data-slot=bubble-reactions]]:has-[+[data-slot=bubble]]:mb-3",
  "[@container_kl-log_(max-width:420px)]:not-has-[>[data-slot=message-avatar]]:[--kl-msg-measure:88%]",
  "data-[single]:has-[[data-has-overflow-x]]:[--s-cb-top:calc(50%-6px)]",
  "*:data-[slot=item-content]:col-[var(--kl-item-c-col,auto)]",
  "[[data-slot=bubble]+&]:-mt-(--kl-k2)",
];
