"use client";

import { useState } from "react";

export default function HomePage() {
  const [config, setConfig] = useState<Record<string, Record<string, string>>>({
    rec: { num: "150", mode: "1", cols: "5" },
  });
  const [activeSection, setActiveSection] = useState("rec");

  const handleUpdate = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [key]: value,
      },
    }));
  };

  const addSection = () => {
    const next = `c${
      Object.keys(config).filter((k) => k.startsWith("c")).length + 1
    }`;
    setConfig((prev) => ({
      ...prev,
      [next]: { name: "", dtype: "", data: "" },
    }));
    setActiveSection(next);
  };

  return (
    <main className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-2">Sections</h2>
        <ul>
          {Object.keys(config).map((section) => (
            <li key={section}>
              <button
                className={`block w-full text-left px-2 py-1 rounded ${
                  section === activeSection
                    ? "bg-blue-500 text-white"
                    : "hover:bg-blue-100"
                }`}
                onClick={() => setActiveSection(section)}
              >
                [{section}]
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={addSection}
          className="mt-4 px-2 py-1 bg-green-600 text-white rounded"
        >
          + Add Column Section
        </button>
      </div>

      {/* Config Editor */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-bold mb-4">Edit [{activeSection}]</h2>
        {Object.entries(config[activeSection]).map(([key, val]) => (
          <div key={key} className="mb-3">
            <label className="block font-medium text-sm mb-1">{key}</label>
            <input
              type="text"
              value={val}
              onChange={(e) => handleUpdate(key, e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        ))}

        {/* Add New Key/Value */}
        <AddKeyValueForm
          onAdd={(k, v) =>
            setConfig((prev) => ({
              ...prev,
              [activeSection]: {
                ...prev[activeSection],
                [k]: v,
              },
            }))
          }
        />
      </div>
    </main>
  );
}

function AddKeyValueForm({ onAdd }: { onAdd: (k: string, v: string) => void }) {
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");

  const submit = () => {
    if (key.trim()) {
      onAdd(key, val);
      setKey("");
      setVal("");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-md font-semibold mb-2">Add New Key</h3>
      <div className="flex gap-2">
        <input
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="border px-2 py-1 rounded w-1/3"
        />
        <input
          placeholder="Value"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="border px-2 py-1 rounded flex-1"
        />
        <button
          onClick={submit}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}
