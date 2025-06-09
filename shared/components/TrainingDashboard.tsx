"use client"

import { useState, useEffect } from "react"
import { InstallButton } from "./InstallButton"

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
  dataFile: string
  lastModified: string | null
}

export function TrainingDashboard() {
  const [stats, setStats] = useState<TrainingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportData, setExportData] = useState<string | null>(null)
  const [importData, setImportData] = useState("")
  const [showImport, setShowImport] = useState(false)

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_stats" }),
      })

      if (response.ok) {
        const result = await response.json()
        setStats(result.stats)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportTrainingData = async () => {
    try {
      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export_data" }),
      })

      if (response.ok) {
        const result = await response.json()
        setExportData(result.data)
      }
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  const importTrainingData = async () => {
    if (!importData.trim()) return

    try {
      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import_data",
          data: { jsonData: importData },
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Import successful: ${result.imported} entries imported, ${result.errors} errors`)
        setImportData("")
        setShowImport(false)
        loadStats() // Refresh stats
      }
    } catch (error) {
      console.error("Failed to import data:", error)
      alert("Import failed: " + error)
    }
  }

  const clearAllData = async () => {
    if (!confirm("Are you sure you want to clear ALL training data? This cannot be undone.")) {
      return
    }

    try {
      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all_data" }),
      })

      if (response.ok) {
        alert("All training data cleared")
        loadStats() // Refresh stats
      }
    } catch (error) {
      console.error("Failed to clear data:", error)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading && !stats) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-[#BAE5D4] border-t-transparent rounded-full animate-spin mr-3"></div>
          <span>Loading training statistics...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-500">Failed to load training statistics</p>
        <InstallButton title="Retry" onPress={loadStats} className="mt-4" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-[#2D2D2D]">Training Data Dashboard</h3>
        <InstallButton title="Refresh" onPress={loadStats} loading={loading} />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-800">{stats.totalImages}</div>
          <div className="text-sm text-green-600">Complete Training</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-800">{stats.totalPartialSaves}</div>
          <div className="text-sm text-yellow-600">Partial Saves</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-800">{stats.uniqueImageHashes}</div>
          <div className="text-sm text-blue-600">Unique Images</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-800">{stats.commonTerminals.length}</div>
          <div className="text-sm text-purple-600">Terminal Types</div>
        </div>
      </div>

      {/* System Types */}
      <div className="mb-6">
        <h4 className="font-medium text-[#2D2D2D] mb-3">System Types</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold">{stats.systemTypes.conventional}</div>
            <div className="text-sm text-gray-600">Conventional</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold">{stats.systemTypes["heat-pump"]}</div>
            <div className="text-sm text-gray-600">Heat Pump</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold">{stats.systemTypes.unknown}</div>
            <div className="text-sm text-gray-600">Unknown</div>
          </div>
        </div>
      </div>

      {/* Common Terminals */}
      {stats.commonTerminals.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-[#2D2D2D] mb-3">Most Common Terminals</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {stats.commonTerminals.slice(0, 10).map((terminal) => (
              <div key={terminal.terminal} className="bg-[#BAE5D4] rounded-lg p-2 text-center">
                <div className="font-semibold text-[#2D2D2D]">{terminal.terminal}</div>
                <div className="text-xs text-[#2D2D2D]">{terminal.count}x</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-[#2D2D2D] mb-3">Data Management</h4>

        {stats.lastModified && (
          <div className="mb-4 text-sm text-gray-600">
            <strong>Data file:</strong> {stats.dataFile}
            <br />
            <strong>Last modified:</strong> {new Date(stats.lastModified).toLocaleString()}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <InstallButton title="Export Data" onPress={exportTrainingData} variant="secondary" />
          <InstallButton title="Import Data" onPress={() => setShowImport(true)} variant="secondary" />
          <InstallButton title="Clear All Data" onPress={clearAllData} variant="secondary" />
        </div>
      </div>

      {/* Export Modal */}
      {exportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Export Training Data</h3>
            <textarea
              value={exportData}
              readOnly
              rows={20}
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => navigator.clipboard.writeText(exportData)}
                className="bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setExportData(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Import Training Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Paste exported training data JSON below. Existing entries will be updated if the imported data is newer.
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              rows={15}
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={importTrainingData}
                disabled={!importData.trim()}
                className="bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400"
              >
                Import Data
              </button>
              <button
                onClick={() => {
                  setShowImport(false)
                  setImportData("")
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
