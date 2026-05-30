import { CountMinSketch } from './count-min-sketch.js'

export class WindowTinyLFU<K> {
  private readonly sketch: CountMinSketch
  private readonly window: Map<K, number>
  private readonly _windowSize: number
  private totalAccesses: number = 0
  private readonly _sampleSize: number

  constructor(
    private readonly _capacity: number,
    windowRatio: number = 0.01,
    sketchWidth: number = 1000,
    sketchDepth: number = 4,
  ) {
    if (_capacity < 1) throw new RangeError(`capacity must be >= 1, got ${_capacity}`)
    this._windowSize = Math.max(1, Math.floor(_capacity * windowRatio))
    this._sampleSize = _capacity * 10
    this.sketch = new CountMinSketch({ width: sketchWidth, depth: sketchDepth })
    this.window = new Map()
  }

  recordAccess(key: K): void {
    this.totalAccesses++
    this.sketch.update(String(key), 1)
    const current = this.window.get(key) ?? 0
    this.window.set(key, current + 1)
    if (this.window.size > this._windowSize) {
      this.evictWindow()
    }
    if (this.totalAccesses >= this._sampleSize) {
      this.reset()
    }
  }

  shouldAdmit(candidate: K, victim: K): boolean {
    const candidateFreq = this.estimate(candidate)
    const victimFreq = this.estimate(victim)
    return candidateFreq > victimFreq
  }

  estimate(key: K): number {
    return this.sketch.estimate(String(key))
  }

  private evictWindow(): void {
    let minKey: K | undefined
    let minCount = Infinity
    for (const [k, v] of this.window) {
      if (v < minCount) {
        minCount = v
        minKey = k
      }
    }
    if (minKey !== undefined) {
      this.window.delete(minKey)
    }
  }

  private reset(): void {
    this.totalAccesses >>= 1
    this.sketch.reset()
    const newWindow = new Map<K, number>()
    for (const [k, v] of this.window) {
      newWindow.set(k, v >> 1)
    }
    this.window.clear()
    for (const [k, v] of newWindow) {
      this.window.set(k, v)
    }
  }

  get capacity(): number {
    return this._capacity
  }

  get windowSize(): number {
    return this._windowSize
  }

  get totalAccessesCount(): number {
    return this.totalAccesses
  }
}
