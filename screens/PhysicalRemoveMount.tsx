import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalRemoveMount() {
  const { dispatch } = useInstall()

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "physical-remove-mount" })
    dispatch({ type: "SET_STEP", step: "physical-check-box" })
  }

  const showHelp = () => {
    alert(
      "Most thermostat mounts are held by 2-4 screws. Look for screws around the edges of the mount. Some mounts may also have clips or tabs that need to be pressed while pulling.",
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Remove Old Mount</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Carefully remove the old thermostat mount from the wall. Be sure wires don't slip back into the wall.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Instructions:</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">1.</span>
              <span className="text-[#4B5563]">Look for screws holding the mount to the wall (usually 2-4 screws)</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">2.</span>
              <span className="text-[#4B5563]">Remove screws carefully and set them aside</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">3.</span>
              <span className="text-[#4B5563]">
                Gently pull the mount away from the wall, being careful not to let wires fall back
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">4.</span>
              <span className="text-[#4B5563]">
                Secure wires with tape or wrap around a pencil to keep them accessible
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            <strong>Important:</strong> Don't let the wires slip back into the wall opening. Tape them to the wall or
            wrap around a pencil to keep them accessible.
          </p>
        </div>

        <div className="space-y-4">
          <InstallButton title="Mount Removed" onPress={handleContinue} className="w-full" />

          <InstallButton title="Need Help" onPress={showHelp} variant="secondary" className="w-full" />
        </div>
      </div>
    </div>
  )
}
