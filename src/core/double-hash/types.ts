export type DoubleHashEntry<K, V> = {
  key: K
  value: V
}

export type DoubleHashOptions = {
  capacity?: number
  loadFactorThreshold?: number
}

export type DoubleHashStats = {
  size: number
  capacity: number
  loadFactor: number
  tombstoneCount: number
  maxProbeLength: number
  averageProbeLength: number
}

const TOMBSTONE: unique symbol = Symbol('TOMBSTONE')

export { TOMBSTONE }
