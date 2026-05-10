export interface TemporalRingOptions {
  capacity?: number
  autoExpire?: boolean
  ttlMs?: number
}

export interface TemporalRingStatistics {
  pushes: number
  expirations: number
  queries: number
  totalExpired: number
  maxSeenSize: number
}

export const DEFAULT_TEMPORAL_RING_OPTIONS: Required<TemporalRingOptions> = {
  capacity: 1024,
  autoExpire: false,
  ttlMs: 0,
}
