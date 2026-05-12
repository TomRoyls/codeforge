export type HashFunction = (element: string, seed: number) => number

export interface XorFilterOptions {
  seed?: number
  hashFunction?: HashFunction
}

export interface XorFilterConfig {
  fingerprintSize: number
  hashCount: number
  seed: number
  sizeMultiplier: number
  blockCount: number
  hashFunctions?: HashFunction[]
}

export const DEFAULT_XOR_FILTER_CONFIG: XorFilterConfig = {
  fingerprintSize: 8,
  hashCount: 3,
  seed: 0x9e3779b9,
  sizeMultiplier: 1.23,
  blockCount: 3,
}

export interface SerializedXorFilter {
  size: number
  segmentSize: number
  fingerprintCount: number
  seed: number
  fingerprints: number[]
  elements: string[]
}
