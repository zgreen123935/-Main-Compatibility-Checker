"use client"

import { useState } from "react"
import { SupabaseVerificationDashboard } from "../shared/components/SupabaseVerificationDashboard"
import { TrainingDashboard } from "../shared/components/TrainingDashboard"

export function SupabaseTestPage() {
  const [activeTab, setActiveTab] = useState<"verification" | "training">("verification")

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-4">Supabase Integration Test</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Verify your Supabase database and storage integration is working correctly.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("verification")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "verification" ? "bg-white text-[#2D2D2D] shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              🔍 Verification Tests
            </button>
            <button
              onClick={() => setActiveTab("training")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === "training" ? "bg-white text-[#2D2D2D] shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              📊 Training Dashboard
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "verification" && <SupabaseVerificationDashboard />}
        {activeTab === "training" && <TrainingDashboard />}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">✅ Integration Checklist</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>1. Database tables created ✓</div>
              <div>2. Storage bucket configured ✓</div>
              <div>3. Environment variables set ✓</div>
              <div>4. API routes updated ✓</div>
              <div>5. Ready for training data! 🚀</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
