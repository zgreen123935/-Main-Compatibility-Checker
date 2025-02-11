import type React from "react"
import { SharedHeader } from "./shared-header"

interface SharedLayoutProps {
  children: React.ReactNode
  showBack?: boolean
  currentStep?: number
}

export function SharedLayout({ children, showBack = false, currentStep }: SharedLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SharedHeader showBack={showBack} currentStep={currentStep} />
      <main className="flex-1 px-6 py-8 pt-[calc(72px+2rem)] flex flex-col">
        <div className="max-w-md mx-auto w-full space-y-8">{children}</div>
      </main>
    </div>
  )
}

