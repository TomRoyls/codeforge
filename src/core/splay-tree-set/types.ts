export interface SplayTreeSetOptions<T = unknown> {
  comparator?: (a: T, b: T) => number
}

export const DEFAULT_SPLAY_TREE_SET_OPTIONS: Required<SplayTreeSetOptions> = {
  comparator: (a: unknown, b: unknown): number => {
    if (a === b) return 0
    return (a as number) < (b as number) ? -1 : 1
  },
}
