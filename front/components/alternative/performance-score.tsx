"use client"

interface PerformanceScoreProps {
  routeSubmitted: boolean
  waypointCount: number
}

export default function PerformanceScore({ routeSubmitted, waypointCount }: PerformanceScoreProps) {
  // Simulated scoring logic
  const calculateScore = () => {
    if (!routeSubmitted || waypointCount === 0) return null
    // Mock score calculation
    const baseScore = Math.max(0, 100 - waypointCount * 5)
    return Math.round((baseScore * (75 + Math.random() * 25)) / 100)
  }

  const score = calculateScore()

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span className="text-yellow-500">⭐</span> Performance Score
      </h3>

      {!routeSubmitted ? (
        <div className="text-center py-6">
          <div className="text-3xl font-bold text-muted-foreground mb-2">--</div>
          <p className="text-sm text-muted-foreground">Route not submitted.</p>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
          <p className="text-xs text-muted-foreground">Score calculated</p>
          <div className="mt-3 text-xs text-red-500">
            <p>
              <strong>Note:</strong> Scoring is simulated as the application cannot read the actual chart data.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
