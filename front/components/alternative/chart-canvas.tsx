"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { PracticeMode } from "../../lib/globals";
import { Waypoint } from "../../lib/api";

interface ChartCanvasProps {
  mapImage: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  waypoints: Waypoint[];
  onUpdateWaypoint: (id: string, field: string, value: string) => void;
  onSelectWaypoint: (id: string | null) => void;
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

  const hideNameInput = practiceMode === "NO_ALT";
  const hideAltInput = practiceMode === "NO_FIX";

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
      ctx.strokeStyle = "#1e3a8a"; // Navy Line
      ctx.lineWidth = 1; // Thinner line
      ctx.setLineDash([3, 3]); // Tighter dash
      ctx.beginPath();
      waypoints.forEach((wp, idx) => {
        if (idx === 0) ctx.moveTo(wp.x, wp.y);
        else ctx.lineTo(wp.x, wp.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }
    /*
    // Draw Points
    waypoints.forEach((wp) => {
      const isSelected = wp.id === selectedWaypointId;

      ctx.beginPath();
      ctx.fillStyle = isSelected ? "#2d6949ff" : "#2d3969ff";

      // 👇 SMALLER DOTS
      const radius = isSelected ? 4 : 2.5;

      ctx.arc(wp.x, wp.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
    */
  }, [loadedImage, waypoints, selectedWaypointId, canvasRef, practiceMode]);
  // Handle Canvas Click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!loadedImage || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    console.log("Coordinates for JSON:", {
      x: Math.round(clickX),
      y: Math.round(clickY),
    });

    let clickedId: string | null = null;
    for (const wp of waypoints) {
      const dist = Math.sqrt(
        Math.pow(clickX - wp.x, 2) + Math.pow(clickY - wp.y, 2)
      );
      if (dist < 12) {
        // Tighter click radius
        clickedId = wp.id;
        break;
      }
    }
    onSelectWaypoint(clickedId);
  };

  return (
    <div ref={containerRef} className="relative w-full font-sans">
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-auto cursor-pointer bg-slate-900 block shadow-lg rounded-md"
      />

      {!mapImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none h-96">
          <p className="text-muted-foreground text-sm">Select a chart.</p>
        </div>
      )}

      {/* FLOATING EDIT INPUTS */}
      {waypoints.map((wp, index) => {
        const isSelected = wp.id === selectedWaypointId;

        // Shared Input Styles (Navy Border + Extra Small)
        const inputBaseClass = `
          text-center text-[8px] px-0.5 py-0 shadow-sm leading-none
          focus:outline-none focus:ring-1 focus:ring-blue-900 
        `;

        const inputSelectedClass = isSelected
          ? "bg-white text-black border border-blue-900"
          : "bg-white/90 text-black border border-gray-400";

        return (
          <div
            key={wp.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWaypoint(wp.id);
            }}
            className={`absolute flex flex-col gap-px p-px rounded transition-all transform -translate-x-1/2 ${
              isSelected
                ? "z-20 scale-105"
                : "z-10 hover:z-20 opacity-80 hover:opacity-100"
            }`}
            style={{
              left: wp.x,
              top: wp.y + 6, // Closer to dot
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
                  ${inputBaseClass} ${inputSelectedClass}
                  uppercase font-bold w-12 h-4 rounded-sm
                `}
              />
            )}

            {/* Altitude Inputs */}
            {!hideAltInput && (
              <div className="flex gap-px justify-center">
                <input
                  type="text"
                  value={wp.minAltitude}
                  onChange={(e) =>
                    onUpdateWaypoint(wp.id, "minAltitude", e.target.value)
                  }
                  placeholder="MIN"
                  className={`
                    ${inputBaseClass} ${inputSelectedClass}
                    w-7 h-4 rounded-l-sm border-r-0
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
                    ${inputBaseClass} ${inputSelectedClass}
                    w-7 h-4 rounded-r-sm
                  `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
