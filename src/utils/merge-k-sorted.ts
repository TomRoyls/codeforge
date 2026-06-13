export class MergeKSorted<T> {
  merge(arrays: T[][], compare: (a: T, b: T) => number = (a, b) => (a as number) - (b as number)): T[] {
    const result: T[] = []
    const pointers: number[] = new Array(arrays.length).fill(0)
    while (true) {
      let minIdx = -1
      for (let i = 0; i < arrays.length; i++) {
        if (pointers[i]! < arrays[i]!.length) {
          if (minIdx === -1 || compare(arrays[i]![pointers[i]!]!, arrays[minIdx]![pointers[minIdx]!]!) < 0) {
            minIdx = i
          }
        }
      }
      if (minIdx === -1) break
      result.push(arrays[minIdx]![pointers[minIdx]!]!)
      pointers[minIdx]!++
    }
    return result
  }

  mergeN(arrays: T[][], compare: (a: T, b: T) => number = (a, b) => (a as number) - (b as number)): T[] {
    return this.merge(arrays, compare)
  }

  get isEmpty(): boolean { return true }

  toArray(): never[] { return [] }
  toString(): string { return 'MergeKSorted' }
  toJSON(): Record<string, number> { return {} }

  clone(): MergeKSorted<T> { return new MergeKSorted<T>() }
  equals(other: unknown): boolean {
    if (!(other instanceof MergeKSorted)) return false
    return true
  }
}
