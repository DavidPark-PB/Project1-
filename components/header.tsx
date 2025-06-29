import { Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white p-4 border-b border-purple-100 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold text-purple-700 flex items-center gap-2">
        IVE 포토카드 꾸미기 <Sparkles className="w-6 h-6 text-yellow-500" />
      </h1>
      <p className="text-sm text-gray-600 mt-1">실제 IVE 멤버 이미지로 나만의 특별한 포토카드를 만들어보세요!</p>
    </header>
  )
}
