"use client"

import type React from "react"
import { useState } from "react"
import { STICKERS, STICKER_CATEGORIES } from "../../constants"

interface StickerPanelProps {
  canvas: any
  onError?: (message: string) => void
}

const StickerPanel: React.FC<StickerPanelProps> = ({ canvas, onError }) => {
  const [selectedCategory, setSelectedCategory] = useState(STICKER_CATEGORIES.HEARTS)

  const filteredStickers = STICKERS.filter((sticker) => sticker.category === selectedCategory)

  const handleStickerClick = (sticker: any) => {
    if (!canvas) return

    try {
      canvas.addEmoji(sticker.url)
    } catch (error) {
      console.error("Failed to add sticker:", error)
      onError?.("스티커 추가에 실패했습니다.")
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">스티커</h3>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {Object.entries(STICKER_CATEGORIES).map(([key, value]) => (
          <button
            key={value}
            onClick={() => setSelectedCategory(value)}
            className={`
              px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors
              ${
                selectedCategory === value
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {key === "HEARTS" && "💖"}
            {key === "FACES" && "😊"}
            {key === "SHAPES" && "⭐"}
            {key === "OBJECTS" && "🎵"}
          </button>
        ))}
      </div>

      {/* 스티커 그리드 */}
      <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
        {filteredStickers.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => handleStickerClick(sticker)}
            className="
              w-12 h-12 rounded-lg p-1 transition-all
              hover:bg-purple-50 hover:scale-110 active:scale-95
              border border-gray-200 hover:border-purple-300
              flex items-center justify-center text-2xl
            "
            title={sticker.name}
          >
            {sticker.url}
          </button>
        ))}
      </div>
    </div>
  )
}

export default StickerPanel
