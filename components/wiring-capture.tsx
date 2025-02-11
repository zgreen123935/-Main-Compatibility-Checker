"use client"

import { Button } from "@/components/ui/button"
import { Camera, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { SharedHeader } from "./shared-header"

export default function WiringCapture() {
  const router = useRouter()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 py-8 pt-[calc(72px+2rem)] flex flex-col">
        {/* Header */}
        <SharedHeader currentStep={4} />
        <div className="max-w-md mx-auto w-full space-y-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">
              Take a photo of your thermostat wiring
            </h1>
            <p className="text-gray-600 text-lg">
              Remove the thermostat cover and capture a clear image of the exposed wires.
            </p>
          </div>

          {/* Camera Upload */}
          {uploadedImage ? (
            <div className="aspect-video w-full flex items-center justify-center border-2 border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Captured wiring"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <label
              htmlFor="camera-upload"
              className="aspect-video w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <Camera className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm text-center">Tap here to take a photo or upload from camera roll</p>
              <input
                id="camera-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                      setUploadedImage(e.target?.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </label>
          )}

          {/* Tip Section */}
          <div className="bg-[#BAE5D4] rounded-lg p-4 flex items-start space-x-3">
            <Info className="h-5 w-5 text-[#2D2D2D] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#2D2D2D]">
              <p>
                For best results, ensure adequate lighting, hold your camera steady, and take photos in landscape
                orientation.
              </p>
            </div>
          </div>

          {/* Capture Button */}
          {uploadedImage && (
            <Button
              className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white mt-4"
              onClick={() => router.push("/analysis")}
            >
              Continue
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

