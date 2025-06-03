"use client"

import type React from "react"

interface ShapePanelProps {
  canvas: any
}

const ShapePanel: React.FC<ShapePanelProps> = ({ canvas }) => {
  const handleAddShape = (type: "rectangle" | "circle", color?: string) => {
    if (!canvas) return

    canvas.addShape(type, color || "#FF6B6B")
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">기본 도형</h3>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAddShape("rectangle")}
          className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-6 bg-red-400 rounded mb-1"></div>
          <span className="text-xs text-gray-600">사각형</span>
        </button>

        <button
          onClick={() => handleAddShape("circle")}
          className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-teal-400 rounded-full mb-1"></div>
          <span className="text-xs text-gray-600">원</span>
        </button>
      </div>

      {/* 색상 선택 */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">색상</h4>
        <div className="grid grid-cols-4 gap-2">
          {["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FFB6C1", "#98FB98"].map((color) => (
            <button
              key={color}
              onClick={() => handleAddShape("rectangle", color)}
              className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ShapePanel
