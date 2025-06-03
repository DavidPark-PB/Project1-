"use client"
import { fabric } from "fabric"
import "./Toolbar.css"
import { MASKING_TAPES } from "../constants"

const Toolbar = ({ canvas }: { canvas: fabric.Canvas | null }) => {
  const addText = () => {
    if (!canvas) return
    const text = new fabric.IText("텍스트 입력", {
      left: 100,
      top: 100,
      fill: "#000",
      fontSize: 20,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const addSticker = () => {
    if (!canvas) return
    // 이모지 스티커 추가
    const text = new fabric.Text("💖", {
      left: 50,
      top: 50,
      fontSize: 40,
      fontFamily: "Arial",
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  // 🎀 마스킹 테이프 추가 함수
  const addTape = () => {
    if (!canvas) return

    // 마스킹 테이프 색상 랜덤 선택
    const randomTape = MASKING_TAPES[Math.floor(Math.random() * MASKING_TAPES.length)]

    const tape = new fabric.Rect({
      left: 100,
      top: 200,
      width: 150,
      height: 30,
      fill: randomTape.color,
      opacity: 0.8,
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
    })

    canvas.add(tape)
    canvas.setActiveObject(tape)
    canvas.renderAll()

    // 테이프 추가 알림
    console.log(`${randomTape.name} 테이프가 추가되었습니다!`)
  }

  const clearCanvas = () => {
    if (!canvas) return
    canvas.getObjects().forEach((obj: fabric.Object) => {
      if (obj !== canvas.backgroundImage) {
        canvas.remove(obj)
      }
    })
    canvas.renderAll()
  }

  return (
    <div className="toolbar">
      <button onClick={addText}>텍스트</button>
      <button onClick={addSticker}>스티커</button>
      <button onClick={addTape}>🎀 테이프</button>
      <button onClick={clearCanvas}>초기화</button>
    </div>
  )
}

export default Toolbar
