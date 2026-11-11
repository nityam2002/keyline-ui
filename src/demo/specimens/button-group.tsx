import * as React from "react"
import * as ui from "../demo-ui"
import { Button } from "@/registry/keyline/ui/button"
import { Menu,MenuTrigger,MenuContent,MenuItem } from "@/registry/keyline/ui/menu"
import { ButtonGroup,ButtonGroupText,ButtonGroupSeparator } from "@/registry/keyline/ui/button-group"

/* ------------------------------------------------------------------ *
 * 5. Button group, marker, direction
 * ------------------------------------------------------------------ */
export function ButtonGroupSpecimen() {
  const [zoom, setZoom] = React.useState(100)
  const [page, setPage] = React.useState(3)
  return (
    <div className={ui.stack} data-testid="specimen-button-group">
      <div className={ui.row}>
        <ButtonGroup aria-label="Pages">
          <Button layout="cell" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <ButtonGroupText aria-live="polite">Page {page} of 12</ButtonGroupText>
          <Button layout="cell" disabled={page === 12} onClick={() => setPage(page + 1)}>Next</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Zoom">
          <Button layout="cell" size="icon" aria-label="Zoom out" disabled={zoom <= 50} onClick={() => setZoom(zoom - 25)}>−</Button>
          <ButtonGroupText><bdi>{zoom}%</bdi></ButtonGroupText>
          <Button layout="cell" size="icon" aria-label="Zoom in" disabled={zoom >= 200} onClick={() => setZoom(zoom + 25)}>+</Button>
          <ButtonGroupSeparator />
          <Button layout="cell" onClick={() => setZoom(100)}>Fit</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Share">
          <Button layout="cell">Copy link</Button>
          <Menu>
            <MenuTrigger render={<Button layout="cell" />}>Share ▾</MenuTrigger>
            <MenuContent align="end">
              <MenuItem>Email</MenuItem>
              <MenuItem>Slack</MenuItem>
            </MenuContent>
          </Menu>
        </ButtonGroup>
      </div>
      <ButtonGroup orientation="vertical" aria-label="Align" style={{ width: 180 }}>
        <Button layout="cell">Align start</Button>
        <Button layout="cell">Align centre</Button>
        <Button layout="cell">Align end</Button>
      </ButtonGroup>
    </div>
  )
}
