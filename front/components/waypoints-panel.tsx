"use client";

import { useState } from "react";
import { Trash2, Check, X } from "lucide-react";
import { PracticeMode } from "../lib/globals";

interface Waypoint {
  id: string;
  name: string;
  minAltitude: string;
  maxAltitude: string;
  x: number;
  y: number;
}

interface WaypointsPanelProps {
  waypoints: Waypoint[];
  onUpdateWaypoint: (id: string, field: string, value: string) => void;
  onDeleteWaypoint: (id: string) => void;
  selectedWaypointId?: string | null;
  practiceMode?: PracticeMode | null; // New Prop
}

export default function WaypointsPanel({
  waypoints,
  onUpdateWaypoint,
  onDeleteWaypoint,
  selectedWaypointId,
  practiceMode, // Receive the mode
}: WaypointsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editMinAlt, setEditMinAlt] = useState("");
  const [editMaxAlt, setEditMaxAlt] = useState("");

  // Determine what should be hidden based on practice mode
  // If mode is "NO_FIX", user sees altitudes but NO fix names (so they must type the name)
  // If mode is "NO_ALT", user sees fix names but NO altitudes (so they must type altitudes)

  const hideNameInput = practiceMode === "NO_ALT";
  const hideAltInput = practiceMode === "NO_FIX";

  const handleEdit = (wp: Waypoint) => {
    setEditingId(wp.id);
    setEditName(wp.name);
    setEditMinAlt(wp.minAltitude);
    setEditMaxAlt(wp.maxAltitude);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = () => {
    if (editingId) {
      if (!hideNameInput) onUpdateWaypoint(editingId, "name", editName);
      if (!hideAltInput) {
        onUpdateWaypoint(editingId, "minAltitude", editMinAlt);
        onUpdateWaypoint(editingId, "maxAltitude", editMaxAlt);
      }
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col h-[400px]">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <span className="text-primary">◉</span> Waypoints Log
      </h3>
      <p className="text-xs text-muted-foreground mb-2">
        {practiceMode === "NO_ALT"
          ? "Enter Altitudes only."
          : practiceMode === "NO_FIX"
          ? "Enter Fix Names only."
          : "Double-click to edit."}
      </p>

      {waypoints.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No waypoints placed yet.
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {waypoints.map((wp, idx) => {
            const isEditing = editingId === wp.id;
            const isSelected = selectedWaypointId === wp.id;

            return (
              <div
                key={wp.id}
                onDoubleClick={() => !isEditing && handleEdit(wp)}
                className={`flex flex-col gap-2 p-2 rounded text-sm border transition-colors ${
                  isSelected && !isEditing
                    ? "bg-blue-500/10 border-blue-500"
                    : "bg-accent border-transparent hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground w-5">
                    #{idx + 1}
                  </span>

                  {isEditing ? (
                    // --- EDIT MODE ---
                    <div className="flex-1 grid grid-cols-1 gap-2">
                      {/* Name Input (Hidden if practicing Alts only) */}
                      {!hideNameInput && (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="w-full px-2 py-1 bg-background border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Fix Name"
                          autoFocus
                        />
                      )}

                      {/* Altitude Inputs (Hidden if practicing Fixes only) */}
                      {!hideAltInput && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] uppercase text-muted-foreground block mb-0.5">
                              Min
                            </label>
                            <input
                              type="text"
                              value={editMinAlt}
                              onChange={(e) => setEditMinAlt(e.target.value)}
                              onKeyDown={handleKeyDown}
                              className="w-full px-2 py-1 bg-background border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="None"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase text-muted-foreground block mb-0.5">
                              Max
                            </label>
                            <input
                              type="text"
                              value={editMaxAlt}
                              onChange={(e) => setEditMaxAlt(e.target.value)}
                              className="w-full px-2 py-1 bg-background border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="None"
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={handleCancel}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    // --- VIEW MODE ---
                    <>
                      <div className="flex-1">
                        {!hideNameInput && (
                          <div className="font-semibold text-foreground">
                            {wp.name}
                          </div>
                        )}
                        {!hideAltInput && (
                          <div className="text-xs text-muted-foreground flex gap-2">
                            <span>Min: {wp.minAltitude || "---"}</span>
                            <span className="text-border">|</span>
                            <span>Max: {wp.maxAltitude || "---"}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteWaypoint(wp.id)}
                        className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
