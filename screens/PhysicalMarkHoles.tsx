import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalMarkHoles() {
  const { dispatch } = useInstall()

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "physical-mark-holes" })
    dispatch({ type: "SET_STEP", step: "physical-system-type" })
  }

  const showLevelingHelp = () => {
    alert(
      "Use the bubble level on the Mysa wall plate to ensure it's perfectly horizontal. The bubble should be centered between the lines. A level installation ensures proper operation and appearance.",
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Mark Screw Holes</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Position the Mysa wall plate and mark the screw holes for mounting.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Step-by-step:</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">1.</span>
              <span className="text-[#4B5563]">Remove the Mysa display from the wall plate</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">2.</span>
              <span className="text-[#4B5563]">Place the wall plate on the wall and pull wires through the center</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">3.</span>
              <span className="text-[#4B5563]">Ensure the wall plate is level using the bubble level on the mount</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">4.</span>
              <span className="text-[#4B5563]">Mark screw holes with a pencil</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <span className="text-4xl mr-4">📏</span>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Level Installation</h3>
              <p className="text-blue-700 text-sm">
                Use the built-in bubble level on the wall plate to ensure perfect alignment. The bubble should be
                centered between the lines.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <InstallButton title="Holes Marked" onPress={handleContinue} className="w-full" />

          <InstallButton title="Need Leveling Help" onPress={showLevelingHelp} variant="secondary" className="w-full" />
        </div>
      </div>
    </div>
  )
}
