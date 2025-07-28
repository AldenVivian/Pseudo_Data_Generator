import React, { useEffect, useState } from "react";
import { ColumnsSectionProps, Column } from "@/types/types";

export default function ColumnsSection({
  setColumns,
  columns,
}: ColumnsSectionProps) {
  // Track which accordion sections are open
  const [openAccordions, setOpenAccordions] = useState<{
    [key: number]: boolean;
  }>({});

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        name: "",
        dtype: "str",
        data: "random",
        options: [],
        weights: [],
        optionWeightPairs: [{ option: "", weight: 1 }],
        faker_method: "name",
        value: [],
        range: [],
        operands: [],
      },
    ]);
  };
  useEffect(() => {
    console.log("columns > " + JSON.stringify(columns));
  }, [columns]);
  const updateColumn = (index: number, field: keyof Column, value: any) => {
    const newCols = [...columns];
    (newCols[index] as any)[field] = value;
    setColumns(newCols);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
    // Clean up accordion state for removed column
    const newOpenAccordions = { ...openAccordions };
    delete newOpenAccordions[index];
    setOpenAccordions(newOpenAccordions);
  };

  // Add a new option-weight pair
  const addOptionWeightPair = (columnIndex: number) => {
    const column = columns[columnIndex];
    const newPairs = [
      ...(column.optionWeightPairs || []),
      { option: "", weight: 1 },
    ];
    updateColumn(columnIndex, "optionWeightPairs", newPairs);
    updateOptionsAndWeights(columnIndex, newPairs);

    // Auto-open accordion when adding options
    setOpenAccordions((prev) => ({
      ...prev,
      [columnIndex]: true,
    }));
  };

  // Remove an option-weight pair
  const removeOptionWeightPair = (columnIndex: number, pairIndex: number) => {
    const column = columns[columnIndex];
    const newPairs = (column.optionWeightPairs || []).filter(
      (_, i) => i !== pairIndex
    );
    updateColumn(columnIndex, "optionWeightPairs", newPairs);
    updateOptionsAndWeights(columnIndex, newPairs);
  };

  // Update a specific option-weight pair
  const updateOptionWeightPair = (
    columnIndex: number,
    pairIndex: number,
    field: "option" | "weight",
    value: string | number
  ) => {
    const column = columns[columnIndex];
    const newPairs = [...(column.optionWeightPairs || [])];
    newPairs[pairIndex] = { ...newPairs[pairIndex], [field]: value };
    updateColumn(columnIndex, "optionWeightPairs", newPairs);
    updateOptionsAndWeights(columnIndex, newPairs);
  };

  // Keep the separate options and weights arrays in sync for backend
  const updateOptionsAndWeights = (
    columnIndex: number,
    pairs: Array<{ option: string; weight: number }>
  ) => {
    const options = pairs.map((p) => p.option).filter(Boolean);
    const weights = pairs.map((p) => p.weight);
    updateColumn(columnIndex, "options", options);
    updateColumn(columnIndex, "weights", weights);
  };

  // Toggle accordion state
  const toggleAccordion = (columnIndex: number) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [columnIndex]: !prev[columnIndex],
    }));
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Columns ({columns.length})</h2>
          <p className="text-sm text-gray-600">
            Define the structure and data generation rules for your dataset
          </p>
        </div>
        <button
          onClick={addColumn}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Column
        </button>
      </div>

      <div className="space-y-4">
        {columns.map((col, index) => {
          const isOpen = openAccordions[index] || false;
          const optionCount = col.optionWeightPairs?.length || 0;
          const totalWeight = col.weights?.reduce((a, b) => a + b, 0) || 0;
          const hasOptions = col.data === "random";

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">
                  {col.name || `Column ${index + 1}`}
                </h3>
                <button
                  onClick={() => removeColumn(index)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Column Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., customer_name, product_id"
                    value={col.name}
                    onChange={(e) =>
                      updateColumn(index, "name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Type
                  </label>
                  <select
                    value={col.dtype}
                    onChange={(e) =>
                      updateColumn(index, "dtype", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="str">String</option>
                    <option value="int">Integer</option>
                    <option value="float">Float</option>
                    <option value="decimal">Decimal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Source
                  </label>
                  <select
                    value={col.data}
                    onChange={(e) => {
                      updateColumn(index, "data", e.target.value);
                      // Auto-open accordion when switching to random
                      if (e.target.value === "random") {
                        setOpenAccordions((prev) => ({
                          ...prev,
                          [index]: true,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="random">Random Selection</option>
                    <option value="faker">Faker Data</option>
                    <option value="company">Company ID</option>
                    <option value="increment">Increment</option>
                    <option value="reference">Reference</option>
                    <option value="reference_range">Reference Range</option>
                    <option value="reference_boolean">Reference Boolean</option>
                    <option value="reference_boolean2">
                      Reference Boolean 2
                    </option>
                    <option value="total">Total/Calculation</option>
                    <option value="discount">Discount</option>
                  </select>
                </div>
              </div>

              {/* Options & Weights Section for Random data */}
              {hasOptions && (
                <div className="mt-4">
                  {/* Clickable header that toggles */}
                  <div
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleAccordion(index)}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${
                          isOpen ? "rotate-90" : "rotate-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Options & Weights
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Summary when collapsed */}
                      {!isOpen && optionCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {optionCount} option{optionCount !== 1 ? "s" : ""} •
                          total weight {totalWeight}
                        </span>
                      )}

                      {/* Add button - always visible */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent toggle when clicking add
                          addOptionWeightPair(index);
                        }}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="mt-3 space-y-2 pl-6">
                      {(
                        col.optionWeightPairs || [{ option: "", weight: 1 }]
                      ).map((pair, pairIndex) => (
                        <div
                          key={pairIndex}
                          className="flex gap-2 items-center"
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              value={pair.option}
                              onChange={(e) =>
                                updateOptionWeightPair(
                                  index,
                                  pairIndex,
                                  "option",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Option value (e.g., Red, Blue, Green)"
                            />
                          </div>
                          <div className="w-20">
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={pair.weight}
                              onChange={(e) =>
                                updateOptionWeightPair(
                                  index,
                                  pairIndex,
                                  "weight",
                                  parseFloat(e.target.value) || 1
                                )
                              }
                              className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="Weight"
                            />
                          </div>
                          {(col.optionWeightPairs?.length || 0) > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeOptionWeightPair(index, pairIndex)
                              }
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="mt-2 text-xs text-gray-500">
                        💡 Higher weights = more likely to be selected. Example:
                        Weight 50 is 5x more likely than weight 10.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Other data source fields */}
              {col.data === "faker" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faker Method
                  </label>
                  <input
                    type="text"
                    placeholder="name, email, address, etc."
                    value={col.faker_method}
                    onChange={(e) =>
                      updateColumn(index, "faker_method", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {col.data === "reference" && (
                <>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Column Number
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={col.cols || ""}
                      onChange={(e) =>
                        updateColumn(index, "cols", Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Source Values (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Alice_Smith,Bob_Johnson,Carol_Brown"
                        value={col.value.join(",")}
                        onChange={(e) =>
                          updateColumn(
                            index,
                            "value",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mapped Values (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Manager_A,Manager_B,Manager_C"
                        value={col.range.join(",")}
                        onChange={(e) =>
                          updateColumn(
                            index,
                            "range",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {col.data === "increment" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Value
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={col.start || ""}
                      onChange={(e) =>
                        updateColumn(index, "start", Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interval
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={col.interval || ""}
                      onChange={(e) =>
                        updateColumn(index, "interval", Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {(col.data.includes("reference") || col.data === "discount") &&
                col.data !== "reference" && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Column Number
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={col.cols || ""}
                      onChange={(e) =>
                        updateColumn(index, "cols", Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {columns.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No columns defined yet.</p>
          <p className="text-sm">
            Start by adding columns to define your dataset structure.
          </p>
        </div>
      )}
    </div>
  );
}
