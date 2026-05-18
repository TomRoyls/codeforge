import type { FixConfidence, FixCategory } from './types.js'
import type { FixSuggestion, FixPatch, FixPlan, FixRiskAssessment, FixerConfig } from './types.js'
import { append } from '../../utils/map-helpers.js'
import {
  DEFAULT_FIXER_CONFIG,
  CONFIDENCE_ORDER,
} from './types.js'

const _varPrefixCache = new Map<string, RegExp>()

export interface FixTemplate {
  ruleId: string
  confidence: FixConfidence
  category: FixCategory
  generateFix: (violation: { line: number; column: number; message: string; source: string }) => { replacement: string; description: string } | null
}

interface ViolationInput {
  ruleId: string
  filePath: string
  line: number
  column: number
  message: string
  severity?: string
}

let suggestionCounter = 0

function generateId(): string {
  suggestionCounter++
  return `fix-${Date.now()}-${suggestionCounter}-${Math.random().toString(36).slice(2, 8)}`
}

export class SuggestionEngine {
  private config: FixerConfig
  private fixTemplates: Map<string, FixTemplate>

  constructor(config?: Partial<FixerConfig>) {
    this.config = { ...DEFAULT_FIXER_CONFIG, ...config }
    this.fixTemplates = new Map()
    this.registerDefaultTemplates()
  }

  generateSuggestions(violations: ViolationInput[]): FixPlan[] {
    const grouped = new Map<string, ViolationInput[]>()
    for (const v of violations) {
      append(grouped, v.filePath, v)
    }

    const plans: FixPlan[] = []
    for (const [filePath, fileViolations] of grouped) {
      const suggestions: FixSuggestion[] = []
      for (const violation of fileViolations) {
        if (suggestions.length >= this.config.maxSuggestionsPerFile) break
        if (this.config.excludedRules.includes(violation.ruleId)) continue

        const suggestion = this.generateSuggestion(violation)
        if (suggestion) {
          if (this.config.includedCategories.length > 0 && !this.config.includedCategories.includes(suggestion.category)) {
            continue
          }
          suggestions.push(suggestion)
        }
      }

      const safeFixCount = suggestions.reduce((c, s) => s.confidence === 'safe' ? c + 1 : c, 0)
      const basePlan: Omit<FixPlan, 'riskAssessment'> = {
        filePath,
        suggestions,
        safeFixCount,
        totalFixCount: suggestions.length,
        estimatedTimeSaved: suggestions.length * 0.5,
      }
      const plan: FixPlan = {
        ...basePlan,
        riskAssessment: this.assessRisk(basePlan as FixPlan),
      }
      plans.push(plan)
    }

    return plans
  }

  generateSuggestion(violation: { ruleId: string; filePath: string; line: number; column: number; message: string }): FixSuggestion | null {
    const template = this.fixTemplates.get(violation.ruleId)

    if (template) {
      const source = ''
      const fix = template.generateFix({
        line: violation.line,
        column: violation.column,
        message: violation.message,
        source,
      })

      if (!fix) return this.generateGenericSuggestion(violation)

      const risk = this.confidenceToRisk(template.confidence)
      const patch: FixPatch = {
        startLine: violation.line,
        startColumn: violation.column,
        endLine: violation.line,
        endColumn: violation.column + fix.replacement.length,
        replacement: fix.replacement,
      }

      return {
        id: generateId(),
        ruleId: violation.ruleId,
        filePath: violation.filePath,
        line: violation.line,
        column: violation.column,
        message: violation.message,
        confidence: template.confidence,
        category: template.category,
        risk,
        patch,
        description: fix.description,
        beforeCode: '',
        afterCode: fix.replacement,
      }
    }

    return this.generateGenericSuggestion(violation)
  }

  applyFix(source: string, suggestion: FixSuggestion): string {
    const lines = source.split('\n')
    const { startLine, endLine, startColumn, endColumn, replacement } = suggestion.patch

    const beforeIdx = startLine - 1
    const afterIdx = endLine - 1

    if (beforeIdx < 0 || beforeIdx >= lines.length) return source

    if (startLine === endLine) {
      const line = lines[beforeIdx]!
      lines[beforeIdx] = line.substring(0, startColumn) + replacement + line.substring(endColumn)
    } else {
      const firstPart = lines[beforeIdx]!.substring(0, startColumn)
      const lastPart = afterIdx < lines.length ? lines[afterIdx]!.substring(endColumn) : ''
      const newContent = firstPart + replacement + lastPart
      lines.splice(beforeIdx, afterIdx - beforeIdx + 1, newContent)
    }

    return lines.join('\n')
  }

  applySafeFixes(source: string, plan: FixPlan): string {
    let result = source
    const safeSuggestions = plan.suggestions
      .filter((s) => s.confidence === 'safe')
      .sort((a, b) => b.line - a.line)

    for (const suggestion of safeSuggestions) {
      result = this.applyFix(result, suggestion)
    }

    return result
  }

  getFixPlan(filePath: string, source: string): FixPlan {
    const lines = source.split('\n')
    const suggestions: FixSuggestion[] = []
    const sourceDetectableRules = new Set(['prefer-const', 'no-console', 'no-eval', 'no-any', 'eq-eq-eq'])

    for (let i = 0; i < lines.length && suggestions.length < this.config.maxSuggestionsPerFile; i++) {
      const line = lines[i]!
      const lineNumber = i + 1

      for (const ruleId of sourceDetectableRules) {
        if (suggestions.length >= this.config.maxSuggestionsPerFile) break
        if (this.config.excludedRules.includes(ruleId)) continue

        const template = this.fixTemplates.get(ruleId)
        if (!template) continue

        const fix = template.generateFix({
          line: lineNumber,
          column: 0,
          message: `Auto-detected ${ruleId} violation`,
          source: line,
        })

        if (fix) {
          const risk = this.confidenceToRisk(template.confidence)
          suggestions.push({
            id: generateId(),
            ruleId,
            filePath,
            line: lineNumber,
            column: 0,
            message: `Auto-detected ${ruleId}`,
            confidence: template.confidence,
            category: template.category,
            risk,
            patch: {
              startLine: lineNumber,
              startColumn: 0,
              endLine: lineNumber,
              endColumn: line.length,
              replacement: fix.replacement,
            },
            description: fix.description,
            beforeCode: line,
            afterCode: fix.replacement,
          })
        }
      }
    }

    const safeFixCount = suggestions.reduce((c, s) => s.confidence === 'safe' ? c + 1 : c, 0)
    return {
      filePath,
      suggestions,
      safeFixCount,
      totalFixCount: suggestions.length,
      estimatedTimeSaved: suggestions.length * 0.5,
      riskAssessment: {
        level: 'low',
        factors: [],
        affectedLines: 0,
        breakingChanges: false,
        requiresReview: false,
      },
    }
  }

  assessRisk(plan: FixPlan): FixRiskAssessment {
    const factors: string[] = []
    let level: 'low' | 'medium' | 'high' = 'low'
    let breakingChanges = false
    let requiresReview = false

    const unsafeCount = plan.suggestions.reduce((c, s) => (s.confidence === 'unsafe' || s.confidence === 'manual') ? c + 1 : c, 0)
    const safeCount = plan.suggestions.reduce((c, s) => s.confidence === 'safe' ? c + 1 : c, 0)

    if (unsafeCount > 0) {
      factors.push(`${unsafeCount} unsafe or manual fix(es) require human review`)
      requiresReview = true
    }

    if (plan.totalFixCount > 10) {
      factors.push('More than 10 fixes in a single file increases regression risk')
      level = 'high'
    }

    let minLine = Infinity
    let maxLine = -Infinity
    for (const s of plan.suggestions) {
      if (s.patch.startLine < minLine) minLine = s.patch.startLine
      if (s.patch.endLine > maxLine) maxLine = s.patch.endLine
    }
    const affectedLines = plan.suggestions.length > 0 ? maxLine - minLine + 1 : 0

    if (affectedLines > 50) {
      factors.push('Fixes span more than 50 lines')
      if (level === 'low') level = 'medium'
    }

    const hasOverlapping = this.hasOverlappingFixes(plan.suggestions)
    if (hasOverlapping) {
      factors.push('Overlapping fix ranges detected')
      level = 'high'
      breakingChanges = true
    }

    if (!hasOverlapping && !breakingChanges) {
      if (unsafeCount === 0 && safeCount > 0 && plan.totalFixCount <= 10 && affectedLines <= 50) {
        level = 'low'
      } else if (level === 'low' && plan.totalFixCount > 5) {
        level = 'medium'
      }
    }

    if (factors.length === 0) {
      factors.push('All fixes are safe with low impact')
    }

    return {
      level,
      factors,
      affectedLines,
      breakingChanges,
      requiresReview,
    }
  }

  prioritize(suggestions: FixSuggestion[]): FixSuggestion[] {
    return [...suggestions].sort((a, b) => {
      const confA = CONFIDENCE_ORDER[a.confidence]
      const confB = CONFIDENCE_ORDER[b.confidence]
      if (confA !== confB) return confB - confA
      return a.line - b.line
    })
  }

  registerTemplate(ruleId: string, template: FixTemplate): void {
    this.fixTemplates.set(ruleId, template)
  }

  getTemplates(): Map<string, FixTemplate> {
    return new Map(this.fixTemplates)
  }

  getConfig(): FixerConfig {
    return { ...this.config }
  }

  private confidenceToRisk(confidence: FixConfidence): 'low' | 'medium' | 'high' {
    switch (confidence) {
      case 'safe': return 'low'
      case 'suggested': return 'low'
      case 'unsafe': return 'medium'
      case 'manual': return 'high'
    }
  }

  private generateGenericSuggestion(violation: { ruleId: string; filePath: string; line: number; column: number; message: string }): FixSuggestion | null {
    const ruleId = violation.ruleId

    if (ruleId === 'prefer-const') {
      return this.createSuggestion(violation, 'safe', 'formatting', 'low', 'const', 'Replace let with const for variables that are never reassigned')
    }
    if (ruleId === 'no-console') {
      return this.createSuggestion(violation, 'suggested', 'refactor', 'low', '/* console */', 'Comment out or remove console statement')
    }
    if (ruleId === 'no-unused-var') {
      return this.createSuggestion(violation, 'suggested', 'refactor', 'low', '_unused', 'Prefix unused variable with underscore')
    }
    if (ruleId === 'no-eval') {
      return this.createSuggestion(violation, 'unsafe', 'security', 'medium', 'Function()', 'Replace eval with Function constructor or JSON.parse')
    }
    if (ruleId === 'max-params') {
      return this.createSuggestion(violation, 'manual', 'refactor', 'high', 'options: object', 'Refactor parameters into an options object')
    }
    if (ruleId === 'no-any') {
      return this.createSuggestion(violation, 'manual', 'type-fix', 'high', 'unknown', 'Replace any with a proper type annotation')
    }
    if (ruleId === 'eq-eq-eq') {
      return this.createSuggestion(violation, 'safe', 'type-fix', 'low', '===', 'Replace == with strict equality ===')
    }

    return this.createSuggestion(violation, 'manual', 'refactor', 'medium', '', `Manual fix required for ${ruleId}`)
  }

  private createSuggestion(
    violation: { ruleId: string; filePath: string; line: number; column: number; message: string },
    confidence: FixConfidence,
    category: FixCategory,
    risk: 'low' | 'medium' | 'high',
    replacement: string,
    description: string,
  ): FixSuggestion {
    return {
      id: generateId(),
      ruleId: violation.ruleId,
      filePath: violation.filePath,
      line: violation.line,
      column: violation.column,
      message: violation.message,
      confidence,
      category,
      risk,
      patch: {
        startLine: violation.line,
        startColumn: violation.column,
        endLine: violation.line,
        endColumn: violation.column + replacement.length,
        replacement,
      },
      description,
      beforeCode: '',
      afterCode: replacement,
    }
  }

  private hasOverlappingFixes(suggestions: FixSuggestion[]): boolean {
    const sorted = [...suggestions].sort((a, b) => a.patch.startLine - b.patch.startLine)
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!
      const curr = sorted[i]!
      if (prev.patch.endLine >= curr.patch.startLine && prev.patch.startLine <= curr.patch.endLine) {
        if (prev.patch.endLine === curr.patch.startLine) {
          if (prev.patch.endColumn > curr.patch.startColumn) return true
        } else {
          return true
        }
      }
    }
    return false
  }

  private registerDefaultTemplates(): void {
    this.fixTemplates.set('prefer-const', {
      ruleId: 'prefer-const',
      confidence: 'safe',
      category: 'formatting',
      generateFix: (v) => {
        const line = v.source || ''
        const match = line.match(/\blet\b/)
        if (!match || match.index === undefined) return null
        const replaced = line.substring(0, match.index) + 'const' + line.substring(match.index + 3)
        return { replacement: replaced, description: 'Replace let with const for variables that are never reassigned' }
      },
    })

    this.fixTemplates.set('no-console', {
      ruleId: 'no-console',
      confidence: 'suggested',
      category: 'refactor',
      generateFix: (v) => {
        const line = v.source || ''
        if (!line.includes('console.')) return null
        const match = line.match(/^(.*?)console\.\w+\([^)]*\)\s*;?\s*$/)
        if (match?.[1] !== undefined) {
          const indent = match[1]!
          return { replacement: `${indent}// console statement removed`, description: 'Comment out or remove console statement' }
        }
        return { replacement: '// console statement removed', description: 'Remove console statement' }
      },
    })

    this.fixTemplates.set('no-unused-var', {
      ruleId: 'no-unused-var',
      confidence: 'suggested',
      category: 'refactor',
      generateFix: (v) => {
        const line = v.source || ''
        const match = line.match(/\b(var|let|const)\s+(\w+)/)
        if (!match?.[2]) return null
        const varName = match[2]
        if (varName.startsWith('_')) return null
        let varRegex = _varPrefixCache.get(varName)
        if (!varRegex) {
          varRegex = new RegExp(`\\b(var|let|const)\\s+${varName}`)
          _varPrefixCache.set(varName, varRegex)
        }
        const replaced = line.replace(varRegex, `$1 _${varName}`)
        return { replacement: replaced, description: `Prefix unused variable '${varName}' with underscore` }
      },
    })

    this.fixTemplates.set('no-eval', {
      ruleId: 'no-eval',
      confidence: 'unsafe',
      category: 'security',
      generateFix: (v) => {
        const line = v.source || ''
        if (!line.includes('eval(')) return null
        const replaced = line.replace(/\beval\(/, 'Function(')
        return { replacement: replaced, description: 'Replace eval with Function constructor' }
      },
    })

    this.fixTemplates.set('max-params', {
      ruleId: 'max-params',
      confidence: 'manual',
      category: 'refactor',
      generateFix: () => {
        return null
      },
    })

    this.fixTemplates.set('no-any', {
      ruleId: 'no-any',
      confidence: 'manual',
      category: 'type-fix',
      generateFix: (v) => {
        const line = v.source || ''
        if (!line.includes(': any')) return null
        const replaced = line.replace(/:\s*any\b/, ': unknown')
        return { replacement: replaced, description: 'Replace any with unknown type' }
      },
    })

    this.fixTemplates.set('eq-eq-eq', {
      ruleId: 'eq-eq-eq',
      confidence: 'safe',
      category: 'type-fix',
      generateFix: (v) => {
        const line = v.source || ''
        if (!line.includes('==') || line.includes('===')) return null
        const replaced = line.replace(/([^!=])==(?!=)/g, '$1===')
        return { replacement: replaced, description: 'Replace == with strict equality ===' }
      },
    })
  }
}
