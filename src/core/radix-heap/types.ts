export interface RadixHeapEntry {
  key: number
  value: number
}

export interface RadixBucket {
  entries: RadixHeapEntry[]
}

export const DEFAULT_RADIX_HEAP_OPTIONS = {
  maxKey: Math.pow(2, 32) - 1,
} as const

export type RadixHeapOptions = typeof DEFAULT_RADIX_HEAP_OPTIONS
