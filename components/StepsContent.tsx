"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import RemoteStepsOverview from "@/components/remote-steps-overview"
import WallThermostatStepsOverview from "@/components/wall-thermostat-steps-overview"
import HeaterACNotCompatible from "@/components/heater-ac-not-compatible"

function StepsContentInner() {
  const searchParams = useSearchParams()
  const method = searchParams.get("method")

  switch (method) {
    case "remote":
      return <RemoteStepsOverview />
    case "wall_thermostat":
      return <WallThermostatStepsOverview />
    case "on_heater":
      return <HeaterACNotCompatible />
    default:
      return <div>Invalid method selected</div>
  }
}

export default function StepsContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StepsContentInner />
    </Suspense>
  )
}

