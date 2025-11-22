"use client";

import { useState, useRef } from "react";
import {
  PlaneTakeoff,
  PlaneLanding,
  Eye,
  EyeOff,
  Hash,
  LayoutTemplate,
} from "lucide-react";
import ChartCanvas from "@/components/chart-canvas";
import WaypointsPanel from "@/components/waypoints-panel";
import PerformanceScore from "@/components/performance-score";
import MapSelector from "@/components/map-selector";
import { submitRoute, type ChartData } from "../lib/api";
import { PracticeMode } from "../lib/globals";

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
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null);

  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [mapImage, setMapImage] = useState<string | null>(null);

  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(true);
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [routeSubmitted, setRouteSubmitted] = useState(false);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Logic to pick the correct map based on mode
  const handleMapSelect = (chart: ChartData) => {
    let urlToUse = chart.map_url; // Default to standard

    if (practiceMode === "NO_ALT") {
      urlToUse = chart.map_url_no_alt;
    } else if (practiceMode === "NO_FIX") {
      urlToUse = chart.map_url_no_fix;
    } else if (practiceMode === "CLEAN") {
      urlToUse = chart.map_url_clean;
    }

    setSelectedMapId(chart._id);
    setMapImage(urlToUse);

    // Reset workspace
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
    setWaypoints([]);
    setRouteSubmitted(false);
    setScoreResult(null);
    setSelectedWaypointId(null);
  };

  const handleSubmitRoute = async () => {
    if (!selectedMapId || !practiceMode) return;
    try {
      const result = await submitRoute(selectedMapId, waypoints, practiceMode);
      setScoreResult(result);
      setRouteSubmitted(true);
      setSelectedWaypointId(null);
      setPracticeMode(practiceMode); // Retain mode for potential new attempts
    } catch (error) {
      console.error("Error submitting route:", error);
      alert("Failed to calculate score. Please check the console.");
    }
  };

  // --- STEP 1: PROCEDURE TYPE ---
  if (!procedureType) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-4xl font-bold mb-4">IFR Procedure Sketchpad</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => setProcedureType("SID")}
              className="group flex flex-col items-center p-8 rounded-xl border-2 border-border bg-card hover:border-blue-500 transition-all"
            >
              <PlaneTakeoff className="w-10 h-10 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold">Departures (SID)</h2>
            </button>
            <button
              onClick={() => setProcedureType("STAR")}
              className="group flex flex-col items-center p-8 rounded-xl border-2 border-border bg-card hover:border-green-500 transition-all"
            >
              <PlaneLanding className="w-10 h-10 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold">Arrivals (STAR)</h2>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // --- STEP 2: PRACTICE MODE ---
  if (!practiceMode) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <h1 className="text-3xl font-bold">Select Difficulty</h1>
          <p className="text-muted-foreground">
            How much information do you want on the chart?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/*  { Standard }
            <button
              onClick={() => setPracticeMode("FULL")}
              className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:border-primary transition-all text-left"
            >
              <div className="p-3 bg-primary/10 rounded-full">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Standard Chart</h3>
                <p className="text-xs text-muted-foreground">
                  Full chart with fixes and altitudes shown.
                </p>
              </div>
            </button>
*/}
            {/* No Altitudes */}
            <button
              onClick={() => setPracticeMode("NO_ALT")}
              className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:border-orange-500 transition-all text-left"
            >
              <div className="p-3 bg-orange-500/10 rounded-full">
                <Hash className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-orange-500">No Altitudes</h3>
                <p className="text-xs text-muted-foreground">
                  Chart shows fixes, but altitudes are hidden.
                </p>
              </div>
            </button>

            {/* No Fixes */}
            <button
              onClick={() => setPracticeMode("NO_FIX")}
              className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:border-purple-500 transition-all text-left"
            >
              <div className="p-3 bg-purple-500/10 rounded-full">
                <LayoutTemplate className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold text-purple-500">No Fix Names</h3>
                <p className="text-xs text-muted-foreground">
                  Altitude restrictions are visible, but fix names are hidden.
                </p>
              </div>
            </button>

            {/* Clean */}
            <button
              onClick={() => setPracticeMode("CLEAN")}
              className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:border-red-500 transition-all text-left"
            >
              <div className="p-3 bg-red-500/10 rounded-full">
                <EyeOff className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-red-500">Clean Chart</h3>
                <p className="text-xs text-muted-foreground">
                  Only the route line is shown. No text.
                </p>
              </div>
            </button>
          </div>

          <button
            onClick={() => setProcedureType(null)}
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to Procedure Type
          </button>
        </div>
      </main>
    );
  }

  // --- STEP 3: WORKSPACE ---
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-balance">
            IFR Procedure Sketchpad
          </h1>
          <p className="text-muted-foreground text-lg">
            {procedureType === "SID" ? "Departure" : "Arrival"} •{" "}
            {practiceMode === "FULL" ? "Standard" : "Practice Mode"}
          </p>
        </div>

        {!selectedMapId ? (
          <MapSelector
            chartType={procedureType}
            onSelectMap={handleMapSelect}
            onBack={() => setPracticeMode(null)}
          />
        ) : (
          <>
            <div className="flex gap-4 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedMapId(null)}
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

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

              <div className="lg:col-span-1 space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-sm">Instructions:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      • <strong>Click</strong> to add points.
                    </li>
                    <li>
                      • <strong>Double-click</strong> to edit.
                    </li>
                    <li>• Enter constraints in the log.</li>
                  </ul>
                </div>

                <WaypointsPanel
                  waypoints={waypoints}
                  onUpdateWaypoint={handleUpdateWaypoint}
                  onDeleteWaypoint={handleDeleteWaypoint}
                  selectedWaypointId={selectedWaypointId}
                  practiceMode={practiceMode}
                />

                <PerformanceScore
                  routeSubmitted={routeSubmitted}
                  waypointCount={waypoints.length}
                  scoreData={scoreResult}
                  practiceMode={practiceMode}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
