"use client"

import type React from "react"

import { useState } from "react"

interface TooltipButtonProps {
  children: React.ReactNode
  tooltip: string
}

export function TooltipButton({ children, tooltip }: TooltipButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(true)}
        className="p-2 hover:bg-gray-50 rounded transition-colors"
        aria-label={`Help: ${tooltip}`}
      >
        {children}
      </button>

      {showTooltip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg">
            <p className="text-gray-700 mb-4">{tooltip}</p>
            <button
              onClick={() => setShowTooltip(false)}
              className="bg-[#2D2D2D] text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors ml-auto block"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
