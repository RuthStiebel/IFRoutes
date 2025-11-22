import { API_URL, AIRPORT_ID } from "./globals";

export interface ChartData {
  _id: string;
  airport_id: string;
  name: string;
  type: string;
  map_url: string;
  fixes?: any[];
}

export async function getMaps(
  airportId: string = AIRPORT_ID
): Promise<ChartData[]> {
  try {
    const res = await fetch(`${API_URL}/charts/${airportId}`);

    if (!res.ok) {
      throw new Error(`Backend error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

export async function submitRoute(mapId: string, waypoints: any[]) {
  try {
    const res = await fetch(`${API_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mapId, waypoints }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Backend Error Details:", errorData);
      throw new Error(
        errorData.message || `Failed to submit route: ${res.status}`
      );
    }

    return await res.json();
  } catch (error) {
    console.error("Submit Route Failed:", error);
    throw error;
  }
}
