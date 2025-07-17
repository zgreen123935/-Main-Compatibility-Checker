"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  ChevronDown,
  MapPin,
  ShoppingCart,
  Download,
  FileText,
  Settings,
  Wifi,
  Thermometer,
  AlertCircle,
  Menu,
  X,
  Search,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CentralHVACManual() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const navigationItems = [
    { label: "Products", hasDropdown: true },
    { label: "For Business", hasDropdown: true },
    { label: "For Utilities", hasDropdown: true },
    { label: "Support", hasDropdown: true },
  ]

  const manualSections = [
    {
      id: "configuration-code-finder",
      title: "Configuration Code Finder",
      description: "Interactive Flow",
      icon: Settings,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      summary: "Find the right configuration settings for your specific HVAC system with our interactive tool.",
      link: "/centralHVAC/configuration-finder",
    },
    {
      id: "advanced-installation-support",
      title: "Advanced Installation Support",
      description: "Wiring Diagrams, Fan Coil Units, C-Wire Adapter",
      icon: FileText,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      summary: "Comprehensive installation resources for complex HVAC systems and specialized configurations.",
      link: "/centralHVAC/advanced-installation",
    },
    {
      id: "c-wire-power-adapter-support",
      title: "C-Wire Power Adapter Support",
      description: "How to determine if you have a c-wire, Connecting an unused c-wire",
      icon: Wifi,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      summary: "Everything you need to know about C-wire power adapters and alternative power solutions.",
      link: "/centralHVAC/c-wire-support",
    },
    {
      id: "device-overview",
      title: "Device Overview",
      description: "Manual Device Controls",
      icon: Thermometer,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      summary: "Complete guide to your Mysa thermostat's physical controls, display, and manual operation.",
      link: "/centralHVAC/device-overview",
    },
    {
      id: "pairing-app-support",
      title: "Pairing/App Support",
      description: "Connecting Your Mysa, App Features",
      icon: Download,
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
      summary: "Step-by-step instructions for connecting your thermostat to the Mysa mobile app.",
      link: "/centralHVAC/app-support",
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Get Help",
      icon: AlertCircle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      summary: "Common issues, error codes, and solutions to get your Mysa thermostat working properly.",
      link: "/centralHVAC/troubleshooting",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-medium">
                <span className="text-[#E91E63]">mysa</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.label} className="relative group">
                  <button className="flex items-center text-[#6B7280] hover:text-[#2D2D2D] font-medium">
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="ml-1 w-4 h-4" />}
                  </button>
                </div>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search manual..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center text-[#6B7280]">
                <img src="/placeholder.svg?height=20&width=30&text=US" alt="US Flag" className="w-5 h-4 mr-1" />
                <ChevronDown className="w-4 h-4" />
              </div>
              <MapPin className="w-5 h-5 text-[#6B7280]" />
              <ShoppingCart className="w-5 h-5 text-[#6B7280]" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              {navigationItems.map((item) => (
                <button key={item.label} className="block w-full text-left text-[#6B7280] font-medium py-2">
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-[#BAE5D4] text-[#2D2D2D] hover:bg-[#BAE5D4] mb-4">Central HVAC Manual</Badge>
            <h1 className="text-5xl font-medium text-[#2D2D2D] mb-6 leading-tight">
              Mysa Central HVAC
              <br />
              User Manual
            </h1>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              Complete reference guide for installation, configuration, and operation of your Mysa Central HVAC
              thermostat.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=600&text=Mysa+Central+HVAC+Thermostat"
                alt="Mysa Central HVAC Thermostat"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Manual Sections Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-[#2D2D2D] mb-4">Manual Sections</h2>
            <p className="text-lg text-[#6B7280]">Choose a section to access detailed information and resources</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {manualSections.map((section) => (
              <Link key={section.id} href={section.link}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm h-full">
                  <CardHeader className={`${section.bgColor} border-b border-gray-200`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <section.icon className={`w-6 h-6 ${section.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-[#2D2D2D] mb-1 group-hover:text-[#1a1a1a]">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-[#6B7280] text-sm">{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <p className="text-[#4B5563] leading-relaxed flex-1 mb-4">{section.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#6B7280]">Learn more</span>
                      <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#2D2D2D] group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-16 bg-[#2D2D2D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-medium text-white mb-4">Need Additional Help?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Our support team is here to help with any questions about your Mysa thermostat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-[#2D2D2D]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Complete Manual
            </Button>
            <Button className="bg-[#BAE5D4] text-[#2D2D2D] hover:bg-[#a8dcc7]">Contact Support Team</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="text-2xl font-medium mb-4">
                <span className="text-[#E91E63]">mysa</span>
              </div>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Smart thermostats for baseboard heating, mini-split heat pumps, and central HVAC systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[#2D2D2D] mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li>
                  <Link href="#" className="hover:text-[#2D2D2D]">
                    Central HVAC
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2D2D2D]">
                    Baseboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2D2D2D]">
                    Mini-Split
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#2D2D2D] mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li>
                  <Link href="/centralHVAC/configuration-finder" className="hover:text-[#2D2D2D]">
                    Configuration Finder
                  </Link>
                </li>
                <li>
                  <Link href="/centralHVAC/troubleshooting" className="hover:text-[#2D2D2D]">
                    Troubleshooting
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2D2D2D]">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#2D2D2D] mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-[#6B7280]">
                <li>
                  <Link href="#" className="hover:text-[#2D2D2D]">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2D2D2D]">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-[#2D2D2D]">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#6B7280] text-sm">© 2024 Mysa Smart Thermostats. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-[#6B7280] hover:text-[#2D2D2D] text-sm">
                Privacy
              </Link>
              <Link href="#" className="text-[#6B7280] hover:text-[#2D2D2D] text-sm">
                Terms
              </Link>
              <Link href="#" className="text-[#6B7280] hover:text-[#2D2D2D] text-sm">
                Warranty
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
