"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { InstallStep, InstallProgress, ConfigInput } from "../types"

interface InstallState {
  currentStep: InstallStep
  completedSteps: InstallStep[]
  answers: Record<string, any>
  photoURL?: string
  configInput: Partial<ConfigInput>
}

type InstallAction =
  | { type: "SET_STEP"; step: InstallStep }
  | { type: "COMPLETE_STEP"; step: InstallStep }
  | { type: "SET_ANSWER"; key: string; value: any }
  | { type: "SET_PHOTO"; url: string }
  | { type: "RESET" }
  | { type: "LOAD_PROGRESS"; progress: InstallProgress }

const initialState: InstallState = {
  currentStep: "product-selection",
  completedSteps: [],
  answers: {},
  configInput: {},
}

function installReducer(state: InstallState, action: InstallAction): InstallState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step }

    case "COMPLETE_STEP":
      return {
        ...state,
        completedSteps: [...state.completedSteps.filter((s) => s !== action.step), action.step],
      }

    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.key]: action.value },
      }

    case "SET_PHOTO":
      return { ...state, photoURL: action.url }

    case "RESET":
      return initialState

    case "LOAD_PROGRESS":
      return {
        currentStep: action.progress.step as InstallStep,
        completedSteps: [],
        answers: action.progress.answers,
        photoURL: action.progress.photoURL,
        configInput: {},
      }

    default:
      return state
  }
}

const InstallContext = createContext<{
  state: InstallState
  dispatch: React.Dispatch<InstallAction>
} | null>(null)

export function InstallProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(installReducer, initialState)

  return <InstallContext.Provider value={{ state, dispatch }}>{children}</InstallContext.Provider>
}

export function useInstall() {
  const context = useContext(InstallContext)
  if (!context) {
    throw new Error("useInstall must be used within InstallProvider")
  }
  return context
}
