import React, { useState, useEffect, useCallback } from "react";
import { ChartSelection } from "./components/GameControls/ChartSelection";
import { ModeSelection } from "./components/GameControls/ModeSelection";
import { GameMap } from "./components/GameMap/GameMap";
import type { IChart, IGameMode } from "./types/types";
import { apiService } from "./api/apiService";
import { GameInfoAndControls } from "./components/GameControls/GameInfoAndControls";
import { API_BASE_URL } from "./config";

const App: React.FC = () => {
  // --- State Variables ---
  const [chartList, setChartList] = useState<IChart[]>([]);
  const [selectedAirport] = useState<string>("LLBG");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedChart, setSelectedChart] = useState<IChart | null>(null);
  const [gameMode, setGameMode] = useState<IGameMode>({
    guessFixes: false,
    guessAlts: false,
  });
  const [userGuesses, setUserGuesses] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<
    Record<string, "correct" | "incorrect" | "">
  >({});
  const [error, setError] = useState<string | null>(null);

  // --- Zoom/Pan State (useZoomPan hook equivalent) ---
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // --- Utility Functions ---

  const resetZoomPan = useCallback(() => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setIsPanning(false);
    setStartPan({ x: 0, y: 0 });
  }, []);

  // --- API and Data Fetching Logic ---
  const fetchAllCharts = useCallback(async () => {
    try {
      setError(null);
      // Calls the external Node.js API endpoint
      const charts = await apiService.fetchCharts(selectedAirport);

      if (charts.length === 0) {
        setError(
          `No charts found for airport ${selectedAirport}. Please check your Node.js API and MongoDB connection.`
        );
      }

      setChartList(charts);
    } catch (e: unknown) {
      // Changed type to unknown
      console.error("Error fetching all charts:", e);
      let errorMessage = "Unknown API Error.";
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(
        `Failed to load charts. Ensure the Node.js backend is running at ${API_BASE_URL} and the database has data. (Error: ${errorMessage})`
      );
    }
  }, [selectedAirport]);

  useEffect(() => {
    fetchAllCharts();
  }, [fetchAllCharts]);

  // --- Game Logic Handlers ---

  const handleSelectChart = (chart: IChart) => {
    setSelectedChart(chart);
    setUserGuesses({});
    setFeedback({});
    setScore(null);
    resetZoomPan();
    setStep(2);
  };

  const handleSelectMode = (modeType: "fixes" | "alts") => {
    setGameMode((prev) => {
      const newMode = { ...prev };
      if (modeType === "fixes") {
        newMode.guessFixes = !newMode.guessFixes;
      } else if (modeType === "alts") {
        newMode.guessAlts = !newMode.guessAlts;
      }
      return newMode;
    });
  };

  const startGame = () => {
    if (!gameMode.guessFixes && !gameMode.guessAlts) {
      console.warn(
        "Please select at least one item to guess (Fix Names or Altitudes)."
      );
      return;
    }
    const initialGuesses: Record<string, string> = {};
    selectedChart!.fixes.forEach((fix) => {
      const fixName = fix.fix_name;
      if (gameMode.guessFixes) {
        initialGuesses[`${fixName}-fix`] = "";
      }
      if (gameMode.guessAlts) {
        initialGuesses[`${fixName}-alt`] = "";
      }
    });
    setUserGuesses(initialGuesses);
    setStep(3);
  };

  const handleGuessChange = (
    fixName: string,
    field: "fix" | "alt",
    value: string
  ) => {
    setUserGuesses((prev) => ({
      ...prev,
      [`${fixName}-${field}`]: value,
    }));
  };

  const checkAnswer = () => {
    let correctCount = 0;
    let totalCount = 0;
    const newFeedback: Record<string, "correct" | "incorrect" | ""> = {};

    selectedChart!.fixes.forEach((fix) => {
      const fixName = fix.fix_name;
      const correctAlt = fix.min_alt.replace(/\s/g, "");

      if (gameMode.guessFixes) {
        totalCount++;
        const userFix =
          userGuesses[`${fixName}-fix`]?.toUpperCase().trim() || "";
        const isCorrect = userFix === fixName.toUpperCase();
        newFeedback[`${fixName}-fix`] = isCorrect ? "correct" : "incorrect";
        if (isCorrect) correctCount++;
      }

      if (gameMode.guessAlts) {
        totalCount++;
        const userAlt =
          userGuesses[`${fixName}-alt`]?.replace(/\s/g, "").trim() || "";
        const isCorrect = userAlt === correctAlt;
        newFeedback[`${fixName}-alt`] = isCorrect ? "correct" : "incorrect";
        if (isCorrect) correctCount++;
      }
    });

    setFeedback(newFeedback);
    setScore(totalCount > 0 ? (correctCount / totalCount) * 100 : 0);
    setStep(4);
  };

  const resetGame = () => {
    setStep(1);
    setSelectedChart(null);
    setScore(null);
    setFeedback({});
    setGameMode({ guessFixes: false, guessAlts: false });
    resetZoomPan();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom > 1.0) {
      setIsPanning(true);
      setStartPan({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning || zoom === 1.0) return;

    const newPanX = e.clientX - startPan.x;
    const newPanY = e.clientY - startPan.y;

    const maxPanX = (800 * zoom - 800) / 2;
    const maxPanY = (1200 * zoom - 1200) / 2;

    const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, newPanX));
    const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, newPanY));

    setPan({ x: clampedPanX, y: clampedPanY });
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleFactor = 0.1;
    let newZoom = zoom;

    if (e.deltaY < 0) {
      newZoom = Math.min(3.0, zoom + scaleFactor);
    } else {
      newZoom = Math.max(1.0, zoom - scaleFactor);
    }
    setZoom(newZoom);

    if (newZoom === 1.0) {
      setPan({ x: 0, y: 0 });
    }
  };

  // --- Main Render ---

  // Show Loading or Error Message
  if (step === 1 && chartList.length === 0 && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
        <h1 className="text-3xl font-extrabold text-indigo-800 mb-4">
          Aviation Procedure Memory Trainer
        </h1>
        <p className="text-xl text-gray-600">
          Connecting to backend at {API_BASE_URL}/charts/{selectedAirport}...
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mt-4"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-2">
          Aviation Procedure Memory Trainer
        </h1>

        <div className="mt-8">
          {/* STEP 1: Chart Selection */}
          {step === 1 && (
            <ChartSelection
              chartList={chartList}
              handleSelectChart={handleSelectChart}
              error={error}
            />
          )}

          {/* STEP 2: Mode Selection */}
          {step === 2 && selectedChart && (
            <ModeSelection
              selectedChart={selectedChart}
              gameMode={gameMode}
              handleSelectMode={handleSelectMode}
              startGame={startGame}
              resetGame={resetGame}
            />
          )}

          {/* STEP 3 & 4: Game Map and Controls */}
          {(step === 3 || step === 4) && selectedChart && (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2 flex justify-center">
                <GameMap
                  chart={selectedChart}
                  gameMode={gameMode}
                  userGuesses={userGuesses}
                  handleGuessChange={handleGuessChange}
                  feedback={feedback}
                  step={step}
                  zoom={zoom}
                  pan={pan}
                  handleWheel={handleWheel}
                  handlePointerDown={handlePointerDown}
                  handlePointerMove={handlePointerMove}
                  handlePointerUp={handlePointerUp}
                  isPanning={isPanning}
                />
              </div>
              <GameInfoAndControls
                step={step}
                selectedChart={selectedChart}
                score={score}
                checkAnswer={checkAnswer}
                resetGame={resetGame}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
