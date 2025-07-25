"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import { Column, AppendRule, PreviewData } from "@/types/types";
import AppendRules from "@/app/components/AppendRules";
import PreviewPane from "@/app/components/PreviewPane";
import UploadConfiguration from "@/app/components/UploadConfiguration";
import ConfigPanel from "@/app/components/ConfigPanel";
import ColumnsSection from "@/app/components/ColumnsSection";

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
    <div className="relative max-w-full mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Pseudo Data Generator
      </h1>

      {/* Upload Section */}
      <UploadConfiguration
        setNumRecords={setNumRecords}
        setMode={setMode}
        setColumns={setColumns}
        setAppendRules={setAppendRules}
        setReorder={setReorder}
      />

      {/* Main Content - adjust margin when preview is open */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showPreview ? "mr-96" : "mr-0"
        }`}
      >
        {/* Basic Settings */}
        <ConfigPanel
          numRecords={numRecords}
          setNumRecords={setNumRecords}
          mode={mode}
          setMode={setMode}
        />

        {/* Columns Section */}
        <ColumnsSection setColumns={setColumns} columns={columns} />

        {/* Append Rules Section */}
        <AppendRules
          mode={mode}
          appendRules={appendRules}
          setAppendRules={setAppendRules}
        />

        {/* Action Buttons - removed preview button */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            🚀 Generate rules.ini
          </button>
        </div>
      </div>

      {/* Sliding Preview Panel */}
      <PreviewPane
        isLoadingPreview={isLoadingPreview}
        previewData={previewData}
        isOpen={showPreview}
        onToggle={togglePreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
