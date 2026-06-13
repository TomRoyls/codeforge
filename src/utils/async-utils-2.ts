export class AsyncUtils2 {
  static async each<T>(items: T[], fn: (item: T) => Promise<void>): Promise<void> {
    for (const item of items) await fn(item)
  }

  static async filter<T>(items: T[], pred: (item: T) => Promise<boolean>): Promise<T[]> {
    const results: T[] = []
    for (const item of items) {
      if (await pred(item)) results.push(item)
    }
    return results
  }

  static async reduce<T, R>(items: T[], fn: (acc: R, item: T) => Promise<R>, initial: R): Promise<R> {
    let acc = initial
    for (const item of items) acc = await fn(acc, item)
    return acc
  }

  static async some<T>(items: T[], pred: (item: T) => Promise<boolean>): Promise<boolean> {
    for (const item of items) { if (await pred(item)) return true }
    return false
  }

  static async every<T>(items: T[], pred: (item: T) => Promise<boolean>): Promise<boolean> {
    for (const item of items) { if (!(await pred(item))) return false }
    return true
  }

  static async find<T>(items: T[], pred: (item: T) => Promise<boolean>): Promise<T | undefined> {
    for (const item of items) { if (await pred(item)) return item }
    return undefined
  }

  static async groupBy<T>(items: T[], fn: (item: T) => Promise<string>): Promise<Map<string, T[]>> {
    const groups = new Map<string, T[]>()
    for (const item of items) {
      const key = await fn(item)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(item)
    }
    return groups
  }

  static async chunk<T>(items: T[], fn: (item: T) => Promise<unknown>, size: number): Promise<T[][]> {
    const chunks: T[][] = []
    for (let i = 0; i < items.length; i += size) {
      const chunk = items.slice(i, i + size)
      await Promise.all(chunk.map(fn))
      chunks.push(chunk)
    }
    return chunks
  }

  static async race<T>(promises: Promise<T>[]): Promise<T> {
    return Promise.race(promises)
  }

  static async waterfall<T>(fns: ((prev: T) => Promise<T>)[], initial: T): Promise<T> {
    let result = initial
    for (const fn of fns) result = await fn(result)
    return result
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): AsyncUtils2 { return new AsyncUtils2() }
  equals(other: unknown): boolean { return other instanceof AsyncUtils2 }
}
