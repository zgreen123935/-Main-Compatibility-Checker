import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalAttachPlate() {
  const { dispatch } = useInstall()

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "physical-attach-plate" })
    dispatch({ type: "SET_STEP", step: "electrical-attach-display" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Attach Wall Plate</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Secure the Mysa wall plate to the wall using the provided screws.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Final mounting steps:</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">1.</span>
              <span className="text-[#4B5563]">
                Position the wall plate over the marked holes (and trim plate if using one)
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">2.</span>
              <span className="text-[#4B5563]">Pull all labeled wires through the center opening</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">3.</span>
              <span className="text-[#4B5563]">
                Attach the wall plate using 2 or 3 screws provided (use correct screw orientation)
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1 text-lg">4.</span>
              <span className="text-[#4B5563]">Ensure the plate is firmly secured and level</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <span className="text-4xl mr-4">✅</span>
            <div>
              <h3 className="font-medium text-green-800 mb-2">Almost There!</h3>
              <p className="text-green-700 text-sm">
                Great job! The physical installation is nearly complete. Next, we'll connect the electrical components.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            <strong>Check:</strong> Make sure all wires are accessible and the wall plate is securely fastened before
            proceeding.
          </p>
        </div>

        <InstallButton title="Wall Plate Secure" onPress={handleContinue} className="w-full" />
      </div>
    </div>
  )
}
