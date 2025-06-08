import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function ProductSelection() {
  const { dispatch } = useInstall()

  const handleProductSelect = (productType: "centralHVAC" | "otherMysa") => {
    dispatch({ type: "SET_ANSWER", key: "productType", value: productType })
    dispatch({ type: "COMPLETE_STEP", step: "product-selection" })
    dispatch({ type: "SET_STEP", step: "power-off" })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12">
      <div className="max-w-2xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-medium text-[#2D2D2D] mb-6 leading-tight">
            Welcome to Mysa Installation
          </h1>
          <p className="text-xl text-[#4B5563] leading-relaxed max-w-lg mx-auto">
            This guide will help you install your Mysa thermostat in about 30 minutes.
          </p>
        </div>

        <div className="space-y-6 mb-12">
          <InstallButton
            title="Mysa for Central HVAC"
            onPress={() => handleProductSelect("centralHVAC")}
            className="w-full h-20 text-lg"
          />

          <InstallButton
            title="All other Mysa models"
            onPress={() => handleProductSelect("otherMysa")}
            variant="secondary"
            className="w-full h-20 text-lg"
          />
        </div>

        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-[#6B7280] italic">
            Thank you for choosing Mysa. You're helping the environment—doing something is better than nothing.
          </p>
        </div>
      </div>
    </div>
  )
}
