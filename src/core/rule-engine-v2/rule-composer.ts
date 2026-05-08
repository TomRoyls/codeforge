import type { RuleV2, RuleGroup, RuleOverride, RuleSet } from './types.js'
import { RuleRegistryV2 } from './rule-registry-v2.js'

export class RuleComposer {
  createGroup(name: string, ruleIds: string[], description: string): RuleGroup {
    return {
      name,
      rules: [...ruleIds],
      description,
      enabled: true,
    }
  }

  mergeRuleSets(sets: RuleSet[]): RuleSet {
    if (sets.length === 0) {
      return {
        name: 'merged',
        description: 'Merged empty rule set',
        rules: new Map(),
        extends: [],
      }
    }
    const mergedRules = new Map<string, Partial<RuleV2>>()
    const extendsList: string[] = []
    for (const set of sets) {
      for (const [id, rule] of set.rules) {
        const existing = mergedRules.get(id)
        if (existing) {
          mergedRules.set(id, { ...existing, ...rule })
        } else {
          mergedRules.set(id, { ...rule })
        }
      }
      if (set.extends) {
        for (const ext of set.extends) {
          if (!extendsList.includes(ext)) {
            extendsList.push(ext)
          }
        }
      }
    }
    return {
      name: 'merged',
      description: `Merged from ${sets.length} rule sets`,
      rules: mergedRules,
      extends: extendsList,
    }
  }

  applyOverrides(
    rules: Map<string, RuleV2>,
    overrides: RuleOverride[],
  ): Map<string, RuleV2> {
    const result = new Map<string, RuleV2>()
    for (const [id, rule] of rules) {
      result.set(id, { ...rule })
    }
    for (const override of overrides) {
      const rule = result.get(override.ruleId)
      if (rule) {
        if (override.severity !== undefined) {
          rule.severity = override.severity
        }
        if (override.enabled !== undefined) {
          rule.enabled = override.enabled
        }
        if (override.options !== undefined) {
          rule.options = { ...rule.options, ...override.options }
        }
      }
    }
    return result
  }

  resolveConflicts(rules: RuleV2[]): string[] {
    const conflicts: string[] = []
    const ruleMap = new Map<string, RuleV2>()
    for (const rule of rules) {
      ruleMap.set(rule.id, rule)
    }
    for (const rule of rules) {
      for (const conflictId of rule.conflicts) {
        if (ruleMap.has(conflictId)) {
          const pair = [rule.id, conflictId].sort().join(':')
          if (!conflicts.includes(pair)) {
            conflicts.push(pair)
          }
        }
      }
    }
    return conflicts
  }

  filterByFiles(
    rules: Map<string, RuleV2>,
    filePath: string,
  ): Map<string, RuleV2> {
    const result = new Map<string, RuleV2>()
    for (const [id, rule] of rules) {
      if (this.matchesFile(id, rule, filePath)) {
        result.set(id, rule)
      }
    }
    return result
  }

  private matchesFile(
    _ruleId: string,
    _rule: RuleV2,
    _filePath: string,
  ): boolean {
    return true
  }

  flattenRuleSet(
    ruleSet: RuleSet,
    registry: RuleRegistryV2,
  ): Map<string, RuleV2> {
    const result = new Map<string, RuleV2>()
    const rulesToProcess = new Map<string, Partial<RuleV2>>()

    if (ruleSet.extends) {
      for (const extId of ruleSet.extends) {
        const baseRule = registry.get(extId)
        if (baseRule) {
          rulesToProcess.set(extId, {})
        }
      }
    }

    for (const [id, partial] of ruleSet.rules) {
      rulesToProcess.set(id, partial)
    }

    for (const [id, partial] of rulesToProcess) {
      const base = registry.get(id)
      if (base) {
        const merged: RuleV2 = { ...base, ...partial }
        if (partial.options) {
          merged.options = { ...base.options, ...partial.options }
        }
        result.set(id, merged)
      }
    }

    return result
  }
}
