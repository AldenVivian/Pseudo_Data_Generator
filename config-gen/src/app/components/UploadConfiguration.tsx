import { useState, useRef } from "react";
import axios from "axios";
import { UploadConfigurationProps } from "@/types/types";

export default function UploadConfiguration({
  setNumRecords,
  setMode,
  setColumns,
  setAppendRules,
  setReorder,
}: UploadConfigurationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearUploadMessages = () => {
    setUploadError(null);
    setUploadSuccess(null);
  };

  // Helper function to transform parsed columns data
  // In UploadConfiguration.tsx, update the transformColumnsData function
  const transformColumnsData = (parsedColumns: any[]) => {

    // Sort columns by their original INI order (c1, c2, c3, etc.)
    const sortedColumns = parsedColumns.sort((a, b) => {
      return (a.column_position || 0) - (b.column_position || 0);
    });
    return sortedColumns.map((column, index) => {

      const transformedColumn = { ...column };

      // Handle options field (convert comma-separated string to array)
      if (column.options && typeof column.options === "string") {
        transformedColumn.options = column.options
          .split(",")
          .map((option: string) => option.trim());
      } else if (!column.options) {
        transformedColumn.options = [];
      }

      // Handle weights field (convert comma-separated string to array)
      if (column.weights && typeof column.weights === "string") {
        transformedColumn.weights = column.weights
          .split(",")
          .map((weight: string) => weight.trim());
      } else if (!column.weights) {
        transformedColumn.weights = [];
      }

      // Create optionWeightPairs from options and weights arrays
      if (transformedColumn.options && transformedColumn.options.length > 0) {
        transformedColumn.optionWeightPairs = transformedColumn.options.map(
          (option: string, index: number) => ({
            option: option,
            weight:
              transformedColumn.weights && transformedColumn.weights[index]
                ? parseFloat(transformedColumn.weights[index]) || 1
                : 1,
          })
        );
      } else {
        transformedColumn.optionWeightPairs = [];
      }

      // Map data types to match UI expectations
      if (column.data === "random") {
        transformedColumn.type = "random_selection";
      } else if (column.data === "company") {
        transformedColumn.type = "company_id";
      }

      // Ensure all required fields are present
      transformedColumn.name = column.name || "";
      transformedColumn.dtype = column.dtype || "str";

      return transformedColumn;
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".ini")) {
      setUploadError("Please select a .ini file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:8000/parse-ini",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const { data } = response.data;

        // Transform columns data to match new UI structure
        const transformedColumns = transformColumnsData(data.columns);

        // Populate the UI with parsed and transformed data
        setNumRecords(data.num_records);
        setMode(data.mode);
        setColumns(transformedColumns);
        setAppendRules(data.append_rules || []);
        setReorder(data.reorder || []);

        setUploadSuccess(response.data.message);

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);

      if (error.response?.data?.detail) {
        setUploadError(error.response.data.detail);
      } else {
        setUploadError("Failed to upload and parse INI file");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">
          Upload Existing Configuration
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <button
            onClick={triggerFileUpload}
            disabled={isUploading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isUploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isUploading ? "Uploading..." : "📁 Upload rules.ini"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".ini"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex-1 min-w-0">
            {uploadError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span>❌ {uploadError}</span>
                  <button
                    onClick={clearUploadMessages}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span>✅ {uploadSuccess}</span>
                  <button
                    onClick={clearUploadMessages}
                    className="text-green-500 hover:text-green-700 ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-blue-600 mt-2">
          Upload a previously generated rules.ini file to auto-populate the
          configuration
        </p>
      </div>
    </>
  );
}
