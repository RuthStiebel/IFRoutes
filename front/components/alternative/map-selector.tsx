"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Loader2 } from "lucide-react"

interface PresavedFix {
  id: string
  name: string
  altitude: string
  x: number
  y: number
}

interface Map {
  id: string
  name: string
  imageUrl: string
  presavedFixes?: PresavedFix[]
}

interface MapSelectorProps {
  onSelectMap: (mapId: string, imageUrl: string, fixes?: PresavedFix[]) => void
}

export default function MapSelector({ onSelectMap }: MapSelectorProps) {
  const [maps, setMaps] = useState<Map[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true)
        // Replace with your actual backend endpoint
        const response = await fetch("/api/maps")

        if (!response.ok) throw new Error("Failed to fetch maps")

        const data = await response.json()
        setMaps(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load maps")
        // Mock data for demonstration
        setMaps([
          {
            id: "1",
            name: "Sample Approach Chart",
            imageUrl: "/approach-chart.jpg",
            presavedFixes: [
              { id: "fix1", name: "ENTRY", altitude: "3000", x: 100, y: 100 },
              { id: "fix2", name: "TURN", altitude: "2500", x: 300, y: 250 },
              { id: "fix3", name: "RUNWAY", altitude: "1500", x: 500, y: 450 },
            ],
          },
          {
            id: "2",
            name: "Standard Terminal Arrival",
            imageUrl: "/star-chart.jpg",
            presavedFixes: [
              { id: "fix1", name: "INITIAL", altitude: "5000", x: 150, y: 80 },
              { id: "fix2", name: "DESCENT", altitude: "3500", x: 350, y: 200 },
            ],
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMaps()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && maps.length === 0) {
    return (
      <div className="bg-card border border-destructive rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">Unable to load maps</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Select a Chart</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maps.map((map) => (
          <button
            key={map.id}
            onClick={() => onSelectMap(map.id, map.imageUrl, map.presavedFixes)}
            className="text-left group"
          >
            <div className="bg-accent rounded-lg overflow-hidden mb-3 aspect-video">
              <img
                src={map.imageUrl || "/placeholder.svg"}
                alt={map.name}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
            <h3 className="font-semibold group-hover:text-primary transition">{map.name}</h3>
          </button>
        ))}
      </div>
    </div>
  )
}
