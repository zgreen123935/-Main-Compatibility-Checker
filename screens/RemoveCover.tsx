import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function RemoveCover() {
  const { dispatch } = useInstall()

  const handleCoverRemoved = () => {
    dispatch({ type: "COMPLETE_STEP", step: "remove-cover" })
    dispatch({ type: "SET_STEP", step: "detect-high-voltage" })
  }

  const showHelp = () => {
    alert(
      "Most thermostat covers either pop off by pulling gently, or require removing 1-2 screws. Look for small screws at the bottom or sides of the thermostat.",
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Remove Thermostat Cover</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Remove your old thermostat cover to access the wiring. Some covers pop off; others require a screwdriver.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Instructions:</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-3 mt-1">1.</span>
              <span className="text-[#4B5563]">Look for screws at the bottom or sides of the thermostat</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-3 mt-1">2.</span>
              <span className="text-[#4B5563]">If no screws, try gently pulling the cover straight toward you</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-3 mt-1">3.</span>
              <span className="text-[#4B5563]">Once removed, you'll see all the wiring connections</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            <strong>Tip:</strong> Be gentle when removing the cover. If it feels stuck, double-check for hidden screws.
          </p>
        </div>

        <div className="space-y-4">
          <InstallButton title="Cover Removed" onPress={handleCoverRemoved} className="w-full" />

          <InstallButton title="Help Removing Cover" onPress={showHelp} variant="secondary" className="w-full" />
        </div>
      </div>
    </div>
  )
}
