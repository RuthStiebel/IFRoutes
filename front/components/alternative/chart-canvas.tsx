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
      ctx.setLineDash([5, 5]); // Dashed lines for clarity
      ctx.beginPath();
      waypoints.forEach((wp, idx) => {
        if (idx === 0) ctx.moveTo(wp.x, wp.y);
        else ctx.lineTo(wp.x, wp.y);
      });
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash
    }

    // Draw Points
    waypoints.forEach((wp) => {
      const isSelected = wp.id === selectedWaypointId;

      ctx.beginPath();
      // If selected, turn Yellow, else Red
      ctx.fillStyle = isSelected ? "#48a868ff" : "#8b1f1fff";
      const radius = isSelected ? 8 : 6;

      ctx.arc(wp.x, wp.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = "#e9f1d5ff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [loadedImage, waypoints, selectedWaypointId, canvasRef, practiceMode]);

  // Handle Canvas Click (Select Only)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!loadedImage || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    console.log("Coordinates for JSON:", { x: clickX, y: clickY });

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

      {waypoints.map((wp, index) => {
        const isSelected = wp.id === selectedWaypointId;

        return (
          <div
            key={wp.id}
            // Add click handler to select the waypoint when clicking its input box
            onClick={(e) => {
              e.stopPropagation();
              onSelectWaypoint(wp.id);
            }}
            // Dynamic classes: Selected items pop out; others are semi-transparent
            className={`absolute flex flex-col gap-1 p-1 rounded transition-all transform -translate-x-1/2 ${
              isSelected ? "z-20 scale-110" : "z-10 hover:z-20 opacity-90"
            }`}
            style={{
              left: wp.x,
              top: wp.y + 12, // Offset slightly below the dot
            }}
          >
            {/* Fix Name Input */}
            {!hideNameInput && (
              <input
                type="text"
                value={wp.name}
                onChange={(e) =>
                  onUpdateWaypoint(wp.id, "name", e.target.value)
                }
                placeholder="NAME"
                className={`
                  text-center uppercase font-bold text-xs px-1 py-0.5 rounded border shadow-sm w-20
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${
                    isSelected
                      ? "bg-white text-black border-blue-500"
                      : "bg-white/80 text-black border-gray-400"
                  }
                `}
              />
            )}

            {/* Altitude Inputs */}
            {!hideAltInput && (
              <div className="flex gap-0.5 justify-center">
                <input
                  type="text"
                  value={wp.minAltitude}
                  onChange={(e) =>
                    onUpdateWaypoint(wp.id, "minAltitude", e.target.value)
                  }
                  placeholder="MIN"
                  className={`
                    text-center text-[10px] px-1 py-0.5 rounded-l border-y border-l shadow-sm w-10
                    focus:outline-none focus:ring-1 focus:ring-blue-500
                    ${
                      isSelected
                        ? "bg-white text-black border-blue-500"
                        : "bg-white/80 text-black border-gray-400"
                    }
                  `}
                />
                <input
                  type="text"
                  value={wp.maxAltitude}
                  onChange={(e) =>
                    onUpdateWaypoint(wp.id, "maxAltitude", e.target.value)
                  }
                  placeholder="MAX"
                  className={`
                    text-center text-[10px] px-1 py-0.5 rounded-r border shadow-sm w-10
                    focus:outline-none focus:ring-1 focus:ring-blue-500
                    ${
                      isSelected
                        ? "bg-white text-black border-blue-500"
                        : "bg-white/80 text-black border-gray-400"
                    }
                  `}
                />
              </div>
            )}

            {/* Number Indicator */}
            <div
              className={`
              text-[8px] font-bold text-center mt-0.5 drop-shadow-md
              ${isSelected ? "text-yellow-400" : "text-white/70"}
            `}
            >
              #{index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}
