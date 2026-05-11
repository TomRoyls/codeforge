export interface ScapegoatMapOptions<K = unknown> {
  alpha?: number
  comparator?: (a: K, b: K) => number
}

export const DEFAULT_SCAPEGOAT_MAP_OPTIONS: Required<ScapegoatMapOptions> = {
  alpha: 0.7,
  comparator: (a: unknown, b: unknown): number => {
    if (a === b) return 0
    return (a as number) < (b as number) ? -1 : 1
  },
}
