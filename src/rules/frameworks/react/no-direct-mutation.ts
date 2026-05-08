import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoDirectMutationOptions extends RuleOptions {}

export const noDirectMutationRule: RuleDefinition<NoDirectMutationOptions> = {
  create(_options: NoDirectMutationOptions) {
    const violations: RuleViolation[] = []
    const useStateVars = new Set<string>()

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isCallExpression(node)) {
            const expression = node.getExpression()
            if (Node.isIdentifier(expression) && expression.getText() === 'useState') {
              const parent = node.getParent()
              if (Node.isVariableDeclaration(parent)) {
                const nameNode = parent.getNameNode()
                if (Node.isArrayBindingPattern(nameNode)) {
                  const elements = nameNode.getElements()
                  for (const el of elements) {
                    if (Node.isBindingElement(el)) {
                      const child = el.getNameNode()
                      if (Node.isIdentifier(child)) {
                        useStateVars.add(child.getText())
                      }
                    }
                  }
                }
              }
            }
          }

          if (Node.isBinaryExpression(node)) {
            const op = node.getOperatorToken().getKind()
            if (op !== SyntaxKind.EqualsToken && op !== SyntaxKind.PlusEqualsToken && op !== SyntaxKind.MinusEqualsToken) return

            const left = node.getLeft()
            if (Node.isPropertyAccessExpression(left)) {
              const fullText = left.getText()
              if (fullText.startsWith('this.state.')) {
                const range = getNodeRange(left)
                violations.push({
                  filePath: node.getSourceFile().getFilePath(),
                  message: 'Direct mutation of component state detected. Use setState() instead.',
                  range,
                  ruleId: 'react/no-direct-mutation',
                  severity: 'error',
                  suggestion: 'Use this.setState() or the setter function from useState() to update state.',
                })
              }
            }

            if (Node.isIdentifier(left)) {
              if (useStateVars.has(left.getText())) {
                const range = getNodeRange(left)
                violations.push({
                  filePath: node.getSourceFile().getFilePath(),
                  message: `Direct mutation of useState variable '${left.getText()}'. Use the setter function instead.`,
                  range,
                  ruleId: 'react/no-direct-mutation',
                  severity: 'error',
                  suggestion: 'Use the setter function from useState() to update state.',
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
    category: 'correctness',
    description: 'Detects direct state mutations in React components',
    name: 'react/no-direct-mutation',
    recommended: true,
    severity: 'error',
  },
}

export default noDirectMutationRule
