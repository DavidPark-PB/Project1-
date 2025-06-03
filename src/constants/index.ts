import type { StickerItem, FilterOption, MaskingTape, BackgroundOption } from "../types"

export const CANVAS_CONFIG = {
  WIDTH: 400,
  HEIGHT: 618,
  BACKGROUND_COLOR: "#f0f0f0",
} as const

export const STICKER_CATEGORIES = {
  HEARTS: "hearts",
  FACES: "faces",
  SHAPES: "shapes",
  OBJECTS: "objects",
} as const

// 간단한 이모지 기반 스티커로 변경 (네트워크 요청 없음)
export const STICKERS: StickerItem[] = [
  // Hearts
  {
    id: "heart-red",
    name: "빨간 하트",
    url: "❤️",
    category: STICKER_CATEGORIES.HEARTS,
  },
  {
    id: "heart-pink",
    name: "분홍 하트",
    url: "💖",
    category: STICKER_CATEGORIES.HEARTS,
  },
  {
    id: "heart-blue",
    name: "파란 하트",
    url: "💙",
    category: STICKER_CATEGORIES.HEARTS,
  },
  {
    id: "heart-purple",
    name: "보라 하트",
    url: "💜",
    category: STICKER_CATEGORIES.HEARTS,
  },
  {
    id: "heart-yellow",
    name: "노란 하트",
    url: "💛",
    category: STICKER_CATEGORIES.HEARTS,
  },
  {
    id: "heart-green",
    name: "초록 하트",
    url: "💚",
    category: STICKER_CATEGORIES.HEARTS,
  },

  // Faces
  {
    id: "smile",
    name: "웃는 얼굴",
    url: "😊",
    category: STICKER_CATEGORIES.FACES,
  },
  {
    id: "heart-eyes",
    name: "하트 눈",
    url: "😍",
    category: STICKER_CATEGORIES.FACES,
  },
  {
    id: "wink",
    name: "윙크",
    url: "😉",
    category: STICKER_CATEGORIES.FACES,
  },
  {
    id: "kiss",
    name: "키스",
    url: "😘",
    category: STICKER_CATEGORIES.FACES,
  },
  {
    id: "cute",
    name: "귀여운 얼굴",
    url: "🥰",
    category: STICKER_CATEGORIES.FACES,
  },
  {
    id: "cool",
    name: "멋진 얼굴",
    url: "😎",
    category: STICKER_CATEGORIES.FACES,
  },

  // Shapes
  {
    id: "star",
    name: "별",
    url: "⭐",
    category: STICKER_CATEGORIES.SHAPES,
  },
  {
    id: "sparkles",
    name: "반짝이",
    url: "✨",
    category: STICKER_CATEGORIES.SHAPES,
  },
  {
    id: "diamond",
    name: "다이아몬드",
    url: "💎",
    category: STICKER_CATEGORIES.SHAPES,
  },
  {
    id: "crown",
    name: "왕관",
    url: "👑",
    category: STICKER_CATEGORIES.SHAPES,
  },

  // Objects
  {
    id: "music",
    name: "음표",
    url: "🎵",
    category: STICKER_CATEGORIES.OBJECTS,
  },
  {
    id: "camera",
    name: "카메라",
    url: "📷",
    category: STICKER_CATEGORIES.OBJECTS,
  },
  {
    id: "flower",
    name: "꽃",
    url: "🌸",
    category: STICKER_CATEGORIES.OBJECTS,
  },
  {
    id: "rainbow",
    name: "무지개",
    url: "🌈",
    category: STICKER_CATEGORIES.OBJECTS,
  },
  {
    id: "balloon",
    name: "풍선",
    url: "🎈",
    category: STICKER_CATEGORIES.OBJECTS,
  },
  {
    id: "gift",
    name: "선물",
    url: "🎁",
    category: STICKER_CATEGORIES.OBJECTS,
  },
]

export const FILTERS: FilterOption[] = [
  { id: "none", name: "원본", type: "none" },
  { id: "grayscale", name: "흑백", type: "grayscale" },
  { id: "sepia", name: "세피아", type: "sepia" },
  { id: "invert", name: "반전", type: "invert" },
  { id: "blur", name: "블러", type: "blur", value: 0.5 },
  { id: "brightness", name: "밝게", type: "brightness", value: 1.2 },
  { id: "contrast", name: "대비", type: "contrast", value: 1.2 },
]

export const MASKING_TAPES: MaskingTape[] = [
  { id: "pink", name: "핑크 테이프", color: "#FFC0CB" },
  { id: "blue", name: "하늘색 테이프", color: "#ADD8E6" },
  { id: "yellow", name: "노란색 테이프", color: "#FFFF00" },
  { id: "green", name: "초록색 테이프", color: "#90EE90" },
  { id: "purple", name: "보라색 테이프", color: "#DDA0DD" },
  { id: "gray", name: "회색 테이프", color: "#CCCCCC" },
]

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: "white", name: "하얀색", color: "#FFFFFF" },
  { id: "black", name: "검정색", color: "#000000" },
  { id: "pink", name: "분홍색", color: "#FFD1DC" },
  { id: "blue", name: "하늘색", color: "#B0E0E6" },
  { id: "purple", name: "연보라", color: "#E6E6FA" },
  { id: "yellow", name: "연노랑", color: "#FFFACD" },
]

export const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
  "Trebuchet MS",
] as const

export const KEYBOARD_SHORTCUTS = {
  UNDO: "ctrl+z",
  REDO: "ctrl+y",
  DELETE: "delete",
  COPY: "ctrl+c",
  PASTE: "ctrl+v",
  SELECT_ALL: "ctrl+a",
  SAVE: "ctrl+s",
} as const
