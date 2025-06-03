"use client"

import { useRef, useEffect, useState } from "react"
import { SimpleCanvas } from "../utils/canvasUtils"

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasInstanceRef = useRef<SimpleCanvas | null>(null)
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initCanvas = () => {
      if (canvasRef.current && !canvasInstanceRef.current) {
        try {
          setError(null)
          canvasInstanceRef.current = new SimpleCanvas(canvasRef.current)
          setIsCanvasReady(true)
        } catch (error) {
          console.error("Failed to initialize canvas:", error)
          setError("캔버스 초기화에 실패했습니다. 페이지를 새로고침해주세요.")
        }
      }
    }

    // DOM이 준비되면 즉시 초기화
    if (typeof window !== "undefined") {
      initCanvas()
    }

    return () => {
      if (canvasInstanceRef.current) {
        canvasInstanceRef.current = null
        setIsCanvasReady(false)
      }
    }
  }, [])

  return {
    canvasRef,
    canvas: canvasInstanceRef.current,
    isCanvasReady,
    error,
  }
}
