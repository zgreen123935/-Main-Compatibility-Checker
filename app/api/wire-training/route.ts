import { type NextRequest, NextResponse } from "next/server"
import { SupabaseTrainingService } from "../../../shared/services/supabaseTrainingService"

export async function POST(req: NextRequest) {
  try {
    console.log("Wire training API called")

    const body = await req.json()
    const { action, data } = body

    console.log(`Training API called with action: ${action}`)

    switch (action) {
      case "submit_training":
        console.log("Submitting training data to Supabase...")
        const submitResult = await SupabaseTrainingService.submitTrainingData(data)
        return NextResponse.json({
          success: true,
          id: submitResult.id,
          message: "Training data submitted to Supabase successfully",
          isUpdate: submitResult.isUpdate,
        })

      case "save_partial":
        console.log("Saving partial training data to Supabase...")
        const partialResult = await SupabaseTrainingService.savePartialTrainingData(data)
        return NextResponse.json({
          success: true,
          id: partialResult.id,
          message: "Partial training data saved to Supabase successfully",
          isUpdate: partialResult.isUpdate,
        })

      case "get_exact_match":
        console.log("Getting exact match from Supabase for hash:", data.imageHash)
        const exactMatch = await SupabaseTrainingService.getExactImageMatch(data.imageHash)
        return NextResponse.json({
          success: true,
          exactMatch,
          message: exactMatch ? "Exact image match found in Supabase" : "No exact match found in Supabase",
        })

      case "get_similar":
        console.log("Getting similar images from Supabase...")
        const similarImages = await SupabaseTrainingService.getSimilarImages(data.detectedTerminals, data.systemType)
        return NextResponse.json({
          success: true,
          similarImages,
          totalSimilar: similarImages.length,
        })

      case "get_stats":
        console.log("Getting training stats from Supabase...")
        const stats = await SupabaseTrainingService.getTrainingStats()
        return NextResponse.json({ success: true, stats })

      case "get_all_data":
        // Debug endpoint
        console.log("Getting all training data...")
        const allData = await SupabaseTrainingService.getAllTrainingData()
        return NextResponse.json({ success: true, data: allData })

      case "clear_all_data":
        // Debug endpoint
        console.log("Clearing all training data...")
        await SupabaseTrainingService.clearAllTrainingData()
        return NextResponse.json({ success: true, message: "All training data cleared" })

      case "export_data":
        console.log("Exporting training data...")
        const exportData = await SupabaseTrainingService.exportTrainingData()
        return NextResponse.json({
          success: true,
          data: exportData,
          message: "Training data exported successfully",
        })

      case "import_data":
        console.log("Importing training data...")
        const importResult = await SupabaseTrainingService.importTrainingData(data.jsonData)
        return NextResponse.json({
          success: true,
          imported: importResult.imported,
          errors: importResult.errors,
          message: `Import completed: ${importResult.imported} entries imported, ${importResult.errors} errors`,
        })

      case "get_learning_insights":
        console.log("Getting learning insights from Supabase...")
        const learningInsights = await SupabaseTrainingService.getLearningInsights()
        return NextResponse.json({ success: true, insights: learningInsights })

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
