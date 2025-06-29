"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ToolSelectionPanel } from "@/components/tool-selection-panel"
import { ActionsPanel } from "@/components/actions-panel"
import { PenTool, Save } from "lucide-react"

export function MobileBottomNav() {
  const [isToolsSheetOpen, setIsToolsSheetOpen] = useState(false)
  const [isActionsSheetOpen, setIsActionsSheetOpen] = useState(false)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 p-2 flex justify-around items-center md:hidden z-50">
      <Sheet open={isToolsSheetOpen} onOpenChange={setIsToolsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-xs h-auto py-1 px-2">
            <PenTool className="w-6 h-6" />
            <span>도구</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center text-xl">도구 선택</SheetTitle>
          </SheetHeader>
          <ToolSelectionPanel />
        </SheetContent>
      </Sheet>

      <Sheet open={isActionsSheetOpen} onOpenChange={setIsActionsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="flex flex-col items-center gap-1 text-xs h-auto py-1 px-2">
            <Save className="w-6 h-6" />
            <span>작업</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center text-xl">작업 및 단축키</SheetTitle>
          </SheetHeader>
          <ActionsPanel />
        </SheetContent>
      </Sheet>
    </nav>
  )
}
