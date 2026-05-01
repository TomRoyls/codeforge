import { DESCRIBE_FUNCTIONS, HOOK_FUNCTIONS } from './constants.js'

export interface ASTNode {
  accessibility?: string
  alternate?: unknown
  argument?: unknown
  arguments?: unknown[]
  async?: boolean
  await?: boolean
  body?: unknown
  callee?: unknown
  cases?: unknown[]
  column?: number
  computed?: boolean
  consequent?: unknown
  constraint?: unknown
  declaration?: unknown
  declarations?: unknown[]
  decorators?: unknown[]
  elements?: unknown[]
  elementType?: unknown
  end?: unknown
  exported?: unknown
  exportKind?: string
  expression?: unknown
  expressions?: unknown[]
  finalizer?: unknown
  generator?: boolean
  handler?: unknown
  id?: unknown
  imported?: unknown
  importKind?: string
  init?: unknown
  initializer?: unknown
  isTypeOnly?: boolean
  key?: unknown
  kind?: string
  label?: unknown
  left?: unknown
  line?: number
  loc?: unknown
  local?: unknown
  members?: unknown[]
  method?: boolean
  modifiers?: unknown[]
  moduleReference?: unknown
  name?: string
  object?: unknown
  operator?: string
  optional?: boolean
  param?: unknown
  params?: unknown[]
  parent?: unknown
  prefix?: boolean
  program?: unknown
  properties?: unknown[]
  property?: unknown
  quasis?: unknown[]
  range?: [number, number]
  raw?: string
  readonly?: boolean
  regex?: { flags?: string; pattern?: string }
  returnType?: unknown
  right?: unknown
  shorthand?: boolean
  source?: unknown
  specifiers?: unknown[]
  start?: unknown
  static?: boolean
  tag?: unknown
  test?: unknown
  text?: string
  type?: string
  typeAnnotation?: unknown
  typeArguments?: unknown
  typeName?: unknown
  typeParameters?: unknown
  types?: unknown[]
  update?: unknown
  value?: unknown
}

export function toASTNode(node: unknown): ASTNode | null {
  if (!node || typeof node !== 'object') return null
  return node as ASTNode
}

export function getNodeSource(context: { getSource: () => string }, node: unknown): string {
  const n = toASTNode(node)
  if (!n?.range) return ''
  return context.getSource().slice(n.range[0], n.range[1])
}

export function isNewExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'NewExpression'
}

export function isCallExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'CallExpression'
}

export function isMemberExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'MemberExpression'
}

export function isIdentifier(node: unknown, name?: string): boolean {
  const n = toASTNode(node)
  if (n?.type !== 'Identifier') return false
  return name === undefined || n.name === name
}

export function isBinaryExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'BinaryExpression'
}

export function isLiteral(node: unknown): boolean {
  return toASTNode(node)?.type === 'Literal'
}

export function isLogicalExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'LogicalExpression'
}

export function isUnaryExpression(node: unknown): boolean {
  return toASTNode(node)?.type === 'UnaryExpression'
}

export function isTemplateLiteral(node: unknown): boolean {
  return toASTNode(node)?.type === 'TemplateLiteral'
}

export function isFunctionExpression(node: unknown): boolean {
  const n = toASTNode(node)
  return n?.type === 'FunctionExpression' || n?.type === 'ArrowFunctionExpression'
}

export function isReturnStatement(node: unknown): boolean {
  return toASTNode(node)?.type === 'ReturnStatement'
}

export function getIdentifierName(node: unknown): null | string {
  if (!isIdentifier(node)) return null
  return (node as ASTNode).name ?? null
}

export function getCalleeName(node: unknown): null | string {
  if (!isNewExpression(node) && !isCallExpression(node)) return null
  return getIdentifierName((node as ASTNode).callee)
}

export function getArguments(node: unknown): unknown[] {
  if (!isNewExpression(node) && !isCallExpression(node)) return []
  return (node as ASTNode).arguments ?? []
}

export function getRange(node: unknown): [number, number] | null {
  return toASTNode(node)?.range ?? null
}

export function getNodeText(node: unknown, source: string): string {
  const range = getRange(node)
  if (!range) return ''
  return source.slice(range[0], range[1])
}

export function getPropertyName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  if (n.type === 'MemberExpression') {
    return getPropertyName(n.property)
  }

  return null
}

export function isExpectCallee(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n) return false

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name === 'expect'
  }

  if (n.type === 'MemberExpression') {
    const object = toASTNode(n.object)
    if (!object) return false

    if (object.type === 'CallExpression') {
      return isExpectCallee(object.callee)
    }

    if (object.type === 'Identifier' && typeof object.name === 'string') {
      return object.name === 'expect'
    }
  }

  return false
}

/**
 * Check if a node is a CallExpression where the callee is `expect`
 * (directly or via member expression chain like expect().not.toBe).
 */
export function isExpectCall(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name === 'expect'
  }

  if (callee.type === 'MemberExpression') {
    return getExpectRootName(callee) === 'expect'
  }

  return false
}

/**
 * Walk a member expression chain to find the root identifier name.
 * e.g., expect(x).not.toBe -> 'expect'
 */
export function getExpectRootName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  if (n.type === 'Identifier' && typeof n.name === 'string') {
    return n.name
  }

  if (n.type === 'MemberExpression') {
    return getExpectRootName(n.object)
  }

  if (n.type === 'CallExpression') {
    return getExpectRootName(n.callee)
  }

  return null
}

export function getCallRootName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    return callee.name
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (object?.type === 'Identifier' && typeof object.name === 'string') {
      return object.name
    }
  }

  return null
}

export function getFunctionName(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n) return null

  const idNode = toASTNode(n.id)
  if (idNode && typeof idNode.name === 'string') {
    return idNode.name
  }

  const parentNode = toASTNode(n.parent)
  if (!parentNode) return null

  if (parentNode.type === 'VariableDeclarator') {
    const parentIdNode = toASTNode(parentNode.id)
    if (parentIdNode && typeof parentIdNode.name === 'string') {
      return parentIdNode.name
    }
  }

  if (parentNode.type === 'Property' || parentNode.type === 'MethodDefinition') {
    const keyNode = toASTNode(parentNode.key)
    if (keyNode && typeof keyNode.name === 'string') {
      return keyNode.name
    }
  }

  if (parentNode.type === 'AssignmentExpression') {
    const leftNode = toASTNode(parentNode.left)
    if (leftNode?.type === 'Identifier' && typeof leftNode.name === 'string') {
      return leftNode.name
    }
  }

  return null
}

/**
 * Check if a node is a CallExpression that calls a describe-like function
 * (context, describe, suite). Handles both direct calls (`describe()`)
 * and member expression calls (`describe.only()`).
 *
 * @returns The describe function name (e.g. "describe", "context", "suite"),
 *   or null if the node is not a describe call.
 */
export function isDescribeCall(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    if (DESCRIBE_FUNCTIONS.has(callee.name)) {
      return callee.name
    }
    return null
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (
      object?.type === 'Identifier' &&
      typeof object.name === 'string' &&
      DESCRIBE_FUNCTIONS.has(object.name)
    ) {
      return object.name
    }
  }

  return null
}

export function isHookCall(node: unknown): null | string {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return null

  const callee = toASTNode(n.callee)
  if (!callee) return null

  if (callee.type === 'Identifier' && typeof callee.name === 'string') {
    if (HOOK_FUNCTIONS.has(callee.name)) {
      return callee.name
    }
    return null
  }

  if (callee.type === 'MemberExpression') {
    const object = toASTNode(callee.object)
    if (
      object?.type === 'Identifier' &&
      typeof object.name === 'string' &&
      HOOK_FUNCTIONS.has(object.name)
    ) {
      return object.name
    }
  }

  return null
}

/**
 * Recursively check whether a node (or any of its descendants) has the given AST node type.
 * Uses a visited set for cycle detection.
 */
export function containsNodeType(node: unknown, type: string, visited?: Set<unknown>): boolean {
  if (!node || typeof node !== 'object') return false

  const visitedSet = visited ?? new Set<unknown>()
  if (visitedSet.has(node)) return false
  visitedSet.add(node)

  const n = toASTNode(node)
  if (!n) return false

  if (n.type === type) return true

  for (const value of Object.values(n)) {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (containsNodeType(item, type, visitedSet)) return true
        }
      } else if (containsNodeType(value, type, visitedSet)) {
        return true
      }
    }
  }

  return false
}

export function hasNotChain(node: unknown): boolean {
  const n = toASTNode(node)
  if (!n || n.type !== 'CallExpression') return false

  const callee = toASTNode(n.callee)
  if (!callee) return false

  if (callee.type === 'MemberExpression') {
    const propName = getPropertyName(callee.property)
    if (propName === 'not') return true

    const object = toASTNode(callee.object)
    if (object && object.type === 'CallExpression') {
      return hasNotChain(object)
    }
  }

  return false
}
