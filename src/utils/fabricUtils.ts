import { CANVAS_CONFIG } from "../constants"

declare global {
  interface Window {
    fabric: any
  }
}

// Fabric.js 대신 간단한 Canvas API 사용
export const createSimpleCanvas = (canvasElement: HTMLCanvasElement) => {
  const ctx = canvasElement.getContext("2d")
  if (!ctx) throw new Error("Canvas context not available")

  canvasElement.width = CANVAS_CONFIG.WIDTH
  canvasElement.height = CANVAS_CONFIG.HEIGHT

  // 배경 설정
  ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR
  ctx.fillRect(0, 0, CANVAS_CONFIG.WIDTH, CANVAS_CONFIG.HEIGHT)

  return {
    canvas: canvasElement,
    ctx,
    objects: [] as any[],
    selectedObject: null as any,

    add: (obj: any) => {
      // 간단한 객체 추가 로직
    },

    // 🎀 마스킹 테이프 추가 메서드
    addTape: (color: string, style: "horizontal" | "vertical" | "diagonal" = "horizontal") => {
      console.log("Adding tape:", color, style)

      let width = 150
      let height = 30
      let x = CANVAS_CONFIG.WIDTH / 2 - width / 2
      let y = CANVAS_CONFIG.HEIGHT / 2 - height / 2

      switch (style) {
        case "vertical":
          width = 30
          height = 150
          x = CANVAS_CONFIG.WIDTH / 2 - width / 2
          y = CANVAS_CONFIG.HEIGHT / 2 - height / 2
          break
        case "diagonal":
          // 대각선은 회전으로 처리
          break
      }

      // 테이프 그리기
      ctx.save()

      if (style === "diagonal") {
        ctx.translate(x + width / 2, y + height / 2)
        ctx.rotate((45 * Math.PI) / 180)
        ctx.translate(-width / 2, -height / 2)
        ctx.fillStyle = color
        ctx.fillRect(0, 0, width, height)
      } else {
        ctx.fillStyle = color
        ctx.fillRect(x, y, width, height)

        // 테이프 질감 추가
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        for (let i = 5; i < height; i += 10) {
          ctx.fillRect(x, y + i, width, 2)
        }
      }

      ctx.restore()
    },

    renderAll: () => {
      ctx.clearRect(0, 0, CANVAS_CONFIG.WIDTH, CANVAS_CONFIG.HEIGHT)
      ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR
      ctx.fillRect(0, 0, CANVAS_CONFIG.WIDTH, CANVAS_CONFIG.HEIGHT)
    },

    toDataURL: () => canvasElement.toDataURL(),
  }
}

// Fabric.js 로딩 대기 (fallback 포함)
export const waitForFabric = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false)
      return
    }

    if (window.fabric) {
      resolve(true)
      return
    }

    let attempts = 0
    const maxAttempts = 30
    const checkFabric = () => {
      attempts++
      if (window.fabric) {
        resolve(true)
      } else if (attempts >= maxAttempts) {
        console.warn("Fabric.js failed to load, using fallback")
        resolve(false)
      } else {
        setTimeout(checkFabric, 100)
      }
    }
    checkFabric()
  })
}

export const initializeCanvas = async (canvasElement: HTMLCanvasElement) => {
  const hasFabric = await waitForFabric()

  if (!hasFabric) {
    // Fabric.js가 없으면 간단한 Canvas 사용
    return createSimpleCanvas(canvasElement)
  }

  const canvas = new window.fabric.Canvas(canvasElement, {
    width: CANVAS_CONFIG.WIDTH,
    height: CANVAS_CONFIG.HEIGHT,
    backgroundColor: CANVAS_CONFIG.BACKGROUND_COLOR,
    selection: true,
    preserveObjectStacking: true,
    imageSmoothingEnabled: true,
  })

  // 🎀 Fabric.js 캔버스에 addTape 메서드 추가
  canvas.addTape = (color: string, style: "horizontal" | "vertical" | "diagonal" = "horizontal") => {
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
    return tape
  }

  // 캔버스 이벤트 설정
  canvas.on("selection:created", () => {
    canvas.renderAll()
  })

  canvas.on("selection:updated", () => {
    canvas.renderAll()
  })

  canvas.on("selection:cleared", () => {
    canvas.renderAll()
  })

  return canvas
}

// 이모지를 캔버스에 텍스트로 추가
export const addEmojiToCanvas = async (canvas: any, emoji: string) => {
  try {
    const hasFabric = await waitForFabric()

    if (!hasFabric) {
      // Fabric.js 없이 직접 그리기
      if (canvas.ctx) {
        canvas.ctx.font = "48px Arial"
        canvas.ctx.fillText(emoji, canvas.canvas.width / 2, canvas.canvas.height / 2)
      }
      return
    }

    const textObject = new window.fabric.Text(emoji, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: "center",
      originY: "center",
      fontSize: 48,
      fontFamily: "Arial",
      selectable: true,
      evented: true,
    })

    canvas.add(textObject)
    canvas.setActiveObject(textObject)
    canvas.renderAll()
    return textObject
  } catch (error) {
    console.error("Error adding emoji to canvas:", error)
    throw error
  }
}

export const addImageToCanvas = async (
  canvas: any,
  imageUrl: string,
  options: {
    scaleToFit?: boolean
    centered?: boolean
    selectable?: boolean
  } = {},
) => {
  const { scaleToFit = true, centered = true, selectable = true } = options

  try {
    const hasFabric = await waitForFabric()

    if (!hasFabric) {
      // Fabric.js 없이 이미지 로드
      const img = new Image()
      img.crossOrigin = "anonymous"

      return new Promise((resolve, reject) => {
        img.onload = () => {
          if (canvas.ctx) {
            const scale = scaleToFit ? Math.min(canvas.canvas.width / img.width, canvas.canvas.height / img.height) : 1
            const x = centered ? (canvas.canvas.width - img.width * scale) / 2 : 0
            const y = centered ? (canvas.canvas.height - img.height * scale) / 2 : 0

            canvas.ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
          }
          resolve(img)
        }

        img.onerror = () => {
          console.warn(`Failed to load image: ${imageUrl}`)
          reject(new Error("Failed to load image"))
        }

        img.src = imageUrl
      })
    }

    return new Promise((resolve, reject) => {
      window.fabric.Image.fromURL(
        imageUrl,
        (img: any) => {
          if (!img) {
            reject(new Error("Failed to load image"))
            return
          }

          const canvasWidth = canvas.width || CANVAS_CONFIG.WIDTH
          const canvasHeight = canvas.height || CANVAS_CONFIG.HEIGHT

          if (scaleToFit) {
            const imgWidth = img.width || 1
            const imgHeight = img.height || 1
            const scaleX = canvasWidth / imgWidth
            const scaleY = canvasHeight / imgHeight
            const scale = Math.min(scaleX, scaleY)

            img.set({
              scaleX: scale,
              scaleY: scale,
            })
          }

          if (centered) {
            img.set({
              left: canvasWidth / 2,
              top: canvasHeight / 2,
              originX: "center",
              originY: "center",
            })
          }

          img.set({
            selectable,
            evented: selectable,
          })

          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
          resolve(img)
        },
        {
          crossOrigin: "anonymous",
        },
      )
    })
  } catch (error) {
    console.error("Error adding image to canvas:", error)
    throw error
  }
}

export const addTextToCanvas = async (
  canvas: any,
  text: string,
  style: {
    fontSize?: number
    fontFamily?: string
    fill?: string
    fontWeight?: string
  } = {},
) => {
  try {
    const hasFabric = await waitForFabric()

    if (!hasFabric) {
      // Fabric.js 없이 텍스트 추가
      if (canvas.ctx) {
        canvas.ctx.font = `${style.fontSize || 20}px ${style.fontFamily || "Arial"}`
        canvas.ctx.fillStyle = style.fill || "#000000"
        canvas.ctx.fillText(text, canvas.canvas.width / 2, canvas.canvas.height / 2)
      }
      return
    }

    const textObject = new window.fabric.IText(text, {
      left: canvas.width / 2,
      top: canvas.height / 2,
      originX: "center",
      originY: "center",
      fontSize: style.fontSize || 20,
      fontFamily: style.fontFamily || "Arial",
      fill: style.fill || "#000000",
      fontWeight: style.fontWeight || "normal",
      selectable: true,
      evented: true,
    })

    canvas.add(textObject)
    canvas.setActiveObject(textObject)
    canvas.renderAll()
    return textObject
  } catch (error) {
    console.error("Error adding text to canvas:", error)
    throw error
  }
}

export const addMaskingTapeToCanvas = async (canvas: any, color: string) => {
  try {
    const hasFabric = await waitForFabric()

    if (!hasFabric) {
      // Fabric.js 없이 사각형 그리기
      if (canvas.ctx) {
        canvas.ctx.fillStyle = color
        canvas.ctx.fillRect(canvas.canvas.width / 2 - 75, canvas.canvas.height / 2 - 15, 150, 30)
      }
      return
    }

    const tape = new window.fabric.Rect({
      left: canvas.width / 2,
      top: canvas.height / 2,
      width: 150,
      height: 30,
      fill: color,
      originX: "center",
      originY: "center",
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    })

    canvas.add(tape)
    canvas.setActiveObject(tape)
    canvas.renderAll()
    return tape
  } catch (error) {
    console.error("Error adding masking tape to canvas:", error)
    throw error
  }
}

export const exportCanvas = (canvas: any, format: "png" | "jpg" = "png", quality = 1) => {
  try {
    if (canvas.toDataURL) {
      return canvas.toDataURL({
        format,
        quality,
        multiplier: 2,
      })
    } else if (canvas.canvas) {
      return canvas.canvas.toDataURL(`image/${format}`, quality)
    }
    throw new Error("Cannot export canvas")
  } catch (error) {
    console.error("Error exporting canvas:", error)
    throw error
  }
}

export const clearCanvas = (canvas: any, keepBackground = true) => {
  try {
    if (canvas.clear) {
      // Fabric.js 캔버스
      if (keepBackground) {
        const objects = canvas.getObjects()
        objects.forEach((obj: any) => {
          if (obj !== canvas.backgroundImage) {
            canvas.remove(obj)
          }
        })
      } else {
        canvas.clear()
      }
      canvas.renderAll()
    } else if (canvas.ctx) {
      // 일반 캔버스
      canvas.ctx.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height)
      canvas.ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR
      canvas.ctx.fillRect(0, 0, canvas.canvas.width, canvas.canvas.height)
    }
  } catch (error) {
    console.error("Error clearing canvas:", error)
  }
}

// 필터 적용 (간소화)
export const applyFilterToObject = (object: any, filterType: string, value?: number) => {
  // 필터 기능은 Fabric.js가 있을 때만 작동
  if (!window.fabric || !object || object.type !== "image") return

  try {
    object.filters = []

    switch (filterType) {
      case "grayscale":
        if (window.fabric.Image.filters.Grayscale) {
          object.filters.push(new window.fabric.Image.filters.Grayscale())
        }
        break
      case "sepia":
        if (window.fabric.Image.filters.Sepia) {
          object.filters.push(new window.fabric.Image.filters.Sepia())
        }
        break
      case "invert":
        if (window.fabric.Image.filters.Invert) {
          object.filters.push(new window.fabric.Image.filters.Invert())
        }
        break
      case "blur":
        if (window.fabric.Image.filters.Blur) {
          object.filters.push(new window.fabric.Image.filters.Blur({ blur: value || 0.5 }))
        }
        break
      case "brightness":
        if (window.fabric.Image.filters.Brightness) {
          object.filters.push(new window.fabric.Image.filters.Brightness({ brightness: value || 1.2 }))
        }
        break
      case "contrast":
        if (window.fabric.Image.filters.Contrast) {
          object.filters.push(new window.fabric.Image.filters.Contrast({ contrast: value || 1.2 }))
        }
        break
      case "none":
      default:
        break
    }

    object.applyFilters()
  } catch (error) {
    console.error("Error applying filter:", error)
  }
}
