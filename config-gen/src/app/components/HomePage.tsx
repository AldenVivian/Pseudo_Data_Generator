"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Column {
  name: string;
  dtype: "str" | "int" | "float" | "decimal";
  data: string;
  options: string[];
  weights: number[];
  faker_method: string;
  cols?: number;
  value: string[];
  range: string[];
  condition?: string;
  operation?: string;
  operands: string[];
  start?: number;
  interval?: number;
}

interface AppendRule {
  operation: "replace" | "generate";
  cols?: number;
  col_name?: string;
  find?: string;
  replace?: string;
  new_col?: string;
  data?: string;
  options: string[];
  weights: number[];
  faker_method: string;
  nullable: number;
}

interface PreviewData {
  preview_data: any[];
  columns: string[];
  shape: [number, number];
  message: string;
  error?: string;
}

export default function HomePage() {
  const [numRecords, setNumRecords] = useState(100);
  const [mode, setMode] = useState(1);
  const [columns, setColumns] = useState<Column[]>([]);
  const [appendRules, setAppendRules] = useState<AppendRule[]>([]);
  const [reorder, setReorder] = useState<number[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-update preview when configuration changes
  useEffect(() => {
    if (showPreview && columns.length > 0) {
      handlePreview();
    }
  }, [columns, appendRules, numRecords, mode, showPreview]);

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        name: "",
        dtype: "str",
        data: "random",
        options: [],
        weights: [],
        faker_method: "name",
        value: [],
        range: [],
        operands: [],
      },
    ]);
  };

  const updateColumn = (index: number, field: keyof Column, value: any) => {
    const newCols = [...columns];
    (newCols[index] as any)[field] = value;
    setColumns(newCols);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const addAppendRule = () => {
    setAppendRules([
      ...appendRules,
      {
        operation: "replace",
        options: [],
        weights: [],
        faker_method: "name",
        nullable: 0,
      },
    ]);
  };

  const updateAppendRule = (
    index: number,
    field: keyof AppendRule,
    value: any
  ) => {
    const newRules = [...appendRules];
    (newRules[index] as any)[field] = value;
    setAppendRules(newRules);
  };

  const removeAppendRule = (index: number) => {
    setAppendRules(appendRules.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const payload = {
      num_records: numRecords,
      mode,
      columns,
      append_rules: appendRules,
      reorder,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/generate-ini",
        payload,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rules.ini";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to generate rules.ini file");
    }
  };

  const handlePreview = async () => {
    setIsLoadingPreview(true);
    const payload = {
      num_records: Math.min(numRecords, 25),
      mode,
      columns,
      append_rules: appendRules,
      reorder,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/preview-data",
        payload
      );

      setPreviewData(response.data);
    } catch (err) {
      console.error("Error:", err);
      setPreviewData({
        preview_data: [],
        columns: [],
        shape: [0, 0],
        message: "Error generating preview",
        error: "Failed to connect to server",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (!showPreview) {
      handlePreview();
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Pseudo Data Generator
      </h1>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Configuration Panel */}
        <div className="flex-1 min-w-0">
          {/* Basic Settings */}
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

          {/* Columns Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Columns</h2>
              <button
                onClick={addColumn}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Column
              </button>
            </div>

            <div className="space-y-4">
              {columns.map((col, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Column {index + 1}</h3>
                    <button
                      onClick={() => removeColumn(index)}
                      className="text-red-500 hover:text-red-700"
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
                        placeholder="Enter column name"
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
                        onChange={(e) =>
                          updateColumn(index, "data", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="random">Random Selection</option>
                        <option value="faker">Faker Data</option>
                        <option value="company">Company ID</option>
                        <option value="increment">Increment</option>
                        <option value="reference">Reference</option>
                        <option value="reference_range">Reference Range</option>
                        <option value="reference_boolean">
                          Reference Boolean
                        </option>
                        <option value="reference_boolean2">
                          Reference Boolean 2
                        </option>
                        <option value="total">Total/Calculation</option>
                        <option value="discount">Discount</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional Fields */}
                  {col.data === "random" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options (comma-separated)
                        </label>
                        <input
                          type="text"
                          placeholder="Red,Green,Blue"
                          onChange={(e) =>
                            updateColumn(
                              index,
                              "options",
                              e.target.value.split(",").map((s) => s.trim())
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weights (comma-separated)
                        </label>
                        <input
                          type="text"
                          placeholder="30,50,20"
                          onChange={(e) =>
                            updateColumn(
                              index,
                              "weights",
                              e.target.value.split(",").map(Number)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

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
                            updateColumn(
                              index,
                              "interval",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
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
                            onChange={(e) =>
                              updateColumn(
                                index,
                                "value",
                                e.target.value.split(",").map((s) => s.trim())
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
                            onChange={(e) =>
                              updateColumn(
                                index,
                                "range",
                                e.target.value.split(",").map((s) => s.trim())
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Append Rules Section */}
          {mode >= 2 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Append Rules</h2>
                <button
                  onClick={addAppendRule}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  Add Rule
                </button>
              </div>

              <div className="space-y-4">
                {appendRules.map((rule, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Rule {index + 1}</h3>
                      <button
                        onClick={() => removeAppendRule(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Operation
                        </label>
                        <select
                          value={rule.operation}
                          onChange={(e) =>
                            updateAppendRule(index, "operation", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="replace">Replace Value</option>
                          <option value="generate">Generate New Column</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={togglePreview}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                showPreview
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }`}
            >
              {showPreview ? "❌ Hide Preview" : "🔍 Show Preview"}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
            >
              🚀 Generate rules.ini
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="xl:w-1/2 xl:max-w-2xl">
            <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Live Preview</h2>
                {isLoadingPreview && (
                  <div className="text-blue-500">Loading...</div>
                )}
              </div>

              {previewData && (
                <div className="bg-white rounded-lg p-4 max-h-96 overflow-auto">
                  {previewData.error ? (
                    <div className="text-red-500 p-4 text-center">
                      <p className="font-medium">Error</p>
                      <p className="text-sm">{previewData.error}</p>
                    </div>
                  ) : previewData.preview_data.length === 0 ? (
                    <div className="text-gray-500 p-4 text-center">
                      <p>{previewData.message}</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 text-sm text-gray-600">
                        {previewData.message} • {previewData.shape[0]} rows ×{" "}
                        {previewData.shape[1]} columns
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {previewData.columns.map((col, index) => (
                                <th
                                  key={index}
                                  className="text-left p-2 font-medium bg-gray-50"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.preview_data.map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className="border-b hover:bg-gray-50"
                              >
                                {previewData.columns.map((col, colIndex) => (
                                  <td key={colIndex} className="p-2 border-r">
                                    {row[col] === null ? (
                                      <span className="text-gray-400 italic">
                                        null
                                      </span>
                                    ) : (
                                      String(row[col])
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
