import type React from "react"

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <p className="text-sm text-gray-500 mt-2">캔버스 로딩 중...</p>
    </div>
  )
}

export default LoadingSpinner
