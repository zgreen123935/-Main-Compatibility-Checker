import { type NextRequest, NextResponse } from "next/server"
import type { File } from "formdata-node"
import { TrainingService } from "../../../shared/services/trainingService"

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
}

interface ImageAnalysis {
  detectedTerminals: string[]
  wireConnections: WireConnection[]
  connectedWires: string[]
  systemType: "heat-pump" | "conventional" | "unknown"
  confidence: number
  isThermostatImage: boolean
  reasons: string[]
  suggestions: string[]
  imageHash: string
  similarConfigurations?: any[]
  exactMatch?: any
  trainingSource?: "exact_match" | "similar_images" | "ai_only"
}

export async function POST(req: NextRequest) {
  try {
    console.log("Analyze wiring API called")

    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      console.error("No image provided")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      console.error("File is not an image:", file.type)
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    console.log("Processing image file:", file.name, "size:", file.size, "type:", file.type)

    // Convert image to base64 and generate hash
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Image = buffer.toString("base64")
    const imageHash = await generateImageHash(buffer)
    const mimeType = file.type

    console.log(`Processing image with hash: ${imageHash}`)

    // Enhanced analysis with exact match checking
    const analysis = await analyzeWithTrainingData(base64Image, mimeType, imageHash)

    console.log("Analysis completed successfully")

    return NextResponse.json({
      success: true,
      ...analysis,
    })
  } catch (error) {
    console.error("Error processing image:", error)

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : "No stack trace"

    console.error("Error details:", { message: errorMessage, stack: errorStack })

    return NextResponse.json(
      {
        error: "Failed to process image",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function analyzeWithTrainingData(
  base64Image: string,
  mimeType: string,
  imageHash: string,
): Promise<ImageAnalysis> {
  try {
    console.log(`Analyzing image with hash: ${imageHash}`)

    // STEP 1: Check for exact image hash match first using TrainingService
    console.log("Checking for exact match...")
    const exactMatch = await TrainingService.getExactImageMatch(imageHash)

    if (exactMatch) {
      console.log(`Found exact match for image hash: ${imageHash}`)

      // Use the user's previous training data directly
      const userTrainedConnections = exactMatch.userVerifiedConnections || []
      const connectedWires = userTrainedConnections
        .filter((conn: WireConnection) => conn.hasWire)
        .map((conn: WireConnection) => conn.terminal)

      return {
        detectedTerminals: connectedWires,
        wireConnections: userTrainedConnections,
        connectedWires,
        systemType: exactMatch.systemType || "unknown",
        confidence: 95, // High confidence since user previously trained this
        isThermostatImage: true,
        reasons: [
          "Exact image match found in training database",
          `Previously trained by user on ${new Date(exactMatch.timestamp).toLocaleDateString()}`,
          `Found ${connectedWires.length} user-verified wire connections`,
          "Using previous training data directly",
        ],
        suggestions: [
          "This image was previously trained - using your previous selections",
          "You can still modify the selections if needed",
        ],
        imageHash,
        exactMatch,
        trainingSource: "exact_match",
      }
    }

    console.log(`No exact match found for hash: ${imageHash}, proceeding with AI analysis`)

    // STEP 2: If no exact match, get initial AI analysis
    console.log("Starting AI analysis...")
    const aiAnalysis = await analyzeWithGPT4Vision(base64Image, mimeType)
    console.log("AI analysis completed")

    // STEP 3: Look for similar configurations in training database using TrainingService
    console.log("Looking for similar configurations...")
    const similarConfigs = await TrainingService.getSimilarImages(aiAnalysis.detectedTerminals, aiAnalysis.systemType)
    console.log(`Found ${similarConfigs.length} similar configurations`)

    // STEP 4: Enhance the analysis with training data insights
    console.log("Enhancing analysis with training data...")
    const enhancedAnalysis = enhanceWithTrainingData(aiAnalysis, similarConfigs)

    return {
      ...enhancedAnalysis,
      imageHash,
      similarConfigurations: similarConfigs,
      trainingSource: similarConfigs.length > 0 ? "similar_images" : "ai_only",
    }
  } catch (error) {
    console.error("Error in analyzeWithTrainingData:", error)
    throw error
  }
}

async function analyzeWithGPT4Vision(base64Image: string, mimeType: string) {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured")
    }

    console.log("Calling OpenAI API...")

    // Enhanced prompt that incorporates common patterns from training data
    const prompt = `You are analyzing a thermostat wiring image. Based on thousands of real thermostat installations, here are the most common patterns:

MOST COMMON WIRE CONFIGURATIONS:
1. Basic 4-wire: R(red), C(blue), Y(yellow), G(green)
2. Basic 5-wire: R(red), C(blue), Y(yellow), G(green), W(white)
3. Heat pump: R(red), C(blue), Y(yellow), G(green), O(orange)
4. Dual fuel: R(red), C(blue), Y(yellow), G(green), W(white), O(orange)

TERMINAL DETECTION PRIORITY:
1. Look for the most common terminals first: R, RC, RH, C, Y, Y1, G, W, W1, O, B
2. Check for less common but important ones: Y2, W2, ACC+, ACC-, AUX, E
3. Note any unusual or custom terminals

WIRE COLOR PATTERNS (most common):
- Red: Power (R, RC, RH) - 95% of cases
- Blue: Common (C) - 80% of cases  
- Yellow: Cooling (Y, Y1) - 90% of cases
- Green: Fan (G) - 85% of cases
- White: Heating (W, W1) - 80% of cases
- Orange: Reversing valve (O) - 70% of heat pumps
- Black: Common (C) or auxiliary - 15% of cases

ANALYSIS INSTRUCTIONS:
1. Count ALL visible wires entering the thermostat
2. Identify each terminal label clearly
3. For each terminal, determine if a wire is connected
4. Match wire colors to their most likely terminals
5. Cross-reference with common patterns above
6. Flag any unusual configurations

Provide detailed JSON analysis:

{
  "totalWiresVisible": 5,
  "detectedTerminals": ["RC", "C", "Y1", "G", "W1"],
  "wireConnections": [
    {"terminal": "RC", "hasWire": true, "wireColor": "red", "confidence": 0.95},
    {"terminal": "C", "hasWire": true, "wireColor": "blue", "confidence": 0.90},
    {"terminal": "Y1", "hasWire": true, "wireColor": "yellow", "confidence": 0.95},
    {"terminal": "G", "hasWire": true, "wireColor": "green", "confidence": 0.90},
    {"terminal": "W1", "hasWire": true, "wireColor": "white", "confidence": 0.85}
  ],
  "systemType": "conventional",
  "confidence": 90,
  "isThermostatImage": true,
  "analysisNotes": [
    "Standard 5-wire conventional system",
    "All wire colors match expected patterns",
    "Configuration matches 78% of similar installations"
  ],
  "unusualFindings": []
}`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.0,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("OpenAI API response received")

    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content in OpenAI response")
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error("No JSON found in OpenAI response:", content)
        throw new Error("No JSON found in response")
      }

      const analysisData = JSON.parse(jsonMatch[0])

      return {
        detectedTerminals: analysisData.detectedTerminals || [],
        wireConnections: analysisData.wireConnections || [],
        connectedWires:
          analysisData.wireConnections
            ?.filter((conn: WireConnection) => conn.hasWire)
            ?.map((conn: WireConnection) => conn.terminal) || [],
        systemType: analysisData.systemType || "unknown",
        confidence: analysisData.confidence || 0,
        isThermostatImage: analysisData.isThermostatImage !== false,
        reasons: analysisData.analysisNotes || [],
        suggestions: [],
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw content:", content)
      throw new Error(`Analysis parsing failed: ${parseError instanceof Error ? parseError.message : "Unknown error"}`)
    }
  } catch (error) {
    console.error("Error in analyzeWithGPT4Vision:", error)
    throw error
  }
}

function enhanceWithTrainingData(analysis: any, similarConfigs: any[]) {
  try {
    if (similarConfigs.length === 0) {
      return analysis
    }

    // Analyze patterns from similar configurations
    const terminalFrequency: Record<string, number> = {}
    const wireColorPatterns: Record<string, Record<string, number>> = {}

    similarConfigs.forEach((config) => {
      config.userVerifiedConnections.forEach((conn: WireConnection) => {
        if (conn.hasWire) {
          terminalFrequency[conn.terminal] = (terminalFrequency[conn.terminal] || 0) + 1

          if (conn.wireColor) {
            if (!wireColorPatterns[conn.terminal]) {
              wireColorPatterns[conn.terminal] = {}
            }
            wireColorPatterns[conn.terminal][conn.wireColor] =
              (wireColorPatterns[conn.terminal][conn.wireColor] || 0) + 1
          }
        }
      })
    })

    // Enhance confidence based on training data
    const enhancedConnections = analysis.wireConnections.map((conn: WireConnection) => {
      const frequency = terminalFrequency[conn.terminal] || 0
      const totalSimilar = similarConfigs.length

      if (frequency > 0) {
        const patternConfidence = frequency / totalSimilar
        const enhancedConfidence = Math.min(0.95, conn.confidence + patternConfidence * 0.2)

        return {
          ...conn,
          confidence: enhancedConfidence,
        }
      }

      return conn
    })

    const enhancedReasons = [
      ...analysis.reasons,
      `Found ${similarConfigs.length} similar configurations in training data`,
      `Most common terminals in similar setups: ${Object.entries(terminalFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([terminal]) => terminal)
        .join(", ")}`,
    ]

    return {
      ...analysis,
      wireConnections: enhancedConnections,
      confidence: Math.min(95, analysis.confidence + (similarConfigs.length > 2 ? 10 : 5)),
      reasons: enhancedReasons,
    }
  } catch (error) {
    console.error("Error in enhanceWithTrainingData:", error)
    // Return original analysis if enhancement fails
    return analysis
  }
}

async function generateImageHash(buffer: Buffer): Promise<string> {
  try {
    // Simple hash for demo - in production, use a proper image hashing library
    const crypto = await import("crypto")
    return crypto.createHash("md5").update(buffer).digest("hex")
  } catch (error) {
    console.error("Error generating image hash:", error)
    throw error
  }
}
