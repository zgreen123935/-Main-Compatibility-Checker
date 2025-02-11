"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { useAppContext } from "../context/AppContext"
import { SharedLayout } from "./SharedLayout"

const mysaProducts = [
  {
    name: "Mysa for Baseboard Heating Plus",
    imageSrc:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-09%20at%201.23.56%E2%80%AFPM-wjH6HyeZXRYvxNJt5mD8FpftlN37Gv.png",
    rating: "4.6",
    reviews: "4700+",
    badge: "PLUS",
  },
  {
    name: "Mysa for Baseboard Heating",
    imageSrc:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-09%20at%201.24.00%E2%80%AFPM-hxojDcqCK9rZZtyfAaFPnUYNyChUb1.png",
    rating: "4.5",
    reviews: "3200+",
  },
  {
    name: "Mysa for In-Floor Heating",
    imageSrc:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-09%20at%201.24.08%E2%80%AFPM-sD2KwRn9rbcNoNAUX00Ez0t1pVzfUv.png",
    rating: "4.7",
    reviews: "2300+",
  },
  {
    name: "Mysa for Mini Split Heat Pumps",
    imageSrc:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-09%20at%201.24.05%E2%80%AFPM-NRDLopuEyq29iuKxJpamvp3Ak7xMoM.png",
    rating: "4.8",
    reviews: "3100+",
  },
]

export default function CompatibilityResult() {
  const router = useRouter()
  const [isAnalysisVisible, setIsAnalysisVisible] = useState(false)
  const { state } = useAppContext()

  return (
    <SharedLayout showBack>
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Celebratory Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-[#BAE5D4] p-3">
              <svg className="h-8 w-8 text-[#2D2D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-[#2D2D2D] text-3xl font-medium tracking-tight">Great news!</h1>
          <p className="text-gray-600 text-xl mb-4">
            Based on our analysis, these products are compatible with your home.
          </p>
          <div className="inline-block">
            <Button
              variant="outline"
              onClick={() => setIsAnalysisVisible(!isAnalysisVisible)}
              className="text-sm font-medium"
            >
              {isAnalysisVisible ? "Hide Analysis" : "View Analysis"}
            </Button>
          </div>
          {isAnalysisVisible && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#BAE5D4]" />
                  <p className="text-[#2D2D2D]">Your electrical system meets the voltage requirements.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#BAE5D4]" />
                  <p className="text-[#2D2D2D]">Your heating system type is supported by Mysa products.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#BAE5D4]" />
                  <p className="text-[#2D2D2D]">The wiring configuration in your home is compatible.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compatible Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mysaProducts.map((product, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-col items-center space-y-2 hover:shadow-lg transition-shadow relative"
            >
              {product.badge && (
                <div className="absolute top-2 right-2 bg-[#E31C58] text-white px-3 py-1 rounded-md font-medium">
                  {product.badge}
                </div>
              )}
              <div className="relative w-full aspect-[3/2]">
                <Image
                  src={product.imageSrc || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority={index === 0}
                />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-base font-medium text-[#2D2D2D]">{product.name}</h3>
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.floor(Number(product.rating)) ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews})
                  </span>
                </div>
              </div>
              <div className="flex w-full space-x-2 px-2">
                <Button className="flex-1 bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white" size="sm">
                  Shop Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D]/10"
                  onClick={() => router.push("/chat")}
                >
                  Learn More
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SharedLayout>
  )
}

