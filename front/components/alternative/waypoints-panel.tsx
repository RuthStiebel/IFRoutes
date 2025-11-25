"use client"

import { useState } from "react"
import { Trash2, Edit2 } from "lucide-react"

interface Waypoint {
  id: string
  name: string
  altitude: string
  x: number
  y: number
}

interface WaypointsPanelProps {
  waypoints: Waypoint[]
  onUpdateWaypoint: (id: string, name: string, altitude: string) => void
  onDeleteWaypoint: (id: string) => void
}

export default function WaypointsPanel({ waypoints, onUpdateWaypoint, onDeleteWaypoint }: WaypointsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editAltitude, setEditAltitude] = useState("")

  const handleEdit = (wp: Waypoint) => {
    setEditingId(wp.id)
    setEditName(wp.name)
    setEditAltitude(wp.altitude)
  }

  const handleSave = () => {
    if (editingId) {
      onUpdateWaypoint(editingId, editName, editAltitude)
      setEditingId(null)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span className="text-primary">◉</span> Waypoints Log (Editable)
      </h3>

      {waypoints.length === 0 ? (
        <p className="text-sm text-muted-foreground">No waypoints placed yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {waypoints.map((wp, idx) => (
            <div key={wp.id} className="flex items-center gap-2 p-2 bg-accent rounded text-sm">
              <span className="font-semibold text-xs text-primary w-6">{idx + 1}</span>

              {editingId === wp.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-background border border-border rounded text-foreground text-xs"
                    placeholder="Fix name"
                  />
                  <input
                    type="text"
                    value={editAltitude}
                    onChange={(e) => setEditAltitude(e.target.value)}
                    className="w-16 px-2 py-1 bg-background border border-border rounded text-foreground text-xs"
                    placeholder="Alt"
                  />
                  <button
                    onClick={handleSave}
                    className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold hover:bg-blue-700"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{wp.name}</div>
                    <div className="text-xs text-muted-foreground">{wp.altitude} ft</div>
                  </div>
                  <button onClick={() => handleEdit(wp)} className="p-1 hover:bg-background rounded transition">
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onDeleteWaypoint(wp.id)}
                    className="p-1 hover:bg-background rounded transition"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
