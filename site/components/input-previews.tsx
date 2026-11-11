"use client"

import dynamic from "next/dynamic"
import { ExampleLoading as loading } from "./example-loading"

// The Inputs pages' example modules, loaded after the page: headings, install command and code are already in the HTML.

export const FieldOrder = dynamic(() => import("@site/examples/field-order").then((m) => m.NewOrder), { ssr: false, loading })
export const FieldTracking = dynamic(() => import("@site/examples/field-tracking").then((m) => m.TrackShipment), { ssr: false, loading })
export const FieldCarton = dynamic(() => import("@site/examples/field-carton").then((m) => m.CartonSize), { ssr: false, loading })

export const CheckboxClosing = dynamic(() => import("@site/examples/checkbox-closing").then((m) => m.ClosingChecklist), { ssr: false, loading })
export const CheckboxInvoices = dynamic(() => import("@site/examples/checkbox-invoices").then((m) => m.PrintInvoices), { ssr: false, loading })

export const CheckboxGroupPriceList = dynamic(() => import("@site/examples/checkbox-group-price-list").then((m) => m.PriceListRecipients), { ssr: false, loading })
export const CheckboxGroupParty = dynamic(() => import("@site/examples/checkbox-group-party").then((m) => m.PartySupplies), { ssr: false, loading })

export const RadioGroupDelivery = dynamic(() => import("@site/examples/radio-group-delivery").then((m) => m.DeliveryChoice), { ssr: false, loading })
export const RadioGroupPanel = dynamic(() => import("@site/examples/radio-group-panel").then((m) => m.PaperWeight), { ssr: false, loading })

export const SwitchAlerts = dynamic(() => import("@site/examples/switch-alerts").then((m) => m.AlertSettings), { ssr: false, loading })

export const SegmentedPeriod = dynamic(() => import("@site/examples/segmented-period").then((m) => m.SalesByPeriod), { ssr: false, loading })
export const SegmentedPanel = dynamic(() => import("@site/examples/segmented-panel").then((m) => m.Leaderboard), { ssr: false, loading })

export const SelectAssign = dynamic(() => import("@site/examples/select-assign").then((m) => m.AssignLead), { ssr: false, loading })
export const SelectForm = dynamic(() => import("@site/examples/select-form").then((m) => m.QuoteForm), { ssr: false, loading })

export const NativeSelectTransfer = dynamic(() => import("@site/examples/native-select-transfer").then((m) => m.TransferRequest), { ssr: false, loading })
export const SliderDiscount = dynamic(() => import("@site/examples/slider-discount").then((m) => m.CountyDiscount), { ssr: false, loading })
export const SliderRange = dynamic(() => import("@site/examples/slider-range").then((m) => m.PriceRange), { ssr: false, loading })
export const NumberFieldReorder = dynamic(() => import("@site/examples/number-field-reorder").then((m) => m.Reorder), { ssr: false, loading })
export const NumberFieldPrice = dynamic(() => import("@site/examples/number-field-price").then((m) => m.UnitPrice), { ssr: false, loading })
export const ComboboxClient = dynamic(() => import("@site/examples/combobox-client").then((m) => m.FindClient), { ssr: false, loading })
export const ComboboxDirectory = dynamic(() => import("@site/examples/combobox-directory").then((m) => m.CorporateDirectory), { ssr: false, loading })
export const MultiselectMemo = dynamic(() => import("@site/examples/multiselect-memo").then((m) => m.MemoRecipients), { ssr: false, loading })
export const OtpSignIn = dynamic(() => import("@site/examples/otp-sign-in").then((m) => m.SignInCode), { ssr: false, loading })
export const TimeFieldDelivery = dynamic(() => import("@site/examples/time-field-delivery").then((m) => m.DockTime), { ssr: false, loading })
export const DatePickerDelivery = dynamic(() => import("@site/examples/date-picker-delivery").then((m) => m.DeliveryDay), { ssr: false, loading })
export const DatePickerMeeting = dynamic(() => import("@site/examples/date-picker-meeting").then((m) => m.ClientMeeting), { ssr: false, loading })
export const DateRangeVacation = dynamic(() => import("@site/examples/date-range-vacation").then((m) => m.VacationRequest), { ssr: false, loading })
