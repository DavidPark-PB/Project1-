import { Card, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"

export function PhotocardCanvas() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 min-h-[400px] md:min-h-0">
      <Card className="w-[280px] h-[420px] sm:w-[300px] sm:h-[450px] bg-purple-100 border-2 border-purple-300 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        <CardContent className="p-0 w-full h-full flex items-center justify-center">
          {/* This is where the photocard content (image, stickers, text) would be rendered */}
          <div className="text-gray-400 text-lg">{/* Placeholder for photocard content */}</div>
        </CardContent>
      </Card>
      <div className="mt-4 text-base md:text-sm text-gray-600 flex items-center gap-1">
        My Premium IVE Photocard :) <Heart className="w-4 h-4 text-red-500" />
      </div>
    </div>
  )
}
