import type { RunLengthMapOptions, Run } from './types.js'
import { DEFAULT_RUN_LENGTH_MAP_OPTIONS } from './types.js'

export class RunLengthMap<V> {
  private _runs: Run<V>[] = []
  private _size: number = 0
  private _opts: Required<RunLengthMapOptions>

  constructor(entries?: Array<[number, V]>) {
    this._opts = { ...DEFAULT_RUN_LENGTH_MAP_OPTIONS }
    if (entries) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  set(key: number, value: V): void {
    const existing = this.findRunIndex(key)
    if (existing !== -1) {
      const run = this._runs[existing]!
      if (run.value === value) return
      this.removeFromSize(key)
      if (run.start === run.end) {
        run.value = value
        this.tryMergeAdjacent(existing)
      } else if (key === run.start) {
        run.start += 1
        this._size += 1
        this.insertRunAt(existing, { start: key, end: key, value })
      } else if (key === run.end) {
        run.end -= 1
        this._size += 1
        this.insertRunAt(existing + 1, { start: key, end: key, value })
      } else {
        const originalEnd = run.end
        run.end = key - 1
        this._size += 1
        const newRuns: Run<V>[] = [
          { start: key, end: key, value },
          { start: key + 1, end: originalEnd, value: run.value },
        ]
        this._runs.splice(existing + 1, 0, ...newRuns)
        this._size += (originalEnd - key)
      }
    } else {
      this._size += 1
      let insertIdx = this.findInsertIndex(key)
      const newRun: Run<V> = { start: key, end: key, value }
      this._runs.splice(insertIdx, 0, newRun)
      this.tryMergeAdjacent(insertIdx)
    }
  }

  get(key: number): V | undefined {
    const idx = this.findRunIndex(key)
    if (idx !== -1) return this._runs[idx]!.value
    return undefined
  }

  has(key: number): boolean {
    return this.findRunIndex(key) !== -1
  }

  delete(key: number): boolean {
    const idx = this.findRunIndex(key)
    if (idx === -1) return false
    const run = this._runs[idx]!
    this._size -= 1
    if (run.start === run.end) {
      this._runs.splice(idx, 1)
    } else if (key === run.start) {
      run.start += 1
    } else if (key === run.end) {
      run.end -= 1
    } else {
      const originalEnd = run.end
      run.end = key - 1
      this._runs.splice(idx + 1, 0, { start: key + 1, end: originalEnd, value: run.value })
    }
    return true
  }

  get size(): number {
    return this._size
  }

  clear(): void {
    this._runs = []
    this._size = 0
  }

  setRange(start: number, end: number, value: V): void {
    if (start > end) return
    let i = 0
    while (i < this._runs.length) {
      const run = this._runs[i]!
      if (run.end < start) {
        i++
        continue
      }
      if (run.start > end) break
      if (run.start >= start && run.end <= end) {
        this._size -= (run.end - run.start + 1)
        this._runs.splice(i, 1)
        continue
      }
      if (run.start < start && run.end > end) {
        this._size -= (end - start + 1)
        const after: Run<V> = { start: end + 1, end: run.end, value: run.value }
        run.end = start - 1
        this._runs.splice(i + 1, 0, after)
        break
      }
      if (run.start < start) {
        this._size -= (run.end - start + 1)
        run.end = start - 1
        i++
        continue
      }
      if (run.end > end) {
        this._size -= (end - run.start + 1)
        run.start = end + 1
        i++
        continue
      }
      i++
    }
    const insertIdx = this.findInsertIndex(start)
    this._runs.splice(insertIdx, 0, { start, end, value })
    this._size += (end - start + 1)
    this.tryMergeAdjacent(insertIdx)
  }

  getRange(start: number, end: number): Array<{ start: number; end: number; value: V }> {
    const result: Array<{ start: number; end: number; value: V }> = []
    for (const run of this._runs) {
      if (run.end < start) continue
      if (run.start > end) break
      const overlapStart = Math.max(run.start, start)
      const overlapEnd = Math.min(run.end, end)
      result.push({ start: overlapStart, end: overlapEnd, value: run.value })
    }
    return result
  }

  deleteRange(start: number, end: number): void {
    if (start > end) return
    let i = 0
    while (i < this._runs.length) {
      const run = this._runs[i]!
      if (run.end < start) {
        i++
        continue
      }
      if (run.start > end) break
      if (run.start >= start && run.end <= end) {
        this._size -= (run.end - run.start + 1)
        this._runs.splice(i, 1)
        continue
      }
      if (run.start < start && run.end > end) {
        this._size -= (end - start + 1)
        const after: Run<V> = { start: end + 1, end: run.end, value: run.value }
        run.end = start - 1
        this._runs.splice(i + 1, 0, after)
        break
      }
      if (run.start < start) {
        this._size -= (run.end - start + 1)
        run.end = start - 1
        i++
        continue
      }
      if (run.end > end) {
        this._size -= (end - run.start + 1)
        run.start = end + 1
        i++
        continue
      }
      i++
    }
  }

  runCount(): number {
    return this._runs.length
  }

  keys(): number[] {
    const result: number[] = []
    for (const run of this._runs) {
      for (let k = run.start; k <= run.end; k++) {
        result.push(k)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const run of this._runs) {
      for (let k = run.start; k <= run.end; k++) {
        result.push(run.value)
      }
    }
    return result
  }

  entries(): Array<[number, V]> {
    const result: Array<[number, V]> = []
    for (const run of this._runs) {
      for (let k = run.start; k <= run.end; k++) {
        result.push([k, run.value])
      }
    }
    return result
  }

  forEach(callback: (value: V, key: number) => void): void {
    for (const run of this._runs) {
      for (let k = run.start; k <= run.end; k++) {
        callback(run.value, k)
      }
    }
  }

  compress(): number {
    let merged = 0
    let i = 0
    while (i < this._runs.length - 1) {
      const current = this._runs[i]!
      const next = this._runs[i + 1]!
      if (current.end + 1 === next.start && current.value === next.value) {
        current.end = next.end
        this._runs.splice(i + 1, 1)
        merged++
      } else {
        i++
      }
    }
    return merged
  }

  private findRunIndex(key: number): number {
    let lo = 0
    let hi = this._runs.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      const run = this._runs[mid]!
      if (key < run.start) {
        hi = mid - 1
      } else if (key > run.end) {
        lo = mid + 1
      } else {
        return mid
      }
    }
    return -1
  }

  private findInsertIndex(key: number): number {
    let lo = 0
    let hi = this._runs.length
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (this._runs[mid]!.start < key) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  private insertRunAt(index: number, run: Run<V>): void {
    this._runs.splice(index, 0, run)
    this.tryMergeAdjacent(index)
  }

  private tryMergeAdjacent(index: number): void {
    if (!this._opts.mergeOnSet) return
    const current = this._runs[index]!
    let merged = false
    if (index > 0) {
      const prev = this._runs[index - 1]!
      if (prev.end + 1 === current.start && prev.value === current.value) {
        prev.end = current.end
        this._runs.splice(index, 1)
        merged = true
      }
    }
    const adjustedIndex = merged ? index - 1 : index
    if (adjustedIndex < this._runs.length - 1) {
      const curr = this._runs[adjustedIndex]!
      const next = this._runs[adjustedIndex + 1]!
      if (curr.end + 1 === next.start && curr.value === next.value) {
        curr.end = next.end
        this._runs.splice(adjustedIndex + 1, 1)
      }
    }
  }

  private removeFromSize(key: number): void {
    void key
  }
}

export { DEFAULT_RUN_LENGTH_MAP_OPTIONS } from './types.js'
export type { RunLengthMapOptions, Run } from './types.js'
