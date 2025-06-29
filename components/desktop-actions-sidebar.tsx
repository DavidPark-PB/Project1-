import { ActionsPanel } from "@/components/actions-panel"

export function DesktopActionsSidebar() {
  return (
    <aside className="hidden md:block w-64 space-y-4 flex-shrink-0">
      <ActionsPanel />
    </aside>
  )
}
