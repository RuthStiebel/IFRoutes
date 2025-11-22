import { Request, Response } from "express";
import Chart, { IChart } from "../models/Chart";

// Fetch all charts (SIDs and STARs) for a specific airport
export const getChartsByAirport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { airportId } = req.params;
    const upperAirportId = airportId.toUpperCase();

    // 1. Fetch all charts for the airport ID
    const charts: IChart[] = await Chart.find({ airport_id: upperAirportId });

    if (charts.length === 0) {
      res
        .status(404)
        .json({ message: `No charts found for airport ${upperAirportId}.` });
      return;
    }

    // 2. Format the data for the frontend
    const formattedCharts = charts.map((chart) => ({
      _id: chart._id,
      airport_id: chart.airport_id,
      name: chart.name,
      type: chart.type,
      map_url: chart.map_url,
      map_url_no_alt: chart.map_url_no_alt,
      map_url_no_fix: chart.map_url_no_fix,
      map_url_clean: chart.map_url_clean,
      fixes: chart.fixes,
    }));

    // 3. Send the entire merged array back to the frontend
    res.status(200).json(formattedCharts);
  } catch (error) {
    console.error("Error in getChartsByAirport:", error);
    res.status(500).json({ message: "Internal Server Error fetching charts." });
  }
};
