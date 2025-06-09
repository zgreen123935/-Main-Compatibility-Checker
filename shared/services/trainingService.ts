import { promises as fs } from "fs"
import path from "path"

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

export class TrainingService {
  private static readonly DATA_FILE = path.join(process.cwd(), "data", "training-data.json")
  private static cache: TrainingData[] | null = null

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Ensure data directory exists
  private static async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(this.DATA_FILE)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }
  }

  // Load training data from file
  private static async loadTrainingData(): Promise<TrainingData[]> {
    if (this.cache !== null) {
      return this.cache
    }

    try {
      await this.ensureDataDirectory()
      const data = await fs.readFile(this.DATA_FILE, "utf-8")
      this.cache = JSON.parse(data)
      console.log(`Loaded ${this.cache.length} training entries from file`)
      return this.cache
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
      console.log("No existing training data found, starting fresh")
      this.cache = []
      return this.cache
    }
  }

  // Save training data to file
  private static async saveTrainingData(data: TrainingData[]): Promise<void> {
    try {
      await this.ensureDataDirectory()
      await fs.writeFile(this.DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
      this.cache = data
      console.log(`Saved ${data.length} training entries to file`)
    } catch (error) {
      console.error("Failed to save training data:", error)
      throw error
    }
  }

  static async getExactImageMatch(imageHash: string): Promise<TrainingData | null> {
    try {
      console.log(`Searching for exact match with hash: ${imageHash}`)
      const trainingDatabase = await this.loadTrainingData()
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

      const trainingDatabase = await this.loadTrainingData()
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
      const trainingDatabase = await this.loadTrainingData()

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
        await this.saveTrainingData(trainingDatabase)
        console.log("Updated partial training data:", trainingEntry.id)
        return { success: true, id: trainingEntry.id, isUpdate: true }
      } else {
        // Add new partial entry
        trainingDatabase.push(trainingEntry)
        await this.saveTrainingData(trainingDatabase)
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
      const trainingDatabase = await this.loadTrainingData()

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
        await this.saveTrainingData(trainingDatabase)
        console.log("Updated existing complete training data:", trainingEntry.id)
        return { success: true, id: trainingEntry.id, isUpdate: true }
      } else {
        // Add new complete entry
        trainingDatabase.push(trainingEntry)
        await this.saveTrainingData(trainingDatabase)
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
      const trainingDatabase = await this.loadTrainingData()
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
        commonTerminals: await this.getTerminalFrequency(),
        uniqueImageHashes: new Set(completeEntries.map((entry) => entry.imageHash)).size,
        dataFile: this.DATA_FILE,
        lastModified: await this.getLastModified(),
      }

      return stats
    } catch (error) {
      console.error("Error in getTrainingStats:", error)
      throw error
    }
  }

  static async getTerminalFrequency() {
    try {
      const trainingDatabase = await this.loadTrainingData()
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

  // Get last modified time of data file
  private static async getLastModified(): Promise<string | null> {
    try {
      const stats = await fs.stat(this.DATA_FILE)
      return stats.mtime.toISOString()
    } catch {
      return null
    }
  }

  // Get all training data (for debugging)
  static async getAllTrainingData(): Promise<TrainingData[]> {
    const trainingDatabase = await this.loadTrainingData()
    return [...trainingDatabase]
  }

  // Clear all training data (for testing)
  static async clearAllTrainingData(): Promise<void> {
    try {
      this.cache = []
      await this.saveTrainingData([])
      console.log("Cleared all training data")
    } catch (error) {
      console.error("Error clearing training data:", error)
      throw error
    }
  }

  // Export training data to JSON
  static async exportTrainingData(): Promise<string> {
    const trainingDatabase = await this.loadTrainingData()
    return JSON.stringify(trainingDatabase, null, 2)
  }

  // Import training data from JSON
  static async importTrainingData(jsonData: string): Promise<{ success: boolean; imported: number; errors: number }> {
    try {
      const importedData = JSON.parse(jsonData) as TrainingData[]

      if (!Array.isArray(importedData)) {
        throw new Error("Invalid data format - expected array")
      }

      const currentData = await this.loadTrainingData()
      let imported = 0
      let errors = 0

      for (const entry of importedData) {
        try {
          // Validate entry structure
          if (!entry.id || !entry.imageHash || !entry.timestamp) {
            errors++
            continue
          }

          // Check if entry already exists
          const existingIndex = currentData.findIndex((existing) => existing.imageHash === entry.imageHash)

          if (existingIndex >= 0) {
            // Update existing entry if imported one is newer
            if (entry.timestamp > currentData[existingIndex].timestamp) {
              currentData[existingIndex] = entry
              imported++
            }
          } else {
            // Add new entry
            currentData.push(entry)
            imported++
          }
        } catch (entryError) {
          console.error("Error processing entry:", entryError)
          errors++
        }
      }

      await this.saveTrainingData(currentData)
      console.log(`Import completed: ${imported} imported, ${errors} errors`)

      return { success: true, imported, errors }
    } catch (error) {
      console.error("Error importing training data:", error)
      throw error
    }
  }
}
