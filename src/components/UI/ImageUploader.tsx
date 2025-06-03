"use client"

import type React from "react"
import { useRef, useState } from "react"

interface ImageUploaderProps {
  canvas: any
  onImageUploaded?: (imageUrl: string) => void
  onError?: (message: string) => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ canvas, onImageUploaded, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !canvas) return

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      onError?.("파일 크기는 5MB 이하여야 합니다.")
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      onError?.("이미지 파일만 업로드 가능합니다.")
      return
    }

    setIsUploading(true)

    try {
      await canvas.addImageFromFile(file)
      onImageUploaded?.(file.name)
    } catch (error) {
      console.error("Failed to add image:", error)
      onError?.("이미지 추가에 실패했습니다.")
    } finally {
      setIsUploading(false)
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileSelect = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  // 샘플 이미지 생성
  const createSampleImage = (name: string, color: string): string => {
    const canvas = document.createElement("canvas")
    canvas.width = 300
    canvas.height = 400
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // 그라데이션 배경
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, "#ffffff")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 300, 400)

      // 텍스트 추가
      ctx.fillStyle = "#333"
      ctx.font = "bold 24px Arial"
      ctx.textAlign = "center"
      ctx.fillText(name, 150, 180)

      ctx.font = "16px Arial"
      ctx.fillText("IVE Member", 150, 210)

      // 장식 요소
      ctx.fillStyle = "#ffffff"
      ctx.font = "40px Arial"
      ctx.fillText("✨", 80, 120)
      ctx.fillText("💖", 220, 120)
      ctx.fillText("🌟", 150, 300)
    }

    return canvas.toDataURL()
  }

  const handleSampleImageClick = (imageName: string, color: string) => {
    if (!canvas || isUploading) return

    setIsUploading(true)
    try {
      const imageDataUrl = createSampleImage(imageName, color)

      // 데이터 URL을 Blob으로 변환
      const byteString = atob(imageDataUrl.split(",")[1])
      const mimeString = imageDataUrl.split(",")[0].split(":")[1].split(";")[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }

      const blob = new Blob([ab], { type: mimeString })
      const file = new File([blob], `${imageName}.png`, { type: mimeString })

      canvas
        .addImageFromFile(file)
        .then(() => {
          onImageUploaded?.(imageName)
        })
        .catch((error: any) => {
          console.error("Failed to add sample image:", error)
          onError?.(`${imageName} 이미지 추가에 실패했습니다.`)
        })
        .finally(() => {
          setIsUploading(false)
        })
    } catch (error) {
      console.error("Error creating sample image:", error)
      onError?.("샘플 이미지 생성에 실패했습니다.")
      setIsUploading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3">이미지 업로드</h3>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

      <button
        onClick={triggerFileSelect}
        disabled={isUploading}
        className={`
          w-full py-3 px-4 border-2 border-dashed rounded-lg transition-colors
          ${
            isUploading
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
          }
        `}
      >
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <span className="text-sm text-gray-600">업로드 중...</span>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-gray-600">클릭하여 이미지 선택</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF 지원 (최대 5MB)</span>
            </>
          )}
        </div>
      </button>

      {/* 샘플 이미지들 */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">샘플 이미지</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: "안유진", color: "#FFB6C1" },
            { name: "가을", color: "#DDA0DD" },
            { name: "장원영", color: "#98FB98" },
          ].map((sample) => (
            <button
              key={sample.name}
              onClick={() => handleSampleImageClick(sample.name, sample.color)}
              disabled={isUploading}
              className={`
                relative overflow-hidden rounded-lg border transition-colors h-16
                ${
                  isUploading
                    ? "border-gray-200 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-purple-300"
                }
              `}
              style={{ backgroundColor: sample.color }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-medium text-sm drop-shadow-md">{sample.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageUploader
