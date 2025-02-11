"use client"

import { Button } from "@/components/ui/button"
import { Camera, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { SharedLayout } from "./SharedLayout"

export default function BackRemoteCapture() {
  const router = useRouter()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const { dispatch } = useAppContext()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
        dispatch({ type: "SET_BACK_REMOTE_IMAGE", payload: result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <SharedLayout showBack currentStep={3}>
      <div className="space-y-4">
        <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Take a photo of your remote's back</h1>
        <p className="text-gray-600 text-lg">
          Make sure the entire back of the remote is visible, including any model numbers or battery compartments.
        </p>
      </div>

      {uploadedImage ? (
        <div className="aspect-video w-full flex items-center justify-center border-2 border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
          <img
            src={uploadedImage || "/placeholder.svg"}
            alt="Captured remote back"
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <label
          htmlFor="camera-upload"
          className="aspect-video w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <Camera className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600 text-sm text-center">
            Tap here to take a photo or upload one from your camera roll
          </p>
          <input
            id="camera-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      )}

      <div className="bg-[#BAE5D4] rounded-lg p-4 flex items-start space-x-3">
        <Info className="h-5 w-5 text-[#2D2D2D] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#2D2D2D]">
          <p>
            For best results, ensure adequate lighting, hold your camera steady, and take photos in landscape
            orientation.
          </p>
        </div>
      </div>

      {uploadedImage && (
        <Button
          className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white mt-4"
          onClick={() => router.push("/capture/AC-unit")}
        >
          Continue
        </Button>
      )}
    </SharedLayout>
  )
}

