import type { RuleDefinition, RuleContext, RuleVisitor } from '../../plugins/types.js'
import { extractLocation, getRange } from '../../utils/ast-helpers.js'

function isConditionalExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }
  const n = node as Record<string, unknown>
  return n.type === 'ConditionalExpression'
}

function generateIfElse(
  source: string,
  node: Record<string, unknown>,
  indent = '  ',
): string | null {
  const test = node.test
  const consequent = node.consequent
  const alternate = node.alternate

  const testRange = getRange(test)
  const consequentRange = getRange(consequent)
  const alternateRange = getRange(alternate)

  if (!testRange || !consequentRange || !alternateRange) {
    return null
  }

  const testSource = source.slice(testRange[0], testRange[1])
  const consequentSource = source.slice(consequentRange[0], consequentRange[1])
  const alternateSource = source.slice(alternateRange[0], alternateRange[1])

  const consequentIsNested = isConditionalExpression(consequent)
  const alternateIsNested = isConditionalExpression(alternate)

  if (consequentIsNested) {
    const nestedIfElse = generateIfElse(
      source,
      consequent as Record<string, unknown>,
      indent + '  ',
    )
    if (!nestedIfElse) return null
    return `${indent}if (${testSource}) {\n${nestedIfElse}\n${indent}} else {\n${indent}  ${alternateSource}\n${indent}}`
  }

  if (alternateIsNested) {
    const nestedIfElse = generateIfElse(source, alternate as Record<string, unknown>, indent + '  ')
    if (!nestedIfElse) return null
    return `${indent}if (${testSource}) {\n${indent}  ${consequentSource}\n${indent}} else {\n${nestedIfElse}\n${indent}}`
  }

  return `${indent}if (${testSource}) {\n${indent}  ${consequentSource}\n${indent}} else {\n${indent}  ${alternateSource}\n${indent}}`
}

export const noNestedTernaryRule: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Do not nest ternary expressions. Use if-else or switch statements instead.',
      category: 'style',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-nested-ternary',
    },
    schema: [],
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        if (!isConditionalExpression(node)) {
          return
        }

        const n = node as Record<string, unknown>
        const consequent = n.consequent
        const alternate = n.alternate

        const isConsequentNested = isConditionalExpression(consequent)
        const isAlternateNested = isConditionalExpression(alternate)

        if (isConsequentNested || isAlternateNested) {
          const location = extractLocation(node)
          const nodeRange = getRange(node)

          let fix: { range: readonly [number, number]; text: string } | undefined
          if (nodeRange) {
            const source = context.getSource()
            const ifElseCode = generateIfElse(source, n, '')
            if (ifElseCode) {
              fix = {
                range: nodeRange,
                text: ifElseCode,
              }
            }
          }

          context.report({
            message: 'Do not nest ternary expressions. Use if-else or switch statements instead.',
            loc: location,
            fix,
          })
        }
      },
    }
  },
}

export default noNestedTernaryRule
