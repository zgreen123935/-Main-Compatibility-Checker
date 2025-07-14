import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-medium text-[#2D2D2D] leading-tight tracking-tight mb-6">
              Smart Energy Solutions for Your Business
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Get custom pricing for Mysa's complete suite of smart thermostats and energy management solutions. Perfect
              for offices, retail spaces, and commercial buildings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#2D2D2D] hover:bg-gray-800 text-white px-8">
                Get Custom Pricing
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-gray-50 px-8 bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/images/zen-hq-hero.png"
              alt="Zen HQ Dashboard - Full control over your business energy bill"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
