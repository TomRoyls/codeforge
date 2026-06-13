export class KWayMerge {
  merge(arrays: number[][]): number[] {
    const result: number[] = []
    const indices = arrays.map(() => 0)

    while (true) {
      let minArr = -1
      let minVal = Infinity
      for (let i = 0; i < arrays.length; i++) {
        if (indices[i]! < arrays[i]!.length && arrays[i]![indices[i]!] < minVal) {
          minVal = arrays[i]![indices[i]!]!
          minArr = i
        }
      }
      if (minArr === -1) break
      result.push(minVal)
      indices[minArr]!++
    }
    return result
  }

  mergeWithIterator(arrays: number[][]): IterableIterator<number> {
    const result = this.merge(arrays)
    return result[Symbol.iterator]()
  }

  get name(): string { return 'KWayMerge' }

  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }
  clone(): KWayMerge { return new KWayMerge() }
  equals(other: unknown): boolean { return other instanceof KWayMerge }
  toArray(): string[] { return ['k-way-merge'] }
}
