import type { IChart } from "../../types/types";

interface GameInfoControlsProps {
  step: 3 | 4;
  selectedChart: IChart;
  score: number | null;
  checkAnswer: () => void;
  resetGame: () => void;
}

export const GameInfoAndControls: React.FC<GameInfoControlsProps> = ({
  step,
  selectedChart,
  score,
  checkAnswer,
  resetGame,
}) => {
  // --- Render Step 3/4 Controls ---
  const renderControls = () => {
    if (step === 3) {
      return (
        <button
          onClick={checkAnswer}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-150"
        >
          Submit Answers & Check Score
        </button>
      );
    }
    if (step === 4) {
      return (
        <div className="space-x-4">
          <p className="text-2xl font-extrabold text-indigo-700">
            Score:{" "}
            <span
              className={
                score !== null && score >= 70
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {score?.toFixed(0)}%
            </span>
          </p>
          <button
            onClick={resetGame}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-150"
          >
            Start New Game
          </button>
          <button
            onClick={() => checkAnswer()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-150"
          >
            Review Map
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="lg:w-1/2 flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
        Learning Mode: {selectedChart.name}
      </h2>
      {/* Instructions/Review Box */}
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md">
        <p className="font-semibold">Instructions:</p>
        <p className="text-sm">
          Type your answers in the boxes on the map. Case/space doesn't matter
          for fixes, but the altitude numbers must match exactly (e.g., '5 000'
          vs '5000').
        </p>
        {step === 4 && (
          <p className="mt-2 font-semibold">
            Review: Green is Correct, Red is Incorrect (Correct answer shown
            below the box).
          </p>
        )}
      </div>
      {/* Buttons */}
      <div className="mt-6 flex justify-center lg:justify-start">
        {renderControls()}
      </div>
      <button
        onClick={resetGame}
        className="mt-4 px-4 py-2 text-gray-600 hover:text-indigo-700 transition duration-150 border rounded-lg"
      >
        &larr; Change Chart
      </button>
    </div>
  );
};
