import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, Sticker, Type, PenTool, Square, LayoutGrid, Sparkles, CircleDot } from "lucide-react"
import Image from "next/image"

export function ToolSelectionPanel() {
  const memberImages = [
    { name: "안유진", src: "/placeholder.svg?height=64&width=64" },
    { name: "가을", src: "/placeholder.svg?height=64&width=64" },
    { name: "장원영", src: "/placeholder.svg?height=64&width=64" },
    { name: "리즈", src: "/placeholder.svg?height=64&width=64" },
    { name: "이서", src: "/placeholder.svg?height=64&width=64" },
    { name: "레이", src: "/placeholder.svg?height=64&width=64" },
  ]

  return (
    <div className="w-full space-y-4">
      {" "}
      {/* Removed fixed width for mobile flexibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-base flex items-center gap-2">
            <PenTool className="w-5 h-5 md:w-4 md:h-4" /> 도구 선택
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:gap-1">
          <Button
            variant="ghost"
            className="justify-start gap-3 px-4 py-3 h-auto text-left bg-purple-600 text-white hover:bg-purple-700 hover:text-white text-base md:text-sm"
          >
            <ImageIcon className="w-6 h-6 md:w-5 md:h-5" />
            <div className="flex flex-col items-start">
              <span>이미지</span>
              <span className="text-sm md:text-xs opacity-80">배경 이미지</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 px-4 py-3 h-auto text-left text-base md:text-sm">
            <Sticker className="w-6 h-6 md:w-5 md:h-5" />
            <div className="flex flex-col items-start">
              <span>스티커</span>
              <span className="text-sm md:text-xs text-gray-500">귀여운 스티커</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 px-4 py-3 h-auto text-left text-base md:text-sm">
            <Type className="w-6 h-6 md:w-5 md:h-5" />
            <div className="flex flex-col items-start">
              <span>텍스트</span>
              <span className="text-sm md:text-xs text-gray-500">글자 추가</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 px-4 py-3 h-auto text-left text-base md:text-sm">
            <PenTool className="w-6 h-6 md:w-5 md:h-5" />
            <div className="flex flex-col items-start">
              <span>펜</span>
              <span className="text-sm md:text-xs text-gray-500">자유 그리기</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 px-4 py-3 h-auto text-left text-base md:text-sm">
            <Square className="w-6 h-6 md:w-5 md:h-5" />
            <div className="flex flex-col items-start">
              <span>도형</span>
              <span className="text-sm md:text-xs text-gray-500">기본 도형</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 px-4 py-3 h-auto text-left text-base md:text-sm">
            <LayoutGrid className="w-6 h-6 md:w-5 md:h-5" />
            <div className="flex flex-col items-start">
              <span>테이프</span>
              <span className="text-sm md:text-xs text-gray-500">마스킹 테이프</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 px-4 py-3 h-auto text-left text-base md:text-sm">
            <Sparkles className="w-6 h-6 md:w-5 md:h-5" />
            <div className="flex flex-col items-start">
              <span>홀로그램</span>
              <span className="text-sm md:text-xs text-gray-500">홀로그램 슬리브</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 px-4 py-3 h-auto text-left text-base md:text-sm">
            <CircleDot className="w-6 h-6 md:w-5 md:h-5" />
            <div className="flex flex-col items-start">
              <span>탑로더</span>
              <span className="text-sm md:text-xs text-gray-500">보호 케이스</span>
            </div>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <Button className="w-full bg-purple-600 text-white hover:bg-purple-700 h-12 text-base">
            <ImageIcon className="w-5 h-5 mr-2" /> 내 파일에서 선택
          </Button>
          <div className="mt-4 text-base md:text-sm font-semibold text-gray-700">✨ IVE 멤버 이미지:</div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {memberImages.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-sm md:text-xs text-gray-600">
                <Image
                  src={member.src || "/placeholder.svg"}
                  alt={member.name}
                  width={64}
                  height={64}
                  className="rounded-md border border-gray-200 cursor-pointer hover:border-purple-500 transition-colors"
                />
                <span className="mt-1">{member.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
