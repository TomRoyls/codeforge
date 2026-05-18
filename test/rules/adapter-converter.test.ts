import { describe, expect, it } from 'vitest'

import {
  convertOperatorToken,
  convertRawCompilerNode,
  setRangeSourceText,
  skipTrivia,
} from '../../src/rules/adapter-converter.js'

// SyntaxKind numeric values (from ts-morph / TypeScript compiler API)
const SK = {
  Identifier: 80,
  StringLiteral: 11,
  NumericLiteral: 9,
  BigIntLiteral: 10,
  IfStatement: 245,
  BinaryExpression: 226,
  PrefixUnaryExpression: 224,
  PostfixUnaryExpression: 225,
  VariableDeclaration: 260,
  VariableDeclarationList: 261,
  VariableStatement: 243,
  TrueKeyword: 112,
  FalseKeyword: 97,
  NullKeyword: 106,
  RegularExpressionLiteral: 14,
  TemplateExpression: 228,
  NoSubstitutionTemplateLiteral: 15,
  EqualsToken: 64,
  PlusPlusToken: 46,
  MinusMinusToken: 47,
  PlusToken: 40,
  MinusToken: 41,
  AsteriskToken: 42,
  EqualsEqualsToken: 35,
  EqualsEqualsEqualsToken: 37,
  AmpersandAmpersandToken: 56,
  BarBarToken: 57,
  PlusEqualsToken: 65,
  MinusEqualsToken: 66,
  Block: 241,
  ExpressionStatement: 244,
  OmittedExpression: 232,
  ReturnStatement: 253,
  CatchClause: 299,
  CaseClause: 296,
  SwitchStatement: 255,
  TemplateMiddle: 17,
  TemplateTail: 18,
} as const

// ─── setRangeSourceText + skipTrivia ───

describe('setRangeSourceText + skipTrivia', () => {
  it('skipTrivia returns pos unchanged when no source text set', () => {
    setRangeSourceText('')
    expect(skipTrivia(0)).toBe(0)
    expect(skipTrivia(5)).toBe(5)
  })

  it('skipTrivia skips spaces (0x20)', () => {
    setRangeSourceText('    hello')
    expect(skipTrivia(0)).toBe(4)
  })

  it('skipTrivia skips tabs (0x09)', () => {
    setRangeSourceText('\t\t\thello')
    expect(skipTrivia(0)).toBe(3)
  })

  it('skipTrivia skips newlines (0x0a)', () => {
    setRangeSourceText('\n\n\nhello')
    expect(skipTrivia(0)).toBe(3)
  })

  it('skipTrivia skips carriage returns (0x0d)', () => {
    setRangeSourceText('\r\r\rhello')
    expect(skipTrivia(0)).toBe(3)
  })

  it('skipTrivia skips single-line comments (//)', () => {
    setRangeSourceText('// comment\ncode')
    expect(skipTrivia(0)).toBe(11)
  })

  it('skipTrivia skips multi-line comments (/* ... */)', () => {
    setRangeSourceText('/* block */code')
    expect(skipTrivia(0)).toBe(11)
  })

  it('skipTrivia stops at first non-trivia character', () => {
    setRangeSourceText('  x')
    expect(skipTrivia(0)).toBe(2)
  })

  it('skipTrivia handles mixed whitespace and comments', () => {
    setRangeSourceText('  // line\n  /* block */  code')
    expect(skipTrivia(0)).toBe(25)
  })

  it('skipTrivia returns pos unchanged if already at non-trivia', () => {
    setRangeSourceText('abc')
    expect(skipTrivia(0)).toBe(0)
  })

  it('skipTrivia handles pos at end of string', () => {
    setRangeSourceText('  ')
    expect(skipTrivia(2)).toBe(2)
  })

  it('skipTrivia handles pos beyond string length', () => {
    setRangeSourceText('hi')
    expect(skipTrivia(10)).toBe(10)
  })

  it('skipTrivia skips single-line comment at EOF with no newline', () => {
    setRangeSourceText('// comment')
    expect(skipTrivia(0)).toBe(10)
  })

  it('skipTrivia handles CRLF line endings after comment', () => {
    setRangeSourceText('// comment\r\ncode')
    // \r at pos 10 is whitespace, then \n at pos 11 is whitespace, then 'c' at pos 12
    expect(skipTrivia(0)).toBe(12)
  })
})

// ─── convertOperatorToken ───

describe('convertOperatorToken', () => {
  it('string input returns as-is', () => {
    expect(convertOperatorToken('+')).toBe('+')
    expect(convertOperatorToken('&&')).toBe('&&')
  })

  it('number input looks up in KIND_MAP then OPERATOR_TOKEN_MAP', () => {
    // EqualsToken -> 'EqualsToken' -> '='
    expect(convertOperatorToken(SK.EqualsToken)).toBe('=')
    // AsteriskToken -> 'AsteriskToken' -> '*'
    expect(convertOperatorToken(SK.AsteriskToken)).toBe('*')
  })

  it('number input with unknown kind returns String(number)', () => {
    expect(convertOperatorToken(99999)).toBe('99999')
  })

  it('object with type string looks up in OPERATOR_TOKEN_MAP', () => {
    expect(convertOperatorToken({ type: 'EqualsEqualsToken' })).toBe('==')
    expect(convertOperatorToken({ type: 'AmpersandAmpersandToken' })).toBe('&&')
  })

  it('object with type string but unknown type returns String(object)', () => {
    const token = { type: 'SomeUnknownToken' }
    const result = convertOperatorToken(token)
    expect(result).toBe(String(token))
  })

  it('object with getText method calls getText()', () => {
    expect(convertOperatorToken({ getText: () => '>>>' })).toBe('>>>')
  })

  it('object with operator property returns String(operator)', () => {
    expect(convertOperatorToken({ operator: '**' })).toBe('**')
  })

  it('object with operator property that is number returns stringified', () => {
    expect(convertOperatorToken({ operator: 42 })).toBe('42')
  })

  it('unknown/fallback returns String(token)', () => {
    expect(convertOperatorToken(true)).toBe('true')
    expect(convertOperatorToken(null)).toBe('null')
    expect(convertOperatorToken(undefined)).toBe('undefined')
  })

  it('plain object without type/getText/operator returns String(object)', () => {
    const obj = { foo: 'bar' }
    expect(convertOperatorToken(obj)).toBe(String(obj))
  })

  it('number input for PlusToken returns +', () => {
    expect(convertOperatorToken(SK.PlusToken)).toBe('+')
  })

  it('number input for MinusToken returns -', () => {
    expect(convertOperatorToken(SK.MinusToken)).toBe('-')
  })
})

// ─── convertRawCompilerNode ───

describe('convertRawCompilerNode', () => {
  it('returns null when depth >= MAX_DEPTH (5)', () => {
    const raw = { kind: SK.Identifier, escapedText: 'x' }
    expect(convertRawCompilerNode(raw, 5)).toBeNull()
    expect(convertRawCompilerNode(raw, 6)).toBeNull()
    expect(convertRawCompilerNode(raw, 100)).toBeNull()
  })

  it('returns null for null input', () => {
    expect(convertRawCompilerNode(null as unknown as Record<string, unknown>, 0)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(convertRawCompilerNode(undefined as unknown as Record<string, unknown>, 0)).toBeNull()
  })

  it('raw node with kind produces result with type field', () => {
    setRangeSourceText('')
    const raw = { kind: SK.Identifier, escapedText: 'foo' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('Identifier')
  })

  it('raw node with pos/end produces result with range, start, end', () => {
    setRangeSourceText('let x')
    const raw = { kind: SK.Identifier, pos: 0, end: 5, escapedText: 'foo' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result).not.toBeNull()
    expect(result!.range).toEqual([0, 5])
    expect(result!.start).toBe(0)
    expect(result!.end).toBe(5)
  })

  it('range uses skipTrivia to adjust start position', () => {
    setRangeSourceText('   foo')
    const raw = { kind: SK.Identifier, pos: 0, end: 6, escapedText: 'foo' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result).not.toBeNull()
    expect(result!.start).toBe(3)
    expect(result!.range).toEqual([3, 6])
  })

  it('pos/end without both being numbers does not set range', () => {
    setRangeSourceText('')
    const raw = { kind: SK.Identifier, pos: 0, escapedText: 'foo' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result).not.toBeNull()
    expect(result!.range).toBeUndefined()
    expect(result!.start).toBeUndefined()
    expect(result!.end).toBeUndefined()
  })

  it('KIND_NAME_ALIASES applied correctly (Identifier kind=79 -> type=Identifier)', () => {
    setRangeSourceText('')
    const raw = { kind: SK.Identifier, escapedText: 'myVar' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('Identifier')
  })

  it('KIND_NAME_ALIASES applied correctly (StringLiteral kind=10 -> type=Literal)', () => {
    setRangeSourceText('')
    const raw = { kind: SK.StringLiteral, text: 'hello' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('Literal')
  })

  it('KIND_NAME_ALIASES applied correctly (NumericLiteral kind=8 -> type=Literal)', () => {
    setRangeSourceText('')
    const raw = { kind: SK.NumericLiteral, text: '42' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('Literal')
  })

  it('keys starting with underscore are skipped', () => {
    setRangeSourceText('')
    const raw = { kind: SK.Identifier, escapedText: 'x', _private: 'hidden' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!._private).toBeUndefined()
  })

  it('keys in SKIP_KEYS are skipped', () => {
    setRangeSourceText('')
    const raw = { kind: SK.Identifier, escapedText: 'x', flags: 1, pos: 0, end: 1, parent: {} }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.flags).toBeUndefined()
    expect(result!.parent).toBeUndefined()
  })

  it('Identifier node sets name and value from escapedText', () => {
    setRangeSourceText('')
    const raw = { kind: SK.Identifier, escapedText: 'myVar' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.name).toBe('myVar')
    expect(result!.value).toBe('myVar')
  })

  it('StringLiteral node sets value and raw from text', () => {
    setRangeSourceText('')
    const raw = { kind: SK.StringLiteral, text: 'hello' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.value).toBe('hello')
    // text key maps to 'raw' via PROPERTY_MAP, overwriting the literal raw
    expect(result!.raw).toBe('hello')
  })

  it('NumericLiteral node sets numeric value and raw', () => {
    setRangeSourceText('')
    const raw = { kind: SK.NumericLiteral, text: '42' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.value).toBe(42)
    expect(result!.raw).toBe('42')
  })

  it('BigIntLiteral node sets numeric value (NaN from n-suffix) and raw', () => {
    setRangeSourceText('')
    const raw = { kind: SK.BigIntLiteral, text: '100n' }
    const result = convertRawCompilerNode(raw, 0)
    // Number('100n') produces NaN because of the n suffix
    expect(result!.value).toBeNaN()
    expect(result!.raw).toBe('100n')
  })

  it('FalseKeyword node sets value=false and raw="false"', () => {
    setRangeSourceText('')
    const raw = { kind: SK.FalseKeyword }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('BooleanLiteral')
    expect(result!.value).toBe(false)
    expect(result!.raw).toBe('false')
  })

  it('TrueKeyword node sets value=true and raw="true"', () => {
    setRangeSourceText('')
    const raw = { kind: SK.TrueKeyword }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('BooleanLiteral')
    expect(result!.value).toBe(true)
    expect(result!.raw).toBe('true')
  })

  it('NullKeyword node sets value=null and raw="null"', () => {
    setRangeSourceText('')
    const raw = { kind: SK.NullKeyword }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('Literal')
    expect(result!.value).toBeNull()
    expect(result!.raw).toBe('null')
  })

  it('RegularExpressionLiteral node sets regex pattern and flags', () => {
    setRangeSourceText('')
    const raw = { kind: SK.RegularExpressionLiteral, text: '/abc/gi' }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('RegExpLiteral')
    expect(result!.raw).toBe('/abc/gi')
    expect(result!.regex).toEqual({ flags: 'gi', pattern: 'abc' })
  })

  it('BinaryExpression with assignment operator becomes AssignmentExpression', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.BinaryExpression,
      left: { kind: SK.Identifier, escapedText: 'x' },
      operatorToken: { kind: SK.EqualsToken },
      right: { kind: SK.NumericLiteral, text: '5' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('AssignmentExpression')
    expect(result!.operator).toBe('=')
  })

  it('BinaryExpression with += becomes AssignmentExpression', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.BinaryExpression,
      left: { kind: SK.Identifier, escapedText: 'x' },
      operatorToken: { kind: SK.PlusEqualsToken },
      right: { kind: SK.NumericLiteral, text: '1' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('AssignmentExpression')
    expect(result!.operator).toBe('+=')
  })

  it('BinaryExpression with logical operator becomes LogicalExpression', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.BinaryExpression,
      left: { kind: SK.Identifier, escapedText: 'a' },
      operatorToken: { kind: SK.AmpersandAmpersandToken },
      right: { kind: SK.Identifier, escapedText: 'b' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('LogicalExpression')
    expect(result!.operator).toBe('&&')
  })

  it('BinaryExpression with || becomes LogicalExpression', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.BinaryExpression,
      left: { kind: SK.Identifier, escapedText: 'a' },
      operatorToken: { kind: SK.BarBarToken },
      right: { kind: SK.Identifier, escapedText: 'b' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('LogicalExpression')
    expect(result!.operator).toBe('||')
  })

  it('BinaryExpression with comparison operator stays BinaryExpression', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.BinaryExpression,
      left: { kind: SK.Identifier, escapedText: 'a' },
      operatorToken: { kind: SK.EqualsEqualsEqualsToken },
      right: { kind: SK.Identifier, escapedText: 'b' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('BinaryExpression')
    expect(result!.operator).toBe('===')
  })

  it('PrefixUnaryExpression with numeric ++ operator keeps UnaryExpression type', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.PrefixUnaryExpression,
      operator: SK.PlusPlusToken,
      operand: { kind: SK.Identifier, escapedText: 'x' },
    }
    const result = convertRawCompilerNode(raw, 0)
    // Numeric operator resolves to 'PlusPlusToken' (not in OPERATOR_TOKEN_MAP),
    // so the ++/-- fixup does not trigger
    expect(result!.type).toBe('UnaryExpression')
    expect(result!.operator).toBe('PlusPlusToken')
  })

  it('PrefixUnaryExpression with string ++ becomes UpdateExpression with prefix=true', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.PrefixUnaryExpression,
      operator: '++',
      operand: { kind: SK.Identifier, escapedText: 'x' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('UpdateExpression')
    expect(result!.prefix).toBe(true)
    expect(result!.operator).toBe('++')
  })

  it('PrefixUnaryExpression with string -- becomes UpdateExpression with prefix=true', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.PrefixUnaryExpression,
      operator: '--',
      operand: { kind: SK.Identifier, escapedText: 'y' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('UpdateExpression')
    expect(result!.prefix).toBe(true)
    expect(result!.operator).toBe('--')
  })

  it('PostfixUnaryExpression sets prefix=false', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.PostfixUnaryExpression,
      operator: SK.PlusPlusToken,
      operand: { kind: SK.Identifier, escapedText: 'x' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('UpdateExpression')
    expect(result!.prefix).toBe(false)
  })

  it('VariableDeclaration with flags has no kind property (type aliased to VariableDeclarator)', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.VariableDeclaration,
      flags: 2,
      name: { kind: SK.Identifier, escapedText: 'x' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('VariableDeclarator')
    // fixup checks result.type === 'VariableDeclaration' but alias sets it to 'VariableDeclarator'
    expect(result!.kind).toBeUndefined()
  })

  it('VariableDeclaration with flags=1 sets kind undefined (same alias issue)', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.VariableDeclaration,
      flags: 1,
      name: { kind: SK.Identifier, escapedText: 'y' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('VariableDeclarator')
    expect(result!.kind).toBeUndefined()
  })

  it('VariableDeclaration with flags=0 sets kind undefined', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.VariableDeclaration,
      flags: 0,
      name: { kind: SK.Identifier, escapedText: 'z' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('VariableDeclarator')
    expect(result!.kind).toBeUndefined()
  })

  it('VariableDeclaration with declarationList flags has kind undefined', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.VariableDeclaration,
      declarationList: { flags: 2 },
      name: { kind: SK.Identifier, escapedText: 'x' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.kind).toBeUndefined()
  })

  it('nested objects with kind are recursively converted', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.IfStatement,
      expression: { kind: SK.Identifier, escapedText: 'cond' },
      thenStatement: { kind: SK.Block, statements: [] },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('IfStatement')
    // 'expression' is mapped to 'test' via KIND_SPECIFIC_MAP for IfStatement
    expect(result!.test).toBeDefined()
    expect((result!.test as Record<string, unknown>).type).toBe('Identifier')
    // 'thenStatement' is mapped to 'consequent' via KIND_SPECIFIC_MAP for IfStatement
    expect(result!.consequent).toBeDefined()
    expect((result!.consequent as Record<string, unknown>).type).toBe('BlockStatement')
  })

  it('arrays of objects with kind are recursively converted', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.Block,
      statements: [
        { kind: SK.ExpressionStatement, expression: { kind: SK.StringLiteral, text: 'hello' } },
      ],
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('BlockStatement')
    const body = result!.body as Array<Record<string, unknown>>
    expect(body).toHaveLength(1)
    expect(body[0]!.type).toBe('ExpressionStatement')
  })

  it('arrays with OmittedExpression items produce null', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.Block,
      statements: [{ kind: SK.OmittedExpression }],
    }
    const result = convertRawCompilerNode(raw, 0)
    const body = result!.body as unknown[]
    expect(body[0]).toBeNull()
  })

  it('PROPERTY_MAP maps keys correctly (expression -> argument for ReturnStatement)', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.ReturnStatement,
      expression: { kind: SK.NumericLiteral, text: '42' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.argument).toBeDefined()
    expect((result!.argument as Record<string, unknown>).type).toBe('Literal')
  })

  it('operatorToken with kind is converted via OPERATOR_TOKEN_MAP', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.BinaryExpression,
      left: { kind: SK.Identifier, escapedText: 'a' },
      operatorToken: { kind: SK.AsteriskToken },
      right: { kind: SK.Identifier, escapedText: 'b' },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.operator).toBe('*')
    expect(result!.type).toBe('BinaryExpression')
  })

  it('respects depth limit during recursive conversion', () => {
    setRangeSourceText('')
    // depth 4 on outer means inner sees depth 5 -> null
    const raw = {
      kind: SK.Block,
      statements: [
        {
          kind: SK.Block,
          statements: [],
        },
      ],
    }
    const result = convertRawCompilerNode(raw, 4)
    expect(result).not.toBeNull()
    const body = result!.body as Array<Record<string, unknown>>
    expect(body[0]).toBeNull()
  })

  it('variableDeclaration key extracts name as param (Identifier)', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.CatchClause,
      variableDeclaration: {
        kind: SK.VariableDeclaration,
        flags: 0,
        name: { kind: SK.Identifier, escapedText: 'e' },
      },
      block: { kind: SK.Block, statements: [] },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.param).toBeDefined()
    // variableDeclaration handler extracts .name and converts it
    expect((result!.param as Record<string, unknown>).type).toBe('Identifier')
    expect((result!.param as Record<string, unknown>).name).toBe('e')
  })

  it('NoSubstitutionTemplateLiteral synthesizes quasis and expressions', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.NoSubstitutionTemplateLiteral,
      text: 'hello',
      rawText: 'hello',
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('TemplateLiteral')
    expect(result!.quasis).toBeDefined()
    expect(result!.expressions).toEqual([])
    const quasis = result!.quasis as Array<Record<string, unknown>>
    expect(quasis).toHaveLength(1)
    expect(quasis[0]!.type).toBe('TemplateElement')
    expect(quasis[0]!.tail).toBe(true)
  })

  it('TemplateExpression synthesizes quasis and expressions', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.TemplateExpression,
      head: { kind: SK.NoSubstitutionTemplateLiteral, text: 'pre', rawText: 'pre', pos: 0, end: 5 },
      templateSpans: [
        {
          expression: { kind: SK.Identifier, escapedText: 'x' },
          literal: { kind: SK.NoSubstitutionTemplateLiteral, text: 'post', rawText: 'post', pos: 5, end: 10 },
        },
      ],
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.type).toBe('TemplateLiteral')
    expect(result!.quasis).toBeDefined()
    expect(result!.expressions).toBeDefined()
    const quasis = result!.quasis as Array<Record<string, unknown>>
    const expressions = result!.expressions as Array<Record<string, unknown>>
    expect(quasis).toHaveLength(2)
    expect(expressions).toHaveLength(1)
    expect(quasis[0]!.tail).toBe(false)
    expect(quasis[1]!.tail).toBe(true)
    expect(expressions[0]!.type).toBe('Identifier')
  })

  it('caseBlock key is converted to cases array', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.SwitchStatement,
      expression: { kind: SK.Identifier, escapedText: 'x' },
      caseBlock: {
        clauses: [
          {
            kind: SK.CaseClause,
            expression: { kind: SK.StringLiteral, text: 'a' },
            statements: [],
          },
        ],
      },
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.cases).toBeDefined()
    const cases = result!.cases as Array<Record<string, unknown>>
    expect(cases).toHaveLength(1)
    expect(cases[0]!.type).toBe('SwitchCase')
  })

  it('null/undefined values are assigned as-is', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.Identifier,
      escapedText: 'x',
      someProp: null,
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.someProp).toBeNull()
  })

  it('primitive string/number/boolean values are assigned as-is', () => {
    setRangeSourceText('')
    const raw = {
      kind: SK.Identifier,
      escapedText: 'x',
      label: 'test',
      count: 42,
      active: true,
    }
    const result = convertRawCompilerNode(raw, 0)
    expect(result!.label).toBe('test')
    expect(result!.count).toBe(42)
    expect(result!.active).toBe(true)
  })
})
