export type RotationPolicy2 = 'size' | 'time' | 'count' | 'hybrid'
export type ArchiveFormat2 = 'gzip' | 'brotli' | 'lz4' | 'none'

export interface LogFile2 {
  path: string
  size: number
  createdAt: number
  lastWrite: number
  entryCount: number
}

export interface RotationResult2 {
  rotated: string
  archived: string | null
  reason: string
  timestamp: number
  oldSize: number
}

export class LogRotator2 {
  private files: Map<string, LogFile2> = new Map()
  private rotations: RotationResult2[] = []
  private policy: RotationPolicy2 = 'size'
  private maxSize: number = 10 * 1024 * 1024
  private maxAge: number = 24 * 60 * 60 * 1000
  private maxCount: number = 5
  private maxBackups: number = 10
  private archiveFormat: ArchiveFormat2 = 'gzip'
  private compressThreshold: number = 1024
  private totalRotated: number = 0
  private totalArchived: number = 0
  private totalSpaceSaved: number = 0

  register(path: string): this {
    this.files.set(path, { path, size: 0, createdAt: Date.now(), lastWrite: Date.now(), entryCount: 0 })
    return this
  }

  write(path: string, bytes: number): boolean {
    const file = this.files.get(path)
    if (!file) return false
    file.size += bytes
    file.lastWrite = Date.now()
    file.entryCount++
    return true
  }

  checkRotation(path: string): boolean {
    const file = this.files.get(path)
    if (!file) return false
    switch (this.policy) {
      case 'size': return file.size >= this.maxSize
      case 'time': return Date.now() - file.createdAt >= this.maxAge
      case 'count': return file.entryCount >= this.maxCount
      case 'hybrid':
        return file.size >= this.maxSize || Date.now() - file.createdAt >= this.maxAge || file.entryCount >= this.maxCount
      default: return false
    }
  }

  rotate(path: string): RotationResult2 | null {
    const file = this.files.get(path)
    if (!file) return null
    let reason = ''
    if (file.size >= this.maxSize) reason = 'size_limit'
    else if (Date.now() - file.createdAt >= this.maxAge) reason = 'age_limit'
    else if (file.entryCount >= this.maxCount) reason = 'count_limit'
    else reason = 'manual'

    const oldSize = file.size
    const archived = this.shouldArchive(oldSize) ? `${path}.${Date.now()}.${this.archiveFormat}` : null
    const result: RotationResult2 = {
      rotated: path,
      archived,
      reason,
      timestamp: Date.now(),
      oldSize,
    }
    this.rotations.push(result)
    this.totalRotated++
    if (archived) {
      this.totalArchived++
      this.totalSpaceSaved += Math.floor(oldSize * this.getCompressionRatio())
    }
    file.size = 0
    file.entryCount = 0
    file.createdAt = Date.now()
    return result
  }

  rotateAll(): RotationResult2[] {
    const results: RotationResult2[] = []
    this.files.forEach((_, path) => {
      if (this.checkRotation(path)) {
        const r = this.rotate(path)
        if (r) results.push(r)
      }
    })
    return results
  }

  private shouldArchive(size: number): boolean {
    return this.archiveFormat !== 'none' && size >= this.compressThreshold
  }

  private getCompressionRatio(): number {
    switch (this.archiveFormat) {
      case 'gzip': return 0.3
      case 'brotli': return 0.2
      case 'lz4': return 0.4
      default: return 0
    }
  }

  setPolicy(policy: RotationPolicy2): this { this.policy = policy; return this }
  setMaxSize(bytes: number): this { this.maxSize = bytes; return this }
  setMaxAge(ms: number): this { this.maxAge = ms; return this }
  setMaxCount(count: number): this { this.maxCount = count; return this }
  setMaxBackups(count: number): this { this.maxBackups = count; return this }
  setArchiveFormat(format: ArchiveFormat2): this { this.archiveFormat = format; return this }
  setCompressThreshold(bytes: number): this { this.compressThreshold = bytes; return this }

  getFile(path: string): LogFile2 | undefined { return this.files.get(path) }
  getFiles(): LogFile2[] { return Array.from(this.files.values()) }
  getRotations(): RotationResult2[] { return [...this.rotations] }
  getRecentRotations(count: number): RotationResult2[] {
    return [...this.rotations].reverse().slice(0, count)
  }

  cleanOldBackups(): number {
    const removed = Math.max(0, this.rotations.length - this.maxBackups)
    this.rotations = this.rotations.slice(-this.maxBackups)
    return removed
  }

  getStats(): { files: number; totalSize: number; totalRotated: number; totalArchived: number; spaceSaved: number } {
    return {
      files: this.files.size,
      totalSize: Array.from(this.files.values()).reduce((s, f) => s + f.size, 0),
      totalRotated: this.totalRotated,
      totalArchived: this.totalArchived,
      spaceSaved: this.totalSpaceSaved,
    }
  }

  count(): number { return this.files.size }

  toArray(): LogFile2[] { return Array.from(this.files.values()) }
  toString(): string { return JSON.stringify(this.getStats()) }
  toJSON(): Record<string, unknown> { return this.getStats() }
  clone(): LogRotator2 {
    const lr = new LogRotator2()
    this.files.forEach((f, p) => lr.files.set(p, { ...f }))
    lr.rotations = [...this.rotations]
    lr.policy = this.policy
    lr.maxSize = this.maxSize
    lr.maxAge = this.maxAge
    lr.maxCount = this.maxCount
    lr.maxBackups = this.maxBackups
    lr.archiveFormat = this.archiveFormat
    lr.compressThreshold = this.compressThreshold
    lr.totalRotated = this.totalRotated
    lr.totalArchived = this.totalArchived
    lr.totalSpaceSaved = this.totalSpaceSaved
    return lr
  }
  equals(other: unknown): boolean {
    if (!(other instanceof LogRotator2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.files.clear()
    this.rotations = []
    this.totalRotated = 0
    this.totalArchived = 0
    this.totalSpaceSaved = 0
  }
}
