export interface LfuSetOptions {
  capacity: number
  evictionPolicy: 'least-frequent' | 'least-recent-least-frequent'
}

export interface LfuSetStatistics {
  hits: number
  misses: number
  evictions: number
  frequencyUpdates: number
}

export interface LfuEntry<T> {
  value: T
  frequency: number
  lastAccess: number
}

export const DEFAULT_LFU_SET_OPTIONS: LfuSetOptions = {
  capacity: 1000,
  evictionPolicy: 'least-recent-least-frequent',
}
