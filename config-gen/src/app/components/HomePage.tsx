"use client";
import { useState } from "react";

interface ColumnConfig {
  name: string;
  dtype: string;
  data: string;
  options: string;
  weights: string;
  cols: number;
  operation: string;
  operands: string;
  condition: string;
  faker_method: string;
}

export default function IniRuleBuilder() {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);

  const addColumn = () => {
    setColumns([
      ...columns,
      {
        name: "",
        dtype: "str",
        data: "random",
        options: "",
        weights: "",
        cols: 0,
        operation: "",
        operands: "",
        condition: "",
        faker_method: "name",
      },
    ]);
  };

  const updateColumn = (index: number, key: keyof ColumnConfig, value: any) => {
    const updated = [...columns];
    updated[index][key] = value;
    setColumns(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rules.ini Column Builder</h1>

      {columns.map((col, i) => (
        <div key={i} className="border rounded-md p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Column Name</label>
              <input
                className="w-full border px-3 py-1 rounded"
                value={col.name}
                onChange={(e) => updateColumn(i, "name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Data Type</label>
              <select
                className="w-full border px-3 py-1 rounded"
                value={col.dtype}
                onChange={(e) => updateColumn(i, "dtype", e.target.value)}
              >
                <option value="str">String</option>
                <option value="int">Integer</option>
                <option value="decimal">Decimal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Data Source</label>
              <select
                className="w-full border px-3 py-1 rounded"
                value={col.data}
                onChange={(e) => updateColumn(i, "data", e.target.value)}
              >
                <option value="random">Random</option>
                <option value="company">Company</option>
                <option value="faker">Faker</option>
                <option value="reference">Reference</option>
                <option value="reference_range">Reference Range</option>
                <option value="reference_boolean">Reference Boolean</option>
                <option value="reference_boolean2">Reference Boolean 2</option>
                <option value="total">Total</option>
                <option value="discount">Discount</option>
              </select>
            </div>

            {col.data === "random" && (
              <>
                <div>
                  <label className="block text-sm font-medium">
                    Options (comma-separated)
                  </label>
                  <input
                    className="w-full border px-3 py-1 rounded"
                    value={col.options}
                    onChange={(e) => updateColumn(i, "options", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Weights (comma-separated)
                  </label>
                  <input
                    className="w-full border px-3 py-1 rounded"
                    value={col.weights}
                    onChange={(e) => updateColumn(i, "weights", e.target.value)}
                  />
                </div>
              </>
            )}

            {col.data === "faker" && (
              <div>
                <label className="block text-sm font-medium">
                  Faker Method
                </label>
                <input
                  className="w-full border px-3 py-1 rounded"
                  value={col.faker_method}
                  onChange={(e) =>
                    updateColumn(i, "faker_method", e.target.value)
                  }
                />
              </div>
            )}

            {[
              "reference",
              "reference_range",
              "reference_boolean",
              "reference_boolean2",
              "discount",
            ].includes(col.data) && (
              <div>
                <label className="block text-sm font-medium">
                  Reference Column #
                </label>
                <input
                  type="number"
                  className="w-full border px-3 py-1 rounded"
                  value={col.cols}
                  onChange={(e) =>
                    updateColumn(i, "cols", parseInt(e.target.value))
                  }
                />
              </div>
            )}

            {["total", "discount"].includes(col.data) && (
              <div>
                <label className="block text-sm font-medium">Operation</label>
                <input
                  className="w-full border px-3 py-1 rounded"
                  value={col.operation}
                  onChange={(e) => updateColumn(i, "operation", e.target.value)}
                />
              </div>
            )}

            {col.data === "total" && (
              <div>
                <label className="block text-sm font-medium">
                  Operands (e.g., c8,c9)
                </label>
                <input
                  className="w-full border px-3 py-1 rounded"
                  value={col.operands}
                  onChange={(e) => updateColumn(i, "operands", e.target.value)}
                />
              </div>
            )}

            {["reference_boolean", "reference_boolean2"].includes(col.data) && (
              <div>
                <label className="block text-sm font-medium">Condition</label>
                <input
                  className="w-full border px-3 py-1 rounded"
                  value={col.condition}
                  onChange={(e) => updateColumn(i, "condition", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={addColumn}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + Add Column
        </button>

        <button
          onClick={() => console.log(columns)}
          className="px-4 py-2 rounded bg-gray-200 text-black hover:bg-gray-300"
        >
          Debug Print Config
        </button>
      </div>
    </div>
  );
}
