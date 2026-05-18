export interface DeepCloneOptions {
  maxDepth: number
}

export function deepClone<T>(value: T, options: Partial<DeepCloneOptions> = {}): T {
  const maxDepth = options.maxDepth ?? 100
  return cloneInternal(value, new Map(), 0, maxDepth) as T
}

function cloneInternal(
  value: unknown,
  seen: Map<unknown, unknown>,
  depth: number,
  maxDepth: number,
): unknown {
  if (depth >= maxDepth) return value

  if (value === null || typeof value !== 'object') {
    return value
  }

  if (seen.has(value)) {
    return seen.get(value)
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags)
  }

  if (value instanceof Map) {
    const cloned = new Map()
    seen.set(value, cloned)
    value.forEach((v, k) => {
      cloned.set(cloneInternal(k, seen, depth + 1, maxDepth), cloneInternal(v, seen, depth + 1, maxDepth))
    })
    return cloned
  }

  if (value instanceof Set) {
    const cloned = new Set()
    seen.set(value, cloned)
    value.forEach((v) => {
      cloned.add(cloneInternal(v, seen, depth + 1, maxDepth))
    })
    return cloned
  }

  if (Array.isArray(value)) {
    const cloned: unknown[] = []
    seen.set(value, cloned)
    for (let i = 0; i < value.length; i++) {
      cloned.push(cloneInternal(value[i], seen, depth + 1, maxDepth))
    }
    return cloned
  }

  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    const TypedArrayConstructor = value.constructor as new (buffer: ArrayBufferLike) => ArrayBufferView & ArrayLike<unknown>
    return new TypedArrayConstructor((value as ArrayBufferView & ArrayLike<unknown>).buffer.slice(0))
  }

  if (value instanceof ArrayBuffer) {
    return value.slice(0)
  }

  const proto = Object.getPrototypeOf(value)
  const cloned = Object.create(proto)
  seen.set(value, cloned)

  for (const key of Object.keys(value as Record<string, unknown>)) {
    const val = (value as Record<string, unknown>)[key]
    ;(cloned as Record<string, unknown>)[key] = cloneInternal(val, seen, depth + 1, maxDepth)
  }

  return cloned
}
