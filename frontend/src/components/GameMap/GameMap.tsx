import type { IChart, IGameMode } from "../../types/types";

interface GameMapProps {
  chart: IChart;
  gameMode: IGameMode;
  userGuesses: Record<string, string>;
  handleGuessChange: (
    fixName: string,
    field: "fix" | "alt",
    value: string
  ) => void;
  feedback: Record<string, "correct" | "incorrect" | "">;
  step: 3 | 4;
  zoom: number;
  pan: { x: number; y: number };
  handleWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  isPanning: boolean;
}

export const GameMap: React.FC<GameMapProps> = ({
  chart,
  gameMode,
  userGuesses,
  handleGuessChange,
  feedback,
  step,
  zoom,
  pan,
  handleWheel,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  isPanning,
}) => {
  const fixNameKey = "fix_name"; // Use fix_name as per model definition

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className="relative border-4 border-gray-200 rounded-lg shadow-xl bg-gray-100 overflow-hidden cursor-grab"
        style={{
          width: "800px",
          height: "1200px",
          transform: `scale(${1 / zoom})`,
        }}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
              pan.y / zoom
            }px)`,
            width: "100%",
            height: "100%",
            cursor: zoom > 1.0 ? (isPanning ? "grabbing" : "grab") : "default",
            transition: isPanning ? "none" : "transform 0.15s ease-out",
          }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Background Map Image: SOURCE IS chart.map_url */}
          <img
            src={chart.map_url}
            alt={chart.name}
            className="w-full h-full object-cover rounded-lg opacity-30 pointer-events-none"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src =
                "https://placehold.co/800x1200/404040/ffffff?text=Map+Not+Found+-+Check+MongoDB+URL"; // Updated placeholder message
              console.error(
                "Map image failed to load. Check chart.map_url field in MongoDB for direct image link."
              );
              console.log("chart.map_url:", chart.map_url);
            }}
          />

          {/* Fixes and Input Boxes */}
          <div className="absolute inset-0 pointer-events-none">
            {chart.fixes.map((fix) => {
              const isGuessingFix = gameMode.guessFixes;
              const isGuessingAlt = gameMode.guessAlts;
              const fixName = fix[fixNameKey];
              const guessKeyFix = `${fixName}-fix`;
              const guessKeyAlt = `${fixName}-alt`;

              return (
                <div
                  key={fixName}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 p-2 bg-white/70 backdrop-blur-sm rounded-md border border-indigo-500/50 flex flex-col items-center min-w-[100px] pointer-events-auto shadow-lg"
                  style={{
                    left: `${(fix.x / 800) * 100}%`,
                    top: `${(fix.y / 1200) * 100}%`,
                  }}
                >
                  {/* FIX NAME DISPLAY / INPUT */}
                  {isGuessingFix ? (
                    <input
                      type="text"
                      placeholder="FIX NAME"
                      value={userGuesses[guessKeyFix] || ""}
                      onChange={(e) =>
                        handleGuessChange(fixName, "fix", e.target.value)
                      }
                      className={`text-center font-bold text-sm p-1 mb-1 border-2 w-full rounded-sm transition-colors 
                        ${
                          step === 4
                            ? feedback[guessKeyFix] === "correct"
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                    />
                  ) : (
                    <p className="font-bold text-sm text-indigo-800 mb-1">
                      {fixName}
                    </p>
                  )}

                  {/* ALTITUDE DISPLAY / INPUT */}
                  {isGuessingAlt ? (
                    <input
                      type="text"
                      placeholder="ALTITUDE"
                      value={userGuesses[guessKeyAlt] || ""}
                      onChange={(e) =>
                        handleGuessChange(fixName, "alt", e.target.value)
                      }
                      className={`text-center text-xs p-1 border-2 w-full rounded-sm transition-colors
                        ${
                          step === 4
                            ? feedback[guessKeyAlt] === "correct"
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                    />
                  ) : (
                    <p className="text-xs text-gray-700">{fix.min_alt}</p>
                  )}
                  {step === 4 && (
                    <p className="text-[10px] text-red-700 mt-1">
                      {feedback[guessKeyFix] === "incorrect" &&
                        `Fix: ${fixName}`}
                      {feedback[guessKeyAlt] === "incorrect" &&
                        ` Alt: ${fix.min_alt}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        Use the **mouse wheel** to zoom (1x to 3x). Click and drag to pan when
        zoomed in.
      </div>
    </div>
  );
};
