import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-medium text-[#2D2D2D]">mysa</div>
            <span className="ml-2 text-sm text-gray-500 font-normal">for Business</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#products" className="text-gray-600 hover:text-[#2D2D2D] font-normal">
              Products
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-[#2D2D2D] font-normal">
              Pricing
            </a>
            <a href="#support" className="text-gray-600 hover:text-[#2D2D2D] font-normal">
              Support
            </a>
            <Button variant="outline" className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-gray-50 bg-transparent">
              Sign In
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
