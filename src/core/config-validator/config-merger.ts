import type {
  MergeStrategy,
  MergeConflict,
  MergeResult,
} from './types.js'
import { DEFAULT_MERGE_STRATEGY } from './types.js'
import { unique } from '../../utils/array-helpers.js'

export class ConfigMerger {
  merge(
    base: Record<string, unknown>,
    override: Record<string, unknown>,
    strategy: MergeStrategy = DEFAULT_MERGE_STRATEGY,
  ): MergeResult {
    const config: Record<string, unknown> = { ...base }
    const conflicts: MergeConflict[] = []
    const applied: string[] = []

    for (const [key, overrideValue] of Object.entries(override)) {
      const baseValue = base[key]
      const path = key

      if (!(key in base)) {
        config[key] = overrideValue
        applied.push(path)
        continue
      }

      if (this.isPlainObject(baseValue) && this.isPlainObject(overrideValue)) {
        if (strategy.objects === 'deep') {
          const nested = this.mergeDeep(
            baseValue as Record<string, unknown>,
            overrideValue as Record<string, unknown>,
          )
          config[key] = nested
          conflicts.push({
            path,
            baseValue,
            overrideValue,
            resolvedValue: nested,
            strategy: 'deep-merge',
          })
        } else if (strategy.objects === 'shallow') {
          const shallowResult: Record<string, unknown> = {
            ...(baseValue as Record<string, unknown>),
            ...(overrideValue as Record<string, unknown>),
          }
          config[key] = shallowResult
          conflicts.push({
            path,
            baseValue,
            overrideValue,
            resolvedValue: shallowResult,
            strategy: 'shallow-merge',
          })
        } else {
          config[key] = overrideValue
          conflicts.push({
            path,
            baseValue,
            overrideValue,
            resolvedValue: overrideValue,
            strategy: 'replace',
          })
        }
        applied.push(path)
      } else if (Array.isArray(baseValue) && Array.isArray(overrideValue)) {
        if (strategy.arrays === 'append') {
          const merged = [...baseValue, ...overrideValue]
          config[key] = merged
          conflicts.push({
            path,
            baseValue,
            overrideValue,
            resolvedValue: merged,
            strategy: 'append',
          })
        } else if (strategy.arrays === 'merge') {
          const merged = unique([...baseValue, ...overrideValue])
          config[key] = merged
          conflicts.push({
            path,
            baseValue,
            overrideValue,
            resolvedValue: merged,
            strategy: 'merge-unique',
          })
        } else {
          config[key] = overrideValue
          conflicts.push({
            path,
            baseValue,
            overrideValue,
            resolvedValue: overrideValue,
            strategy: 'replace',
          })
        }
        applied.push(path)
      } else {
        if (strategy.scalars === 'keep-existing') {
          config[key] = baseValue
          conflicts.push({
            path,
            baseValue,
            overrideValue,
            resolvedValue: baseValue,
            strategy: 'keep-existing',
          })
        } else {
          config[key] = overrideValue
          conflicts.push({
            path,
            baseValue,
            overrideValue,
            resolvedValue: overrideValue,
            strategy: 'override',
          })
        }
        applied.push(path)
      }
    }

    return { config, conflicts, applied }
  }

  mergeDeep(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...target }

    for (const [key, sourceValue] of Object.entries(source)) {
      const targetValue = result[key]

      if (
        this.isPlainObject(targetValue) &&
        this.isPlainObject(sourceValue)
      ) {
        result[key] = this.mergeDeep(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
        )
      } else {
        result[key] = sourceValue
      }
    }

    return result
  }

  resolveConflicts(
    conflicts: MergeConflict[],
    strategy: MergeStrategy,
  ): MergeConflict[] {
    return conflicts.map((conflict) => {
      const baseObj = conflict.baseValue
      const overrideObj = conflict.overrideValue

      if (this.isPlainObject(baseObj) && this.isPlainObject(overrideObj)) {
        if (strategy.objects === 'deep') {
          return {
            ...conflict,
            resolvedValue: this.mergeDeep(
              baseObj as Record<string, unknown>,
              overrideObj as Record<string, unknown>,
            ),
            strategy: 'deep-merge',
          }
        }
        if (strategy.objects === 'shallow') {
          return {
            ...conflict,
            resolvedValue: {
              ...(baseObj as Record<string, unknown>),
              ...(overrideObj as Record<string, unknown>),
            },
            strategy: 'shallow-merge',
          }
        }
        return {
          ...conflict,
          resolvedValue: overrideObj,
          strategy: 'replace',
        }
      }

      if (Array.isArray(baseObj) && Array.isArray(overrideObj)) {
        if (strategy.arrays === 'append') {
          return {
            ...conflict,
            resolvedValue: [...baseObj, ...overrideObj],
            strategy: 'append',
          }
        }
        if (strategy.arrays === 'merge') {
          return {
            ...conflict,
            resolvedValue: unique([...baseObj, ...overrideObj]),
            strategy: 'merge-unique',
          }
        }
        return {
          ...conflict,
          resolvedValue: overrideObj,
          strategy: 'replace',
        }
      }

      if (strategy.scalars === 'keep-existing') {
        return {
          ...conflict,
          resolvedValue: baseObj,
          strategy: 'keep-existing',
        }
      }
      return {
        ...conflict,
        resolvedValue: overrideObj,
        strategy: 'override',
      }
    })
  }

  getDiff(
    base: Record<string, unknown>,
    override: Record<string, unknown>,
  ): { added: string[]; removed: string[]; changed: string[] } {
    const added: string[] = []
    const removed: string[] = []
    const changed: string[] = []

    for (const key of Object.keys(override)) {
      if (!(key in base)) {
        added.push(key)
      } else if (base[key] !== override[key]) {
        changed.push(key)
      }
    }

    for (const key of Object.keys(base)) {
      if (!(key in override)) {
        removed.push(key)
      }
    }

    return { added, removed, changed }
  }

  flatten(
    config: Record<string, unknown>,
    prefix = '',
  ): Map<string, unknown> {
    const result = new Map<string, unknown>()

    for (const [key, value] of Object.entries(config)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (this.isPlainObject(value)) {
        const nested = this.flatten(
          value as Record<string, unknown>,
          fullKey,
        )
        for (const [nestedKey, nestedValue] of nested) {
          result.set(nestedKey, nestedValue)
        }
      } else {
        result.set(fullKey, value)
      }
    }

    return result
  }

  private isPlainObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}
