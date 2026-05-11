export type HashFunction = (element: string, seed: number) => number

export interface BloomFilterOptions {
  capacity?: number
  falsePositiveRate?: number
  bitCount?: number
  hashCount?: number
  hashFunction?: HashFunction
}

export interface SerializedBloomFilter {
  bitCount: number
  hashCount: number
  capacity: number
  falsePositiveRate: number
  size: number
  elements: string[]
  bits: number[]
}
