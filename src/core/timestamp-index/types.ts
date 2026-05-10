export interface TimestampIndexOptions {
  allowOverwrite?: boolean
}

export interface TimestampIndexStatistics {
  inserts: number
  deletes: number
  rangeQueries: number
  expirations: number
  lookups: number
}

export const DEFAULT_TIMESTAMP_INDEX_OPTIONS: TimestampIndexOptions = {
  allowOverwrite: true,
}
