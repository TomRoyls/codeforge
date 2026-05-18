import type { MemorySnapshot, MemoryLeak } from './types.js'

export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = []
  private tracking: boolean = false
  private trackingSnapshots: MemorySnapshot[] = []

  snapshot(label: string = ''): MemorySnapshot {
    const snap: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: 0,
      heapTotal: 0,
      rss: 0,
      external: 0,
      label,
    }
    this.snapshots.push(snap)
    if (this.tracking) {
      this.trackingSnapshots.push(snap)
    }
    return snap
  }

  startTracking(): void {
    this.tracking = true
    this.trackingSnapshots = []
  }

  stopTracking(): MemorySnapshot[] {
    const result = [...this.trackingSnapshots]
    this.tracking = false
    this.trackingSnapshots = []
    return result
  }

  getSnapshots(): MemorySnapshot[] {
    return [...this.snapshots]
  }

  getPeakMemory(): number {
    if (this.snapshots.length === 0) return 0
    let peak = this.snapshots[0]!.heapUsed
    for (let i = 1; i < this.snapshots.length; i++) {
      if (this.snapshots[i]!.heapUsed > peak) peak = this.snapshots[i]!.heapUsed
    }
    return peak
  }

  getAverageMemory(): number {
    if (this.snapshots.length === 0) return 0
    const total = this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0)
    return total / this.snapshots.length
  }

  detectLeaks(snapshots: MemorySnapshot[]): MemoryLeak[] {
    const leaks: MemoryLeak[] = []
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1]!
      const curr = snapshots[i]!
      const growth = curr.heapUsed - prev.heapUsed
      if (growth > 0) {
        leaks.push({
          from: prev.timestamp,
          to: curr.timestamp,
          growth,
          label: curr.label || prev.label,
        })
      }
    }
    return leaks
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const index = Math.min(
      Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
      units.length - 1,
    )
    const value = bytes / Math.pow(1024, index)
    return `${value.toFixed(2)} ${units[index]}`
  }
}
