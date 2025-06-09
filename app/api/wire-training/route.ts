import { type NextRequest, NextResponse } from "next/server"
import { TrainingService } from "../../../shared/services/trainingService"

export async function POST(req: NextRequest) {
  try {
    console.log("Wire training API called")

    const body = await req.json()
    const { action, data } = body

    console.log(`Training API called with action: ${action}`)

    switch (action) {
      case "submit_training":
        console.log("Submitting training data...")
        const submitResult = await TrainingService.submitTrainingData(data)
        return NextResponse.json({
          success: true,
          id: submitResult.id,
          message: "Training data submitted successfully",
          isUpdate: submitResult.isUpdate,
        })

      case "save_partial":
        console.log("Saving partial training data...")
        const partialResult = await TrainingService.savePartialTrainingData(data)
        return NextResponse.json({
          success: true,
          id: partialResult.id,
          message: "Partial training data saved successfully",
          isUpdate: partialResult.isUpdate,
        })

      case "get_exact_match":
        console.log("Getting exact match for hash:", data.imageHash)
        const exactMatch = await TrainingService.getExactImageMatch(data.imageHash)
        return NextResponse.json({
          success: true,
          exactMatch,
          message: exactMatch ? "Exact image match found" : "No exact match found",
        })

      case "get_similar":
        console.log("Getting similar images...")
        const similarImages = await TrainingService.getSimilarImages(data.detectedTerminals, data.systemType)
        return NextResponse.json({
          success: true,
          similarImages,
          totalSimilar: similarImages.length,
        })

      case "get_stats":
        console.log("Getting training stats...")
        const stats = await TrainingService.getTrainingStats()
        return NextResponse.json({ success: true, stats })

      case "get_all_data":
        // Debug endpoint
        console.log("Getting all training data...")
        const allData = TrainingService.getAllTrainingData()
        return NextResponse.json({ success: true, data: allData })

      case "clear_all_data":
        // Debug endpoint
        console.log("Clearing all training data...")
        TrainingService.clearAllTrainingData()
        return NextResponse.json({ success: true, message: "All training data cleared" })

      default:
        console.error("Invalid action:", action)
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Training API error:", error)

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : "No stack trace"

    console.error("Error details:", { message: errorMessage, stack: errorStack })

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
