"use client"

import { useState, useEffect } from "react"
import { InstallButton } from "./InstallButton"

interface VerificationResult {
  success: boolean
  message: string
  details?: any
}

interface TrainingStats {
  totalImages: number
  totalPartialSaves: number
  systemTypes: {
    "heat-pump": number
    conventional: number
    unknown: number
  }
  imageQuality: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  commonTerminals: { terminal: string; count: number }[]
  uniqueImageHashes: number
  dataSource: string
  lastModified: string | null
}

export function SupabaseVerificationDashboard() {
  const [connectionResult, setConnectionResult] = useState<VerificationResult | null>(null)
  const [dataFlowResult, setDataFlowResult] = useState<VerificationResult | null>(null)
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const runConnectionTest = async () => {
    setLoading(true)
    try {
      const result = await fetch("/api/verify-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_connection" }),
      })
      const data = await result.json()
      setConnectionResult(data)
    } catch (error) {
      setConnectionResult({
        success: false,
        message: "Connection test failed",
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  const runDataFlowTest = async () => {
    setLoading(true)
    try {
      const result = await fetch("/api/verify-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_data_flow" }),
      })
      const data = await result.json()
      setDataFlowResult(data)
    } catch (error) {
      setDataFlowResult({
        success: false,
        message: "Data flow test failed",
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const result = await fetch("/api/verify-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_stats" }),
      })
      const data = await result.json()
      setStats(data.stats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    setTestResults([])
    const tests = [
      { name: "Connection Test", action: runConnectionTest },
      { name: "Data Flow Test", action: runDataFlowTest },
      { name: "Load Statistics", action: loadStats },
    ]

    for (const test of tests) {
      setTestResults((prev) => [...prev, { name: test.name, status: "running" }])
      await test.action()
      setTestResults((prev) => prev.map((t) => (t.name === test.name ? { ...t, status: "completed" } : t)))
    }
  }

  useEffect(() => {
    runAllTests()
  }, [])

  const renderResult = (result: VerificationResult | null, title: string) => {
    if (!result) return null

    return (
      <div
        className={`border rounded-lg p-4 ${
          result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        }`}
      >
        <h4 className={`font-medium mb-2 ${result.success ? "text-green-800" : "text-red-800"}`}>
          {result.success ? "✅" : "❌"} {title}
        </h4>
        <p className={`text-sm mb-2 ${result.success ? "text-green-700" : "text-red-700"}`}>{result.message}</p>
        {result.details && (
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">{JSON.stringify(result.details, null, 2)}</pre>
          </details>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-[#2D2D2D]">Supabase Integration Verification</h3>
        <InstallButton title="Run All Tests" onPress={runAllTests} loading={loading} />
      </div>

      {/* Test Progress */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-[#2D2D2D] mb-3">Test Progress</h4>
          <div className="space-y-2">
            {testResults.map((test, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full ${
                    test.status === "running"
                      ? "bg-yellow-400 animate-pulse"
                      : test.status === "completed"
                        ? "bg-green-400"
                        : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">{test.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Test */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-[#2D2D2D]">Database & Storage Connection</h4>
          <InstallButton title="Test Connection" onPress={runConnectionTest} loading={loading} />
        </div>
        {renderResult(connectionResult, "Connection Test")}
      </div>

      {/* Data Flow Test */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-[#2D2D2D]">Data Insert/Retrieve Flow</h4>
          <InstallButton title="Test Data Flow" onPress={runDataFlowTest} loading={loading} />
        </div>
        {renderResult(dataFlowResult, "Data Flow Test")}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-6">
          <h4 className="font-medium text-[#2D2D2D] mb-3">Current Training Data</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-800">{stats.totalImages}</div>
              <div className="text-sm text-blue-600">Complete Training</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-800">{stats.totalPartialSaves}</div>
              <div className="text-sm text-yellow-600">Partial Saves</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-800">{stats.uniqueImageHashes}</div>
              <div className="text-sm text-green-600">Unique Images</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-800">{stats.commonTerminals.length}</div>
              <div className="text-sm text-purple-600">Terminal Types</div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-600">
              <strong>Data Source:</strong> {stats.dataSource}
              {stats.lastModified && (
                <>
                  <br />
                  <strong>Last Updated:</strong> {new Date(stats.lastModified).toLocaleString()}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-medium text-[#2D2D2D] mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-3">
          <InstallButton title="Refresh Stats" onPress={loadStats} variant="secondary" />
          <InstallButton title="Test Connection" onPress={runConnectionTest} variant="secondary" />
          <InstallButton title="Test Data Flow" onPress={runDataFlowTest} variant="secondary" />
        </div>
      </div>
    </div>
  )
}
