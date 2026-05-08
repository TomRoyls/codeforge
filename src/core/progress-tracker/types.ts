export interface ProgressItem {
  id: string
  label: string
  total: number
  current: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  startedAt?: number
  completedAt?: number
}

export interface ProgressSnapshot {
  itemId: string
  current: number
  total: number
  percent: number
  elapsed: number
  remaining: number
  rate: number
}

export interface TrackerConfig {
  autoStart: boolean
  historySize: number
  updateInterval: number
}

export const DEFAULT_TRACKER_CONFIG: TrackerConfig = {
  autoStart: true,
  historySize: 100,
  updateInterval: 100,
}
