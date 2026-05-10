export interface CascadeFilterOptions {
  expectedItems?: number
  falsePositiveRate?: number
  layers?: number
}

export interface CascadeFilterStatistics {
  adds: number
  lookups: number
  removals: number
  layerHits: number[]
  totalChecks: number
  falsePositiveEstimate: number
}

export interface CascadeFilterLayerJSON {
  counters: number[]
  bitCount: number
  hashCount: number
}

export interface CascadeFilterJSON {
  layers: CascadeFilterLayerJSON[]
  expectedItems: number
  falsePositiveRate: number
  layerCount: number
  itemCount: number
  statistics: CascadeFilterStatistics
}

export const DEFAULT_CASCADE_FILTER_OPTIONS: Required<CascadeFilterOptions> = {
  expectedItems: 1000,
  falsePositiveRate: 0.01,
  layers: 3,
}
