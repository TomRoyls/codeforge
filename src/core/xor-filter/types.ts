export interface XorFilterConfig {
  hashFunctions: number
  blockCount: number
  sizeMultiplier: number
}

export const DEFAULT_XOR_FILTER_CONFIG: XorFilterConfig = {
  hashFunctions: 3,
  blockCount: 3,
  sizeMultiplier: 1.23,
}
