export interface ConfigInput {
  jumperRemoved: boolean
  dualLabel: boolean
  heatPump: boolean
  ranNewCWire: boolean
  wires: string[]
  dualFuel: boolean
  wiredSensor: boolean
  systemType?: string // Added to support fan coil detection
}

export interface ConfigOutput {
  configCode: string
  heatingType: string
  coolingType: string
  emergencyHeat: string
  reversingValve: string
}

export interface InstallProgress {
  productType: "centralHVAC" | "otherMysa"
  step: string
  answers: Record<string, any>
  photoURL?: string
  timestamp: number
}

export type InstallStep =
  | "product-selection"
  | "power-off"
  | "check-no-power"
  | "upload-photo"
  | "remove-cover"
  | "detect-high-voltage"
  | "c-wire-question"
  | "c-wire-requirement"
  | "config-jumper-wires"
  | "config-dual-label"
  | "config-heat-pump"
  | "config-new-c-wire"
  | "config-wire-identification"
  | "config-dual-fuel"
  | "config-wired-sensor"
  | "config-show-code"
  | "physical-label-wires"
  | "physical-remove-mount"
  | "physical-check-box"
  | "physical-mark-holes"
  | "physical-system-type"
  | "physical-heating-sources"
  | "physical-install-anchors"
  | "physical-trim-plate"
  | "physical-attach-plate"
  | "electrical-attach-display"
  | "electrical-check-switch"
  | "electrical-connect-wires"
  | "electrical-turn-on-power"
  | "electrical-status-check"
  | "completion-congratulations"
