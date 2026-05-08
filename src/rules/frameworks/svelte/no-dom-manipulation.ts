import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoDomManipulationOptions extends RuleOptions {}

const DOM_PATTERNS = [
  'getElementById',
  'getElementsByClassName',
  'getElementsByTagName',
  'querySelector',
  'querySelectorAll',
  'createElement',
]

const STYLE_ASSIGNMENT_PATTERN = /\.style\.\w+/

export const noDomManipulationRule: RuleDefinition<NoDomManipulationOptions> = {
  create(_options: NoDomManipulationOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isCallExpression(node)) {
            const expression = node.getExpression()
            if (Node.isPropertyAccessExpression(expression)) {
              const obj = expression.getExpression()
              const method = expression.getName()

              if (Node.isIdentifier(obj) && obj.getText() === 'document') {
                if (DOM_PATTERNS.includes(method)) {
                  const range = getNodeRange(node)
                  violations.push({
                    filePath: node.getSourceFile().getFilePath(),
                    message: `Direct DOM manipulation '${obj.getText()}.${method}()' found. Use Svelte's reactivity instead.`,
                    range,
                    ruleId: 'svelte/no-dom-manipulation',
                    severity: 'warning',
                    suggestion: `Use Svelte's reactive declarations and bindings instead of direct DOM manipulation.`,
                  })
                }
              }
            }
          }

          if (Node.isBinaryExpression(node)) {
            const operator = node.getOperatorToken().getText()
            if (operator !== '=' && operator !== '+=' && operator !== '-=') return

            const left = node.getLeft()
            if (Node.isPropertyAccessExpression(left)) {
              const leftText = left.getText()
              if (STYLE_ASSIGNMENT_PATTERN.test(leftText)) {
                const range = getNodeRange(node)
                violations.push({
                  filePath: node.getSourceFile().getFilePath(),
                  message: `Direct style manipulation '${leftText}' found. Use Svelte's style directives instead.`,
                  range,
                  ruleId: 'svelte/no-dom-manipulation',
                  severity: 'warning',
                  suggestion: `Use Svelte's style:directive or reactive variables for styling.`,
                })
              }
            }
          }
        },
      },
    }
  },
  defaultOptions: {},
  meta: {
    category: 'patterns',
    description: 'Detects direct DOM manipulation in Svelte components',
    name: 'svelte/no-dom-manipulation',
    recommended: true,
    severity: 'warning',
  },
}

export default noDomManipulationRule
