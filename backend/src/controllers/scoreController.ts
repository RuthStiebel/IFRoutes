import { Request, Response } from "express";
import Chart from "../models/Chart";

interface UserWaypoint {
  name: string;
  minAltitude?: string | number;
  maxAltitude?: string | number;
}

interface ScoreResult {
  score: number;
  totalFixes: number;
  correctFixes: number;
  altitudeErrors: string[];
  missedFixes: string[];
  message: string;
}

// 1. Bulletproof Parser
const parseAltitude = (val: any): number => {
  // Catch null/undefined immediately
  if (val == null || val === "") return -1;

  try {
    // Force conversion to string using template literal (safest method)
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
    const { mapId, waypoints } = req.body;

    console.log(`Processing Score Request for: ${mapId}`);

    // 2. Validate Inputs
    if (!mapId) return res.status(400).json({ message: "Missing mapId" });
    if (!Array.isArray(waypoints))
      return res.status(400).json({ message: "Waypoints must be an array" });

    // 3. Fetch Chart
    const chart = await Chart.findById(mapId).lean();
    if (!chart) {
      console.log("Chart not found in DB");
      return res.status(404).json({ message: "Chart not found" });
    }

    // 4. Sanitize User Waypoints
    const safeUserWaypoints = waypoints.filter(
      (wp) => wp && typeof wp === "object"
    );
    const correctRoute = chart.fixes || [];

    // 5. Scoring State
    let totalPointsEarned = 0;
    const maxPointsPerFix = 4;
    let fullyCorrectFixesCount = 0;
    const altitudeErrors: string[] = [];
    const missedFixes: string[] = [];

    // 6. Safe Comparison Loop
    for (let i = 0; i < correctRoute.length; i++) {
      const correctFix = correctRoute[i];

      // Safety: Skip malformed DB entries
      if (!correctFix || typeof correctFix !== "object") continue;

      // Safe Name Access
      const fixNameRaw =
        (correctFix as any).fix_name || (correctFix as any).name;
      if (!fixNameRaw) continue;

      const correctName = `${fixNameRaw}`.toUpperCase();

      // Find match safely
      const userFix = safeUserWaypoints.find(
        (wp: any) => wp.name && `${wp.name}`.toUpperCase() === correctName
      );

      if (!userFix) {
        missedFixes.push(correctName);
        continue;
      }

      // Points for Fix Name
      totalPointsEarned += 2;

      // Safe Altitude Access
      const dbFix = correctFix as any;

      const userMin = parseAltitude(userFix.minAltitude);
      const userMax = parseAltitude(userFix.maxAltitude);
      const correctMin = parseAltitude(dbFix.min_alt);
      const correctMax = parseAltitude(dbFix.max_alt);

      const minMatches = userMin === correctMin;
      const maxMatches = userMax === correctMax;

      if (minMatches) totalPointsEarned += 1;
      if (maxMatches) totalPointsEarned += 1;

      if (minMatches && maxMatches) {
        fullyCorrectFixesCount++;
      } else {
        const fmt = (val: number) => (val === -1 ? "None" : val);
        let errorMsg = `${correctName}: `;
        if (!minMatches)
          errorMsg += `Minimum altitude expected ${fmt(correctMin)}, got ${fmt(
            userMin
          )}. `;
        if (!maxMatches)
          errorMsg += `Maximum altitude expected ${fmt(correctMax)}, got ${fmt(
            userMax
          )}.`;
        altitudeErrors.push(errorMsg.trim());
      }
    }

    // 7. Calculate Final Score
    const maxPossiblePoints = correctRoute.length * maxPointsPerFix;
    const score =
      maxPossiblePoints > 0
        ? Math.round((totalPointsEarned / maxPossiblePoints) * 100)
        : 0;

    const result: ScoreResult = {
      score,
      totalFixes: correctRoute.length,
      correctFixes: fullyCorrectFixesCount,
      altitudeErrors,
      missedFixes,
      message:
        score === 100
          ? "Perfect Flight!"
          : score > 70
          ? "Good Job!"
          : "Check your altitude constraints.",
    };

    console.log("Score calculated successfully:", score);
    res.json(result);
  } catch (error) {
    console.error("CRITICAL SCORING ERROR:", error);
    res.status(500).json({
      message: "Server error calculating score",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
