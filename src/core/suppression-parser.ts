import type { SourceFile } from 'ts-morph'
import type { RuleViolation } from '../ast/visitor.js'
import { logger } from '../utils/logger.js'

export type SuppressionType = 'next-line' | 'block-start' | 'block-end'

export interface Suppression {
  type: SuppressionType
  line: number
  ruleIds: string[]
}

export interface SuppressionParseResult {
  suppressions: Suppression[]
  count: number
}

export interface SuppressionParserOptions {
  verbose?: boolean
}

const DISABLE_PREFIX = 'codeforge-disable'
const ENABLE_PREFIX = 'codeforge-enable'
const NEXT_LINE_SUFFIX = '-next-line'

// Cache the suppression pattern regex to avoid recompilation on every line
const SUPPRESSION_PATTERN =
  /(?:\/\/|\/\*|\*\/?\s*)\s*(codeforge-(?:disable(?:-next-line)?|enable))(?:\s+(.+?))?(?:\s*(?:\*\/|$))/gi

export function parseSuppressions(text: string): SuppressionParseResult {
  const suppressions: Suppression[] = []
  const lines = text.split('\n')

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    if (!line) continue
    const lineNumber = lineIndex + 1
    const lineSuppressions = parseLineSuppressions(line, lineNumber)
    suppressions.push(...lineSuppressions)
  }

  return {
    suppressions,
    count: suppressions.length,
  }
}

function parseLineSuppressions(line: string, lineNumber: number): Suppression[] {
  const suppressions: Suppression[] = []

  SUPPRESSION_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = SUPPRESSION_PATTERN.exec(line)) !== null) {
    const directive = (match[1] ?? '').toLowerCase()
    const rulesPart = match[2]?.trim()

    const suppression = parseSuppressionDirective(directive, rulesPart, lineNumber)
    if (suppression) {
      suppressions.push(suppression)
    }
  }

  return suppressions
}

function parseSuppressionDirective(
  directive: string,
  rulesPart: string | undefined,
  lineNumber: number,
): Suppression | null {
  if (directive === `${DISABLE_PREFIX}${NEXT_LINE_SUFFIX}`) {
    return {
      type: 'next-line',
      line: lineNumber,
      ruleIds: parseRuleIds(rulesPart),
    }
  }

  if (directive === DISABLE_PREFIX) {
    return {
      type: 'block-start',
      line: lineNumber,
      ruleIds: parseRuleIds(rulesPart),
    }
  }

  if (directive === ENABLE_PREFIX) {
    return {
      type: 'block-end',
      line: lineNumber,
      ruleIds: parseRuleIds(rulesPart),
    }
  }

  return null
}

function parseRuleIds(rulesPart: string | undefined): string[] {
  if (!rulesPart) {
    return []
  }

  return rulesPart
    .split(',')
    .map((rule) => rule.trim())
    .filter((rule) => rule.length > 0)
}

export function isViolationSuppressed(
  violation: RuleViolation,
  suppressions: Suppression[],
  options?: SuppressionParserOptions,
): boolean {
  const violationLine = violation.range.start.line
  const violationRuleId = violation.ruleId
  const disabledRules = new Set<string>()
  let allRulesDisabled = false
  const enabledFromAll = new Set<string>()

  for (const suppression of suppressions) {
    if (suppression.type === 'block-start') {
      if (suppression.line <= violationLine) {
        if (suppression.ruleIds.length === 0) {
          allRulesDisabled = true
          enabledFromAll.clear()
        } else {
          for (const ruleId of suppression.ruleIds) {
            disabledRules.add(ruleId)
          }
        }
      }
    } else if (suppression.type === 'block-end') {
      if (suppression.line <= violationLine) {
        if (suppression.ruleIds.length === 0) {
          allRulesDisabled = false
          disabledRules.clear()
          enabledFromAll.clear()
        } else if (allRulesDisabled) {
          for (const ruleId of suppression.ruleIds) {
            enabledFromAll.add(ruleId)
          }
        } else {
          for (const ruleId of suppression.ruleIds) {
            disabledRules.delete(ruleId)
          }
        }
      }
    } else if (suppression.type === 'next-line') {
      const targetLine = suppression.line + 1
      if (targetLine === violationLine) {
        if (suppression.ruleIds.length === 0) {
          logSuppression(violation, 'all rules', options)
          return true
        }
        const ruleIdSet = new Set(suppression.ruleIds)
        if (ruleIdSet.has(violationRuleId)) {
          logSuppression(violation, violationRuleId, options)
          return true
        }
      }
    }
  }

  if (allRulesDisabled) {
    if (!enabledFromAll.has(violationRuleId)) {
      logSuppression(violation, 'all rules (block)', options)
      return true
    }
    return false
  }

  if (disabledRules.has(violationRuleId)) {
    logSuppression(violation, violationRuleId, options)
    return true
  }

  return false
}

function logSuppression(
  violation: RuleViolation,
  suppressedBy: string,
  options?: SuppressionParserOptions,
): void {
  if (options?.verbose) {
    logger.debug(
      `Suppressed violation: ${violation.ruleId} at line ${violation.range.start.line} (suppressed by: ${suppressedBy})`,
    )
  }
}

export function parseSuppressionsFromSourceFile(sourceFile: SourceFile): SuppressionParseResult {
  const text =
    typeof sourceFile.getFullText === 'function' ? sourceFile.getFullText() : sourceFile.getText()
  return parseSuppressions(text)
}

export function filterSuppressedViolations(
  violations: RuleViolation[],
  suppressions: Suppression[],
  options?: SuppressionParserOptions,
): RuleViolation[] {
  return violations.filter((violation) => !isViolationSuppressed(violation, suppressions, options))
}
