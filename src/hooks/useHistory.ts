"use client"

import { useState, useCallback } from "react"
import type { HistoryState } from "../types"

export const useHistory = (maxHistorySize = 50) => {
  const [history, setHistory] = useState<HistoryState[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const saveState = useCallback(
    (canvas: any) => {
      if (!canvas) return

      const state: HistoryState = {
        objects: canvas.toJSON(),
        timestamp: Date.now(),
      }

      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1)
        newHistory.push(state)

        if (newHistory.length > maxHistorySize) {
          newHistory.shift()
          return newHistory
        }

        return newHistory
      })

      setCurrentIndex((prev) => Math.min(prev + 1, maxHistorySize - 1))
    },
    [currentIndex, maxHistorySize],
  )

  const undo = useCallback(
    (canvas: any) => {
      if (!canvas || currentIndex <= 0) return false

      const prevState = history[currentIndex - 1]
      canvas.loadFromJSON(prevState.objects, () => {
        canvas.renderAll()
      })

      setCurrentIndex((prev) => prev - 1)
      return true
    },
    [history, currentIndex],
  )

  const redo = useCallback(
    (canvas: any) => {
      if (!canvas || currentIndex >= history.length - 1) return false

      const nextState = history[currentIndex + 1]
      canvas.loadFromJSON(nextState.objects, () => {
        canvas.renderAll()
      })

      setCurrentIndex((prev) => prev + 1)
      return true
    },
    [history, currentIndex],
  )

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: history.length,
  }
}
