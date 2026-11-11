import { Select,SelectRoot,SelectLabel,SelectTrigger,SelectContent,SelectItem,SelectGroup,SelectGroupLabel,SelectSeparator } from "@/registry/keyline/ui/select"

/* ------------------------------------------------------------------ */
export function SelectMore() {
  return (
    <>
      <Select
        label="Service level (grouped)"
        defaultValue="std"
        options={[
          { value: "eco", label: "Economy", group: "Road", code: "E" },
          { value: "std", label: "Standard", group: "Road", code: "S" },
          { value: "exp", label: "Express", group: "Road", code: "X" },
          { value: "lcl", label: "Less than container load", group: "Sea", code: "LCL" },
          { value: "fcl", label: "Full container load", group: "Sea", code: "FCL" },
          { value: "air", label: "Next flight out", group: "Air", description: "Needs a dangerous-goods check", disabled: true },
        ]}
      />
      <SelectRoot items={{ none: "No escalation", lead: "Shift lead", mgr: "Operations manager", dir: "Regional director" }} defaultValue="lead">
        <SelectLabel>Escalate to (parts)</SelectLabel>
        <SelectTrigger placeholder="Nobody" />
        <SelectContent>
          <SelectItem value="none" description="Alerts stay in the inbox">No escalation</SelectItem>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>On shift</SelectGroupLabel>
            <SelectItem value="lead" code="L1">Shift lead</SelectItem>
            <SelectItem value="mgr" code="L2">Operations manager</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectGroupLabel>On call</SelectGroupLabel>
            <SelectItem value="dir" code="L3" description="Pages after 15 minutes">Regional director</SelectItem>
          </SelectGroup>
        </SelectContent>
      </SelectRoot>
    </>
  )
}
