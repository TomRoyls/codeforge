import type { SourceFile } from 'ts-morph'

import { Node, SyntaxKind } from 'ts-morph'

import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { RuleDefinition, RuleOptions } from '../types.js'

import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferReturnThisTypeOptions extends RuleOptions {}

const DEFAULT_OPTIONS: PreferReturnThisTypeOptions = {}

function getClassName(node: Node): string | undefined {
  let parent = node.getParent()
  while (parent) {
    if (Node.isClassDeclaration(parent)) {
      return parent.getName() ?? undefined
    }

    if (Node.isClassExpression(parent)) {
      const nameNode = parent.getNameNode()
      return nameNode?.getText()
    }

    if (
      Node.isFunctionDeclaration(parent) ||
      Node.isArrowFunction(parent) ||
      Node.isFunctionExpression(parent)
    ) {
      return undefined
    }

    parent = parent.getParent()
  }

  return undefined
}

function checkMethod(node: Node): null | RuleViolation {
  if (!Node.isMethodDeclaration(node)) return null

  const modifiers = node.getModifiers()
  if (modifiers.some((m) => m.getKind() === SyntaxKind.StaticKeyword)) return null
  if (modifiers.some((m) => m.getKind() === SyntaxKind.PrivateKeyword)) return null
  if (modifiers.some((m) => m.getKind() === SyntaxKind.ProtectedKeyword)) return null

  const nameNode = node.getNameNode()
  if (nameNode && nameNode.getKind() === SyntaxKind.PrivateIdentifier) return null

  const returnTypeNode = node.getReturnTypeNode()
  if (!returnTypeNode) return null

  const className = getClassName(node)
  if (!className) return null

  const returnTypeName = returnTypeNode.getText().trim()
  if (returnTypeName !== className) return null

  const range = getNodeRange(node)
  return {
    filePath: node.getSourceFile().getFilePath(),
    message: `Unexpected return type '${className}'. Use 'this' as the return type for better type safety in inheritance chains.`,
    range,
    ruleId: 'prefer-return-this-type',
    severity: 'warning',
    suggestion: `Use 'this' instead of '${className}' as the return type.`,
  }
}

export const preferReturnThisTypeRule: RuleDefinition<PreferReturnThisTypeOptions> = {
  create(_options: PreferReturnThisTypeOptions = {}) {
    const violations: RuleViolation[] = []

    return {
      onComplete: () => violations,
      visitor: {
        visitNode(node: Node, _context: VisitorContext) {
          const violation = checkMethod(node)
          if (violation) {
            violations.push(violation)
          }
        },
      },
    }
  },
  defaultOptions: DEFAULT_OPTIONS,
  meta: {
    category: 'style',
    description:
      'Enforce using `this` type instead of the class name for method return types to support inheritance',
    fixable: 'code',
    name: 'prefer-return-this-type',
    recommended: false,
  },
}

export function analyzePreferReturnThisType(
  sourceFile: SourceFile,
  _options: PreferReturnThisTypeOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []

  traverseAST(sourceFile, {
    visitNode(node: Node, _context: VisitorContext) {
      const violation = checkMethod(node)
      if (violation) {
        violations.push(violation)
      }
    },
  })

  return violations
}
