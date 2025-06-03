import { CANVAS_CONFIG } from "../constants"

export interface CanvasElement {
  id: string
  type: "text" | "emoji" | "shape" | "image" | "tape"
  x: number
  y: number
  width: number
  height: number
  content?: string
  color?: string
  fontSize?: number
  fontFamily?: string
  selected?: boolean
  rotation?: number
  opacity?: number
}

export class SimpleCanvas {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private elements: CanvasElement[] = []
  private selectedElement: CanvasElement | null = null
  private isDragging = false
  private dragOffset = { x: 0, y: 0 }
  private history: CanvasElement[][] = []
  private historyIndex = -1
  private isResizing = false
  private resizeHandle: string | null = null
  private backgroundColor = CANVAS_CONFIG.BACKGROUND_COLOR

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement
    const ctx = canvasElement.getContext("2d")
    if (!ctx) throw new Error("Canvas context not available")

    this.ctx = ctx
    this.canvas.width = CANVAS_CONFIG.WIDTH
    this.canvas.height = CANVAS_CONFIG.HEIGHT

    this.setupEventListeners()
    this.render()
    this.saveState()
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this))
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this))
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this))
    this.canvas.addEventListener("click", this.handleClick.bind(this))
  }

  private handleMouseDown(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 리사이즈 핸들 체크
    if (this.selectedElement) {
      const handle = this.getResizeHandleAt(x, y, this.selectedElement)
      if (handle) {
        this.isResizing = true
        this.resizeHandle = handle
        return
      }
    }

    const element = this.getElementAt(x, y)
    if (element) {
      this.selectedElement = element
      this.isDragging = true
      this.dragOffset.x = x - element.x
      this.dragOffset.y = y - element.y
      this.render()
    } else {
      this.selectedElement = null
      this.render()
    }
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 리사이징 처리
    if (this.isResizing && this.selectedElement && this.resizeHandle) {
      this.resizeElement(this.selectedElement, this.resizeHandle, x, y)
      this.render()
      return
    }

    // 드래깅 처리
    if (this.isDragging && this.selectedElement) {
      this.selectedElement.x = x - this.dragOffset.x
      this.selectedElement.y = y - this.dragOffset.y
      this.render()
      return
    }

    // 커서 스타일 변경
    if (this.selectedElement) {
      const handle = this.getResizeHandleAt(x, y, this.selectedElement)
      if (handle) {
        if (handle === "nw" || handle === "se") {
          this.canvas.style.cursor = "nwse-resize"
        } else if (handle === "ne" || handle === "sw") {
          this.canvas.style.cursor = "nesw-resize"
        } else if (handle === "n" || handle === "s") {
          this.canvas.style.cursor = "ns-resize"
        } else if (handle === "e" || handle === "w") {
          this.canvas.style.cursor = "ew-resize"
        }
      } else if (this.getElementAt(x, y)) {
        this.canvas.style.cursor = "move"
      } else {
        this.canvas.style.cursor = "default"
      }
    } else if (this.getElementAt(x, y)) {
      this.canvas.style.cursor = "move"
    } else {
      this.canvas.style.cursor = "default"
    }
  }

  private handleMouseUp() {
    if (this.isDragging || this.isResizing) {
      this.isDragging = false
      this.isResizing = false
      this.resizeHandle = null
      this.saveState()
    }
  }

  private handleClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const element = this.getElementAt(x, y)
    this.selectedElement = element
    this.render()
  }

  private getElementAt(x: number, y: number): CanvasElement | null {
    // 역순으로 검사 (위에 있는 요소부터)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i]

      // 회전 처리
      if (element.rotation) {
        // 회전된 요소는 복잡한 계산이 필요하므로 간단하게 처리
        const centerX = element.x + element.width / 2
        const centerY = element.y + element.height / 2
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)

        // 대략적인 범위 체크 (정확한 회전 충돌 체크는 더 복잡함)
        if (distance <= Math.max(element.width, element.height) / 2) {
          return element
        }
      } else {
        // 일반 요소
        if (x >= element.x && x <= element.x + element.width && y >= element.y && y <= element.y + element.height) {
          return element
        }
      }
    }
    return null
  }

  private getResizeHandleAt(x: number, y: number, element: CanvasElement): string | null {
    const handleSize = 8
    const handles = {
      nw: { x: element.x - handleSize / 2, y: element.y - handleSize / 2 },
      ne: { x: element.x + element.width - handleSize / 2, y: element.y - handleSize / 2 },
      se: { x: element.x + element.width - handleSize / 2, y: element.y + element.height - handleSize / 2 },
      sw: { x: element.x - handleSize / 2, y: element.y + element.height - handleSize / 2 },
      n: { x: element.x + element.width / 2 - handleSize / 2, y: element.y - handleSize / 2 },
      e: { x: element.x + element.width - handleSize / 2, y: element.y + element.height / 2 - handleSize / 2 },
      s: { x: element.x + element.width / 2 - handleSize / 2, y: element.y + element.height - handleSize / 2 },
      w: { x: element.x - handleSize / 2, y: element.y + element.height / 2 - handleSize / 2 },
    }

    for (const [handle, pos] of Object.entries(handles)) {
      if (x >= pos.x && x <= pos.x + handleSize && y >= pos.y && y <= pos.y + handleSize) {
        return handle
      }
    }

    return null
  }

  private resizeElement(element: CanvasElement, handle: string, x: number, y: number) {
    const originalX = element.x
    const originalY = element.y
    const originalWidth = element.width
    const originalHeight = element.height

    switch (handle) {
      case "nw":
        element.width = originalX + originalWidth - x
        element.height = originalY + originalHeight - y
        element.x = x
        element.y = y
        break
      case "ne":
        element.width = x - originalX
        element.height = originalY + originalHeight - y
        element.y = y
        break
      case "se":
        element.width = x - originalX
        element.height = y - originalY
        break
      case "sw":
        element.width = originalX + originalWidth - x
        element.height = y - originalY
        element.x = x
        break
      case "n":
        element.height = originalY + originalHeight - y
        element.y = y
        break
      case "e":
        element.width = x - originalX
        break
      case "s":
        element.height = y - originalY
        break
      case "w":
        element.width = originalX + originalWidth - x
        element.x = x
        break
    }

    // 최소 크기 제한
    if (element.width < 10) {
      element.width = 10
      if (handle.includes("w")) {
        element.x = originalX + originalWidth - 10
      }
    }
    if (element.height < 10) {
      element.height = 10
      if (handle.includes("n")) {
        element.y = originalY + originalHeight - 10
      }
    }
  }

  private saveState() {
    this.history = this.history.slice(0, this.historyIndex + 1)
    this.history.push(JSON.parse(JSON.stringify(this.elements)))
    this.historyIndex++

    // 히스토리 크기 제한
    if (this.history.length > 50) {
      this.history.shift()
      this.historyIndex--
    }
  }

  public undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--
      this.elements = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      this.selectedElement = null
      this.render()
      return true
    }
    return false
  }

  public redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.elements = JSON.parse(JSON.stringify(this.history[this.historyIndex]))
      this.selectedElement = null
      this.render()
      return true
    }
    return false
  }

  public addEmoji(emoji: string, x?: number, y?: number) {
    const element: CanvasElement = {
      id: Date.now().toString(),
      type: "emoji",
      x: x ?? this.canvas.width / 2 - 25,
      y: y ?? this.canvas.height / 2 - 25,
      width: 50,
      height: 50,
      content: emoji,
      fontSize: 40,
    }

    this.elements.push(element)
    this.selectedElement = element
    this.render()
    this.saveState()
  }

  public addText(text: string, style: any = {}) {
    const fontSize = style.fontSize || 20
    const element: CanvasElement = {
      id: Date.now().toString(),
      type: "text",
      x: this.canvas.width / 2 - 50,
      y: this.canvas.height / 2,
      width: 100,
      height: fontSize + 10,
      content: text,
      color: style.fill || "#000000",
      fontSize: fontSize,
      fontFamily: style.fontFamily || "Arial",
    }

    this.elements.push(element)
    this.selectedElement = element
    this.render()
    this.saveState()
  }

  public addShape(type: "rectangle" | "circle", color: string) {
    const element: CanvasElement = {
      id: Date.now().toString(),
      type: "shape",
      x: this.canvas.width / 2 - 50,
      y: this.canvas.height / 2 - 30,
      width: type === "circle" ? 60 : 100,
      height: type === "circle" ? 60 : 60,
      content: type,
      color: color,
    }

    this.elements.push(element)
    this.selectedElement = element
    this.render()
    this.saveState()
  }

  // 🎀 마스킹 테이프 추가 함수 - 완전히 새로 구현!
  public addTape(color: string, style: "horizontal" | "vertical" | "diagonal" = "horizontal") {
    let width = 150
    let height = 30
    let rotation = 0

    // 테이프 스타일에 따른 설정
    switch (style) {
      case "vertical":
        width = 30
        height = 150
        break
      case "diagonal":
        rotation = 45
        break
      default:
        // horizontal은 기본값
        break
    }

    const element: CanvasElement = {
      id: Date.now().toString(),
      type: "tape",
      x: this.canvas.width / 2 - width / 2,
      y: this.canvas.height / 2 - height / 2,
      width,
      height,
      color,
      rotation,
      opacity: 0.8, // 테이프는 약간 투명하게
    }

    this.elements.push(element)
    this.selectedElement = element
    this.render()
    this.saveState()

    console.log("테이프 추가됨:", element) // 디버깅용
  }

  public addImageFromFile(file: File) {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const maxWidth = this.canvas.width * 0.8
          const maxHeight = this.canvas.height * 0.8
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height)

          const element: CanvasElement = {
            id: Date.now().toString(),
            type: "image",
            x: this.canvas.width / 2 - (img.width * scale) / 2,
            y: this.canvas.height / 2 - (img.height * scale) / 2,
            width: img.width * scale,
            height: img.height * scale,
            content: e.target?.result as string,
          }

          this.elements.push(element)
          this.selectedElement = element
          this.render()
          this.saveState()
          resolve()
        }
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  public deleteSelected() {
    if (this.selectedElement) {
      const index = this.elements.findIndex((el) => el.id === this.selectedElement?.id)
      if (index !== -1) {
        this.elements.splice(index, 1)
        this.selectedElement = null
        this.render()
        this.saveState()
      }
    }
  }

  public clear() {
    this.elements = []
    this.selectedElement = null
    this.render()
    this.saveState()
  }

  public setBackgroundColor(color: string) {
    this.backgroundColor = color
    this.render()
  }

  public render() {
    // 배경 그리기
    this.ctx.fillStyle = this.backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // 요소들 그리기
    this.elements.forEach((element) => {
      this.drawElement(element)
    })

    // 선택된 요소 테두리 그리기
    if (this.selectedElement) {
      this.drawSelectionBorder(this.selectedElement)
    }
  }

  private drawElement(element: CanvasElement) {
    this.ctx.save()

    // 회전 적용
    if (element.rotation) {
      const centerX = element.x + element.width / 2
      const centerY = element.y + element.height / 2
      this.ctx.translate(centerX, centerY)
      this.ctx.rotate((element.rotation * Math.PI) / 180)
      this.ctx.translate(-centerX, -centerY)
    }

    // 투명도 적용
    if (element.opacity !== undefined) {
      this.ctx.globalAlpha = element.opacity
    }

    switch (element.type) {
      case "emoji":
        this.ctx.font = `${element.fontSize}px Arial`
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText(element.content || "", element.x + element.width / 2, element.y + element.height / 2)
        break

      case "text":
        this.ctx.font = `${element.fontSize}px ${element.fontFamily}`
        this.ctx.fillStyle = element.color || "#000000"
        this.ctx.textAlign = "left"
        this.ctx.textBaseline = "top"
        this.ctx.fillText(element.content || "", element.x, element.y)
        break

      case "shape":
        this.ctx.fillStyle = element.color || "#000000"
        if (element.content === "rectangle") {
          this.ctx.fillRect(element.x, element.y, element.width, element.height)
        } else if (element.content === "circle") {
          this.ctx.beginPath()
          this.ctx.arc(element.x + element.width / 2, element.y + element.height / 2, element.width / 2, 0, 2 * Math.PI)
          this.ctx.fill()
        }
        break

      case "tape":
        // 🎀 마스킹 테이프 그리기 - 완전히 새로 구현!
        this.ctx.fillStyle = element.color || "#FFFF00"

        // 테이프 본체 (둥근 모서리)
        this.ctx.beginPath()
        this.ctx.roundRect(element.x, element.y, element.width, element.height, 4)
        this.ctx.fill()

        // 테이프 질감 효과
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)"

        // 가로 줄무늬 패턴
        const stripeHeight = 2
        const stripeGap = 8
        for (let i = stripeGap; i < element.height; i += stripeGap) {
          this.ctx.fillRect(element.x, element.y + i, element.width, stripeHeight)
        }

        // 테이프 가장자리 하이라이트
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        this.ctx.lineWidth = 1
        this.ctx.beginPath()
        this.ctx.roundRect(element.x, element.y, element.width, element.height, 4)
        this.ctx.stroke()

        // 테이프 그림자 효과
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        this.ctx.fillRect(element.x + 2, element.y + 2, element.width, element.height)

        break

      case "image":
        if (element.content) {
          const img = new Image()
          img.onload = () => {
            this.ctx.drawImage(img, element.x, element.y, element.width, element.height)
          }
          img.src = element.content
        }
        break
    }

    this.ctx.restore()
  }

  private drawSelectionBorder(element: CanvasElement) {
    this.ctx.save()

    // 회전 적용
    if (element.rotation) {
      const centerX = element.x + element.width / 2
      const centerY = element.y + element.height / 2
      this.ctx.translate(centerX, centerY)
      this.ctx.rotate((element.rotation * Math.PI) / 180)
      this.ctx.translate(-centerX, -centerY)
    }

    // 선택 테두리
    this.ctx.strokeStyle = "#7c3aed"
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([5, 5])
    this.ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4)

    // 리사이즈 핸들
    this.ctx.fillStyle = "#7c3aed"
    this.ctx.setLineDash([])

    const handleSize = 8
    const handles = [
      { x: element.x - handleSize / 2, y: element.y - handleSize / 2 }, // nw
      { x: element.x + element.width / 2 - handleSize / 2, y: element.y - handleSize / 2 }, // n
      { x: element.x + element.width - handleSize / 2, y: element.y - handleSize / 2 }, // ne
      { x: element.x + element.width - handleSize / 2, y: element.y + element.height / 2 - handleSize / 2 }, // e
      { x: element.x + element.width - handleSize / 2, y: element.y + element.height - handleSize / 2 }, // se
      { x: element.x + element.width / 2 - handleSize / 2, y: element.y + element.height - handleSize / 2 }, // s
      { x: element.x - handleSize / 2, y: element.y + element.height - handleSize / 2 }, // sw
      { x: element.x - handleSize / 2, y: element.y + element.height / 2 - handleSize / 2 }, // w
    ]

    handles.forEach((handle) => {
      this.ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
    })

    this.ctx.restore()
  }

  public exportAsDataURL(): string {
    return this.canvas.toDataURL("image/png", 1.0)
  }

  public getSelectedElement(): CanvasElement | null {
    return this.selectedElement
  }

  public canUndo(): boolean {
    return this.historyIndex > 0
  }

  public canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }
}
