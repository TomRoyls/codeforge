import type { ComposedRule, RulePredicate } from './types.js'

export class RuleOperators {
  static and<T>(rules: ComposedRule<T>[]): ComposedRule<T> {
    const predicate: RulePredicate<T> = (item: T): boolean => {
      return rules.every((rule) => rule.predicate(item))
    }
    return {
      name: 'and',
      predicate,
      description: `AND(${rules.map((r) => r.name).join(', ')})`,
      children: rules.length > 0 ? [...rules] : undefined,
    }
  }

  static or<T>(rules: ComposedRule<T>[]): ComposedRule<T> {
    const predicate: RulePredicate<T> = (item: T): boolean => {
      return rules.some((rule) => rule.predicate(item))
    }
    return {
      name: 'or',
      predicate,
      description: `OR(${rules.map((r) => r.name).join(', ')})`,
      children: rules.length > 0 ? [...rules] : undefined,
    }
  }

  static not<T>(rule: ComposedRule<T>): ComposedRule<T> {
    const predicate: RulePredicate<T> = (item: T): boolean => {
      return !rule.predicate(item)
    }
    return {
      name: 'not',
      predicate,
      description: `NOT(${rule.name})`,
      children: [rule],
    }
  }

  static xor<T>(ruleA: ComposedRule<T>, ruleB: ComposedRule<T>): ComposedRule<T> {
    const predicate: RulePredicate<T> = (item: T): boolean => {
      const a = ruleA.predicate(item)
      const b = ruleB.predicate(item)
      return a !== b
    }
    return {
      name: 'xor',
      predicate,
      description: `XOR(${ruleA.name}, ${ruleB.name})`,
      children: [ruleA, ruleB],
    }
  }

  static nand<T>(rules: ComposedRule<T>[]): ComposedRule<T> {
    const andResult = RuleOperators.and(rules)
    const predicate: RulePredicate<T> = (item: T): boolean => {
      return !andResult.predicate(item)
    }
    return {
      name: 'nand',
      predicate,
      description: `NAND(${rules.map((r) => r.name).join(', ')})`,
      children: rules.length > 0 ? [...rules] : undefined,
    }
  }

  static nor<T>(rules: ComposedRule<T>[]): ComposedRule<T> {
    const orResult = RuleOperators.or(rules)
    const predicate: RulePredicate<T> = (item: T): boolean => {
      return !orResult.predicate(item)
    }
    return {
      name: 'nor',
      predicate,
      description: `NOR(${rules.map((r) => r.name).join(', ')})`,
      children: rules.length > 0 ? [...rules] : undefined,
    }
  }

  static implies<T>(antecedent: ComposedRule<T>, consequent: ComposedRule<T>): ComposedRule<T> {
    const predicate: RulePredicate<T> = (item: T): boolean => {
      const ante = antecedent.predicate(item)
      if (!ante) return true
      return consequent.predicate(item)
    }
    return {
      name: 'implies',
      predicate,
      description: `IMPLIES(${antecedent.name}, ${consequent.name})`,
      children: [antecedent, consequent],
    }
  }

  static ifThenElse<T>(
    condition: ComposedRule<T>,
    thenRule: ComposedRule<T>,
    elseRule: ComposedRule<T>,
  ): ComposedRule<T> {
    const predicate: RulePredicate<T> = (item: T): boolean => {
      if (condition.predicate(item)) {
        return thenRule.predicate(item)
      }
      return elseRule.predicate(item)
    }
    return {
      name: 'if-then-else',
      predicate,
      description: `IF(${condition.name}, ${thenRule.name}, ${elseRule.name})`,
      children: [condition, thenRule, elseRule],
    }
  }
}
