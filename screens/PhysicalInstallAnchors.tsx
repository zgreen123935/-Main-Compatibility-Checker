import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalInstallAnchors() {
  const { dispatch } = useInstall()

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "physical-install-anchors" })
    dispatch({ type: "SET_STEP", step: "physical-trim-plate" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Install Anchors & Mount</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Install the appropriate anchors and mount the Mysa wall plate securely.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Installation Instructions:</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">1.</span>
              <div>
                <span className="text-[#4B5563] font-medium">For Drywall:</span>
                <p className="text-[#4B5563] text-sm mt-1">
                  Use self-tapping anchors (provided). Drill pilot holes (~3/32″ for hardwood, ~5/64″ for softwood).
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">2.</span>
              <div>
                <span className="text-[#4B5563] font-medium">For Wood:</span>
                <p className="text-[#4B5563] text-sm mt-1">
                  Drill pilot holes with recommended bit size and use screws directly.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">3.</span>
              <span className="text-[#4B5563]">Use anchors or screws as appropriate for your wall type</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">4.</span>
              <span className="text-[#4B5563]">Ensure the wall plate is firmly secured and level</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <span className="text-4xl mr-4">🔧</span>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Anchor Selection</h3>
              <p className="text-blue-700 text-sm">
                Choose the right anchor for your wall type. Drywall needs anchors, while wood studs can use screws
                directly.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            <strong>Important:</strong> Make sure the wall plate is securely fastened. A loose mount can cause
            connection issues.
          </p>
        </div>

        <InstallButton title="Anchors Installed" onPress={handleContinue} className="w-full" />
      </div>
    </div>
  )
}
