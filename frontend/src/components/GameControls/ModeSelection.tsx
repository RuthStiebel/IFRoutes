import type { IChart, IGameMode } from "../../types/types";

interface ModeSelectionProps {
  selectedChart: IChart;
  gameMode: IGameMode;
  handleSelectMode: (modeType: "fixes" | "alts") => void;
  startGame: () => void;
  resetGame: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({
  selectedChart,
  gameMode,
  handleSelectMode,
  startGame,
  resetGame,
}) => (
  <>
    <h3 className="text-xl font-bold mb-4 text-gray-700">
      Step 2: Choose Your Learning Mode for "{selectedChart.name}"
    </h3>
    <div className="mb-6 space-y-4">
      {/* Guess Fixes Checkbox */}
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          id="guessFixes"
          checked={gameMode.guessFixes}
          onChange={() => handleSelectMode("fixes")}
          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label
          htmlFor="guessFixes"
          className="text-lg font-medium text-gray-700"
        >
          Guess **Fix Names**
          <p className="text-sm text-gray-500">
            The map will only show the altitude restrictions.
          </p>
        </label>
      </div>
      {/* Guess Altitudes Checkbox */}
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          id="guessAlts"
          checked={gameMode.guessAlts}
          onChange={() => handleSelectMode("alts")}
          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label
          htmlFor="guessAlts"
          className="text-lg font-medium text-gray-700"
        >
          Guess **Altitudes**
          <p className="text-sm text-gray-500">
            The map will only show the fix names.
          </p>
        </label>
      </div>
    </div>
    <button
      onClick={startGame}
      className={`w-full md:w-auto px-6 py-3 rounded-lg text-white font-semibold transition duration-150 
        ${
          gameMode.guessFixes || gameMode.guessAlts
            ? "bg-indigo-600 hover:bg-indigo-700 shadow-md"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      disabled={!gameMode.guessFixes && !gameMode.guessAlts}
    >
      Start Game
    </button>
    <button
      onClick={resetGame}
      className="ml-4 px-4 py-3 text-gray-600 hover:text-red-500 transition duration-150"
    >
      Change Chart
    </button>
  </>
);
