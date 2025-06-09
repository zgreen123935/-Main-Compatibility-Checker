"use client"

import type React from "react"
import { createContext, useContext, useReducer } from "react"

interface InstallState {
  answers: {
    hasCWire?: boolean
    jumperRemoved?: boolean
  }
  automatedDecisions: {
    hasCWireDetected?: boolean
    hasJumpersDetected?: boolean
    detectedWires?: string[]
    detectedJumpers?: Array<{ fromTerminal: string; toTerminal: string }>
  }
}

type InstallAction =
  | { type: "SET_HAS_CWIRE"; hasCWire: boolean }
  | { type: "SET_JUMPER_REMOVED"; jumperRemoved: boolean }
  | { type: "SET_AUTOMATED_DECISIONS"; decisions: Partial<InstallState["automatedDecisions"]> }
  | { type: "APPLY_AUTOMATED_FLOW" }

const initialState: InstallState = {
  answers: {},
  automatedDecisions: {},
}

const InstallContext = createContext<{
  state: InstallState
  dispatch: React.Dispatch<InstallAction>
}>({
  state: initialState,
  dispatch: () => null,
})

const installReducer = (state: InstallState, action: InstallAction): InstallState => {
  switch (action.type) {
    case "SET_HAS_CWIRE":
      return { ...state, answers: { ...state.answers, hasCWire: action.hasCWire } }
    case "SET_JUMPER_REMOVED":
      return { ...state, answers: { ...state.answers, jumperRemoved: action.jumperRemoved } }
    case "SET_AUTOMATED_DECISIONS":
      return {
        ...state,
        automatedDecisions: { ...state.automatedDecisions, ...action.decisions },
      }

    case "APPLY_AUTOMATED_FLOW":
      // Apply automated flow logic based on detected conditions
      const { hasCWireDetected, hasJumpersDetected } = state.automatedDecisions

      const updates: Partial<InstallState> = {}

      // Auto-answer C-wire question if detected
      if (hasCWireDetected !== undefined) {
        updates.answers = { ...state.answers, hasCWire: hasCWireDetected }
      }

      // Auto-answer jumper question if detected
      if (hasJumpersDetected !== undefined) {
        updates.answers = { ...state.answers, jumperRemoved: hasJumpersDetected }
      }

      return { ...state, ...updates }
    default:
      return state
  }
}

const InstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(installReducer, initialState)

  return <InstallContext.Provider value={{ state, dispatch }}>{children}</InstallContext.Provider>
}

const useInstall = () => {
  const context = useContext(InstallContext)
  if (!context) {
    throw new Error("useInstall must be used within an InstallProvider")
  }
  return context
}

export { InstallProvider, useInstall }
