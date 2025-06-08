"use client"

import type React from "react"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function UploadPhoto() {
  const { dispatch } = useInstall()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [detectedSystem, setDetectedSystem] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      dispatch({ type: "SET_PHOTO", url })

      // Simulate image analysis
      analyzeImage(url)
    }
  }

  const analyzeImage = async (imageUrl: string) => {
    setIsAnalyzing(true)

    // In a real implementation, we would use a proper image analysis service
    // This is just a simulation for demonstration purposes
    setTimeout(() => {
      // Randomly determine if it's a heat pump or conventional system
      // In a real implementation, this would be based on actual image analysis
      const isHeatPump = Math.random() > 0.5
      setDetectedSystem(isHeatPump ? "heat-pump" : "conventional")
      setIsAnalyzing(false)
      setAnalysisComplete(true)
    }, 2000)
  }

  const handleSystemConfirmation = (isHeatPump: boolean) => {
    dispatch({ type: "SET_ANSWER", key: "heatPump", value: isHeatPump })
    handleContinue()
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "upload-photo" })
    dispatch({ type: "SET_STEP", step: "remove-cover" })
  }

  const handleSkip = () => {
    dispatch({ type: "COMPLETE_STEP", step: "upload-photo" })
    dispatch({ type: "SET_STEP", step: "remove-cover" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Document Your Wiring</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Take a photo of your current thermostat wiring. Make sure all wires and labels are clearly visible—this will
            help later when connecting wires to your new Mysa.
          </p>
        </div>

        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8">
          {previewUrl ? (
            <div>
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Wiring photo preview"
                className="max-w-full h-64 object-contain mx-auto mb-4 rounded"
              />

              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-[#BAE5D4] border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-[#4B5563]">Analyzing wiring...</p>
                </div>
              ) : analysisComplete && detectedSystem ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-800 mb-2">System Detection Results:</h3>
                  <p className="text-blue-700 mb-3">
                    We detected what appears to be a {detectedSystem === "heat-pump" ? "heat pump" : "conventional"}{" "}
                    system. Is this correct?
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleSystemConfirmation(detectedSystem === "heat-pump")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Yes, that's correct
                    </button>
                    <button
                      onClick={() => handleSystemConfirmation(detectedSystem !== "heat-pump")}
                      className="bg-white text-blue-600 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50"
                    >
                      No, it's a {detectedSystem === "heat-pump" ? "conventional" : "heat pump"} system
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-green-600 font-medium">Photo uploaded successfully!</p>
              )}
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">📷</div>
              <p className="text-[#6B7280] mb-4">Upload a photo of your current wiring</p>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="photo-upload" />
              <label
                htmlFor="photo-upload"
                className="inline-block bg-[#2D2D2D] text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Choose Photo
              </label>
              <p className="text-sm text-[#6B7280] mt-2">JPG or PNG, max 5MB</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!analysisComplete && (
            <InstallButton
              title={selectedFile ? "Continue with Photo" : "Continue"}
              onPress={handleContinue}
              className="w-full"
            />
          )}

          <InstallButton
            title="Skip (I already documented)"
            onPress={handleSkip}
            variant="secondary"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
