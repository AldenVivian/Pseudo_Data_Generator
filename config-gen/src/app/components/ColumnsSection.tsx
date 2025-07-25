import { ColumnsSectionProps, Column } from "@/types/types";

export default function ColumnsSection({
  setColumns,
  columns,
}: ColumnsSectionProps) {
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

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Columns ({columns.length})</h2>
        <button
          onClick={addColumn}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Column
        </button>
      </div>

      <div className="space-y-4">
        {columns.map((col, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
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
                  onChange={(e) => updateColumn(index, "name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Type
                </label>
                <select
                  value={col.dtype}
                  onChange={(e) => updateColumn(index, "dtype", e.target.value)}
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
                  onChange={(e) => updateColumn(index, "data", e.target.value)}
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
                    value={col.options.join(",")}
                    onChange={(e) =>
                      updateColumn(
                        index,
                        "options",
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
                    Weights (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="30,50,20"
                    value={col.weights.join(",")}
                    onChange={(e) =>
                      updateColumn(
                        index,
                        "weights",
                        e.target.value
                          .split(",")
                          .map((s) => parseInt(s.trim()))
                          .filter((n) => !isNaN(n))
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
        ))}
      </div>
    </div>
  );
}
