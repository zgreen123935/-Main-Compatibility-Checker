import { createServerComponentClient } from "../../lib/supabase"
import type { Database } from "../../lib/database.types"

type TrainingData = Database["public"]["Tables"]["training_data"]["Row"]
type TrainingDataInsert = Database["public"]["Tables"]["training_data"]["Insert"]

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
  x?: number
  y?: number
}

export class SupabaseTrainingService {
  private static supabase = createServerComponentClient()

  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Store image in Supabase Storage and return public URL
  static async storeImage(imageFile: File, imageHash: string): Promise<string> {
    try {
      const fileName = `training-images/${imageHash}.${imageFile.type.split("/")[1]}`

      const { data, error } = await this.supabase.storage.from("training-images").upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        console.error("Error uploading image:", error)
        throw error
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from("training-images").getPublicUrl(fileName)

      console.log(`Image stored successfully: ${publicUrl}`)
      return publicUrl
    } catch (error) {
      console.error("Error in storeImage:", error)
      throw error
    }
  }

  // Get exact image match by hash
  static async getExactImageMatch(imageHash: string): Promise<TrainingData | null> {
    try {
      console.log(`Searching for exact match with hash: ${imageHash}`)

      const { data, error } = await this.supabase
        .from("training_data")
        .select("*")
        .eq("image_hash", imageHash)
        .eq("is_complete", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error in getExactImageMatch:", error)
        throw error
      }

      if (data) {
        console.log(`Found exact match: ${data.id} from ${data.created_at}`)
        return data
      }

      console.log(`No exact match found for hash: ${imageHash}`)
      return null
    } catch (error) {
      console.error("Error in getExactImageMatch:", error)
      return null
    }
  }

  // Get similar images based on terminals and system type
  static async getSimilarImages(detectedTerminals: string[], systemType: string): Promise<TrainingData[]> {
    try {
      console.log(
        `Looking for similar images with terminals: ${detectedTerminals.join(", ")} and system type: ${systemType}`,
      )

      // Query for similar configurations
      const { data, error } = await this.supabase
        .from("training_data")
        .select("*")
        .eq("system_type", systemType)
        .eq("is_complete", true)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error in getSimilarImages:", error)
        throw error
      }

      // Filter by terminal overlap in JavaScript (could be optimized with SQL functions)
      const similarImages = data.filter((entry) => {
        const userConnections = entry.user_verified_connections as WireConnection[]
        const entryTerminals = userConnections.filter((conn) => conn.hasWire).map((conn) => conn.terminal)

        const overlap = detectedTerminals.filter((terminal) => entryTerminals.includes(terminal))
        const hasTerminalOverlap = overlap.length >= Math.min(3, detectedTerminals.length * 0.6)

        return hasTerminalOverlap
      })

      console.log(`Found ${similarImages.length} similar images`)
      return similarImages.slice(0, 5)
    } catch (error) {
      console.error("Error in getSimilarImages:", error)
      return []
    }
  }

  // Save partial training data
  static async savePartialTrainingData(data: any): Promise<{ success: boolean; id: string; isUpdate: boolean }> {
    try {
      const trainingEntry: TrainingDataInsert = {
        image_hash: data.imageHash,
        image_url: data.imageUrl,
        user_verified_connections: data.userVerifiedConnections || [],
        ai_detected_connections: data.aiDetectedConnections || [],
        system_type: data.systemType || "unknown",
        thermostat_brand: data.thermostatBrand,
        thermostat_model: data.thermostatModel,
        image_quality: data.imageQuality || "good",
        user_feedback: data.userFeedback,
        is_complete: false,
        correction_type: data.correctionType || "partial_training",
        confidence_score: data.confidence,
        metadata: {
          clickCoordinates: data.clickCoordinates,
          timestamp: Date.now(),
        },
      }

      // Check if we already have partial data for this image hash
      const { data: existing, error: selectError } = await this.supabase
        .from("training_data")
        .select("id")
        .eq("image_hash", trainingEntry.image_hash)
        .eq("is_complete", false)
        .single()

      if (selectError && selectError.code !== "PGRST116") {
        throw selectError
      }

      if (existing) {
        // Update existing partial entry
        const { data: updated, error: updateError } = await this.supabase
          .from("training_data")
          .update(trainingEntry)
          .eq("id", existing.id)
          .select()
          .single()

        if (updateError) throw updateError

        console.log("Updated partial training data:", updated.id)
        return { success: true, id: updated.id, isUpdate: true }
      } else {
        // Insert new partial entry
        const { data: inserted, error: insertError } = await this.supabase
          .from("training_data")
          .insert(trainingEntry)
          .select()
          .single()

        if (insertError) throw insertError

        console.log("Saved new partial training data:", inserted.id)
        return { success: true, id: inserted.id, isUpdate: false }
      }
    } catch (error) {
      console.error("Error in savePartialTrainingData:", error)
      throw error
    }
  }

  // Submit complete training data
  static async submitTrainingData(data: any): Promise<{ success: boolean; id: string; isUpdate: boolean }> {
    try {
      const trainingEntry: TrainingDataInsert = {
        image_hash: data.imageHash,
        image_url: data.imageUrl,
        user_verified_connections: data.userVerifiedConnections || [],
        ai_detected_connections: data.aiDetectedConnections || [],
        system_type: data.systemType || "unknown",
        thermostat_brand: data.thermostatBrand,
        thermostat_model: data.thermostatModel,
        image_quality: data.imageQuality || "good",
        user_feedback: data.userFeedback,
        is_complete: true,
        correction_type: data.correctionType || "interactive_training",
        confidence_score: data.confidence,
        metadata: {
          clickCoordinates: data.clickCoordinates,
          timestamp: Date.now(),
        },
      }

      // Remove any partial entries for this image hash
      await this.supabase
        .from("training_data")
        .delete()
        .eq("image_hash", trainingEntry.image_hash)
        .eq("is_complete", false)

      // Check if we already have complete training for this image hash
      const { data: existing, error: selectError } = await this.supabase
        .from("training_data")
        .select("id")
        .eq("image_hash", trainingEntry.image_hash)
        .eq("is_complete", true)
        .single()

      if (selectError && selectError.code !== "PGRST116") {
        throw selectError
      }

      if (existing) {
        // Update existing complete entry
        const { data: updated, error: updateError } = await this.supabase
          .from("training_data")
          .update(trainingEntry)
          .eq("id", existing.id)
          .select()
          .single()

        if (updateError) throw updateError

        console.log("Updated existing complete training data:", updated.id)
        return { success: true, id: updated.id, isUpdate: true }
      } else {
        // Insert new complete entry
        const { data: inserted, error: insertError } = await this.supabase
          .from("training_data")
          .insert(trainingEntry)
          .select()
          .single()

        if (insertError) throw insertError

        console.log("Saved new complete training data:", inserted.id)

        // Update similar configurations cache
        await this.updateSimilarConfigurations(inserted)

        return { success: true, id: inserted.id, isUpdate: false }
      }
    } catch (error) {
      console.error("Error in submitTrainingData:", error)
      throw error
    }
  }

  // Update similar configurations cache for faster lookups
  private static async updateSimilarConfigurations(trainingData: TrainingData) {
    try {
      const userConnections = trainingData.user_verified_connections as WireConnection[]
      const terminals = userConnections
        .filter((conn) => conn.hasWire)
        .map((conn) => conn.terminal)
        .sort()

      const configHash = `${trainingData.system_type}-${terminals.join(",")}`

      const { data: existing, error: selectError } = await this.supabase
        .from("similar_configurations")
        .select("*")
        .eq("configuration_hash", configHash)
        .single()

      if (selectError && selectError.code !== "PGRST116") {
        throw selectError
      }

      if (existing) {
        // Update existing configuration
        const updatedIds = [...existing.training_data_ids, trainingData.id]
        await this.supabase
          .from("similar_configurations")
          .update({
            training_data_ids: updatedIds,
            frequency: existing.frequency + 1,
          })
          .eq("id", existing.id)
      } else {
        // Create new configuration
        await this.supabase.from("similar_configurations").insert({
          configuration_hash: configHash,
          terminals,
          system_type: trainingData.system_type,
          training_data_ids: [trainingData.id],
          frequency: 1,
        })
      }
    } catch (error) {
      console.error("Error updating similar configurations:", error)
    }
  }

  // Get training statistics
  static async getTrainingStats() {
    try {
      const { data: allData, error } = await this.supabase.from("training_data").select("*")

      if (error) throw error

      const completeEntries = allData.filter((entry) => entry.is_complete)
      const partialEntries = allData.filter((entry) => !entry.is_complete)

      // Get terminal frequency
      const terminalCounts: Record<string, number> = {}
      completeEntries.forEach((entry) => {
        const connections = entry.user_verified_connections as WireConnection[]
        connections.forEach((conn) => {
          if (conn.hasWire) {
            terminalCounts[conn.terminal] = (terminalCounts[conn.terminal] || 0) + 1
          }
        })
      })

      const commonTerminals = Object.entries(terminalCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([terminal, count]) => ({ terminal, count }))

      const stats = {
        totalImages: completeEntries.length,
        totalPartialSaves: partialEntries.length,
        systemTypes: {
          "heat-pump": completeEntries.filter((entry) => entry.system_type === "heat-pump").length,
          conventional: completeEntries.filter((entry) => entry.system_type === "conventional").length,
          unknown: completeEntries.filter((entry) => entry.system_type === "unknown").length,
        },
        imageQuality: {
          excellent: completeEntries.filter((entry) => entry.image_quality === "excellent").length,
          good: completeEntries.filter((entry) => entry.image_quality === "good").length,
          fair: completeEntries.filter((entry) => entry.image_quality === "fair").length,
          poor: completeEntries.filter((entry) => entry.image_quality === "poor").length,
        },
        commonTerminals,
        uniqueImageHashes: new Set(completeEntries.map((entry) => entry.image_hash)).size,
        dataSource: "Supabase Database",
        lastModified:
          completeEntries.length > 0
            ? new Date(Math.max(...completeEntries.map((entry) => new Date(entry.created_at).getTime()))).toISOString()
            : null,
      }

      return stats
    } catch (error) {
      console.error("Error in getTrainingStats:", error)
      throw error
    }
  }

  // Verification methods
  static async verifyConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Test database connection
      const { data, error } = await this.supabase.from("training_data").select("count").limit(1)

      if (error) {
        return {
          success: false,
          message: "Database connection failed",
          details: error,
        }
      }

      // Test storage connection
      const { data: buckets, error: storageError } = await this.supabase.storage.listBuckets()

      if (storageError) {
        return {
          success: false,
          message: "Storage connection failed",
          details: storageError,
        }
      }

      const hasTrainingBucket = buckets.some((bucket) => bucket.name === "training-images")

      return {
        success: true,
        message: "Supabase connection verified",
        details: {
          databaseConnected: true,
          storageConnected: true,
          trainingBucketExists: hasTrainingBucket,
          availableBuckets: buckets.map((b) => b.name),
        },
      }
    } catch (error) {
      return {
        success: false,
        message: "Connection verification failed",
        details: error,
      }
    }
  }

  // Test data insertion and retrieval
  static async testDataFlow(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const testData: TrainingDataInsert = {
        image_hash: `test-${Date.now()}`,
        image_url: "https://example.com/test.jpg",
        user_verified_connections: [{ terminal: "R", hasWire: true, wireColor: "red", confidence: 1.0 }],
        ai_detected_connections: [{ terminal: "R", hasWire: true, wireColor: "red", confidence: 0.9 }],
        system_type: "test",
        image_quality: "good",
        is_complete: true,
        correction_type: "test",
      }

      // Insert test data
      const { data: inserted, error: insertError } = await this.supabase
        .from("training_data")
        .insert(testData)
        .select()
        .single()

      if (insertError) throw insertError

      // Retrieve test data
      const { data: retrieved, error: selectError } = await this.supabase
        .from("training_data")
        .select("*")
        .eq("id", inserted.id)
        .single()

      if (selectError) throw selectError

      // Clean up test data
      await this.supabase.from("training_data").delete().eq("id", inserted.id)

      return {
        success: true,
        message: "Data flow test passed",
        details: {
          inserted: inserted.id,
          retrieved: retrieved.id,
          dataMatches: inserted.image_hash === retrieved.image_hash,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: "Data flow test failed",
        details: error,
      }
    }
  }

  // Get all training data (for debugging)
  static async getAllTrainingData(): Promise<TrainingData[]> {
    try {
      const { data, error } = await this.supabase
        .from("training_data")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error("Error in getAllTrainingData:", error)
      throw error
    }
  }

  // Clear all training data (for testing)
  static async clearAllTrainingData(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("training_data")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all records

      if (error) throw error

      // Also clear similar configurations
      const { error: configError } = await this.supabase
        .from("similar_configurations")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")

      if (configError) throw configError

      console.log("Cleared all training data from Supabase")
    } catch (error) {
      console.error("Error clearing training data:", error)
      throw error
    }
  }

  // Export training data to JSON
  static async exportTrainingData(): Promise<string> {
    try {
      const trainingDatabase = await this.getAllTrainingData()
      return JSON.stringify(trainingDatabase, null, 2)
    } catch (error) {
      console.error("Error exporting training data:", error)
      throw error
    }
  }

  // Import training data from JSON
  static async importTrainingData(jsonData: string): Promise<{ success: boolean; imported: number; errors: number }> {
    try {
      const importedData = JSON.parse(jsonData) as any[]

      if (!Array.isArray(importedData)) {
        throw new Error("Invalid data format - expected array")
      }

      let imported = 0
      let errors = 0

      for (const entry of importedData) {
        try {
          // Validate entry structure
          if (!entry.image_hash || !entry.created_at) {
            errors++
            continue
          }

          // Convert to Supabase format
          const supabaseEntry: TrainingDataInsert = {
            image_hash: entry.image_hash,
            image_url: entry.image_url,
            user_verified_connections: entry.user_verified_connections || entry.userVerifiedConnections,
            ai_detected_connections: entry.ai_detected_connections || entry.aiDetectedConnections,
            system_type: entry.system_type || entry.systemType || "unknown",
            thermostat_brand: entry.thermostat_brand || entry.thermostatBrand,
            thermostat_model: entry.thermostat_model || entry.thermostatModel,
            image_quality: entry.image_quality || entry.imageQuality || "good",
            user_feedback: entry.user_feedback || entry.userFeedback,
            is_complete: entry.is_complete ?? entry.isComplete ?? true,
            correction_type: entry.correction_type || entry.correctionType,
            confidence_score: entry.confidence_score || entry.confidence,
            metadata: entry.metadata || {},
          }

          // Check if entry already exists
          const { data: existing } = await this.supabase
            .from("training_data")
            .select("id, created_at")
            .eq("image_hash", supabaseEntry.image_hash)
            .single()

          if (existing) {
            // Update if imported data is newer
            const existingDate = new Date(existing.created_at)
            const importedDate = new Date(entry.created_at)

            if (importedDate > existingDate) {
              await this.supabase.from("training_data").update(supabaseEntry).eq("id", existing.id)
              imported++
            }
          } else {
            // Insert new entry
            await this.supabase.from("training_data").insert(supabaseEntry)
            imported++
          }
        } catch (entryError) {
          console.error("Error processing entry:", entryError)
          errors++
        }
      }

      console.log(`Import completed: ${imported} imported, ${errors} errors`)
      return { success: true, imported, errors }
    } catch (error) {
      console.error("Error importing training data:", error)
      throw error
    }
  }
}
