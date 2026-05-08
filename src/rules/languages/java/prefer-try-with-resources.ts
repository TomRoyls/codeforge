import type { RuleViolation } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { createViolation } from '../../types.js'

interface PreferTryWithResourcesOptions extends RuleOptions {}

const CLOSE_CALL_REGEX = /\.close\s*\(\s*\)/g

const TRY_WITH_RESOURCES_PATTERN = /try\s*\(/g

const RESOURCE_TYPES = new Set([
  'FileInputStream',
  'FileOutputStream',
  'BufferedReader',
  'BufferedWriter',
  'FileReader',
  'FileWriter',
  'Connection',
  'Statement',
  'PreparedStatement',
  'ResultSet',
  'InputStream',
  'OutputStream',
  'Reader',
  'Writer',
  'Socket',
  'ServerSocket',
  'Channel',
])

export function analyzePreferTryWithResources(code: string, filePath: string = '<input>'): RuleViolation[] {
  const violations: RuleViolation[] = []
  const lines = code.split('\n')

  const hasTryWithResources = lines.some((line) => TRY_WITH_RESOURCES_PATTERN.test(line))
  if (hasTryWithResources) return violations

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    let hasResourceType = false
    for (const rt of RESOURCE_TYPES) {
      if (line.includes(rt)) {
        hasResourceType = true
        break
      }
    }

    if (!hasResourceType) continue

    for (let j = i; j < Math.min(lines.length, i + 30); j++) {
      const checkLine = lines[j]!
      CLOSE_CALL_REGEX.lastIndex = 0

      if (CLOSE_CALL_REGEX.test(checkLine)) {
        const column = checkLine.indexOf('.close()')
        violations.push(
          createViolation(
            filePath,
            `Manual .close() call detected. Use try-with-resources instead.`,
            { column: Math.max(0, column), line: j + 1 },
            'java/prefer-try-with-resources',
            'info',
            'Use try (Resource r = new Resource()) { ... } to ensure automatic resource cleanup.',
          ),
        )
        break
      }
    }
  }

  return violations
}

export const preferTryWithResourcesRule: RuleDefinition<PreferTryWithResourcesOptions> = {
  create(_options: PreferTryWithResourcesOptions) {
    return {
      onComplete: () => [],
      visitor: {},
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects manual .close() calls instead of try-with-resources in Java',
    name: 'java/prefer-try-with-resources',
    recommended: true,
    severity: 'info',
  },
}

export default preferTryWithResourcesRule
