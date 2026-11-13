// Every component page's hand-written content, by item name. The generated page renders these.
import type { ComponentContent } from "@site/content/types";
import { content as accordionPage } from "./accordion";
import { content as appShellPage } from "./app-shell";
import { content as attachmentPage } from "./attachment";
import { content as avatarPage } from "./avatar";
import { content as breadcrumbPage } from "./breadcrumb";
import { content as bubblePage } from "./bubble";
import { content as buttonPage } from "./button";
import { content as buttonGroupPage } from "./button-group";
import { content as carouselPage } from "./carousel";
import { content as chartPage } from "./chart";
import { content as checkboxPage } from "./checkbox";
import { content as checkboxGroupPage } from "./checkbox-group";
import { content as collapsiblePage } from "./collapsible";
import { content as comboboxPage } from "./combobox";
import { content as commandPage } from "./command";
import { content as contextMenuPage } from "./context-menu";
import { content as dataTablePage } from "./data-table";
import { content as datePickerPage } from "./date-picker";
import { content as dateRangePage } from "./date-range";
import { content as dialogPage } from "./dialog";
import { content as directionPage } from "./direction";
import { content as drawerPage } from "./drawer";
import { content as emptyPage } from "./empty";
import { content as fieldPage } from "./field";
import { content as hoverCardPage } from "./hover-card";
import { content as inspectorPage } from "./inspector";
import { content as itemPage } from "./item";
import { content as kbdPage } from "./kbd";
import { content as markerPage } from "./marker";
import { content as menuPage } from "./menu";
import { content as menubarPage } from "./menubar";
import { content as messagePage } from "./message";
import { content as messageScrollerPage } from "./message-scroller";
import { content as multiselectPage } from "./multiselect";
import { content as nativeSelectPage } from "./native-select";
import { content as navPage } from "./nav";
import { content as navigationMenuPage } from "./navigation-menu";
import { content as noticePage } from "./notice";
import { content as numberFieldPage } from "./number-field";
import { content as otpFieldPage } from "./otp-field";
import { content as paginationPage } from "./pagination";
import { content as panelPage } from "./panel";
import { content as popoverPage } from "./popover";
import { content as progressPage } from "./progress";
import { content as questionnairePage } from "./questionnaire";
import { content as radioGroupPage } from "./radio-group";
import { content as resizablePage } from "./resizable";
import { content as scrollAreaPage } from "./scroll-area";
import { content as segmentedPage } from "./segmented";
import { content as selectPage } from "./select";
import { content as sheetPage } from "./sheet";
import { content as skeletonPage } from "./skeleton";
import { content as sliderPage } from "./slider";
import { content as splitButtonPage } from "./split-button";
import { content as statPage } from "./stat";
import { content as statusPage } from "./status";
import { content as switchPage } from "./switch";
import { content as tablePage } from "./table";
import { content as tabsPage } from "./tabs";
import { content as timeFieldPage } from "./time-field";
import { content as toastPage } from "./toast";
import { content as togglePage } from "./toggle";
import { content as toggleGroupPage } from "./toggle-group";
import { content as toolbarPage } from "./toolbar";
import { content as tooltipPage } from "./tooltip";

export const CONTENT: Record<string, ComponentContent> = {
  accordion: accordionPage,
  "app-shell": appShellPage,
  attachment: attachmentPage,
  avatar: avatarPage,
  breadcrumb: breadcrumbPage,
  bubble: bubblePage,
  button: buttonPage,
  "button-group": buttonGroupPage,
  carousel: carouselPage,
  chart: chartPage,
  checkbox: checkboxPage,
  "checkbox-group": checkboxGroupPage,
  collapsible: collapsiblePage,
  combobox: comboboxPage,
  command: commandPage,
  "context-menu": contextMenuPage,
  "data-table": dataTablePage,
  "date-picker": datePickerPage,
  "date-range": dateRangePage,
  dialog: dialogPage,
  direction: directionPage,
  drawer: drawerPage,
  empty: emptyPage,
  field: fieldPage,
  "hover-card": hoverCardPage,
  inspector: inspectorPage,
  item: itemPage,
  kbd: kbdPage,
  marker: markerPage,
  menu: menuPage,
  menubar: menubarPage,
  message: messagePage,
  "message-scroller": messageScrollerPage,
  multiselect: multiselectPage,
  "native-select": nativeSelectPage,
  nav: navPage,
  "navigation-menu": navigationMenuPage,
  notice: noticePage,
  "number-field": numberFieldPage,
  "otp-field": otpFieldPage,
  pagination: paginationPage,
  panel: panelPage,
  popover: popoverPage,
  progress: progressPage,
  questionnaire: questionnairePage,
  "radio-group": radioGroupPage,
  resizable: resizablePage,
  "scroll-area": scrollAreaPage,
  segmented: segmentedPage,
  select: selectPage,
  sheet: sheetPage,
  skeleton: skeletonPage,
  slider: sliderPage,
  "split-button": splitButtonPage,
  stat: statPage,
  status: statusPage,
  switch: switchPage,
  table: tablePage,
  tabs: tabsPage,
  "time-field": timeFieldPage,
  toast: toastPage,
  toggle: togglePage,
  "toggle-group": toggleGroupPage,
  toolbar: toolbarPage,
  tooltip: tooltipPage,
};
