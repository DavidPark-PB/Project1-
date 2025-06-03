"use client"

import { useEffect } from "react"

interface KeyboardShortcutsProps {
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  onSave: () => void
  onCopy?: () => void
  onPaste?: () => void
  onSelectAll?: () => void
}

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onDelete,
  onSave,
  onCopy,
  onPaste,
  onSelectAll,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서는 단축키 비활성화
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const isCtrl = e.ctrlKey || e.metaKey

      if (isCtrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        onUndo()
      } else if (isCtrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        onRedo()
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        onDelete()
      } else if (isCtrl && e.key === "s") {
        e.preventDefault()
        onSave()
      } else if (isCtrl && e.key === "c" && onCopy) {
        e.preventDefault()
        onCopy()
      } else if (isCtrl && e.key === "v" && onPaste) {
        e.preventDefault()
        onPaste()
      } else if (isCtrl && e.key === "a" && onSelectAll) {
        e.preventDefault()
        onSelectAll()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onUndo, onRedo, onDelete, onSave, onCopy, onPaste, onSelectAll])
}
