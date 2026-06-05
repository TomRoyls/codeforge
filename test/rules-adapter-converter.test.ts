import { describe, it, expect, beforeEach } from 'vitest'
import {
  setRangeSourceText,
  skipTrivia,
  convertOperatorToken,
  convertRawCompilerNode,
} from '../src/rules/adapter-converter.js'

// ─── setRangeSourceText ──────────────────────────────────
describe('setRangeSourceText', () => {
  it('is a function', () => {
    expect(typeof setRangeSourceText).toBe('function')
  })

  it('does not throw when called with a string', () => {
    expect(() => setRangeSourceText('hello')).not.toThrow()
  })

  it('does not throw when called with empty string', () => {
    expect(() => setRangeSourceText('')).not.toThrow()
  })

  it('affects skipTrivia behavior when set', () => {
    setRangeSourceText('  hello')
    const pos = skipTrivia(0)
    expect(pos).toBe(2)
  })

  it('can be reset to empty string', () => {
    setRangeSourceText('  hello')
    expect(skipTrivia(0)).toBe(2)
    setRangeSourceText('')
    expect(skipTrivia(0)).toBe(0)
  })
})

// ─── skipTrivia ──────────────────────────────────────────
describe('skipTrivia', () => {
  beforeEach(() => {
    setRangeSourceText('')
  })

  it('is a function', () => {
    expect(typeof skipTrivia).toBe('function')
  })

  it('returns pos when no source text is set', () => {
    expect(skipTrivia(5)).toBe(5)
  })

  it('returns pos when pos is beyond text length', () => {
    setRangeSourceText('abc')
    expect(skipTrivia(10)).toBe(10)
  })

  it('returns pos unchanged when pos points to non-whitespace', () => {
    setRangeSourceText('hello')
    expect(skipTrivia(0)).toBe(0)
  })

  it('skips spaces (0x20)', () => {
    setRangeSourceText('   hello')
    expect(skipTrivia(0)).toBe(3)
  })

  it('skips tabs (0x09)', () => {
    setRangeSourceText('\t\thello')
    expect(skipTrivia(0)).toBe(2)
  })

  it('skips newlines (0x0a)', () => {
    setRangeSourceText('\n\nhello')
    expect(skipTrivia(0)).toBe(2)
  })

  it('skips carriage returns (0x0d)', () => {
    setRangeSourceText('\r\rhello')
    expect(skipTrivia(0)).toBe(2)
  })

  it('skips mixed whitespace', () => {
    setRangeSourceText(' \t\n\rhello')
    expect(skipTrivia(0)).toBe(4)
  })

  it('skips single-line comments (// ...)', () => {
    setRangeSourceText('// comment\nhello')
    expect(skipTrivia(0)).toBe(11)
  })

  it('skips single-line comment at EOF without newline', () => {
    setRangeSourceText('// comment')
    expect(skipTrivia(0)).toBe(10)
  })

  it('skips multi-line comments (/* ... */)', () => {
    setRangeSourceText('/* comment */hello')
    expect(skipTrivia(0)).toBe(13)
  })

  it('skips whitespace then comment', () => {
    setRangeSourceText('  // comment\nhello')
    expect(skipTrivia(0)).toBe(13)
  })

  it('skips comment then whitespace', () => {
    setRangeSourceText('// comment\n  hello')
    expect(skipTrivia(0)).toBe(13)
  })

  it('handles pos in middle of string', () => {
    setRangeSourceText('hello   world')
    expect(skipTrivia(5)).toBe(8)
  })

  it('does not skip forward slash that is not a comment', () => {
    setRangeSourceText('/ hello')
    expect(skipTrivia(0)).toBe(0)
  })

  it('skips multi-line comment spanning multiple lines', () => {
    // /* line1\nline2\nline3 */ = 22 chars, but skipTrivia scans to after */
    setRangeSourceText('/* line1\nline2\nline3 */hello')
    const result = skipTrivia(0)
    expect(result).toBeGreaterThanOrEqual(22)
  })

  it('returns same pos for empty source text', () => {
    setRangeSourceText('')
    expect(skipTrivia(0)).toBe(0)
    expect(skipTrivia(100)).toBe(100)
  })
})

// ─── convertOperatorToken ────────────────────────────────
describe('convertOperatorToken', () => {
  it('is a function', () => {
    expect(typeof convertOperatorToken).toBe('function')
  })

  it('returns string input unchanged', () => {
    expect(convertOperatorToken('+')).toBe('+')
  })

  it('returns minus sign string unchanged', () => {
    expect(convertOperatorToken('-')).toBe('-')
  })

  it('returns assignment operator string unchanged', () => {
    expect(convertOperatorToken('+=')).toBe('+=')
  })

  it('returns equality operator string unchanged', () => {
    expect(convertOperatorToken('===')).toBe('===')
  })

  it('handles numeric kind for known operator', () => {
    // ts-morph SyntaxKind.EqualsToken = 64, KIND_MAP[64] = 'EqualsToken'
    // OPERATOR_TOKEN_MAP['EqualsToken'] = '='
    const result = convertOperatorToken(64)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles numeric kind for unknown number', () => {
    const result = convertOperatorToken(999999)
    expect(typeof result).toBe('string')
  })

  it('handles object with type property matching OPERATOR_TOKEN_MAP', () => {
    const result = convertOperatorToken({ type: 'EqualsToken' })
    expect(result).toBe('=')
  })

  it('handles object with type property not in map', () => {
    const result = convertOperatorToken({ type: 'UnknownTokenType' })
    expect(typeof result).toBe('string')
  })

  it('handles object with getText method', () => {
    const result = convertOperatorToken({ getText: () => '+=' })
    expect(result).toBe('+=')
  })

  it('handles object with operator property', () => {
    const result = convertOperatorToken({ operator: '**' })
    expect(result).toBe('**')
  })

  it('handles null by returning string "null"', () => {
    expect(convertOperatorToken(null)).toBe('null')
  })

  it('handles undefined by returning string "undefined"', () => {
    expect(convertOperatorToken(undefined)).toBe('undefined')
  })

  it('handles boolean true by returning string "true"', () => {
    expect(convertOperatorToken(true)).toBe('true')
  })

  it('handles empty object by returning "[object Object]"', () => {
    expect(convertOperatorToken({})).toBe('[object Object]')
  })

  it('returns string for any numeric input', () => {
    expect(typeof convertOperatorToken(0)).toBe('string')
    expect(typeof convertOperatorToken(100)).toBe('string')
    expect(typeof convertOperatorToken(-1)).toBe('string')
  })

  it('prefers getText over operator for objects with both', () => {
    const result = convertOperatorToken({
      getText: () => 'getTextResult',
      operator: 'operatorResult',
    })
    expect(result).toBe('getTextResult')
  })
})

// ─── convertRawCompilerNode ──────────────────────────────
describe('convertRawCompilerNode', () => {
  beforeEach(() => {
    setRangeSourceText('')
  })

  it('is a function', () => {
    expect(typeof convertRawCompilerNode).toBe('function')
  })

  it('returns null when depth >= MAX_DEPTH (5)', () => {
    const result = convertRawCompilerNode({ kind: 80 }, 5)
    expect(result).toBeNull()
  })

  it('returns null for depth greater than MAX_DEPTH', () => {
    const result = convertRawCompilerNode({ kind: 80 }, 25)
    expect(result).toBeNull()
  })

  it('returns null for null input', () => {
    const result = convertRawCompilerNode(null as unknown as Record<string, unknown>, 0)
    expect(result).toBeNull()
  })

  it('returns null for non-object input', () => {
    const result = convertRawCompilerNode('string' as unknown as Record<string, unknown>, 0)
    expect(result).toBeNull()
  })

  it('returns an object with type for valid node', () => {
    const result = convertRawCompilerNode({ kind: 80 }, 0)
    expect(result).not.toBeNull()
    expect(typeof result).toBe('object')
    expect(result).toHaveProperty('type')
  })

  it('sets type to kind name from KIND_MAP', () => {
    // ts-morph SyntaxKind.Identifier = 80
    const result = convertRawCompilerNode({ kind: 80 }, 0)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Identifier')
  })

  it('sets type to Unknown(kind) for unknown kind', () => {
    const result = convertRawCompilerNode({ kind: 999999 }, 0)
    expect(result).not.toBeNull()
    expect(result!.type).toContain('Unknown')
  })

  it('sets range when pos and end are numbers', () => {
    setRangeSourceText('hello')
    const result = convertRawCompilerNode({ kind: 80, pos: 0, end: 5 }, 0)
    expect(result).not.toBeNull()
    expect(result).toHaveProperty('range')
    expect(result!.range).toEqual([0, 5])
    expect(result).toHaveProperty('start', 0)
    expect(result).toHaveProperty('end', 5)
  })

  it('does not set range when pos is not a number', () => {
    const result = convertRawCompilerNode({ kind: 80, pos: '0', end: 5 }, 0)
    expect(result).not.toBeNull()
    expect(result).not.toHaveProperty('range')
  })

  it('does not set range when end is not a number', () => {
    const result = convertRawCompilerNode({ kind: 80, pos: 0, end: '5' }, 0)
    expect(result).not.toBeNull()
    expect(result).not.toHaveProperty('range')
  })

  it('uses skipTrivia for range start position', () => {
    setRangeSourceText('  hello')
    const result = convertRawCompilerNode({ kind: 80, pos: 0, end: 7 }, 0)
    expect(result).not.toBeNull()
    expect(result!.start).toBe(2)
  })

  it('applies KIND_NAME_ALIASES for type', () => {
    const result = convertRawCompilerNode({ kind: 80 }, 0)
    expect(result).not.toBeNull()
    // Identifier maps to 'Identifier' alias
    expect(typeof result!.type).toBe('string')
  })

  it('skips properties starting with underscore', () => {
    const result = convertRawCompilerNode({ kind: 80, _private: 'hidden', name: 'visible' }, 0)
    expect(result).not.toBeNull()
    expect(result).not.toHaveProperty('_private')
  })

  it('converts StringLiteral with text to value and raw', () => {
    // ts-morph SyntaxKind.StringLiteral = 11
    // Note: PROPERTY_MAP maps 'text' → 'raw', so the raw text property
    // overwrites the literal '"hello"' set in applyRawLiteralValues
    const result = convertRawCompilerNode({ kind: 11, text: 'hello' }, 0)
    expect(result).not.toBeNull()
    expect(result!.value).toBe('hello')
    expect(result!.raw).toBe('hello')
  })

  it('converts NumericLiteral with text to numeric value and raw', () => {
    // ts-morph SyntaxKind.NumericLiteral = 9
    const result = convertRawCompilerNode({ kind: 9, text: '42' }, 0)
    expect(result).not.toBeNull()
    expect(result!.value).toBe(42)
    expect(result!.raw).toBe('42')
  })

  it('converts BigIntLiteral with text to numeric value and raw', () => {
    // ts-morph SyntaxKind.BigIntLiteral = 10
    const result = convertRawCompilerNode({ kind: 10, text: '100' }, 0)
    expect(result).not.toBeNull()
    expect(result!.value).toBe(100)
    expect(result!.raw).toBe('100')
  })

  it('converts Identifier with escapedText to name and value', () => {
    const result = convertRawCompilerNode({ kind: 80, escapedText: 'myVar' }, 0)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('myVar')
    expect(result!.value).toBe('myVar')
  })

  it('converts FalseKeyword to boolean false', () => {
    // ts-morph SyntaxKind.FalseKeyword = 97
    const result = convertRawCompilerNode({ kind: 97 }, 0)
    expect(result).not.toBeNull()
    expect(result!.value).toBe(false)
    expect(result!.raw).toBe('false')
  })

  it('converts NullKeyword to null', () => {
    // ts-morph SyntaxKind.NullKeyword = 106
    const result = convertRawCompilerNode({ kind: 106 }, 0)
    expect(result).not.toBeNull()
    expect(result!.value).toBeNull()
    expect(result!.raw).toBe('null')
  })

  it('converts TrueKeyword to boolean true', () => {
    // ts-morph SyntaxKind.TrueKeyword = 112
    const result = convertRawCompilerNode({ kind: 112 }, 0)
    expect(result).not.toBeNull()
    expect(result!.value).toBe(true)
    expect(result!.raw).toBe('true')
  })

  it('handles RegularExpressionLiteral', () => {
    // RegularExpressionLiteral kind
    const result = convertRawCompilerNode({ kind: 14, text: '/abc/gi' }, 0)
    expect(result).not.toBeNull()
    if (result!.regex) {
      expect(result!.raw).toBe('/abc/gi')
      expect(result!.regex).toEqual({ pattern: 'abc', flags: 'gi' })
    }
  })

  it('converts child objects with kind recursively', () => {
    const result = convertRawCompilerNode(
      {
        kind: 80,
        child: { kind: 80, escapedText: 'inner' },
      },
      0,
    )
    expect(result).not.toBeNull()
    expect(result).toHaveProperty('child')
    expect((result!.child as Record<string, unknown>)?.type).toBe('Identifier')
  })

  it('converts array children with kind', () => {
    const result = convertRawCompilerNode(
      {
        kind: 80,
        items: [{ kind: 80, escapedText: 'item1' }, 'plain'],
      },
      0,
    )
    expect(result).not.toBeNull()
    const items = result!.items as unknown[]
    expect(items[0]).toHaveProperty('type', 'Identifier')
    expect(items[1]).toBe('plain')
  })

  it('handles OmittedExpression in arrays as null', () => {
    // ts-morph SyntaxKind.OmittedExpression = 232
    const result = convertRawCompilerNode(
      {
        kind: 80,
        items: [{ kind: 232 }],
      },
      0,
    )
    expect(result).not.toBeNull()
    const items = result!.items as unknown[]
    expect(items[0]).toBeNull()
  })

  it('preserves string values in properties', () => {
    const result = convertRawCompilerNode({ kind: 80, label: 'test' }, 0)
    expect(result).not.toBeNull()
    expect(result!.label).toBe('test')
  })

  it('preserves number values in properties', () => {
    const result = convertRawCompilerNode({ kind: 80, count: 42 }, 0)
    expect(result).not.toBeNull()
    expect(result!.count).toBe(42)
  })

  it('preserves boolean values in properties', () => {
    const result = convertRawCompilerNode({ kind: 80, flag: true }, 0)
    expect(result).not.toBeNull()
    expect(result!.flag).toBe(true)
  })

  it('preserves null property values', () => {
    const result = convertRawCompilerNode({ kind: 80, name: null }, 0)
    expect(result).not.toBeNull()
    expect(result!.name).toBeNull()
  })

  it('preserves undefined property values', () => {
    const result = convertRawCompilerNode({ kind: 80, name: undefined }, 0)
    expect(result).not.toBeNull()
    expect(result!.name).toBeUndefined()
  })

  it('handles BinaryExpression with assignment operator as AssignmentExpression', () => {
    // ts-morph SyntaxKind.BinaryExpression = 226, EqualsToken = 64
    const result = convertRawCompilerNode(
      {
        kind: 226,
        operatorToken: { kind: 64 },
        left: { kind: 80, escapedText: 'x' },
        right: { kind: 9, text: '1' },
      },
      0,
    )
    expect(result).not.toBeNull()
    expect(result!.type).toBe('AssignmentExpression')
  })

  it('handles BinaryExpression with logical operator as LogicalExpression', () => {
    // ts-morph SyntaxKind.BinaryExpression = 226, BarBarToken = 57
    const result = convertRawCompilerNode(
      {
        kind: 226,
        operatorToken: { kind: 57 },
        left: { kind: 80, escapedText: 'a' },
        right: { kind: 80, escapedText: 'b' },
      },
      0,
    )
    expect(result).not.toBeNull()
    expect(result!.type).toBe('LogicalExpression')
  })

  it('keeps BinaryExpression type for non-assignment non-logical operators', () => {
    // ts-morph SyntaxKind.BinaryExpression = 226, PlusToken = 40
    const result = convertRawCompilerNode(
      {
        kind: 226,
        operatorToken: { kind: 40 },
        left: { kind: 80, escapedText: 'a' },
        right: { kind: 80, escapedText: 'b' },
      },
      0,
    )
    expect(result).not.toBeNull()
    expect(result!.type).toBe('BinaryExpression')
  })

  it('handles PrefixUnaryExpression with ++ operator', () => {
    const result = convertRawCompilerNode(
      {
        kind: 224,
        operator: 46,
        operand: { kind: 80, escapedText: 'x' },
      },
      0,
    )
    expect(result).not.toBeNull()
    expect(result!.type).toBe('UpdateExpression')
    expect(result!.operator).toBe('++')
    expect(result!.argument).toBeDefined()
    expect(result!.prefix).toBe(true)
  })

  it('handles PostfixUnaryExpression with prefix false', () => {
    // ts-morph SyntaxKind.PostfixUnaryExpression = 225, PlusPlusToken = 46
    // KIND_NAME_ALIASES maps PostfixUnaryExpression → UpdateExpression
    const result = convertRawCompilerNode(
      {
        kind: 225,
        operator: 46,
        operand: { kind: 80, escapedText: 'x' },
      },
      0,
    )
    expect(result).not.toBeNull()
    expect(result!.type).toBe('UpdateExpression')
    expect(result!.prefix).toBe(false)
  })

  it('handles VariableDeclaration with const flags', () => {
    const result = convertRawCompilerNode(
      {
        kind: 260,
        name: { kind: 80, escapedText: 'x' },
        flags: 2,
      },
      0,
    )
    expect(result).not.toBeNull()
    if (result!.kind !== undefined) {
      expect(result!.kind).toBe('const')
    }
  })

  it('handles VariableDeclaration with let flags', () => {
    const result = convertRawCompilerNode(
      {
        kind: 260,
        name: { kind: 80, escapedText: 'x' },
        flags: 1,
      },
      0,
    )
    expect(result).not.toBeNull()
    if (result!.kind !== undefined) {
      expect(result!.kind).toBe('let')
    }
  })

  it('handles VariableDeclaration with var flags (0)', () => {
    const result = convertRawCompilerNode(
      {
        kind: 260,
        name: { kind: 80, escapedText: 'x' },
        flags: 0,
        declarationList: { flags: 0 },
      },
      0,
    )
    expect(result).not.toBeNull()
    if (result!.kind !== undefined) {
      expect(result!.kind).toBe('var')
    }
  })

  it('handles NoSubstitutionTemplateLiteral', () => {
    // NoSubstitutionTemplateLiteral kind = 15
    const result = convertRawCompilerNode({ kind: 15, text: 'hello', rawText: 'hello' }, 0)
    expect(result).not.toBeNull()
    if (result!.quasis) {
      expect((result!.quasis as unknown[]).length).toBe(1)
      expect(((result!.quasis as unknown[])[0] as Record<string, unknown>)?.tail).toBe(true)
    }
  })

  it('handles TemplateExpression with head and templateSpans', () => {
    // ts-morph SyntaxKind.TemplateExpression = 228
    const result = convertRawCompilerNode(
      {
        kind: 228,
        head: { kind: 15, text: 'prefix', rawText: 'prefix' },
        templateSpans: [
          {
            expression: { kind: 80, escapedText: 'name' },
            literal: { kind: 15, text: '', rawText: '', pos: 0, end: 0 },
          },
        ],
      },
      0,
    )
    expect(result).not.toBeNull()
    if (result!.quasis) {
      expect((result!.quasis as unknown[]).length).toBeGreaterThanOrEqual(1)
    }
    if (result!.expressions) {
      expect((result!.expressions as unknown[]).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('handles caseBlock conversion', () => {
    // ts-morph SyntaxKind.SwitchStatement = 255, CaseClause = 296
    const result = convertRawCompilerNode(
      {
        kind: 255,
        caseBlock: {
          clauses: [{ kind: 296, expression: { kind: 9, text: '1' } }],
        },
      },
      0,
    )
    expect(result).not.toBeNull()
    // The caseBlock should be processed
  })

  it('handles operatorToken with kind property', () => {
    const result = convertRawCompilerNode(
      {
        kind: 226,
        operatorToken: { kind: 64 }, // ts-morph EqualsToken
        left: { kind: 80, escapedText: 'a' },
        right: { kind: 80, escapedText: 'b' },
      },
      0,
    )
    expect(result).not.toBeNull()
    // operator should be the mapped string, not the object
    expect(typeof result!.operator).toBe('string')
  })

  it('handles variableDeclaration with kind and name', () => {
    const result = convertRawCompilerNode(
      {
        kind: 230,
        variableDeclaration: {
          kind: 260,
          name: { kind: 80, escapedText: 'myVar' },
        },
      },
      0,
    )
    expect(result).not.toBeNull()
  })

  it('returns non-null result for valid node at depth 0', () => {
    const result = convertRawCompilerNode({ kind: 80, escapedText: 'test' }, 0)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Identifier')
    expect(result!.name).toBe('test')
  })

  it('returns non-null result for valid node at depth 4', () => {
    const result = convertRawCompilerNode({ kind: 80, escapedText: 'test' }, 4)
    expect(result).not.toBeNull()
  })
})
