"use client"

import type React from "react"
import { useState } from "react"
import "./App.css"
import CanvasEditor from "./components/CanvasEditor"
import Toolbar from "./components/Toolbar"
import ThumbnailGallery from "./components/ThumbnailGallery"
import type { fabric } from "fabric"

const App: React.FC = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>("")

  const handleCanvasReady = (canvasInstance: fabric.Canvas) => {
    setCanvas(canvasInstance)
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 p-4">
      <div className="app-container">
        <h1 className="header">IVE 포토카드 꾸미기 ✨</h1>

        <ThumbnailGallery onSelectImage={handleImageSelect} />

        <div className="main-area">
          <CanvasEditor image={selectedImage} onCanvasReady={handleCanvasReady} />
          <Toolbar canvas={canvas} />
        </div>
      </div>
    </div>
  )
}

export default App
