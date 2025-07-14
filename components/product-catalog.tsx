"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Filter } from "lucide-react"

export function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<{ [key: string]: number }>({})

  const products = [
    {
      id: "zen-wifi",
      name: "Zen Wifi Thermostat",
      category: "thermostats",
      image: "/placeholder.svg?height=200&width=200",
      retailPrice: 89.99,
      partnerPrice: 76.49,
      discount: 15,
      inStock: true,
      description: "Smart WiFi thermostat with mobile app control and energy reporting",
      features: ["WiFi Connectivity", "Mobile App", "Energy Reports", "Voice Control"],
    },
    {
      id: "zen-pro",
      name: "Zen Pro Thermostat",
      category: "thermostats",
      image: "/placeholder.svg?height=200&width=200",
      retailPrice: 129.99,
      partnerPrice: 110.49,
      discount: 15,
      inStock: true,
      description: "Professional-grade thermostat with advanced scheduling and multi-zone support",
      features: ["Multi-Zone", "Advanced Scheduling", "Professional Install", "2-Year Warranty"],
    },
    {
      id: "zen-hub",
      name: "Zen Hub Controller",
      category: "controllers",
      image: "/placeholder.svg?height=200&width=200",
      retailPrice: 199.99,
      partnerPrice: 169.99,
      discount: 15,
      inStock: true,
      description: "Central hub for managing multiple Zen devices across large installations",
      features: ["Multi-Device Control", "Cloud Management", "API Access", "Enterprise Support"],
    },
    {
      id: "zen-sensor",
      name: "Zen Temperature Sensor",
      category: "sensors",
      image: "/placeholder.svg?height=200&width=200",
      retailPrice: 39.99,
      partnerPrice: 33.99,
      discount: 15,
      inStock: true,
      description: "Wireless temperature sensor for enhanced climate control accuracy",
      features: ["Wireless", "Long Battery Life", "High Accuracy", "Easy Installation"],
    },
    {
      id: "zen-switch",
      name: "Zen Smart Switch",
      category: "switches",
      image: "/placeholder.svg?height=200&width=200",
      retailPrice: 49.99,
      partnerPrice: 42.49,
      discount: 15,
      inStock: false,
      description: "Smart switch with scheduling and remote control capabilities",
      features: ["Remote Control", "Scheduling", "Energy Monitoring", "Easy Install"],
    },
    {
      id: "zen-bundle",
      name: "Zen Business Bundle",
      category: "bundles",
      image: "/placeholder.svg?height=200&width=200",
      retailPrice: 399.99,
      partnerPrice: 319.99,
      discount: 20,
      inStock: true,
      description: "Complete smart climate solution for small to medium businesses",
      features: ["5 Thermostats", "1 Hub", "10 Sensors", "Professional Setup"],
    },
  ]

  const categories = [
    { value: "all", label: "All Products" },
    { value: "thermostats", label: "Thermostats" },
    { value: "controllers", label: "Controllers" },
    { value: "sensors", label: "Sensors" },
    { value: "switches", label: "Switches" },
    { value: "bundles", label: "Bundles" },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }))
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-[#2D2D2D] mb-6">Product Catalog</h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-[#2D2D2D]"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-[#2D2D2D]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-medium text-[#2D2D2D]">{product.name}</CardTitle>
                {!product.inStock && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {product.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.features.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 line-through">MSRP: ${product.retailPrice}</span>
                  <Badge className="bg-[#BAE5D4] text-[#2D2D2D] hover:bg-[#BAE5D4]">{product.discount}% OFF</Badge>
                </div>
                <div className="text-2xl font-semibold text-[#2D2D2D]">${product.partnerPrice}</div>
                <div className="text-sm text-green-600">
                  You save: ${(product.retailPrice - product.partnerPrice).toFixed(2)}
                </div>
              </div>

              <Button
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
                className="w-full bg-[#2D2D2D] hover:bg-gray-800 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {cart[product.id] ? `Add Another (${cart[product.id]} in cart)` : "Add to Cart"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
