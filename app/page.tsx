"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useMobile } from "@/hooks/use-mobile"
import {
  Menu,
  Download,
  RotateCcw,
  Settings,
  Type,
  Sticker,
  Pen,
  Square,
  CassetteTapeIcon as Tape,
  Sparkles,
  Shield,
  Copy,
  Trash2,
  RotateCw,
} from "lucide-react"
import type { HTMLImageElement } from "react"

interface CanvasElement {
  id: string
  type: "sticker" | "text" | "image" | "tape" | "shape" | "drawing" | "hologram" | "toploader"
  x: number
  y: number
  content: string
  size?: number
  color?: string
  width?: number
  height?: number
  opacity?: number
  zIndex?: number
  rotation?: number
}

export default function PhotoCardDecorator() {
  const isMobile = useMobile()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedTool, setSelectedTool] = useState<
    "image" | "sticker" | "text" | "pen" | "shape" | "tape" | "hologram" | "toploader"
  >("image")

  // 🔧 텍스트 입력을 비제어 컴포넌트로 변경
  const [textColor, setTextColor] = useState("#ffffff")
  const [textSize, setTextSize] = useState(24)
  const [isDragging, setIsDragging] = useState(false)
  const [dragElement, setDragElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [isDrawing, setIsDrawing] = useState(false)
  const [penColor, setPenColor] = useState("#000000")
  const [penSize, setPenSize] = useState(3)
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])

  const [shapeType, setShapeType] = useState<"rectangle" | "circle" | "triangle">("rectangle")
  const [shapeStyle, setShapeStyle] = useState<"transparent" | "filled" | "outline">("transparent")
  const [shapeColor, setShapeColor] = useState("#FF6B6B")

  const [tapeStyle, setTapeStyle] = useState<"horizontal" | "vertical" | "diagonal">("horizontal")
  const [tapeColor, setTapeColor] = useState("#FFB6C1")
  const [tapePattern, setTapePattern] = useState<"solid" | "striped" | "dotted" | "hearts">("solid")

  const [hologramType, setHologramType] = useState<"rainbow" | "star" | "heart" | "butterfly" | "galaxy">("rainbow")
  const [hologramOpacity, setHologramOpacity] = useState(0.6)
  const [toploaderStyle, setToploaderStyle] = useState<"clear" | "magnetic" | "uv" | "premium">("clear")

  // 🎯 새로운 상태들 - 향상된 UI/UX
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isCreatingShape, setIsCreatingShape] = useState(false)
  const [isCreatingTape, setIsCreatingTape] = useState(false) // 🎀 테이프 생성 상태 추가
  const [shapeStartPos, setShapeStartPos] = useState({ x: 0, y: 0 })
  const [tapeStartPos, setTapeStartPos] = useState({ x: 0, y: 0 }) // 🎀 테이프 시작 위치
  const [previewShape, setPreviewShape] = useState<CanvasElement | null>(null)
  const [previewTape, setPreviewTape] = useState<CanvasElement | null>(null) // 🎀 테이프 미리보기
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [copiedElement, setCopiedElement] = useState<CanvasElement | null>(null)

  // 모바일 최적화된 캔버스 크기
  const getCanvasSize = () => {
    if (isMobile) {
      const screenWidth = typeof window !== "undefined" ? window.innerWidth : 375
      const maxWidth = Math.min(screenWidth - 32, 350) // 패딩 고려
      return {
        width: maxWidth,
        height: Math.round(maxWidth * 1.5), // 3:2 비율
      }
    }
    return { width: 400, height: 600 }
  }

  const canvasSize = getCanvasSize()

  // 이모지 스티커
  const stickers = [
    "💖",
    "✨",
    "🌟",
    "💫",
    "🎀",
    "🌸",
    "💕",
    "🦋",
    "🌺",
    "💐",
    "⭐",
    "💎",
    "👑",
    "🎵",
    "📷",
    "🌈",
    "🎈",
    "🎁",
    "😊",
    "😍",
    "😘",
    "🥰",
    "😎",
    "💜",
  ]

  // 테이프 색상 프리셋
  const tapeColorPresets = [
    { name: "핑크", color: "#FFB6C1" },
    { name: "보라", color: "#DDA0DD" },
    { name: "민트", color: "#98FB98" },
    { name: "노랑", color: "#F0E68C" },
    { name: "복숭아", color: "#FFE4E1" },
    { name: "라벤더", color: "#E0E6FF" },
    { name: "골드", color: "#FFD700" },
    { name: "실버", color: "#C0C0C0" },
  ]

  // 홀로그램 타입
  const hologramTypes = [
    {
      id: "rainbow",
      name: "무지개",
      emoji: "🌈",
      colors: ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0088ff", "#8800ff"],
    },
    { id: "star", name: "별빛", emoji: "⭐", colors: ["#ffd700", "#ffff88", "#ffffff", "#88ddff"] },
    { id: "heart", name: "하트", emoji: "💖", colors: ["#ff69b4", "#ff1493", "#ffffff", "#ffb6c1"] },
    { id: "butterfly", name: "나비", emoji: "🦋", colors: ["#9370db", "#ba55d3", "#dda0dd", "#e6e6fa"] },
    { id: "galaxy", name: "은하수", emoji: "🌌", colors: ["#191970", "#4169e1", "#9370db", "#ffffff"] },
  ]

  // 탑로더 스타일
  const toploaderStyles = [
    { id: "clear", name: "투명", desc: "기본 투명 탑로더", color: "rgba(255,255,255,0.1)" },
    { id: "magnetic", name: "마그네틱", desc: "자석 잠금 탑로더", color: "rgba(200,200,200,0.2)" },
    { id: "uv", name: "UV차단", desc: "자외선 차단 탑로더", color: "rgba(255,255,0,0.1)" },
    { id: "premium", name: "프리미엄", desc: "고급 두꺼운 탑로더", color: "rgba(100,100,100,0.15)" },
  ]

  // 🌟 실제 IVE 멤버 이미지들 - 정확한 파일명으로 업데이트!
  const sampleImages = [
    {
      name: "안유진",
      url: "/images/yujinld1.jpg", // 기존 파일 유지
      color: "#FFB6C1",
      preview: "/images/yujinld1.jpg",
    },
    {
      name: "가을",
      url: "/images/gaeulsp.jpg", // ✅ 정확한 파일명
      color: "#DDA0DD",
      preview: "/images/gaeulsp.jpg",
    },
    {
      name: "장원영",
      url: "/images/wysp.jpg", // ✅ 정확한 파일명
      color: "#98FB98",
      preview: "/images/wysp.jpg",
    },
    {
      name: "리즈",
      url: "/images/lizsp.jpg", // ✅ 정확한 파일명
      color: "#F0E68C",
      preview: "/images/lizsp.jpg",
    },
    {
      name: "이서",
      url: "/images/lssp.jpg", // ✅ 정확한 파일명
      color: "#FFE4E1",
      preview: "/images/lssp.jpg",
    },
    {
      name: "레이",
      url: "/images/leisp.jpg", // ✅ 정확한 파일명
      color: "#E0E6FF",
      preview: "/images/leisp.jpg",
    },
  ]

  // 도구 목록 (모바일 최적화)
  const tools = [
    { id: "image", name: "이미지", icon: Settings, desc: "배경 이미지 추가" },
    { id: "sticker", name: "스티커", icon: Sticker, desc: "귀여운 스티커" },
    { id: "text", name: "텍스트", icon: Type, desc: "글자 추가" },
    { id: "pen", name: "펜", icon: Pen, desc: "자유롭게 그리기" },
    { id: "shape", name: "도형", icon: Square, desc: "기본 도형 추가" },
    { id: "tape", name: "테이프", icon: Tape, desc: "마스킹 테이프" },
    { id: "hologram", name: "홀로그램", icon: Sparkles, desc: "홀로그램 슬리브" },
    { id: "toploader", name: "탑로더", icon: Shield, desc: "보호 케이스" },
  ]

  // 🎯 요소 찾기 함수 개선
  const findElementAt = useCallback(
    (x: number, y: number): CanvasElement | null => {
      // 역순으로 검사 (위에 있는 요소부터)
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i]

        // 요소 경계 확인
        if (
          x >= element.x &&
          x <= element.x + (element.width || 50) &&
          y >= element.y &&
          y <= element.y + (element.height || 50)
        ) {
          return element
        }
      }
      return null
    },
    [elements],
  )

  // 🎯 리사이즈 핸들 위치 계산
  const getResizeHandles = (element: CanvasElement) => {
    const handleSize = 8
    const x = element.x
    const y = element.y
    const w = element.width || 50
    const h = element.height || 50

    return {
      nw: { x: x - handleSize / 2, y: y - handleSize / 2, cursor: "nw-resize" },
      ne: { x: x + w - handleSize / 2, y: y - handleSize / 2, cursor: "ne-resize" },
      sw: { x: x - handleSize / 2, y: y + h - handleSize / 2, cursor: "sw-resize" },
      se: { x: x + w - handleSize / 2, y: y + h - handleSize / 2, cursor: "se-resize" },
      n: { x: x + w / 2 - handleSize / 2, y: y - handleSize / 2, cursor: "n-resize" },
      s: { x: x + w / 2 - handleSize / 2, y: y + h - handleSize / 2, cursor: "s-resize" },
      w: { x: x - handleSize / 2, y: y + h / 2 - handleSize / 2, cursor: "w-resize" },
      e: { x: x + w - handleSize / 2, y: y + h / 2 - handleSize / 2, cursor: "e-resize" },
    }
  }

  // 🎯 리사이즈 핸들 감지
  const getResizeHandleAt = useCallback((x: number, y: number, element: CanvasElement): string | null => {
    const handles = getResizeHandles(element)
    const handleSize = 8

    for (const [handle, pos] of Object.entries(handles)) {
      if (x >= pos.x && x <= pos.x + handleSize && y >= pos.y && y <= pos.y + handleSize) {
        return handle
      }
    }
    return null
  }, [])

  // 텍스트 추가 함수 - 직접 DOM에서 값 읽기
  const addTextToCanvas = useCallback(() => {
    const inputElement = textInputRef.current
    if (!inputElement) return

    const text = inputElement.value.trim()
    console.log("➕ 텍스트 추가:", text) // 디버깅

    if (!text) {
      alert("텍스트를 입력해주세요!")
      return
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "text",
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      content: text,
      size: textSize,
      color: textColor,
      width: text.length * textSize * 0.6,
      height: textSize + 10,
      zIndex: 10,
    }

    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)

    // 입력 필드 초기화
    inputElement.value = ""

    // 포커스 유지
    setTimeout(() => {
      inputElement.focus()
    }, 50)
  }, [textSize, textColor, canvasSize])

  // Enter 키 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        addTextToCanvas()
      }
    },
    [addTextToCanvas],
  )

  // 미리보기 업데이트 함수 - DOM에서 직접 읽기
  const updatePreview = useCallback(() => {
    const inputElement = textInputRef.current
    const previewElement = document.getElementById("text-preview")

    if (inputElement && previewElement) {
      const value = inputElement.value || "텍스트를 입력하세요"
      previewElement.textContent = value
    }
  }, [])

  // 홀로그램 효과 그리기 함수
  const drawHologram = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (!element.content) return

    const hologramData = JSON.parse(element.content)
    const { type, opacity } = hologramData
    const hologramInfo = hologramTypes.find((h) => h.id === type)

    if (!hologramInfo) return

    ctx.save()
    ctx.globalAlpha = opacity || 0.6

    // 홀로그램 베이스
    const gradient = ctx.createLinearGradient(
      element.x,
      element.y,
      element.x + (element.width || canvasSize.width),
      element.y + (element.height || canvasSize.width),
    )

    hologramInfo.colors.forEach((color, index) => {
      gradient.addColorStop(index / (hologramInfo.colors.length - 1), color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(element.x, element.y, element.width || canvasSize.width, element.height || canvasSize.height)

    // 홀로그램 패턴
    ctx.globalCompositeOperation = "overlay"

    if (type === "rainbow") {
      for (let i = 0; i < (element.width || canvasSize.width); i += 20) {
        const hue = (i / (element.width || canvasSize.width)) * 360
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.3)`
        ctx.fillRect(element.x + i, element.y, 10, element.height || canvasSize.height)
      }
    } else if (type === "star") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
      for (let x = element.x; x < element.x + (element.width || canvasSize.width); x += 40) {
        for (let y = element.y; y < element.y + (element.height || canvasSize.height); y += 40) {
          ctx.font = "20px Arial"
          ctx.fillText("✦", x, y)
        }
      }
    }

    ctx.restore()
  }

  // 탑로더 그리기 함수
  const drawToploader = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (!element.content) return

    const toploaderData = JSON.parse(element.content)
    const { style } = toploaderData
    const styleInfo = toploaderStyles.find((s) => s.id === style)

    if (!styleInfo) return

    ctx.save()

    const width = element.width || canvasSize.width + 20
    const height = element.height || canvasSize.height + 20

    // 탑로더 외곽선
    ctx.strokeStyle = "rgba(200, 200, 200, 0.8)"
    ctx.lineWidth = 2
    ctx.strokeRect(element.x, element.y, width, height)

    // 탑로더 배경
    ctx.fillStyle = styleInfo.color
    ctx.fillRect(element.x, element.y, width, height)

    ctx.restore()
  }

  // 🎀 테이프 그리기 함수 (향상된 버전)
  const drawTape = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (!element.content) return

    const tapeData = JSON.parse(element.content)
    const { style, color, pattern } = tapeData

    ctx.save()

    // 회전 적용
    if (element.rotation) {
      const centerX = element.x + (element.width || 150) / 2
      const centerY = element.y + (element.height || 30) / 2
      ctx.translate(centerX, centerY)
      ctx.rotate((element.rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
    }

    const x = element.x
    const y = element.y
    const width = element.width || 150
    const height = element.height || 30

    // 테이프 베이스
    ctx.fillStyle = color || "#FFB6C1"
    ctx.fillRect(x, y, width, height)

    // 패턴 적용
    if (pattern === "striped") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      for (let i = 0; i < width; i += 10) {
        ctx.fillRect(x + i, y, 5, height)
      }
    } else if (pattern === "dotted") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
      for (let i = 10; i < width; i += 20) {
        for (let j = 5; j < height; j += 15) {
          ctx.beginPath()
          ctx.arc(x + i, y + j, 3, 0, 2 * Math.PI)
          ctx.fill()
        }
      }
    } else if (pattern === "hearts") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      for (let i = 15; i < width; i += 30) {
        ctx.fillText("💖", x + i, y + height / 2 + 4)
      }
    }

    // 테이프 하이라이트
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
    ctx.fillRect(x, y, width, 3)

    // 테이프 그림자
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
    ctx.fillRect(x + 2, y + height - 3, width, 3)

    ctx.restore()
  }

  // 🎯 선택 테두리와 리사이즈 핸들 그리기
  const drawSelectionBorder = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.save()

    const x = element.x
    const y = element.y
    const w = element.width || 50
    const h = element.height || 50

    // 선택 테두리
    ctx.strokeStyle = "#7c3aed"
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(x - 2, y - 2, w + 4, h + 4)

    // 리사이즈 핸들
    ctx.fillStyle = "#7c3aed"
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1
    ctx.setLineDash([])

    const handles = getResizeHandles(element)
    const handleSize = 8

    Object.values(handles).forEach((handle) => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
    })

    // 🔄 회전 핸들 (도형, 텍스트, 테이프에만) - 더 크고 명확하게
    if (element.type === "shape" || element.type === "text" || element.type === "tape") {
      const rotateHandleX = x + w / 2
      const rotateHandleY = y - 15 // 위치 조정

      // 회전 핸들 배경 (더 큰 클릭 영역)
      ctx.fillStyle = "#10b981"
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(rotateHandleX, rotateHandleY, 12, 0, 2 * Math.PI) // 반지름을 12로 증가
      ctx.fill()
      ctx.stroke()

      // 회전 아이콘
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("↻", rotateHandleX, rotateHandleY)

      // 연결선 (회전 핸들과 요소 연결)
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(x + w / 2, y)
      ctx.lineTo(rotateHandleX, rotateHandleY)
      ctx.stroke()
    }

    ctx.restore()
  }

  // 캔버스 렌더링
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 🔧 그리기 중일 때는 전체 렌더링 건너뛰기
    if (isDrawing) return

    // 캔버스 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#f3e8ff")
    gradient.addColorStop(0.5, "#e9d5ff")
    gradient.addColorStop(1, "#ddd6fe")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 배경 이미지가 있으면 그리기
    if (backgroundImage) {
      const scale = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height)
      const x = (canvas.width - backgroundImage.width * scale) / 2
      const y = (canvas.height - backgroundImage.height * scale) / 2
      ctx.drawImage(backgroundImage, x, y, backgroundImage.width * scale, backgroundImage.height * scale)
    }

    // Z-index 순서로 정렬하여 그리기
    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

    // 미리보기 도형 그리기
    if (previewShape) {
      ctx.save()
      ctx.globalAlpha = 0.5
      drawShape(ctx, previewShape)
      ctx.restore()
    }

    // 🎀 미리보기 테이프 그리기
    if (previewTape) {
      ctx.save()
      ctx.globalAlpha = 0.5
      drawTape(ctx, previewTape)
      ctx.restore()
    }

    sortedElements.forEach((element) => {
      ctx.save()

      // 회전 적용
      if (element.rotation) {
        const centerX = element.x + (element.width || 50) / 2
        const centerY = element.y + (element.height || 50) / 2
        ctx.translate(centerX, centerY)
        ctx.rotate((element.rotation * Math.PI) / 180)
        ctx.translate(-centerX, -centerY)
      }

      switch (element.type) {
        case "toploader":
          drawToploader(ctx, element)
          break

        case "hologram":
          drawHologram(ctx, element)
          break

        case "sticker":
          ctx.font = `${element.size || 40}px Arial`
          ctx.textAlign = "center"
          ctx.fillText(element.content, element.x + (element.width || 40) / 2, element.y + (element.height || 40) / 2)
          break

        case "text":
          ctx.font = `bold ${element.size || 24}px Arial`
          ctx.fillStyle = element.color || "#ffffff"
          ctx.strokeStyle = "#000000"
          ctx.lineWidth = 3
          ctx.textAlign = "center"
          const textX = element.x + (element.width || 100) / 2
          const textY = element.y + (element.height || 30) / 2
          ctx.strokeText(element.content, textX, textY)
          ctx.fillText(element.content, textX, textY)
          break

        case "tape":
          drawTape(ctx, element)
          break

        case "shape":
          drawShape(ctx, element)
          break

        case "drawing":
          if (element.content) {
            try {
              const drawingData = JSON.parse(element.content)
              const path = drawingData.path

              if (path && path.length > 1) {
                ctx.strokeStyle = drawingData.color || "#000000"
                ctx.lineWidth = drawingData.size || 3
                ctx.lineCap = "round"
                ctx.lineJoin = "round"

                ctx.beginPath()
                ctx.moveTo(path[0].x, path[0].y)

                for (let i = 1; i < path.length; i++) {
                  ctx.lineTo(path[i].x, path[i].y)
                }
                ctx.stroke()
              }
            } catch (error) {
              console.error("Error rendering drawing:", error)
            }
          }
          break
      }

      ctx.restore()

      // 선택된 요소에 테두리와 핸들 그리기
      if (selectedElement === element.id) {
        drawSelectionBorder(ctx, element)
      }
    })
  }, [elements, backgroundImage, canvasSize, isDrawing, previewShape, previewTape, selectedElement])

  // 🎯 도형 그리기 함수
  const drawShape = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (!element.content) return

    const shapeData = JSON.parse(element.content)
    const { type, style, color } = shapeData

    if (style === "filled") {
      ctx.fillStyle = color || "#FF6B6B"
    } else if (style === "outline") {
      ctx.strokeStyle = color || "#FF6B6B"
      ctx.lineWidth = 3
    } else if (style === "transparent") {
      ctx.fillStyle = color || "#FF6B6B"
      ctx.globalAlpha = 0.3
    }

    const x = element.x
    const y = element.y
    const w = element.width || 100
    const h = element.height || 60

    if (type === "rectangle") {
      if (style === "filled" || style === "transparent") {
        ctx.fillRect(x, y, w, h)
      } else if (style === "outline") {
        ctx.strokeRect(x, y, w, h)
      }
    } else if (type === "circle") {
      ctx.beginPath()
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, 2 * Math.PI)
      if (style === "filled" || style === "transparent") {
        ctx.fill()
      } else if (style === "outline") {
        ctx.stroke()
      }
    } else if (type === "triangle") {
      const centerX = x + w / 2
      const topY = y
      const bottomY = y + h
      const leftX = x
      const rightX = x + w

      ctx.beginPath()
      ctx.moveTo(centerX, topY)
      ctx.lineTo(leftX, bottomY)
      ctx.lineTo(rightX, bottomY)
      ctx.closePath()

      if (style === "filled" || style === "transparent") {
        ctx.fill()
      } else if (style === "outline") {
        ctx.stroke()
      }
    }

    // 투명도 초기화
    ctx.globalAlpha = 1
  }

  // 터치 이벤트 처리 (모바일 최적화)
  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0] || e.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const { x, y } = getTouchPos(e)

    if (selectedTool === "pen") {
      setIsDrawing(true)
      setCurrentPath([{ x, y }])
    } else if (selectedTool === "shape") {
      setIsCreatingShape(true)
      setShapeStartPos({ x, y })
    } else if (selectedTool === "tape") {
      // 🎀 테이프 생성 시작
      setIsCreatingTape(true)
      setTapeStartPos({ x, y })
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing || selectedTool !== "pen") return

    const { x, y } = getTouchPos(e)
    const newPath = [...currentPath, { x, y }]
    setCurrentPath(newPath)

    // 🔧 실시간 그리기 개선
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (ctx && currentPath.length > 0) {
      ctx.strokeStyle = penColor
      ctx.lineWidth = penSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // 마지막 두 점만 연결하여 부드러운 그리기
      const prevPoint = currentPath[currentPath.length - 1]
      ctx.beginPath()
      ctx.moveTo(prevPoint.x, prevPoint.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    if (selectedTool === "pen" && isDrawing && currentPath.length > 1) {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: "drawing",
        x: 0,
        y: 0,
        content: JSON.stringify({
          path: currentPath,
          color: penColor,
          size: penSize,
        }),
        zIndex: 12,
      }
      setElements((prev) => [...prev, newElement])
      setCurrentPath([])

      // 🔧 그리기가 끝났을 때 전체 캔버스 다시 렌더링
      setTimeout(() => {
        renderCanvas()
      }, 10)
    }

    setIsDrawing(false)
  }

  // 🔧 도형 추가 함수
  const addShape = useCallback(() => {
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "shape",
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 30,
      content: JSON.stringify({
        type: shapeType,
        style: shapeStyle,
        color: shapeColor,
      }),
      width: shapeType === "circle" ? 80 : 100,
      height: shapeType === "circle" ? 80 : shapeType === "triangle" ? 80 : 60,
      zIndex: 10,
    }
    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)
  }, [shapeType, shapeStyle, shapeColor, canvasSize])

  // 🎀 테이프 추가 함수 (향상된 버전)
  const addTape = useCallback(() => {
    let width = 150
    let height = 30

    if (tapeStyle === "vertical") {
      width = 30
      height = 150
    }

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: "tape",
      x: canvasSize.width / 2 - width / 2,
      y: canvasSize.height / 2 - height / 2,
      content: JSON.stringify({
        style: tapeStyle,
        color: tapeColor,
        pattern: tapePattern,
      }),
      width,
      height,
      zIndex: 8,
    }
    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)
  }, [tapeStyle, tapeColor, tapePattern, canvasSize])

  // 🎯 요소 복사 함수
  const copyElement = useCallback(() => {
    if (!selectedElement) return

    const element = elements.find((el) => el.id === selectedElement)
    if (element) {
      setCopiedElement({ ...element })
    }
  }, [selectedElement, elements])

  // 🎯 요소 붙여넣기 함수
  const pasteElement = useCallback(() => {
    if (!copiedElement) return

    const newElement: CanvasElement = {
      ...copiedElement,
      id: Date.now().toString(),
      x: copiedElement.x + 20,
      y: copiedElement.y + 20,
    }

    setElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)
  }, [copiedElement])

  // 🎯 요소 삭제 함수
  const deleteElement = useCallback(() => {
    if (!selectedElement) return

    setElements((prev) => prev.filter((el) => el.id !== selectedElement))
    setSelectedElement(null)
  }, [selectedElement])

  // 🎯 요소 회전 함수 (개선된 버전)
  const rotateElement = useCallback(() => {
    if (!selectedElement) return

    setElements((prev) =>
      prev.map((el) => {
        if (el.id === selectedElement) {
          const newRotation = (el.rotation || 0) + 15
          return { ...el, rotation: newRotation >= 360 ? newRotation - 360 : newRotation }
        }
        return el
      }),
    )
  }, [selectedElement])

  // 캔버스 클릭/터치 처리
  const handleCanvasInteraction = (x: number, y: number) => {
    if (selectedTool === "text") {
      const inputElement = textInputRef.current
      if (inputElement && inputElement.value.trim()) {
        const text = inputElement.value.trim()
        const newElement: CanvasElement = {
          id: Date.now().toString(),
          type: "text",
          x: x - 50,
          y: y - 15,
          content: text,
          size: textSize,
          color: textColor,
          width: text.length * textSize * 0.6,
          height: textSize + 10,
          zIndex: 10,
        }
        setElements((prev) => [...prev, newElement])
        setSelectedElement(newElement.id)
        inputElement.value = ""
      }
    } else if (selectedTool === "hologram") {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: "hologram",
        x: 0,
        y: 0,
        content: JSON.stringify({
          type: hologramType,
          opacity: hologramOpacity,
        }),
        width: canvasSize.width,
        height: canvasSize.height,
        zIndex: 5,
      }
      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
    } else if (selectedTool === "toploader") {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: "toploader",
        x: -10,
        y: -10,
        content: JSON.stringify({
          style: toploaderStyle,
        }),
        width: canvasSize.width + 20,
        height: canvasSize.height + 20,
        zIndex: 20,
      }
      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 요소 선택 확인
    const clickedElement = findElementAt(x, y)
    if (clickedElement) {
      setSelectedElement(clickedElement.id)
      return
    }

    // 빈 공간 클릭 시 선택 해제
    setSelectedElement(null)

    // 도구별 처리
    handleCanvasInteraction(x, y)
  }

  // 🎯 마우스 드래그 처리 (향상된 버전)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      console.log("마우스 클릭:", { x, y }) // 디버깅

      if (selectedTool === "pen") {
        setIsDrawing(true)
        setCurrentPath([{ x, y }])
        return
      }

      if (selectedTool === "shape") {
        setIsCreatingShape(true)
        setShapeStartPos({ x, y })
        return
      }

      // 🎀 테이프 생성 시작
      if (selectedTool === "tape") {
        setIsCreatingTape(true)
        setTapeStartPos({ x, y })
        return
      }

      // 선택된 요소가 있는지 확인
      if (selectedElement) {
        const element = elements.find((el) => el.id === selectedElement)
        if (element) {
          // 🔄 회전 핸들 확인 (도형, 텍스트, 테이프에만) - 가장 먼저 체크
          if (element.type === "shape" || element.type === "text" || element.type === "tape") {
            const w = element.width || 50
            const rotateHandleX = element.x + w / 2
            const rotateHandleY = element.y - 15 // 핸들 중심점
            const distance = Math.sqrt((x - rotateHandleX) ** 2 + (y - rotateHandleY) ** 2)

            console.log("회전 핸들 체크:", {
              elementX: element.x,
              elementY: element.y,
              elementWidth: w,
              rotateHandleX,
              rotateHandleY,
              clickX: x,
              clickY: y,
              distance,
            }) // 디버깅

            if (distance <= 15) {
              // 클릭 영역을 더 크게
              console.log("🔄 회전 핸들 클릭됨!") // 디버깅
              rotateElement()
              return // 여기서 함수 종료
            }
          }

          // 리사이즈 핸들 확인
          const handle = getResizeHandleAt(x, y, element)
          if (handle) {
            console.log("리사이즈 핸들 클릭:", handle) // 디버깅
            setIsResizing(true)
            setResizeHandle(handle)
            return
          }
        }
      }

      // 요소 드래그 시작
      const clickedElement = findElementAt(x, y)
      if (clickedElement) {
        console.log("요소 선택:", clickedElement.id) // 디버깅
        setSelectedElement(clickedElement.id)
        setIsDragging(true)
        setDragElement(clickedElement.id)
        setDragOffset({
          x: x - clickedElement.x,
          y: y - clickedElement.y,
        })
      } else {
        console.log("빈 공간 클릭") // 디버깅
        setSelectedElement(null)
      }
    },
    [elements, selectedTool, selectedElement, findElementAt, getResizeHandleAt, rotateElement],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 커서 스타일 업데이트
      let cursor = "default"

      if (selectedTool === "pen") {
        cursor = "crosshair"
      } else if (selectedTool === "shape" || selectedTool === "tape") {
        cursor = "crosshair"
      } else if (selectedElement) {
        const element = elements.find((el) => el.id === selectedElement)
        if (element) {
          const handle = getResizeHandleAt(x, y, element)
          if (handle) {
            const handles = getResizeHandles(element)
            cursor = handles[handle as keyof typeof handles].cursor
          } else if (findElementAt(x, y)) {
            cursor = "move"
          }
        }
      } else if (findElementAt(x, y)) {
        cursor = "pointer"
      }

      canvas.style.cursor = cursor

      if (selectedTool === "pen" && isDrawing) {
        const newPath = [...currentPath, { x, y }]
        setCurrentPath(newPath)

        // 🔧 실시간 그리기 개선
        const ctx = canvas.getContext("2d")
        if (ctx && currentPath.length > 0) {
          ctx.strokeStyle = penColor
          ctx.lineWidth = penSize
          ctx.lineCap = "round"
          ctx.lineJoin = "round"

          // 마지막 두 점만 연결하여 부드러운 그리기
          const prevPoint = currentPath[currentPath.length - 1]
          ctx.beginPath()
          ctx.moveTo(prevPoint.x, prevPoint.y)
          ctx.lineTo(x, y)
          ctx.stroke()
        }
        return
      }

      // 🎯 도형 생성 중 미리보기
      if (selectedTool === "shape" && isCreatingShape) {
        const width = Math.abs(x - shapeStartPos.x)
        const height = Math.abs(y - shapeStartPos.y)
        const startX = Math.min(x, shapeStartPos.x)
        const startY = Math.min(y, shapeStartPos.y)

        setPreviewShape({
          id: "preview",
          type: "shape",
          x: startX,
          y: startY,
          width: Math.max(width, 10),
          height: Math.max(height, 10),
          content: JSON.stringify({
            type: shapeType,
            style: shapeStyle,
            color: shapeColor,
          }),
          zIndex: 999,
        })
        return
      }

      // 🎀 테이프 생성 중 미리보기
      if (selectedTool === "tape" && isCreatingTape) {
        let width = Math.abs(x - tapeStartPos.x)
        let height = Math.abs(y - tapeStartPos.y)
        const startX = Math.min(x, tapeStartPos.x)
        const startY = Math.min(y, tapeStartPos.y)

        // 테이프 스타일에 따른 최소 크기 조정
        if (tapeStyle === "horizontal") {
          width = Math.max(width, 50)
          height = Math.max(height, 10)
        } else if (tapeStyle === "vertical") {
          width = Math.max(width, 10)
          height = Math.max(height, 50)
        } else {
          // diagonal
          width = Math.max(width, 30)
          height = Math.max(height, 30)
        }

        setPreviewTape({
          id: "preview-tape",
          type: "tape",
          x: startX,
          y: startY,
          width,
          height,
          content: JSON.stringify({
            style: tapeStyle,
            color: tapeColor,
            pattern: tapePattern,
          }),
          zIndex: 999,
        })
        return
      }

      // 리사이징
      if (isResizing && selectedElement && resizeHandle) {
        setElements((prev) =>
          prev.map((element) => {
            if (element.id !== selectedElement) return element

            const newElement = { ...element }
            const originalX = element.x
            const originalY = element.y
            const originalWidth = element.width || 50
            const originalHeight = element.height || 50

            switch (resizeHandle) {
              case "nw":
                newElement.width = originalX + originalWidth - x
                newElement.height = originalY + originalHeight - y
                newElement.x = x
                newElement.y = y
                break
              case "ne":
                newElement.width = x - originalX
                newElement.height = originalY + originalHeight - y
                newElement.y = y
                break
              case "se":
                newElement.width = x - originalX
                newElement.height = y - originalY
                break
              case "sw":
                newElement.width = originalX + originalWidth - x
                newElement.height = y - originalY
                newElement.x = x
                break
              case "n":
                newElement.height = originalY + originalHeight - y
                newElement.y = y
                break
              case "e":
                newElement.width = x - originalX
                break
              case "s":
                newElement.height = y - originalY
                break
              case "w":
                newElement.width = originalX + originalWidth - x
                newElement.x = x
                break
            }

            // 최소 크기 제한
            if ((newElement.width || 0) < 10) {
              newElement.width = 10
              if (resizeHandle.includes("w")) {
                newElement.x = originalX + originalWidth - 10
              }
            }
            if ((newElement.height || 0) < 10) {
              newElement.height = 10
              if (resizeHandle.includes("n")) {
                newElement.y = originalY + originalHeight - 10
              }
            }

            return newElement
          }),
        )
        return
      }

      // 요소 드래그
      if (!isDragging || !dragElement) return

      setElements((prev) =>
        prev.map((element) =>
          element.id === dragElement ? { ...element, x: x - dragOffset.x, y: y - dragOffset.y } : element,
        ),
      )
    },
    [
      isDragging,
      dragElement,
      dragOffset,
      selectedTool,
      isDrawing,
      currentPath,
      penColor,
      penSize,
      isCreatingShape,
      isCreatingTape,
      shapeStartPos,
      tapeStartPos,
      shapeType,
      shapeStyle,
      shapeColor,
      tapeStyle,
      tapeColor,
      tapePattern,
      isResizing,
      selectedElement,
      resizeHandle,
      elements,
      findElementAt,
      getResizeHandleAt,
    ],
  )

  const handleMouseUp = useCallback(() => {
    if (selectedTool === "pen" && isDrawing && currentPath.length > 1) {
      // 그린 경로를 요소로 저장
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: "drawing",
        x: 0,
        y: 0,
        content: JSON.stringify({
          path: currentPath,
          color: penColor,
          size: penSize,
        }),
        zIndex: 12,
      }
      setElements((prev) => [...prev, newElement])
      setCurrentPath([])

      // 🔧 그리기가 끝났을 때 전체 캔버스 다시 렌더링
      setTimeout(() => {
        renderCanvas()
      }, 10)
    }

    // 🎯 도형 생성 완료
    if (selectedTool === "shape" && isCreatingShape && previewShape) {
      const newElement: CanvasElement = {
        ...previewShape,
        id: Date.now().toString(),
        zIndex: 10,
      }
      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
      setPreviewShape(null)
    }

    // 🎀 테이프 생성 완료
    if (selectedTool === "tape" && isCreatingTape && previewTape) {
      const newElement: CanvasElement = {
        ...previewTape,
        id: Date.now().toString(),
        zIndex: 8,
      }
      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
      setPreviewTape(null)
    }

    setIsDrawing(false)
    setIsDragging(false)
    setDragElement(null)
    setDragOffset({ x: 0, y: 0 })
    setIsCreatingShape(false)
    setIsCreatingTape(false)
    setIsResizing(false)
    setResizeHandle(null)
  }, [
    selectedTool,
    isDrawing,
    currentPath,
    penColor,
    penSize,
    renderCanvas,
    isCreatingShape,
    isCreatingTape,
    previewShape,
    previewTape,
  ])

  // 이미지 업로드
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setBackgroundImage(img)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  // 🌟 실제 IVE 멤버 이미지 로드 (향상된 에러 처리)
  const loadSampleImage = useCallback((sample: any) => {
    console.log(`🔄 ${sample.name} 이미지 로드 시도:`, sample.url)

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      console.log(`✅ ${sample.name} 이미지 로드 성공!`)
      setBackgroundImage(img)
    }

    img.onerror = (error) => {
      console.error(`❌ ${sample.name} 이미지 로드 실패:`, sample.url, error)
      console.log(`🔄 ${sample.name} 샘플 이미지 생성 중...`)
      // 실제 이미지 로드 실패 시 샘플 이미지 생성
      createSampleImage(sample.name, sample.color)
    }

    // 이미지 로드 시도
    img.src = sample.url
  }, [])

  // 스티커 추가
  const addSticker = useCallback(
    (sticker: string) => {
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: "sticker",
        x: canvasSize.width / 2 - 20,
        y: canvasSize.height / 2 - 20,
        content: sticker,
        size: 40,
        width: 40,
        height: 40,
        zIndex: 10,
      }
      setElements((prev) => [...prev, newElement])
      setSelectedElement(newElement.id)
    },
    [canvasSize],
  )

  // 캔버스 초기화
  const clearCanvas = useCallback(() => {
    setElements([])
    setBackgroundImage(null)
    setSelectedElement(null)
  }, [])

  // 이미지 다운로드
  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (isMobile) {
      // 모바일에서는 새 탭에서 이미지 열기
      const dataURL = canvas.toDataURL("image/png", 1.0)
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`<img src="${dataURL}" style="max-width: 100%; height: auto;" />`)
      }
    } else {
      // 데스크톱에서는 다운로드
      const link = document.createElement("a")
      link.download = "ive-photocard-premium.png"
      link.href = canvas.toDataURL()
      link.click()
    }
  }, [isMobile])

  // 샘플 이미지 생성 (fallback용)
  const createSampleImage = useCallback((name: string, color: string) => {
    const canvas = document.createElement("canvas")
    canvas.width = 300
    canvas.height = 400
    const ctx = canvas.getContext("2d")

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, "#ffffff")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 300, 400)

      ctx.fillStyle = "#333"
      ctx.font = "bold 32px Arial"
      ctx.textAlign = "center"
      ctx.fillText(name, 150, 180)

      ctx.font = "20px Arial"
      ctx.fillText("IVE Member", 150, 210)

      ctx.fillStyle = "#ffffff"
      ctx.font = "60px Arial"
      ctx.fillText("✨", 80, 120)
      ctx.fillText("💖", 220, 120)
      ctx.fillText("🌟", 150, 320)
    }

    const img = new Image()
    img.onload = () => {
      setBackgroundImage(img)
    }
    img.src = canvas.toDataURL()
  }, [])

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "c":
            e.preventDefault()
            copyElement()
            break
          case "v":
            e.preventDefault()
            pasteElement()
            break
          case "z":
            e.preventDefault()
            // TODO: 실행 취소 기능
            break
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteElement()
      } else if (e.key === "r" && selectedElement) {
        e.preventDefault()
        rotateElement()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [copyElement, pasteElement, deleteElement, rotateElement, selectedElement])

  // 렌더링
  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // 모바일 도구 패널 컴포넌트
  const ToolPanel = () => (
    <div className="space-y-4">
      {selectedTool === "image" && (
        <div className="space-y-4">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <Button onClick={() => fileInputRef.current?.click()} className="hidden" />

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12"
          >
            📁 내 파일에서 선택
          </Button>

          <div className="space-y-3">
            <p className="text-sm font-medium text-purple-700">🌟 IVE 멤버 이미지:</p>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((sample) => (
                <Button
                  key={sample.name}
                  variant="outline"
                  onClick={() => loadSampleImage(sample)}
                  className="h-20 p-2 border-purple-200 hover:bg-purple-50 flex flex-col items-center"
                >
                  <div className="w-12 h-14 rounded mb-1 overflow-hidden border border-purple-200">
                    <img
                      src={sample.preview || "/placeholder.svg"}
                      alt={sample.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log(`📷 ${sample.name} 썸네일 로드 실패, 색상 배경으로 대체`)
                        // 이미지 로드 실패 시 색상 배경으로 대체
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        const parent = target.parentElement
                        if (parent) {
                          parent.style.backgroundColor = sample.color
                          parent.innerHTML = `<span class="text-xs font-bold text-white">${sample.name}</span>`
                          parent.style.display = "flex"
                          parent.style.alignItems = "center"
                          parent.style.justifyContent = "center"
                        }
                      }}
                      onLoad={() => {
                        console.log(`✅ ${sample.name} 썸네일 로드 성공`)
                      }}
                    />
                  </div>
                  <span className="text-xs text-purple-700 font-medium">{sample.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTool === "sticker" && (
        <div className="space-y-4">
          <h3 className="font-bold text-purple-800">😊 스티커</h3>
          <div className="grid grid-cols-6 gap-2">
            {stickers.map((sticker, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => addSticker(sticker)}
                className="text-2xl p-2 h-12 border-purple-200 hover:bg-purple-50"
              >
                {sticker}
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedTool === "text" && (
        <div className="space-y-4">
          <h3 className="font-bold text-purple-800">📝 텍스트</h3>

          <div className="space-y-3">
            <div className="relative">
              <input
                ref={textInputRef}
                type="text"
                onInput={updatePreview}
                onKeyDown={handleKeyDown}
                placeholder="여기에 텍스트를 입력하세요..."
                className="w-full p-4 text-lg border-2 border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                autoComplete="off"
                spellCheck="false"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            <Button
              onClick={addTextToCanvas}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-medium"
            >
              ✏️ 텍스트 추가하기
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">크기: {textSize}px</label>
            <Slider
              value={[textSize]}
              onValueChange={(value) => setTextSize(value[0])}
              min={12}
              max={48}
              step={2}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">색상</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full h-12 border border-purple-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* 텍스트 미리보기 - DOM 기반 */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-2">미리보기:</p>
            <div
              id="text-preview"
              style={{
                fontSize: `${Math.min(textSize, 24)}px`,
                color: textColor,
                fontWeight: "bold",
                textAlign: "center",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                minHeight: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              텍스트를 입력하세요
            </div>
          </div>
        </div>
      )}

      {selectedTool === "pen" && (
        <div className="space-y-4">
          <h3 className="font-bold text-purple-800">✏️ 펜 도구</h3>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">색상</label>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="w-full h-12 border border-purple-200 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">굵기: {penSize}px</label>
            <Slider
              value={[penSize]}
              onValueChange={(value) => setPenSize(value[0])}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600">💡 화면을 터치하여 자유롭게 그려보세요!</p>
          </div>
        </div>
      )}

      {selectedTool === "hologram" && (
        <div className="space-y-4">
          <h3 className="font-bold text-purple-800">✨ 홀로그램 슬리브</h3>
          <div className="space-y-2">
            {hologramTypes.map((type) => (
              <Button
                key={type.id}
                variant={hologramType === type.id ? "default" : "outline"}
                onClick={() => setHologramType(type.id as any)}
                className={`w-full justify-start h-12 ${
                  hologramType === type.id ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <span className="text-lg mr-2">{type.emoji}</span>
                <span>{type.name}</span>
              </Button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">
              투명도: {Math.round(hologramOpacity * 100)}%
            </label>
            <Slider
              value={[hologramOpacity]}
              onValueChange={(value) => setHologramOpacity(value[0])}
              min={0.1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      )}

      {selectedTool === "toploader" && (
        <div className="space-y-4">
          <h3 className="font-bold text-purple-800">🛡️ 탑로더</h3>
          <div className="space-y-2">
            {toploaderStyles.map((style) => (
              <Button
                key={style.id}
                variant={toploaderStyle === style.id ? "default" : "outline"}
                onClick={() => setToploaderStyle(style.id as any)}
                className={`w-full justify-start h-auto p-3 ${
                  toploaderStyle === style.id ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{style.name}</div>
                  <div className="text-xs opacity-70">{style.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {selectedTool === "shape" && (
        <div className="space-y-4">
          <h3 className="font-bold text-purple-800">🔷 도형</h3>

          {/* 도형 종류 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-700 mb-2">도형 종류</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={shapeType === "rectangle" ? "default" : "outline"}
                onClick={() => setShapeType("rectangle")}
                className={`h-12 ${
                  shapeType === "rectangle" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                ⬜ 사각형
              </Button>
              <Button
                variant={shapeType === "circle" ? "default" : "outline"}
                onClick={() => setShapeType("circle")}
                className={`h-12 ${
                  shapeType === "circle" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                ⭕ 원
              </Button>
              <Button
                variant={shapeType === "triangle" ? "default" : "outline"}
                onClick={() => setShapeType("triangle")}
                className={`h-12 ${
                  shapeType === "triangle" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                🔺 삼각형
              </Button>
            </div>
          </div>

          {/* 도형 스타일 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-700 mb-2">스타일</label>
            <div className="space-y-2">
              <Button
                variant={shapeStyle === "filled" ? "default" : "outline"}
                onClick={() => setShapeStyle("filled")}
                className={`w-full justify-start h-12 ${
                  shapeStyle === "filled" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <div className="w-6 h-6 bg-purple-400 rounded mr-2"></div>
                채워진 도형
              </Button>
              <Button
                variant={shapeStyle === "outline" ? "default" : "outline"}
                onClick={() => setShapeStyle("outline")}
                className={`w-full justify-start h-12 ${
                  shapeStyle === "outline" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <div className="w-6 h-6 border-2 border-purple-400 rounded mr-2"></div>
                외곽선만
              </Button>
              <Button
                variant={shapeStyle === "transparent" ? "default" : "outline"}
                onClick={() => setShapeStyle("transparent")}
                className={`w-full justify-start h-12 ${
                  shapeStyle === "transparent" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <div className="w-6 h-6 border-2 border-purple-400 rounded mr-2 bg-white/50"></div>
                투명 도형
              </Button>
            </div>
          </div>

          {/* 색상 선택 */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">색상</label>
            <input
              type="color"
              value={shapeColor}
              onChange={(e) => setShapeColor(e.target.value)}
              className="w-full h-12 border border-purple-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* 도형 추가 버튼 */}
          <Button
            onClick={addShape}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-medium"
          >
            🔷 도형 추가하기
          </Button>

          {/* 🎯 향상된 사용 팁 */}
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-medium mb-2">💡 사용 방법:</p>
            <ul className="text-xs text-purple-600 space-y-1">
              <li>• 마우스로 드래그하여 크기 조절</li>
              <li>• 모서리 핸들로 리사이즈</li>
              <li>• 회전 핸들로 각도 조절</li>
              <li>• Ctrl+C/V로 복사/붙여넣기</li>
              <li>• Delete키로 삭제</li>
            </ul>
          </div>
        </div>
      )}

      {selectedTool === "tape" && (
        <div className="space-y-4">
          <h3 className="font-bold text-purple-800">🎀 마스킹 테이프</h3>

          {/* 테이프 스타일 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-700 mb-2">방향</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={tapeStyle === "horizontal" ? "default" : "outline"}
                onClick={() => setTapeStyle("horizontal")}
                className={`h-12 ${
                  tapeStyle === "horizontal" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                ➖ 가로
              </Button>
              <Button
                variant={tapeStyle === "vertical" ? "default" : "outline"}
                onClick={() => setTapeStyle("vertical")}
                className={`h-12 ${
                  tapeStyle === "vertical" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                ➖ 세로
              </Button>
              <Button
                variant={tapeStyle === "diagonal" ? "default" : "outline"}
                onClick={() => setTapeStyle("diagonal")}
                className={`h-12 ${
                  tapeStyle === "diagonal" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                ↗️ 대각선
              </Button>
            </div>
          </div>

          {/* 테이프 패턴 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-700 mb-2">패턴</label>
            <div className="space-y-2">
              <Button
                variant={tapePattern === "solid" ? "default" : "outline"}
                onClick={() => setTapePattern("solid")}
                className={`w-full justify-start h-12 ${
                  tapePattern === "solid" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <div className="w-8 h-4 bg-purple-400 rounded mr-2"></div>
                단색
              </Button>
              <Button
                variant={tapePattern === "striped" ? "default" : "outline"}
                onClick={() => setTapePattern("striped")}
                className={`w-full justify-start h-12 ${
                  tapePattern === "striped" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <div className="w-8 h-4 bg-gradient-to-r from-purple-400 to-white rounded mr-2"></div>
                줄무늬
              </Button>
              <Button
                variant={tapePattern === "dotted" ? "default" : "outline"}
                onClick={() => setTapePattern("dotted")}
                className={`w-full justify-start h-12 ${
                  tapePattern === "dotted" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <div className="w-8 h-4 bg-purple-400 rounded mr-2 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
                도트
              </Button>
              <Button
                variant={tapePattern === "hearts" ? "default" : "outline"}
                onClick={() => setTapePattern("hearts")}
                className={`w-full justify-start h-12 ${
                  tapePattern === "hearts" ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                }`}
              >
                <div className="w-8 h-4 bg-purple-400 rounded mr-2 flex items-center justify-center text-xs">💖</div>
                하트
              </Button>
            </div>
          </div>

          {/* 색상 프리셋 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-purple-700 mb-2">색상 프리셋</label>
            <div className="grid grid-cols-4 gap-2">
              {tapeColorPresets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => setTapeColor(preset.color)}
                  className={`h-12 p-1 border-purple-200 hover:bg-purple-50 ${
                    tapeColor === preset.color ? "ring-2 ring-purple-500" : ""
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-3 rounded mb-1" style={{ backgroundColor: preset.color }}></div>
                    <span className="text-xs">{preset.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* 커스텀 색상 */}
          <div>
            <label className="block text-sm font-medium text-purple-700 mb-2">커스텀 색상</label>
            <input
              type="color"
              value={tapeColor}
              onChange={(e) => setTapeColor(e.target.value)}
              className="w-full h-12 border border-purple-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* 테이프 추가 버튼 */}
          <Button
            onClick={addTape}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg font-medium"
          >
            🎀 테이프 추가하기
          </Button>

          {/* 🎀 향상된 사용 팁 */}
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-medium mb-2">💡 사용 방법:</p>
            <ul className="text-xs text-purple-600 space-y-1">
              <li>• 마우스로 드래그하여 테이프 크기 조절</li>
              <li>• 모서리 핸들로 리사이즈</li>
              <li>• 회전 핸들로 각도 조절</li>
              <li>• 다양한 패턴과 색상 선택</li>
              <li>• Ctrl+C/V로 복사/붙여넣기</li>
              <li>• Delete키로 삭제</li>
            </ul>
          </div>
        </div>
      )}

      {/* 🎯 선택된 요소 컨트롤 패널 */}
      {selectedElement && (
        <div className="space-y-4 border-t border-purple-200 pt-4">
          <h3 className="font-bold text-purple-800">🎯 선택된 요소</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={copyElement} variant="outline" className="border-purple-200 hover:bg-purple-50">
              <Copy className="w-4 h-4 mr-1" />
              복사
            </Button>
            <Button
              onClick={pasteElement}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50"
              disabled={!copiedElement}
            >
              📋 붙여넣기
            </Button>
            <Button onClick={rotateElement} variant="outline" className="border-purple-200 hover:bg-purple-50">
              <RotateCw className="w-4 h-4 mr-1" />
              회전
            </Button>
            <Button onClick={deleteElement} variant="outline" className="border-red-200 hover:bg-red-50 text-red-600">
              <Trash2 className="w-4 h-4 mr-1" />
              삭제
            </Button>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600">💡 단축키: Ctrl+C(복사), Ctrl+V(붙여넣기), R(회전), Delete(삭제)</p>
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    // 모바일 레이아웃
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 safe-area-inset">
        {/* 모바일 헤더 */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              IVE 포토카드 ✨
            </h1>
            <div className="flex items-center gap-2">
              <Button onClick={downloadImage} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4" />
              </Button>
              <Button onClick={clearCanvas} size="sm" variant="outline" className="border-purple-200">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button size="sm" variant="outline" className="border-purple-200">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[80vh]">
                  <DrawerHeader>
                    <DrawerTitle>도구 선택</DrawerTitle>
                  </DrawerHeader>
                  <ScrollArea className="px-4 pb-4">
                    <ToolPanel />
                  </ScrollArea>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>

        {/* 도구 선택 탭 */}
        <div className="px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-purple-200">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {tools.map((tool) => {
                const IconComponent = tool.icon
                return (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "outline"}
                    onClick={() => setSelectedTool(tool.id as any)}
                    className={`flex-shrink-0 h-12 px-3 ${
                      selectedTool === tool.id ? "bg-purple-600 text-white" : "border-purple-200 hover:bg-purple-50"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-1" />
                    <span className="text-sm">{tool.name}</span>
                  </Button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* 캔버스 영역 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="border-2 border-purple-300 rounded-lg shadow-lg touch-none"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <div className="mt-3 text-center">
              <p className="text-sm text-purple-600 font-handwriting">My Premium IVE Photocard ✨🛡️</p>
            </div>
          </Card>
        </div>

        {/* 하단 도구 패널 (선택된 도구에 따라) */}
        {selectedTool !== "image" && (
          <div className="bg-white/90 backdrop-blur-sm border-t border-purple-200 p-4">
            <ScrollArea className="max-h-48">
              <ToolPanel />
            </ScrollArea>
          </div>
        )}
      </div>
    )
  }

  // 데스크톱 레이아웃
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            IVE 포토카드 꾸미기 ✨
          </h1>
          <p className="text-purple-600">실제 IVE 멤버 이미지로 나만의 특별한 포토카드를 만들어보세요!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 도구 선택 */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3">🛠️ 도구 선택</h3>
              <div className="space-y-2">
                {tools.map((tool) => {
                  const IconComponent = tool.icon
                  return (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "outline"}
                      onClick={() => setSelectedTool(tool.id as any)}
                      className={`w-full justify-start h-auto p-3 ${
                        selectedTool === tool.id
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "hover:bg-purple-50 border-purple-200"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs opacity-70">{tool.desc}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </Card>

            <Card className="p-4 bg-white/80 backdrop-blur-sm border-purple-200">
              <ScrollArea className="max-h-96">
                <ToolPanel />
              </ScrollArea>
            </Card>
          </div>

          {/* 캔버스 */}
          <div className="lg:col-span-2 flex justify-center">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl">
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="border-2 border-purple-300 rounded-lg shadow-lg"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-purple-600 font-handwriting">My Premium IVE Photocard ✨🛡️</p>
              </div>
            </Card>
          </div>

          {/* 액션 버튼 */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3">🎨 작업</h3>
              <div className="space-y-2">
                <Button
                  onClick={downloadImage}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  💾 프리미엄 저장하기
                </Button>
                <Button onClick={clearCanvas} variant="outline" className="w-full border-purple-200 hover:bg-purple-50">
                  🗑️ 모두 지우기
                </Button>
              </div>
            </Card>

            {/* 🎯 단축키 안내 */}
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-purple-200">
              <h3 className="font-bold text-purple-800 mb-3">⌨️ 단축키</h3>
              <div className="space-y-2 text-sm text-purple-700">
                <div className="flex justify-between">
                  <span>복사</span>
                  <span className="font-mono bg-purple-100 px-2 py-1 rounded">Ctrl+C</span>
                </div>
                <div className="flex justify-between">
                  <span>붙여넣기</span>
                  <span className="font-mono bg-purple-100 px-2 py-1 rounded">Ctrl+V</span>
                </div>
                <div className="flex justify-between">
                  <span>삭제</span>
                  <span className="font-mono bg-purple-100 px-2 py-1 rounded">Delete</span>
                </div>
                <div className="flex justify-between">
                  <span>회전</span>
                  <span className="font-mono bg-purple-100 px-2 py-1 rounded">R</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
