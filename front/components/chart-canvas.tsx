"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface Waypoint {
  id: string;
  name: string;
  minAltitude: string;
  maxAltitude: string;
  x: number;
  y: number;
}

interface SavedFix {
  id: string;
  name: string;
  altitude: string;
  x: number;
  y: number;
}

interface ChartCanvasProps {
  mapImage: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  waypoints: Waypoint[];
  onAddWaypoint: (waypoint: Waypoint) => void;
  onDeleteWaypoint: (id: string) => void;
  isDrawingEnabled: boolean;
  onSelectWaypoint?: (id: string) => void;
  selectedWaypointId?: string | null;
  savedFixes?: SavedFix[];
}

export default function ChartCanvas({
  mapImage,
  canvasRef,
  waypoints,
  onAddWaypoint,
  onDeleteWaypoint,
  isDrawingEnabled,
  onSelectWaypoint,
  selectedWaypointId,
}: //presavedFixes = [],
ChartCanvasProps) {
  // Store the loaded image object so we don't reload it on every render
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // 1. Effect to load the image ONLY when mapImage changes
  useEffect(() => {
    if (!mapImage) {
      setLoadedImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load map image:", mapImage);
      setLoadedImage(null);
    };
    img.src = mapImage;
  }, [mapImage]);

  // 2. Effect to Draw the canvas (Runs when Image loads OR Waypoints change)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions based on image aspect ratio
    // We only need to set this if it changes, but setting it ensures
    // the canvas is always the right size for the image.
    const aspectRatio = loadedImage.naturalHeight / loadedImage.naturalWidth;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.width * aspectRatio;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the STATIC image (using the cached object)
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
      ctx.fillStyle = isSelected ? "#fbbf24" : "#ef4444";
      const radius = isSelected ? 8 : 6;

      ctx.arc(wp.x, wp.y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(wp.name, wp.x, wp.y);
    });
  }, [loadedImage, waypoints, selectedWaypointId, canvasRef]);
  // ^ This effect runs instantly because 'loadedImage' is already in memory

  // Mouse Down (Creation only)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDrawingEnabled && e.button === 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Ensure click is within bounds
      if (x >= 0 && y >= 0 && x <= canvas.width && y <= canvas.height) {
        onAddWaypoint({
          id: Date.now().toString(),
          name: `FIX ${waypoints.length + 1}`,
          minAltitude: "",
          maxAltitude: "",
          x: x,
          y: y,
        });
      }
    }
  };

  // Double Click (Selection only)
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!onSelectWaypoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (const wp of waypoints) {
      const dist = Math.sqrt(
        Math.pow(clickX - wp.x, 2) + Math.pow(clickY - wp.y, 2)
      );

      if (dist < 15) {
        onSelectWaypoint(wp.id);
        e.stopPropagation();
        return;
      }
    }
  };

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-auto cursor-crosshair bg-slate-900 block shadow-lg"
      />
      {!mapImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none h-96">
          <p className="text-muted-foreground text-lg">
            Please select a chart to begin practicing.
          </p>
        </div>
      )}
    </div>
  );
}
