"use client"

import { useEffect } from "react"

import { useState } from "react"

import type React from "react"
import { Trash2 } from "lucide-react"

interface Waypoint {
  id: string
  name: string
  altitude: string
  x: number
  y: number
}

interface PresavedFix {
  id: string
  name: string
  altitude: string
  x: number
  y: number
}

interface ChartCanvasProps {
  mapImage: string | null
  canvasRef: React.RefObject<HTMLCanvasElement>
  waypoints: Waypoint[]
  onAddWaypoint: (waypoint: Waypoint) => void
  onDeleteWaypoint: (id: string) => void
  onUpdateWaypoint: (id: string, name: string, altitude: string) => void
  isDrawingEnabled: boolean
  presavedFixes?: PresavedFix[]
}

export default function ChartCanvas({
  mapImage,
  canvasRef,
  waypoints,
  onAddWaypoint,
  onDeleteWaypoint,
  onUpdateWaypoint,
  isDrawingEnabled,
  presavedFixes = [],
}: ChartCanvasProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanX, setLastPanX] = useState(0)
  const [lastPanY, setLastPanY] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editAltitude, setEditAltitude] = useState("")

  useEffect(() => {
    if (!mapImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.save()
      ctx.translate(panX, panY)
      ctx.scale(zoomLevel, zoomLevel)
      ctx.drawImage(img, 0, 0, canvas.width / zoomLevel, canvas.height / zoomLevel)
      ctx.restore()

      if (waypoints.length > 1) {
        ctx.save()
        ctx.translate(panX, panY)
        ctx.scale(zoomLevel, zoomLevel)
        ctx.strokeStyle = "#3b82f6"
        ctx.lineWidth = 2 / zoomLevel
        ctx.beginPath()
        waypoints.forEach((wp, idx) => {
          if (idx === 0) ctx.moveTo(wp.x / zoomLevel - panX / zoomLevel, wp.y / zoomLevel - panY / zoomLevel)
          else ctx.lineTo(wp.x / zoomLevel - panX / zoomLevel, wp.y / zoomLevel - panY / zoomLevel)
        })
        ctx.stroke()
        ctx.restore()
      }

      waypoints.forEach((wp) => {
        const screenX = wp.x * zoomLevel + panX
        const screenY = wp.y * zoomLevel + panY
        ctx.fillStyle = "#ef4444"
        ctx.beginPath()
        ctx.arc(screenX, screenY, 6, 0, Math.PI * 2)
        ctx.fill()
      })

      presavedFixes.forEach((fix) => {
        const screenX = fix.x * zoomLevel + panX
        const screenY = fix.y * zoomLevel + panY
        ctx.fillStyle = "#22c55e"
        ctx.beginPath()
        ctx.arc(screenX, screenY, 6, 0, Math.PI * 2)
        ctx.fill()
      })
    }
    img.src = mapImage
  }, [mapImage, canvasRef, waypoints, zoomLevel, panX, panY, presavedFixes])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoomLevel((prev) => Math.max(1, Math.min(5, prev * delta)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      setIsPanning(true)
      setLastPanX(e.clientX - panX)
      setLastPanY(e.clientY - panY)
    } else if (isDrawingEnabled && e.button === 0) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - panX) / zoomLevel
      const y = (e.clientY - rect.top - panY) / zoomLevel

      if (x >= 0 && y >= 0 && x <= canvas.width / zoomLevel && y <= canvas.height / zoomLevel) {
        onAddWaypoint({
          id: Date.now().toString(),
          name: `FIX ${waypoints.length + 1}`,
          altitude: "5000",
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanX(e.clientX - lastPanX)
      setPanY(e.clientY - lastPanY)
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleSaveEdit = () => {
    if (editingId) {
      onUpdateWaypoint(editingId, editName, editAltitude)
      setEditingId(null)
    }
  }

  return (
    <div className="relative bg-background">
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-96 lg:h-screen/2 cursor-crosshair bg-background"
      />

      {waypoints.map((wp) => {
        const isEditing = editingId === wp.id
        return (
          <div
            key={wp.id}
            className="absolute"
            style={{
              left: `${wp.x + panX}px`,
              top: `${wp.y + panY}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {isEditing ? (
              <div className="bg-background border-2 border-primary rounded-lg p-2 shadow-lg min-w-max">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="px-2 py-1 bg-accent border border-border rounded text-foreground text-xs font-semibold"
                    placeholder="Fix name"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={editAltitude}
                    onChange={(e) => setEditAltitude(e.target.value)}
                    className="px-2 py-1 bg-accent border border-border rounded text-foreground text-xs"
                    placeholder="Altitude"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setEditingId(wp.id)
                  setEditName(wp.name)
                  setEditAltitude(wp.altitude)
                }}
                className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-blue-700 transition group relative"
              >
                <div>{wp.name}</div>
                <div className="text-xs opacity-90">{wp.altitude} ft</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteWaypoint(wp.id)
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )
      })}

      {presavedFixes.map((fix) => (
        <div
          key={fix.id}
          className="absolute"
          style={{
            left: `${fix.x + panX}px`,
            top: `${fix.y + panY}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold pointer-events-none opacity-80">
            <div>{fix.name}</div>
            <div className="text-xs opacity-90">{fix.altitude} ft</div>
          </div>
        </div>
      ))}

      {!mapImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Please select a chart to begin practicing.</p>
        </div>
      )}
    </div>
  )
}
