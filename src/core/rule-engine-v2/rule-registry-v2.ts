import type { RuleV2 } from './types.js'

export class RuleRegistryV2 {
  private rules: Map<string, RuleV2> = new Map()

  register(rule: RuleV2): void {
    this.rules.set(rule.id, { ...rule })
  }

  unregister(ruleId: string): boolean {
    return this.rules.delete(ruleId)
  }

  get(ruleId: string): RuleV2 | null {
    return this.rules.get(ruleId) ?? null
  }

  getAll(): RuleV2[] {
    return [...this.rules.values()]
  }

  getByCategory(category: RuleV2['category']): RuleV2[] {
    return this.getAll().filter((r) => r.category === category)
  }

  getByTag(tag: string): RuleV2[] {
    return this.getAll().filter((r) => r.tags.includes(tag))
  }

  getEnabled(): RuleV2[] {
    return this.getAll().filter((r) => r.enabled)
  }

  getFixable(): RuleV2[] {
    return this.getAll().filter((r) => r.fixable)
  }

  isRegistered(ruleId: string): boolean {
    return this.rules.has(ruleId)
  }

  validate(rule: RuleV2): string[] {
    const errors: string[] = []
    if (!rule.id || rule.id.trim() === '') {
      errors.push('Rule id is required')
    }
    if (!rule.name || rule.name.trim() === '') {
      errors.push('Rule name is required')
    }
    if (!rule.description || rule.description.trim() === '') {
      errors.push('Rule description is required')
    }
    const validCategories: RuleV2['category'][] = [
      'correctness',
      'performance',
      'security',
      'style',
      'complexity',
    ]
    if (!validCategories.includes(rule.category)) {
      errors.push(`Invalid category: ${rule.category}`)
    }
    const validSeverities: string[] = ['off', 'warn', 'error', 'info']
    if (!validSeverities.includes(rule.severity)) {
      errors.push(`Invalid severity: ${rule.severity}`)
    }
    if (!Array.isArray(rule.tags)) {
      errors.push('Rule tags must be an array')
    }
    if (!Array.isArray(rule.dependencies)) {
      errors.push('Rule dependencies must be an array')
    }
    if (!Array.isArray(rule.conflicts)) {
      errors.push('Rule conflicts must be an array')
    }
    if (typeof rule.options !== 'object' || rule.options === null) {
      errors.push('Rule options must be an object')
    }
    return errors
  }

  resolveDependencies(ruleIds: string[]): string[] {
    const resolved = new Set<string>()
    const visiting = new Set<string>()
    const visit = (id: string): void => {
      if (resolved.has(id) || visiting.has(id)) {
        return
      }
      visiting.add(id)
      const rule = this.rules.get(id)
      if (rule) {
        for (const dep of rule.dependencies) {
          visit(dep)
        }
      }
      resolved.add(id)
      visiting.delete(id)
    }
    for (const id of ruleIds) {
      visit(id)
    }
    return [...resolved]
  }
}
