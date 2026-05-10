export interface BimapOptions {
  allowOverwrite?: boolean
}

export interface BimapStatistics {
  sets: number
  gets: number
  deletes: number
  reverseLookups: number
  overwrites: number
}

export interface BimapJSON<K, V> {
  entries: Array<[K, V]>
  statistics: BimapStatistics
}

export const DEFAULT_BIMAP_OPTIONS: Required<BimapOptions> = {
  allowOverwrite: true,
}
