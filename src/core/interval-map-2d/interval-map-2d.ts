import type { Rect, Entry, IntervalMap2DOptions } from './types.js'

interface InternalEntry<V> {
  bounds: Rect
  value: V
}

export class IntervalMap2D<V> {
  private _entries: Map<string, InternalEntry<V>>
  private _options: IntervalMap2DOptions

  constructor(options?: IntervalMap2DOptions) {
    this._entries = new Map()
    this._options = options ?? {}
  }

  private normalize(x1: number, y1: number, x2: number, y2: number): Rect {
    if (this._options.normalizeBounds === false) {
      return { x1, y1, x2, y2 }
    }
    return {
      x1: Math.min(x1, x2),
      y1: Math.min(y1, y2),
      x2: Math.max(x1, x2),
      y2: Math.max(y1, y2),
    }
  }

  private static boundsKey(bounds: Rect): string {
    return `${bounds.x1},${bounds.y1},${bounds.x2},${bounds.y2}`
  }

  private static contains(bounds: Rect, x: number, y: number): boolean {
    return x >= bounds.x1 && x <= bounds.x2 && y >= bounds.y1 && y <= bounds.y2
  }

  private static rectsIntersect(a: Rect, b: Rect): boolean {
    return a.x1 <= b.x2 && a.x2 >= b.x1 && a.y1 <= b.y2 && a.y2 >= b.y1
  }

  set(x1: number, y1: number, x2: number, y2: number, value: V): void {
    const bounds = this.normalize(x1, y1, x2, y2)
    const key = IntervalMap2D.boundsKey(bounds)
    this._entries.set(key, { bounds, value })
  }

  get(x: number, y: number): V[] {
    const result: V[] = []
    const entries = Array.from(this._entries.values())
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!
      if (IntervalMap2D.contains(entry.bounds, x, y)) {
        result.push(entry.value)
      }
    }
    return result
  }

  getArea(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): Array<{ bounds: Rect; value: V }> {
    const queryBounds = this.normalize(x1, y1, x2, y2)
    const result: Array<{ bounds: Rect; value: V }> = []
    const entries = Array.from(this._entries.values())
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!
      if (IntervalMap2D.rectsIntersect(entry.bounds, queryBounds)) {
        result.push({ bounds: entry.bounds, value: entry.value })
      }
    }
    return result
  }

  has(x: number, y: number): boolean {
    const entries = Array.from(this._entries.values())
    for (let i = 0; i < entries.length; i++) {
      if (IntervalMap2D.contains(entries[i]!.bounds, x, y)) {
        return true
      }
    }
    return false
  }

  delete(x1: number, y1: number, x2: number, y2: number): boolean {
    const bounds = this.normalize(x1, y1, x2, y2)
    const key = IntervalMap2D.boundsKey(bounds)
    return this._entries.delete(key)
  }

  get size(): number {
    return this._entries.size
  }

  clear(): void {
    this._entries.clear()
  }

  keys(): Rect[] {
    const result: Rect[] = []
    const entries = Array.from(this._entries.values())
    for (let i = 0; i < entries.length; i++) {
      result.push(entries[i]!.bounds)
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    const entries = Array.from(this._entries.values())
    for (let i = 0; i < entries.length; i++) {
      result.push(entries[i]!.value)
    }
    return result
  }

  entries(): Entry<V>[] {
    const result: Entry<V>[] = []
    const allEntries = Array.from(this._entries.values())
    for (let i = 0; i < allEntries.length; i++) {
      const entry = allEntries[i]!
      result.push([entry.bounds, entry.value])
    }
    return result
  }

  forEach(cb: (value: V, bounds: Rect) => void): void {
    const entries = Array.from(this._entries.values())
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!
      cb(entry.value, entry.bounds)
    }
  }

  containsPoint(x: number, y: number): boolean {
    return this.has(x, y)
  }

  intersects(x1: number, y1: number, x2: number, y2: number): boolean {
    const queryBounds = this.normalize(x1, y1, x2, y2)
    const entries = Array.from(this._entries.values())
    for (let i = 0; i < entries.length; i++) {
      if (IntervalMap2D.rectsIntersect(entries[i]!.bounds, queryBounds)) {
        return true
      }
    }
    return false
  }
}
