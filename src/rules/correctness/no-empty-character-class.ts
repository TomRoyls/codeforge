import type {
  RuleContext,
  RuleDefinition,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    end: { column: 1, line: 1 },
    start: { column: 0, line: 1 },
  }

  if (!node || typeof node !== 'object') {
    return defaultLoc
  }

  const n = node as Record<string, unknown>
  const loc = n.loc as Record<string, unknown> | undefined

  if (!loc) {
    return defaultLoc
  }

  const start = loc.start as Record<string, unknown> | undefined
  const end = loc.end as Record<string, unknown> | undefined

  return {
    end: {
      column: typeof end?.column === 'number' ? end.column : 0,
      line: typeof end?.line === 'number' ? end.line : 1,
    },
    start: {
      column: typeof start?.column === 'number' ? start.column : 0,
      line: typeof start?.line === 'number' ? start.line : 1,
    },
  }
}

function isEmptyCharacterClass(value: unknown): boolean {
  // Handle RegExp objects
  if (value instanceof RegExp) {
    return value.source.includes('[]')
  }
  
  // Handle string values that look like regex literals (e.g., "/[]/")
  if (typeof value === 'string') {
    // Check if string is a regex literal pattern
    const regexLiteralMatch = value.match(/^\/(.+)\/[gimsuvy]*$/)
    if (regexLiteralMatch && regexLiteralMatch[1]) {
      return regexLiteralMatch[1].includes('[]')
    }
  }
  
  return false
}

export const noEmptyCharacterClassRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      Literal(node: unknown): void {
        if (!node || typeof node !== 'object') {
          return
        }
        
        const n = node as Record<string, unknown>
        
        if (isEmptyCharacterClass(n.value)) {
          context.report({
            loc: extractLocation(node),
            message: 'Empty character class in regular expression',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'correctness',
      description: 'Disallow empty character classes in regular expressions',
      recommended: true,
    },
    schema: [],
    severity: 'error',
    type: 'problem',
  },
}

export default noEmptyCharacterClassRule
