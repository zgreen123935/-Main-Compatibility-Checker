"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PricingRequestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-[#BAE5D4] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#2D2D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-[#2D2D2D] mb-4">Thank you for your interest!</h3>
              <p className="text-gray-600 mb-6">
                Our business solutions team will review your requirements and get back to you within 24 hours with a
                custom pricing proposal.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-gray-50"
              >
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-medium text-[#2D2D2D] mb-4">Get Custom Pricing</h2>
          <p className="text-xl text-gray-600">
            Tell us about your business needs and we'll create a tailored solution with competitive pricing
          </p>
        </div>

        <Card className="border border-gray-200">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-medium text-[#2D2D2D]">Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company" className="text-base font-medium text-[#2D2D2D]">
                    Company Name *
                  </Label>
                  <Input id="company" required className="mt-2 border-gray-200 focus:border-[#2D2D2D]" />
                </div>
                <div>
                  <Label htmlFor="industry" className="text-base font-medium text-[#2D2D2D]">
                    Industry *
                  </Label>
                  <Select required>
                    <SelectTrigger className="mt-2 border-gray-200 focus:border-[#2D2D2D]">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office/Corporate</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="hospitality">Hospitality</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-base font-medium text-[#2D2D2D]">
                    Contact Name *
                  </Label>
                  <Input id="name" required className="mt-2 border-gray-200 focus:border-[#2D2D2D]" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-base font-medium text-[#2D2D2D]">
                    Email Address *
                  </Label>
                  <Input id="email" type="email" required className="mt-2 border-gray-200 focus:border-[#2D2D2D]" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone" className="text-base font-medium text-[#2D2D2D]">
                    Phone Number
                  </Label>
                  <Input id="phone" type="tel" className="mt-2 border-gray-200 focus:border-[#2D2D2D]" />
                </div>
                <div>
                  <Label htmlFor="locations" className="text-base font-medium text-[#2D2D2D]">
                    Number of Locations *
                  </Label>
                  <Select required>
                    <SelectTrigger className="mt-2 border-gray-200 focus:border-[#2D2D2D]">
                      <SelectValue placeholder="Select number of locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Location</SelectItem>
                      <SelectItem value="2-5">2-5 Locations</SelectItem>
                      <SelectItem value="6-20">6-20 Locations</SelectItem>
                      <SelectItem value="21-50">21-50 Locations</SelectItem>
                      <SelectItem value="50+">50+ Locations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="requirements" className="text-base font-medium text-[#2D2D2D]">
                  Project Requirements
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="Please describe your energy management needs, number of thermostats required, timeline, and any specific requirements..."
                  className="mt-2 border-gray-200 focus:border-[#2D2D2D] min-h-[120px]"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full bg-[#2D2D2D] hover:bg-gray-800 text-white">
                  Request Custom Pricing
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
