import type {
  DSLCategory,
  DSLCondition,
  DSLFix,
  DSLParseError,
  DSLParseResult,
  DSLRuleConfig,
  DSLSeverity,
  OperatorType,
} from './types.js'

const VALID_OPERATORS: ReadonlySet<string> = new Set<string>([
  'gt',
  'lt',
  'eq',
  'gte',
  'lte',
])

const VALID_SEVERITIES: ReadonlySet<string> = new Set<string>([
  'error',
  'warning',
  'info',
])

const VALID_CATEGORIES: ReadonlySet<string> = new Set<string>([
  'complexity',
  'security',
  'performance',
  'patterns',
  'dependencies',
  'style',
])

const CONDITION_TYPES: ReadonlySet<string> = new Set<string>([
  'pattern',
  'ast',
  'and',
  'or',
  'not',
  'exists',
  'count',
  'line-length',
  'file-size',
  'regex',
])

export class DSLParser {
  parseYAML(input: string): DSLParseResult {
    const errors: DSLParseError[] = []
    const trimmed = input.trim()
    if (trimmed.length === 0) {
      return { success: false, rules: [], errors: [{ line: 0, column: 0, message: 'Empty input' }] }
    }

    let parsed: unknown
    try {
      parsed = this.parseYAMLString(trimmed)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      return { success: false, rules: [], errors: [{ line: 0, column: 0, message: `YAML parse error: ${msg}` }] }
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, rules: [], errors: [{ line: 0, column: 0, message: 'Expected object at root' }] }
    }

    const root = parsed as Record<string, unknown>
    const rawRules = root['rules']
    if (!Array.isArray(rawRules)) {
      return { success: false, rules: [], errors: [{ line: 0, column: 0, message: 'Expected "rules" array at root' }] }
    }

    const rules: DSLRuleConfig[] = []
    for (let i = 0; i < rawRules.length; i++) {
      const rawRule = rawRules[i]
      if (typeof rawRule !== 'object' || rawRule === null) {
        errors.push({ line: 0, column: 0, message: `Rule at index ${i} is not an object` })
        continue
      }
      const ruleErrors = this.validateRule(rawRule as Record<string, unknown>)
      if (ruleErrors.length > 0) {
        errors.push(...ruleErrors)
        continue
      }
      rules.push(this.normalizeRule(rawRule as Record<string, unknown>))
    }

    return { success: errors.length === 0, rules, errors }
  }

  parseJSON(input: string): DSLParseResult {
    const errors: DSLParseError[] = []
    let parsed: unknown
    try {
      parsed = JSON.parse(input)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      return { success: false, rules: [], errors: [{ line: 0, column: 0, message: `JSON parse error: ${msg}` }] }
    }

    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, rules: [], errors: [{ line: 0, column: 0, message: 'Expected object at root' }] }
    }

    const root = parsed as Record<string, unknown>
    const rawRules = root['rules']
    if (!Array.isArray(rawRules)) {
      return { success: false, rules: [], errors: [{ line: 0, column: 0, message: 'Expected "rules" array at root' }] }
    }

    const rules: DSLRuleConfig[] = []
    for (let i = 0; i < rawRules.length; i++) {
      const rawRule = rawRules[i]
      if (typeof rawRule !== 'object' || rawRule === null) {
        errors.push({ line: 0, column: 0, message: `Rule at index ${i} is not an object` })
        continue
      }
      const ruleErrors = this.validateRule(rawRule as Record<string, unknown>)
      if (ruleErrors.length > 0) {
        errors.push(...ruleErrors)
        continue
      }
      rules.push(this.normalizeRule(rawRule as Record<string, unknown>))
    }

    return { success: errors.length === 0, rules, errors }
  }

  async parseFile(filePath: string): Promise<DSLParseResult> {
    const fs = await import('node:fs/promises')
    const content = await fs.readFile(filePath, 'utf-8')
    if (filePath.endsWith('.json')) {
      return this.parseJSON(content)
    }
    return this.parseYAML(content)
  }

  validateRule(rule: Partial<DSLRuleConfig> | Record<string, unknown>): DSLParseError[] {
    const errors: DSLParseError[] = []
    const r = rule as Record<string, unknown>

    if (typeof r['id'] !== 'string' || r['id'].trim().length === 0) {
      errors.push({ line: 0, column: 0, message: 'Rule must have a non-empty "id" string' })
    }
    if (typeof r['name'] !== 'string' || r['name'].trim().length === 0) {
      errors.push({ line: 0, column: 0, message: 'Rule must have a non-empty "name" string' })
    }
    if (typeof r['condition'] !== 'object' || r['condition'] === null) {
      errors.push({ line: 0, column: 0, message: 'Rule must have a "condition" object' })
    } else {
      errors.push(...this.validateCondition(r['condition'] as DSLCondition))
    }
    if (typeof r['message'] !== 'string' || r['message'].trim().length === 0) {
      errors.push({ line: 0, column: 0, message: 'Rule must have a non-empty "message" string' })
    }
    if (r['severity'] !== undefined && !VALID_SEVERITIES.has(r['severity'] as string)) {
      errors.push({ line: 0, column: 0, message: `Invalid severity: ${String(r['severity'])}` })
    }
    if (r['category'] !== undefined && !VALID_CATEGORIES.has(r['category'] as string)) {
      errors.push({ line: 0, column: 0, message: `Invalid category: ${String(r['category'])}` })
    }
    if (r['fix'] !== undefined) {
      if (typeof r['fix'] !== 'object' || r['fix'] === null) {
        errors.push({ line: 0, column: 0, message: 'Rule "fix" must be an object' })
      } else {
        const fix = r['fix'] as Record<string, unknown>
        if (fix['type'] !== 'replace' && fix['type'] !== 'prepend' && fix['type'] !== 'append' && fix['type'] !== 'delete') {
          errors.push({ line: 0, column: 0, message: `Invalid fix type: ${String(fix['type'])}` })
        }
        if (typeof fix['pattern'] !== 'string') {
          errors.push({ line: 0, column: 0, message: 'Fix must have a "pattern" string' })
        }
      }
    }

    return errors
  }

  validateCondition(condition: DSLCondition): DSLParseError[] {
    const errors: DSLParseError[] = []
    const c = condition as unknown as Record<string, unknown>
    const cType = c['type']

    if (typeof cType !== 'string' || !CONDITION_TYPES.has(cType)) {
      errors.push({ line: 0, column: 0, message: `Invalid condition type: ${String(cType)}` })
      return errors
    }

    switch (cType) {
      case 'pattern':
        if (typeof c['value'] !== 'string') {
          errors.push({ line: 0, column: 0, message: 'Pattern condition must have a "value" string' })
        }
        break
      case 'ast':
        if (typeof c['selector'] !== 'string') {
          errors.push({ line: 0, column: 0, message: 'AST condition must have a "selector" string' })
        }
        break
      case 'and':
      case 'or': {
        const conds = c['conditions']
        if (!Array.isArray(conds)) {
          errors.push({ line: 0, column: 0, message: `${cType} condition must have a "conditions" array` })
        } else {
          for (let i = 0; i < conds.length; i++) {
            errors.push(...this.validateCondition(conds[i] as DSLCondition))
          }
        }
        break
      }
      case 'not': {
        if (typeof c['condition'] !== 'object' || c['condition'] === null) {
          errors.push({ line: 0, column: 0, message: 'Not condition must have a "condition" object' })
        } else {
          errors.push(...this.validateCondition(c['condition'] as DSLCondition))
        }
        break
      }
      case 'exists':
        if (typeof c['pattern'] !== 'string') {
          errors.push({ line: 0, column: 0, message: 'Exists condition must have a "pattern" string' })
        }
        break
      case 'count':
        if (typeof c['pattern'] !== 'string') {
          errors.push({ line: 0, column: 0, message: 'Count condition must have a "pattern" string' })
        }
        if (!this.isValidOperator(c['operator'] as string)) {
          errors.push({ line: 0, column: 0, message: `Invalid operator: ${String(c['operator'])}` })
        }
        if (typeof c['value'] !== 'number') {
          errors.push({ line: 0, column: 0, message: 'Count condition must have a numeric "value"' })
        }
        break
      case 'line-length':
      case 'file-size':
        if (!this.isValidOperator(c['operator'] as string)) {
          errors.push({ line: 0, column: 0, message: `Invalid operator: ${String(c['operator'])}` })
        }
        if (typeof c['value'] !== 'number') {
          errors.push({ line: 0, column: 0, message: `${cType} condition must have a numeric "value"` })
        }
        break
      case 'regex':
        if (typeof c['pattern'] !== 'string') {
          errors.push({ line: 0, column: 0, message: 'Regex condition must have a "pattern" string' })
        }
        if (c['flags'] !== undefined && typeof c['flags'] !== 'string') {
          errors.push({ line: 0, column: 0, message: 'Regex "flags" must be a string' })
        }
        break
    }

    return errors
  }

  private parseCondition(raw: unknown): DSLCondition {
    const r = raw as Record<string, unknown>
    const type = r['type'] as string

    switch (type) {
      case 'pattern':
        return { type: 'pattern', value: String(r['value']) }
      case 'ast':
        return {
          type: 'ast',
          selector: String(r['selector']),
          ...(r['filter'] !== undefined ? { filter: String(r['filter']) } : {}),
        }
      case 'and':
      case 'or':
        return {
          type,
          conditions: (Array.isArray(r['conditions']) ? r['conditions'] : []).map(
            (c: unknown) => this.parseCondition(c),
          ),
        }
      case 'not':
        return { type: 'not', condition: this.parseCondition(r['condition']) }
      case 'exists':
        return { type: 'exists', pattern: String(r['pattern']) }
      case 'count':
        return {
          type: 'count',
          pattern: String(r['pattern']),
          operator: r['operator'] as OperatorType,
          value: Number(r['value']),
        }
      case 'line-length':
        return {
          type: 'line-length',
          operator: r['operator'] as OperatorType,
          value: Number(r['value']),
        }
      case 'file-size':
        return {
          type: 'file-size',
          operator: r['operator'] as OperatorType,
          value: Number(r['value']),
        }
      case 'regex':
        return {
          type: 'regex',
          pattern: String(r['pattern']),
          ...(r['flags'] !== undefined ? { flags: String(r['flags']) } : {}),
        }
      default:
        return { type: 'pattern', value: '' }
    }
  }

  private parseFix(raw: unknown): DSLFix | undefined {
    if (typeof raw !== 'object' || raw === null) return undefined
    const r = raw as Record<string, unknown>
    if (typeof r['type'] !== 'string' || typeof r['pattern'] !== 'string') return undefined
    return {
      type: r['type'] as DSLFix['type'],
      pattern: String(r['pattern']),
      ...(r['replacement'] !== undefined ? { replacement: String(r['replacement']) } : {}),
    }
  }

  private isValidOperator(op: string): op is OperatorType {
    return VALID_OPERATORS.has(op)
  }

  private normalizeRule(rule: Record<string, unknown>): DSLRuleConfig {
    return {
      id: String(rule['id']),
      name: String(rule['name']),
      description: rule['description'] !== undefined ? String(rule['description']) : '',
      severity: (VALID_SEVERITIES.has(rule['severity'] as string)
        ? rule['severity']
        : 'warning') as DSLSeverity,
      category: (VALID_CATEGORIES.has(rule['category'] as string)
        ? rule['category']
        : 'patterns') as DSLCategory,
      enabled: rule['enabled'] !== undefined ? Boolean(rule['enabled']) : true,
      condition: this.parseCondition(rule['condition']),
      message: String(rule['message']),
      suggestion: rule['suggestion'] !== undefined ? String(rule['suggestion']) : undefined,
      fix: this.parseFix(rule['fix']),
    }
  }

  private parseYAMLString(input: string): unknown {
    const lines = input.split('\n')
    return this.parseYAMLNode(lines, 0, -1).value
  }

  private parseYAMLNode(
    lines: string[],
    startLine: number,
    parentIndent: number,
  ): { value: unknown; endLine: number } {
    if (startLine >= lines.length) {
      return { value: null, endLine: startLine }
    }

    const firstLine = lines[startLine]!
    const firstContent = this.stripComment(firstLine)
    const trimmed = firstContent.trim()

    if (trimmed === '') {
      if (startLine + 1 < lines.length) {
        return this.parseYAMLNode(lines, startLine + 1, parentIndent)
      }
      return { value: null, endLine: startLine + 1 }
    }

    const currentIndent = this.getIndentLevel(firstContent)

    if (trimmed.startsWith('- ') || trimmed === '-') {
      return this.parseYAMLArray(lines, startLine, currentIndent)
    }

    if (trimmed.endsWith(':')) {
      return this.parseYAMLObject(lines, startLine, currentIndent)
    }

    const colonIdx = trimmed.indexOf(': ')
    if (colonIdx >= 0 && !trimmed.startsWith('"') && !trimmed.startsWith("'")) {
      return this.parseYAMLObject(lines, startLine, currentIndent)
    }

    return { value: this.parseScalar(trimmed), endLine: startLine + 1 }
  }

  private parseYAMLObject(
    lines: string[],
    startLine: number,
    baseIndent: number,
  ): { value: Record<string, unknown>; endLine: number } {
    const result: Record<string, unknown> = {}
    let currentLine = startLine

    while (currentLine < lines.length) {
      const line = lines[currentLine]!
      const content = this.stripComment(line)
      const trimmed = content.trim()

      if (trimmed === '') {
        currentLine++
        continue
      }

      const indent = this.getIndentLevel(content)
      if (indent < baseIndent) break
      if (indent > baseIndent && currentLine > startLine) {
        if (!this.isObjectKeyLine(trimmed)) break
      }

      const colonIdx = this.findKeyColon(trimmed)
      if (colonIdx < 0) break

      const key = this.parseUnquotedKey(trimmed.substring(0, colonIdx))
      const afterColon = trimmed.substring(colonIdx + 1).trimStart()

      if (afterColon === '') {
        currentLine++
        if (currentLine >= lines.length) {
          result[key] = null
          break
        }

        const nextContent = this.stripComment(lines[currentLine]!)
        const nextTrimmed = nextContent.trim()
        if (nextTrimmed === '') {
          result[key] = null
          continue
        }

        const nextIndent = this.getIndentLevel(nextContent)
        if (nextIndent <= baseIndent) {
          result[key] = null
          continue
        }

        const child = this.parseYAMLNode(lines, currentLine, baseIndent)
        result[key] = child.value
        currentLine = child.endLine
      } else {
        result[key] = this.parseScalar(afterColon)
        currentLine++
      }
    }

    return { value: result, endLine: currentLine }
  }

  private parseYAMLArray(
    lines: string[],
    startLine: number,
    baseIndent: number,
  ): { value: unknown[]; endLine: number } {
    const result: unknown[] = []
    let currentLine = startLine

    while (currentLine < lines.length) {
      const line = lines[currentLine]!
      const content = this.stripComment(line)
      const trimmed = content.trim()

      if (trimmed === '') {
        currentLine++
        continue
      }

      const indent = this.getIndentLevel(content)
      if (indent < baseIndent) break

      if (indent === baseIndent && (trimmed.startsWith('- ') || trimmed === '-')) {
        const afterDash = trimmed.substring(1).trimStart()

        if (afterDash === '' || afterDash.endsWith(':') || this.findKeyColon(afterDash) >= 0) {
          const tempLines = this.makeTempLines(lines, currentLine, indent, afterDash)
          const child = this.parseYAMLNode(tempLines, 0, -1)
          result.push(child.value)
          currentLine++

          while (currentLine < lines.length) {
            const subContent = this.stripComment(lines[currentLine]!)
            if (subContent.trim() === '') { currentLine++; continue }
            const subIndent = this.getIndentLevel(subContent)
            if (subIndent <= indent) break
            currentLine++
          }
        } else {
          result.push(this.parseScalar(afterDash))
          currentLine++
        }
      } else if (indent > baseIndent) {
        currentLine++
      } else {
        break
      }
    }

    return { value: result, endLine: currentLine }
  }

  private makeTempLines(
    lines: string[],
    currentLine: number,
    indent: number,
    afterDash: string,
  ): string[] {
    const tempLines: string[] = []
    if (afterDash.endsWith(':') || this.findKeyColon(afterDash) >= 0) {
      tempLines.push(' '.repeat(indent) + afterDash)
    } else {
      tempLines.push(afterDash)
    }

    let subLine = currentLine + 1
    while (subLine < lines.length) {
      const subContent = this.stripComment(lines[subLine]!)
      if (subContent.trim() === '') break
      const subIndent = this.getIndentLevel(subContent)
      if (subIndent <= indent) break
      tempLines.push(subContent)
      subLine++
    }
    return tempLines
  }

  private parseScalar(value: string): unknown {
    if (value === 'true') return true
    if (value === 'false') return false
    if (value === 'null' || value === '~') return null
    if (value === '') return null

    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1).replace(/''/g, "'")
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\t/g, '\t')
    }

    const num = Number(value)
    if (!isNaN(num) && value.trim() !== '') {
      return num
    }

    return value
  }

  private getIndentLevel(line: string): number {
    let count = 0
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ') count++
      else if (line[i] === '\t') count += 2
      else break
    }
    return count
  }

  private stripComment(line: string): string {
    let inSingle = false
    let inDouble = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!
      if (ch === "'" && !inDouble) inSingle = !inSingle
      else if (ch === '"' && !inSingle) inDouble = !inDouble
      else if (ch === '#' && !inSingle && !inDouble) {
        return line.substring(0, i)
      }
    }
    return line
  }

  private findKeyColon(line: string): number {
    let inSingle = false
    let inDouble = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!
      if (ch === "'" && !inDouble) inSingle = !inSingle
      else if (ch === '"' && !inSingle) inDouble = !inDouble
      else if (ch === ':' && !inSingle && !inDouble) {
        if (i === line.length - 1) return i
        const next = line[i + 1]!
        if (next === ' ' || next === '\t') return i
      }
    }
    return -1
  }

  private isObjectKeyLine(trimmed: string): boolean {
    return this.findKeyColon(trimmed) >= 0
  }

  private parseUnquotedKey(key: string): string {
    return key.trim()
  }
}
