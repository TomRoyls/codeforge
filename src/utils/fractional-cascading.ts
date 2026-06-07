export class FractionalCascading {
  private lists: number[][]
  private bridges: Array<Map<number, number>>
  private built = false

  constructor(lists: number[][]) {
    this.lists = lists.map((l) => [...l].sort((a, b) => a - b))
    this.bridges = new Array(this.lists.length)
  }

  private build(): void {
    if (this.built) return
    this.built = true
    const k = this.lists.length
    for (let i = 0; i < k - 1; i++) {
      const current = this.lists[i]!
      const next = this.lists[i + 1]!
      const bridge = new Map<number, number>()
      let ni = 0
      for (let ci = 0; ci < current.length; ci++) {
        while (ni < next.length && next[ni]! < current[ci]!) {
          ni++
        }
        bridge.set(ci, ni)
      }
      bridge.set(current.length, ni)
      this.bridges[i] = bridge
    }
  }

  search(target: number): number[] {
    this.build()
    if (this.lists.length === 0) return []
    const results: number[] = new Array(this.lists.length).fill(-1)
    let pos = this.lowerBound(this.lists[0]!, target)
    if (pos < this.lists[0]!.length && this.lists[0]![pos] === target) {
      results[0] = pos
    }
    for (let i = 1; i < this.lists.length; i++) {
      const bridge = this.bridges[i - 1]
      const startHint = bridge ? (bridge.get(pos) ?? 0) : 0
      const list = this.lists[i]!
      let lo = Math.max(0, startHint - 1)
      while (lo > 0 && list[lo - 1]! >= target) {
        lo--
      }
      let hi = Math.min(list.length, startHint + 1)
      while (hi < list.length && list[hi]! < target) {
        hi++
      }
      let searchPos: number
      if (hi - lo <= 4) {
        searchPos = lo
        while (searchPos < hi && list[searchPos]! < target) {
          searchPos++
        }
      } else {
        searchPos = this.lowerBound(list, target)
      }
      pos = searchPos
      if (searchPos < list.length && list[searchPos] === target) {
        results[i] = searchPos
      }
    }
    return results
  }

  private lowerBound(list: number[], target: number): number {
    let lo = 0
    let hi = list.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (list[mid]! < target) {
        lo = mid + 1
      } else {
        hi = mid
      }
    }
    return lo
  }

  get listCount(): number {
    return this.lists.length
  }

  getList(index: number): number[] {
    return this.lists[index] ? [...this.lists[index]!] : []
  }

  toString(): string {
    return `FractionalCascading(${this.lists.length} lists)`
  }

  toJSON(): number[][] {
    return this.lists.map(l => [...l])
  }

  clone(): FractionalCascading {
    return new FractionalCascading(this.lists)
  }

  equals(other: unknown): boolean {
    if (!(other instanceof FractionalCascading)) return false
    if (this.lists.length !== other.lists.length) return false
    for (let i = 0; i < this.lists.length; i++) {
      if (this.lists[i]!.length !== other.lists[i]!.length) return false
      for (let j = 0; j < this.lists[i]!.length; j++) {
        if (this.lists[i]![j] !== other.lists[i]![j]) return false
      }
    }
    return true
  }
}
