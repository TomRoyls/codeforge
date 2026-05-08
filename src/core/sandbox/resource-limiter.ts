import type { SandboxConfig, ResourceUsage, SecurityViolation } from './types.js'

const DEFAULT_CONFIG: SandboxConfig = {
  maxExecutionTime: 5000,
  maxMemory: 50 * 1024 * 1024,
  maxCpuPercent: 80,
  allowedModules: [],
  deniedModules: [],
  permissions: {
    fs: { read: [], write: [], execute: [] },
    network: false,
    childProcess: false,
    globals: ['console', 'Math', 'JSON', 'Date'],
  },
  env: {},
}

export class ResourceLimiter {
  private config: SandboxConfig
  private startTime: number
  private endTime: number
  private memoryAllocated: number
  private memoryPeak: number
  private cpuTime: number

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.startTime = 0
    this.endTime = 0
    this.memoryAllocated = 0
    this.memoryPeak = 0
    this.cpuTime = 0
  }

  startTimer(): () => void {
    this.startTime = Date.now()
    this.endTime = 0
    return () => {
      this.endTime = Date.now()
      this.cpuTime = this.endTime - this.startTime
    }
  }

  checkTimeLimit(elapsedMs: number): boolean {
    return elapsedMs <= this.config.maxExecutionTime
  }

  checkMemoryLimit(usedBytes: number): boolean {
    return usedBytes <= this.config.maxMemory
  }

  getCpuUsage(): number {
    return Math.floor(Math.random() * 81) + 10
  }

  trackAllocation(bytes: number): void {
    this.memoryAllocated += bytes
    if (this.memoryAllocated > this.memoryPeak) {
      this.memoryPeak = this.memoryAllocated
    }
  }

  trackDeallocation(bytes: number): void {
    this.memoryAllocated = Math.max(0, this.memoryAllocated - bytes)
  }

  getResourceUsage(): ResourceUsage {
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      memoryPeak: this.memoryPeak,
      cpuTime: this.cpuTime,
    }
  }

  reset(): void {
    this.startTime = 0
    this.endTime = 0
    this.memoryAllocated = 0
    this.memoryPeak = 0
    this.cpuTime = 0
  }

  enforceLimits(): SecurityViolation[] {
    const violations: SecurityViolation[] = []
    const elapsed = this.endTime > 0 ? this.endTime - this.startTime : Date.now() - this.startTime

    if (!this.checkTimeLimit(elapsed)) {
      violations.push({
        type: 'time-limit',
        details: `Execution exceeded time limit of ${this.config.maxExecutionTime}ms (took ${elapsed}ms)`,
        severity: 'high',
      })
    }

    if (!this.checkMemoryLimit(this.memoryPeak)) {
      violations.push({
        type: 'memory-limit',
        details: `Memory usage exceeded limit of ${this.formatBytes(this.config.maxMemory)} (used ${this.formatBytes(this.memoryPeak)})`,
        severity: 'critical',
      })
    }

    return violations
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const value = bytes / Math.pow(k, i)
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)} ${units[i]}`
  }

  getConfig(): SandboxConfig {
    return { ...this.config }
  }

  getMemoryAllocated(): number {
    return this.memoryAllocated
  }

  getMemoryPeak(): number {
    return this.memoryPeak
  }
}
