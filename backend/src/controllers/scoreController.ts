import { Request, Response } from "express";
import Chart from "../models/Chart";

interface UserWaypoint {
  name: string;
  minAltitude?: string | number;
  maxAltitude?: string | number;
}

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

// Bulletproof Parser
const parseAltitude = (val: any): number => {
  if (val == null || val === "") return -1;
  try {
    const str = `${val}`.trim();
    if (str === "-1") return -1;
    const numValue = parseInt(str.replace(/\D/g, ""));
    return isNaN(numValue) ? 0 : numValue;
  } catch (e) {
    console.error("Error parsing altitude:", val, e);
    return -1;
  }
};

export const calculateScore = async (req: Request, res: Response) => {
  try {
    const { mapId, waypoints, practiceMode } = req.body;

    console.log(`Processing Score Request for: ${mapId}`);

    // Validate Inputs
    if (!mapId) return res.status(400).json({ message: "Missing mapId" });
    if (!Array.isArray(waypoints))
      return res.status(400).json({ message: "Waypoints must be an array" });

    // Fetch Chart
    const chart = await Chart.findById(mapId).lean();
    if (!chart) {
      console.log("Chart not found in DB");
      return res.status(404).json({ message: "Chart not found" });
    }

    // Sanitize User Waypoints
    const safeUserWaypoints = waypoints.filter(
      (wp) => wp && typeof wp === "object"
    );

    // Get the correct route from DB.
    const correctRoute = chart.fixes || [];
    const totalItems = correctRoute.length;

    // Scoring State
    let fixMatches = 0;
    let altMatches = 0;
    const altitudeErrors: string[] = [];
    const missedFixes: string[] = [];

    // Logic Flags
    // NO_ALT = Practice Altitudes (Score Alts only, Ignore Names)
    // NO_FIX = Practice Names (Score Names only, Ignore Alts)
    // CLEAN / FULL = Score Both
    const shouldScoreFixes = practiceMode !== "NO_ALT";
    const shouldScoreAlts = practiceMode !== "NO_FIX";

    // --- MAIN SCORING LOOP (By Index) ---
    for (let i = 0; i < totalItems; i++) {
      const dbFix = correctRoute[i] as any;
      const userFix = safeUserWaypoints[i]; // Direct index matching

      const correctName = String(dbFix.fix_name || "Unknown").toUpperCase();

      // If user somehow didn't send a fix for this index (shouldn't happen if initialized correctly)
      if (!userFix) {
        if (shouldScoreFixes) missedFixes.push(`${correctName} (Missing)`);
        if (shouldScoreAlts)
          altitudeErrors.push(`${correctName}: Missing entry`);
        continue;
      }

      // 1. CHECK FIX NAME
      if (shouldScoreFixes) {
        const userName = String(userFix.name || "")
          .toUpperCase()
          .trim();
        if (userName === correctName) {
          fixMatches++;
        } else {
          missedFixes.push(`${correctName} (You put: ${userName || "Empty"})`);
        }
      }

      // 2. CHECK ALTITUDE
      if (shouldScoreAlts) {
        const userMin = parseAltitude(userFix.minAltitude);
        const userMax = parseAltitude(userFix.maxAltitude);
        const correctMin = parseAltitude(dbFix.min_alt);
        const correctMax = parseAltitude(dbFix.max_alt);

        const minMatch = userMin === correctMin;
        const maxMatch = userMax === correctMax;

        if (minMatch && maxMatch) {
          altMatches++;
        } else {
          const fmt = (val: number) => (val === -1 ? "None" : val);
          let errorMsg = `${correctName}: `;

          if (!minMatch)
            errorMsg += `Min expected ${fmt(correctMin)}, got ${fmt(
              userMin
            )}. `;
          if (!maxMatch)
            errorMsg += `Max expected ${fmt(correctMax)}, got ${fmt(userMax)}.`;

          altitudeErrors.push(errorMsg.trim());
        }
      }
    }

    // --- CALCULATE PERCENTAGES ---
    let finalScore = 0;
    // Prevent division by zero
    const fixPercent = totalItems > 0 ? (fixMatches / totalItems) * 100 : 0;
    const altPercent = totalItems > 0 ? (altMatches / totalItems) * 100 : 0;

    if (shouldScoreFixes && shouldScoreAlts) {
      finalScore = (fixPercent + altPercent) / 2;
    } else if (shouldScoreFixes) {
      finalScore = fixPercent;
    } else if (shouldScoreAlts) {
      finalScore = altPercent;
    }

    finalScore = Math.round(finalScore);

    // --- CONSTRUCT RESPONSE ---

    // 1. Determine Label
    let modeLabel = "Procedure";
    if (!shouldScoreFixes) {
      modeLabel = "Altitude Constraints";
    } else if (!shouldScoreAlts) {
      modeLabel = "Fix Names";
    }

    // 2. Create Result Object
    const result: ScoreResult = {
      score: finalScore,
      scoringMode: modeLabel,

      // Fix Data (Undefined if not scoring fixes)
      totalFixes: shouldScoreFixes ? totalItems : undefined,
      correctFixes: shouldScoreFixes ? fixMatches : undefined,
      missedFixes: shouldScoreFixes ? missedFixes : undefined,
      fixAccuracy: shouldScoreFixes ? Math.round(fixPercent) : undefined,

      // Altitude Data (Undefined if not scoring alts)
      altitudeErrors: shouldScoreAlts ? altitudeErrors : undefined,
      correctAltitudes: shouldScoreAlts ? altMatches : undefined,
      altAccuracy: shouldScoreAlts ? Math.round(altPercent) : undefined,

      message:
        finalScore === 100
          ? `Perfect ${modeLabel}!`
          : finalScore > 70
          ? "Good Job!"
          : `Check your ${modeLabel.toLowerCase()}.`,
    };

    console.log("Score calculated successfully:", finalScore);
    res.json(result);
  } catch (error) {
    console.error("CRITICAL SCORING ERROR:", error);
    res.status(500).json({
      message: "Server error calculating score",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
