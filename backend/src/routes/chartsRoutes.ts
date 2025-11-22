import { Router } from "express";
import { getChartsByAirport } from "../controllers/chartsController";
import { calculateScore } from "../controllers/scoreController";

const router = Router();

// GET
router.get("/charts/:airportId", getChartsByAirport);

// POST /api/score
router.post("/score", calculateScore);

export default router;
