"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { usePapaParse } from "react-papaparse"
import { useInstall } from "../context/InstallContext"

interface WireDetectionProps {
  onAnalysisComplete: (result: any) => void
  onUseTraining: (trainingData: any) => void
}

const WireDetection: React.FC<WireDetectionProps> = ({ onAnalysisComplete, onUseTraining }) => {
  const { readRemoteFile } = usePapaParse()
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const { dispatch } = useInstall()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setCsvFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleAnalyze = () => {
    if (csvFile) {
      readRemoteFile(csvFile as any, {
        header: true,
        complete: (results: any) => {
          setAnalysisResult(results.data)
          const detectedWires = results.data.map((item: any) => item.terminal)
          const result = {
            wireConnections: results.data.map((item: any) => ({
              terminal: item.terminal,
              hasWire: true,
            })),
            jumperConnections: results.data.filter((item: any) => item.jumper === "TRUE"),
          }
          onAnalysisComplete(result)

          // Set automated decisions based on detection results
          const hasCWire =
            result.wireConnections?.some((w: any) => w.terminal?.toUpperCase() === "C" && w.hasWire) ||
            detectedWires.includes("C")

          const hasJumpers = result.jumperConnections && result.jumperConnections.length > 0

          // Store automated decisions in context
          dispatch({
            type: "SET_AUTOMATED_DECISIONS",
            decisions: {
              hasCWireDetected: hasCWire,
              hasJumpersDetected: hasJumpers,
              detectedWires: detectedWires,
              detectedJumpers: result.jumperConnections || [],
            },
          })

          console.log("Setting automated decisions:", {
            hasCWireDetected: hasCWire,
            hasJumpersDetected: hasJumpers,
            detectedWires: detectedWires,
          })
        },
      })
    }
  }

  const handleUseTraining = () => {
    const trainingData = {
      terminals: ["A", "B", "C"],
      jumper_connections: [{ from: "A", to: "B" }],
    }
    onUseTraining(trainingData)

    // Set automated decisions from training data
    const hasCWire = trainingData.terminals?.includes("C")
    const hasJumpers = trainingData.jumper_connections && trainingData.jumper_connections.length > 0

    dispatch({
      type: "SET_AUTOMATED_DECISIONS",
      decisions: {
        hasCWireDetected: hasCWire,
        hasJumpersDetected: hasJumpers,
        detectedWires: trainingData.terminals || [],
        detectedJumpers: trainingData.jumper_connections || [],
      },
    })
  }

  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
      </div>
      {csvFile && <p>Selected file: {csvFile.name}</p>}
      <button onClick={handleAnalyze} disabled={!csvFile}>
        Analyze CSV
      </button>
      <button onClick={handleUseTraining}>Use Training Data</button>
      {analysisResult && (
        <div>
          <h3>Analysis Result:</h3>
          <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export { WireDetection }
