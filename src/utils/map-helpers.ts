/**
 * Increment a numeric value in a Map by a given delta.
 * If the key doesn't exist, it's treated as 0 before incrementing.
 *
 * @example
 * ```ts
 * const counts = new Map<string, number>()
 * increment(counts, 'foo')     // counts: { foo => 1 }
 * increment(counts, 'foo', 3)  // counts: { foo => 4 }
 * ```
 */
export function increment<K>(map: Map<K, number>, key: K, delta: number = 1): void {
  map.set(key, (map.get(key) ?? 0) + delta)
}

/**
 * Append a value to an array stored in a Map.
 * If the key doesn't exist, a new array is created with the value.
 *
 * @example
 * ```ts
 * const groups = new Map<string, number[]>()
 * append(groups, 'a', 1)  // groups: { a => [1] }
 * append(groups, 'a', 2)  // groups: { a => [1, 2] }
 * ```
 */
export function append<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const existing = map.get(key)
  if (existing) {
    existing.push(value)
  } else {
    map.set(key, [value])
  }
}
