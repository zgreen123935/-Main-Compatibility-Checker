import type { ReactNode } from "react"
import { AppProvider } from "@/context/AppContext"
import "./globals.css"

export const metadata = {
  title: 'Mysa Thermostat Compatibility Checker',
  description: 'Check if your heating system is compatible with Mysa smart thermostats',
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
