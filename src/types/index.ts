export interface CanvasObject {
  id: string
  type: "image" | "sticker" | "text" | "shape" | "drawing" | "tape"
  data: any
  position: { x: number; y: number }
  scale: { x: number; y: number }
  rotation: number
  visible: boolean
  locked: boolean
}

export interface HistoryState {
  objects: CanvasObject[]
  timestamp: number
}

export interface StickerItem {
  id: string
  name: string
  url: string
  category: string
}

export interface FilterOption {
  id: string
  name: string
  type: string
  value?: number
}

export interface MaskingTape {
  id: string
  name: string
  color: string
}

export interface BackgroundOption {
  id: string
  name: string
  color: string
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: string
  color: string
  textAlign: string
  lineHeight: number
}

export interface PenSettings {
  color: string
  width: number
  opacity: number
}

export type ToolType = "select" | "pen" | "text" | "sticker" | "shape" | "tape" | "eraser"

export interface EditorState {
  activeTool: ToolType
  selectedObjectId: string | null
  isDrawing: boolean
  penSettings: PenSettings
  textStyle: TextStyle
  zoom: number
  canvasSize: { width: number; height: number }
}
