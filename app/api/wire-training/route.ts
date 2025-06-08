import { type NextRequest, NextResponse } from "next/server"

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
}

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
}

// In a real app, this would be a proper database
const trainingDatabase: TrainingData[] = []

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, data } = body

    switch (action) {
      case "submit_training":
        return await submitTrainingData(data)
      case "get_similar":
        return await getSimilarImages(data)
      case "get_stats":
        return await getTrainingStats()
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Training API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function submitTrainingData(data: any) {
  const trainingEntry: TrainingData = {
    id: generateId(),
    imageUrl: data.imageUrl,
    imageHash: data.imageHash,
    userVerifiedConnections: data.userVerifiedConnections,
    aiDetectedConnections: data.aiDetectedConnections,
    systemType: data.systemType,
    thermostatBrand: data.thermostatBrand,
    thermostatModel: data.thermostatModel,
    imageQuality: data.imageQuality,
    timestamp: Date.now(),
    userFeedback: data.userFeedback,
  }

  trainingDatabase.push(trainingEntry)

  // In a real implementation, save to database
  console.log("Training data submitted:", trainingEntry.id)

  return NextResponse.json({
    success: true,
    id: trainingEntry.id,
    message: "Training data submitted successfully",
  })
}

async function getSimilarImages(data: any) {
  // Find similar configurations in our training database
  const { detectedTerminals, systemType } = data

  const similarImages = trainingDatabase.filter((entry) => {
    const entryTerminals = entry.userVerifiedConnections.map((conn) => conn.terminal)
    const overlap = detectedTerminals.filter((terminal: string) => entryTerminals.includes(terminal))

    return (
      entry.systemType === systemType && overlap.length >= Math.min(3, detectedTerminals.length * 0.6) // At least 60% overlap
    )
  })

  return NextResponse.json({
    success: true,
    similarImages: similarImages.slice(0, 5), // Return top 5 similar
    totalSimilar: similarImages.length,
  })
}

async function getTrainingStats() {
  const stats = {
    totalImages: trainingDatabase.length,
    systemTypes: {
      "heat-pump": trainingDatabase.filter((entry) => entry.systemType === "heat-pump").length,
      conventional: trainingDatabase.filter((entry) => entry.systemType === "conventional").length,
      unknown: trainingDatabase.filter((entry) => entry.systemType === "unknown").length,
    },
    imageQuality: {
      excellent: trainingDatabase.filter((entry) => entry.imageQuality === "excellent").length,
      good: trainingDatabase.filter((entry) => entry.imageQuality === "good").length,
      fair: trainingDatabase.filter((entry) => entry.imageQuality === "fair").length,
      poor: trainingDatabase.filter((entry) => entry.imageQuality === "poor").length,
    },
    commonTerminals: getTerminalFrequency(),
  }

  return NextResponse.json({ success: true, stats })
}

function getTerminalFrequency() {
  const terminalCounts: Record<string, number> = {}

  trainingDatabase.forEach((entry) => {
    entry.userVerifiedConnections.forEach((conn) => {
      if (conn.hasWire) {
        terminalCounts[conn.terminal] = (terminalCounts[conn.terminal] || 0) + 1
      }
    })
  })

  return Object.entries(terminalCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([terminal, count]) => ({ terminal, count }))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
