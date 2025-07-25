import { PreviewPaneProps } from "@/types/types";

export default function PreviewPane({
  isLoadingPreview,
  previewData,
}: PreviewPaneProps) {
    
  return (
    <div className="xl:w-1/2 xl:max-w-2xl">
      <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Live Preview</h2>
          {isLoadingPreview && <div className="text-blue-500">Loading...</div>}
        </div>

        {previewData && (
          <div className="bg-white rounded-lg p-4 max-h-96 overflow-auto">
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
                  {previewData.message} • {previewData.shape[0]} rows ×{" "}
                  {previewData.shape[1]} columns
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {previewData.columns.map((col, index) => (
                          <th
                            key={index}
                            className="text-left p-2 font-medium bg-gray-50"
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
  );
}
