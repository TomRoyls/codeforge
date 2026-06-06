import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { toASTNode } from '../../utils/ast-helpers.js'

function hasTypeAnnotation(node: unknown): boolean {
  const n = toASTNode(node)
  const ta = toASTNode(n?.typeAnnotation)
  if (!ta) return false

  const typeAnnotationType = ta.type
  return (
    typeAnnotationType === 'TSStringKeyword' ||
    typeAnnotationType === 'TSNumberKeyword' ||
    typeAnnotationType === 'TSBooleanKeyword'
  )
}

function getInitType(node: unknown): string | undefined {
  const n = toASTNode(node)
  const init = toASTNode(n?.init)
  if (!init) return undefined

  const initType = init.type

  if (initType === 'Literal') {
    if (typeof init.value === 'string') return 'string'
    if (typeof init.value === 'number') return 'number'
    if (typeof init.value === 'boolean') return 'boolean'
  }

  if (initType === 'BooleanLiteral') return 'boolean'

  return undefined
}

export const noInferrableTypesRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclarator(node: unknown): void {
        if (toASTNode(node)?.type !== 'VariableDeclarator') return
        if (!hasTypeAnnotation(node)) return

        const initType = getInitType(node)

        if (initType) {
          const location = extractLocation(node)
          context.report({
            loc: location,
            message: `Type '${initType}' is inferrable from the initial value. Remove the type annotation for cleaner code.`,
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'patterns',
      description:
        'Disallow explicit type declarations in variables where the type can be easily inferred from the initial value.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-inferrable-types',
    },
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noInferrableTypesRule
