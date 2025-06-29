import { ToolSelectionPanel } from "@/components/tool-selection-panel"

export function DesktopToolSidebar() {
  return (
    <aside className="hidden md:block w-64 space-y-4 flex-shrink-0">
      <ToolSelectionPanel />
    </aside>
  )
}
