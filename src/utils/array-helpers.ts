export function groupBy<T, K extends string | number | symbol>(
  items: Iterable<T>,
  keyFn: (item: T) => K,
): Map<K, T[]> {
  const groups = new Map<K, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }
  return groups
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) return [ [...items] ]
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

export function unique<T>(items: Iterable<T>): T[] {
  return [...new Set(items)]
}

export function uniqueBy<T, K>(items: Iterable<T>, keyFn: (item: T) => K): T[] {
  const seen = new Set<K>()
  const result: T[] = []
  for (const item of items) {
    const key = keyFn(item)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }
  return result
}

export function partition<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const truthy: T[] = []
  const falsy: T[] = []
  for (const item of items) {
    if (predicate(item)) {
      truthy.push(item)
    } else {
      falsy.push(item)
    }
  }
  return [truthy, falsy]
}

export function zip<A, B>(a: readonly A[], b: readonly B[]): [A, B][] {
  const length = Math.min(a.length, b.length)
  const result: [A, B][] = []
  for (let i = 0; i < length; i++) {
    result.push([a[i]!, b[i]!])
  }
  return result
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]!
    result[i] = result[j]!
    result[j] = temp
  }
  return result
}

export function last<T>(items: readonly T[]): T | undefined {
  return items.length > 0 ? items[items.length - 1] : undefined
}

export function first<T>(items: readonly T[]): T | undefined {
  return items[0]
}

export function isEmpty(items: readonly unknown[]): boolean {
  return items.length === 0
}

export function sortedBy<T>(items: readonly T[], keyFn: (item: T) => number): T[] {
  return [...items].sort((a, b) => keyFn(a) - keyFn(b))
}

export function sortedByDesc<T>(items: readonly T[], keyFn: (item: T) => number): T[] {
  return [...items].sort((a, b) => keyFn(b) - keyFn(a))
}

export function flatMap<A, B>(items: readonly A[], fn: (item: A) => B[]): B[] {
  const result: B[] = []
  for (const item of items) {
    result.push(...fn(item))
  }
  return result
}

/** Count occurrences of each item, returning a Map of item → count. */
export function tally<T>(items: Iterable<T>): Map<T, number> {
  const counts = new Map<T, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  return counts
}

/** Sum all numeric values in an iterable. Returns 0 for empty iterables. */
export function sum(items: Iterable<number>): number {
  let total = 0
  for (const n of items) {
    total += n
  }
  return total
}

/** Compute the arithmetic mean of numeric values. Returns 0 for empty iterables. */
export function average(items: Iterable<number>): number {
  let total = 0
  let count = 0
  for (const n of items) {
    total += n
    count++
  }
  return count === 0 ? 0 : total / count
}
