export type HashFunction = (key: string) => number

export interface HashRingOptions {
  virtualNodes: number
  hash: HashFunction
}

export interface RingEntry<T extends string> {
  hash: number
  node: T
}

export const DEFAULT_HASH_RING_OPTIONS: HashRingOptions = {
  virtualNodes: 150,
  hash: (key: string): number => {
    let h = 2166136261
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  },
}
