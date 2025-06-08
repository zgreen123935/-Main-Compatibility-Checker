import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function CheckNoPower() {
  const { dispatch } = useInstall()

  const handleNoPower = () => {
    dispatch({ type: "COMPLETE_STEP", step: "check-no-power" })
    dispatch({ type: "SET_STEP", step: "upload-photo" })
  }

  const handleStillPower = () => {
    alert("Please double-check your circuit breaker and try again. If you need help, contact our support team.")
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Verify No Power</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Let's make sure the power is completely off to your HVAC system.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-800 mb-4">Check for these signs:</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-3 mt-1">✓</span>
              <span className="text-blue-800">No air coming from vents</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-3 mt-1">✓</span>
              <span className="text-blue-800">No noise from HVAC system</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-3 mt-1">✓</span>
              <span className="text-blue-800">No lights on HVAC unit</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-3 mt-1">✓</span>
              <span className="text-blue-800">Old thermostat screen is blank (if it had one)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <InstallButton title="No Power, Continue" onPress={handleNoPower} className="w-full" />

          <InstallButton title="I Still See Power" onPress={handleStillPower} variant="secondary" className="w-full" />
        </div>
      </div>
    </div>
  )
}
