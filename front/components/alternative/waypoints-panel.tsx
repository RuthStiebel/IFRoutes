"use client";

import { useState, useEffect } from "react";
import { Trash2, Check, X, MapPin } from "lucide-react";
import { PracticeMode } from "../../lib/globals";
import { Waypoint } from "../../lib/api";

interface WaypointsPanelProps {
  waypoints: Waypoint[];
  onUpdateWaypoint: (id: string, field: string, value: string) => void;
  onDeleteWaypoint: (id: string) => void;
  selectedWaypointId?: string | null;
  onSelectWaypoint: (id: string) => void; // Need this to sync click
  practiceMode?: PracticeMode | null;
}

export default function WaypointsPanel({
  waypoints,
  onUpdateWaypoint,
  onDeleteWaypoint,
  selectedWaypointId,
  onSelectWaypoint,
  practiceMode,
}: WaypointsPanelProps) {
  const hideNameInput = practiceMode === "NO_ALT";
  const hideAltInput = practiceMode === "NO_FIX";

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col h-[500px]">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
        <span className="text-primary">◉</span> Waypoints Log
      </h3>

      <div className="text-xs text-muted-foreground mb-3 bg-accent/50 p-2 rounded">
        {practiceMode === "NO_ALT" && "📝 Enter Altitudes only."}
        {practiceMode === "NO_FIX" && "📝 Enter Fix Names only."}
        {(!practiceMode || practiceMode === "FULL") &&
          "📝 Enter Name & Altitudes."}
      </div>

      {waypoints.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Select a chart to load waypoints.
        </p>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {waypoints.map((wp, idx) => {
            const isSelected = selectedWaypointId === wp.id;

            return (
              <div
                key={wp.id}
                onClick={() => onSelectWaypoint(wp.id)}
                className={`flex flex-col gap-2 p-3 rounded text-sm border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-card border-border hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                  >
                    {idx + 1}
                  </div>

                  {/* EDITABLE FIELDS */}
                  <div className="flex-1 grid grid-cols-1 gap-2">
                    {/* Name Field */}
                    {!hideNameInput && (
                      <input
                        type="text"
                        value={wp.name}
                        onChange={(e) =>
                          onUpdateWaypoint(wp.id, "name", e.target.value)
                        }
                        className={`w-full bg-transparent border-b focus:outline-none text-sm font-semibold uppercase
                          ${
                            isSelected
                              ? "border-primary/50"
                              : "border-transparent pointer-events-none"
                          }
                        `}
                        placeholder="FIX NAME"
                        readOnly={!isSelected}
                      />
                    )}

                    {/* Altitude Fields */}
                    {!hideAltInput && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex-1">
                          <label className="text-[9px] uppercase text-muted-foreground block">
                            Min
                          </label>
                          <input
                            type="text"
                            value={wp.minAltitude}
                            onChange={(e) =>
                              onUpdateWaypoint(
                                wp.id,
                                "minAltitude",
                                e.target.value
                              )
                            }
                            className={`w-full bg-transparent border-b focus:outline-none
                              ${
                                isSelected
                                  ? "border-primary/50"
                                  : "border-transparent pointer-events-none"
                              }
                            `}
                            placeholder="---"
                            readOnly={!isSelected}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] uppercase text-muted-foreground block">
                            Max
                          </label>
                          <input
                            type="text"
                            value={wp.maxAltitude}
                            onChange={(e) =>
                              onUpdateWaypoint(
                                wp.id,
                                "maxAltitude",
                                e.target.value
                              )
                            }
                            className={`w-full bg-transparent border-b focus:outline-none
                              ${
                                isSelected
                                  ? "border-primary/50"
                                  : "border-transparent pointer-events-none"
                              }
                            `}
                            placeholder="---"
                            readOnly={!isSelected}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
