import axios from "axios";
import type { IChart } from "../types/types";
import { API_BASE_URL } from "../config";

export const apiService = {
  // Fetches all charts for a given airport (e.g., 'LLBG')
  fetchCharts: async (airportId: string): Promise<IChart[]> => {
    try {
      // The API endpoint should be running at http://localhost:5000/api/charts/LLBG
      const response = await axios.get(`${API_BASE_URL}/charts/${airportId}`);
      // The Node.js controller sends back the merged array of charts
      return response.data as IChart[];
    } catch (error) {
      // Log the full error to help debug connection issues
      console.error(
        "Error fetching charts from API. Is the backend running?",
        error
      );
      return [];
    }
  },
};
