import React, { useState } from "react";
import { AppendRule, AppendRulesProps } from "@/types/types";

export default function AppendRules({
  mode,
  appendRules,
  setAppendRules,
}: AppendRulesProps) {
  // Track which accordion sections are open
  const [openAccordions, setOpenAccordions] = useState<{
    [key: number]: boolean;
  }>({});

  const addAppendRule = () => {
    setAppendRules([
      ...appendRules,
      {
        operation: "replace",
        data: "random",
        options: [],
        weights: [],
        optionWeightPairs: [{ option: "", weight: 1 }],
        faker_method: "name",
        nullable: 0,
        cols: 1,
        col_name: "",
        find: "",
        replace: "",
        new_col: "",
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
    // Clean up accordion state for removed rule
    const newOpenAccordions = { ...openAccordions };
    delete newOpenAccordions[index];
    setOpenAccordions(newOpenAccordions);
  };

  // Add a new option-weight pair
  const addOptionWeightPair = (ruleIndex: number) => {
    const rule = appendRules[ruleIndex];
    const newPairs = [
      ...(rule.optionWeightPairs || []),
      { option: "", weight: 1 },
    ];
    updateAppendRule(ruleIndex, "optionWeightPairs", newPairs);
    updateOptionsAndWeights(ruleIndex, newPairs);

    // Auto-open accordion when adding options
    setOpenAccordions((prev) => ({
      ...prev,
      [ruleIndex]: true,
    }));
  };

  // Remove an option-weight pair
  const removeOptionWeightPair = (ruleIndex: number, pairIndex: number) => {
    const rule = appendRules[ruleIndex];
    const newPairs = (rule.optionWeightPairs || []).filter(
      (_, i) => i !== pairIndex
    );
    updateAppendRule(ruleIndex, "optionWeightPairs", newPairs);
    updateOptionsAndWeights(ruleIndex, newPairs);
  };

  // Update a specific option-weight pair
  const updateOptionWeightPair = (
    ruleIndex: number,
    pairIndex: number,
    field: "option" | "weight",
    value: string | number
  ) => {
    const rule = appendRules[ruleIndex];
    const newPairs = [...(rule.optionWeightPairs || [])];
    newPairs[pairIndex] = { ...newPairs[pairIndex], [field]: value };
    updateAppendRule(ruleIndex, "optionWeightPairs", newPairs);
    updateOptionsAndWeights(ruleIndex, newPairs);
  };

  // Keep the separate options and weights arrays in sync for backend
  const updateOptionsAndWeights = (
    ruleIndex: number,
    pairs: Array<{ option: string; weight: number }>
  ) => {
    const options = pairs.map((p) => p.option).filter(Boolean);
    const weights = pairs.map((p) => p.weight);
    updateAppendRule(ruleIndex, "options", options);
    updateAppendRule(ruleIndex, "weights", weights);
  };

  // Toggle accordion state
  const toggleAccordion = (ruleIndex: number) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [ruleIndex]: !prev[ruleIndex],
    }));
  };

  if (mode < 2) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Append Rules</h2>
          <p className="text-sm text-gray-600">
            Apply post-generation modifications and add new columns
          </p>
        </div>
        <button
          onClick={addAppendRule}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
        >
          Add Rule
        </button>
      </div>

      <div className="space-y-4">
        {appendRules.map((rule, index) => {
          const isOpen = openAccordions[index] || false;
          const optionCount = rule.optionWeightPairs?.length || 0;
          const totalWeight = rule.weights?.reduce((a, b) => a + b, 0) || 0;
          const hasOptions =
            rule.operation === "generate" && rule.data === "random";

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Rule {index + 1}</h3>
                <button
                  onClick={() => removeAppendRule(index)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Operation Selection */}
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

                {/* Replace Operation Fields */}
                {rule.operation === "replace" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Column Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={rule.cols || 1}
                        onChange={(e) =>
                          updateAppendRule(
                            index,
                            "cols",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Column number to modify"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Column Name (optional)
                      </label>
                      <input
                        type="text"
                        value={rule.col_name || ""}
                        onChange={(e) =>
                          updateAppendRule(index, "col_name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Rename column"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Find Value
                      </label>
                      <input
                        type="text"
                        value={rule.find || ""}
                        onChange={(e) =>
                          updateAppendRule(index, "find", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Value to find"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Replace With
                      </label>
                      <input
                        type="text"
                        value={rule.replace || ""}
                        onChange={(e) =>
                          updateAppendRule(index, "replace", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Replacement value"
                      />
                    </div>
                  </>
                )}

                {/* Generate Operation Fields */}
                {rule.operation === "generate" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Type
                      </label>
                      <select
                        value={rule.data || "random"}
                        onChange={(e) => {
                          updateAppendRule(index, "data", e.target.value);
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
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Column Name
                      </label>
                      <input
                        type="text"
                        value={rule.new_col || ""}
                        onChange={(e) =>
                          updateAppendRule(index, "new_col", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Name for new column"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nullable Rate (0-1)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={rule.nullable || 0}
                        onChange={(e) =>
                          updateAppendRule(
                            index,
                            "nullable",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.1 = 10% null values"
                      />
                    </div>

                    {/* Faker Options */}
                    {rule.data === "faker" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Faker Method
                        </label>
                        <select
                          value={rule.faker_method || "name"}
                          onChange={(e) =>
                            updateAppendRule(
                              index,
                              "faker_method",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="name">Name</option>
                          <option value="company">Company</option>
                          <option value="email">Email</option>
                          <option value="phone_number">Phone Number</option>
                          <option value="address">Address</option>
                          <option value="city">City</option>
                          <option value="country">Country</option>
                          <option value="date">Date</option>
                          <option value="job">Job Title</option>
                          <option value="text">Random Text</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Options & Weights Section */}
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
                        rule.optionWeightPairs || [{ option: "", weight: 1 }]
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
                              placeholder="Option value (e.g., Enterprise)"
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
                          {(rule.optionWeightPairs?.length || 0) > 1 && (
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
            </div>
          );
        })}
      </div>

      {appendRules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No append rules defined.</p>
          <p className="text-sm">
            Add rules to modify existing columns or generate new ones after base
            data creation.
          </p>
        </div>
      )}
    </div>
  );
}
