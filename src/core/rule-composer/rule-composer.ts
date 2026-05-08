import type { ComposedRule, RuleOperator, RulePredicate, RuleCompositionConfig } from './types.js'
import { DEFAULT_CONFIG } from './types.js'
import { RuleOperators } from './rule-operators.js'

export interface ExplainResult {
  rule: string
  passed: boolean
  children: ExplainResult[]
}

export class RuleComposer {
  private config: RuleCompositionConfig

  constructor(config?: Partial<RuleCompositionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  compose<T>(
    name: string,
    operator: RuleOperator,
    rules: ComposedRule<T>[],
    description?: string,
  ): ComposedRule<T> {
    let composed: ComposedRule<T>
    switch (operator) {
      case 'and':
        composed = RuleOperators.and(rules)
        break
      case 'or':
        composed = RuleOperators.or(rules)
        break
      case 'not': {
        const target = rules[0]
        if (target === undefined) {
          throw new Error('NOT operator requires exactly one rule')
        }
        composed = RuleOperators.not(target)
        break
      }
    }
    composed.name = name
    if (description !== undefined) {
      composed.description = description
    }
    return composed
  }

  fromPredicate<T>(
    name: string,
    predicate: RulePredicate<T>,
    description?: string,
  ): ComposedRule<T> {
    return {
      name,
      predicate,
      description: description ?? name,
    }
  }

  evaluate<T>(item: T, rule: ComposedRule<T>): boolean {
    return rule.predicate(item)
  }

  evaluateAll<T>(items: T[], rule: ComposedRule<T>): T[] {
    return items.filter((item) => rule.predicate(item))
  }

  explain<T>(item: T, rule: ComposedRule<T>): ExplainResult {
    const result: ExplainResult = {
      rule: rule.name,
      passed: false,
      children: [],
    }

    if (rule.children === undefined || rule.children.length === 0) {
      result.passed = rule.predicate(item)
      return result
    }

    const childResults: ExplainResult[] = rule.children.map((child) =>
      this.explain(item, child),
    )
    result.children = childResults
    result.passed = rule.predicate(item)
    return result
  }

  simplify<T>(rule: ComposedRule<T>): ComposedRule<T> {
    if (rule.children === undefined || rule.children.length === 0) {
      return rule
    }

    const simplifiedChildren = rule.children.map((child) => this.simplify(child))

    if (rule.name === 'not' && simplifiedChildren.length === 1) {
      const inner = simplifiedChildren[0]!
      if (inner.name === 'not' && inner.children && inner.children.length === 1) {
        return inner.children[0]!
      }
    }

    if ((rule.name === 'and' || rule.name === 'or') && simplifiedChildren.length === 1) {
      return simplifiedChildren[0]!
    }

    return {
      ...rule,
      children: simplifiedChildren,
    }
  }

  getRuleCount<T>(rule: ComposedRule<T>): number {
    if (rule.children === undefined || rule.children.length === 0) {
      return 1
    }
    let count = 1
    for (const child of rule.children) {
      count += this.getRuleCount(child)
    }
    return count
  }

  getConfig(): RuleCompositionConfig {
    return { ...this.config }
  }
}
