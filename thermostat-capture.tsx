import { Button } from "@/components/ui/button"
import { Camera, Info } from "lucide-react"

export default function ThermostatCapture() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 py-8 flex flex-col">
        <div className="max-w-md mx-auto w-full space-y-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Take a photo of your thermostat</h1>
            <p className="text-gray-600 text-lg">
              Make sure the entire thermostat is visible and the model number is clear.
            </p>
          </div>

          {/* Camera Viewfinder (Placeholder) */}
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <Camera className="h-24 w-24 text-gray-400" />
          </div>

          {/* Tip Section */}
          <div className="bg-[#BAE5D4] rounded-lg p-4 flex items-start space-x-3">
            <Info className="h-5 w-5 text-[#2D2D2D] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#2D2D2D]">
              <p>Ensure good lighting, avoid glare or shadows, and keep the camera steady for the best results.</p>
            </div>
          </div>

          {/* Capture Button */}
          <Button className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white">Capture Photo</Button>
        </div>
      </main>
    </div>
  )
}

