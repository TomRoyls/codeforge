import type {
  RuleDefinition,
  RuleContext,
  RuleVisitor,
  SourceLocation,
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

function isVariableDeclarator(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'VariableDeclarator'
}

function hasTypeAnnotation(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  const typeAnnotation = n.typeAnnotation as Record<string, unknown> | undefined

  if (!typeAnnotation) {
    return false
  }

  const typeAnnotationType = typeAnnotation.type as string | undefined

  return (
    typeAnnotationType === 'TSStringKeyword' ||
    typeAnnotationType === 'TSNumberKeyword' ||
    typeAnnotationType === 'TSBooleanKeyword'
  )
}

function getInitType(node: unknown): string | undefined {
  if (!node || typeof node !== 'object') {
    return undefined
  }
  const n = node as Record<string, unknown>
  const init = n.init as Record<string, unknown> | undefined

  if (!init) {
    return undefined
  }

  const initType = init.type as string | undefined

  if (initType === 'StringLiteral') {
    return 'string'
  }
  if (initType === 'NumericLiteral') {
    return 'number'
  }
  if (initType === 'BooleanLiteral') {
    return 'boolean'
  }

  return undefined
}

export const noInferrableTypesRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description:
        'Disallow explicit type declarations in variables where the type can be easily inferred from the initial value.',
      category: 'patterns',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-inferrable-types',
    },
    schema: [],
    fixable: undefined,
  },

  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        if (!isVariableDeclarator(node)) {
          return
        }

        if (!hasTypeAnnotation(node)) {
          return
        }

        const initType = getInitType(node)

        if (initType) {
          const location = extractLocation(node)
          context.report({
            message: `Type '${initType}' is inferrable from the initial value. Remove the type annotation for cleaner code.`,
            loc: location,
          })
        }
      },
    }
  },
}

export default noInferrableTypesRule
