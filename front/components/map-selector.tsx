"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { getMaps, type ChartData } from "../lib/api";

interface MapSelectorProps {
  onSelectMap: (chart: ChartData) => void;
  chartType: "SID" | "STAR";
  onBack: () => void;
}

export default function MapSelector({
  onSelectMap,
  chartType,
  onBack,
}: MapSelectorProps) {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true);
        const backendData = await getMaps("LLBG");

        // Filter by type
        const filteredData = backendData.filter((c) => c.type === chartType);

        setCharts(filteredData);
        setError(null);
      } catch (err) {
        console.error("Failed to load maps:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load maps. Check console for errors."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, [chartType]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading {chartType}s...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-destructive rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive mb-1">
              Unable to load maps
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={onBack}
              className="mt-4 text-sm underline hover:text-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">
          Select a {chartType === "SID" ? "Departure (SID)" : "Arrival (STAR)"}
        </h2>
      </div>

      {charts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">No {chartType} charts found.</p>
          <button
            onClick={onBack}
            className="mt-2 text-blue-500 hover:underline"
          >
            Go back
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {charts.map((chart) => (
            <button
              key={chart._id}
              onClick={() => onSelectMap(chart)}
              className="text-left group flex flex-col h-full"
            >
              <div className="bg-accent rounded-lg overflow-hidden mb-3 relative border border-border flex items-center justify-center h-64">
                <img
                  src={chart.map_url || "/placeholder.svg"}
                  alt={chart.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x600?text=No+Image";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="font-semibold group-hover:text-blue-500 transition px-1">
                {chart.name}
              </h3>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
