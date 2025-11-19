import { Router } from "express";
import { getChartsByAirport } from "../controllers/chartsController";

const router = Router();

// GET /api/charts/LLBG (Frontend uses this endpoint)
router.get("/charts/:airportId", getChartsByAirport);

export default router;
