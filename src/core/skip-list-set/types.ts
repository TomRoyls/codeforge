export interface SkipListSetOptions<T = unknown> {
  maxLevel?: number
  comparator?: (a: T, b: T) => number
}

export const DEFAULT_SKIP_LIST_SET_OPTIONS: Required<SkipListSetOptions> = {
  maxLevel: 32,
  comparator: (a: unknown, b: unknown): number => {
    if (a === b) return 0
    return (a as number) < (b as number) ? -1 : 1
  },
}
