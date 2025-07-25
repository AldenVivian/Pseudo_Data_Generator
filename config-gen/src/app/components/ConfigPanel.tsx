import { ConfigPanelProps } from "@/types/types";

export default function ConfigPanel({
  numRecords,
  setNumRecords,
  mode,
  setMode,
}: ConfigPanelProps) {
    
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-4">Dataset Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Records
          </label>
          <input
            type="number"
            value={numRecords}
            onChange={(e) => setNumRecords(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generation Mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Base columns only</option>
            <option value={2}>Base + append rules</option>
            <option value={3}>Full (with reordering)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
