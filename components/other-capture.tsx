"use client"

import { Button } from "@/components/ui/button"
import { Camera, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { SharedLayout } from "./SharedLayout"

export default function OtherCapture() {
  const router = useRouter()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const { dispatch } = useAppContext()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImages((prev) => [...prev, result])
        dispatch({ type: "SET_AC_UNIT_IMAGE", payload: result }) // Assuming we're using the same action for simplicity
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <SharedLayout showBack currentStep={2}>
      <div className="space-y-4">
        <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Capture Your Control System</h1>
        <p className="text-gray-600 text-lg">
          Take clear photos of your control interface and any model numbers or specifications.
        </p>
      </div>

      <div className="space-y-4">
        {uploadedImages.map((image, index) => (
          <div
            key={index}
            className="aspect-video w-full flex items-center justify-center border-2 border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
          >
            <img
              src={image || "/placeholder.svg"}
              alt={`Captured image ${index + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
        <label
          htmlFor="image-upload"
          className="aspect-video w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <Camera className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600 text-sm text-center">Tap here to take a photo or upload from camera roll</p>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      <div className="bg-[#BAE5D4] rounded-lg p-4 flex items-start space-x-3">
        <Info className="h-5 w-5 text-[#2D2D2D] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#2D2D2D]">
          <p>
            Ensure all important details are visible, use good lighting, and keep the camera steady for the best
            results.
          </p>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <Button
          className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white mt-4"
          onClick={() => router.push("/analysis")}
        >
          Continue
        </Button>
      )}
    </SharedLayout>
  )
}

