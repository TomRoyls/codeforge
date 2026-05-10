export interface PrioritySamplingOptions {
  reservoirSize?: number
  seed?: number
}

export interface PrioritySamplingStatistics {
  adds: number
  samples: number
  updates: number
  totalWeight: number
  overflows: number
}

export const DEFAULT_PRIORITY_SAMPLING_OPTIONS: Required<PrioritySamplingOptions> = {
  reservoirSize: 100,
  seed: 0,
}
