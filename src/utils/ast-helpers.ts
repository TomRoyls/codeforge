export function getNodeSource(context: { getSource: () => string }, node: unknown): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  const n = node as Record<string, unknown>
  const range = n.range as [number, number] | undefined
  if (!range) {
    return ''
  }

  return context.getSource().slice(range[0], range[1])
}

export function isNewExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'NewExpression'
}

export function isCallExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'CallExpression'
}

export function isMemberExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'MemberExpression'
}

export function isIdentifier(node: unknown, name?: string): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  const n = node as Record<string, unknown>
  if (n.type !== 'Identifier') {
    return false
  }

  return name === undefined || n.name === name
}

export function isBinaryExpression(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'BinaryExpression'
}

export function isLiteral(node: unknown): boolean {
  if (!node || typeof node !== 'object') {
    return false
  }

  return (node as Record<string, unknown>).type === 'Literal'
}

export function getIdentifierName(node: unknown): null | string {
  if (!isIdentifier(node)) {
    return null
  }

  return (node as Record<string, unknown>).name as string
}

export function getCalleeName(node: unknown): null | string {
  if (!isNewExpression(node) && !isCallExpression(node)) {
    return null
  }

  const n = node as Record<string, unknown>
  const callee = n.callee as unknown
  return getIdentifierName(callee)
}

export function getArguments(node: unknown): unknown[] {
  if (!isNewExpression(node) && !isCallExpression(node)) {
    return []
  }

  const n = node as Record<string, unknown>
  return (n.arguments as unknown[]) ?? []
}

export function getRange(node: unknown): [number, number] | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const range = (node as Record<string, unknown>).range as [number, number] | undefined
  return range ?? null
}

export function getNodeText(node: unknown, source: string): string {
  const range = getRange(node)
  if (!range) {
    return ''
  }

  return source.slice(range[0], range[1])
}
