"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

// Matches the interface from your backend
interface ScoreResult {
  score: number;
  totalFixes: number;
  correctFixes: number;
  altitudeErrors: string[];
  missedFixes: string[];
  message: string;
}

interface PerformanceScoreProps {
  routeSubmitted: boolean;
  waypointCount: number;
  scoreData?: ScoreResult | null; // Make this optional so it doesn't break if data is missing
}

export default function PerformanceScore({
  routeSubmitted,
  waypointCount,
  scoreData,
}: PerformanceScoreProps) {
  if (!routeSubmitted) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
          <span className="text-yellow-500">⭐</span> Performance Score
        </h3>
        <div className="text-center py-6">
          <div className="text-3xl font-bold text-muted-foreground mb-2">
            --
          </div>
          <p className="text-xs text-muted-foreground">Route not submitted.</p>
        </div>
      </div>
    );
  }

  // If submitted but no data yet (loading or error state)
  if (!scoreData) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
        <h3 className="font-semibold mb-3 text-sm">Calculating...</h3>
        <div className="h-24 bg-accent rounded"></div>
      </div>
    );
  }

  const isPerfect = scoreData.score === 100;

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
      {/* Header / Score */}
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
          <span className="text-yellow-500">⭐</span> Performance Score
        </h3>

        <div className="text-center py-2 border-b border-border pb-4">
          <div
            className={`text-5xl font-bold mb-1 ${
              isPerfect ? "text-green-500" : "text-primary"
            }`}
          >
            {scoreData.score}%
          </div>
          <p className="text-sm font-medium">{scoreData.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {scoreData.correctFixes} / {scoreData.totalFixes} Correct Fixes
          </p>
        </div>
      </div>

      {/* Details / Errors */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {/* 1. Missed Fixes */}
        {scoreData.missedFixes.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-xs">
            <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Missed Waypoints
            </h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {scoreData.missedFixes.map((fix, i) => (
                <li key={i}>
                  You missed <strong>{fix}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 2. Altitude Errors */}
        {scoreData.altitudeErrors.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3 text-xs">
            <h4 className="font-semibold text-orange-500 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Altitude Errors
            </h4>
            <ul className="space-y-1 text-muted-foreground">
              {scoreData.altitudeErrors.map((err, i) => (
                <li
                  key={i}
                  className="border-b border-orange-500/10 last:border-0 pb-1 last:pb-0"
                >
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. Success Message (if perfect) */}
        {isPerfect && (
          <div className="bg-green-500/10 border border-green-500/20 rounded p-3 text-xs text-center">
            <p className="text-green-600 font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> All constraints met!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
