"use client";

import { useState, useEffect } from "react";
import { Column, AppendRule } from "@/types/types";

interface ReorderSectionProps {
  columns: Column[];
  appendRules: AppendRule[];
  reorder: number[];
  setReorder: (reorder: number[]) => void;
}

export default function ReorderSection({
  columns,
  appendRules,
  reorder,
  setReorder,
}: ReorderSectionProps) {
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);

  // Generate list of all available columns (base columns + append rule columns)
  useEffect(() => {
    const baseColumns = columns.map(
      (col, index) => `${index + 1}. ${col.name}`
    );
    const appendColumns = appendRules.map(
      (rule, index) =>
        `${columns.length + index + 1}. ${
          rule.name || `AppendRule_${index + 1}`
        }`
    );

    setAvailableColumns([...baseColumns, ...appendColumns]);
  }, [columns, appendRules]);

  // Initialize reorder array if empty
  useEffect(() => {
    if (reorder.length === 0 && availableColumns.length > 0) {
      // Default order: 1, 2, 3, ... (1-based indexing)
      const defaultOrder = Array.from(
        { length: availableColumns.length },
        (_, i) => i + 1
      );
      setReorder(defaultOrder);
    }
  }, [availableColumns, reorder, setReorder]);

  const handleReorderChange = (index: number, value: string) => {
    const newReorder = [...reorder];
    newReorder[index] = parseInt(value) || 1;
    setReorder(newReorder);
  };

  const addReorderItem = () => {
    setReorder([...reorder, 1]);
  };

  const removeReorderItem = (index: number) => {
    const newReorder = reorder.filter((_, i) => i !== index);
    setReorder(newReorder);
  };

  const resetToDefault = () => {
    const defaultOrder = Array.from(
      { length: availableColumns.length },
      (_, i) => i + 1
    );
    setReorder(defaultOrder);
  };

  return (
    <div className="bg-purple-50 p-4 rounded-lg mb-6 border border-purple-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-purple-800">
          🔄 Column Reordering (Mode 3)
        </h2>
        <button
          onClick={resetToDefault}
          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
        >
          Reset to Default Order
        </button>
      </div>

      <p className="text-sm text-purple-600 mb-4">
        Specify the final order of columns in the output. Use column numbers
        (1-based indexing).
      </p>

      {/* Available Columns Reference */}
      <div className="mb-4 p-3 bg-white rounded border">
        <h3 className="font-medium text-sm mb-2 text-gray-700">
          Available Columns:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 text-xs text-gray-600">
          {availableColumns.map((col, index) => (
            <div key={index} className="truncate">
              {col}
            </div>
          ))}
        </div>
      </div>

      {/* Reorder Configuration */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-purple-700">Column Order:</h3>
          <button
            onClick={addReorderItem}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
          >
            + Add Position
          </button>
        </div>

        {reorder.map((columnNumber, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-white rounded border"
          >
            <span className="text-sm font-medium text-gray-600 w-16">
              Pos {index + 1}:
            </span>

            <select
              value={columnNumber}
              onChange={(e) => handleReorderChange(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {availableColumns.map((_, colIndex) => (
                <option key={colIndex + 1} value={colIndex + 1}>
                  Column {colIndex + 1} -{" "}
                  {availableColumns[colIndex]?.split(". ")[1] ||
                    `Column_${colIndex + 1}`}
                </option>
              ))}
            </select>

            <button
              onClick={() => removeReorderItem(index)}
              className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}

        {reorder.length === 0 && (
          <div className="text-center py-4 text-gray-500 bg-white rounded border border-dashed">
            No reordering rules defined. Click &quot;Add Position&quot; to
            specify column order.
          </div>
        )}
      </div>

      {/* Preview of final order */}
      {reorder.length > 0 && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h3 className="font-medium text-sm mb-2 text-gray-700">
            Final Column Order Preview:
          </h3>
          <div className="text-sm text-gray-600">
            {reorder.map((colNum, index) => (
              <span key={index}>
                {availableColumns[colNum - 1]?.split(". ")[1] ||
                  `Column_${colNum}`}
                {index < reorder.length - 1 ? " → " : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
