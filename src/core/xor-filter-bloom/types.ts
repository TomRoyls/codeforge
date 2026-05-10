export interface XorFilterBloomOptions {
  fingerprintBits: number
}

export interface XorFilterBloomData {
  fingerprints: number[]
  arrayLength: number
  seed: number
  itemCount: number
  fingerprintBits: number
}

export const DEFAULT_XOR_FILTER_BLOOM_OPTIONS: XorFilterBloomOptions = {
  fingerprintBits: 8,
}
