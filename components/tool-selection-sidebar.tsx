import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, Sticker, Type, PenTool, Square, LayoutGrid, Sparkles, CircleDot } from "lucide-react"
import Image from "next/image"

export function ToolSelectionSidebar() {
  const memberImages = [
    { name: "안유진", src: "/placeholder.svg?height=64&width=64" },
    { name: "가을", src: "/placeholder.svg?height=64&width=64" },
    { name: "장원영", src: "/placeholder.svg?height=64&width=64" },
    { name: "리즈", src: "/placeholder.svg?height=64&width=64" },
    { name: "이서", src: "/placeholder.svg?height=64&width=64" },
    { name: "레이", src: "/placeholder.svg?height=64&width=64" },
  ]

  return (
    <aside className="w-64 space-y-4 flex-shrink-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PenTool className="w-4 h-4" /> 도구 선택
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button
            variant="ghost"
            className="justify-start gap-2 px-3 py-2 h-auto text-left bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
          >
            <ImageIcon className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>이미지</span>
              <span className="text-xs opacity-80">배경 이미지</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 h-auto text-left">
            <Sticker className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>스티커</span>
              <span className="text-xs text-gray-500">귀여운 스티커</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 h-auto text-left">
            <Type className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>텍스트</span>
              <span className="text-xs text-gray-500">글자 추가</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 h-auto text-left">
            <PenTool className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>펜</span>
              <span className="text-xs text-gray-500">자유 그리기</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 h-auto text-left">
            <Square className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>도형</span>
              <span className="text-xs text-gray-500">기본 도형</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 h-auto text-left">
            <LayoutGrid className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>테이프</span>
              <span className="text-xs text-gray-500">마스킹 테이프</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 h-auto text-left">
            <Sparkles className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>홀로그램</span>
              <span className="text-xs text-gray-500">홀로그램 슬리브</span>
            </div>
          </Button>
          <Button variant="ghost" className="justify-start gap-2 px-3 py-2 h-auto text-left">
            <CircleDot className="w-5 h-5" />
            <div className="flex flex-col items-start">
              <span>탑로더</span>
              <span className="text-xs text-gray-500">보호 케이스</span>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
            <ImageIcon className="w-4 h-4 mr-2" /> 내 파일에서 선택
          </Button>
          <div className="mt-4 text-sm font-semibold text-gray-700">✨ IVE 멤버 이미지:</div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {memberImages.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-xs text-gray-600">
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
    </aside>
  )
}
