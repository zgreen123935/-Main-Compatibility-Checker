import { type NextRequest, NextResponse } from "next/server"
import type { File } from "formdata-node"

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
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Convert image to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Image = buffer.toString("base64")
    const mimeType = file.type

    // Use OpenAI Vision API with enhanced multi-pass analysis
    const analysis = await analyzeWithEnhancedVision(base64Image, mimeType)

    return NextResponse.json({
      success: true,
      ...analysis,
    })
  } catch (error) {
    console.error("Error processing image:", error)

    // Fallback to Tesseract if OpenAI fails
    const file = req.formData().get("image") as File
    try {
      const fallbackAnalysis = await fallbackToTesseract(await file.arrayBuffer())
      return NextResponse.json({
        success: true,
        ...fallbackAnalysis,
        fallbackUsed: true,
      })
    } catch (fallbackError) {
      console.error("Fallback analysis also failed:", fallbackError)
      return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
    }
  }
}

async function analyzeWithEnhancedVision(base64Image: string, mimeType: string): Promise<ImageAnalysis> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured")
  }

  // First pass: Comprehensive terminal and wire detection
  const detailedAnalysis = await performDetailedAnalysis(base64Image, mimeType, openaiApiKey)

  // Second pass: Verification and missed connection check
  const verificationAnalysis = await performVerificationPass(base64Image, mimeType, openaiApiKey, detailedAnalysis)

  // Combine results for final analysis
  return combineAnalysisResults(detailedAnalysis, verificationAnalysis)
}

async function performDetailedAnalysis(base64Image: string, mimeType: string, apiKey: string) {
  const prompt = `You are analyzing a real thermostat wiring photo. This is a REAL PHOTO, not a diagram, so wires may be at angles, partially obscured, or have shadows.

CRITICAL MULTI-STEP ANALYSIS:

STEP 1 - IDENTIFY ALL TERMINAL BLOCKS:
- Look for rectangular black terminal blocks (usually 2 blocks - upper and lower)
- Each block typically has 4-6 terminals with white labels
- Terminal blocks may be oriented horizontally or vertically

STEP 2 - READ ALL TERMINAL LABELS:
Systematically read every label you can see on both terminal blocks:
- Common labels: R, RH, RC, C, Y, Y1, Y2, G, W, W1, W2, O, B, O/B, ACC+, ACC-, AUX, E, EM
- Labels may be small white text on black background
- Some labels might be partially obscured but still readable

STEP 3 - TRACE EVERY WIRE:
For each colored wire you see:
- Follow the wire from its entry point to where it connects
- Note the exact terminal it connects to
- Identify the wire color (red, blue, yellow, green, white, orange, black, brown, gray)
- Some wires may loop or curve before connecting

STEP 4 - DOUBLE-CHECK FOR MISSED CONNECTIONS:
- Count total wires entering the thermostat area
- Verify each wire has been accounted for
- Look for wires that might be hidden behind others
- Check both the left and right sides of each terminal block

REAL PHOTO CONSIDERATIONS:
- Wires may not be perfectly straight
- Some connections might be partially hidden
- Lighting may create shadows
- Wire colors might appear slightly different due to lighting
- Multiple wires may bundle together

Please provide a detailed JSON response:
{
  "detectedTerminals": ["list of ALL terminal labels visible"],
  "wireConnections": [
    {"terminal": "RC", "hasWire": true, "wireColor": "red", "confidence": 0.95},
    {"terminal": "C", "hasWire": true, "wireColor": "blue", "confidence": 0.90},
    {"terminal": "Y1", "hasWire": true, "wireColor": "yellow", "confidence": 0.95},
    {"terminal": "G", "hasWire": true, "wireColor": "green", "confidence": 0.90},
    {"terminal": "W1", "hasWire": true, "wireColor": "white", "confidence": 0.85}
  ],
  "totalWiresVisible": 5,
  "terminalBlocksFound": 2,
  "analysisNotes": ["Upper block has 3 connections", "Lower block has 2 connections"],
  "systemType": "conventional",
  "confidence": 85,
  "isThermostatImage": true
}`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
      max_tokens: 1500,
      temperature: 0.1,
    }),
  })

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } catch {
    return null
  }
}

async function performVerificationPass(base64Image: string, mimeType: string, apiKey: string, firstAnalysis: any) {
  const detectedCount = firstAnalysis?.wireConnections?.filter((conn: any) => conn.hasWire)?.length || 0

  const prompt = `You are performing a VERIFICATION PASS on a thermostat wiring analysis. 

FIRST ANALYSIS FOUND: ${detectedCount} wire connections
DETECTED: ${
    firstAnalysis?.wireConnections
      ?.filter((conn: any) => conn.hasWire)
      ?.map((conn: any) => `${conn.terminal}(${conn.wireColor})`)
      .join(", ") || "none"
  }

YOUR TASK: Look for ANY MISSED CONNECTIONS

VERIFICATION CHECKLIST:
1. Count the total number of colored wires entering the thermostat
2. Verify each wire has been traced to a terminal
3. Look specifically for:
   - Wires that might be hidden behind others
   - Dark colored wires (black, brown) that are harder to see
   - Wires connecting to terminals on the edges
   - Any terminal that appears to have a wire but wasn't detected

FOCUS AREAS TO RE-CHECK:
- All corners and edges of terminal blocks
- Any terminals that look like they might have wires
- Bundled wires that might hide individual connections
- Both upper and lower terminal blocks thoroughly

If you find additional connections, include them. If the first analysis was complete, confirm it.

Respond with:
{
  "additionalConnections": [
    {"terminal": "W2", "hasWire": true, "wireColor": "white", "confidence": 0.8}
  ],
  "missedConnectionsFound": true/false,
  "totalWireCountVerification": number,
  "verificationNotes": ["Found additional white wire to W2", "Black wire to ACC+ was missed"],
  "firstAnalysisAccurate": true/false
}`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
      max_tokens: 800,
      temperature: 0.05,
    }),
  })

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null
  } catch {
    return null
  }
}

function combineAnalysisResults(firstAnalysis: any, verificationAnalysis: any): ImageAnalysis {
  if (!firstAnalysis) {
    return {
      detectedTerminals: [],
      wireConnections: [],
      connectedWires: [],
      systemType: "unknown",
      confidence: 0,
      isThermostatImage: false,
      reasons: ["Analysis failed"],
      suggestions: ["Please try another photo"],
    }
  }

  // Combine wire connections from both analyses
  const allConnections = [...(firstAnalysis.wireConnections || [])]

  if (verificationAnalysis?.additionalConnections) {
    // Add any additional connections found in verification
    for (const additionalConn of verificationAnalysis.additionalConnections) {
      const existingIndex = allConnections.findIndex((conn) => conn.terminal === additionalConn.terminal)
      if (existingIndex >= 0) {
        // Update existing connection if verification found a wire where first analysis didn't
        if (!allConnections[existingIndex].hasWire && additionalConn.hasWire) {
          allConnections[existingIndex] = additionalConn
        }
      } else {
        // Add completely new connection
        allConnections.push(additionalConn)
      }
    }
  }

  const connectedWires = allConnections
    .filter((conn) => conn.hasWire && conn.confidence > 0.4) // Lower threshold for real photos
    .map((conn) => conn.terminal)

  const systemType = determineSystemType(allConnections)

  return {
    detectedTerminals: firstAnalysis.detectedTerminals || [],
    wireConnections: allConnections,
    connectedWires,
    systemType,
    confidence: Math.min(95, Math.max(60, firstAnalysis.confidence || 70)),
    isThermostatImage: true,
    reasons: [
      `Found ${connectedWires.length} wire connections`,
      ...(firstAnalysis.analysisNotes || []),
      ...(verificationAnalysis?.verificationNotes || []),
    ],
    suggestions: verificationAnalysis?.missedConnectionsFound
      ? ["Verification pass found additional connections"]
      : ["Analysis appears complete"],
  }
}

function determineSystemType(connections: WireConnection[]): "heat-pump" | "conventional" | "unknown" {
  const terminals = connections.filter((c) => c.hasWire).map((c) => c.terminal)

  if (terminals.some((t) => t.includes("O") || t.includes("B") || t === "O/B")) {
    return "heat-pump"
  }

  if (terminals.some((t) => t.includes("W"))) {
    return "conventional"
  }

  return "unknown"
}

async function fallbackToTesseract(buffer: ArrayBuffer): Promise<ImageAnalysis> {
  const { createWorker } = await import("tesseract.js")
  const worker = await createWorker()

  await worker.setParameters({
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_+",
    tessedit_pageseg_mode: "6",
  })

  const { data } = await worker.recognize(Buffer.from(buffer))
  await worker.terminate()

  const text = data.text.toUpperCase()
  const terminals = ["R", "RH", "RC", "C", "Y", "Y1", "Y2", "G", "W", "W1", "W2", "O", "B", "O/B", "ACC+", "ACC-"]

  const detectedTerminals = terminals.filter((terminal) => {
    const regex = new RegExp(`\\b${terminal.replace("/", "\\/")}\\b`)
    return regex.test(text)
  })

  const wireConnections = detectedTerminals.map((terminal) => ({
    terminal,
    hasWire: true,
    confidence: 0.6,
  }))

  const connectedWires = detectedTerminals
  const isHeatPump = text.includes("O/B") || text.includes("REVERSING") || text.includes("HEAT PUMP")

  return {
    detectedTerminals,
    wireConnections,
    connectedWires,
    systemType: isHeatPump ? "heat-pump" : "conventional",
    confidence: detectedTerminals.length > 0 ? 70 : 30,
    isThermostatImage: detectedTerminals.length > 0,
    reasons: [`Fallback analysis - found ${detectedTerminals.length} terminals`],
    suggestions: ["Consider retaking photo for better analysis"],
  }
}
