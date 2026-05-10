export interface ScanArrayOptions {
  initialSize?: number
}

export interface ScanArrayStatistics {
  updates: number
  prefixSums: number
  rangeSums: number
}

export const DEFAULT_SCAN_ARRAY_OPTIONS: ScanArrayOptions = {
  initialSize: 0,
}
