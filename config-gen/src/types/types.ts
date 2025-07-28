export type Column = {
  name: string;
  dtype: "str" | "int" | "float" | "decimal";
  data: string;
  options?: string[];
  weights?: string[];
  optionWeightPairs?: Array<{ option: string; weight: number }>; // New field
  faker_method: string;
  cols?: number;
  value: string[];
  range: string[];
  condition?: string;
  operation?: string;
  operands: string[];
  start?: number;
  interval?: number;
};
export interface AppendRule {
  operation: "replace" | "generate";
  data?: "random" | "faker";
  options?: string[];
  weights?: number[];
  optionWeightPairs?: Array<{ option: string; weight: number }>; // New field
  faker_method?: string;
  nullable?: number;
  cols?: number;
  col_name?: string;
  find?: string;
  replace?: string;
  new_col?: string;
}

export type PreviewData = {
  preview_data: any[];
  columns: string[];
  shape: [number, number];
  message: string;
  error?: string;
};

export type AppendRulesProps = {
  mode: number;
  appendRules: AppendRule[];
  setAppendRules: React.Dispatch<React.SetStateAction<AppendRule[]>>;
};

export type PreviewPaneProps = {
  isLoadingPreview: boolean;
  previewData: PreviewData | null;
};

export type UploadConfigurationProps = {
  setNumRecords: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<number>>;
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  setAppendRules: React.Dispatch<React.SetStateAction<AppendRule[]>>;
  setReorder: React.Dispatch<React.SetStateAction<number[]>>;
};

export type ConfigPanelProps = {
  numRecords: number;
  setNumRecords: React.Dispatch<React.SetStateAction<number>>;
  mode: number;
  setMode: React.Dispatch<React.SetStateAction<number>>;
};

export type ColumnsSectionProps = {
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  columns: Column[];
};
