export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-medium text-[#2D2D2D] mb-4">mysa</div>
            <p className="text-gray-600">Smart energy solutions for modern businesses</p>
          </div>

          <div>
            <h4 className="font-medium text-[#2D2D2D] mb-4">Products</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  Zen Thermostat
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  Zen HQ Platform
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  Enterprise Solutions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-[#2D2D2D] mb-4">Support</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  Installation Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-[#2D2D2D] mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2D2D2D]">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
          <p>&copy; 2024 Mysa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
