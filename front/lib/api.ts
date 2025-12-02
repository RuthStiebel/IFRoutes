import { API_URL, AIRPORT_ID, PracticeMode } from "./globals";

export interface ChartData {
  _id: string;
  airport_id: string;
  name: string;
  type: string;
  map_url: string;
  map_url_no_alt: string; // No Altitudes
  map_url_no_fix: string; // No Fix Names
  map_url_clean: string; // No Fixes or Altitudes (Line only)
  fixes: {
    id: string;
    name: string;
    max_alt: string;
    min_alt: string;
    x: number;
    y: number;
  }[];
}

export interface Waypoint {
  id: string;
  name: string;
  minAltitude: string;
  maxAltitude: string;
  x: number;
  y: number;
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

export async function submitRoute(
  mapId: string,
  waypoints: any[],
  practiceMode: PracticeMode
): Promise<any> {
  try {
    const res = await fetch(`${API_URL}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mapId, waypoints, practiceMode }),
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
