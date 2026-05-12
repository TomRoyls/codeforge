export type Comparator<K> = (a: K, b: K) => number

export interface SkipList3Options<K = unknown> {
  maxLevel?: number
  probability?: number
  comparator?: Comparator<K>
}

export const DEFAULT_SKIP_LIST_3_OPTIONS: Required<SkipList3Options> = {
  maxLevel: 32,
  probability: 0.5,
  comparator: (a: unknown, b: unknown): number => {
    if (a === b) return 0
    return (a as number) < (b as number) ? -1 : 1
  },
}
