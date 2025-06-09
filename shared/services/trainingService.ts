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

// In-memory database for demo - in production, use a real database
const trainingDatabase: TrainingData[] = []

export class TrainingService {
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  static async getExactImageMatch(imageHash: string): Promise<TrainingData | null> {
    try {
      console.log(`Searching for exact match with hash: ${imageHash}`)
      console.log(`Current database has ${trainingDatabase.length} entries`)

      // Find exact image hash match
      const exactMatch = trainingDatabase.find((entry) => entry.imageHash === imageHash && entry.isComplete)

      if (exactMatch) {
        console.log(`Found exact match: ${exactMatch.id} from ${new Date(exactMatch.timestamp).toISOString()}`)
        return exactMatch
      }

      console.log(`No exact match found for hash: ${imageHash}`)
      return null
    } catch (error) {
      console.error("Error in getExactImageMatch:", error)
      return null
    }
  }

  static async getSimilarImages(detectedTerminals: string[], systemType: string): Promise<TrainingData[]> {
    try {
      console.log(
        `Looking for similar images with terminals: ${detectedTerminals.join(", ")} and system type: ${systemType}`,
      )

      const similarImages = trainingDatabase
        .filter((entry) => entry.isComplete) // Only use complete training data for similarity
        .filter((entry) => {
          const entryTerminals = entry.userVerifiedConnections
            .filter((conn) => conn.hasWire)
            .map((conn) => conn.terminal)
          const overlap = detectedTerminals.filter((terminal: string) => entryTerminals.includes(terminal))

          const hasSystemMatch = entry.systemType === systemType
          const hasTerminalOverlap = overlap.length >= Math.min(3, detectedTerminals.length * 0.6) // At least 60% overlap

          return hasSystemMatch && hasTerminalOverlap
        })

      console.log(`Found ${similarImages.length} similar images`)
      return similarImages.slice(0, 5) // Return top 5 similar
    } catch (error) {
      console.error("Error in getSimilarImages:", error)
      return []
    }
  }

  static async savePartialTrainingData(data: any): Promise<{ success: boolean; id: string; isUpdate: boolean }> {
    try {
      const trainingEntry: TrainingData = {
        id: this.generateId(),
        imageUrl: data.imageUrl,
        imageHash: data.imageHash,
        userVerifiedConnections: data.userVerifiedConnections || [],
        aiDetectedConnections: data.aiDetectedConnections || [],
        systemType: data.systemType || "unknown",
        thermostatBrand: data.thermostatBrand,
        thermostatModel: data.thermostatModel,
        imageQuality: data.imageQuality || "good",
        timestamp: Date.now(),
        userFeedback: data.userFeedback,
        isComplete: false,
        correctionType: data.correctionType || "partial_training",
      }

      // Check if we already have partial data for this image hash
      const existingIndex = trainingDatabase.findIndex(
        (entry) => entry.imageHash === trainingEntry.imageHash && !entry.isComplete,
      )

      if (existingIndex >= 0) {
        // Update existing partial entry
        trainingDatabase[existingIndex] = trainingEntry
        console.log("Updated partial training data:", trainingEntry.id)
        return { success: true, id: trainingEntry.id, isUpdate: true }
      } else {
        // Add new partial entry
        trainingDatabase.push(trainingEntry)
        console.log("Saved new partial training data:", trainingEntry.id)
        return { success: true, id: trainingEntry.id, isUpdate: false }
      }
    } catch (error) {
      console.error("Error in savePartialTrainingData:", error)
      throw error
    }
  }

  static async submitTrainingData(data: any): Promise<{ success: boolean; id: string; isUpdate: boolean }> {
    try {
      const trainingEntry: TrainingData = {
        id: this.generateId(),
        imageUrl: data.imageUrl,
        imageHash: data.imageHash,
        userVerifiedConnections: data.userVerifiedConnections || [],
        aiDetectedConnections: data.aiDetectedConnections || [],
        systemType: data.systemType || "unknown",
        thermostatBrand: data.thermostatBrand,
        thermostatModel: data.thermostatModel,
        imageQuality: data.imageQuality || "good",
        timestamp: Date.now(),
        userFeedback: data.userFeedback,
        isComplete: true,
        correctionType: data.correctionType || "interactive_training",
      }

      // Remove any partial entries for this image hash
      const partialIndex = trainingDatabase.findIndex(
        (entry) => entry.imageHash === trainingEntry.imageHash && !entry.isComplete,
      )

      if (partialIndex >= 0) {
        trainingDatabase.splice(partialIndex, 1)
        console.log("Removed partial entry, replacing with complete training")
      }

      // Check if we already have complete training for this image hash
      const existingCompleteIndex = trainingDatabase.findIndex(
        (entry) => entry.imageHash === trainingEntry.imageHash && entry.isComplete,
      )

      if (existingCompleteIndex >= 0) {
        // Update existing complete entry
        trainingDatabase[existingCompleteIndex] = trainingEntry
        console.log("Updated existing complete training data:", trainingEntry.id)
        return { success: true, id: trainingEntry.id, isUpdate: true }
      } else {
        // Add new complete entry
        trainingDatabase.push(trainingEntry)
        console.log("Saved new complete training data:", trainingEntry.id)
        return { success: true, id: trainingEntry.id, isUpdate: false }
      }
    } catch (error) {
      console.error("Error in submitTrainingData:", error)
      throw error
    }
  }

  static async getTrainingStats() {
    try {
      const completeEntries = trainingDatabase.filter((entry) => entry.isComplete)

      const stats = {
        totalImages: completeEntries.length,
        totalPartialSaves: trainingDatabase.filter((entry) => !entry.isComplete).length,
        systemTypes: {
          "heat-pump": completeEntries.filter((entry) => entry.systemType === "heat-pump").length,
          conventional: completeEntries.filter((entry) => entry.systemType === "conventional").length,
          unknown: completeEntries.filter((entry) => entry.systemType === "unknown").length,
        },
        imageQuality: {
          excellent: completeEntries.filter((entry) => entry.imageQuality === "excellent").length,
          good: completeEntries.filter((entry) => entry.imageQuality === "good").length,
          fair: completeEntries.filter((entry) => entry.imageQuality === "fair").length,
          poor: completeEntries.filter((entry) => entry.imageQuality === "poor").length,
        },
        commonTerminals: this.getTerminalFrequency(),
        uniqueImageHashes: new Set(completeEntries.map((entry) => entry.imageHash)).size,
      }

      return stats
    } catch (error) {
      console.error("Error in getTrainingStats:", error)
      throw error
    }
  }

  static getTerminalFrequency() {
    try {
      const terminalCounts: Record<string, number> = {}
      const completeEntries = trainingDatabase.filter((entry) => entry.isComplete)

      completeEntries.forEach((entry) => {
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
    } catch (error) {
      console.error("Error in getTerminalFrequency:", error)
      return []
    }
  }

  // Get all training data (for debugging)
  static getAllTrainingData(): TrainingData[] {
    return [...trainingDatabase]
  }

  // Clear all training data (for testing)
  static clearAllTrainingData(): void {
    trainingDatabase.length = 0
    console.log("Cleared all training data")
  }
}
