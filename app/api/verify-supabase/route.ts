import { type NextRequest, NextResponse } from "next/server"
import { SupabaseTrainingService } from "../../../shared/services/supabaseTrainingService"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    console.log(`Supabase verification API called with action: ${action}`)

    switch (action) {
      case "verify_connection":
        console.log("Verifying Supabase connection...")
        const connectionResult = await SupabaseTrainingService.verifyConnection()
        return NextResponse.json(connectionResult)

      case "test_data_flow":
        console.log("Testing data flow...")
        const dataFlowResult = await SupabaseTrainingService.testDataFlow()
        return NextResponse.json(dataFlowResult)

      case "get_stats":
        console.log("Getting training statistics...")
        const stats = await SupabaseTrainingService.getTrainingStats()
        return NextResponse.json({ success: true, stats })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Verification API error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        success: false,
        message: "Verification failed",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
