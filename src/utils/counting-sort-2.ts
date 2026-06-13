export class CountingSort2 {
  sort(arr: number[]): number[] {
    if (arr.length === 0) return []
    const min = Math.min(...arr)
    const max = Math.max(...arr)
    const range = max - min + 1
    const count = new Array(range).fill(0)
    for (const v of arr) count[v - min]++
    const result: number[] = []
    for (let i = 0; i < range; i++) {
      for (let j = 0; j < count[i]!; j++) result.push(i + min)
    }
    return result
  }

  sortStable(arr: Array<{ key: number; value: unknown }>): Array<{ key: number; value: unknown }> {
    if (arr.length === 0) return []
    const min = Math.min(...arr.map((x) => x.key))
    const max = Math.max(...arr.map((x) => x.key))
    const range = max - min + 1
    const buckets: Array<Array<{ key: number; value: unknown }>> = Array.from({ length: range }, () => [])
    for (const item of arr) buckets[item.key - min]!.push(item)
    const result: Array<{ key: number; value: unknown }> = []
    for (const bucket of buckets) result.push(...bucket)
    return result
  }

  get name(): string { return 'CountingSort2' }

  toString(): string { return JSON.stringify({ name: this.name }) }
  toJSON(): Record<string, string> { return { name: this.name } }

  clone(): CountingSort2 { return new CountingSort2() }
  equals(other: unknown): boolean { return other instanceof CountingSort2 }
  toArray(): string[] { return ['counting-sort-2'] }
}
