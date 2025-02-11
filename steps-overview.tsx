import { Button } from "@/components/ui/button"

export default function StepsOverview() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-md mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Here's an overview of the steps.</h1>
            <p className="text-gray-600 text-lg">
              Our AI will analyze your thermostat's compatibility in just 2-3 minutes. Here's what you'll need to do:
            </p>
          </div>

          {/* Steps List */}
          <div className="space-y-6">
            {[
              "Take a clear photo of your current thermostat.",
              "Remove your thermostat's cover plate.",
              "Take a photo of the exposed wiring.",
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BAE5D4] flex items-center justify-center">
                  <span className="text-[#2D2D2D] font-medium">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 text-lg pt-1">{step}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Button className="w-full py-6 text-lg bg-[#BAE5D4] hover:bg-[#BAE5D4]/90 text-[#2D2D2D]">
              Start Camera
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

