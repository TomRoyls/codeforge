export interface WeightedRoundRobinOptions {
  smooth?: boolean
}

export interface WeightedRoundRobinStatistics {
  adds: number
  removes: number
  selections: number
  weightUpdates: number
  totalCycles: number
}

export const DEFAULT_WEIGHTED_ROUND_ROBIN_OPTIONS: WeightedRoundRobinOptions = {
  smooth: true,
}
