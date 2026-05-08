import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoMutatingPropsOptions extends RuleOptions {}

export const noMutatingPropsRule: RuleDefinition<NoMutatingPropsOptions> = {
  create(_options: NoMutatingPropsOptions) {
    const violations: RuleViolation[] = []
    const propNames = new Set<string>()

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isPropertyAssignment(node)) {
            const name = node.getName()
            if (name === 'props') {
              const initializer = node.getInitializer()
              if (initializer && Node.isArrayLiteralExpression(initializer)) {
                for (const element of initializer.getElements()) {
                  if (Node.isStringLiteral(element)) {
                    propNames.add(element.getLiteralValue())
                  }
                }
              }
              if (initializer && Node.isObjectLiteralExpression(initializer)) {
                for (const prop of initializer.getProperties()) {
                  if (Node.isPropertyAssignment(prop)) {
                    propNames.add(prop.getName())
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
              const obj = left.getExpression()
              const fullText = left.getText()
              if (Node.isThisExpression(obj) && fullText.startsWith('this.')) {
                const propName = left.getName()
                if (propNames.has(propName)) {
                  const range = getNodeRange(left)
                  violations.push({
                    filePath: node.getSourceFile().getFilePath(),
                    message: `Direct mutation of prop '${propName}'. Props should not be mutated.`,
                    range,
                    ruleId: 'vue/no-mutating-props',
                    severity: 'error',
                    suggestion: `Use a local data property or emit an event to update the parent instead of mutating prop '${propName}'.`,
                  })
                }
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
    description: 'Detects direct mutation of props in Vue components',
    name: 'vue/no-mutating-props',
    recommended: true,
    severity: 'error',
  },
}

export default noMutatingPropsRule
