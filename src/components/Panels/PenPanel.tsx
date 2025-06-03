"use client"

import type React from "react"
import { useEditor } from "../../contexts/EditorContext"

interface PenPanelProps {
  canvas: any
}

const PenPanel: React.FC<PenPanelProps> = ({ canvas }) => {
  const { state, updatePenSettings, setDrawingMode } = useEditor()

  const handleColorChange = (color: string) => {
    updatePenSettings({ color })
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color
    }
  }

  const handleWidthChange = (width: number) => {
    updatePenSettings({ width })
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = width
    }
  }

  const handleOpacityChange = (opacity: number) => {
    updatePenSettings({ opacity })
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = `rgba(${hexToRgb(state.penSettings.color)}, ${opacity})`
    }
  }

  const toggleDrawingMode = () => {
    if (canvas) {
      const newMode = !canvas.isDrawingMode
      canvas.isDrawingMode = newMode
      setDrawingMode(newMode)
    }
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${Number.parseInt(result[1], 16)}, ${Number.parseInt(result[2], 16)}, ${Number.parseInt(result[3], 16)}`
      : "0, 0, 0"
  }

  const presetColors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
  ]

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">펜 도구</h3>

      {/* 그리기 모드 토글 */}
      <div className="mb-4">
        <button
          onClick={toggleDrawingMode}
          className={`
            w-full py-2 px-4 rounded-lg font-medium transition-colors
            ${state.isDrawing ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
        >
          {state.isDrawing ? "그리기 모드 ON" : "그리기 모드 OFF"}
        </button>
      </div>

      {/* 색상 선택 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="color"
            value={state.penSettings.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
          />
          <span className="text-sm text-gray-600">{state.penSettings.color}</span>
        </div>

        {/* 프리셋 색상 */}
        <div className="grid grid-cols-5 gap-1">
          {presetColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`
                w-6 h-6 rounded border-2 transition-all
                ${state.penSettings.color === color ? "border-gray-800 scale-110" : "border-gray-300 hover:scale-105"}
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* 굵기 조절 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">굵기: {state.penSettings.width}px</label>
        <input
          type="range"
          min="1"
          max="50"
          value={state.penSettings.width}
          onChange={(e) => handleWidthChange(Number.parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* 투명도 조절 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          투명도: {Math.round(state.penSettings.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={state.penSettings.opacity}
          onChange={(e) => handleOpacityChange(Number.parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* 미리보기 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">미리보기</p>
        <div
          className="w-full h-8 rounded"
          style={{
            background: `linear-gradient(to right, transparent, ${state.penSettings.color})`,
          }}
        />
      </div>
    </div>
  )
}

export default PenPanel
