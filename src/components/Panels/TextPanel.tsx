"use client"

import type React from "react"
import { useState } from "react"
import { useEditor } from "../../contexts/EditorContext"
import { FONT_FAMILIES } from "../../constants"

interface TextPanelProps {
  canvas: any
}

const TextPanel: React.FC<TextPanelProps> = ({ canvas }) => {
  const { state, updateTextStyle } = useEditor()
  const [inputText, setInputText] = useState("텍스트 입력")

  const handleAddText = () => {
    if (canvas && inputText.trim()) {
      canvas.addText(inputText, {
        fontSize: state.textStyle.fontSize,
        fontFamily: state.textStyle.fontFamily,
        fill: state.textStyle.color,
        fontWeight: state.textStyle.fontWeight,
      })
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">텍스트</h3>

      {/* 텍스트 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="텍스트를 입력하세요"
          />
          <button
            onClick={handleAddText}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            추가
          </button>
        </div>
      </div>

      {/* 폰트 패밀리 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">폰트</label>
        <select
          value={state.textStyle.fontFamily}
          onChange={(e) => updateTextStyle({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* 폰트 크기 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">크기: {state.textStyle.fontSize}px</label>
        <input
          type="range"
          min="8"
          max="72"
          value={state.textStyle.fontSize}
          onChange={(e) => updateTextStyle({ fontSize: Number.parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* 색상 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
        <input
          type="color"
          value={state.textStyle.color}
          onChange={(e) => updateTextStyle({ color: e.target.value })}
          className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
        />
      </div>

      {/* 미리보기 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">미리보기</p>
        <div
          style={{
            fontFamily: state.textStyle.fontFamily,
            fontSize: `${Math.min(state.textStyle.fontSize, 24)}px`,
            fontWeight: state.textStyle.fontWeight,
            color: state.textStyle.color,
          }}
        >
          {inputText || "텍스트 미리보기"}
        </div>
      </div>
    </div>
  )
}

export default TextPanel
