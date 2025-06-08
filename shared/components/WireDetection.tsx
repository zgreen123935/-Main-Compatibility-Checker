"use client"

import type React from "react"

import { useState, useRef } from "react"
import { InstallButton } from "./InstallButton"
import { createWorker } from "tesseract.js"
import { useInstall } from "../context/InstallContext"

interface WireDetectionProps {
  onWiresDetected: (wires: string[]) => void
  onSkip: () => void
}

export function WireDetection({ onWiresDetected, onSkip }: WireDetectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [detectedWires, setDetectedWires] = useState<string[]>([])
  const [ocrComplete, setOcrComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { state } = useInstall()

  // Common thermostat wire labels to look for
  const commonWireLabels = ["R", "Rh", "Rc", "W", "W1", "W2", "Y", "Y1", "Y2", "G", "C", "O", "B", "E", "AUX"]

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Process the image with OCR
    await processImage(url)
  }

  const processImage = async (imageUrl: string) => {
    setIsProcessing(true)

    try {
      // Initialize Tesseract.js worker
      const worker = await createWorker()

      // Set options to optimize for thermostat terminal labels
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/",
      })

      // Recognize text in the image
      const { data } = await worker.recognize(imageUrl)

      // Process the OCR results to find wire labels
      const detectedLabels = findWireLabels(data.text, commonWireLabels)
      setDetectedWires(detectedLabels)

      // Terminate worker to free memory
      await worker.terminate()
      setOcrComplete(true)
    } catch (error) {
      console.error("OCR processing error:", error)
      alert("Error processing image. Please try again or use manual selection.")
    } finally {
      setIsProcessing(false)
    }
  }

  const findWireLabels = (text: string, labelList: string[]): string[] => {
    // Convert text to uppercase and remove spaces
    const normalizedText = text.toUpperCase().replace(/\s/g, "")

    // Find all occurrences of wire labels in the text
    const foundLabels: string[] = []

    labelList.forEach((label) => {
      // Look for the label surrounded by non-alphanumeric characters or at string boundaries
      const regex = new RegExp(`(^|[^A-Z0-9])${label}([^A-Z0-9]|$)`, "g")
      if (regex.test(normalizedText)) {
        foundLabels.push(label)
      }
    })

    return foundLabels
  }

  const handleConfirm = () => {
    onWiresDetected(detectedWires)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">Automatic Wire Detection</h3>

      <div className="mb-6">
        <p className="text-[#4B5563] mb-4">
          Take a clear photo of your thermostat wiring terminals with labels visible. Our system will try to identify
          the wire connections automatically.
        </p>

        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" ref={fileInputRef} />

        {!previewUrl ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#BAE5D4]"
            onClick={triggerFileInput}
          >
            <div className="text-6xl mb-4">📷</div>
            <p className="text-[#6B7280] mb-2">Click to upload a photo of your thermostat wiring</p>
            <p className="text-sm text-[#6B7280]">JPG or PNG, max 5MB</p>
          </div>
        ) : (
          <div className="text-center">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Thermostat wiring"
              className="max-h-64 mx-auto mb-4 rounded-lg"
            />

            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-[#BAE5D4] border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-[#4B5563]">Analyzing image...</p>
              </div>
            ) : ocrComplete ? (
              <div>
                <h4 className="font-medium text-[#2D2D2D] mb-2">Detected Wires:</h4>
                {detectedWires.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {detectedWires.map((wire) => (
                      <span key={wire} className="bg-[#BAE5D4] text-[#2D2D2D] px-3 py-1 rounded-full font-medium">
                        {wire}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-yellow-600 mb-4">
                    No wire labels detected. Try another photo or use manual selection.
                  </p>
                )}

                <div className="flex gap-2 justify-center">
                  <button onClick={triggerFileInput} className="text-[#2D2D2D] underline">
                    Try another photo
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <InstallButton
          title={detectedWires.length > 0 ? "Confirm Detected Wires" : "Upload Photo"}
          onPress={detectedWires.length > 0 ? handleConfirm : triggerFileInput}
          disabled={isProcessing}
          loading={isProcessing}
        />
        <InstallButton title="Skip - Select Wires Manually" onPress={onSkip} variant="secondary" />
      </div>
    </div>
  )
}
