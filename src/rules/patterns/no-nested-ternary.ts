import type { RuleContext, RuleDefinition, RuleVisitor } from '../../plugins/types.js'

import { extractLocation } from '../../ast/location-utils.js'
import { getRange, toASTNode } from '../../utils/ast-helpers.js'

function isConditionalExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'ConditionalExpression'
}

function generateIfElse(
  source: string,
  node: unknown,
  indent = '  ',
): null | string {
  const n = toASTNode(node)
  if (!n) return null

  const {alternate, consequent, test} = n

  const testRange = getRange(test)
  const consequentRange = getRange(consequent)
  const alternateRange = getRange(alternate)

  if (!testRange || !consequentRange || !alternateRange) return null

  const testSource = source.slice(testRange[0], testRange[1])
  const consequentSource = source.slice(consequentRange[0], consequentRange[1])
  const alternateSource = source.slice(alternateRange[0], alternateRange[1])

  const consequentIsNested = isConditionalExpression(consequent)
  const alternateIsNested = isConditionalExpression(alternate)

  if (consequentIsNested) {
    const nestedIfElse = generateIfElse(source, consequent, indent + '  ')
    if (!nestedIfElse) return null
    return `${indent}if (${testSource}) {\n${nestedIfElse}\n${indent}} else {\n${indent}  ${alternateSource}\n${indent}}`
  }

  if (alternateIsNested) {
    const nestedIfElse = generateIfElse(source, alternate, indent + '  ')
    if (!nestedIfElse) return null
    return `${indent}if (${testSource}) {\n${indent}  ${consequentSource}\n${indent}} else {\n${nestedIfElse}\n${indent}}`
  }

  return `${indent}if (${testSource}) {\n${indent}  ${consequentSource}\n${indent}} else {\n${indent}  ${alternateSource}\n${indent}}`
}

export const noNestedTernaryRule: RuleDefinition = {
  create(context: RuleContext): RuleVisitor {
    return {
      ConditionalExpression(node: unknown): void {
        const n = toASTNode(node)
        if (n?.type !== 'ConditionalExpression') return

        const {alternate, consequent} = n
        const isConsequentNested = isConditionalExpression(consequent)
        const isAlternateNested = isConditionalExpression(alternate)

        if (isConsequentNested || isAlternateNested) {
          const location = extractLocation(node)
          const nodeRange = getRange(node)

          let fix: undefined | { range: readonly [number, number]; text: string }
          if (nodeRange) {
            const source = context.getSource()
            const ifElseCode = generateIfElse(source, node, '')
            if (ifElseCode) {
              fix = { range: nodeRange, text: ifElseCode }
            }
          }

          context.report({
            fix,
            loc: location,
            message: 'Do not nest ternary expressions. Use if-else or switch statements instead.',
          })
        }
      },
    }
  },

  meta: {
    docs: {
      category: 'style',
      description: 'Do not nest ternary expressions. Use if-else or switch statements instead.',
      recommended: true,
      url: 'https://codeforge.dev/docs/rules/no-nested-ternary',
    },
    fixable: 'code',
    schema: [],
    severity: 'warn',
    type: 'suggestion',
  },
}

export default noNestedTernaryRule
