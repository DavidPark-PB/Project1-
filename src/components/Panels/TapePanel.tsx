"use client"

import type React from "react"
import { MASKING_TAPES } from "../../constants"

interface TapePanelProps {
  canvas: any
}

const TapePanel: React.FC<TapePanelProps> = ({ canvas }) => {
  const handleAddTape = (color: string, style: "horizontal" | "vertical" | "diagonal" = "horizontal") => {
    if (!canvas) return

    try {
      // SimpleCanvas의 addTape 메서드 호출
      if (canvas.addTape) {
        canvas.addTape(color, style)
      } else {
        // Fabric.js 기반 캔버스인 경우
        console.log("Adding tape with Fabric.js:", color, style)
        // Fabric.js 기반 테이프 추가 로직
        addFabricTape(canvas, color, style)
      }
    } catch (error) {
      console.error("Failed to add tape:", error)
    }
  }

  // Fabric.js 기반 테이프 추가 함수
  const addFabricTape = (canvas: any, color: string, style: string) => {
    if (!window.fabric) return

    let width = 150
    let height = 30
    let angle = 0

    switch (style) {
      case "vertical":
        width = 30
        height = 150
        break
      case "diagonal":
        angle = 45
        break
    }

    const tape = new window.fabric.Rect({
      left: canvas.width / 2,
      top: canvas.height / 2,
      width,
      height,
      fill: color,
      originX: "center",
      originY: "center",
      angle,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      opacity: 0.8,
    })

    canvas.add(tape)
    canvas.setActiveObject(tape)
    canvas.renderAll()
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">🎀 마스킹 테이프</h3>

      {/* 기본 테이프 색상 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">기본 테이프</h4>
        <div className="grid grid-cols-2 gap-3">
          {MASKING_TAPES.map((tape) => (
            <button
              key={tape.id}
              onClick={() => handleAddTape(tape.color)}
              className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:scale-105"
            >
              <div
                className="w-16 h-5 rounded-sm mb-2 border border-gray-300 shadow-sm"
                style={{ backgroundColor: tape.color }}
              ></div>
              <span className="text-xs text-gray-600 font-medium">{tape.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 테이프 스타일 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">테이프 스타일</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleAddTape("#FFB6C1", "horizontal")}
            className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-pink-50 transition-colors"
          >
            <span className="text-sm">가로 테이프</span>
            <div className="w-12 h-3 bg-pink-300 rounded-sm"></div>
          </button>

          <button
            onClick={() => handleAddTape("#DDA0DD", "vertical")}
            className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <span className="text-sm">세로 테이프</span>
            <div className="w-3 h-12 bg-purple-300 rounded-sm"></div>
          </button>

          <button
            onClick={() => handleAddTape("#98FB98", "diagonal")}
            className="w-full flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <span className="text-sm">대각선 테이프</span>
            <div className="w-12 h-3 bg-green-300 rounded-sm transform rotate-45 origin-center"></div>
          </button>
        </div>
      </div>

      {/* 특별한 테이프 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">특별한 테이프</h4>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => handleAddTape("#FFD700")}
            className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            <span className="text-sm">✨ 골드 테이프</span>
            <div className="w-12 h-4 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-sm"></div>
          </button>

          <button
            onClick={() => handleAddTape("#C0C0C0")}
            className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm">🌟 실버 테이프</span>
            <div className="w-12 h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded-sm"></div>
          </button>

          <button
            onClick={() => handleAddTape("#FF69B4")}
            className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-pink-50 transition-colors"
          >
            <span className="text-sm">💖 하트 테이프</span>
            <div className="w-12 h-4 bg-gradient-to-r from-pink-400 to-pink-500 rounded-sm"></div>
          </button>
        </div>
      </div>

      {/* 사용 팁 */}
      <div className="mt-4 p-3 bg-purple-50 rounded-lg">
        <h5 className="text-xs font-medium text-purple-700 mb-1">💡 사용 팁</h5>
        <p className="text-xs text-purple-600">
          테이프를 추가한 후 드래그로 위치를 조정하고, 모서리를 드래그해서 크기를 변경할 수 있어요!
        </p>
      </div>
    </div>
  )
}

export default TapePanel
