import type { IChart } from "../../types/types";

interface ChartSelectionProps {
  chartList: IChart[];
  handleSelectChart: (chart: IChart) => void;
  error: string | null;
}

export const ChartSelection: React.FC<ChartSelectionProps> = ({
  chartList,
  handleSelectChart,
  error,
}) => (
  <>
    <h3 className="text-xl font-bold mb-4 text-gray-700">
      Step 1: Select a Chart (SID/STAR) for LLBG
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {chartList.length === 0 && error ? (
        <p className="text-xl text-red-600 col-span-3 p-4 border rounded-lg bg-red-50">
          {error}
        </p>
      ) : (
        chartList.map((chart) => (
          <button
            key={chart._id}
            onClick={() => handleSelectChart(chart)}
            className={`p-4 border rounded-lg shadow-md transition duration-150 text-left 
                bg-white border-indigo-300 hover:bg-indigo-50`}
          >
            <p className="font-semibold text-indigo-700">{chart.name}</p>
            <p className="text-sm text-green-600">Data Ready ({chart.type})</p>
          </button>
        ))
      )}
    </div>
  </>
);
