"use client"

import { useState, useEffect } from "react"
import { InstallButton } from "./InstallButton"

interface LearningInsights {
  totalTrainingImages: number
  averageAIAccuracy: number
  accuracyTrend: Array<{ date: string; accuracy: number; type: string }>
  commonTerminalPairs: Array<{ pair: string; count: number }>
  topConfigurations: Array<{ terminals: string[]; frequency: number; percentage: number }>
  learningVelocity: number
}

export function LearningDashboard() {
  const [insights, setInsights] = useState<LearningInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLearningInsights()
  }, [])

  const loadLearningInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_learning_insights" }),
      })

      if (response.ok) {
        const result = await response.json()
        setInsights(result.insights)
      } else {
        throw new Error("Failed to load learning insights")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#BAE5D4] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-[#4B5563]">Loading learning insights...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">❌ Error Loading Insights</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <InstallButton title="Retry" onPress={loadLearningInsights} variant="secondary" />
      </div>
    )
  }

  if (!insights) return null

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return "text-green-600"
    if (accuracy >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getVelocityIndicator = (velocity: number) => {
    if (velocity > 0.05) return { icon: "📈", color: "text-green-600", text: "Improving Fast" }
    if (velocity > 0.01) return { icon: "📊", color: "text-blue-600", text: "Steady Improvement" }
    if (velocity > -0.01) return { icon: "➡️", color: "text-gray-600", text: "Stable" }
    return { icon: "📉", color: "text-red-600", text: "Needs More Training" }
  }

  const velocityInfo = getVelocityIndicator(insights.learningVelocity)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-[#2D2D2D]">🧠 AI Learning Dashboard</h3>
        <button onClick={loadLearningInsights} className="text-sm text-blue-600 hover:text-blue-800 underline">
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">{insights.totalTrainingImages}</div>
          <div className="text-sm text-blue-600">Training Images</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className={`text-2xl font-bold ${getAccuracyColor(insights.averageAIAccuracy)}`}>
            {Math.round(insights.averageAIAccuracy * 100)}%
          </div>
          <div className="text-sm text-green-600">Average AI Accuracy</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className={`text-2xl ${velocityInfo.color}`}>{velocityInfo.icon}</div>
          <div className="text-sm text-purple-600">{velocityInfo.text}</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-800">{insights.topConfigurations.length}</div>
          <div className="text-sm text-yellow-600">Known Patterns</div>
        </div>
      </div>

      {/* Recent Accuracy Trend */}
      {insights.accuracyTrend.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-[#2D2D2D] mb-3">📊 Recent Training Sessions</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2">
              {insights.accuracyTrend.slice(0, 5).map((session, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(session.date).toLocaleDateString()}
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">{session.type}</span>
                  </span>
                  <span className={`font-medium ${getAccuracyColor(session.accuracy)}`}>
                    {Math.round(session.accuracy * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Configurations */}
      {insights.topConfigurations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-[#2D2D2D] mb-3">🔧 Most Common Wire Configurations</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2">
              {insights.topConfigurations.slice(0, 5).map((config, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{config.terminals.join(", ")}</span>
                    <span className="text-xs bg-[#BAE5D4] text-[#2D2D2D] px-2 py-1 rounded">{config.percentage}%</span>
                  </div>
                  <span className="text-sm text-gray-600">{config.frequency} installations</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Common Terminal Pairs */}
      {insights.commonTerminalPairs.length > 0 && (
        <div>
          <h4 className="font-medium text-[#2D2D2D] mb-3">🔗 Common Terminal Combinations</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              {insights.commonTerminalPairs.slice(0, 6).map((pair, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800">{pair.pair.replace("-", " + ")}</span>
                  <span className="text-gray-600">{pair.count}×</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {insights.totalTrainingImages === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎯</div>
          <h4 className="text-lg font-medium text-[#2D2D2D] mb-2">Start Training the AI!</h4>
          <p className="text-[#4B5563] mb-4">
            Upload some thermostat photos and mark wire connections to begin building the AI's knowledge base.
          </p>
        </div>
      )}
    </div>
  )
}
