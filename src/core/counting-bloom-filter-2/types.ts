export const DEFAULT_ERROR_RATE = 0.001

export interface CountingBloomFilterExport {
  add: (item: string) => void
  remove: (item: string) => boolean
  has: (item: string) => boolean
  count: (item: string) => number
  size: () => number
  isEmpty: () => boolean
  clear: () => void
  clone: () => CountingBloomFilterExport
  equals: (other: CountingBloomFilterExport) => boolean
  expectedFalsePositiveRate: () => number
  union: (other: CountingBloomFilterExport) => CountingBloomFilterExport
  intersection: (other: CountingBloomFilterExport) => CountingBloomFilterExport
  capacity: number
  loadFactor: number
}
