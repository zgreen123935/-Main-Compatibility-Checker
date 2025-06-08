"use client"

interface InstallButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary"
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function InstallButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: InstallButtonProps) {
  const baseClasses = "px-8 py-3 rounded-lg font-semibold min-h-12 flex items-center justify-center transition-colors"

  const variantClasses = {
    primary: "bg-primaryBlack text-white hover:bg-gray-800 disabled:bg-gray-400",
    secondary: "bg-white text-primaryBlack border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100",
  }

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        title
      )}
    </button>
  )
}
