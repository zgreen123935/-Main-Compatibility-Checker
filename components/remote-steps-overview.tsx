"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { SharedLayout } from "./SharedLayout"

const steps = [
  { title: "Take a picture of the front of the remote", route: "/capture/front-remote" },
  { title: "Take a picture of the back of the remote", route: "/capture/back-remote" },
  { title: "Take a picture of the mini split or AC unit itself", route: "/capture/AC-unit" },
]

export default function RemoteStepsOverview() {
  const router = useRouter()

  return (
    <SharedLayout showBack>
      <div className="space-y-4">
        <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Here's what you need to do.</h1>
        <p className="text-gray-600 text-lg">
          Mysa for Ductless Heatpumps and AC works with thousands of brands and models by replicating the commands from
          your existing Infrared remote.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BAE5D4] flex items-center justify-center">
              <span className="text-[#2D2D2D] font-medium">{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-lg pt-1">{step.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Button
          className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white"
          onClick={() => router.push(steps[0].route)}
        >
          Next
        </Button>
      </div>
    </SharedLayout>
  )
}

