import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor
  SourceLocation
} from '../../plugins/types.js'

function extractLocation(node: unknown): SourceLocation {
  const defaultLoc: SourceLocation = {
    start: { line: 1, column: 0 },
    end: { line: 1, column: 1 },
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
    start: {
      line: typeof start?.line === 'number' ? start.line : 1,
      column: typeof start?.column === 'number' ? start.column : 0,
    },
    end: {
      line: typeof end?.line === 'number' ? end.line : 1,
      column: typeof end?.column === 'number' ? end.column : 0,
    },
  }
}

function isEmptyCharacterClass(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'Literal' || typeof n.value !== 'string') {
    return false
  }

  const value = n.value as string

  const regexPattern = /^\/(.*)\/([gimsuy]*)$/
  const match = value.match(regexPattern)

  if (!match) {
    return false
  }

  const pattern = match[1]

  return pattern === '[]'
}

function isEmptyCharacterClass(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'Literal' || typeof n.value !== 'string') {
    return false
  }

  const value = n.value as string

  const regexPattern = /^\/(.*)\/([gimsuy]*)$/
  const match = value.match(regexPattern)

  if (!match) {
    return false
  }

  const pattern = match[1]

  return pattern === '[]'
}

export default noEmptyCharacterClassRule
