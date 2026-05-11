export interface SkipListMapOptions<K = unknown> {
  maxLevel?: number
  comparator?: (a: K, b: K) => number
}

export const DEFAULT_SKIP_LIST_MAP_OPTIONS: Required<SkipListMapOptions> = {
  maxLevel: 32,
  comparator: (a: unknown, b: unknown): number => {
    if (a === b) return 0
    return (a as number) < (b as number) ? -1 : 1
  },
}
