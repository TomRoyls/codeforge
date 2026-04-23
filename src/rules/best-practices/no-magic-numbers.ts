import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface NoMagicNumbersOptions extends RuleOptions {
  ignore?: number[]
  ignoreArrayIndexes?: boolean
  ignoreArrayLiterals?: boolean
  ignoreDefaultValues?: boolean
  ignoreEnums?: boolean
  ignoreNumericLiteralTypes?: boolean
  ignoreReadonlyClassProperties?: boolean
  ignoreTypeIndexes?: boolean
}

const DEFAULT_IGNORED_NUMBERS = [0, 1, -1]

function isIgnoredContext(node: Node, options: NoMagicNumbersOptions): boolean {
  const parent = node.getParent()
  if (!parent) return false

  if (options.ignoreEnums && Node.isEnumMember(parent)) {
    return true
  }

  if (options.ignoreDefaultValues) {
    if (Node.isParametered(parent)) {
      return true
    }

    if (Node.isPropertyAssignment(parent)) {
      return true
    }

    if (Node.isBindingElement(parent)) {
      return true
    }
  }

  if (options.ignoreReadonlyClassProperties && Node.isPropertyDeclaration(parent)) {
    const modifiers = parent.getModifiers()
    if (modifiers.some((m) => m.getKind() === SyntaxKind.ReadonlyKeyword)) {
      return true
    }
  }

  if (options.ignoreNumericLiteralTypes && Node.isLiteralTypeNode(parent)) {
    return true
  }

  if (options.ignoreArrayIndexes && Node.isElementAccessExpression(parent)) {
    const argumentExpression = parent.getArgumentExpression()
    if (argumentExpression === node) {
      return true
    }
  }

  if (options.ignoreTypeIndexes && Node.isIndexedAccessTypeNode(parent)) {
    return true
  }

  if (Node.isObjectLiteralExpression(parent)) {
    return true
  }

  if (options.ignoreArrayLiterals && Node.isArrayLiteralExpression(parent)) {
    return true
  }

  if (Node.isPropertyAssignment(parent)) {
    return true
  }

  if (Node.isVariableDeclaration(parent)) {
    const initializer = parent.getInitializer()
    if (initializer === node) {
      const declList = parent.getVariableStatement()
      if (declList && declList.getDeclarationKind() === 'const') {
        return true
      }
    }
  }

  return false
}

export const noMagicNumbersRule: RuleDefinition<NoMagicNumbersOptions> = {
  create(options: NoMagicNumbersOptions) {
    const violations: RuleViolation[] = []
    const ignoredNumbers = new Set([...(options.ignore ?? []), ...DEFAULT_IGNORED_NUMBERS])

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          if (!Node.isNumericLiteral(node)) return

          const value = node.getLiteralValue()

          if (ignoredNumbers.has(value)) {
            return
          }

          if (isIgnoredContext(node, options)) {
            return
          }

          const range = getNodeRange(node)
          violations.push({
            filePath: node.getSourceFile().getFilePath(),
            message: `Magic number '${value}' detected. Consider assigning it to a named constant for better readability and maintainability.`,
            range,
            ruleId: 'no-magic-numbers',
            severity: 'warning',
            suggestion:
              'Extract this number to a named constant at the top of the file or in a dedicated constants file.',
          })
        },
      },
    }
  },
  defaultOptions: {
    ignore: [],
    ignoreArrayIndexes: true,
    ignoreArrayLiterals: true,
    ignoreDefaultValues: false,
    ignoreEnums: true,
    ignoreNumericLiteralTypes: true,
    ignoreReadonlyClassProperties: false,
    ignoreTypeIndexes: true,
  },
  meta: {
    category: 'style',
    description: 'Disallow magic numbers that should be named constants',
    fixable: 'code',
    name: 'no-magic-numbers',
    recommended: false,
  },
}

export function analyzeNoMagicNumbers(
  sourceFile: SourceFile,
  options: NoMagicNumbersOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions: NoMagicNumbersOptions = {
    ignore: [],
    ignoreArrayIndexes: true,
    ignoreArrayLiterals: true,
    ignoreDefaultValues: false,
    ignoreEnums: true,
    ignoreNumericLiteralTypes: true,
    ignoreReadonlyClassProperties: false,
    ignoreTypeIndexes: true,
    ...options,
  }
  const ignoredNumbers = new Set([...(mergedOptions.ignore ?? []), ...DEFAULT_IGNORED_NUMBERS])

  traverseAST(
    sourceFile,
    {
      visitNode(node: Node, _context: VisitorContext) {
        if (!Node.isNumericLiteral(node)) return

        const value = node.getLiteralValue()

        if (ignoredNumbers.has(value)) {
          return
        }

        if (isIgnoredContext(node, mergedOptions)) {
          return
        }

        const range = getNodeRange(node)
        violations.push({
          filePath: sourceFile.getFilePath(),
          message: `Magic number '${value}' detected. Consider assigning it to a named constant for better readability and maintainability.`,
          range,
          ruleId: 'no-magic-numbers',
          severity: 'warning',
          suggestion:
            'Extract this number to a named constant at the top of the file or in a dedicated constants file.',
        })
      },
    },
    violations,
  )

  return violations
}
