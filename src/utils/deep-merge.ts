export type MergeStrategy = 'replace' | 'concat' | 'merge-by-key'

export interface DeepMergeOptions {
  arrayStrategy: MergeStrategy
  arrayKey?: string
  maxDepth: number
}

const DEFAULT_OPTIONS: DeepMergeOptions = {
  arrayStrategy: 'replace',
  maxDepth: 100,
}

export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>,
  options: Partial<DeepMergeOptions> = {},
): T {
  const opts: DeepMergeOptions = { ...DEFAULT_OPTIONS, ...options }
  return deepMergeInternal(base, override, opts, 0) as T
}

function deepMergeInternal(
  base: unknown,
  override: unknown,
  options: DeepMergeOptions,
  depth: number,
): unknown {
  if (depth >= options.maxDepth) return override

  if (
    typeof base !== 'object' || base === null ||
    typeof override !== 'object' || override === null ||
    Array.isArray(base) || Array.isArray(override)
  ) {
    return override
  }

  const result: Record<string, unknown> = { ...base as Record<string, unknown> }

  for (const key of Object.keys(override as Record<string, unknown>)) {
    if (!Object.hasOwn(override, key)) continue

    const baseVal = (base as Record<string, unknown>)[key]
    const overVal = (override as Record<string, unknown>)[key]

    if (
      typeof baseVal === 'object' && baseVal !== null && !Array.isArray(baseVal) &&
      typeof overVal === 'object' && overVal !== null && !Array.isArray(overVal)
    ) {
      result[key] = deepMergeInternal(baseVal, overVal, options, depth + 1)
    } else {
      result[key] = overVal
    }
  }

  return result
}
