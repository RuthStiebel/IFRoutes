"use client";

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  BarChart,
} from "lucide-react";

// Define locally to avoid import dependency issues
type PracticeMode = "FULL" | "NO_ALT" | "NO_FIX" | "CLEAN";

interface ScoreResult {
  score: number;
  totalFixes?: number;
  correctFixes?: number;
  altitudeErrors?: string[];
  correctAltitudes?: number;
  missedFixes?: string[];
  message: string;
  scoringMode: string;
  fixAccuracy?: number;
  altAccuracy?: number;
}

interface PerformanceScoreProps {
  routeSubmitted: boolean;
  waypointCount: number;
  scoreData?: ScoreResult | null;
  practiceMode?: PracticeMode | null; // NEW: Receive the mode
}

export default function PerformanceScore({
  routeSubmitted,
  waypointCount,
  scoreData,
  practiceMode,
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

  if (!scoreData) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
        <h3 className="font-semibold mb-3 text-sm">Calculating...</h3>
        <div className="h-24 bg-accent rounded"></div>
      </div>
    );
  }

  const isPerfect = scoreData.score === 100;

  // Only show breakdowns if we are in a mode that scores both
  const showBreakdown =
    (practiceMode === "FULL" || practiceMode === "CLEAN" || !practiceMode) &&
    scoreData.fixAccuracy !== undefined;

  // Logic to hide specific error sections based on mode
  // If practicing NO_ALT (Altitudes only), we hide Fix Name errors.
  // If practicing NO_FIX (Names only), we hide Altitude errors.
  const showFixErrors = practiceMode !== "NO_ALT";
  const showAltErrors = practiceMode !== "NO_FIX";

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
      {/* Header */}
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
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">
              {scoreData.scoringMode || "Result"}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown (Only for Full/Clean Mode) */}
      {showBreakdown && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-accent/50 p-2 rounded border border-border text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-muted-foreground mb-1">
              <Target className="w-3 h-3" /> Fixes
            </div>
            <div
              className={`font-bold ${
                scoreData.fixAccuracy === 100
                  ? "text-green-500"
                  : "text-foreground"
              }`}
            >
              {scoreData.fixAccuracy}%
            </div>
          </div>
          <div className="bg-accent/50 p-2 rounded border border-border text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase text-muted-foreground mb-1">
              <BarChart className="w-3 h-3" /> Altitude
            </div>
            <div
              className={`font-bold ${
                scoreData.altAccuracy === 100
                  ? "text-green-500"
                  : "text-foreground"
              }`}
            >
              {scoreData.altAccuracy}%
            </div>
          </div>
        </div>
      )}

      {/* Errors List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {/* 1. Missed Fixes (Hide if we are only practicing Altitudes) */}
        {showFixErrors &&
          scoreData.missedFixes &&
          scoreData.missedFixes.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-xs">
              <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Incorrect Fixes
              </h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {scoreData.missedFixes.map((fix, i) => (
                  <li key={i}>
                    Missed/Wrong: <strong>{fix}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* 2. Altitude Errors (Hide if we are only practicing Fix Names) */}
        {showAltErrors &&
          scoreData.altitudeErrors &&
          scoreData.altitudeErrors.length > 0 && (
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
