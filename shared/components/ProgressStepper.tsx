import type { InstallStep } from "../types"

interface ProgressStepperProps {
  currentStep: InstallStep
  completedSteps: InstallStep[]
}

const stepPhases = [
  {
    phase: "Pre-Installation",
    steps: ["product-selection", "power-off", "check-no-power", "upload-photo"],
  },
  {
    phase: "Compatibility",
    steps: ["remove-cover", "detect-high-voltage", "c-wire-question", "c-wire-requirement"],
  },
  {
    phase: "Configuration",
    steps: [
      "config-jumper-wires",
      "config-dual-label",
      "config-heat-pump",
      "config-new-c-wire",
      "config-wire-identification",
      "config-dual-fuel",
      "config-wired-sensor",
      "config-show-code",
    ],
  },
  {
    phase: "Physical Install",
    steps: [
      "physical-label-wires",
      "physical-remove-mount",
      "physical-check-box",
      "physical-mark-holes",
      "physical-system-type",
      "physical-heating-sources",
      "physical-install-anchors",
      "physical-trim-plate",
      "physical-attach-plate",
    ],
  },
  {
    phase: "Electrical",
    steps: [
      "electrical-attach-display",
      "electrical-check-switch",
      "electrical-connect-wires",
      "electrical-turn-on-power",
      "electrical-status-check",
    ],
  },
  {
    phase: "Complete",
    steps: ["completion-congratulations"],
  },
]

export function ProgressStepper({ currentStep, completedSteps }: ProgressStepperProps) {
  const getCurrentPhaseIndex = () => {
    return stepPhases.findIndex((phase) => phase.steps.includes(currentStep))
  }

  const isPhaseCompleted = (phaseIndex: number) => {
    const phase = stepPhases[phaseIndex]
    return phase.steps.every((step) => completedSteps.includes(step as InstallStep))
  }

  const isPhaseActive = (phaseIndex: number) => {
    return phaseIndex === getCurrentPhaseIndex()
  }

  return (
    <div className="bg-white py-4 border-b border-gray-200">
      <div className="flex items-center justify-center overflow-x-auto px-6">
        <div className="flex items-center space-x-4 min-w-max">
          {stepPhases.map((phase, index) => (
            <div key={phase.phase} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    isPhaseCompleted(index)
                      ? "bg-[#BAE5D4] text-[#2D2D2D]"
                      : isPhaseActive(index)
                        ? "bg-[#2D2D2D] text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isPhaseCompleted(index) ? "✓" : index + 1}
                </div>
                <span
                  className={`mt-2 text-xs text-center max-w-20 ${
                    isPhaseCompleted(index) || isPhaseActive(index) ? "text-[#2D2D2D] font-semibold" : "text-gray-500"
                  }`}
                >
                  {phase.phase}
                </span>
              </div>
              {index < stepPhases.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${isPhaseCompleted(index) ? "bg-[#BAE5D4]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
