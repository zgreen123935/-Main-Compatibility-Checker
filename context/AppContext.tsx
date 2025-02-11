"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

interface AppState {
  controlMethod: string | null
  thermostatModel: string | null
  wiringConfiguration: string | null
  frontRemoteImage: string | null
  backRemoteImage: string | null
  acUnitImage: string | null
}

type Action =
  | { type: "SET_CONTROL_METHOD"; payload: string }
  | { type: "SET_THERMOSTAT_MODEL"; payload: string }
  | { type: "SET_WIRING_CONFIGURATION"; payload: string }
  | { type: "SET_FRONT_REMOTE_IMAGE"; payload: string }
  | { type: "SET_BACK_REMOTE_IMAGE"; payload: string }
  | { type: "SET_AC_UNIT_IMAGE"; payload: string }

const initialState: AppState = {
  controlMethod: null,
  thermostatModel: null,
  wiringConfiguration: null,
  frontRemoteImage: null,
  backRemoteImage: null,
  acUnitImage: null,
}

const AppContext = createContext<
  | {
      state: AppState
      dispatch: React.Dispatch<Action>
    }
  | undefined
>(undefined)

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_CONTROL_METHOD":
      return { ...state, controlMethod: action.payload }
    case "SET_THERMOSTAT_MODEL":
      return { ...state, thermostatModel: action.payload }
    case "SET_WIRING_CONFIGURATION":
      return { ...state, wiringConfiguration: action.payload }
    case "SET_FRONT_REMOTE_IMAGE":
      return { ...state, frontRemoteImage: action.payload }
    case "SET_BACK_REMOTE_IMAGE":
      return { ...state, backRemoteImage: action.payload }
    case "SET_AC_UNIT_IMAGE":
      return { ...state, acUnitImage: action.payload }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

