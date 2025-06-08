import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalLabelWires() {
  const { dispatch } = useInstall()

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "physical-label-wires" })
    dispatch({ type: "SET_STEP", step: "physical-remove-mount" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Label Your Wires</h1>
          <p className="text-[#4B5563] leading-relaxed">
            With the HVAC power still off, carefully label each wire before removing them from the old thermostat.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="text-4xl mb-4 text-center">⚠️</div>
          <h3 className="text-lg font-medium text-yellow-800 mb-4 text-center">Important Safety Reminder</h3>
          <p className="text-yellow-800 text-center">
            Make sure HVAC power is still OFF before proceeding with any wiring work.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Step-by-step instructions:</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">1.</span>
              <span className="text-[#4B5563]">Remove each wire from the old thermostat one at a time</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">2.</span>
              <span className="text-[#4B5563]">
                Attach the label sticker provided, approximately 1 inch (25 mm) from the wire end
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">3.</span>
              <span className="text-[#4B5563]">
                Keep labels organized—this helps when reconnecting to your new Mysa
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">4.</span>
              <span className="text-[#4B5563]">
                Wrap wires around a pencil or tape them to prevent them from falling back into the wall
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-800">
            <strong>Tip:</strong> Take a photo of the labeled wires as an extra reference before proceeding.
          </p>
        </div>

        <InstallButton title="I've Labeled All Wires" onPress={handleContinue} className="w-full" />
      </div>
    </div>
  )
}
