import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Trash2, Copy, Music } from "lucide-react"

export function ActionsPanel() {
  return (
    <div className="w-full space-y-4">
      {" "}
      {/* Removed fixed width for mobile flexibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-base flex items-center gap-2">
            <Save className="w-5 h-5 md:w-4 md:h-4" /> 작업
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:gap-1">
          <Button className="w-full bg-purple-600 text-white hover:bg-purple-700 h-12 text-base">
            <Save className="w-5 h-5 mr-2" /> 프리미엄 저장하기
          </Button>
          <Button variant="outline" className="w-full bg-transparent h-12 text-base">
            <Trash2 className="w-5 h-5 mr-2" /> 모두 지우기
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-base flex items-center gap-2">
            <Copy className="w-5 h-5 md:w-4 md:h-4" /> 단축키
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:gap-1 text-base md:text-sm">
          <div className="flex justify-between items-center py-1">
            <span>복사</span>
            <span className="font-mono text-gray-500">Ctrl+C</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>붙여넣기</span>
            <span className="font-mono text-gray-500">Ctrl+V</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>삭제</span>
            <span className="font-mono text-gray-500">Delete</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span>회전</span>
            <span className="font-mono text-gray-500">R</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-base flex items-center gap-2">
            <Music className="w-5 h-5 md:w-4 md:h-4" /> 효과음
          </CardTitle>
        </CardHeader>
        <CardContent className="text-base md:text-sm text-gray-600">
          스티커, 테이프, 도형을 추가할 때 효과음이 재생됩니다!
        </CardContent>
      </Card>
    </div>
  )
}
