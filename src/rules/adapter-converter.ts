import { Node } from 'ts-morph'

import {
  ASSIGNMENT_OPERATORS,
  KIND_MAP,
  KIND_NAME_ALIASES,
  KIND_SPECIFIC_MAP,
  LOGICAL_OPERATORS,
  MAX_DEPTH,
  OPERATOR_TOKEN_MAP,
  PROPERTY_MAP,
  SKIP_KEYS,
} from './adapter-constants.js'

// Module-level source text for trivia skipping in convertRawCompilerNode
export let _rangeSourceText = ''

export function setRangeSourceText(text: string): void {
  _rangeSourceText = text
}

export function clearRecord(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    delete obj[key]
  }
}

export function skipTrivia(pos: number): number {
  const text = _rangeSourceText
  if (!text) return pos
  let i = pos
  while (i < text.length) {
    const ch = text.codePointAt(i) ?? 0
    if (ch === 0x20 || ch === 0x09 || ch === 0x0a || ch === 0x0d) {
      i++
      continue
    }

    if (ch === 0x2f && i + 1 < text.length) {
      const next = text.codePointAt(i + 1) ?? 0
      if (next === 0x2f) {
        while (i < text.length && text.codePointAt(i) !== 0x0a) i++
        continue
      }

      if (next === 0x2a) {
        i += 2
        while (
          i + 1 < text.length &&
          !((text.codePointAt(i) ?? 0) === 0x2a && (text.codePointAt(i + 1) ?? 0) === 0x2f)
        )
          i++
        i += 2
        continue
      }
    }

    break
  }

  return i
}

export function convertOperatorToken(token: unknown): string {
  if (typeof token === 'string') return token
  if (typeof token === 'number') {
    const tokenName = KIND_MAP[token as number] ?? ''
    return (OPERATOR_TOKEN_MAP[tokenName] ?? tokenName) || String(token)
  }

  if (token && typeof token === 'object') {
    const obj = token as Record<string, unknown>
    if (typeof obj.type === 'string') {
      const mapped = OPERATOR_TOKEN_MAP[obj.type]
      if (mapped) return mapped
    }

    if (typeof obj.getText === 'function') return (obj.getText as () => string)()
    if (obj.operator !== undefined) return String(obj.operator)
  }

  return String(token)
}

export function convertRawCompilerNode(
  raw: Record<string, unknown>,
  depth: number,
): null | Record<string, unknown> {
  if (depth >= MAX_DEPTH) return null
  if (!raw || typeof raw !== 'object') return null

  const kind: number = raw.kind as number
  const kindName: string = KIND_MAP[kind] ?? `Unknown(${kind})`
  const kindMap = KIND_SPECIFIC_MAP[kindName]

  const result: Record<string, unknown> = {}
  if (typeof raw.pos === 'number' && typeof raw.end === 'number') {
    const startPos = skipTrivia(raw.pos as number)
    result.range = [startPos, raw.end] as [number, number]
    result.start = startPos
    result.end = raw.end
  }

  result.type = KIND_NAME_ALIASES[kindName] ?? kindName

  // Add literal values
  if (kindName === 'StringLiteral' && raw.text !== undefined) {
    result.value = raw.text
    result.raw = `"${raw.text}"`
  } else if (
    (kindName === 'NumericLiteral' || kindName === 'BigIntLiteral') &&
    raw.text !== undefined
  ) {
    result.value = Number(raw.text)
    result.raw = raw.text
  } else if (kindName === 'Identifier' && raw.escapedText !== undefined) {
    result.name = raw.escapedText
    result.value = raw.escapedText
  } else
    switch (kindName) {
      case 'FalseKeyword': {
        result.value = false
        result.raw = 'false'

        break
      }

      case 'NullKeyword': {
        result.value = null
        result.raw = 'null'

        break
      }

      case 'TrueKeyword': {
        result.value = true
        result.raw = 'true'

        break
      }

      default: {
        if (kindName === 'RegularExpressionLiteral' && raw.text !== undefined) {
          result.raw = raw.text as string
          const regexText = raw.text as string
          const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
          if (regexMatch) {
            result.regex = { flags: regexMatch[2], pattern: regexMatch[1] }
          }
        }
      }
    }

  // Iterate children
  for (const [key, val] of Object.entries(raw)) {
    if (key.startsWith('_')) continue
    if (SKIP_KEYS.has(key)) continue

    const estreeName = kindMap?.[key] ?? PROPERTY_MAP[key] ?? key

    // Special: caseBlock → extract clauses array as ESTree cases
    if (key === 'caseBlock' && val && typeof val === 'object') {
      const cb = val as Record<string, unknown>
      if (Array.isArray(cb.clauses)) {
        const converted: unknown[] = []
        for (const clause of cb.clauses) {
          if (
            clause &&
            typeof clause === 'object' &&
            typeof (clause as Record<string, unknown>).kind === 'number'
          ) {
            converted.push(convertRawCompilerNode(clause as Record<string, unknown>, depth + 1))
          }
        }

        result[estreeName] = converted
      }

      continue
    }

    // Special: TemplateExpression → synthesize quasis[] and expressions[]
    if (kindName === 'TemplateExpression' && (key === 'head' || key === 'templateSpans')) {
      if (!result.quasis && !result.expressions) {
        const quasis: unknown[] = []
        const expressions: unknown[] = []

        // head → first TemplateElement (tail=false)
        const head = raw.head as Record<string, unknown> | undefined
        if (head && typeof head.kind === 'number') {
          quasis.push({
            range:
              typeof head.pos === 'number' && typeof head.end === 'number'
                ? [head.pos as number, head.end as number]
                : undefined,
            tail: false,
            type: 'TemplateElement',
            value: {
              cooked: (head.text ?? head.rawText) as string,
              raw: (head.rawText ?? head.text) as string,
            },
          })
        }

        // templateSpans → alternating expression + TemplateElement
        const spans = raw.templateSpans as Array<Record<string, unknown>> | undefined
        if (Array.isArray(spans)) {
          for (let i = 0; i < spans.length; i++) {
            const span = spans[i]! as Record<string, unknown>
            const spanExpr = span.expression as Record<string, unknown> | undefined
            if (spanExpr && typeof spanExpr.kind === 'number') {
              expressions.push(convertRawCompilerNode(spanExpr, depth + 1))
            }

            const lit = span.literal as Record<string, unknown> | undefined
            if (lit && typeof lit.kind === 'number') {
              const isTail = i === spans.length - 1
              quasis.push({
                range:
                  typeof lit.pos === 'number' && typeof lit.end === 'number'
                    ? [lit.pos as number, lit.end as number]
                    : undefined,
                tail: isTail,
                type: 'TemplateElement',
                value: {
                  cooked: (lit.text ?? lit.rawText) as string,
                  raw: (lit.rawText ?? lit.text) as string,
                },
              })
            }
          }
        }

        result.quasis = quasis
        result.expressions = expressions
      }

      continue
    }

    // Special: NoSubstitutionTemplateLiteral → single quasi with tail=true
    if (kindName === 'NoSubstitutionTemplateLiteral' && key === 'text') {
      if (!result.quasis) {
        const rawText = (raw.rawText ?? raw.text) as string
        const cookedText = (raw.text ?? raw.rawText) as string
        result.quasis = [
          {
            tail: true,
            type: 'TemplateElement',
            value: { cooked: cookedText, raw: rawText },
          },
        ]
        result.expressions = []
      }

      continue
    }

    if (val === null || val === undefined) {
      result[estreeName] = val
    } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      result[estreeName] = val
    } else if (
      key === 'operatorToken' &&
      val !== null &&
      typeof val === 'object' &&
      typeof (val as Record<string, unknown>).kind === 'number'
    ) {
      const tokenKindName = KIND_MAP[(val as Record<string, unknown>).kind as number] ?? ''
      result[estreeName] = OPERATOR_TOKEN_MAP[tokenKindName] ?? tokenKindName
    } else if (
      key === 'variableDeclaration' &&
      val !== null &&
      typeof val === 'object' &&
      typeof (val as Record<string, unknown>).kind === 'number'
    ) {
      const varDecl = val as Record<string, unknown>
      result[estreeName] =
        varDecl.name && typeof varDecl.name === 'object'
          ? convertRawCompilerNode(varDecl.name as Record<string, unknown>, depth + 1)
          : null
    } else if (
      typeof val === 'object' &&
      typeof (val as Record<string, unknown>).kind === 'number'
    ) {
      result[estreeName] = convertRawCompilerNode(val as Record<string, unknown>, depth + 1)
    } else if (Array.isArray(val)) {
      const converted: unknown[] = []
      for (const item of val) {
        if (
          item &&
          typeof item === 'object' &&
          typeof (item as Record<string, unknown>).kind === 'number'
        ) {
          // OmittedExpression (sparse array hole) → null
          const itemKind = (item as Record<string, unknown>).kind as number
          const itemKindName = KIND_MAP[itemKind] ?? ''
          if (itemKindName === 'OmittedExpression') {
            converted.push(null)
          } else {
            converted.push(convertRawCompilerNode(item as Record<string, unknown>, depth + 1))
          }
        } else {
          converted.push(item)
        }
      }

      result[estreeName] = converted
    }
  }

  // BinaryExpression with assignment operator → AssignmentExpression
  if (result.type === 'BinaryExpression' && ASSIGNMENT_OPERATORS.has(result.operator as string)) {
    result.type = 'AssignmentExpression'
  }

  // BinaryExpression with logical operator → LogicalExpression
  if (result.type === 'BinaryExpression' && LOGICAL_OPERATORS.has(result.operator as string)) {
    result.type = 'LogicalExpression'
  }

  // UnaryExpression/UpdateExpression: convert numeric operator to string
  if (typeof result.operator === 'number') {
    const tokenName = KIND_MAP[result.operator as number] ?? ''
    result.operator = (OPERATOR_TOKEN_MAP[tokenName] ?? tokenName) || String(result.operator)
  }

  // PrefixUnaryExpression: ++/-- → UpdateExpression with prefix:true
  if (kindName === 'PrefixUnaryExpression') {
    const op = result.operator as string
    if (op === '++' || op === '--') {
      result.type = 'UpdateExpression'
      result.prefix = true
    }
  }

  // PostfixUnaryExpression: always UpdateExpression with prefix:false
  if (kindName === 'PostfixUnaryExpression') {
    result.prefix = false
  }

  // VariableDeclarationList: convert flags to ESTree kind property ('var'/'let'/'const')
  if (result.type === 'VariableDeclaration') {
    let flags: number | undefined
    if (typeof raw.flags === 'number' && (raw.flags as number) & 3) {
      flags = raw.flags as number
    } else {
      const declList = raw.declarationList as Record<string, unknown> | undefined
      if (typeof declList?.flags === 'number') {
        flags = declList.flags as number
      }
    }

    if (typeof flags === 'number') {
      if (flags & 2) {
        result.kind = 'const'
      } else if (flags & 1) {
        result.kind = 'let'
      } else {
        result.kind = 'var'
      }
    }
  }

  return result
}

export function convertCompilerNode(node: Node, depth: number = 0): null | Record<string, unknown> {
  if (depth >= MAX_DEPTH) return null
  if (!node || typeof node !== 'object') return null

  let kindName: string
  try {
    kindName = node.getKindName()
  } catch {
    return null
  }

  const kindMap = KIND_SPECIFIC_MAP[kindName]

  const result: Record<string, unknown> = {
    type: KIND_NAME_ALIASES[kindName] ?? kindName,
  }

  const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
  if (
    compilerNode &&
    typeof compilerNode === 'object' &&
    typeof compilerNode.pos === 'number' &&
    typeof compilerNode.end === 'number'
  ) {
    const startPos = skipTrivia(compilerNode.pos as number)
    result.range = [startPos, compilerNode.end] as [number, number]
    result.start = startPos
    result.end = compilerNode.end
  }

  // Add literal value
  switch (kindName) {
    case 'BigIntLiteral':
    // falls through
    case 'NumericLiteral': {
      const text = node.getText()
      result.value = Number(text)
      result.raw = text

      break
    }

    case 'FalseKeyword': {
      result.value = false
      result.raw = 'false'

      break
    }

    case 'NullKeyword': {
      result.value = null
      result.raw = 'null'

      break
    }

    case 'RegularExpressionLiteral': {
      const regexText = node.getText()
      result.raw = regexText
      const regexMatch = regexText.match(/^\/(.*)\/([gimsuvy]*)$/)
      if (regexMatch) {
        result.regex = { flags: regexMatch[2], pattern: regexMatch[1] }
      }

      break
    }

    case 'StringLiteral': {
      const text = node.getText()
      result.value = text.slice(1, -1) // Remove quotes
      result.raw = text

      break
    }

    case 'TrueKeyword': {
      result.value = true
      result.raw = 'true'

      break
    }
    // No default
  }

  // Iterate compiler node children using raw compiler node
  // (ts-morph getter methods like getExpression() fail on detached nodes)
  try {
    const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
    if (compilerNode && typeof compilerNode === 'object') {
      for (const [key, val] of Object.entries(compilerNode)) {
        if (key.startsWith('_')) continue
        if (SKIP_KEYS.has(key)) continue

        const estreeName = kindMap?.[key] ?? PROPERTY_MAP[key] ?? key

        // Special: caseBlock -> extract clauses array as ESTree cases
        if (key === 'caseBlock' && val && typeof val === 'object') {
          const cb = val as Record<string, unknown>
          if (Array.isArray(cb.clauses)) {
            const converted: unknown[] = []
            for (const clause of cb.clauses) {
              if (
                clause &&
                typeof clause === 'object' &&
                typeof (clause as Record<string, unknown>).kind === 'number'
              ) {
                converted.push(convertRawCompilerNode(clause as Record<string, unknown>, depth + 1))
              }
            }

            result[estreeName] = converted
          }

          continue
        }

        if (val === null || val === undefined) {
          result[estreeName] = val
        } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
          result[estreeName] = val
        } else if (
          key === 'operatorToken' &&
          val !== null &&
          typeof val === 'object' &&
          typeof (val as Record<string, unknown>).kind === 'number'
        ) {
          const tokenKindName = KIND_MAP[(val as Record<string, unknown>).kind as number] ?? ''
          result[estreeName] = OPERATOR_TOKEN_MAP[tokenKindName] ?? tokenKindName
        } else if (
          key === 'variableDeclaration' &&
          val !== null &&
          typeof val === 'object' &&
          typeof (val as Record<string, unknown>).kind === 'number'
        ) {
          const varDecl = val as Record<string, unknown>
          result[estreeName] =
            varDecl.name && typeof varDecl.name === 'object'
              ? convertRawCompilerNode(varDecl.name as Record<string, unknown>, depth + 1)
              : null
        } else if (
          typeof val === 'object' &&
          typeof (val as Record<string, unknown>).kind === 'number'
        ) {
          result[estreeName] = convertRawCompilerNode(val as Record<string, unknown>, depth + 1)
        } else if (Array.isArray(val)) {
          const converted: unknown[] = []
          for (const item of val) {
            if (
              item &&
              typeof item === 'object' &&
              typeof (item as Record<string, unknown>).kind === 'number'
            ) {
              const itemKindName = KIND_MAP[(item as Record<string, unknown>).kind as number] ?? ''
              if (itemKindName === 'OmittedExpression') {
                converted.push(null)
              } else {
                converted.push(convertRawCompilerNode(item as Record<string, unknown>, depth + 1))
              }
            } else {
              converted.push(item)
            }
          }

          result[estreeName] = converted
        }
      }
    }
  } catch {}

  if (result.type === 'BinaryExpression' && ASSIGNMENT_OPERATORS.has(result.operator as string)) {
    result.type = 'AssignmentExpression'
  }

  if (result.type === 'BinaryExpression' && LOGICAL_OPERATORS.has(result.operator as string)) {
    result.type = 'LogicalExpression'
  }

  if (typeof result.operator === 'number') {
    const tokenName = KIND_MAP[result.operator as number] ?? ''
    result.operator = (OPERATOR_TOKEN_MAP[tokenName] ?? tokenName) || String(result.operator)
  }

  // PrefixUnaryExpression: ++/-- → UpdateExpression with prefix:true
  if (kindName === 'PrefixUnaryExpression') {
    const op = result.operator as string
    if (op === '++' || op === '--') {
      result.type = 'UpdateExpression'
      result.prefix = true
    }
  }

  // PostfixUnaryExpression: always UpdateExpression with prefix:false
  if (kindName === 'PostfixUnaryExpression') {
    result.prefix = false
  }

  if (result.type === 'VariableDeclaration') {
    const rawFlags = compilerNode?.flags
    if (typeof rawFlags === 'number' && rawFlags & 3) {
      // NodeFlags.Const = 2, NodeFlags.Let = 1
      result.kind = rawFlags & 2 ? 'const' : 'let'
    } else {
      const declList = compilerNode?.declarationList as Record<string, unknown> | undefined
      const listFlags = declList?.flags
      if (typeof listFlags === 'number') {
        if (listFlags & 2) {
          result.kind = 'const'
        } else if (listFlags & 1) {
          result.kind = 'let'
        } else {
          result.kind = 'var'
        }
      }
    }
  }

  return result
}
