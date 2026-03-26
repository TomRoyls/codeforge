import type { RuleDefinition, RuleOptions } from '../types.js'
import type { RuleViolation, VisitorContext } from '../../ast/visitor.js'
import type { SourceFile } from 'ts-morph'
import { Node, SyntaxKind } from 'ts-morph'
import { getNodeRange, traverseAST } from '../../ast/visitor.js'

interface PreferConstAssertionsOptions extends RuleOptions {
  checkArrays?: boolean
  checkObjects?: boolean
  skipEmpty?: boolean
  skipExported?: boolean
  minimumProperties?: number
}

const DEFAULT_OPTIONS: PreferConstAssertionsOptions = {
  checkArrays: true,
  checkObjects: true,
  skipEmpty: true,
  skipExported: false,
  minimumProperties: 0,
}

function isConstableValue(node: Node): boolean {
  if (Node.isStringLiteral(node)) return true
  if (Node.isNumericLiteral(node)) return true
  const kind = node.getKind()
  if (kind === SyntaxKind.TrueKeyword || kind === SyntaxKind.FalseKeyword) return true
  if (Node.isNullLiteral(node)) return true
  if (Node.isPrefixUnaryExpression(node)) return true
  if (Node.isNoSubstitutionTemplateLiteral(node)) return true
  if (Node.isBigIntLiteral(node)) return true

  if (Node.isObjectLiteralExpression(node)) {
    const properties = node.getProperties()
    for (const prop of properties) {
      if (!Node.isPropertyAssignment(prop)) return false
      const nameNode = prop.getNameNode()
      if (nameNode && Node.isComputedPropertyName(nameNode)) return false
      const initializer = prop.getInitializer()
      if (!initializer || !isConstableValue(initializer)) return false
    }
    return true
  }

  if (Node.isArrayLiteralExpression(node)) {
    const elements = node.getElements()
    for (const elem of elements) {
      if (Node.isSpreadElement(elem)) return false
      if (!isConstableValue(elem)) return false
    }
    return true
  }

  return false
}

function hasTypeAnnotation(declaration: Node): boolean {
  if (!Node.isVariableDeclaration(declaration)) return false
  const typeNode = declaration.getTypeNode()
  return typeNode !== undefined
}

function hasExistingConstAssertion(node: Node): boolean {
  const parent = node.getParent()
  if (!parent) return false

  if (Node.isAsExpression(parent)) {
    const typeNode = parent.getTypeNode()
    if (!typeNode) return false
    const typeText = typeNode.getText()
    return typeText === 'const'
  }

  if (Node.isSatisfiesExpression(parent)) {
    return true
  }

  return false
}

function isExported(node: Node): boolean {
  let current: Node | undefined = node.getParent()
  while (current) {
    if (Node.isVariableStatement(current)) {
      return current.isExported()
    }
    current = current.getParent()
  }
  return false
}

export const preferConstAssertionsRule: RuleDefinition<PreferConstAssertionsOptions> = {
  meta: {
    name: 'prefer-const-assertions',
    description:
      'Enforce using const assertions for better type inference on objects and array literals',
    category: 'style',
    recommended: false,
    fixable: 'code',
  },
  defaultOptions: DEFAULT_OPTIONS,
  create: (options: PreferConstAssertionsOptions) => {
    const violations: RuleViolation[] = []
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    return {
      visitor: {
        visitNode: (node: Node, _context: VisitorContext) => {
          if (!Node.isVariableDeclaration(node)) return

          const declaration = node
          const variableStatement = declaration.getVariableStatement()
          if (!variableStatement) return

          if (variableStatement.getDeclarationKind() !== 'const') return

          if (hasTypeAnnotation(declaration)) return

          const initializer = declaration.getInitializer()
          if (!initializer) return

          if (
            !Node.isObjectLiteralExpression(initializer) &&
            !Node.isArrayLiteralExpression(initializer)
          )
            return

          if (mergedOptions.skipExported && isExported(node)) return

          if (hasExistingConstAssertion(initializer)) return

          if (Node.isObjectLiteralExpression(initializer) && !mergedOptions.checkObjects) return
          if (Node.isArrayLiteralExpression(initializer) && !mergedOptions.checkArrays) return

          const minProps = mergedOptions.minimumProperties ?? 0
          if (mergedOptions.skipEmpty) {
            if (Node.isObjectLiteralExpression(initializer)) {
              if (initializer.getProperties().length === 0) return
            }
            if (Node.isArrayLiteralExpression(initializer)) {
              if (initializer.getElements().length === 0) return
            }
          }

          if (minProps > 0) {
            if (Node.isObjectLiteralExpression(initializer)) {
              if (initializer.getProperties().length < minProps) return
            }
            if (Node.isArrayLiteralExpression(initializer)) {
              if (initializer.getElements().length < minProps) return
            }
          }

          if (!isConstableValue(initializer)) return

          const range = getNodeRange(initializer)
          violations.push({
            ruleId: 'prefer-const-assertions',
            severity: 'info',
            message: `Use 'as const' for better type inference on this ${Node.isObjectLiteralExpression(initializer) ? 'object' : 'array'} literal.`,
            filePath: node.getSourceFile().getFilePath(),
            range,
            suggestion: `Add 'as const' to make the literal type more specific and readonly.`,
          })
        },
      },
      onComplete: () => violations,
    }
  },
}

export function analyzePreferConstAssertions(
  sourceFile: SourceFile,
  options: PreferConstAssertionsOptions = {},
): RuleViolation[] {
  const violations: RuleViolation[] = []
  const mergedOptions: PreferConstAssertionsOptions = { ...DEFAULT_OPTIONS, ...options }

  traverseAST(
    sourceFile,
    {
      visitNode: (node: Node, _context: VisitorContext) => {
        if (!Node.isVariableDeclaration(node)) return

        const declaration = node
        const variableStatement = declaration.getVariableStatement()
        if (!variableStatement) return

        if (variableStatement.getDeclarationKind() !== 'const') return

        if (hasTypeAnnotation(declaration)) return

        const initializer = declaration.getInitializer()
        if (!initializer) return

        if (
          !Node.isObjectLiteralExpression(initializer) &&
          !Node.isArrayLiteralExpression(initializer)
        )
          return

        if (mergedOptions.skipExported && isExported(node)) return

        if (hasExistingConstAssertion(initializer)) return

        if (Node.isObjectLiteralExpression(initializer) && !mergedOptions.checkObjects) return
        if (Node.isArrayLiteralExpression(initializer) && !mergedOptions.checkArrays) return

        const minProps = mergedOptions.minimumProperties ?? 0
        if (mergedOptions.skipEmpty) {
          if (Node.isObjectLiteralExpression(initializer)) {
            if (initializer.getProperties().length === 0) return
          }
          if (Node.isArrayLiteralExpression(initializer)) {
            if (initializer.getElements().length === 0) return
          }
        }

        if (minProps > 0) {
          if (Node.isObjectLiteralExpression(initializer)) {
            if (initializer.getProperties().length < minProps) return
          }
          if (Node.isArrayLiteralExpression(initializer)) {
            if (initializer.getElements().length < minProps) return
          }
        }

        if (!isConstableValue(initializer)) return

        const range = getNodeRange(initializer)
        violations.push({
          ruleId: 'prefer-const-assertions',
          severity: 'info',
          message: `Use 'as const' for better type inference on this ${Node.isObjectLiteralExpression(initializer) ? 'object' : 'array'} literal.`,
          filePath: sourceFile.getFilePath(),
          range,
          suggestion: `Add 'as const' to make the literal type more specific and readonly.`,
        })
      },
    },
    violations,
  )

  return violations
}
