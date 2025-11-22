"use client";

import { useState, useRef } from "react";
import { PlaneTakeoff, PlaneLanding } from "lucide-react";
import ChartCanvas from "@/components/chart-canvas";
import WaypointsPanel from "@/components/waypoints-panel";
import PerformanceScore from "@/components/performance-score";
import MapSelector from "@/components/map-selector";
import { submitRoute } from "@/lib/api";

interface Waypoint {
  id: string;
  name: string;
  minAltitude: string;
  maxAltitude: string;
  x: number;
  y: number;
}

export default function Home() {
  const [procedureType, setProcedureType] = useState<"SID" | "STAR" | null>(
    null
  );
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [routeSubmitted, setRouteSubmitted] = useState(false);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleMapSelect = (mapId: string, imageUrl: string) => {
    setSelectedMap(mapId);
    setMapImage(imageUrl);
    setWaypoints([]);
    setRouteSubmitted(false);
    setScoreResult(null);
    setSelectedWaypointId(null);
  };

  const handleAddWaypoint = (waypoint: Waypoint) => {
    setWaypoints([...waypoints, waypoint]);
    setSelectedWaypointId(waypoint.id);
  };

  const handleUpdateWaypoint = (id: string, field: string, value: string) => {
    setWaypoints((prev) =>
      prev.map((wp) => (wp.id === id ? { ...wp, [field]: value } : wp))
    );
  };

  const handleDeleteWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id));
    if (selectedWaypointId === id) setSelectedWaypointId(null);
  };

  const handleClearDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (mapImage) {
          const img = new Image();
          img.onload = () => {
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.width * aspectRatio;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = mapImage;
        }
      }
    }
    setWaypoints([]);
    setRouteSubmitted(false);
    setScoreResult(null);
    setSelectedWaypointId(null);
  };

  const handleSubmitRoute = async () => {
    if (!selectedMap) return;
    try {
      const result = await submitRoute(selectedMap, waypoints);
      setScoreResult(result);
      setRouteSubmitted(true);
      setSelectedWaypointId(null);
    } catch (error) {
      console.error("Error submitting route:", error);
      alert("Failed to calculate score. Please check the console.");
    }
  };

  // --- Render Logic ---

  // 1. Chart Selection Step (SID vs STAR)
  if (!procedureType) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">IFR Procedure Sketchpad</h1>
            <p className="text-muted-foreground text-xl">
              What type of procedure do you want to practice?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* SID Button */}
            <button
              onClick={() => setProcedureType("SID")}
              className="group flex flex-col items-center p-8 rounded-xl border-2 border-border bg-card hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PlaneTakeoff className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Departures</h2>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold">
                SID
              </span>
              <p className="mt-4 text-muted-foreground text-sm">
                Practice Standard Instrument Departures
              </p>
            </button>

            {/* STAR Button */}
            <button
              onClick={() => setProcedureType("STAR")}
              className="group flex flex-col items-center p-8 rounded-xl border-2 border-border bg-card hover:border-green-500 hover:bg-green-500/5 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <PlaneLanding className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Arrivals</h2>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-semibold">
                STAR
              </span>
              <p className="mt-4 text-muted-foreground text-sm">
                Practice Standard Terminal Arrival Routes
              </p>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-balance">
            IFR Procedure Sketchpad
          </h1>
          <p className="text-muted-foreground text-lg">
            Practicing {procedureType === "SID" ? "Departures" : "Arrivals"}
          </p>
        </div>

        {/* 2. Specific Map Selection */}
        {!selectedMap ? (
          <MapSelector
            chartType={procedureType}
            onSelectMap={handleMapSelect}
            onBack={() => setProcedureType(null)}
          />
        ) : (
          // 3. The Workspace
          <>
            {/* Controls */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedMap(null)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Choose Different Map
              </button>
              <button
                onClick={handleClearDrawing}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Clear Drawing
              </button>
              <button
                onClick={handleSubmitRoute}
                disabled={waypoints.length === 0}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                Submit Route & Score
              </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Canvas Area */}
              <div className="lg:col-span-3">
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <ChartCanvas
                    mapImage={mapImage}
                    canvasRef={canvasRef}
                    waypoints={waypoints}
                    onAddWaypoint={handleAddWaypoint}
                    onDeleteWaypoint={handleDeleteWaypoint}
                    isDrawingEnabled={isDrawing}
                    onSelectWaypoint={(id) => setSelectedWaypointId(id)}
                    selectedWaypointId={selectedWaypointId}
                  />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                {/* Instructions */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-sm">
                    How to Practice:
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      • <strong>Draw:</strong> Click chart to add points.
                    </li>
                    <li>
                      • <strong>Edit:</strong> Double-click a point on chart or
                      list.
                    </li>
                    <li>
                      • <strong>Log:</strong> Enter Altitudes (e.g., 5000 or
                      FL080).
                    </li>
                  </ul>
                </div>

                {/* Waypoints Panel */}
                <WaypointsPanel
                  waypoints={waypoints}
                  onUpdateWaypoint={handleUpdateWaypoint}
                  onDeleteWaypoint={handleDeleteWaypoint}
                  selectedWaypointId={selectedWaypointId}
                />

                <PerformanceScore
                  routeSubmitted={routeSubmitted}
                  waypointCount={waypoints.length}
                  scoreData={scoreResult} // <--- UPDATED: Passing real data
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
