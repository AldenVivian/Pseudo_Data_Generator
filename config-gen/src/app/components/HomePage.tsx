"use client";
import { useState, useEffect } from "react";

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
  description: string;
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
  description: string;
}

interface ReorderRule {
  order: string;
  description: string;
}

interface RecSettings {
  num: number;
  mode: number;
}

export default function IniRuleBuilder() {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [appendRules, setAppendRules] = useState<AppendRule[]>([]);
  const [reorderRule, setReorderRule] = useState<ReorderRule>({ order: "", description: "" });
  const [recSettings, setRecSettings] = useState<RecSettings>({ num: 150, mode: 1 });
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme from localStorage and sync with document
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle theme and persist to localStorage
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

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
        description: "",
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
        description: "",
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

  const updateRecSettings = (key: keyof RecSettings, value: any) => {
    setRecSettings({ ...recSettings, [key]: value });
  };

  const generateIniContent = () => {
    let iniContent = `[rec]\nnum = ${recSettings.num}\nmode = ${recSettings.mode}\ncols = ${columns.length}\n\n`;

    columns.forEach((col, i) => {
      iniContent += `[c${i + 1}]\n`;
      iniContent += `name = ${col.name}\n`;
      iniContent += `dtype = ${col.dtype}\n`;
      iniContent += `data = ${col.data}\n`;
      if (col.data === "random" && col.options) iniContent += `options = ${col.options}\n`;
      if (col.data === "random" && col.weights) iniContent += `weights = ${col.weights}\n`;
      if (["reference", "reference_range", "reference_boolean", "reference_boolean2", "discount"].includes(col.data) && col.cols) {
        iniContent += `cols = ${col.cols}\n`;
      }
      if (["total", "discount"].includes(col.data) && col.operation) {
        iniContent += `operation = ${col.operation}\n`;
      }
      if (col.data === "total" && col.operands) iniContent += `operands = ${col.operands}\n`;
      if (["reference_boolean", "reference_boolean2"].includes(col.data) && col.condition) {
        iniContent += `condition = ${col.condition}\n`;
      }
      if (col.data === "faker" && col.faker_method) iniContent += `faker_method = ${col.faker_method}\n`;
      if (col.description) iniContent += `description = ${col.description}\n`;
      iniContent += `\n`;
    });

    appendRules.forEach((rule, i) => {
      iniContent += `[a${i + 1}]\n`;
      iniContent += `operation = ${rule.operation}\n`;
      iniContent += `cols = ${rule.cols}\n`;
      if (rule.operation === "replace") {
        if (rule.col_name) iniContent += `col_name = ${rule.col_name}\n`;
        if (rule.find) iniContent += `find = ${rule.find}\n`;
        if (rule.replace) iniContent += `replace = ${rule.replace}\n`;
      } else if (rule.operation === "generate") {
        if (rule.new_col) iniContent += `new_col = ${rule.new_col}\n`;
        if (rule.data) iniContent += `data = ${rule.data}\n`;
        if (rule.data === "random" && rule.options) iniContent += `options = ${rule.options}\n`;
        if (rule.data === "random" && rule.weights) iniContent += `weights = ${rule.weights}\n`;
        if (rule.data === "faker" && rule.faker_method) iniContent += `faker_method = ${rule.faker_method}\n`;
        if (rule.nullable) iniContent += `nullable = ${rule.nullable}\n`;
      }
      if (rule.description) iniContent += `description = ${rule.description}\n`;
      iniContent += `\n`;
    });

    iniContent += `[reorder]\norder = ${reorderRule.order}\n`;
isent: if (reorderRule.description) iniContent += `description = ${reorderRule.description}\n`;

    return iniContent;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 text-center">
            Rules.ini Builder
          </h1>
          <button
            onClick={toggleTheme}
            className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          </button>
        </div>

        {/* REC Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">[rec] Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Records</label>
              <input
                type="number"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                value={recSettings.num}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && !isNaN(parseInt(value))) {
                    updateRecSettings("num", parseInt(value));
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Mode</label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                value={recSettings.mode}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && !isNaN(parseInt(value))) {
                    updateRecSettings("mode", parseInt(value));
                  }
                }}
              >
                <option value={1}>1 - Generate</option>
                <option value={2}>2 - Append</option>
                <option value={3}>3 - Reorder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Columns Declared</label>
              <input
                type="number"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
                value={columns.length}
                readOnly
              />
            </div>
          </div>
        </section>

        {/* Columns Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200">[cX] Column Rules</h2>
            <button
              onClick={addColumn}
              className="mt-2 sm:mt-0 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              + Add Column
            </button>
          </div>
          {columns.map((col, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Column ID: <span className="text-blue-600 dark:text-blue-400">c{i + 1}</span>
                </span>
                {col.name && <span className="text-xs text-gray-500 dark:text-gray-400 italic">({col.name})</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Column Name</label>
                  <input
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="e.g., product_name"
                    value={col.name}
                    onChange={(e) => updateColumn(i, "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Data Type</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    value={col.dtype}
                    onChange={(e) => updateColumn(i, "dtype", e.target.value)}
                  >
                    <option value="str">String</option>
                    <option value="int">Integer</option>
                    <option value="decimal">Decimal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Data Source</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
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
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Options (comma-separated)</label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={col.options}
                        onChange={(e) => updateColumn(i, "options", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Weights (comma-separated)</label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={col.weights}
                        onChange={(e) => updateColumn(i, "weights", e.target.value)}
                      />
                    </div>
                  </>
                )}
                {col.data === "faker" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Faker Method</label>
                    <input
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={col.faker_method}
                      onChange={(e) => updateColumn(i, "faker_method", e.target.value)}
                    />
                  </div>
                )}
                {["reference", "reference_range", "reference_boolean", "reference_boolean2", "discount"].includes(col.data) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Reference Column #</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={col.cols}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !isNaN(parseInt(value))) {
                          updateColumn(i, "cols", parseInt(value));
                        }
                      }}
                    />
                  </div>
                )}
                {["total", "discount"].includes(col.data) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Operation</label>
                    <input
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={col.operation}
                      onChange={(e) => updateColumn(i, "operation", e.target.value)}
                    />
                  </div>
                )}
                {col.data === "total" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Operands (e.g., c8,c9)</label>
                    <input
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={col.operands}
                      onChange={(e) => updateColumn(i, "operands", e.target.value)}
                    />
                  </div>
                )}
                {["reference_boolean", "reference_boolean2"].includes(col.data) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Condition</label>
                    <input
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                      value={col.condition}
                      onChange={(e) => updateColumn(i, "condition", e.target.value)}
                    />
                  </div>
                )}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-mediumöra: text-gray-600 dark:text-gray-300 mb-1">Description</label>
                  <input
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="e.g., Unique identifier for the column"
                    value={col.description}
                    onChange={(e) => updateColumn(i, "description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Append Rules Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200">[aX] Append Rules</h2>
            <button
              onClick={addAppendRule}
              className="mt-2 sm:mt-0 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              + Add Append Rule
            </button>
          </div>
          {appendRules.map((rule, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Operation</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    value={rule.operation}
                    onChange={(e) => updateAppend(i, "operation", e.target.value)}
                  >
                    <option value="replace">Replace</option>
                    <option value="generate">Generate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Col #</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    value={rule.cols}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && !isNaN(parseInt(value))) {
                        updateAppend(i, "cols", parseInt(value));
                      }
                    }}
                  />
                </div>
                {rule.operation === "replace" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Column Name</label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={rule.col_name}
                        onChange={(e) => updateAppend(i, "col_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Find</label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={rule.find}
                        onChange={(e) => updateAppend(i, "find", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Replace</label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={rule.replace}
                        onChange={(e) => updateAppend(i, "replace", e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">New Column</label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={rule.new_col}
                        onChange={(e) => updateAppend(i, "new_col", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Data Source</label>
                      <select
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={rule.data}
                        onChange={(e) => updateAppend(i, "data", e.target.value)}
                      >
                        <option value="random">Random</option>
                        <option value="faker">Faker</option>
                      </select>
                    </div>
                    {rule.data === "random" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Options (comma-separated)</label>
                          <input
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                            value={rule.options}
                            onChange={(e) => updateAppend(i, "options", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Weights (comma-separated)</label>
                          <input
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                            value={rule.weights}
                            onChange={(e) => updateAppend(i, "weights", e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    {rule.data === "faker" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Faker Method</label>
                        <input
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                          value={rule.faker_method}
                          onChange={(e) => updateAppend(i, "faker_method", e.target.value)}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nullable</label>
                      <input
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                        value={rule.nullable}
                        onChange={(e) => updateAppend(i, "nullable", e.target.value)}
                      />
                    </div>
                  </>
                )}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
                  <input
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    placeholder="e.g., Description of the append rule"
                    value={rule.description}
                    onChange={(e) => updateAppend(i, "description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Reorder Section */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">[reorder] Settings</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Order (e.g., 1,2,3,4)</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                value={reorderRule.order}
                onChange={(e) => setReorderRule({ ...reorderRule, order: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder="e.g., Reorder for readability"
                value={reorderRule.description}
                onChange={(e) => setReorderRule({ ...reorderRule, description: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Generate and Debug */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            className="bg-gray-800 dark:bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-500 transition"
            onClick={() => console.log({ recSettings, columns, appendRules, reorderRule })}
          >
            Debug Print All Rules
          </button>
          <button
            className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition"
            onClick={() => {
              const blob = new Blob([generateIniContent()], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "rules.ini";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Generate and Download rules.ini
          </button>
        </div>
      </div>
    </div>
  );
}