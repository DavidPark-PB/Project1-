"use client"

import type React from "react"
import { useEditor } from "../../contexts/EditorContext"
import type { ToolType } from "../../types"

const tools = [
  { id: "select" as ToolType, icon: "↖️", name: "선택", shortcut: "V" },
  { id: "pen" as ToolType, icon: "✏️", name: "펜", shortcut: "P" },
  { id: "text" as ToolType, icon: "📝", name: "텍스트", shortcut: "T" },
  { id: "sticker" as ToolType, icon: "😊", name: "스티커", shortcut: "S" },
  { id: "shape" as ToolType, icon: "🔷", name: "도형", shortcut: "R" },
  { id: "tape" as ToolType, icon: "📏", name: "테이프", shortcut: "M" },
]

const Toolbar: React.FC = () => {
  const { state, setActiveTool } = useEditor()

  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-md">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={`
            flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all
            ${
              state.activeTool === tool.id
                ? "bg-purple-100 text-purple-700 shadow-sm"
                : "hover:bg-gray-50 text-gray-600"
            }
          `}
          title={`${tool.name} (${tool.shortcut})`}
        >
          <span className="text-lg">{tool.icon}</span>
          <span className="text-xs font-medium">{tool.shortcut}</span>
        </button>
      ))}
    </div>
  )
}

export default Toolbar
