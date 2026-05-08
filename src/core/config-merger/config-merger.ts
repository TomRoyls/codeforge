import type {
  ConfigValue,
  MergeConflict,
  MergeOptions,
  MergeResult,
  MergeStats,
  ConfigLayer,
} from './types.js'

const DEFAULT_OPTIONS: MergeOptions = {
  strategy: 'deep',
  arrays: 'replace',
  ignoreKeys: [],
  priority: 'right',
}

function isObject(value: ConfigValue): value is { [key: string]: ConfigValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class ConfigMerger {
  private options: MergeOptions
  private layers: ConfigLayer[] = []
  private lastConflicts: MergeConflict[] = []

  constructor(options?: Partial<MergeOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  merge(
    left: Record<string, ConfigValue>,
    right: Record<string, ConfigValue>,
  ): MergeResult {
    const conflicts: MergeConflict[] = []
    if (this.options.strategy === 'replace') {
      const merged: Record<string, ConfigValue> = {}
      for (const key of Object.keys(right)) {
        if (!this.options.ignoreKeys.includes(key)) {
          merged[key] = right[key]!
        }
      }
      const stats = this.computeStats(left, right, merged)
      this.lastConflicts = conflicts
      return { merged, conflicts, stats }
    }
    const merged = this.performMerge(left, right, [], conflicts)
    const stats = this.computeStats(left, right, merged)
    this.lastConflicts = conflicts
    return { merged, conflicts, stats }
  }

  mergeAll(configs: Record<string, ConfigValue>[]): MergeResult {
    if (configs.length === 0) {
      return {
        merged: {},
        conflicts: [],
        stats: { totalKeys: 0, addedKeys: 0, removedKeys: 0, modifiedKeys: 0, unchangedKeys: 0 },
      }
    }
    let result: MergeResult = this.merge({}, configs[0]!)
    for (let i = 1; i < configs.length; i++) {
      result = this.merge(result.merged, configs[i]!)
    }
    return result
  }

  addLayer(layer: ConfigLayer): void {
    this.layers.push(layer)
  }

  removeLayer(name: string): void {
    this.layers = this.layers.filter((l) => l.name !== name)
  }

  mergeLayers(): MergeResult {
    const sorted = [...this.layers].sort((a, b) => a.priority - b.priority)
    if (sorted.length === 0) {
      return {
        merged: {},
        conflicts: [],
        stats: { totalKeys: 0, addedKeys: 0, removedKeys: 0, modifiedKeys: 0, unchangedKeys: 0 },
      }
    }
    let result: MergeResult = this.merge({}, sorted[0]!.config)
    for (let i = 1; i < sorted.length; i++) {
      result = this.merge(result.merged, sorted[i]!.config)
    }
    return result
  }

  getLayers(): ConfigLayer[] {
    return [...this.layers].sort((a, b) => a.priority - b.priority)
  }

  deepMerge(
    left: Record<string, ConfigValue>,
    right: Record<string, ConfigValue>,
  ): Record<string, ConfigValue> {
    const conflicts: MergeConflict[] = []
    return this.performMerge(left, right, [], conflicts)
  }

  shallowMerge(
    left: Record<string, ConfigValue>,
    right: Record<string, ConfigValue>,
  ): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = { ...left }
    for (const key of Object.keys(right)) {
      if (this.options.ignoreKeys.includes(key)) continue
      result[key] = right[key]!
    }
    return result
  }

  replaceMerge(
    left: Record<string, ConfigValue>,
    right: Record<string, ConfigValue>,
  ): Record<string, ConfigValue> {
    void left
    return { ...right }
  }

  getDiff(
    left: Record<string, ConfigValue>,
    right: Record<string, ConfigValue>,
  ): MergeStats {
    return this.computeStats(left, right, this.performMerge(left, right, [], []))
  }

  getPathValue(config: Record<string, ConfigValue>, path: string): ConfigValue | undefined {
    const parts = path.split('.')
    let current: ConfigValue = config
    for (const part of parts) {
      if (current === null || current === undefined) return undefined
      if (Array.isArray(current)) {
        const idx = Number(part)
        if (!Number.isNaN(idx) && idx >= 0 && idx < current.length) {
          current = current[idx]!
        } else {
          return undefined
        }
      } else if (isObject(current)) {
        if (part in current) {
          current = current[part]!
        } else {
          return undefined
        }
      } else {
        return undefined
      }
    }
    return current
  }

  setPathValue(
    config: Record<string, ConfigValue>,
    path: string,
    value: ConfigValue,
  ): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = structuredClone(config)
    const parts = path.split('.')
    let current: Record<string, ConfigValue> = result
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!
      if (!(part in current) || !isObject(current[part] ?? null)) {
        current[part] = {}
      }
      current = current[part] as Record<string, ConfigValue>
    }
    current[parts[parts.length - 1]!] = value
    return result
  }

  getConflicts(): MergeConflict[] {
    return this.lastConflicts
  }

  getOptions(): MergeOptions {
    return { ...this.options }
  }

  reset(): void {
    this.layers = []
    this.lastConflicts = []
  }

  private performMerge(
    left: Record<string, ConfigValue>,
    right: Record<string, ConfigValue>,
    path: string[],
    conflicts: MergeConflict[],
  ): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = { ...left }
    for (const key of Object.keys(right)) {
      if (this.options.ignoreKeys.includes(key)) continue
      const leftVal: ConfigValue | undefined = key in left ? left[key] : undefined
      const rightVal: ConfigValue = right[key]!
      const currentPath = [...path, key]
      if (leftVal === undefined) {
        result[key] = rightVal
      } else if (leftVal === rightVal) {
        result[key] = leftVal
      } else if (this.options.strategy === 'replace') {
        result[key] = rightVal
      } else if (this.options.strategy === 'shallow') {
        result[key] = rightVal
        if (path.length === 0) {
          conflicts.push({
            path: currentPath,
            leftValue: leftVal,
            rightValue: rightVal,
            resolved: rightVal,
            strategy: 'shallow',
          })
        }
      } else {
        if (isObject(leftVal) && isObject(rightVal)) {
          result[key] = this.performMerge(
            leftVal,
            rightVal,
            currentPath,
            conflicts,
          )
        } else if (
          Array.isArray(leftVal) &&
          Array.isArray(rightVal) &&
          this.options.arrays === 'deep'
        ) {
          const mergedArr: ConfigValue[] = [...leftVal]
          for (let i = 0; i < rightVal.length; i++) {
            if (i < mergedArr.length) {
              if (
                isObject(mergedArr[i] ?? null) &&
                isObject(rightVal[i] ?? null)
              ) {
                mergedArr[i] = this.performMerge(
                  mergedArr[i]! as Record<string, ConfigValue>,
                  rightVal[i]! as Record<string, ConfigValue>,
                  [...currentPath, String(i)],
                  conflicts,
                )
              } else {
                mergedArr[i] = rightVal[i]!
              }
            } else {
              mergedArr.push(rightVal[i]!)
            }
          }
          result[key] = mergedArr
        } else {
          const resolved = this.options.priority === 'right' ? rightVal : leftVal
          conflicts.push({
            path: currentPath,
            leftValue: leftVal,
            rightValue: rightVal,
            resolved,
            strategy: this.options.strategy,
          })
          result[key] = resolved
        }
      }
    }
    return result
  }

  private computeStats(
    left: Record<string, ConfigValue>,
    right: Record<string, ConfigValue>,
    merged: Record<string, ConfigValue>,
  ): MergeStats {
    const leftKeys = new Set(Object.keys(left))
    const rightKeys = new Set(Object.keys(right))
    const allKeys = new Set([...leftKeys, ...rightKeys])
    let addedKeys = 0
    let removedKeys = 0
    let modifiedKeys = 0
    let unchangedKeys = 0
    for (const key of allKeys) {
      const inLeft = leftKeys.has(key)
      const inRight = rightKeys.has(key)
      if (inLeft && inRight) {
        if (left[key] === right[key]) {
          unchangedKeys++
        } else {
          modifiedKeys++
        }
      } else if (inRight && !inLeft) {
        addedKeys++
      } else {
        removedKeys++
      }
    }
    return {
      totalKeys: Object.keys(merged).length,
      addedKeys,
      removedKeys,
      modifiedKeys,
      unchangedKeys,
    }
  }
}
