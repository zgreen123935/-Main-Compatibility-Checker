"use client"

import { useState } from "react"
import { InstallButton } from "./InstallButton"

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
}

interface TrainingFeedbackProps {
  originalImage: File
  imageUrl: string
  imageHash: string
  aiDetectedConnections: WireConnection[]
  userSelectedWires: string[]
  onSubmit: () => void
  onSkip: () => void
}

export function TrainingFeedback({
  originalImage,
  imageUrl,
  imageHash,
  aiDetectedConnections,
  userSelectedWires,
  onSubmit,
  onSkip,
}: TrainingFeedbackProps) {
  const [systemType, setSystemType] = useState<"heat-pump" | "conventional" | "unknown">("unknown")
  const [thermostatBrand, setThermostatBrand] = useState("")
  const [thermostatModel, setThermostatModel] = useState("")
  const [imageQuality, setImageQuality] = useState<"excellent" | "good" | "fair" | "poor">("good")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Create user-verified connections based on their selections
      const userVerifiedConnections: WireConnection[] = aiDetectedConnections.map((conn) => ({
        ...conn,
        hasWire: userSelectedWires.includes(conn.terminal),
      }))

      // Add any terminals the user selected that weren't detected by AI
      userSelectedWires.forEach((terminal) => {
        if (!aiDetectedConnections.find((conn) => conn.terminal === terminal)) {
          userVerifiedConnections.push({
            terminal,
            hasWire: true,
            confidence: 1.0, // User is certain
          })
        }
      })

      const trainingData = {
        imageUrl,
        imageHash,
        userVerifiedConnections,
        aiDetectedConnections,
        systemType,
        thermostatBrand: thermostatBrand || undefined,
        thermostatModel: thermostatModel || undefined,
        imageQuality,
        userFeedback: feedback || undefined,
      }

      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "submit_training",
          data: trainingData,
        }),
      })

      if (response.ok) {
        console.log("Training data submitted successfully")
      } else {
        console.error("Failed to submit training data")
      }
    } catch (error) {
      console.error("Error submitting training data:", error)
    } finally {
      setIsSubmitting(false)
      onSubmit()
    }
  }

  const aiCorrect =
    aiDetectedConnections.filter((conn) => conn.hasWire).length === userSelectedWires.length &&
    aiDetectedConnections.every((conn) => conn.hasWire === userSelectedWires.includes(conn.terminal))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">Help Improve Our AI</h3>

        <p className="text-[#4B5563] mb-4">
          Your feedback helps us improve wire detection for everyone. This is optional but greatly appreciated!
        </p>

        {aiCorrect ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-green-800 mb-2">🎯 Perfect Detection!</h4>
            <p className="text-green-700 text-sm">
              Our AI correctly identified all your wire connections. Thank you for confirming!
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">🔧 Detection Corrections</h4>
            <p className="text-yellow-700 text-sm mb-3">
              You made corrections to our AI detection. This feedback is valuable for improving accuracy.
            </p>

            <div className="text-sm">
              <div className="mb-2">
                <strong>AI detected:</strong>{" "}
                {aiDetectedConnections
                  .filter((conn) => conn.hasWire)
                  .map((conn) => conn.terminal)
                  .join(", ") || "None"}
              </div>
              <div>
                <strong>You selected:</strong> {userSelectedWires.join(", ") || "None"}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-2">System Type:</label>
            <div className="flex gap-2">
              {(["heat-pump", "conventional", "unknown"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSystemType(type)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    systemType === type ? "bg-[#BAE5D4] text-[#2D2D2D]" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type === "heat-pump" ? "Heat Pump" : type === "conventional" ? "Conventional" : "Unknown"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Thermostat Brand (optional):</label>
              <input
                type="text"
                value={thermostatBrand}
                onChange={(e) => setThermostatBrand(e.target.value)}
                placeholder="e.g., Honeywell, Nest, Ecobee"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Model (optional):</label>
              <input
                type="text"
                value={thermostatModel}
                onChange={(e) => setThermostatModel(e.target.value)}
                placeholder="e.g., RTH9585WF"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Photo Quality:</label>
            <div className="flex gap-2">
              {(["excellent", "good", "fair", "poor"] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => setImageQuality(quality)}
                  className={`px-3 py-2 rounded-lg text-sm capitalize ${
                    imageQuality === quality
                      ? "bg-[#BAE5D4] text-[#2D2D2D]"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Additional Feedback (optional):</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any issues with detection? Suggestions for improvement?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <InstallButton title="Submit Feedback" onPress={handleSubmit} loading={isSubmitting} className="flex-1" />
          <InstallButton title="Skip" onPress={onSkip} variant="secondary" className="flex-1" />
        </div>
      </div>
    </div>
  )
}
