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

interface AppendRule {
  operation: string;
  cols: number;
  col_name?: string;
  find?: string;
  replace?: string;
  new_col?: string;
  data?: string;
  options?: string;
  weights?: string;
  faker_method?: string;
  nullable?: string;
}

interface ReorderRule {
  order: string;
}

export default function IniRuleBuilder() {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [appendRules, setAppendRules] = useState<AppendRule[]>([]);
  const [reorderRule, setReorderRule] = useState<ReorderRule>({ order: "" });

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

  const addAppendRule = () => {
    setAppendRules([
      ...appendRules,
      {
        operation: "replace",
        cols: 0,
        col_name: "",
        find: "",
        replace: "",
      },
    ]);
  };

  const updateColumn = (i: number, key: keyof ColumnConfig, value: any) => {
    const updated = [...columns];
    updated[i][key] = value;
    setColumns(updated);
  };

  const updateAppend = (i: number, key: keyof AppendRule, value: any) => {
    const updated = [...appendRules];
    updated[i][key] = value;
    setAppendRules(updated);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-sm">
      <h1 className="text-3xl font-semibold mb-6">Rules.ini Builder</h1>

      {/* RECS */}
      <section className="border rounded-md p-4">
        <h2 className="text-xl font-medium mb-2">[rec] Settings</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Total Records
            </label>
            <input
              type="number"
              className="w-full border rounded px-3 py-1"
              defaultValue={150}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Mode
            </label>
            <select className="w-full border rounded px-3 py-1">
              <option value={1}>1 - Generate</option>
              <option value={2}>2 - Append</option>
              <option value={3}>3 - Reorder</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Columns Declared
            </label>
            <input
              type="number"
              className="w-full border rounded px-3 py-1"
              defaultValue={columns.length}
              readOnly
            />
          </div>
        </div>
      </section>

      {/* COLUMNS */}
      <section className="border rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-medium">[cX] Column Rules</h2>
          <button
            onClick={addColumn}
            className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
          >
            + Add Column
          </button>
        </div>

        {columns.map((col, i) => (
          <div
            key={i}
            className="p-4 border rounded-md mb-4 grid grid-cols-2 gap-4 bg-gray-50"
          >
            <div className="col-span-2 flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Column ID: <span className="text-blue-600">c{i + 1}</span>
              </span>
              {col.name && (
                <span className="text-xs text-gray-500 italic">
                  ({col.name})
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Column Name
              </label>
              <input
                className="border px-3 py-1 rounded w-full"
                placeholder="e.g., product_name"
                value={col.name}
                onChange={(e) => updateColumn(i, "name", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Data Type
              </label>
              <select
                className="border px-3 py-1 rounded w-full"
                value={col.dtype}
                onChange={(e) => updateColumn(i, "dtype", e.target.value)}
              >
                <option value="str">String</option>
                <option value="int">Integer</option>
                <option value="decimal">Decimal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Data Source
              </label>
              <select
                className="border px-3 py-1 rounded w-full"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Options (comma-separated)
                  </label>
                  <input
                    className="border px-3 py-1 rounded w-full"
                    value={col.options}
                    onChange={(e) => updateColumn(i, "options", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Weights (comma-separated)
                  </label>
                  <input
                    className="border px-3 py-1 rounded w-full"
                    value={col.weights}
                    onChange={(e) => updateColumn(i, "weights", e.target.value)}
                  />
                </div>
              </>
            )}

            {col.data === "faker" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Faker Method
                </label>
                <input
                  className="border px-3 py-1 rounded w-full"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reference Column #
                </label>
                <input
                  type="number"
                  className="border px-3 py-1 rounded w-full"
                  value={col.cols}
                  onChange={(e) =>
                    updateColumn(i, "cols", parseInt(e.target.value))
                  }
                />
              </div>
            )}

            {["total", "discount"].includes(col.data) && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Operation
                </label>
                <input
                  className="border px-3 py-1 rounded w-full"
                  value={col.operation}
                  onChange={(e) => updateColumn(i, "operation", e.target.value)}
                />
              </div>
            )}

            {col.data === "total" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Operands (e.g., c8,c9)
                </label>
                <input
                  className="border px-3 py-1 rounded w-full"
                  value={col.operands}
                  onChange={(e) => updateColumn(i, "operands", e.target.value)}
                />
              </div>
            )}

            {["reference_boolean", "reference_boolean2"].includes(col.data) && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <input
                  className="border px-3 py-1 rounded w-full"
                  value={col.condition}
                  onChange={(e) => updateColumn(i, "condition", e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </section>

      {/* APPEND RULES */}
      <section className="border rounded-md p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-medium">[aX] Append Rules</h2>
          <button
            onClick={addAppendRule}
            className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
          >
            + Add Append Rule
          </button>
        </div>

        {appendRules.map((rule, i) => (
          <div
            key={i}
            className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded border"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Operation
              </label>
              <select
                value={rule.operation}
                className="border px-3 py-1 rounded w-full"
                onChange={(e) => updateAppend(i, "operation", e.target.value)}
              >
                <option value="replace">Replace</option>
                <option value="generate">Generate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Col #
              </label>
              <input
                placeholder="Col #"
                type="number"
                value={rule.cols}
                className="border px-3 py-1 rounded w-full"
                onChange={(e) =>
                  updateAppend(i, "cols", parseInt(e.target.value))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Find / New Column
              </label>
              <input
                placeholder="Find or NewCol"
                className="border px-3 py-1 rounded w-full"
                value={rule.find || rule.new_col || ""}
                onChange={(e) => updateAppend(i, "find", e.target.value)}
              />
            </div>
          </div>
        ))}
      </section>

      {/* REORDER */}
      <section className="border rounded-md p-4">
        <h2 className="text-xl font-medium mb-2">[reorder] Settings</h2>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Order (e.g., 1,2,3,4)
        </label>
        <input
          className="w-full border px-3 py-1 rounded"
          value={reorderRule.order}
          onChange={(e) => setReorderRule({ order: e.target.value })}
        />
      </section>

      {/* Debug */}
      <div className="pt-4">
        <button
          className="px-4 py-2 rounded bg-gray-800 text-white"
          onClick={() => console.log({ columns, appendRules, reorderRule })}
        >
          Debug Print All Rules
        </button>
      </div>
    </div>
  );
}
