export type Strategy = 'array' | 'probing' | 'chained'

export interface AdaptiveHashOptions {
  arrayToProbingThreshold: number
  probingToChainedThreshold: number
  loadFactor: number
}

export interface AdaptiveHashStatistics {
  inserts: number
  deletes: number
  lookups: number
  strategySwitches: number
  currentStrategy: Strategy
  probes: number
}

export const DEFAULT_ADAPTIVE_HASH_OPTIONS: AdaptiveHashOptions = {
  arrayToProbingThreshold: 8,
  probingToChainedThreshold: 128,
  loadFactor: 0.75,
}
