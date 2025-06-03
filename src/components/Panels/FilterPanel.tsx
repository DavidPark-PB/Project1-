"use client"

import type React from "react"
import { FILTERS, BACKGROUND_OPTIONS } from "../../constants"
import { applyFilterToObject } from "../../utils/fabricUtils"

interface FilterPanelProps {
  canvas: any
}

const FilterPanel: React.FC<FilterPanelProps> = ({ canvas }) => {
  const handleFilterApply = (filterType: string, value?: number) => {
    if (!canvas) return

    let targetObject = canvas.getActiveObject()

    // 선택된 객체가 없거나 이미지가 아니면 첫 번째 이미지 찾기
    if (!targetObject || targetObject.type !== "image") {
      const allObjects = canvas.getObjects()
      targetObject = allObjects.find((obj: any) => obj.type === "image")
    }

    if (targetObject) {
      applyFilterToObject(targetObject, filterType, value)
      canvas.renderAll()
    }
  }

  const handleBackgroundChange = (color: string) => {
    if (canvas) {
      canvas.backgroundColor = color
      canvas.renderAll()
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">필터 & 배경</h3>

      {/* 필터 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">이미지 필터</h4>
        <div className="grid grid-cols-2 gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterApply(filter.type, filter.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {filter.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">* 이미지를 선택하거나 첫 번째 이미지에 자동 적용됩니다</p>
      </div>

      {/* 배경색 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">배경색</h4>
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUND_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleBackgroundChange(option.color)}
              className="flex flex-col items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded border border-gray-300 mb-1"
                style={{ backgroundColor: option.color }}
              ></div>
              <span className="text-xs text-gray-600">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
