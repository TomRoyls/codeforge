import { Node } from 'ts-morph'

import {
  ACCESSIBILITY_MAP,
  ASSIGNMENT_OPERATORS,
  KIND_MAP,
  KIND_NAME_ALIASES,
  KIND_SPECIFIC_MAP,
  LOGICAL_OPERATORS,
  MAX_DEPTH,
  MODIFIER_MAP,
  OPERATOR_TOKEN_MAP,
  PROPERTY_MAP,
  SKIP_KEYS,
} from './adapter-constants.js'

// Module-level source text for trivia skipping in convertRawCompilerNode
let _rangeSourceText = ''

export function setRangeSourceText(text: string): void {
  _rangeSourceText = text
}

export function skipTrivia(pos: number): number {
  const text = _rangeSourceText
  if (!text) return pos
  const len = text.length
  let i = pos
  while (i < len) {
    // eslint-disable-next-line unicorn/prefer-code-point -- charCodeAt is correct and faster for ASCII-only comparisons
    const ch = text.charCodeAt(i)
    if (ch === 0x20 || ch === 0x09 || ch === 0x0a || ch === 0x0d) {
      i++
      continue
    }

    if (ch === 0x2f && i + 1 < len) {
      // eslint-disable-next-line unicorn/prefer-code-point -- charCodeAt is correct and faster for ASCII-only comparisons
      const next = text.charCodeAt(i + 1)
      if (next === 0x2f) {
        // eslint-disable-next-line unicorn/prefer-code-point -- charCodeAt is correct and faster for ASCII-only comparisons
        while (i < len && text.charCodeAt(i) !== 0x0a) i++
        continue
      }

      if (next === 0x2a) {
        i += 2
        // eslint-disable-next-line unicorn/prefer-code-point -- charCodeAt is correct and faster for ASCII-only comparisons
        while (i + 1 < len && !(text.charCodeAt(i) === 0x2a && text.charCodeAt(i + 1) === 0x2f))
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

  applyRawLiteralValues(result, kindName, raw)

  for (const [key, val] of Object.entries(raw)) {
    if (key.startsWith('_')) continue

    if (key === 'modifiers' && Array.isArray(val)) {
      for (const mod of val) {
        if (mod && typeof mod === 'object') {
          const modKind = (mod as Record<string, unknown>).kind as number | undefined
          const modName = modKind !== undefined ? KIND_MAP[modKind] : undefined
          if (!modName) continue
          const boolProp = MODIFIER_MAP[modName]
          if (boolProp) { result[boolProp] = true; continue }
          const access = ACCESSIBILITY_MAP[modName]
          if (access) { result.accessibility = access; continue }
        }
      }
      continue
    }

    if (key === 'awaitModifier' && val && typeof val === 'object') {
      result.await = true
      continue
    }

    if (key === 'asteriskToken' && val && typeof val === 'object') {
      result.generator = true
      continue
    }

    if (SKIP_KEYS.has(key)) continue

    const estreeName = kindMap?.[key] ?? PROPERTY_MAP[key] ?? key

    if (key === 'caseBlock') {
      const converted = convertCaseClauses(val, depth)
      if (converted !== undefined) {
        result[estreeName] = converted
      }

      continue
    }

    if (kindName === 'VariableStatement' && key === 'declarationList') {
      const declList = val as Record<string, unknown>
      if (declList && Array.isArray(declList.declarations)) {
        result.declarations = declList.declarations.map(
          (d: unknown) =>
            d && typeof d === 'object' && typeof (d as Record<string, unknown>).kind === 'number'
              ? convertRawCompilerNode(d as Record<string, unknown>, depth)
              : d,
        )
      }

      continue
    }

    if (kindName === 'ImportDeclaration' && key === 'importClause') {
      const clause = val as Record<string, unknown> | null
      if (!clause) continue
      const specs: unknown[] = []
      if (clause.name && typeof clause.name === 'object') {
        const nameNode = clause.name as Record<string, unknown>
        specs.push({
          local: convertRawCompilerNode(nameNode, depth) ?? nameNode,
          type: 'ImportDefaultSpecifier',
        })
      }
      if (clause.namedBindings && typeof clause.namedBindings === 'object') {
        const bindings = clause.namedBindings as Record<string, unknown>
        const bindingKind = bindings.kind as number | undefined
        const bindingKindName = bindingKind !== undefined ? KIND_MAP[bindingKind] : undefined
        if (bindingKindName === 'NamespaceImport' && bindings.name) {
          const nsName = bindings.name as Record<string, unknown>
          specs.push({
            local: convertRawCompilerNode(nsName, depth) ?? nsName,
            type: 'ImportNamespaceSpecifier',
          })
        } else if (Array.isArray(bindings.elements)) {
          for (const el of bindings.elements) {
            if (el && typeof el === 'object') {
              const elNode = el as Record<string, unknown>
              const converted = convertRawCompilerNode(elNode, depth)
              specs.push(converted ?? elNode)
            }
          }
        }
      }
      result.specifiers = specs
      continue
    }

    if (kindName === 'ExportDeclaration' && key === 'exportClause') {
      const clause = val as Record<string, unknown> | null
      if (!clause) {
        // export * from 'mod' — no exportClause, will be detected as ExportAllDeclaration
        continue
      }
      if (Array.isArray(clause.elements)) {
        result.specifiers = clause.elements.map(
          (el: unknown) =>
            el && typeof el === 'object' && typeof (el as Record<string, unknown>).kind === 'number'
              ? convertRawCompilerNode(el as Record<string, unknown>, depth)
              : el,
        )
      }
      continue
    }

    if (
      (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') &&
      key === 'members' &&
      Array.isArray(val)
    ) {
      result.body = {
        body: val.map(
          (m: unknown) =>
            m && typeof m === 'object' && typeof (m as Record<string, unknown>).kind === 'number'
              ? convertRawCompilerNode(m as Record<string, unknown>, depth)
              : m,
        ),
        type: 'ClassBody',
      }

      continue
    }

    // Synthesize TSInterfaceBody wrapper for InterfaceDeclaration members.
    // ESTree typescript-eslint wraps interface members in TSInterfaceBody { body: [...] }.
    if (kindName === 'InterfaceDeclaration' && key === 'members' && Array.isArray(val)) {
      result.body = {
        body: val.map(
          (m: unknown) =>
            m && typeof m === 'object' && typeof (m as Record<string, unknown>).kind === 'number'
              ? convertRawCompilerNode(m as Record<string, unknown>, depth)
              : m,
        ),
        type: 'TSInterfaceBody',
      }

      continue
    }

    if (kindName === 'TemplateExpression' && (key === 'head' || key === 'templateSpans')) {
      synthesizeTemplateExpression(result, raw, depth)

      continue
    }

    if (kindName === 'NoSubstitutionTemplateLiteral' && key === 'text') {
      synthesizeNoSubstitutionTemplate(result, raw)

      continue
    }

    assignRawProperty(result, key, val, estreeName, depth)
  }

  applyRawPostFixups(result, kindName, raw)

  return result
}

function applyRawLiteralValues(
  result: Record<string, unknown>,
  kindName: string,
  raw: Record<string, unknown>,
): void {
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
  } else {
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
  }
}

function synthesizeTemplateExpression(
  result: Record<string, unknown>,
  raw: Record<string, unknown>,
  depth: number,
): void {
  if (result.quasis || result.expressions) return

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

function synthesizeNoSubstitutionTemplate(
  result: Record<string, unknown>,
  raw: Record<string, unknown>,
): void {
  if (result.quasis) return

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

function assignRawProperty(
  result: Record<string, unknown>,
  key: string,
  val: unknown,
  estreeName: string,
  depth: number,
): void {
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
  } else if (typeof val === 'object' && typeof (val as Record<string, unknown>).kind === 'number') {
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

function applyRawPostFixups(
  result: Record<string, unknown>,
  kindName: string,
  raw: Record<string, unknown>,
): void {
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

  if (raw.questionDotToken !== undefined && raw.questionDotToken !== null) {
    result.optional = true
    delete result.questionDotToken
    if (result.type === 'MemberExpression') result.type = 'OptionalMemberExpression'
    if (result.type === 'CallExpression') result.type = 'OptionalCallExpression'
  }

  if (result.type === 'Parameter') {
    const savedTypeAnnotation = result.typeAnnotation
    const hasRest = result.dotDotDotToken !== null && result.dotDotDotToken !== undefined
    const hasInit = result.init !== null && result.init !== undefined
    const nameNode = result.name as Record<string, unknown> | undefined

    if (hasRest) {
      result.type = 'RestElement'
      result.argument = result.name
      delete result.name
      delete result.init
      delete result.dotDotDotToken
      delete result.questionToken
      delete result.modifiers
    } else if (hasInit) {
      result.type = 'AssignmentPattern'
      result.left = result.name
      result.right = result.init
      delete result.name
      delete result.init
      delete result.dotDotDotToken
      delete result.questionToken
      delete result.modifiers
    } else if (nameNode && typeof nameNode === 'object') {
      const savedRange = { end: result.end, loc: result.loc, range: result.range, start: result.start }
      for (const key of Object.keys(result)) {
        delete result[key]
      }
      Object.assign(result, nameNode)
      if (savedTypeAnnotation !== undefined && savedTypeAnnotation !== null) {
        result.typeAnnotation = savedTypeAnnotation
      }
      if (nameNode.range === null || nameNode.range === undefined) {
        result.end = savedRange.end
        result.loc = savedRange.loc
        result.range = savedRange.range
        result.start = savedRange.start
      }
    }
  }

  if (result.type === 'MethodDefinition' && !result.kind) {
    if (kindName === 'Constructor') result.kind = 'constructor'
    else if (kindName === 'GetAccessor') result.kind = 'get'
    else if (kindName === 'SetAccessor') result.kind = 'set'
    else result.kind = 'method'
  }

  if (kindName === 'ShorthandPropertyAssignment' && result.type === 'Property') {
    if (!result.shorthand) result.shorthand = true
    if (!result.value && result.key) result.value = { ...result.key }
    if (!result.computed) result.computed = false
  }

  if (kindName === 'PropertyAssignment' && result.type === 'Property') {
    if (!result.computed) result.computed = false
  }

  if (
    (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') &&
    !result.superClass
  ) {
    const heritageClauses = raw.heritageClauses as unknown[]
    if (Array.isArray(heritageClauses)) {
      for (const clause of heritageClauses) {
        if (
          clause &&
          typeof clause === 'object' &&
          (clause as Record<string, unknown>).token === 96
        ) {
          const types = (clause as Record<string, unknown>).types as unknown[]
          if (Array.isArray(types) && types.length > 0) {
            const firstType = types[0] as Record<string, unknown>
            if (firstType && typeof firstType.expression === 'object') {
              result.superClass = convertRawCompilerNode(
                firstType.expression as Record<string, unknown>,
                0,
              )
            }
          }
          break
        }
      }
    }
  }

  // Wrap returnType in TSTypeAnnotation if not already wrapped
  // ESTree typescript-eslint: returnType = { type: 'TSTypeAnnotation', typeAnnotation: <type node> }
  const rt = result.returnType as Record<string, unknown> | undefined
  if (rt && typeof rt === 'object' && rt.type !== 'TSTypeAnnotation') {
    result.returnType = { type: 'TSTypeAnnotation', typeAnnotation: rt }
  }

  const ta = result.typeAnnotation as Record<string, unknown> | undefined
  if (ta && typeof ta === 'object' && ta.type !== 'TSTypeAnnotation') {
    result.typeAnnotation = { type: 'TSTypeAnnotation', typeAnnotation: ta }
  }

  // ESTree typescript-eslint: typeAnnotation lives on Identifier, not VariableDeclarator
  if (result.type === 'VariableDeclarator' && result.typeAnnotation !== undefined) {
    const id = result.id as Record<string, unknown> | undefined
    if (id && id.typeAnnotation === undefined) {
      id.typeAnnotation = result.typeAnnotation
      delete result.typeAnnotation
    }
  }

  // MethodDefinition: synthesize .value FunctionExpression with params/body
  // ESTree: methodDefinition.value = { type: 'FunctionExpression', params, body, ... }
  if (result.type === 'MethodDefinition' && !result.value) {
    const value: Record<string, unknown> = {
      async: result.async === true,
      body: result.body ?? { body: [], type: 'BlockStatement' },
      generator: result.generator === true,
      id: null,
      loc: result.loc,
      params: result.params ?? [],
      range: result.range,
      type: 'FunctionExpression',
    }
    if (result.returnType !== undefined) value.returnType = result.returnType
    result.value = value
    delete result.body
    delete result.params
    delete result.returnType
  }

  if (result.type === 'ExportNamedDeclaration' && result.specifiers === undefined && result.source !== undefined) {
    result.type = 'ExportAllDeclaration'
  }
}

function applyLiteralValue(result: Record<string, unknown>, kindName: string, node: Node): void {
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
}

function convertCaseClauses(val: unknown, depth: number): undefined | unknown[] {
  if (!val || typeof val !== 'object') return undefined
  const cb = val as Record<string, unknown>
  if (!Array.isArray(cb.clauses)) return undefined
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

  return converted
}

function convertCompilerArrayItem(item: unknown, depth: number): unknown {
  if (
    item &&
    typeof item === 'object' &&
    typeof (item as Record<string, unknown>).kind === 'number'
  ) {
    const itemKindName = KIND_MAP[(item as Record<string, unknown>).kind as number] ?? ''
    if (itemKindName === 'OmittedExpression') {
      return null
    }

    return convertRawCompilerNode(item as Record<string, unknown>, depth + 1)
  }

  return item
}

function assignCompilerProperty(
  result: Record<string, unknown>,
  key: string,
  val: unknown,
  estreeName: string,
  depth: number,
): void {
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
  } else if (typeof val === 'object' && typeof (val as Record<string, unknown>).kind === 'number') {
    result[estreeName] = convertRawCompilerNode(val as Record<string, unknown>, depth + 1)
  } else if (Array.isArray(val)) {
    result[estreeName] = val.map((item) => convertCompilerArrayItem(item, depth))
  }
}

function applyPostConvertFixups(
  result: Record<string, unknown>,
  kindName: string,
  compilerNode: Record<string, unknown> | undefined,
): void {
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

  if (compilerNode?.questionDotToken !== undefined && compilerNode?.questionDotToken !== null) {
    result.optional = true
    delete result.questionDotToken
    if (result.type === 'MemberExpression') result.type = 'OptionalMemberExpression'
    if (result.type === 'CallExpression') result.type = 'OptionalCallExpression'
  }

  if (result.type === 'MethodDefinition' && !result.kind) {
    if (kindName === 'Constructor') result.kind = 'constructor'
    else if (kindName === 'GetAccessor') result.kind = 'get'
    else if (kindName === 'SetAccessor') result.kind = 'set'
    else result.kind = 'method'
  }

  if (
    (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') &&
    !result.superClass
  ) {
    const heritageClauses = compilerNode?.heritageClauses as unknown[]
    if (Array.isArray(heritageClauses)) {
      for (const clause of heritageClauses) {
        if (
          clause &&
          typeof clause === 'object' &&
          (clause as Record<string, unknown>).token === 96
        ) {
          const types = (clause as Record<string, unknown>).types as unknown[]
          if (Array.isArray(types) && types.length > 0) {
            const firstType = types[0] as Record<string, unknown>
            if (firstType && typeof firstType.expression === 'object') {
              result.superClass = convertRawCompilerNode(
                firstType.expression as Record<string, unknown>,
                0,
              )
            }
          }
          break
        }
      }
    }
  }

  // Wrap returnType in TSTypeAnnotation if not already wrapped
  // ESTree typescript-eslint: returnType = { type: 'TSTypeAnnotation', typeAnnotation: <type node> }
  const rt = result.returnType as Record<string, unknown> | undefined
  if (rt && typeof rt === 'object' && rt.type !== 'TSTypeAnnotation') {
    result.returnType = { type: 'TSTypeAnnotation', typeAnnotation: rt }
  }

  const ta = result.typeAnnotation as Record<string, unknown> | undefined
  if (ta && typeof ta === 'object' && ta.type !== 'TSTypeAnnotation') {
    result.typeAnnotation = { type: 'TSTypeAnnotation', typeAnnotation: ta }
  }

  // ESTree typescript-eslint: typeAnnotation lives on Identifier, not VariableDeclarator
  if (result.type === 'VariableDeclarator' && result.typeAnnotation !== undefined) {
    const id = result.id as Record<string, unknown> | undefined
    if (id && id.typeAnnotation === undefined) {
      id.typeAnnotation = result.typeAnnotation
      delete result.typeAnnotation
    }
  }

  // MethodDefinition: synthesize .value FunctionExpression with params/body
  // ESTree: methodDefinition.value = { type: 'FunctionExpression', params, body, ... }
  if (result.type === 'MethodDefinition' && !result.value) {
    const value: Record<string, unknown> = {
      async: result.async === true,
      body: result.body ?? { body: [], type: 'BlockStatement' },
      generator: result.generator === true,
      id: null,
      loc: result.loc,
      params: result.params ?? [],
      range: result.range,
      type: 'FunctionExpression',
    }
    if (result.returnType !== undefined) value.returnType = result.returnType
    result.value = value
    delete result.body
    delete result.params
    delete result.returnType
  }

  if (result.type === 'ExportNamedDeclaration' && result.specifiers === undefined && result.source !== undefined) {
    result.type = 'ExportAllDeclaration'
  }
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

  applyLiteralValue(result, kindName, node)

  // Iterate compiler node children using raw compiler node
  // (ts-morph getter methods like getExpression() fail on detached nodes)
  try {
    const { compilerNode } = node as unknown as { compilerNode: Record<string, unknown> }
    if (compilerNode && typeof compilerNode === 'object') {
      for (const [key, val] of Object.entries(compilerNode)) {
        if (key.startsWith('_')) continue

        if (key === 'modifiers' && Array.isArray(val)) {
          for (const mod of val) {
            if (mod && typeof mod === 'object') {
              const modKind = (mod as Record<string, unknown>).kind as number | undefined
              const modName = modKind !== undefined ? KIND_MAP[modKind] : undefined
              if (!modName) continue
              const boolProp = MODIFIER_MAP[modName]
              if (boolProp) { result[boolProp] = true; continue }
              const access = ACCESSIBILITY_MAP[modName]
              if (access) { result.accessibility = access; continue }
            }
          }
          continue
        }

        if (key === 'awaitModifier' && val && typeof val === 'object') {
          result.await = true
          continue
        }

        if (key === 'asteriskToken' && val && typeof val === 'object') {
          result.generator = true
          continue
        }

        if (SKIP_KEYS.has(key)) continue

        const estreeName = kindMap?.[key] ?? PROPERTY_MAP[key] ?? key

        // Special: caseBlock -> extract clauses array as ESTree cases
        if (key === 'caseBlock') {
          const converted = convertCaseClauses(val, depth)
          if (converted !== undefined) {
            result[estreeName] = converted
          }

          continue
        }

        if (kindName === 'VariableStatement' && key === 'declarationList') {
          const declList = val as Record<string, unknown>
          if (declList && Array.isArray(declList.declarations)) {
            result.declarations = declList.declarations.map(
              (d: unknown) =>
                d && typeof d === 'object' && typeof (d as Record<string, unknown>).kind === 'number'
                  ? convertRawCompilerNode(d as Record<string, unknown>, depth)
                  : d,
            )
          }

          continue
        }

        if (kindName === 'ImportDeclaration' && key === 'importClause') {
          const clause = val as Record<string, unknown> | null
          if (!clause) continue
          const specs: unknown[] = []
          if (clause.name && typeof clause.name === 'object') {
            const nameNode = clause.name as Record<string, unknown>
            specs.push({
              local: convertRawCompilerNode(nameNode, depth) ?? nameNode,
              type: 'ImportDefaultSpecifier',
            })
          }
          if (clause.namedBindings && typeof clause.namedBindings === 'object') {
            const bindings = clause.namedBindings as Record<string, unknown>
            const bindingKind = bindings.kind as number | undefined
            const bindingKindName = bindingKind !== undefined ? KIND_MAP[bindingKind] : undefined
            if (bindingKindName === 'NamespaceImport' && bindings.name) {
              const nsName = bindings.name as Record<string, unknown>
              specs.push({
                local: convertRawCompilerNode(nsName, depth) ?? nsName,
                type: 'ImportNamespaceSpecifier',
              })
            } else if (Array.isArray(bindings.elements)) {
              for (const el of bindings.elements) {
                if (el && typeof el === 'object') {
                  const elNode = el as Record<string, unknown>
                  const converted = convertRawCompilerNode(elNode, depth)
                  specs.push(converted ?? elNode)
                }
              }
            }
          }
          result.specifiers = specs
          continue
        }

        if (kindName === 'ExportDeclaration' && key === 'exportClause') {
          const clause = val as Record<string, unknown> | null
          if (!clause) continue
          if (Array.isArray(clause.elements)) {
            result.specifiers = clause.elements.map(
              (el: unknown) =>
                el && typeof el === 'object' && typeof (el as Record<string, unknown>).kind === 'number'
                  ? convertRawCompilerNode(el as Record<string, unknown>, depth)
                  : el,
            )
          }
          continue
        }

        if (
          (kindName === 'ClassDeclaration' || kindName === 'ClassExpression') &&
          key === 'members' &&
          Array.isArray(val)
        ) {
          result.body = {
            body: val.map(
              (m: unknown) =>
                m && typeof m === 'object' && typeof (m as Record<string, unknown>).kind === 'number'
                  ? convertRawCompilerNode(m as Record<string, unknown>, depth)
                  : m,
            ),
            type: 'ClassBody',
          }

          continue
        }

        // InterfaceDeclaration: wrap members in TSInterfaceBody
        // ESTree typescript-eslint: iface.body = { type: 'TSInterfaceBody', body: [...members] }
        if (kindName === 'InterfaceDeclaration' && key === 'members' && Array.isArray(val)) {
          result.body = {
            body: val.map(
              (m: unknown) =>
                m && typeof m === 'object' && typeof (m as Record<string, unknown>).kind === 'number'
                  ? convertRawCompilerNode(m as Record<string, unknown>, depth)
                  : m,
            ),
            type: 'TSInterfaceBody',
          }

          continue
        }

        assignCompilerProperty(result, key, val, estreeName, depth)
      }
    }
  } catch {
    // Some compiler properties may not be accessible on all node types
  }

  // Synthesize TemplateLiteral quasis/expressions from head/templateSpans
  if (kindName === 'TemplateExpression' && compilerNode) {
    synthesizeTemplateExpression(result, compilerNode, depth)
  } else if (kindName === 'NoSubstitutionTemplateLiteral' && compilerNode) {
    synthesizeNoSubstitutionTemplate(result, compilerNode)
  }

  applyPostConvertFixups(result, kindName, compilerNode)

  return result
}
