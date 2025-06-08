import { InstallButton } from "../shared/components/InstallButton"
import { TooltipButton } from "../shared/components/TooltipButton"
import { useInstall } from "../shared/context/InstallContext"

export function PowerOffReminder() {
  const { dispatch } = useInstall()

  const handlePowerOff = () => {
    dispatch({ type: "COMPLETE_STEP", step: "power-off" })
    dispatch({ type: "SET_STEP", step: "check-no-power" }) // Now this step exists
  }

  const showHelpModal = () => {
    alert(
      'Locate your circuit breaker panel and switch off the breaker labeled "HVAC", "Furnace", or "Air Handler". You may also find a switch near your HVAC unit.',
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-medium text-yellow-800 mb-4">Safety First</h2>
          <p className="text-yellow-800 leading-relaxed">
            To avoid personal risk and damage to your HVAC system, turn OFF power to your HVAC system at the circuit
            breaker or switch.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-medium text-[#2D2D2D] mb-6">Before proceeding:</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1">•</span>
              <span className="text-[#4B5563]">Locate your circuit breaker panel</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1">•</span>
              <span className="text-[#4B5563]">Find the breaker labeled "HVAC" or "Furnace"</span>
            </div>
            <div className="flex items-start">
              <span className="text-[#BAE5D4] font-bold mr-4 mt-1">•</span>
              <span className="text-[#4B5563]">Switch the breaker to the OFF position</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <TooltipButton tooltip="Look for a switch near your HVAC unit or in your utility room. It may be labeled 'Furnace', 'AC', or 'HVAC'. If you can't find it, check your circuit breaker panel for a breaker with similar labels.">
            <span className="text-[#BAE5D4] underline cursor-pointer">
              Need help finding the power switch? Click here
            </span>
          </TooltipButton>
        </div>

        <div className="space-y-4">
          <InstallButton title="I've Turned Off Power" onPress={handlePowerOff} className="w-full" />

          <InstallButton
            title="I'm Not Sure, Show Me How"
            onPress={showHelpModal}
            variant="secondary"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
