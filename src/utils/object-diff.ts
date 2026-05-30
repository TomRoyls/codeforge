export type DiffType = 'added' | 'changed' | 'removed' | 'unchanged'

export interface DiffEntry {
  path: string
  type: DiffType
  oldValue: unknown
  newValue: unknown
}

export interface DiffOptions {
  includeUnchanged?: boolean
  maxDepth?: number
  arrayOrderMatters?: boolean
}

const DEFAULT_DIFF_OPTIONS: DiffOptions = {
  includeUnchanged: false,
  maxDepth: 10,
  arrayOrderMatters: true,
}

export function diff(
  oldObj: unknown,
  newObj: unknown,
  options?: DiffOptions,
): DiffEntry[] {
  const opts = { ...DEFAULT_DIFF_OPTIONS, ...options }
  const results: DiffEntry[] = []
  compare(oldObj, newObj, '', results, opts, 0)
  return results
}

function compare(
  oldVal: unknown,
  newVal: unknown,
  path: string,
  results: DiffEntry[],
  options: DiffOptions,
  depth: number,
): void {
  if (oldVal === newVal) {
    if (options.includeUnchanged) {
      results.push({ path, type: 'unchanged', oldValue: oldVal, newValue: newVal })
    }
    return
  }

  if (oldVal === null || newVal === null) {
    results.push({ path, type: classifyChange(oldVal, newVal), oldValue: oldVal, newValue: newVal })
    return
  }

  if (typeof oldVal !== typeof newVal) {
    results.push({ path, type: 'changed', oldValue: oldVal, newValue: newVal })
    return
  }

  if (Array.isArray(oldVal) && Array.isArray(newVal)) {
    if (!options.arrayOrderMatters) {
      compareArraysUnordered(oldVal, newVal, path, results, options, depth)
    } else {
      compareArrays(oldVal, newVal, path, results, options, depth)
    }
    return
  }

  if (typeof oldVal === 'object' && typeof newVal === 'object') {
    if (depth >= (options.maxDepth ?? 10)) {
      results.push({ path, type: 'changed', oldValue: oldVal, newValue: newVal })
      return
    }
    compareObjects(
      oldVal as Record<string, unknown>,
      newVal as Record<string, unknown>,
      path,
      results,
      options,
      depth,
    )
    return
  }

  results.push({ path, type: 'changed', oldValue: oldVal, newValue: newVal })
}

function classifyChange(oldVal: unknown, newVal: unknown): DiffType {
  if (oldVal === undefined && newVal !== undefined) return 'added'
  if (oldVal !== undefined && newVal === undefined) return 'removed'
  return 'changed'
}

function compareObjects(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  basePath: string,
  results: DiffEntry[],
  options: DiffOptions,
  depth: number,
): void {
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])

  for (const key of allKeys) {
    const childPath = basePath ? `${basePath}.${key}` : key
    const hasOld = Object.prototype.hasOwnProperty.call(oldObj, key)
    const hasNew = Object.prototype.hasOwnProperty.call(newObj, key)

    if (!hasOld && hasNew) {
      results.push({ path: childPath, type: 'added', oldValue: undefined, newValue: newObj[key] })
    } else if (hasOld && !hasNew) {
      results.push({ path: childPath, type: 'removed', oldValue: oldObj[key], newValue: undefined })
    } else {
      compare(oldObj[key], newObj[key], childPath, results, options, depth + 1)
    }
  }
}

function compareArrays(
  oldArr: unknown[],
  newArr: unknown[],
  basePath: string,
  results: DiffEntry[],
  options: DiffOptions,
  depth: number,
): void {
  const maxLen = Math.max(oldArr.length, newArr.length)
  for (let i = 0; i < maxLen; i++) {
    const childPath = `${basePath}[${i}]`
    if (i >= oldArr.length) {
      results.push({ path: childPath, type: 'added', oldValue: undefined, newValue: newArr[i] })
    } else if (i >= newArr.length) {
      results.push({ path: childPath, type: 'removed', oldValue: oldArr[i], newValue: undefined })
    } else {
      compare(oldArr[i], newArr[i], childPath, results, options, depth + 1)
    }
  }
}

function compareArraysUnordered(
  oldArr: unknown[],
  newArr: unknown[],
  basePath: string,
  results: DiffEntry[],
  _options: DiffOptions,
  _depth: number,
): void {
  void _options, _depth
  const oldCopy = [...oldArr]
  const newCopy = [...newArr]
  const matched = new Set<number>()

  for (let i = 0; i < oldCopy.length; i++) {
    let found = false
    for (let j = 0; j < newCopy.length; j++) {
      if (!matched.has(j) && JSON.stringify(oldCopy[i]) === JSON.stringify(newCopy[j])) {
        matched.add(j)
        found = true
        break
      }
    }
    if (!found) {
      results.push({ path: `${basePath}[${i}]`, type: 'removed', oldValue: oldCopy[i], newValue: undefined })
    }
  }

  for (let j = 0; j < newCopy.length; j++) {
    if (!matched.has(j)) {
      results.push({ path: `${basePath}[${j}]`, type: 'added', oldValue: undefined, newValue: newCopy[j] })
    }
  }
}

export function diffSummary(entries: DiffEntry[]): {
  added: number
  changed: number
  removed: number
  unchanged: number
  total: number
} {
  let added = 0
  let changed = 0
  let removed = 0
  let unchanged = 0
  for (const entry of entries) {
    switch (entry.type) {
      case 'added': added++; break
      case 'changed': changed++; break
      case 'removed': removed++; break
      case 'unchanged': unchanged++; break
    }
  }
  return { added, changed, removed, unchanged, total: entries.length }
}

export function applyPatch(target: Record<string, unknown>, entries: DiffEntry[]): Record<string, unknown> {
  const result = structuredClone(target)
  for (const entry of entries) {
    if (entry.type === 'removed') {
      deleteNestedKey(result, entry.path)
    } else if (entry.type === 'added' || entry.type === 'changed') {
      setNestedKey(result, entry.path, entry.newValue)
    }
  }
  return result
}

function deleteNestedKey(obj: Record<string, unknown>, path: string): void {
  const parts = path.split('.')
  let current: unknown = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof current !== 'object' || current === null) return
    current = (current as Record<string, unknown>)[parts[i]!]
  }
  if (typeof current === 'object' && current !== null) {
    delete (current as Record<string, unknown>)[parts[parts.length - 1]!]
  }
}

function setNestedKey(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }
  current[parts[parts.length - 1]!] = value
}
