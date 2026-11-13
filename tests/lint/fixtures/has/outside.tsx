// Each string is a shape the has-subject guard must flag (taken from the classes it replaced). One hit per line.
export const outside = [
  "has-[>[data-slot=item-media]]:*:data-[slot=item-content]:col-[2]",
  "[@container_(max-width:420px)]:has-[>[data-slot=item-meta]]:**:data-[slot=item-meta]:row-2",
  "group-not-has-data-[slot=marker-icon]/marker:start-0",
  "group-has-[.kl-radio-meta]/radio-group:not-has-[.kl-radio-meta]:after:content-['']",
  "[[data-slot=message]:has(>[data-slot=message-avatar])>&]:max-w-[82%]",
  "[[data-slot=bubble]:has(>[data-slot=bubble-reactions])+&]:mt-[14px]",
  "[[data-slot=frame]:not(:has([data-slot=meta]:not([data-empty])))_&]:data-empty:hidden",
  "[.s-cb[data-single]:has([data-has-overflow-x])_&]:inset-bs-[calc(50%-6px)]",
];
