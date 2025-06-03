"use client"

import type React from "react"
import { useEffect } from "react"
import { useCanvas } from "../../hooks/useCanvas"
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { useEditor } from "../../contexts/EditorContext"
import LoadingSpinner from "../UI/LoadingSpinner"

interface CanvasContainerProps {
  onCanvasReady: (canvas: any) => void
  onSave: () => void
}

const CanvasContainer: React.FC<CanvasContainerProps> = ({ onCanvasReady, onSave }) => {
  const { canvasRef, canvas, isCanvasReady, error } = useCanvas()
  const { state } = useEditor()

  useEffect(() => {
    if (canvas && isCanvasReady) {
      onCanvasReady(canvas)
    }
  }, [canvas, isCanvasReady, onCanvasReady])

  const handleUndo = () => {
    if (canvas) {
      canvas.undo()
    }
  }

  const handleRedo = () => {
    if (canvas) {
      canvas.redo()
    }
  }

  const handleDelete = () => {
    if (canvas) {
      canvas.deleteSelected()
    }
  }

  const handleSave = () => {
    if (canvas) {
      try {
        const dataURL = canvas.exportAsDataURL()
        const link = document.createElement("a")
        link.href = dataURL
        link.download = "ive-photocard.png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        onSave()
      } catch (error) {
        console.error("Error saving canvas:", error)
      }
    }
  }

  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDelete: handleDelete,
    onSave: handleSave,
  })

  if (error) {
    return (
      <div className="flex items-center justify-center w-[400px] h-[618px] bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center p-4">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }

  if (!isCanvasReady) {
    return (
      <div className="flex items-center justify-center w-[400px] h-[618px] bg-gray-100 rounded-lg">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="border-2 border-purple-200 rounded-lg shadow-lg cursor-pointer" />

      {/* 히스토리 컨트롤 */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={handleUndo}
          disabled={!canvas?.canUndo()}
          className="p-1 bg-white rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
          title="실행 취소 (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </button>
        <button
          onClick={handleRedo}
          disabled={!canvas?.canRedo()}
          className="p-1 bg-white rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
          title="다시 실행 (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CanvasContainer
