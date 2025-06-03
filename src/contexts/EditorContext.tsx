"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { EditorState, ToolType, PenSettings, TextStyle } from "../types"

interface EditorContextType {
  state: EditorState
  setActiveTool: (tool: ToolType) => void
  setSelectedObject: (id: string | null) => void
  setDrawingMode: (isDrawing: boolean) => void
  updatePenSettings: (settings: Partial<PenSettings>) => void
  updateTextStyle: (style: Partial<TextStyle>) => void
  setZoom: (zoom: number) => void
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

type EditorAction =
  | { type: "SET_ACTIVE_TOOL"; payload: ToolType }
  | { type: "SET_SELECTED_OBJECT"; payload: string | null }
  | { type: "SET_DRAWING_MODE"; payload: boolean }
  | { type: "UPDATE_PEN_SETTINGS"; payload: Partial<PenSettings> }
  | { type: "UPDATE_TEXT_STYLE"; payload: Partial<TextStyle> }
  | { type: "SET_ZOOM"; payload: number }

const initialState: EditorState = {
  activeTool: "select",
  selectedObjectId: null,
  isDrawing: false,
  penSettings: {
    color: "#000000",
    width: 3,
    opacity: 1,
  },
  textStyle: {
    fontFamily: "Arial",
    fontSize: 20,
    fontWeight: "normal",
    color: "#000000",
    textAlign: "left",
    lineHeight: 1.2,
  },
  zoom: 1,
  canvasSize: { width: 400, height: 618 },
}

const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case "SET_ACTIVE_TOOL":
      return { ...state, activeTool: action.payload }
    case "SET_SELECTED_OBJECT":
      return { ...state, selectedObjectId: action.payload }
    case "SET_DRAWING_MODE":
      return { ...state, isDrawing: action.payload }
    case "UPDATE_PEN_SETTINGS":
      return {
        ...state,
        penSettings: { ...state.penSettings, ...action.payload },
      }
    case "UPDATE_TEXT_STYLE":
      return {
        ...state,
        textStyle: { ...state.textStyle, ...action.payload },
      }
    case "SET_ZOOM":
      return { ...state, zoom: action.payload }
    default:
      return state
  }
}

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState)

  const setActiveTool = (tool: ToolType) => {
    dispatch({ type: "SET_ACTIVE_TOOL", payload: tool })
  }

  const setSelectedObject = (id: string | null) => {
    dispatch({ type: "SET_SELECTED_OBJECT", payload: id })
  }

  const setDrawingMode = (isDrawing: boolean) => {
    dispatch({ type: "SET_DRAWING_MODE", payload: isDrawing })
  }

  const updatePenSettings = (settings: Partial<PenSettings>) => {
    dispatch({ type: "UPDATE_PEN_SETTINGS", payload: settings })
  }

  const updateTextStyle = (style: Partial<TextStyle>) => {
    dispatch({ type: "UPDATE_TEXT_STYLE", payload: style })
  }

  const setZoom = (zoom: number) => {
    dispatch({ type: "SET_ZOOM", payload: zoom })
  }

  return (
    <EditorContext.Provider
      value={{
        state,
        setActiveTool,
        setSelectedObject,
        setDrawingMode,
        updatePenSettings,
        updateTextStyle,
        setZoom,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useEditor = () => {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider")
  }
  return context
}
