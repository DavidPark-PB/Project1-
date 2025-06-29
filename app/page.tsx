import { Header } from "@/components/header"
import { PhotocardCanvas } from "@/components/photocard-canvas"
import { DesktopToolSidebar } from "@/components/desktop-tool-sidebar"
import { DesktopActionsSidebar } from "@/components/desktop-actions-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

export default function PhotocardEditorPage() {
  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      <Header />
      <main className="flex flex-1 flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 pb-16 md:pb-4">
        {" "}
        {/* Added pb-16 for mobile bottom nav */}
        <DesktopToolSidebar /> {/* Hidden on mobile */}
        <PhotocardCanvas />
        <DesktopActionsSidebar /> {/* Hidden on mobile */}
      </main>
      <MobileBottomNav /> {/* Visible only on mobile */}
    </div>
  )
}
