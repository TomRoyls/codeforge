export interface MemoizeOptions {
  maxSize: number
  ttlMs: number
}

interface CacheEntry<T> {
  value: T
  expiry: number
}

const DEFAULT_OPTIONS: MemoizeOptions = {
  maxSize: 100,
  ttlMs: Infinity,
}

export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
  options: Partial<MemoizeOptions> = {},
): (...args: A) => R {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const cache = new Map<string, CacheEntry<R>>()

  const memoized = function (this: unknown, ...args: A): R {
    const key = serializeArgs(args)

    const entry = cache.get(key)
    if (entry !== undefined) {
      if (Date.now() < entry.expiry) {
        return entry.value
      }
      cache.delete(key)
    }

    const value = fn.apply(this, args)

    if (cache.size >= opts.maxSize) {
      const firstKey = cache.keys().next()
      if (!firstKey.done) {
        cache.delete(firstKey.value)
      }
    }

    cache.set(key, {
      value,
      expiry: opts.ttlMs === Infinity ? Infinity : Date.now() + opts.ttlMs,
    })

    return value
  } as ((...args: A) => R) & { _cache: Map<string, CacheEntry<R>> }

  memoized._cache = cache
  return memoized
}

function serializeArgs(args: unknown[]): string {
  return args.map((a) => {
    if (a === null) return 'null'
    if (a === undefined) return 'undefined'
    if (typeof a === 'object') {
      try { return JSON.stringify(a) } catch { return String(a) }
    }
    return String(a)
  }).join('\x00')
}

export function clearMemoized(fn: (...args: unknown[]) => unknown): void {
  if (typeof fn === 'function' && '_cache' in fn) {
    ;(fn as unknown as { _cache: Map<unknown, unknown> })._cache.clear()
  }
}
