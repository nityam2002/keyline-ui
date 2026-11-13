import type { KeylineItem } from "../../item";

export default {
  name: "alert-dialog",
  type: "registry:ui",
  title: "Alert dialog",
  description:
    "Installs the dialog item, which exports AlertDialog, AlertDialogTrigger, AlertDialogPopup and AlertDialogContent (focus on the safe action, destructive or primary tone) beside Dialog. Import from dialog.",
  whenToUse:
    "Use it to confirm an action that loses something, such as removing a record, with focus on the safe choice. For a task with a form use Dialog; for an undoable action use Toast with Undo.",
  files: [],
  registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/dialog"],
  requires: {
    // an alias with no files: AlertDialog ships in the dialog item
    registryDependencies: ["@keyline-ui/keyline", "@keyline-ui/dialog"],
  },
} satisfies KeylineItem;
