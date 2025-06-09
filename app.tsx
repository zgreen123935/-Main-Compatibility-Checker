"use client"

import { InstallProvider, useInstall } from "./shared/context/InstallContext"
import { ProgressStepper } from "./shared/components/ProgressStepper"
import { ProductSelection } from "./screens/ProductSelection"
import { PowerOffReminder } from "./screens/PowerOffReminder"
import { ConfigShowCode } from "./screens/ConfigShowCode"
import { CompletionCongratulations } from "./screens/CompletionCongratulations"
import { CheckNoPower } from "./screens/CheckNoPower"
import { UploadPhoto } from "./screens/UploadPhoto"
import { RemoveCover } from "./screens/RemoveCover"
import { DetectHighVoltage } from "./screens/DetectHighVoltage"
import { CWireQuestion } from "./screens/CWireQuestion"
import { CWireRequirement } from "./screens/CWireRequirement"
import { ConfigJumperWires } from "./screens/ConfigJumperWires"
import { ConfigDualLabel } from "./screens/ConfigDualLabel"
import { ConfigHeatPump } from "./screens/ConfigHeatPump"
import { ConfigNewCWire } from "./screens/ConfigNewCWire"
import { ConfigWireIdentification } from "./screens/ConfigWireIdentification"
import { ConfigDualFuel } from "./screens/ConfigDualFuel"
import { ConfigWiredSensor } from "./screens/ConfigWiredSensor"
import { PhysicalLabelWires } from "./screens/PhysicalLabelWires"
import { PhysicalRemoveMount } from "./screens/PhysicalRemoveMount"
import { PhysicalCheckBox } from "./screens/PhysicalCheckBox"
import { PhysicalMarkHoles } from "./screens/PhysicalMarkHoles"
import { PhysicalSystemType } from "./screens/PhysicalSystemType"
import { PhysicalHeatingSources } from "./screens/PhysicalHeatingSources"
import { PhysicalInstallAnchors } from "./screens/PhysicalInstallAnchors"
import { PhysicalTrimPlate } from "./screens/PhysicalTrimPlate"
import { PhysicalAttachPlate } from "./screens/PhysicalAttachPlate"
import { SupabaseTestPage } from "./screens/SupabaseTestPage"

function InstallGuideContent() {
  const { state } = useInstall()

  const renderCurrentScreen = () => {
    switch (state.currentStep) {
      case "product-selection":
        return <ProductSelection />
      case "power-off":
        return <PowerOffReminder />
      case "check-no-power":
        return <CheckNoPower />
      case "upload-photo":
        return <UploadPhoto />
      case "remove-cover":
        return <RemoveCover />
      case "detect-high-voltage":
        return <DetectHighVoltage />
      case "c-wire-question":
        return <CWireQuestion />
      case "c-wire-requirement":
        return <CWireRequirement />
      case "config-jumper-wires":
        return <ConfigJumperWires />
      case "config-dual-label":
        return <ConfigDualLabel />
      case "config-heat-pump":
        return <ConfigHeatPump />
      case "config-new-c-wire":
        return <ConfigNewCWire />
      case "config-wire-identification":
        return <ConfigWireIdentification />
      case "config-dual-fuel":
        return <ConfigDualFuel />
      case "config-wired-sensor":
        return <ConfigWiredSensor />
      case "config-show-code":
        return <ConfigShowCode />
      case "physical-label-wires":
        return <PhysicalLabelWires />
      case "physical-remove-mount":
        return <PhysicalRemoveMount />
      case "physical-check-box":
        return <PhysicalCheckBox />
      case "physical-mark-holes":
        return <PhysicalMarkHoles />
      case "physical-system-type":
        return <PhysicalSystemType />
      case "physical-heating-sources":
        return <PhysicalHeatingSources />
      case "physical-install-anchors":
        return <PhysicalInstallAnchors />
      case "physical-trim-plate":
        return <PhysicalTrimPlate />
      case "physical-attach-plate":
        return <PhysicalAttachPlate />
      case "completion-congratulations":
        return <CompletionCongratulations />
      case "supabase-test":
        return <SupabaseTestPage />
      default:
        return <ProductSelection />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {state.currentStep !== "product-selection" && (
        <ProgressStepper currentStep={state.currentStep} completedSteps={state.completedSteps} />
      )}

      <main className="flex-1">{renderCurrentScreen()}</main>
    </div>
  )
}

export default function App() {
  return (
    <InstallProvider>
      <InstallGuideContent />
    </InstallProvider>
  )
}
