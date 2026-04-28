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
