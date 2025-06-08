import { InstallButton } from "../shared/components/InstallButton"

export function CompletionCongratulations() {
  const handleGoToApp = () => {
    console.log("Navigate to Mysa app")
  }

  const handleVisitFAQ = () => {
    console.log("Open FAQ")
  }

  const handleContactSupport = () => {
    console.log("Contact support")
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-12">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl md:text-5xl font-medium text-[#2D2D2D] mb-4">Congratulations!</h1>
          <h2 className="text-2xl font-medium text-[#BAE5D4]">Installation Complete</h2>
        </div>

        <div className="mb-12 px-4">
          <p className="text-xl text-[#4B5563] leading-relaxed mb-6">
            Thank you for choosing Mysa. You're now ready to enjoy precise climate control and energy savings.
          </p>

          <p className="text-[#6B7280] italic">
            We appreciate you helping the environment—remember, doing something is better than nothing.
          </p>
        </div>

        <div className="mb-12">
          <div className="w-32 h-32 bg-[#2D2D2D] rounded-lg mx-auto flex items-center justify-center shadow-lg mb-4">
            <div className="w-20 h-20 bg-white rounded flex items-center justify-center relative">
              <span className="text-2xl font-bold text-[#2D2D2D]">72°</span>
              <div className="absolute bottom-2 w-2 h-2 bg-[#BAE5D4] rounded-full" />
            </div>
          </div>
          <p className="text-[#4B5563] font-medium">Your Mysa is ready to go!</p>
        </div>

        <div className="space-y-4 mb-12">
          <InstallButton title="Go to Mysa App" onPress={handleGoToApp} className="w-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InstallButton title="Visit FAQ" onPress={handleVisitFAQ} variant="secondary" className="w-full" />

            <InstallButton
              title="Contact Support"
              onPress={handleContactSupport}
              variant="secondary"
              className="w-full"
            />
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-[#6B7280] leading-relaxed">
            Need help with setup? Our support team is here to help you get the most out of your Mysa thermostat.
          </p>
        </div>
      </div>
    </div>
  )
}
