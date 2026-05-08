import { Node } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../../types.js'

import { getNodeRange } from '../../../ast/visitor.js'

interface NoInputRenameOptions extends RuleOptions {}

export const noInputRenameRule: RuleDefinition<NoInputRenameOptions> = {
  create(_options: NoInputRenameOptions) {
    const violations: RuleViolation[] = []

    return {
      onComplete() {
        return violations
      },
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (Node.isPropertyDeclaration(node)) {
            const decorators = node.getDecorators()
            for (const decorator of decorators) {
              const expression = decorator.getExpression()
              if (!Node.isCallExpression(expression)) continue

              const callee = expression.getExpression()
              if (!Node.isIdentifier(callee)) continue
              if (callee.getText() !== 'Input') continue

              const args = expression.getArguments()
              if (args.length === 0) continue

              const firstArg = args[0]!
              if (!Node.isStringLiteral(firstArg)) continue

              const alias = firstArg.getLiteralValue()
              const propertyName = node.getName()

              if (alias === propertyName) {
                const range = getNodeRange(decorator)
                violations.push({
                  filePath: node.getSourceFile().getFilePath(),
                  message: `@Input('${propertyName}') is redundant because the alias matches the property name.`,
                  range,
                  ruleId: 'angular/no-input-rename',
                  severity: 'info',
                  suggestion: `Remove the alias: @Input() ${propertyName}`,
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
    description: 'Detects unnecessary @Input alias that matches the property name',
    name: 'angular/no-input-rename',
    recommended: true,
    severity: 'info',
  },
}

export default noInputRenameRule
