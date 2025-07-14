import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function ProductShowcase() {
  const products = [
    {
      name: "Zen Wifi Thermostat",
      description: "Smart thermostat with wifi connectivity for complete climate control",
      image: "/images/zen-thermostat.png",
      features: ["WiFi connectivity", "Mobile app control", "Energy reporting", "Multi-zone support"],
    },
    {
      name: "Zen HQ Platform",
      description: "Comprehensive energy management dashboard for business operations",
      image: "/images/zen-hq-hero.png",
      features: ["Real-time monitoring", "Cost analytics", "Automated scheduling", "Multi-location management"],
    },
  ]

  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-medium text-[#2D2D2D] mb-4">Enterprise-Ready Solutions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our complete suite of smart energy products designed specifically for business environments
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="aspect-video mb-6 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-medium text-[#2D2D2D] mb-3">{product.name}</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <ul className="space-y-2">
                  {product.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-[#BAE5D4] rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
