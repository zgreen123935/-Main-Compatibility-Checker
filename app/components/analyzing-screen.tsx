"use client"

import { useEffect, useRef, useState } from "react"
import { Settings } from "lucide-react"
import { Card } from "@/components/ui/card"

const steps = [
  "Looking up your existing thermostat specifications",
  "Understanding your specific wiring",
  "Reasoning if Mysa is compatible with your home",
  "Verifying your home's electrical system",
  "Finalizing compatibility check",
]

export function AnalyzingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      const containerWidth = container.clientWidth
      canvas.width = containerWidth
      canvas.height = containerWidth // Changed to make canvas square
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    const squareSize = 50
    let x = canvas.width / 2 - squareSize / 2
    let y = canvas.height / 2 - squareSize / 2
    let vx = Math.random() < 0.5 ? 2 : -2
    let vy = Math.random() < 0.5 ? 2 : -2

    const myImg = new Image()
    myImg.src = "https://i.imgur.com/bYoU6w8_d.webp?maxwidth=760&fidelity=grand"
    myImg.crossOrigin = "anonymous"

    const update = () => {
      x += vx
      y += vy

      if (x < 0 || x + squareSize > canvas.width) {
        vx = -vx
        x = Math.max(0, Math.min(x, canvas.width - squareSize))
      }
      if (y < 0 || y + squareSize > canvas.height) {
        vy = -vy
        y = Math.max(0, Math.min(y, canvas.height - squareSize))
      }
    }

    const draw = () => {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(myImg, x, y, squareSize, squareSize)
    }

    const loop = () => {
      update()
      draw()
      animationFrameId = requestAnimationFrame(loop)
    }

    myImg.onload = () => {
      loop()
    }

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 5000)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearInterval(stepInterval)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full">
        {/* Step Badge */}
        <div className="px-8 pt-8">
          <span className="inline-block rounded-md bg-[#BAE5D4] px-3 py-1 text-sm font-medium text-gray-900">
            Step {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="mt-6 mx-auto w-full max-w-[600px] aspect-square p-8 overflow-hidden border border-gray-200 bg-white rounded-lg"
        >
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        {/* Analysis Card */}
        <div className="p-8">
          <Card className="overflow-hidden">
            <div className="border-b border-gray-100 bg-[#F1FAF7] px-4 py-3">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-900" />
                <h1 className="flex-1 text-sm font-medium text-gray-900">Thermostat Compatibility Checker</h1>
                <span className="text-xs text-gray-500">v1.0</span>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${index <= currentStep ? "opacity-100" : "opacity-50"}`}
                  >
                    <div className="relative">
                      <div
                        className={`h-3 w-3 rounded-full border-2 border-white ${
                          index <= currentStep
                            ? "bg-[#BAE5D4] shadow-[0_0_0_2px_#BAE5D4]"
                            : "bg-gray-200 shadow-[0_0_0_2px_#e5e7eb]"
                        }`}
                      />
                      {index < steps.length - 1 && <div className="absolute left-1.5 top-3 h-full w-px bg-gray-200" />}
                    </div>
                    <span className="block pb-4 text-sm text-gray-900">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
