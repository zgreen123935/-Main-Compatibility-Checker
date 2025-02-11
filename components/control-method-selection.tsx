"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAppContext } from "@/context/AppContext"
import { SharedLayout } from "@/components/SharedLayout"
import Link from "next/link"

interface ControlOption {
  value: string
  label: string
  description: string
  imageSrc: string
}

const controlOptions: ControlOption[] = [
  {
    value: "wall_thermostat",
    label: "Wall Thermostat",
    description: "Using a thermostat mounted on the wall",
    imageSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thermostat_2-hZ5Co74Bh7GaH5UpoCUjLeBEA4vtYY.png",
  },
  {
    value: "remote",
    label: "Remote Control",
    description: "With a handheld Infrared remote",
    imageSrc: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/default-7nacCBvePXthxa664Zjq3yBLLSByKM.png",
  },
  {
    value: "on_heater",
    label: "Heater / Air Conditioner",
    description: "Directly on the unit itself.",
    imageSrc:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download%20(3)-hoB8WD5t3rnqK3YWIElv5wVmWfUOom.png",
  },
]

export default function ControlMethodSelection() {
  const router = useRouter()
  const { dispatch } = useAppContext()

  const handleOptionClick = (method: string) => {
    dispatch({ type: "SET_CONTROL_METHOD", payload: method })
    router.push(`/steps?method=${method}`)
  }

  return (
    <SharedLayout>
      <div className="space-y-8">
        <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">How do you adjust the temperature?</h1>
        <div className="space-y-4">
          {controlOptions.map((option) => (
            <Link
              key={option.value}
              href={`/steps?method=${option.value}`}
              onClick={(e) => {
                e.preventDefault()
                handleOptionClick(option.value)
              }}
              className="block w-full"
            >
              <div className="flex items-center space-x-4 border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="w-[100px] h-[100px] bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <Image
                    src={option.imageSrc || "/placeholder.svg"}
                    alt={`${option.label} icon`}
                    width={100}
                    height={100}
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-[#2D2D2D]">{option.label}</h2>
                  <p className="text-gray-600">{option.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SharedLayout>
  )
}
