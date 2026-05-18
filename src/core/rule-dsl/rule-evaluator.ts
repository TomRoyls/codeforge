import type {
  DSLCondition,
  DSLEvaluationContext,
  DSLFix,
  DSLRuleConfig,
  DSLViolation,
  OperatorType,
} from './types.js'

/** Module-level regex cache keyed by `source|flags` to avoid recompiling identical patterns */
const _regexCache = new Map<string, RegExp>()

function cachedRegex(pattern: string, flags: string): RegExp {
  const key = `${pattern}|${flags}`
  let regex = _regexCache.get(key)
  if (!regex) {
    regex = new RegExp(pattern, flags)
    _regexCache.set(key, regex)
  }
  return regex
}

function freshCopy(regex: RegExp): RegExp {
  return new RegExp(regex.source, regex.flags)
}

export class RuleEvaluator {
  evaluateCondition(condition: DSLCondition, context: DSLEvaluationContext): boolean {
    switch (condition.type) {
      case 'pattern': {
        const regex = cachedRegex(condition.value, '')
        return regex.test(context.content)
      }
      case 'ast': {
        const selectorRegex = cachedRegex(condition.selector, '')
        const filterRegex = condition.filter ? cachedRegex(condition.filter, '') : null
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
        const regex = cachedRegex(condition.pattern, '')
        return regex.test(context.content)
      }
      case 'count': {
        const matches = context.content.match(cachedRegex(condition.pattern, 'g'))
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
        const regex = cachedRegex(condition.pattern, flags)
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
          const regex = cachedRegex(fix.pattern, '')
          return content.replace(regex, fix.replacement)
        }
        const replaceRegex = cachedRegex(fix.pattern, '')
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
        const deleteRegex = cachedRegex(fix.pattern, '')
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
    const lineStarts = this.buildLineStarts(content)

    switch (condition.type) {
      case 'pattern': {
        const regex = freshCopy(cachedRegex(condition.value, 'g'))
        let m: RegExpExecArray | null
        while ((m = regex.exec(content)) !== null) {
          const lineNumber = this.lineFromStarts(lineStarts, m.index)
          results.push({ line: lineNumber, match: m })
        }
        break
      }
      case 'regex': {
        const baseFlags = condition.flags ?? ''
        const flags = baseFlags.includes('g') ? baseFlags : baseFlags + 'g'
        const regex = freshCopy(cachedRegex(condition.pattern, flags))
        let m: RegExpExecArray | null
        while ((m = regex.exec(content)) !== null) {
          const lineNumber = this.lineFromStarts(lineStarts, m.index)
          results.push({ line: lineNumber, match: m })
        }
        break
      }
      case 'exists': {
        const regex = freshCopy(cachedRegex(condition.pattern, 'g'))
        let m: RegExpExecArray | null
        while ((m = regex.exec(content)) !== null) {
          const lineNumber = this.lineFromStarts(lineStarts, m.index)
          results.push({ line: lineNumber, match: m })
        }
        break
      }
      case 'ast': {
        const selectorRegex = freshCopy(cachedRegex(condition.selector, 'g'))
        let m: RegExpMatchArray | null
        while ((m = selectorRegex.exec(content)) !== null) {
          const lineNumber = this.lineFromStarts(lineStarts, m.index)
          results.push({ line: lineNumber, match: m })
        }
        break
      }
      default:
        break
    }

    return results
  }

  private buildLineStarts(content: string): number[] {
    const starts = [0]
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '\n') starts.push(i + 1)
    }
    return starts
  }

  private lineFromStarts(lineStarts: number[], index: number | undefined): number {
    if (index === undefined) return 1
    let lo = 0
    let hi = lineStarts.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (lineStarts[mid]! <= index) lo = mid + 1
      else hi = mid - 1
    }
    return lo
  }

  private getLineNumber(content: string, index: number | undefined): number {
    if (index === undefined) return 1
    const lineStarts = this.buildLineStarts(content)
    return this.lineFromStarts(lineStarts, index)
  }
}
