import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import type { DSLRuleConfig, DSLViolation } from './types.js'

export interface IntegrationViolation {
  ruleId: string
  filePath: string
  line: number
  column: number
  message: string
  severity: string
  suggestion?: string
  source: string
}

export class DSLIntegration {
  async loadRulesFromDirectory(dirPath: string): Promise<DSLRuleConfig[]> {
    const { DSLParser } = await import('./dsl-parser.js')
    const parser = new DSLParser()
    const rules: DSLRuleConfig[] = []

    let entries: string[]
    try {
      const dirEntries = await fs.readdir(dirPath, { withFileTypes: true })
      entries = dirEntries
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((name) => name.endsWith('.yaml') || name.endsWith('.yml') || name.endsWith('.json'))
    } catch {
      return []
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry)
      const result = await parser.parseFile(fullPath)
      if (result.success) {
        rules.push(...result.rules)
      }
    }

    return rules
  }

  convertToViolations(results: Map<string, DSLViolation[]>): IntegrationViolation[] {
    const violations: IntegrationViolation[] = []

    for (const [filePath, dslViolations] of results) {
      for (const v of dslViolations) {
        violations.push({
          ruleId: v.ruleId,
          filePath,
          line: v.line,
          column: v.column,
          message: v.message,
          severity: v.severity,
          suggestion: v.suggestion,
          source: 'dsl',
        })
      }
    }

    return violations
  }

  mergeWithExistingRules(
    dslRules: DSLRuleConfig[],
    existingRuleIds: string[],
  ): { merged: DSLRuleConfig[]; conflicts: string[] } {
    const existingSet = new Set(existingRuleIds)
    const conflicts: string[] = []
    const merged: DSLRuleConfig[] = []

    for (const rule of dslRules) {
      if (existingSet.has(rule.id)) {
        conflicts.push(rule.id)
      } else {
        merged.push(rule)
        existingSet.add(rule.id)
      }
    }

    return { merged, conflicts }
  }

  getRuleMetadata(rule: DSLRuleConfig): object {
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      severity: rule.severity,
      category: rule.category,
      enabled: rule.enabled,
      hasFix: rule.fix !== undefined,
      fixType: rule.fix?.type,
      hasSuggestion: rule.suggestion !== undefined,
      conditionType: rule.condition.type,
    }
  }
}
