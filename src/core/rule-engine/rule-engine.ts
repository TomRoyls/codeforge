import type {
  Rule,
  RuleCondition,
  RuleAction,
  RuleEvaluationContext,
  RuleResult,
  ActionResult,
  EngineConfig,
} from './types.js'

const rulePatternCache = new Map<string, RegExp>()

const DEFAULT_CONFIG: EngineConfig = {
  maxRules: 1000,
  stopOnFirstMatch: false,
  throwOnError: false,
}

export class RuleEngine {
  private rules: Map<string, Rule> = new Map()
  private config: EngineConfig
  private totalEvaluations = 0
  private totalMatches = 0

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  addRule(rule: Rule): boolean {
    if (this.rules.has(rule.id)) return false
    if (this.rules.size >= this.config.maxRules) return false
    this.rules.set(rule.id, rule)
    return true
  }

  removeRule(id: string): boolean {
    return this.rules.delete(id)
  }

  getRule(id: string): Rule | undefined {
    return this.rules.get(id)
  }

  getRules(): Rule[] {
    return [...this.rules.values()]
  }

  getRulesByTag(tag: string): Rule[] {
    return this.getRules().filter((rule) => rule.tags.includes(tag))
  }

  getEnabledRules(): Rule[] {
    return this.getRules().filter((rule) => rule.enabled)
  }

  evaluate(context: RuleEvaluationContext): RuleResult[] {
    const results: RuleResult[] = []
    const enabledRules = this.getEnabledRules().sort(
      (a, b) => b.priority - a.priority,
    )

    for (const rule of enabledRules) {
      const result = this.evaluateRule(rule.id, context)
      results.push(result)
      if (result.matched && this.config.stopOnFirstMatch) break
    }

    return results
  }

  evaluateRule(ruleId: string, context: RuleEvaluationContext): RuleResult {
    const start = performance.now()
    const rule = this.rules.get(ruleId)

    if (!rule) {
      return { ruleId, matched: false, actions: [], duration: 0 }
    }

    this.totalEvaluations++

    const matched =
      rule.conditions.length === 0 ||
      rule.conditions.every((condition) =>
        this.evaluateCondition(condition, context),
      )

    const actions: ActionResult[] = matched
      ? rule.actions.map((action) => this.executeAction(action, context))
      : []

    if (matched) this.totalMatches++

    return {
      ruleId,
      matched,
      actions,
      duration: performance.now() - start,
    }
  }

  evaluateCondition(
    condition: RuleCondition,
    context: RuleEvaluationContext,
  ): boolean {
    const fieldValue = this.getNestedField(context.data, condition.field)

    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value
      case 'neq':
        return fieldValue !== condition.value
      case 'gt':
        return (
          typeof fieldValue === 'number' &&
          typeof condition.value === 'number' &&
          fieldValue > condition.value
        )
      case 'gte':
        return (
          typeof fieldValue === 'number' &&
          typeof condition.value === 'number' &&
          fieldValue >= condition.value
        )
      case 'lt':
        return (
          typeof fieldValue === 'number' &&
          typeof condition.value === 'number' &&
          fieldValue < condition.value
        )
      case 'lte':
        return (
          typeof fieldValue === 'number' &&
          typeof condition.value === 'number' &&
          fieldValue <= condition.value
        )
      case 'contains':
        return (
          typeof fieldValue === 'string' &&
          typeof condition.value === 'string' &&
          fieldValue.includes(condition.value)
        )
      case 'startsWith':
        return (
          typeof fieldValue === 'string' &&
          typeof condition.value === 'string' &&
          fieldValue.startsWith(condition.value)
        )
      case 'endsWith':
        return (
          typeof fieldValue === 'string' &&
          typeof condition.value === 'string' &&
          fieldValue.endsWith(condition.value)
        )
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'notIn':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      case 'matches': {
        if (typeof fieldValue !== 'string' || typeof condition.value !== 'string')
          return false
        try {
          let regex = rulePatternCache.get(condition.value)
          if (!regex) {
            regex = new RegExp(condition.value)
            rulePatternCache.set(condition.value, regex)
          }
          return regex.test(fieldValue)
        } catch {
          return false
        }
      }
      case 'exists':
        return fieldValue !== undefined
      default:
        return false
    }
  }

  executeAction(
    action: RuleAction,
    context: RuleEvaluationContext,
  ): ActionResult {
    switch (action.type) {
      case 'set':
        context.data[action.target] = action.value
        return { action, success: true, result: action.value }
      case 'remove': {
        const existed = action.target in context.data
        delete context.data[action.target]
        return { action, success: true, result: existed }
      }
      case 'add': {
        const arr = context.data[action.target]
        if (Array.isArray(arr)) {
          arr.push(action.value)
          return { action, success: true, result: arr }
        }
        context.data[action.target] = [action.value]
        return { action, success: true, result: context.data[action.target] }
      }
      case 'log':
        return { action, success: true, result: undefined }
      case 'error':
        return {
          action,
          success: false,
          result: undefined,
          error: typeof action.value === 'string' ? action.value : 'Error action triggered',
        }
      default:
        return { action, success: false, result: undefined, error: 'Unknown action type' }
    }
  }

  matchAny(context: RuleEvaluationContext): boolean {
    return this.getEnabledRules().some((rule) => {
      if (rule.conditions.length === 0) return true
      return rule.conditions.every((condition) =>
        this.evaluateCondition(condition, context),
      )
    })
  }

  matchAll(context: RuleEvaluationContext): string[] {
    return this.getEnabledRules()
      .filter((rule) => {
        if (rule.conditions.length === 0) return true
        return rule.conditions.every((condition) =>
          this.evaluateCondition(condition, context),
        )
      })
      .map((rule) => rule.id)
  }

  getStatistics(): {
    totalRules: number
    enabledRules: number
    disabledRules: number
    totalEvaluations: number
    totalMatches: number
  } {
    const enabled = this.getEnabledRules().length
    return {
      totalRules: this.rules.size,
      enabledRules: enabled,
      disabledRules: this.rules.size - enabled,
      totalEvaluations: this.totalEvaluations,
      totalMatches: this.totalMatches,
    }
  }

  enable(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.enabled = true
    return true
  }

  disable(id: string): boolean {
    const rule = this.rules.get(id)
    if (!rule) return false
    rule.enabled = false
    return true
  }

  clear(): void {
    this.rules.clear()
  }

  reset(): void {
    this.rules.clear()
    this.totalEvaluations = 0
    this.totalMatches = 0
  }

  private getNestedField(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.')
    let current: unknown = obj
    for (const key of keys) {
      if (current === null || current === undefined) return undefined
      if (typeof current === 'object' && current !== null && key in current) {
        current = (current as Record<string, unknown>)[key]
      } else {
        return undefined
      }
    }
    return current
  }
}
