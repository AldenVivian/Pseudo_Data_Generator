import React from "react";

import { AppendRule, AppendRulesProps } from "@/types/types";

export default function AppendRules({
  mode,
  appendRules,
  setAppendRules,
}: AppendRulesProps) {
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

  return (
    <>
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
    </>
  );
}
