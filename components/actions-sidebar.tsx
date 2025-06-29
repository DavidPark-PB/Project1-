import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Trash2, Copy, Music } from "lucide-react"

export function ActionsSidebar() {
  return (
    <aside className="w-64 space-y-4 flex-shrink-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Save className="w-4 h-4" /> 작업
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" /> 프리미엄 저장하기
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            <Trash2 className="w-4 h-4 mr-2" /> 모두 지우기
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Copy className="w-4 h-4" /> 단축키
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between items-center">
            <span>복사</span>
            <span className="font-mono text-gray-500">Ctrl+C</span>
          </div>
          <div className="flex justify-between items-center">
            <span>붙여넣기</span>
            <span className="font-mono text-gray-500">Ctrl+V</span>
          </div>
          <div className="flex justify-between items-center">
            <span>삭제</span>
            <span className="font-mono text-gray-500">Delete</span>
          </div>
          <div className="flex justify-between items-center">
            <span>회전</span>
            <span className="font-mono text-gray-500">R</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Music className="w-4 h-4" /> 효과음
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          스티커, 테이프, 도형을 추가할 때 효과음이 재생됩니다!
        </CardContent>
      </Card>
    </aside>
  )
}
