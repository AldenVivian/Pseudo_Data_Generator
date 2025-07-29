import { PreviewPaneProps } from "@/types/types";

interface ExtendedPreviewPaneProps extends PreviewPaneProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function PreviewPane({
  isLoadingPreview,
  previewData,
  isOpen,
  onToggle,
  onClose,
}: ExtendedPreviewPaneProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Pull-out Tab - Always visible */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out cursor-pointer ${
          isOpen ? "right-96" : "right-0"
        }`}
        onClick={onToggle}
      >
        <div className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-l-lg shadow-lg flex items-center justify-center group">
          <div className="flex flex-col items-center gap-1">
            <svg
              className={`w-5 h-5 transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-xs font-medium whitespace-nowrap [writing-mode:vertical-lr] transform rotate-180">
              {isOpen ? "Hide" : "Preview"}
            </span>
          </div>

          {/* Loading indicator on tab */}
          {isLoadingPreview && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          <div className="flex items-center gap-3">
            {isLoadingPreview && (
              <div className="text-blue-500 text-sm">Loading...</div>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Close preview"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 h-full overflow-y-auto pb-20">
          {previewData && (
            <div className="bg-gray-50 rounded-lg p-4">
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
                    {previewData.message} x {previewData.shape[1]} columns
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {previewData.columns.map((col, index) => (
                            <th
                              key={index}
                              className="text-left p-2 font-medium bg-gray-100 sticky top-0"
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
    </>
  );
}
