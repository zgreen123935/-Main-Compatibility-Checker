"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  ChevronDown,
  MapPin,
  ShoppingCart,
  FileText,
  Settings,
  AlertCircle,
  Menu,
  X,
  ArrowRight,
  Smartphone,
  Apple,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CentralHVACManual() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const navigationItems = [
    { label: "Products", hasDropdown: true },
    { label: "For Business", hasDropdown: true },
    { label: "For Utilities", hasDropdown: true },
    { label: "Support", hasDropdown: true },
  ]

  const tabSections = [
    { id: "welcome", label: "Welcome", active: true },
    { id: "whats-in-box", label: "What's in the Box?" },
    { id: "installation", label: "Installation" },
    { id: "pairing", label: "Pairing" },
    { id: "display-icons", label: "Display Icons" },
    { id: "features", label: "Features" },
    { id: "troubleshooting", label: "Troubleshooting" },
  ]

  const boxContents = [
    {
      title: "1x Mysa for Central HVAC",
      image: "/placeholder.svg?height=200&width=200&text=Mysa+Thermostat",
    },
    {
      title: "2x Mounting Screws",
      image: "/placeholder.svg?height=200&width=200&text=Screws",
    },
    {
      title: "3x Wire Nuts",
      image: "/placeholder.svg?height=200&width=200&text=Wire+Nuts",
    },
    {
      title: "Wiring Instructions",
      image: "/placeholder.svg?height=200&width=200&text=Instructions",
    },
  ]

  const requiredTools = [
    {
      title: "Small Phillips (Cross) Screwdriver",
      image: "/placeholder.svg?height=120&width=120&text=Small+Screwdriver",
    },
    {
      title: "Larger Phillips (Cross) Screwdriver",
      image: "/placeholder.svg?height=120&width=120&text=Large+Screwdriver",
    },
    {
      title: "Optional: Wire Stripper",
      image: "/placeholder.svg?height=120&width=120&text=Wire+Stripper",
    },
  ]

  const appFeatures = [
    {
      icon: "🌙",
      title: "Adaptive Brightness",
      badge: "NEW",
      description:
        "Use Sleep and Wake On Approach to set your preferred display brightness and Mysa's display will adjust automatically to ambient light in your home.",
    },
    {
      icon: "📱",
      title: "Mobile App",
      description: "Adjust your home heating from anywhere on your Android or iOS device.",
    },
    {
      icon: "🏠",
      title: "Smart Home Integration",
      description: "Control Mysa through your favourite smart home platforms and home assistants.",
    },
    {
      icon: "🌡️",
      title: "Thermostat Control",
      description: "Mysa displays the room temperature, and the touch buttons allow you to adjust it.",
    },
    {
      icon: "📅",
      title: "Custom Scheduling",
      description: "Use the app to set a schedule for your thermostat in less than a minute.",
    },
    {
      icon: "⏰",
      title: "Early On",
      description: "Start heating at the perfect moment to keep you cozy and save energy.",
    },
    {
      icon: "🏘️",
      title: "Zone Control",
      description: "Group multiple Mysas into heating zones, and control them together through the Mysa app.",
    },
    {
      icon: "🔒",
      title: "Access Permissions",
      description:
        "Enjoy the peace of mind that comes with knowing you're in control of your preferred temperature setting.",
    },
    {
      icon: "✈️",
      title: "Vacation Mode",
      description: "Going on vacation? Mysa will save energy while you're away.",
    },
    {
      icon: "📍",
      title: "Geolocation",
      description:
        "Mysa uses your location to detect if anyone is home, so that you're not paying to heat an empty house.",
    },
    {
      icon: "📊",
      title: "Energy Reports",
      description: "Mysa generates in-depth energy reports so you can see how much you are spending - and saving.",
    },
    {
      icon: "👥",
      title: "Multiple Users",
      description: "Share access to your account easily so others can control your Mysas through the Mysa app.",
    },
  ]

  const displayIcons = [
    {
      title: "WELCOME",
      description: "You'll see Mysa smile on startup.",
      pattern: "⚫⚫\n⚫⚫⚫⚫⚫⚫⚫\n⚫",
    },
    {
      title: "WIFI PAIRING",
      description: "The arrow means Mysa is ready to begin the WiFi pairing process.",
      pattern: "⚫⚫⚫⚫⚫⚫⚫\n⚫⚫⚫⚫⚫",
    },
    {
      title: "UPDATE",
      description: "That spinning rectangle means Mysa is getting a software update from us over the internet.",
      pattern: "⚫⚫⚫⚫⚫⚫⚫\n⚫⚫⚫⚫⚫⚫⚫\n⚫",
    },
    {
      title: "SETTINGS",
      description: "Check! This will pop up when you change your settings from the app.",
      pattern: "⚫\n⚫⚫⚫\n⚫",
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
      </header>

      {/* Hero Section */}
      <section className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-medium text-[#6B7280] mb-8">
            Mysa Smart Thermostat for Central HVAC User Manual
          </h1>

          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-2xl font-medium text-[#E91E63]">
                    <span className="bg-[#E91E63] text-white px-3 py-1 rounded">V2</span>
                    <span className="ml-3 text-[#E91E63]">Mysa Smart Thermostat</span>
                  </div>
                </div>
                <div className="text-[#E91E63] text-xl font-medium mb-2">for Central HVAC</div>
                <div className="text-2xl font-light text-[#6B7280] mb-4">User Manual</div>
                <div className="text-lg font-medium text-[#2D2D2D] mb-6">V2</div>
                <p className="text-[#6B7280] mb-6">
                  Welcome to your easy, step-by-step guide to setting up your new Mysa for Central HVAC!
                </p>
                <Button className="bg-[#E91E63] hover:bg-[#d81b60] text-white border-2 border-[#E91E63]">
                  Check Compatibility
                </Button>
              </div>
              <div className="flex-1">
                <Image
                  src="/placeholder.svg?height=400&width=500&text=Mysa+Central+HVAC+Package"
                  alt="Mysa Central HVAC Package"
                  width={500}
                  height={400}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabSections.map((section) => (
                <button
                  key={section.id}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    section.active
                      ? "border-[#E91E63] text-[#E91E63]"
                      : "border-transparent text-[#6B7280] hover:text-[#2D2D2D] hover:border-gray-300"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-[#6B7280]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-white">
              <h2 className="text-4xl font-light mb-6">Hello, friend.</h2>
              <p className="text-xl mb-6 leading-relaxed">
                Thank you for purchasing the Mysa Smart Thermostat for Central HVAC V2!
              </p>
              <p className="text-lg leading-relaxed">
                Your online guide shows you how to easily set up, use, and troubleshoot your Mysa. Mysa for Central HVAC
                is compatible with most forced air, heat pump, hydronic, and fan coil heating and cooling systems.
              </p>
            </div>
            <div className="flex-1">
              <div className="bg-gray-200 rounded-2xl p-4">
                <Image
                  src="/placeholder.svg?height=300&width=400&text=Person+Installing+Mysa"
                  alt="Person installing Mysa thermostat"
                  width={400}
                  height={300}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's in the Box */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-medium text-[#6B7280] text-center mb-12">What's in the Box?</h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {boxContents.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-100 rounded-lg p-6 mb-4 aspect-square flex items-center justify-center">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    width={120}
                    height={120}
                    className="rounded"
                  />
                </div>
                <p className="text-[#6B7280] font-medium">{item.title}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-100 rounded-2xl p-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rj0sCjOggFWNsyb2JJNxazumvokUhu.png"
              alt="Complete Mysa package contents"
              width={800}
              height={600}
              className="w-full rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-[#6B7280] mb-8">Installing Mysa</h2>
            <div className="bg-white rounded-lg border p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-medium text-[#E91E63] mb-4">mysa</div>
                <p className="text-[#6B7280] mb-2">Mysa Installation and Compatibility Guide</p>
                <p className="text-[#6B7280] mb-6">Installation de Mysa et Guide de compatibilité</p>
                <Button className="bg-[#E91E63] hover:bg-[#d81b60] text-white px-8">
                  Start <span className="ml-2 text-sm">press Enter ↵</span>
                </Button>
              </div>
            </div>

            <Alert className="mb-8 border-[#E91E63] bg-pink-50">
              <AlertCircle className="h-4 w-4 text-[#E91E63]" />
              <AlertDescription className="text-[#E91E63] flex items-center justify-between">
                <span>Need help with installation?</span>
                <Button variant="outline" size="sm" className="border-[#E91E63] text-[#E91E63] bg-transparent">
                  Find a Mysa Pro
                </Button>
              </AlertDescription>
            </Alert>
          </div>

          {/* High Voltage Warning */}
          <div className="bg-[#E91E63] text-white rounded-lg p-8 mb-12">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-2xl font-medium">
                    <span className="bg-white text-[#E91E63] px-3 py-1 rounded">V2</span>
                  </div>
                  <h3 className="text-2xl font-bold">Warning! High Voltage!</h3>
                </div>
                <p className="text-lg mb-4">
                  Installing this product involves handling high voltage wiring. Follow these installation instructions
                  carefully.
                </p>
                <p className="mb-4">
                  To avoid fire, personal injury, or death, turn off your circuit breakers and follow the proper safety
                  precautions before proceeding.
                </p>
                <p className="font-bold mb-4">
                  UNSURE ABOUT HANDLING ELECTRICAL WIRING? CONSULT A QUALIFIED ELECTRICIAN.
                </p>
                <p className="text-sm">
                  The installation of the thermostat must comply with the applicable Local and/or National Electrical
                  codes and utility requirements. This installation should be entrusted to duly qualified personnel
                  where required by law.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="bg-white rounded-lg p-4">
                  <Image
                    src="/placeholder.svg?height=150&width=200&text=Electrical+Warning"
                    alt="Electrical safety warning"
                    width={200}
                    height={150}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* What You'll Need */}
          <div className="bg-white rounded-lg p-8">
            <h3 className="text-2xl font-medium text-[#6B7280] text-center mb-8">What you'll need</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {requiredTools.map((tool, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-50 rounded-lg p-6 mb-4 aspect-square flex items-center justify-center">
                    <Image src={tool.image || "/placeholder.svg"} alt={tool.title} width={80} height={80} />
                  </div>
                  <p className="text-[#6B7280] font-medium">{tool.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="py-16 bg-[#6B7280]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <Image
                src="/placeholder.svg?height=400&width=400&text=Mysa+App+on+Phone"
                alt="Mysa app on smartphone"
                width={400}
                height={400}
                className="rounded-lg"
              />
            </div>
            <div className="flex-1 text-white">
              <h2 className="text-3xl font-medium mb-6">Download the Mysa App</h2>
              <p className="text-lg mb-8 leading-relaxed">
                The Mysa app is where all your important smart features live! Use it to easily set Schedules, set up
                Geofencing for when you're on the move, and monitor your Energy Usage to find more ways to save.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                  <Image src="/placeholder.svg?height=24&width=24&text=Play" alt="Google Play" width={24} height={24} />
                  GET IT ON Google Play
                </Button>
                <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Download on the App Store
                </Button>
              </div>
              <p className="text-sm">
                Download the latest version Mysa app from the Google Play Store or App Store and create an account (or
                log in to your existing account).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pairing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-12 mb-12">
            <div className="flex-1">
              <h2 className="text-3xl font-medium text-[#6B7280] mb-6">Pairing your Mysa</h2>
              <div className="text-[#E91E63] text-xl font-medium mb-6">How to pair:</div>
              <ol className="space-y-4 text-[#6B7280]">
                <li>1. Open the Mysa App.</li>
                <li>2. Navigate to Add Thermostat.</li>
                <li>3. Select Central HVAC.</li>
                <li>4. Follow app instructions or video in the next section.</li>
              </ol>
            </div>
            <div className="flex-1">
              <Image
                src="/placeholder.svg?height=300&width=250&text=Phone+App+Screen"
                alt="Mysa app pairing screen"
                width={250}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>

          <Alert className="mb-12 border-[#E91E63] bg-pink-50">
            <AlertCircle className="h-4 w-4 text-[#E91E63]" />
            <AlertDescription className="text-[#E91E63] flex items-center justify-between">
              <span>Need help with pairing?</span>
              <Button variant="outline" size="sm" className="border-[#E91E63] text-[#E91E63] bg-transparent">
                Contact Support
              </Button>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Apple className="w-6 h-6" />
                  <CardTitle className="text-xl text-[#6B7280]">Pairing with iOS</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Image
                  src="/placeholder.svg?height=400&width=250&text=iOS+Pairing+Screen"
                  alt="iOS pairing screen"
                  width={250}
                  height={400}
                  className="mx-auto rounded-lg"
                />
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Smartphone className="w-6 h-6" />
                  <CardTitle className="text-xl text-[#6B7280]">Pairing with Android</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <Image
                  src="/placeholder.svg?height=400&width=250&text=Android+Pairing+Screen"
                  alt="Android pairing screen"
                  width={250}
                  height={400}
                  className="mx-auto rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Display Icons */}
      <section className="py-16 bg-[#E91E63]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-medium text-white text-center mb-4">Display Icons</h2>
          <p className="text-white text-center mb-12">
            There are four common display icons that will appear on your Mysa's faceplate display when pairing or
            updating.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayIcons.map((icon, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center">
                <div className="bg-[#E91E63] text-white rounded-lg p-4 mb-4 min-h-[120px] flex items-center justify-center">
                  <div className="font-mono text-2xl leading-tight whitespace-pre-line">{icon.pattern}</div>
                </div>
                <h3 className="font-bold text-[#2D2D2D] mb-2">{icon.title}</h3>
                <p className="text-[#6B7280] text-sm">{icon.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manual Controls */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-medium text-[#6B7280] text-center mb-8">Manual Controls</h2>
          <p className="text-[#6B7280] text-center mb-12 max-w-4xl mx-auto">
            Mysa for Central HVAC can be adjusted manually at any time by pressing the Up or Down arrow to increase or
            decrease the set point temperature. By default, Mysa will display the room temperature. When manually
            adjusting the temperature, the setpoint will display, allowing you to set your ideal climate for the room.
          </p>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=400&width=300&text=Mysa+Thermostat+Controls"
                  alt="Mysa thermostat with control labels"
                  width={300}
                  height={400}
                  className="mx-auto"
                />
                <div className="absolute left-0 top-1/4 text-right pr-4">
                  <div className="text-[#6B7280] font-medium">Temperature</div>
                  <div className="text-[#6B7280] font-medium">Control Arrows</div>
                </div>
                <div className="absolute right-0 bottom-1/4 text-left pl-4">
                  <div className="text-[#6B7280] font-medium">Proximity &</div>
                  <div className="text-[#6B7280] font-medium">Ambient</div>
                  <div className="text-[#6B7280] font-medium">Light Sensor</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-medium text-[#2D2D2D] mb-6">App Controls</h3>
              <p className="text-[#6B7280] mb-8">
                The Mysa app works seamlessly across all four of our products, allowing for easy remote access,
                Scheduling, Geofencing, and more!
              </p>
              <p className="text-[#6B7280] mb-8">
                Here's an example of what your Mysa for Central HVAC thermostat control screen looks like on your
                smartphone:
              </p>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tPw2vab1ffYhixsrZgLtVk4vqstkdX.png"
                alt="Mysa app control screen"
                width={400}
                height={600}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* App Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-medium text-[#6B7280] text-center mb-12">App Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {appFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{feature.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-[#2D2D2D]">{feature.title}</h3>
                      {feature.badge && <Badge className="bg-[#E91E63] text-white text-xs">{feature.badge}</Badge>}
                    </div>
                    <p className="text-[#6B7280] text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              className="border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white bg-transparent"
            >
              View All Mysa App Features
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Sections */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-medium text-[#2D2D2D] text-center mb-12">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/centralHVAC/configuration-finder">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm h-full">
                <CardHeader className="bg-blue-50 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Settings className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-[#2D2D2D] mb-1 group-hover:text-[#1a1a1a]">
                        Configuration Code Finder
                      </CardTitle>
                      <CardDescription className="text-[#6B7280] text-sm">Interactive Flow</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <p className="text-[#4B5563] leading-relaxed flex-1 mb-4">
                    Find the right configuration settings for your specific HVAC system with our interactive tool.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#6B7280]">Get Started</span>
                    <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#2D2D2D] group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/centralHVAC/troubleshooting">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm h-full">
                <CardHeader className="bg-red-50 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-[#2D2D2D] mb-1 group-hover:text-[#1a1a1a]">
                        Troubleshooting
                      </CardTitle>
                      <CardDescription className="text-[#6B7280] text-sm">Get Help</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <p className="text-[#4B5563] leading-relaxed flex-1 mb-4">
                    Common issues, error codes, and solutions to get your Mysa thermostat working properly.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#6B7280]">Get Help</span>
                    <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#2D2D2D] group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/centralHVAC/advanced-installation">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm h-full">
                <CardHeader className="bg-green-50 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-[#2D2D2D] mb-1 group-hover:text-[#1a1a1a]">
                        Advanced Installation
                      </CardTitle>
                      <CardDescription className="text-[#6B7280] text-sm">Wiring & Setup</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <p className="text-[#4B5563] leading-relaxed flex-1 mb-4">
                    Comprehensive installation resources for complex HVAC systems and specialized configurations.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#6B7280]">Learn More</span>
                    <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#2D2D2D] group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
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
