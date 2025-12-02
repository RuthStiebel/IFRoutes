"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { PracticeMode } from "../../lib/globals";
import { Waypoint } from "../../lib/api";

interface ChartCanvasProps {
  mapImage: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  waypoints: Waypoint[];
  onUpdateWaypoint: (id: string, field: string, value: string) => void; // Added for map editing
  onSelectWaypoint: (id: string | null) => void; // Changed to allow null (deselect)
  selectedWaypointId?: string | null;
  practiceMode?: PracticeMode | null;
}

export default function ChartCanvas({
  mapImage,
  canvasRef,
  waypoints,
  onUpdateWaypoint,
  onSelectWaypoint,
  selectedWaypointId,
  practiceMode,
}: ChartCanvasProps) {
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine visibility based on mode
  const hideNameInput = practiceMode === "NO_ALT"; // Only doing altitudes
  const hideAltInput = practiceMode === "NO_FIX"; // Only doing names

  // 1. Load Image
  useEffect(() => {
    if (!mapImage) {
      setLoadedImage(null);
      return;
    }
    const img = new Image();
    img.onload = () => setLoadedImage(img);
    img.src = mapImage;
  }, [mapImage]);

  // 2. Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const aspectRatio = loadedImage.naturalHeight / loadedImage.naturalWidth;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.width * aspectRatio;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

    // Draw Lines
    if (waypoints.length > 1) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      waypoints.forEach((wp, idx) => {
        if (idx === 0) ctx.moveTo(wp.x, wp.y);
        else ctx.lineTo(wp.x, wp.y);
      });
      ctx.stroke();
    }

    // Draw Points
    waypoints.forEach((wp) => {
      const isSelected = wp.id === selectedWaypointId;

      ctx.beginPath();
      // If selected, turn Yellow, else Red
      ctx.fillStyle = isSelected ? "#fbbf24" : "#ef4444";
      const radius = isSelected ? 8 : 6;

      ctx.arc(wp.x, wp.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Label text on canvas (read-only view)
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Determine what label to show based on mode
      let label = wp.name;
      if (practiceMode === "NO_FIX") label = "FIX ???"; // Hide name if guessing name

      // Offset text slightly so it doesn't overlap the dot
      ctx.fillText(label, wp.x, wp.y - 15);
    });
  }, [loadedImage, waypoints, selectedWaypointId, canvasRef, practiceMode]);

  // Handle Canvas Click (Select Only)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!loadedImage || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check collision with existing waypoints
    let clickedId: string | null = null;

    for (const wp of waypoints) {
      const dist = Math.sqrt(
        Math.pow(clickX - wp.x, 2) + Math.pow(clickY - wp.y, 2)
      );
      if (dist < 20) {
        // Hitbox radius
        clickedId = wp.id;
        break;
      }
    }

    onSelectWaypoint(clickedId);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-auto cursor-pointer bg-slate-900 block shadow-lg rounded-md"
      />

      {!mapImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none h-96">
          <p className="text-muted-foreground text-lg">
            Please select a chart to begin practicing.
          </p>
        </div>
      )}

      {/* FLOATING EDIT INPUTS */}
      {selectedWaypointId &&
        waypoints.map((wp) => {
          if (wp.id !== selectedWaypointId) return null;

          return (
            <div
              key={wp.id}
              className="absolute z-10 bg-popover border border-border p-2 rounded shadow-xl flex flex-col gap-2 w-48"
              style={{
                left: wp.x,
                top: wp.y + 15, // Push slightly below the point
                transform: "translateX(-50%)", // Center horizontally
              }}
            >
              {/* Fix Name Input */}
              {!hideNameInput && (
                <input
                  type="text"
                  placeholder="Fix Name"
                  className="w-full px-2 py-1 bg-background border border-input rounded text-sm font-bold uppercase"
                  value={wp.name}
                  onChange={(e) =>
                    onUpdateWaypoint(wp.id, "name", e.target.value)
                  }
                  autoFocus={!hideNameInput}
                />
              )}

              {/* Altitude Inputs */}
              {!hideAltInput && (
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="Min Alt"
                    className="w-1/2 px-2 py-1 bg-background border border-input rounded text-xs"
                    value={wp.minAltitude}
                    onChange={(e) =>
                      onUpdateWaypoint(wp.id, "minAltitude", e.target.value)
                    }
                    autoFocus={hideNameInput} // Focus here if name is hidden
                  />
                  <input
                    type="text"
                    placeholder="Max Alt"
                    className="w-1/2 px-2 py-1 bg-background border border-input rounded text-xs"
                    value={wp.maxAltitude}
                    onChange={(e) =>
                      onUpdateWaypoint(wp.id, "maxAltitude", e.target.value)
                    }
                  />
                </div>
              )}

              <div className="text-[10px] text-muted-foreground text-center">
                #{waypoints.indexOf(wp) + 1}
              </div>
            </div>
          );
        })}
    </div>
  );
}
