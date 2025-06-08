"use client"

import { useState } from "react"

export function PhotoGuide() {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <>
      <button onClick={() => setShowGuide(true)} className="text-blue-600 underline text-sm mb-4 block mx-auto">
        What should my thermostat photo look like?
      </button>

      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">Good Thermostat Photos</h3>

            <div className="space-y-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-[#2D2D2D] mb-2">✅ What to include:</h4>
                <ul className="text-sm text-[#4B5563] space-y-1">
                  <li>• Clear view of wire terminals with labels (R, W, Y, G, C, etc.)</li>
                  <li>• Good lighting - avoid shadows</li>
                  <li>• Close-up view of the wiring area</li>
                  <li>• All wire labels should be readable</li>
                  <li>• Remove the thermostat cover first</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-[#2D2D2D] mb-2">❌ Avoid these:</h4>
                <ul className="text-sm text-[#4B5563] space-y-1">
                  <li>• Blurry or out-of-focus images</li>
                  <li>• Photos of documents, spreadsheets, or manuals</li>
                  <li>• Images where wire labels aren't visible</li>
                  <li>• Photos taken from too far away</li>
                  <li>• Dark or poorly lit images</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use your phone's flashlight for better lighting</li>
                  <li>• Take multiple photos from different angles</li>
                  <li>• Make sure your hands aren't blocking the view</li>
                  <li>• Clean any dust off the terminals before photographing</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="bg-[#2D2D2D] text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors mx-auto block"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
