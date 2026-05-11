export type HashFunction = (item: string) => number

export interface CuckooFilterOptions {
  fingerprintSize?: number
  maxKicks?: number
  bucketSize?: number
  capacity?: number
  hashFunction?: HashFunction
}

export interface CuckooFilterStatistics {
  size: number
  capacity: number
  loadFactor: number
  falsePositiveRate: number
  fingerprintSize: number
  maxKicks: number
  bucketSize: number
  filledSlots: number
  totalSlots: number
}

export const DEFAULT_FINGERPRINT_SIZE = 4
export const DEFAULT_MAX_KICKS = 500
export const BUCKET_SIZE = 4

export const DEFAULT_CUCKOO_FILTER_OPTIONS: Required<CuckooFilterOptions> = {
  fingerprintSize: DEFAULT_FINGERPRINT_SIZE,
  maxKicks: DEFAULT_MAX_KICKS,
  bucketSize: BUCKET_SIZE,
  capacity: 1024,
  hashFunction: defaultHash,
}

function defaultHash(item: string): number {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < item.length; i++) {
    const ch = item.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)) >>> 0
}

export { defaultHash }
