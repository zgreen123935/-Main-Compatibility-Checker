import { type NextRequest, NextResponse } from "next/server"
import { TrainingService } from "../../shared/services/trainingService"

interface TrainingData {
  id: string
  imageUrl: string
  imageHash: string
  userVerifiedConnections: WireConnection[]
  aiDetectedConnections: WireConnection[]
  systemType: "heat-pump" | "conventional" | "unknown"
  thermostatBrand?: string
  thermostatModel?: string
  imageQuality: "excellent" | "good" | "fair" | "poor"
  timestamp: number
  userFeedback?: string
  isComplete?: boolean
  correctionType?: string
}

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
}

// In a real app, this would be a proper database
// const trainingDatabase: TrainingData[] = []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, data } = body

    console.log(`Training API called with action: ${action}`)

    switch (action) {
      case "submit_training":
        const submitResult = await TrainingService.submitTrainingData(data)
        return NextResponse.json({
          success: true,
          id: submitResult.id,
          message: "Training data submitted successfully",
          isUpdate: submitResult.isUpdate,
        })

      case "save_partial":
        const partialResult = await TrainingService.savePartialTrainingData(data)
        return NextResponse.json({
          success: true,
          id: partialResult.id,
          message: "Partial training data saved successfully",
          isUpdate: partialResult.isUpdate,
        })

      case "get_exact_match":
        const exactMatch = await TrainingService.getExactImageMatch(data.imageHash)
        return NextResponse.json({
          success: true,
          exactMatch,
          message: exactMatch ? "Exact image match found" : "No exact match found",
        })

      case "get_similar":
        const similarImages = await TrainingService.getSimilarImages(data.detectedTerminals, data.systemType)
        return NextResponse.json({
          success: true,
          similarImages,
          totalSimilar: similarImages.length,
        })

      case "get_stats":
        const stats = await TrainingService.getTrainingStats()
        return NextResponse.json({ success: true, stats })

      case "get_all_data":
        // Debug endpoint
        const allData = TrainingService.getAllTrainingData()
        return NextResponse.json({ success: true, data: allData })

      case "clear_all_data":
        // Debug endpoint
        TrainingService.clearAllTrainingData()
        return NextResponse.json({ success: true, message: "All training data cleared" })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Training API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Removed local functions as they are now handled by TrainingService
