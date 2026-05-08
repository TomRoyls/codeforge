import type {
  DSLCondition,
  DSLEvaluationContext,
  DSLFix,
  DSLRuleConfig,
  DSLViolation,
  OperatorType,
} from './types.js'

export class RuleEvaluator {
  evaluateCondition(condition: DSLCondition, context: DSLEvaluationContext): boolean {
    switch (condition.type) {
      case 'pattern': {
        const regex = new RegExp(condition.value)
        return regex.test(context.content)
      }
      case 'ast': {
        const selectorRegex = new RegExp(condition.selector)
        const filterRegex = condition.filter ? new RegExp(condition.filter) : null
        const hasSelector = selectorRegex.test(context.content)
        if (!hasSelector) return false
        if (filterRegex) return filterRegex.test(context.content)
        return true
      }
      case 'and': {
        return condition.conditions.every((c) => this.evaluateCondition(c, context))
      }
      case 'or': {
        return condition.conditions.some((c) => this.evaluateCondition(c, context))
      }
      case 'not': {
        return !this.evaluateCondition(condition.condition, context)
      }
      case 'exists': {
        const regex = new RegExp(condition.pattern)
        return regex.test(context.content)
      }
      case 'count': {
        const matches = context.content.match(new RegExp(condition.pattern, 'g'))
        const count = matches ? matches.length : 0
        return this.compareValues(count, condition.operator, condition.value)
      }
      case 'line-length': {
        const line = context.lines[context.lineNumber]
        if (line === undefined) return false
        return this.compareValues(line.length, condition.operator, condition.value)
      }
      case 'file-size': {
        const size = Buffer.byteLength(context.content, 'utf-8')
        return this.compareValues(size, condition.operator, condition.value)
      }
      case 'regex': {
        const flags = condition.flags ?? ''
        const regex = new RegExp(condition.pattern, flags)
        return regex.test(context.content)
      }
      default:
        return false
    }
  }

  evaluateRule(rule: DSLRuleConfig, filePath: string, content: string): DSLViolation[] {
    const violations: DSLViolation[] = []
    const lines = content.split('\n')
    const context: DSLEvaluationContext = {
      filePath,
      content,
      lines,
      lineNumber: 0,
    }

    const matches = this.getMatches(content, rule.condition)

    if (matches.length > 0) {
      for (const matchResult of matches) {
        violations.push({
          ruleId: rule.id,
          filePath,
          line: matchResult.line,
          column: matchResult.match.index !== undefined ? matchResult.match.index + 1 : 1,
          message: rule.message,
          severity: rule.severity,
          suggestion: rule.suggestion,
        })
      }
    } else {
      const fullContext = { ...context, lineNumber: 0 }
      if (this.evaluateCondition(rule.condition, fullContext)) {
        violations.push({
          ruleId: rule.id,
          filePath,
          line: 1,
          column: 1,
          message: rule.message,
          severity: rule.severity,
          suggestion: rule.suggestion,
        })
      }
    }

    return violations
  }

  applyFix(fix: DSLFix, content: string, match: RegExpMatchArray): string {
    switch (fix.type) {
      case 'replace': {
        if (fix.replacement !== undefined) {
          const regex = new RegExp(fix.pattern)
          return content.replace(regex, fix.replacement)
        }
        const replaceRegex = new RegExp(fix.pattern)
        return content.replace(replaceRegex, match[0])
      }
      case 'prepend': {
        const prependText = fix.replacement ?? match[0]
        return prependText + content
      }
      case 'append': {
        const appendText = fix.replacement ?? match[0]
        return content + appendText
      }
      case 'delete': {
        const deleteRegex = new RegExp(fix.pattern)
        return content.replace(deleteRegex, '')
      }
      default:
        return content
    }
  }

  compareValues(left: number, operator: OperatorType, right: number): boolean {
    switch (operator) {
      case 'gt':
        return left > right
      case 'lt':
        return left < right
      case 'eq':
        return left === right
      case 'gte':
        return left >= right
      case 'lte':
        return left <= right
      default:
        return false
    }
  }

  getMatches(
    content: string,
    condition: DSLCondition,
  ): { line: number; match: RegExpMatchArray }[] {
    const results: { line: number; match: RegExpMatchArray }[] = []

    switch (condition.type) {
      case 'pattern': {
        const regex = new RegExp(condition.value, 'g')
        let m: RegExpMatchArray | null
        while ((m = regex.exec(content)) !== null) {
          const lineNumber = this.getLineNumber(content, m.index)
          results.push({ line: lineNumber, match: m })
        }
        break
      }
      case 'regex': {
        const baseFlags = condition.flags ?? ''
        const flags = baseFlags.includes('g') ? baseFlags : baseFlags + 'g'
        const regex = new RegExp(condition.pattern, flags)
        let m: RegExpMatchArray | null
        while ((m = regex.exec(content)) !== null) {
          const lineNumber = this.getLineNumber(content, m.index)
          results.push({ line: lineNumber, match: m })
        }
        break
      }
      case 'exists': {
        const regex = new RegExp(condition.pattern, 'g')
        let m: RegExpMatchArray | null
        while ((m = regex.exec(content)) !== null) {
          const lineNumber = this.getLineNumber(content, m.index)
          results.push({ line: lineNumber, match: m })
        }
        break
      }
      case 'ast': {
        const selectorRegex = new RegExp(condition.selector, 'g')
        let m: RegExpMatchArray | null
        while ((m = selectorRegex.exec(content)) !== null) {
          const lineNumber = this.getLineNumber(content, m.index)
          results.push({ line: lineNumber, match: m })
        }
        break
      }
      default:
        break
    }

    return results
  }

  private getLineNumber(content: string, index: number | undefined): number {
    if (index === undefined) return 1
    let line = 1
    for (let i = 0; i < index && i < content.length; i++) {
      if (content[i] === '\n') line++
    }
    return line
  }
}
