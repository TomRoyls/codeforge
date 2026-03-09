import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
} from '../../plugins/types.js'

interface ObjectAssignMatch {
  readonly sourceText: string
  readonly spreadSources: readonly string[]
  readonly location: SourceLocation
}

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

function getNodeText(node: unknown, source: string): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  const n = node as Record<string, unknown>

  if (Array.isArray(n.range) && n.range.length === 2) {
    const start = n.range[0] as number
    const end = n.range[1] as number
    return source.slice(start, end)
  }

  if (typeof n.start === 'number' && typeof n.end === 'number') {
    return source.slice(n.start, n.end)
  }

  return ''
}

function isEmptyObjectLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'ObjectExpression') {
    return false
  }

  const properties = n.properties
  return Array.isArray(properties) && properties.length === 0
}

function isPropertyAccessExpression(node: unknown): node is Record<string, unknown> {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'MemberExpression'
}

function isIdentifier(node: unknown, name: string): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  return n.type === 'Identifier' && n.name === name
}

function isObjectAssignCall(node: unknown): { callee: unknown; args: unknown[] } | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const n = node as Record<string, unknown>

  if (n.type !== 'CallExpression') {
    return null
  }

  const callee = n.callee
  if (!isPropertyAccessExpression(callee)) {
    return null
  }

  const object = callee.object
  const property = callee.property

  if (!isIdentifier(object, 'Object') || !isIdentifier(property, 'assign')) {
    return null
  }

  const args = n.arguments
  if (!Array.isArray(args) || args.length < 2) {
    return null
  }

  return { callee, args }
}

function checkObjectAssignPattern(node: unknown, source: string): ObjectAssignMatch | null {
  const callInfo = isObjectAssignCall(node)
  if (!callInfo) {
    return null
  }

  const { args } = callInfo

  if (!isEmptyObjectLiteral(args[0])) {
    return null
  }

  const spreadSources: string[] = []
  for (let i = 1; i < args.length; i++) {
    const argText = getNodeText(args[i], source)
    if (argText) {
      spreadSources.push(argText)
    }
  }

  if (spreadSources.length === 0) {
    return null
  }

  const fullText = getNodeText(node, source)

  return {
    sourceText: fullText,
    spreadSources,
    location: extractLocation(node),
  }
}

function generateSpreadSuggestion(spreadSources: readonly string[]): string {
  const spreadParts = spreadSources.map((src) => `...${src}`)
  return `{ ${spreadParts.join(', ')} }`
}

export const preferObjectSpreadRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Enforce using object spread syntax ({ ...source }) instead of Object.assign({}, source) for immutable object operations. Object spread is more concise, readable, and provides better type inference in TypeScript.',
      category: 'performance',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/prefer-object-spread',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      CallExpression(node: unknown): void {
        const source = context.getSource()
        const match = checkObjectAssignPattern(node, source)

        if (match) {
          const suggestion = generateSpreadSuggestion(match.spreadSources)
          const spreadDescription = match.spreadSources.map((s) => `...${s}`).join(', ')

          context.report({
            node,
            message: `Prefer object spread ({ ${spreadDescription} }) instead of Object.assign({}, ${match.spreadSources.join(', ')}).`,
            loc: match.location,
            suggest: [
              {
                desc: `Use object spread: ${suggestion}`,
                message: 'Use object spread syntax',
                fix: {
                  range: [0, source.length] as const,
                  text: suggestion,
                },
              },
            ],
          })
        }
      },
    }
  },
}

export default preferObjectSpreadRule
