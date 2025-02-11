"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { SharedLayout } from "./SharedLayout"

export default function HeaterACNotCompatible() {
  const router = useRouter()

  return (
    <SharedLayout showBack>
      <div className="space-y-8 text-center">
        <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">
          We're sorry, but your system isn't compatible with Mysa
        </h1>
        <p className="text-gray-600 text-lg">
          Unfortunately, Mysa doesn't currently support heating or cooling systems with controls directly on the unit.
        </p>
        <p className="text-gray-600 text-lg">
          If you have any questions or would like more information, please don't hesitate to contact our customer
          support team.
        </p>
        <div className="pt-4">
          <Button
            className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white"
            onClick={() => (window.location.href = "https://getmysa.com/pages/support")}
          >
            Contact Mysa Support
          </Button>
        </div>
        <div>
          <Button
            variant="outline"
            className="w-full py-6 text-lg border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D]/10"
            onClick={() => router.push("/")}
          >
            Start Over
          </Button>
        </div>
      </div>
    </SharedLayout>
  )
}

