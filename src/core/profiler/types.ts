export interface ProfileSample {
  timestamp: number
  stackTrace: string[]
  duration: number
  memoryUsage: number
  label: string
}

export interface ProfileSession {
  id: string
  name: string
  startTime: number
  endTime: number
  samples: ProfileSample[]
  totalDuration: number
  peakMemory: number
}

export interface Hotspot {
  function: string
  file: string
  line: number
  selfTime: number
  totalTime: number
  callCount: number
  percentage: number
}

export interface MemorySnapshot {
  timestamp: number
  heapUsed: number
  heapTotal: number
  rss: number
  external: number
  label: string
}

export interface ProfileReport {
  session: ProfileSession
  hotspots: Hotspot[]
  memorySnapshots: MemorySnapshot[]
  summary: ProfileSummary
  recommendations: string[]
}

export interface ProfileSummary {
  totalTime: number
  avgSampleDuration: number
  maxSampleDuration: number
  minSampleDuration: number
  totalSamples: number
  peakMemory: number
  avgMemory: number
}

export interface MemoryLeak {
  from: number
  to: number
  growth: number
  label: string
}
