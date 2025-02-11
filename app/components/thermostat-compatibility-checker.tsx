"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Terminal,
  ShoppingCart,
  HelpCircle,
  CircuitBoard,
  Users,
} from "lucide-react"
import type React from "react"
import { RotateCcw } from "lucide-react"
import Image from "next/image"
import { AnalyzingScreen } from "./analyzing-screen"

type CompatibilityResult = "compatible" | "adapter" | "incompatible"

interface AnalysisDetails {
  front: {
    brand: string
    model: string
    features: string[]
  }
  wiring: {
    wireCount: number
    wireColors: string[]
    terminals: string[]
  }
}

export default function ThermostatCompatibilityChecker() {
  const [currentStep, setCurrentStep] = useState(1)
  const [frontImage, setFrontImage] = useState<string | null>(null)
  const [wiringImage, setWiringImage] = useState<string | null>(null)
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null)
  const [analysisDetails, setAnalysisDetails] = useState<AnalysisDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [completionCount, setCompletionCount] = useState(1305201)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const totalSteps = 5

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize() // Set initial size
    window.addEventListener("resize", handleResize)

    const interval = setInterval(() => {
      setCompletionCount((prevCount) => prevCount + 1)
    }, 3000) // Increment every 3 seconds

    return () => {
      window.removeEventListener("resize", handleResize)
      clearInterval(interval)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
    if (currentStep === 3) {
      // Start the analyzing process
      setCurrentStep(4)

      // Simulate processing and set mock results after 15 seconds
      setTimeout(() => {
        setCompatibilityResult("compatible")
        setAnalysisDetails({
          front: {
            brand: "Acme",
            model: "TH-2000",
            features: ["LCD Display", "Touch Buttons"],
          },
          wiring: {
            wireCount: 4,
            wireColors: ["Red", "Green", "Yellow", "Blue"],
            terminals: ["R", "G", "Y", "C"],
          },
        })
        setCurrentStep(5)
        incrementCompletionCount()
      }, 15000)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>, setImage: (value: string | null) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRetake = (setImage: (value: string | null) => void) => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleContactSupport = () => {
    // Implement contact support functionality here
    console.log("Contacting support...")
  }

  const renderCompatibilityResult = () => {
    if (!compatibilityResult) return null

    const statusConfig = {
      compatible: {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500",
        lightBg: "bg-green-50",
        border: "border-green-200",
        title: "Great News – Your Thermostat is Smart-Ready!",
        description:
          "Your thermostat uses a standard 24V system and includes a common wire. You're all set to install your Mysa smart thermostat!",
      },
      adapter: {
        icon: AlertCircle,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500",
        lightBg: "bg-yellow-50",
        border: "border-yellow-200",
        title: "Almost There – You'll Need Our Common Wire Adapter",
        description:
          "We detected only two wires. Your system is low-voltage, but it needs a common wire for constant power. Grab our Common Wire Adapter and you're ready to go!",
      },
      incompatible: {
        icon: XCircle,
        color: "text-red-500",
        bgColor: "bg-red-500",
        lightBg: "bg-red-50",
        border: "border-red-200",
        title: "Uh-Oh – This Thermostat Isn't Ready for a Smart Upgrade",
        description:
          "It looks like your thermostat is wired for high voltage or a different system type. Please double-check your setup or contact Mysa Support for guidance.",
      },
    }

    const config = statusConfig[compatibilityResult]
    const StatusIcon = config.icon

    return (
      <div className="space-y-8">
        <div className={`relative overflow-hidden rounded-xl border ${config.border} ${config.lightBg}`}>
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
          </div>

          <div className="relative p-6">
            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mb-6"
            >
              <Badge variant="outline" className={`${config.color} border-current px-3 py-1`}>
                <StatusIcon className="mr-2 h-4 w-4" />
                {compatibilityResult === "compatible"
                  ? "Compatible"
                  : compatibilityResult === "adapter"
                    ? "Adapter Needed"
                    : "Incompatible"}
              </Badge>
            </motion.div>

            {/* Title and Description */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
              <p className="text-gray-600 text-lg mb-6">{config.description}</p>
            </motion.div>

            {/* Analysis Details Card */}
            {analysisDetails && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold flex items-center">
                    <Terminal className="h-4 w-4 mr-2" />
                    Analysis Details
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Thermostat</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{analysisDetails.front.brand}</p>
                      <p className="text-sm text-gray-600">{analysisDetails.front.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CircuitBoard className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Wiring</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{analysisDetails.wiring.wireCount} wires detected</p>
                      <div className="flex gap-1.5 mt-1 justify-end">
                        {analysisDetails.wiring.wireColors.map((color, index) => (
                          <span
                            key={color}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                            style={{
                              backgroundColor: `${color.toLowerCase()}50`,
                              color: `${color.toLowerCase()}700`,
                            }}
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <p className="text-gray-600">
            Need help? Contact our support team for expert assistance. Ready to upgrade? Shop Mysa thermostats now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => window.open("https://getmysa.com/products/mysa-baseboard-ca", "_blank")}
              className="flex-1 py-6 rounded-lg bg-[#14181F] text-white hover:bg-gray-800 text-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Shop Mysa
              </span>
            </Button>
            <Button
              onClick={handleContactSupport}
              variant="outline"
              className="flex-1 py-6 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 text-lg"
            >
              <HelpCircle className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">Let's Get Started!</h1>

            <p className="text-gray-600 text-lg mb-8">
              You'll take two quick photos – one of your thermostat's face and one of the wiring behind it. This helps
              us verify compatibility quickly and safely.
            </p>
            <div className="bg-[#BAE5D4]/20 rounded-lg p-4 mb-8">
              <p className="text-sm font-medium flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-[#14181F]" />
                Compatibility Check Counter
              </p>
              <p className="text-3xl font-bold text-[#14181F]">{completionCount.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">people have completed the compatibility check so far!</p>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-4">
                <CheckCircle className="text-green-500 h-6 w-6 flex-shrink-0" />
                <span className="text-gray-700">Take a photo of your thermostat's face</span>
              </div>
              <div className="flex items-center space-x-4">
                <CheckCircle className="text-green-500 h-6 w-6 flex-shrink-0" />
                <span className="text-gray-700">Take a photo of the wiring behind your thermostat</span>
              </div>
            </div>

            <Button
              onClick={handleNext}
              className="w-full py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-lg"
            >
              Get Started
            </Button>
          </>
        )
      case 2:
      case 3:
        const isWiringStep = currentStep === 3
        const image = isWiringStep ? wiringImage : frontImage
        const setImage = isWiringStep ? setWiringImage : setFrontImage
        return (
          <>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">
              {isWiringStep ? "Capture Thermostat Wiring" : "Capture Thermostat Front"}
            </h1>

            <p className="text-gray-600 text-lg mb-6">
              {isWiringStep
                ? "Now, capture a clear photo of the wiring behind your thermostat. We need to see every wire and label for a complete analysis."
                : "Please take a clear photo of your thermostat's front. Make sure the display, brand, and model are visible."}
            </p>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700 flex items-center">
                <span className="mr-2">💡</span>
                {isWiringStep
                  ? "Tip: Remove any obstructions and ensure all wire labels are in focus."
                  : "Tip: Hold your phone steady and ensure there's good lighting."}
              </p>
            </div>

            {!image ? (
              <div className="space-y-6">
                <label
                  htmlFor={`capture-${isWiringStep ? "wiring" : "front"}`}
                  className="block border-2 border-dashed border-gray-300 rounded-lg p-16 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="mx-auto w-12 h-12 mb-4">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-06%20at%208.07.14%E2%80%AFPM-XcVIukb9nJSeDLY0AMvVTSlsSgA8Ca.png"
                      alt="Camera icon"
                      width={48}
                      height={48}
                      className="opacity-50"
                    />
                  </div>
                  <p className="text-gray-500">Click to capture or upload an image</p>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCapture(e, setImage)}
                  ref={fileInputRef}
                  className="hidden"
                  id={`capture-${isWiringStep ? "wiring" : "front"}`}
                />
                <label htmlFor={`capture-${isWiringStep ? "wiring" : "front"}`} className="block w-full">
                  <Button className="w-full py-6 rounded-lg bg-[#14181F] text-white hover:bg-gray-800 text-lg">
                    Capture
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "50vh" }}>
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Captured thermostat ${isWiringStep ? "wiring" : "front"}`}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <Button
                  onClick={() => handleRetake(setImage)}
                  className="w-full py-3 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 text-lg flex items-center justify-center"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Retake
                </Button>
              </div>
            )}
          </>
        )
      case 5:
        return renderCompatibilityResult()
      default:
        return null
    }
  }

  const incrementCompletionCount = () => {
    setCompletionCount((prevCount) => prevCount + 1)
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? "p-0" : "p-4"} flex items-center justify-center`}>
      <Card
        className={`w-full ${isMobile ? "h-screen" : "max-w-2xl"} bg-white ${isMobile ? "rounded-none" : "rounded-2xl"} ${currentStep === 4 ? "hidden" : ""}`}
      >
        <div className={`${isMobile ? "h-full" : ""} flex flex-col`}>
          <div className={`${isMobile ? "flex-grow overflow-y-auto" : ""} p-8 space-y-6`}>
            <div className="inline-block px-3 py-1 rounded bg-[#BAE5D4] text-sm font-medium">
              Step {currentStep}/{totalSteps}
            </div>
            {renderContent()}
          </div>
          {currentStep > 1 && currentStep < 4 && (
            <div className={`flex justify-between ${isMobile ? "p-4 border-t" : "pt-8"}`}>
              <Button onClick={handleBack} variant="outline" className="px-8 py-2 rounded-lg border-gray-200">
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="px-8 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                disabled={(currentStep === 2 && !frontImage) || (currentStep === 3 && !wiringImage)}
              >
                {currentStep === totalSteps ? "Finish" : "Next"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {currentStep === 4 && <AnalyzingScreen />}
    </div>
  )
}

