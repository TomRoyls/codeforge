import { describe, test, expect, beforeEach } from 'vitest'
import { SyntaxKind, Node } from 'ts-morph'
import {
  skipTrivia,
  setRangeSourceText,
  convertOperatorToken,
  convertRawCompilerNode,
  convertCompilerNode,
} from '../../../src/rules/adapter-converter.js'
import { MAX_DEPTH } from '../../../src/rules/adapter-constants.js'

describe('adapter-converter', () => {
  describe('setRangeSourceText', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('setRangeSourceText makes text available to skipTrivia', () => {
      setRangeSourceText('  const x = 1;')
      expect(skipTrivia(0)).toBe(2)
    })

    test('setRangeSourceText with empty string returns pos unchanged', () => {
      setRangeSourceText('')
      expect(skipTrivia(0)).toBe(0)
    })

    test('setRangeSourceText overwrites previous value', () => {
      setRangeSourceText('  first')
      expect(skipTrivia(0)).toBe(2)
      setRangeSourceText('second')
      expect(skipTrivia(0)).toBe(0)
    })

    test('setRangeSourceText handles multi-line text', () => {
      const multi = '  \n  line2'
      setRangeSourceText(multi)
      expect(skipTrivia(0)).toBe(5)
    })
  })

  describe('skipTrivia', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('returns same position when no source text', () => {
      expect(skipTrivia(5)).toBe(5)
    })

    test('returns same position when source text is empty', () => {
      setRangeSourceText('')
      expect(skipTrivia(0)).toBe(0)
    })

    test('skips leading spaces', () => {
      setRangeSourceText('   hello')
      expect(skipTrivia(0)).toBe(3)
    })

    test('skips leading tabs', () => {
      setRangeSourceText('\t\thello')
      expect(skipTrivia(0)).toBe(2)
    })

    test('skips leading newlines', () => {
      setRangeSourceText('\n\nhello')
      expect(skipTrivia(0)).toBe(2)
    })

    test('skips carriage returns', () => {
      setRangeSourceText('\r\rhello')
      expect(skipTrivia(0)).toBe(2)
    })

    test('skips single-line comment', () => {
      setRangeSourceText('// comment\nhello')
      expect(skipTrivia(0)).toBe(11)
    })

    test('skips multi-line comment', () => {
      setRangeSourceText('/* comment */hello')
      expect(skipTrivia(0)).toBe(13)
    })

    test('skips mixed whitespace and comments', () => {
      setRangeSourceText('  /* a */ // b\n  hello')
      expect(skipTrivia(0)).toBe(17)
    })

    test('returns position at end when all trivia', () => {
      setRangeSourceText('   ')
      expect(skipTrivia(0)).toBe(3)
    })

    test('respects starting position', () => {
      setRangeSourceText('ab   hello')
      expect(skipTrivia(2)).toBe(5)
    })
  })

  describe('convertOperatorToken', () => {
    test('returns string as-is', () => {
      expect(convertOperatorToken('+')).toBe('+')
    })

    test('returns empty string token as-is', () => {
      expect(convertOperatorToken('')).toBe('')
    })

    test('converts numeric SyntaxKind via KIND_MAP', () => {
      expect(convertOperatorToken(SyntaxKind.PlusToken)).toBe('+')
    })

    test('converts minus token', () => {
      expect(convertOperatorToken(SyntaxKind.MinusToken)).toBe('-')
    })

    test('returns string representation for unknown number', () => {
      expect(convertOperatorToken(99999)).toBe('99999')
    })

    test('extracts type from object via OPERATOR_TOKEN_MAP', () => {
      const obj = { type: 'AmpersandAmpersandToken' }
      expect(convertOperatorToken(obj)).toBe('&&')
    })

    test('calls getText from object with getText method', () => {
      const obj = { getText: () => 'custom-op' }
      expect(convertOperatorToken(obj)).toBe('custom-op')
    })

    test('returns obj.operator as string', () => {
      const obj = { operator: '**' }
      expect(convertOperatorToken(obj)).toBe('**')
    })

    test('returns String(token) as fallback for unknown number', () => {
      expect(convertOperatorToken(99999)).toBe('99999')
    })

    test('handles null gracefully', () => {
      expect(convertOperatorToken(null)).toBe('null')
    })
  })

  describe('convertRawCompilerNode', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('returns null when depth >= MAX_DEPTH', () => {
      expect(convertRawCompilerNode({ kind: 1 }, MAX_DEPTH)).toBeNull()
    })

    test('returns null for null input', () => {
      expect(convertRawCompilerNode(null as unknown as Record<string, unknown>, 0)).toBeNull()
    })

    test('returns null for undefined input', () => {
      expect(convertRawCompilerNode(undefined as unknown as Record<string, unknown>, 0)).toBeNull()
    })

    test('returns null for non-object input', () => {
      expect(convertRawCompilerNode('string' as unknown as Record<string, unknown>, 0)).toBeNull()
    })

    test('maps kind to type via KIND_NAME_ALIASES', () => {
      const node = { kind: SyntaxKind.VariableDeclaration, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('VariableDeclarator')
    })

    test('maps kind via KIND_NAME_ALIASES for Block', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('BlockStatement')
    })

    test('sets range from pos and end', () => {
      const node = { kind: SyntaxKind.Block, pos: 5, end: 15 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.range).toEqual([5, 15])
      expect(result?.start).toBe(5)
      expect(result?.end).toBe(15)
    })

    test('skips trivia when calculating start position', () => {
      setRangeSourceText('   hello')
      const node = { kind: SyntaxKind.Block, pos: 0, end: 8 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.start).toBe(3)
      expect(result?.range).toEqual([3, 8])
    })

    test('StringLiteral sets value and raw', () => {
      const node = { kind: SyntaxKind.StringLiteral, text: 'hello', pos: 0, end: 7 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBe('hello')
      expect(result?.type).toBe('Literal')
    })

    test('NumericLiteral sets value as Number and raw', () => {
      const node = { kind: SyntaxKind.NumericLiteral, text: '42', pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBe(42)
      expect(result?.raw).toBe('42')
    })

    test('BigIntLiteral sets NaN for bigint text', () => {
      const node = { kind: SyntaxKind.BigIntLiteral, text: '100n', pos: 0, end: 4 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBeNaN()
      expect(result?.raw).toBe('100n')
    })

    test('Identifier sets name and value from escapedText', () => {
      const node = { kind: SyntaxKind.Identifier, escapedText: 'myVar', pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.name).toBe('myVar')
      expect(result?.value).toBe('myVar')
    })

    test('TrueKeyword sets value=true and raw', () => {
      const node = { kind: SyntaxKind.TrueKeyword, pos: 0, end: 4 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBe(true)
      expect(result?.raw).toBe('true')
    })

    test('FalseKeyword sets value=false and raw', () => {
      const node = { kind: SyntaxKind.FalseKeyword, pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBe(false)
      expect(result?.raw).toBe('false')
    })

    test('NullKeyword sets value=null and raw', () => {
      const node = { kind: SyntaxKind.NullKeyword, pos: 0, end: 4 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBeNull()
      expect(result?.raw).toBe('null')
    })

    test('RegularExpressionLiteral sets raw and regex', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: '/pattern/gi',
        pos: 0,
        end: 11,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.raw).toBe('/pattern/gi')
      expect(result?.regex).toEqual({ pattern: 'pattern', flags: 'gi' })
    })

    test('RegularExpressionLiteral without flags', () => {
      const node = { kind: SyntaxKind.RegularExpressionLiteral, text: '/test/', pos: 0, end: 6 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'test', flags: '' })
    })

    test('skips keys starting with underscore', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, _brand: 'test' }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('_brand')
    })

    test('passes through string child values', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, label: 'test-label' }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.label).toBe('test-label')
    })

    test('does not pass through keys in SKIP_KEYS (flags)', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, flags: 3 }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('flags')
    })

    test('passes through boolean child values', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, isTest: true }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.isTest).toBe(true)
    })

    test('maps initializer to init via PROPERTY_MAP', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, initializer: null }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.init).toBeNull()
    })

    test('converts object child with kind number', () => {
      const child = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 }
      const node = { kind: SyntaxKind.VariableDeclaration, pos: 0, end: 10, name: child }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.id).toBeDefined()
      expect((result?.id as Record<string, unknown>)?.type).toBe('Identifier')
    })

    test('converts array children with kind', () => {
      const child = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 }
      const node = { kind: SyntaxKind.Block, pos: 0, end: 10, statements: [child] }
      const result = convertRawCompilerNode(node, 0)
      const body = result?.body as Array<Record<string, unknown>>
      expect(body).toHaveLength(1)
      expect(body[0]?.type).toBe('Identifier')
    })

    test('passes through array items without kind', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, decorators: ['plain-string'] }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.decorators).toEqual(['plain-string'])
    })

    test('OmittedExpression in array becomes null', () => {
      const child = { kind: SyntaxKind.OmittedExpression, pos: 0, end: 0 }
      const node = { kind: SyntaxKind.ArrayLiteralExpression, pos: 0, end: 5, elements: [child] }
      const result = convertRawCompilerNode(node, 0)
      const elements = result?.elements as unknown[]
      expect(elements[0]).toBeNull()
    })

    test('caseBlock extracts clauses via SwitchStatement KIND_SPECIFIC_MAP', () => {
      const clause = {
        kind: SyntaxKind.CaseClause,
        pos: 0,
        end: 5,
        expression: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 0, end: 1 },
      }
      const node = {
        kind: SyntaxKind.SwitchStatement,
        pos: 0,
        end: 10,
        caseBlock: { clauses: [clause] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.cases).toBeDefined()
      expect(Array.isArray(result?.cases)).toBe(true)
    })

    test('TemplateExpression synthesizes quasis and expressions', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'hello ',
        rawText: 'hello ',
        pos: 0,
        end: 8,
      }
      const expr = { kind: SyntaxKind.Identifier, escapedText: 'name', pos: 9, end: 13 }
      const tail = { kind: SyntaxKind.TemplateTail, text: '!', rawText: '!', pos: 14, end: 16 }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 16,
        head,
        templateSpans: [{ expression: expr, literal: tail }],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.quasis).toBeDefined()
      expect(result?.expressions).toBeDefined()
      const quasis = result?.quasis as Array<Record<string, unknown>>
      const expressions = result?.expressions as unknown[]
      expect(quasis).toHaveLength(2)
      expect(expressions).toHaveLength(1)
      expect(quasis[0]?.tail).toBe(false)
      expect(quasis[1]?.tail).toBe(true)
    })

    test('NoSubstitutionTemplateLiteral creates single quasi', () => {
      const node = {
        kind: SyntaxKind.NoSubstitutionTemplateLiteral,
        text: 'simple',
        pos: 0,
        end: 8,
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      expect(quasis).toHaveLength(1)
      expect(quasis[0]?.tail).toBe(true)
      expect(result?.expressions).toEqual([])
    })

    test('operatorToken converts via KIND_MAP', () => {
      const opToken = { kind: SyntaxKind.PlusToken }
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: opToken,
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.operator).toBe('+')
    })

    test('variableDeclaration extracts via PROPERTY_MAP to param', () => {
      const varDecl = {
        kind: SyntaxKind.VariableDeclaration,
        name: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 4, end: 5 },
        pos: 0,
        end: 10,
      }
      const node = {
        kind: SyntaxKind.CatchClause,
        pos: 0,
        end: 10,
        variableDeclaration: varDecl,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.param).toBeDefined()
    })

    test('variableDeclaration with non-object name yields null', () => {
      const varDecl = {
        kind: SyntaxKind.VariableDeclaration,
        name: 'not-an-object',
        pos: 0,
        end: 10,
      }
      const node = {
        kind: SyntaxKind.CatchClause,
        pos: 0,
        end: 10,
        variableDeclaration: varDecl,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.param).toBeNull()
    })

    test('BinaryExpression with assignment operator becomes AssignmentExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.EqualsToken },
        right: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with logical operator becomes LogicalExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 7,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.AmpersandAmpersandToken },
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 5, end: 6 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('LogicalExpression')
    })

    test('BinaryExpression with non-assignment non-logical stays BinaryExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.PlusToken },
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('BinaryExpression')
    })

    test('PrefixUnaryExpression with ++ becomes UpdateExpression (operator mapped)', () => {
      const node = {
        kind: SyntaxKind.PrefixUnaryExpression,
        pos: 0,
        end: 3,
        operator: SyntaxKind.PlusPlusToken,
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 2, end: 3 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('UpdateExpression')
    })

    test('PrefixUnaryExpression with string ++ becomes UpdateExpression', () => {
      const node = {
        kind: SyntaxKind.PrefixUnaryExpression,
        pos: 0,
        end: 3,
        operator: '++',
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 2, end: 3 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('UpdateExpression')
      expect(result?.prefix).toBe(true)
    })

    test('PrefixUnaryExpression with string -- becomes UpdateExpression', () => {
      const node = {
        kind: SyntaxKind.PrefixUnaryExpression,
        pos: 0,
        end: 3,
        operator: '--',
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 2, end: 3 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('UpdateExpression')
      expect(result?.prefix).toBe(true)
    })

    test('PostfixUnaryExpression sets prefix=false', () => {
      const node = {
        kind: SyntaxKind.PostfixUnaryExpression,
        pos: 0,
        end: 3,
        operator: SyntaxKind.PlusPlusToken,
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.prefix).toBe(false)
    })

    test('VariableDeclarationList with flags=2 sets kind=const', () => {
      const node = {
        kind: SyntaxKind.VariableDeclarationList,
        pos: 0,
        end: 10,
        flags: 2,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('VariableDeclaration')
      expect(result?.kind).toBe('const')
    })

    test('VariableDeclarationList with flags=1 sets kind=let', () => {
      const node = {
        kind: SyntaxKind.VariableDeclarationList,
        pos: 0,
        end: 10,
        flags: 1,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('VariableDeclaration')
      expect(result?.kind).toBe('let')
    })

    test('VariableDeclarationList reads kind from declarationList flags', () => {
      const node = {
        kind: SyntaxKind.VariableDeclarationList,
        pos: 0,
        end: 10,
        declarationList: { flags: 2 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.kind).toBe('const')
    })

    test('converts numeric operator to string', () => {
      const node = {
        kind: SyntaxKind.PrefixUnaryExpression,
        pos: 0,
        end: 2,
        operator: SyntaxKind.ExclamationToken,
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 1, end: 2 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(typeof result?.operator).toBe('string')
    })

    test('handles node without pos/end gracefully', () => {
      const node = { kind: SyntaxKind.Block }
      const result = convertRawCompilerNode(node, 0)
      expect(result).toBeDefined()
      expect(result?.range).toBeUndefined()
    })

    test('handles unknown kind number', () => {
      const node = { kind: 99999, pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toContain('Unknown')
    })
  })

  describe('convertCompilerNode', () => {
    function createMockNode(
      overrides: {
        kindName?: string
        text?: string
        start?: number
        end?: number
        compilerNode?: Record<string, unknown>
      } = {},
    ): Node {
      const mockCompilerNode: Record<string, unknown> = overrides.compilerNode ?? {
        pos: overrides.start ?? 0,
        end: overrides.end ?? 10,
      }
      return {
        getKindName: () => overrides.kindName ?? 'StringLiteral',
        getText: () => overrides.text ?? '"hello"',
        getStart: () => overrides.start ?? 0,
        getEnd: () => overrides.end ?? 10,
        getSourceFile: () => ({
          getFilePath: () => '/test/file.ts',
          getFullText: () => overrides.text ?? '"hello"',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        compilerNode: mockCompilerNode,
      } as unknown as Node
    }

    beforeEach(() => {
      setRangeSourceText('')
    })

    test('returns null for null input', () => {
      expect(convertCompilerNode(null as unknown as Node, 0)).toBeNull()
    })

    test('returns null for undefined input', () => {
      expect(convertCompilerNode(undefined as unknown as Node, 0)).toBeNull()
    })

    test('returns null when depth >= MAX_DEPTH', () => {
      const node = createMockNode({ kindName: 'StringLiteral' })
      expect(convertCompilerNode(node, MAX_DEPTH)).toBeNull()
    })

    test('returns null when getKindName throws', () => {
      const node = {
        getKindName: () => {
          throw new Error('Test error')
        },
      } as unknown as Node
      expect(convertCompilerNode(node, 0)).toBeNull()
    })

    test('maps Block to BlockStatement via KIND_NAME_ALIASES', () => {
      const node = createMockNode({ kindName: 'Block' })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('BlockStatement')
    })

    test('uses kind name as type when no alias exists', () => {
      const node = createMockNode({ kindName: 'SomeUnknownKind' })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('SomeUnknownKind')
    })

    test('sets range from compilerNode pos/end', () => {
      const node = createMockNode({
        kindName: 'Block',
        start: 5,
        end: 20,
        compilerNode: { pos: 5, end: 20 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.range).toEqual([5, 20])
      expect(result?.start).toBe(5)
      expect(result?.end).toBe(20)
    })

    test('skips trivia when calculating start', () => {
      setRangeSourceText('   hello')
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 8 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.start).toBe(3)
    })

    test('StringLiteral extracts value without quotes and raw with quotes', () => {
      const node = createMockNode({
        kindName: 'StringLiteral',
        text: '"hello world"',
        compilerNode: { pos: 0, end: 13 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.value).toBe('hello world')
      expect(result?.raw).toBe('"hello world"')
    })

    test('NumericLiteral sets value as Number', () => {
      const node = createMockNode({
        kindName: 'NumericLiteral',
        text: '42',
        compilerNode: { pos: 0, end: 2 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.value).toBe(42)
      expect(result?.raw).toBe('42')
    })

    test('BigIntLiteral sets NaN for bigint text', () => {
      const node = createMockNode({
        kindName: 'BigIntLiteral',
        text: '100n',
        compilerNode: { pos: 0, end: 4 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.value).toBeNaN()
    })

    test('TrueKeyword sets value=true and raw', () => {
      const node = createMockNode({ kindName: 'TrueKeyword' })
      const result = convertCompilerNode(node, 0)
      expect(result?.value).toBe(true)
      expect(result?.raw).toBe('true')
    })

    test('FalseKeyword sets value=false and raw', () => {
      const node = createMockNode({ kindName: 'FalseKeyword' })
      const result = convertCompilerNode(node, 0)
      expect(result?.value).toBe(false)
      expect(result?.raw).toBe('false')
    })

    test('NullKeyword sets value=null and raw', () => {
      const node = createMockNode({ kindName: 'NullKeyword' })
      const result = convertCompilerNode(node, 0)
      expect(result?.value).toBeNull()
      expect(result?.raw).toBe('null')
    })

    test('RegularExpressionLiteral sets regex', () => {
      const node = createMockNode({
        kindName: 'RegularExpressionLiteral',
        text: '/test/g',
        compilerNode: { pos: 0, end: 7 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'test', flags: 'g' })
    })

    test('converts compilerNode children with kind', () => {
      const childNode = {
        kind: SyntaxKind.Identifier,
        escapedText: 'x',
        pos: 0,
        end: 1,
      }
      const node = createMockNode({
        kindName: 'VariableDeclaration',
        compilerNode: { pos: 0, end: 10, name: childNode },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.id).toBeDefined()
      expect((result?.id as Record<string, unknown>)?.type).toBe('Identifier')
    })

    test('converts array children in compilerNode', () => {
      const child = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 }
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 10, statements: [child] },
      })
      const result = convertCompilerNode(node, 0)
      const body = result?.body as Array<Record<string, unknown>>
      expect(body).toHaveLength(1)
      expect(body[0]?.type).toBe('Identifier')
    })

    test('BinaryExpression with assignment operator becomes AssignmentExpression', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.EqualsToken },
          right: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
    })

    test('BinaryExpression with logical operator becomes LogicalExpression', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 7,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.AmpersandAmpersandToken },
          right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 5, end: 6 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('LogicalExpression')
    })

    test('PrefixUnaryExpression with numeric operator converts to string', () => {
      const node = createMockNode({
        kindName: 'PrefixUnaryExpression',
        compilerNode: {
          pos: 0,
          end: 2,
          operator: SyntaxKind.PlusPlusToken,
          operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 1, end: 2 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(typeof result?.operator).toBe('string')
    })

    test('PostfixUnaryExpression sets prefix=false', () => {
      const node = createMockNode({
        kindName: 'PostfixUnaryExpression',
        compilerNode: {
          pos: 0,
          end: 3,
          operator: SyntaxKind.PlusPlusToken,
          operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.prefix).toBe(false)
    })

    test('VariableDeclarationList with const flags', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
          flags: 2,
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBe('const')
    })

    test('VariableDeclarationList with let flags', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
          flags: 1,
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBe('let')
    })

    test('VariableDeclarationList with declarationList flags', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
          declarationList: { flags: 2 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBe('const')
    })

    test('handles node without compilerNode gracefully', () => {
      const node = {
        getKindName: () => 'Block',
        getText: () => '{}',
        getStart: () => 0,
        getEnd: () => 2,
        getSourceFile: () => ({
          getFilePath: () => '/test.ts',
          getFullText: () => '{}',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
      } as unknown as Node
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('BlockStatement')
    })

    test('converts numeric operator to string', () => {
      const node = createMockNode({
        kindName: 'PrefixUnaryExpression',
        compilerNode: {
          pos: 0,
          end: 2,
          operator: SyntaxKind.ExclamationToken,
          operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 1, end: 2 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(typeof result?.operator).toBe('string')
    })
  })

  describe('skipTrivia additional', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('handles position beyond text length', () => {
      setRangeSourceText('hello')
      expect(skipTrivia(100)).toBe(100)
    })

    test('skips single-line comment at EOF without newline', () => {
      setRangeSourceText('// comment only')
      expect(skipTrivia(0)).toBe(15)
    })

    test('skips multiple single-line comments', () => {
      setRangeSourceText('// line1\n// line2\ncode')
      expect(skipTrivia(0)).toBe(18)
    })

    test('handles mixed spaces and tabs', () => {
      setRangeSourceText(' \t \t hello')
      expect(skipTrivia(0)).toBe(5)
    })

    test('skips multi-line comment spanning multiple lines', () => {
      setRangeSourceText('/* line1\nline2\nline3 */code')
      expect(skipTrivia(0)).toBe(23)
    })

    test('returns pos when already at non-whitespace non-comment', () => {
      setRangeSourceText('abc')
      expect(skipTrivia(0)).toBe(0)
    })

    test('skips carriage return newline combo', () => {
      setRangeSourceText('\r\nhello')
      expect(skipTrivia(0)).toBe(2)
    })
  })

  describe('convertOperatorToken additional', () => {
    test('converts AsteriskToken', () => {
      expect(convertOperatorToken(SyntaxKind.AsteriskToken)).toBe('*')
    })

    test('converts SlashToken', () => {
      expect(convertOperatorToken(SyntaxKind.SlashToken)).toBe('/')
    })

    test('converts PercentToken', () => {
      expect(convertOperatorToken(SyntaxKind.PercentToken)).toBe('%')
    })

    test('converts AmpersandAmpersandToken via number', () => {
      expect(convertOperatorToken(SyntaxKind.AmpersandAmpersandToken)).toBe('&&')
    })

    test('converts BarBarToken via number', () => {
      expect(convertOperatorToken(SyntaxKind.BarBarToken)).toBe('||')
    })

    test('handles object without type getText or operator', () => {
      const obj = { foo: 'bar' }
      expect(convertOperatorToken(obj)).toBe('[object Object]')
    })

    test('handles object with numeric type', () => {
      const obj = { type: 42 }
      expect(convertOperatorToken(obj)).toBe('[object Object]')
    })

    test('handles boolean true input', () => {
      expect(convertOperatorToken(true)).toBe('true')
    })

    test('handles boolean false input', () => {
      expect(convertOperatorToken(false)).toBe('false')
    })

    test('handles undefined input', () => {
      expect(convertOperatorToken(undefined)).toBe('undefined')
    })

    test('converts EqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.EqualsToken)).toBe('=')
    })

    test('converts ExclamationEqualsEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.ExclamationEqualsEqualsToken)).toBe('!==')
    })
  })

  describe('convertRawCompilerNode additional edge cases', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('depth exactly MAX_DEPTH returns null', () => {
      expect(convertRawCompilerNode({ kind: 1 }, MAX_DEPTH)).toBeNull()
    })

    test('depth below MAX_DEPTH does not return null', () => {
      const result = convertRawCompilerNode(
        { kind: SyntaxKind.Block, pos: 0, end: 2 },
        MAX_DEPTH - 1,
      )
      expect(result).not.toBeNull()
    })

    test('pos is number but end is not number - no range', () => {
      const node = { kind: SyntaxKind.Block, pos: 5, end: 'not-a-number' }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.range).toBeUndefined()
    })

    test('end is number but pos is not number - no range', () => {
      const node = { kind: SyntaxKind.Block, pos: 'not-a-number', end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.range).toBeUndefined()
    })

    test('StringLiteral without text property', () => {
      const node = { kind: SyntaxKind.StringLiteral, pos: 0, end: 7 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBeUndefined()
      expect(result?.type).toBe('Literal')
    })

    test('NumericLiteral without text property', () => {
      const node = { kind: SyntaxKind.NumericLiteral, pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBeUndefined()
    })

    test('Identifier without escapedText', () => {
      const node = { kind: SyntaxKind.Identifier, pos: 0, end: 3 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.name).toBeUndefined()
      expect(result?.value).toBeUndefined()
    })

    test('RegularExpressionLiteral with flags gimsuvy', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: '/pattern/gimsuvy',
        pos: 0,
        end: 15,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'pattern', flags: 'gimsuvy' })
    })

    test('RegularExpressionLiteral with unmatched pattern returns no regex', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: 'not-a-regex',
        pos: 0,
        end: 11,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toBeUndefined()
    })

    test('passes through number child values', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, count: 42 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.count).toBe(42)
    })

    test('passes through null child values', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, label: null }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.label).toBeNull()
    })

    test('passes through undefined child values', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, extra: undefined }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.extra).toBeUndefined()
    })

    test('skips keys in SKIP_KEYS (transformFlags)', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, transformFlags: 1 }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('transformFlags')
    })

    test('skips keys in SKIP_KEYS (parent)', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, parent: {} }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('parent')
    })

    test('skips keys in SKIP_KEYS (symbol)', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, symbol: {} }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('symbol')
    })

    test('operatorToken with unknown kind number', () => {
      const opToken = { kind: 99999 }
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: opToken,
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(typeof result?.operator).toBe('string')
    })

    test('caseBlock with empty clauses array', () => {
      const node = {
        kind: SyntaxKind.SwitchStatement,
        pos: 0,
        end: 10,
        caseBlock: { clauses: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.cases).toEqual([])
    })

    test('caseBlock with clauses without kind', () => {
      const node = {
        kind: SyntaxKind.SwitchStatement,
        pos: 0,
        end: 10,
        caseBlock: { clauses: [{ notKind: 1 }] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.cases).toEqual([])
    })

    test('caseBlock without clauses property', () => {
      const node = {
        kind: SyntaxKind.SwitchStatement,
        pos: 0,
        end: 10,
        caseBlock: { otherProp: 'value' },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.cases).toBeUndefined()
    })

    test('TemplateExpression with multiple templateSpans', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'a',
        rawText: 'a',
        pos: 0,
        end: 2,
      }
      const expr1 = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 3, end: 4 }
      const lit1 = { kind: SyntaxKind.TemplateTail, text: 'b', rawText: 'b', pos: 5, end: 7 }
      const expr2 = { kind: SyntaxKind.Identifier, escapedText: 'y', pos: 8, end: 9 }
      const lit2 = { kind: SyntaxKind.TemplateTail, text: 'c', rawText: 'c', pos: 10, end: 12 }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 12,
        head,
        templateSpans: [
          { expression: expr1, literal: lit1 },
          { expression: expr2, literal: lit2 },
        ],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      const expressions = result?.expressions as unknown[]
      expect(quasis).toHaveLength(3)
      expect(expressions).toHaveLength(2)
      expect(quasis[0]?.tail).toBe(false)
      expect(quasis[1]?.tail).toBe(false)
      expect(quasis[2]?.tail).toBe(true)
    })

    test('TemplateExpression without head', () => {
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 10,
        templateSpans: [],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as unknown[]
      const expressions = result?.expressions as unknown[]
      expect(quasis).toHaveLength(0)
      expect(expressions).toHaveLength(0)
    })

    test('TemplateExpression head without kind', () => {
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 10,
        head: { text: 'hello' },
        templateSpans: [],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as unknown[]
      expect(quasis).toHaveLength(0)
    })

    test('TemplateExpression span with expression without kind', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'a',
        rawText: 'a',
        pos: 0,
        end: 2,
      }
      const lit = { kind: SyntaxKind.TemplateTail, text: 'b', rawText: 'b', pos: 5, end: 7 }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 7,
        head,
        templateSpans: [{ expression: { notKind: 1 }, literal: lit }],
      }
      const result = convertRawCompilerNode(node, 0)
      const expressions = result?.expressions as unknown[]
      expect(expressions).toHaveLength(0)
    })

    test('TemplateExpression span with literal without kind', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'a',
        rawText: 'a',
        pos: 0,
        end: 2,
      }
      const expr = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 3, end: 4 }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 7,
        head,
        templateSpans: [{ expression: expr, literal: { text: 'b' } }],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as unknown[]
      expect(quasis).toHaveLength(1) // only head quasi
    })

    test('TemplateExpression quasi uses rawText fallback', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        rawText: 'raw-text',
        pos: 0,
        end: 8,
      }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 8,
        head,
        templateSpans: [],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      expect(quasis).toHaveLength(1)
      const val = quasis[0]?.value as Record<string, unknown>
      expect(val.raw).toBe('raw-text')
    })

    test('TemplateExpression quasi with pos and end creates range', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'hello',
        rawText: 'hello',
        pos: 10,
        end: 20,
      }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 20,
        head,
        templateSpans: [],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      expect(quasis[0]?.range).toEqual([10, 20])
    })

    test('TemplateExpression quasi without pos and end has no range', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'hello',
      }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 20,
        head,
        templateSpans: [],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      expect(quasis[0]?.range).toBeUndefined()
    })

    test('NoSubstitutionTemplateLiteral with rawText', () => {
      const node = {
        kind: SyntaxKind.NoSubstitutionTemplateLiteral,
        text: 'simple',
        rawText: 'raw-simple',
        pos: 0,
        end: 8,
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      expect(quasis).toHaveLength(1)
      const val = quasis[0]?.value as Record<string, unknown>
      expect(val.raw).toBe('raw-simple')
      expect(val.cooked).toBe('simple')
    })

    test('NoSubstitutionTemplateLiteral without rawText uses text', () => {
      const node = {
        kind: SyntaxKind.NoSubstitutionTemplateLiteral,
        text: 'simple',
        pos: 0,
        end: 8,
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      const val = quasis[0]?.value as Record<string, unknown>
      expect(val.raw).toBe('simple')
      expect(val.cooked).toBe('simple')
    })

    test('VariableDeclarationList with flags=3 sets kind=const (3&2)', () => {
      const node = {
        kind: SyntaxKind.VariableDeclarationList,
        pos: 0,
        end: 10,
        flags: 3,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.kind).toBe('const')
    })

    test('VariableDeclarationList with flags=0 sets kind=var', () => {
      const node = {
        kind: SyntaxKind.VariableDeclarationList,
        pos: 0,
        end: 10,
        flags: 0,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.kind).toBeUndefined()
    })

    test('VariableDeclarationList with declarationList flags=0 sets kind=var', () => {
      const node = {
        kind: SyntaxKind.VariableDeclarationList,
        pos: 0,
        end: 10,
        declarationList: { flags: 0 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.kind).toBe('var')
    })

    test('VariableDeclarationList without flags or declarationList', () => {
      const node = {
        kind: SyntaxKind.VariableDeclarationList,
        pos: 0,
        end: 10,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.kind).toBeUndefined()
    })

    test('array with mixed kind and non-kind items', () => {
      const child = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 }
      const node = {
        kind: SyntaxKind.ArrayLiteralExpression,
        pos: 0,
        end: 10,
        elements: [child, 'plain-string', 42],
      }
      const result = convertRawCompilerNode(node, 0)
      const elements = result?.elements as unknown[]
      expect(elements).toHaveLength(3)
      expect((elements[0] as Record<string, unknown>)?.type).toBe('Identifier')
      expect(elements[1]).toBe('plain-string')
      expect(elements[2]).toBe(42)
    })

    test('variableDeclaration without kind number is ignored', () => {
      const varDecl = {
        name: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 },
      }
      const node = {
        kind: SyntaxKind.CatchClause,
        pos: 0,
        end: 10,
        variableDeclaration: varDecl,
      }
      const result = convertRawCompilerNode(node, 0)
      // variableDeclaration without kind number falls through to the generic object handler
      // which checks for kind === 'number', so it falls to else branch
      expect(result).toBeDefined()
    })

    test('nested children are recursively converted', () => {
      const inner = {
        kind: SyntaxKind.StringLiteral,
        text: 'deep',
        pos: 0,
        end: 6,
      }
      const mid = {
        kind: SyntaxKind.ReturnStatement,
        pos: 0,
        end: 10,
        expression: inner,
      }
      const outer = {
        kind: SyntaxKind.Block,
        pos: 0,
        end: 20,
        statements: [mid],
      }
      const result = convertRawCompilerNode(outer, 0)
      const body = result?.body as Array<Record<string, unknown>>
      expect(body).toHaveLength(1)
      const returnStmt = body[0] as Record<string, unknown>
      expect(returnStmt.type).toBe('ReturnStatement')
      const arg = returnStmt.argument as Record<string, unknown>
      expect(arg.type).toBe('Literal')
      expect(arg.value).toBe('deep')
    })

    test('object without kind but with other properties passes through', () => {
      const node = {
        kind: SyntaxKind.Block,
        pos: 0,
        end: 2,
        extra: { notKind: true, value: 'test' },
      }
      const result = convertRawCompilerNode(node, 0)
      // Object without kind number - not array, not handled specially
      // It doesn't match any of the conversion branches, so extra is not set
      expect(result?.extra).toBeUndefined()
    })

    test('maps condition to test via KIND_SPECIFIC_MAP for IfStatement', () => {
      const node = {
        kind: SyntaxKind.IfStatement,
        pos: 0,
        end: 20,
        expression: { kind: SyntaxKind.TrueKeyword, pos: 3, end: 7 },
        thenStatement: { kind: SyntaxKind.Block, pos: 8, end: 15, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.test).toBeDefined()
      expect(result?.consequent).toBeDefined()
    })

    test('PrefixUnaryExpression with non-plus-minus stays UnaryExpression with prefix:true', () => {
      const node = {
        kind: SyntaxKind.PrefixUnaryExpression,
        pos: 0,
        end: 2,
        operator: '~',
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 1, end: 2 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('UnaryExpression')
      expect(result?.prefix).toBe(true)
    })
  })

  describe('convertCompilerNode additional edge cases', () => {
    function createMockNode(
      overrides: {
        kindName?: string
        text?: string
        start?: number
        end?: number
        compilerNode?: Record<string, unknown>
      } = {},
    ): Node {
      const mockCompilerNode: Record<string, unknown> = overrides.compilerNode ?? {
        pos: overrides.start ?? 0,
        end: overrides.end ?? 10,
      }
      return {
        getKindName: () => overrides.kindName ?? 'StringLiteral',
        getText: () => overrides.text ?? '"hello"',
        getStart: () => overrides.start ?? 0,
        getEnd: () => overrides.end ?? 10,
        getSourceFile: () => ({
          getFilePath: () => '/test/file.ts',
          getFullText: () => overrides.text ?? '"hello"',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        compilerNode: mockCompilerNode,
      } as unknown as Node
    }

    beforeEach(() => {
      setRangeSourceText('')
    })

    test('depth below MAX_DEPTH works normally', () => {
      const node = createMockNode({ kindName: 'Block' })
      const result = convertCompilerNode(node, MAX_DEPTH - 1)
      expect(result).not.toBeNull()
    })

    test('compilerNode without pos/end has no range', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: {},
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.range).toBeUndefined()
      expect(result?.start).toBeUndefined()
      expect(result?.end).toBeUndefined()
    })

    test('compilerNode with pos only has no range', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 5 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.range).toBeUndefined()
    })

    test('compilerNode with end only has no range', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { end: 15 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.range).toBeUndefined()
    })

    test('StringLiteral with single quotes', () => {
      const node = createMockNode({
        kindName: 'StringLiteral',
        text: "'hello'",
        compilerNode: { pos: 0, end: 7 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.value).toBe('hello')
      expect(result?.raw).toBe("'hello'")
    })

    test('RegularExpressionLiteral without flags', () => {
      const node = createMockNode({
        kindName: 'RegularExpressionLiteral',
        text: '/test/',
        compilerNode: { pos: 0, end: 6 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'test', flags: '' })
    })

    test('RegularExpressionLiteral with complex pattern', () => {
      const node = createMockNode({
        kindName: 'RegularExpressionLiteral',
        text: '/\\d+/gi',
        compilerNode: { pos: 0, end: 7 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: '\\d+', flags: 'gi' })
    })

    test('RegularExpressionLiteral without matching pattern', () => {
      const node = createMockNode({
        kindName: 'RegularExpressionLiteral',
        text: 'not-a-regex',
        compilerNode: { pos: 0, end: 11 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.regex).toBeUndefined()
      expect(result?.raw).toBe('not-a-regex')
    })

    test('skips underscore keys in compilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, _brand: 'test' },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('_brand')
    })

    test('skips SKIP_KEYS in compilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, flags: 3 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('flags')
    })

    test('passes through string values in compilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, label: 'my-label' },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.label).toBe('my-label')
    })

    test('passes through number values in compilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, count: 42 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.count).toBe(42)
    })

    test('passes through boolean values in compilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, isActive: true },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.isActive).toBe(true)
    })

    test('passes through null values in compilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, extra: null },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.extra).toBeNull()
    })

    test('passes through undefined values in compilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, extra: undefined },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.extra).toBeUndefined()
    })

    test('caseBlock handling in convertCompilerNode', () => {
      const clause = {
        kind: SyntaxKind.CaseClause,
        pos: 0,
        end: 5,
        expression: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 0, end: 1 },
      }
      const node = createMockNode({
        kindName: 'SwitchStatement',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 7, end: 8 },
          caseBlock: { clauses: [clause] },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.cases).toBeDefined()
      expect(Array.isArray(result?.cases)).toBe(true)
    })

    test('operatorToken handling in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.PlusToken },
          right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.operator).toBe('+')
    })

    test('variableDeclaration with object name in convertCompilerNode', () => {
      const varDecl = {
        kind: SyntaxKind.VariableDeclaration,
        name: { kind: SyntaxKind.Identifier, escapedText: 'e', pos: 4, end: 5 },
        pos: 0,
        end: 10,
      }
      const node = createMockNode({
        kindName: 'CatchClause',
        compilerNode: {
          pos: 0,
          end: 10,
          variableDeclaration: varDecl,
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.param).toBeDefined()
    })

    test('variableDeclaration with non-object name yields null in convertCompilerNode', () => {
      const varDecl = {
        kind: SyntaxKind.VariableDeclaration,
        name: 'not-an-object',
        pos: 0,
        end: 10,
      }
      const node = createMockNode({
        kindName: 'CatchClause',
        compilerNode: {
          pos: 0,
          end: 10,
          variableDeclaration: varDecl,
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.param).toBeNull()
    })

    test('OmittedExpression in array becomes null in convertCompilerNode', () => {
      const child = { kind: SyntaxKind.OmittedExpression, pos: 0, end: 0 }
      const node = createMockNode({
        kindName: 'ArrayLiteralExpression',
        compilerNode: { pos: 0, end: 5, elements: [child] },
      })
      const result = convertCompilerNode(node, 0)
      const elements = result?.elements as unknown[]
      expect(elements[0]).toBeNull()
    })

    test('BinaryExpression with non-assignment non-logical stays BinaryExpression', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.PlusToken },
          right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('BinaryExpression')
    })

    test('PrefixUnaryExpression with string ++ becomes UpdateExpression', () => {
      const node = createMockNode({
        kindName: 'PrefixUnaryExpression',
        compilerNode: {
          pos: 0,
          end: 3,
          operator: '++',
          operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 2, end: 3 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('UpdateExpression')
      expect(result?.prefix).toBe(true)
    })

    test('PrefixUnaryExpression with string -- becomes UpdateExpression', () => {
      const node = createMockNode({
        kindName: 'PrefixUnaryExpression',
        compilerNode: {
          pos: 0,
          end: 3,
          operator: '--',
          operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 2, end: 3 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('UpdateExpression')
      expect(result?.prefix).toBe(true)
    })

    test('PrefixUnaryExpression with non-plus-minus string stays UnaryExpression with prefix:true', () => {
      const node = createMockNode({
        kindName: 'PrefixUnaryExpression',
        compilerNode: {
          pos: 0,
          end: 2,
          operator: '~',
          operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 1, end: 2 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('UnaryExpression')
      expect(result?.prefix).toBe(true)
    })

    test('VariableDeclarationList with var flags (0) in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
          flags: 0,
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBeUndefined()
    })

    test('VariableDeclarationList with declarationList flags=0 sets var in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
          declarationList: { flags: 0 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBe('var')
    })

    test('VariableDeclarationList with declarationList flags=1 sets let in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
          declarationList: { flags: 1 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBe('let')
    })

    test('VariableDeclarationList without any flags has no kind in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBeUndefined()
    })

    test('converts array items without kind as-is', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, decorators: ['plain-string'] },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.decorators).toEqual(['plain-string'])
    })

    test('converts nested children recursively in convertCompilerNode', () => {
      const inner = {
        kind: SyntaxKind.StringLiteral,
        text: 'deep',
        pos: 0,
        end: 6,
      }
      const mid = {
        kind: SyntaxKind.ReturnStatement,
        pos: 0,
        end: 10,
        expression: inner,
      }
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: {
          pos: 0,
          end: 20,
          statements: [mid],
        },
      })
      const result = convertCompilerNode(node, 0)
      const body = result?.body as Array<Record<string, unknown>>
      expect(body).toHaveLength(1)
      const returnStmt = body[0] as Record<string, unknown>
      expect(returnStmt.type).toBe('ReturnStatement')
    })
  })

  describe('convertRawCompilerNode assignment operator variations', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('BinaryExpression with PlusEqualsToken becomes AssignmentExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.PlusEqualsToken },
        right: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('+=')
    })

    test('BinaryExpression with MinusEqualsToken becomes AssignmentExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.MinusEqualsToken },
        right: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('-=')
    })

    test('BinaryExpression with AsteriskEqualsToken becomes AssignmentExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.AsteriskEqualsToken },
        right: { kind: SyntaxKind.NumericLiteral, text: '2', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('*=')
    })

    test('BinaryExpression with SlashEqualsToken becomes AssignmentExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.SlashEqualsToken },
        right: { kind: SyntaxKind.NumericLiteral, text: '2', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('/=')
    })

    test('BinaryExpression with BarBarToken becomes LogicalExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 7,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.BarBarToken },
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('LogicalExpression')
      expect(result?.operator).toBe('||')
    })

    test('BinaryExpression with QuestionQuestionToken becomes LogicalExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 7,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.QuestionQuestionToken },
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('LogicalExpression')
      expect(result?.operator).toBe('??')
    })

    test('BinaryExpression with PercentEqualsToken becomes AssignmentExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.PercentEqualsToken },
        right: { kind: SyntaxKind.NumericLiteral, text: '3', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('%=')
    })

    test('BinaryExpression with AsteriskAsteriskEqualsToken becomes AssignmentExpression', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 5,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.AsteriskAsteriskEqualsToken },
        right: { kind: SyntaxKind.NumericLiteral, text: '2', pos: 4, end: 5 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('**=')
    })
  })

  describe('convertRawCompilerNode KIND_NAME_ALIASES coverage', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('ObjectLiteralExpression maps to ObjectExpression', () => {
      const node = { kind: SyntaxKind.ObjectLiteralExpression, pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ObjectExpression')
    })

    test('ArrayLiteralExpression maps to ArrayExpression', () => {
      const node = { kind: SyntaxKind.ArrayLiteralExpression, pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ArrayExpression')
    })

    test('ArrowFunction maps to ArrowFunctionExpression', () => {
      const node = { kind: SyntaxKind.ArrowFunction, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ArrowFunctionExpression')
    })

    test('PropertyAccessExpression maps to MemberExpression', () => {
      const node = { kind: SyntaxKind.PropertyAccessExpression, pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('MemberExpression')
    })

    test('ElementAccessExpression maps to MemberExpression', () => {
      const node = { kind: SyntaxKind.ElementAccessExpression, pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('MemberExpression')
    })

    test('FunctionDeclaration maps to FunctionDeclaration', () => {
      const node = { kind: SyntaxKind.FunctionDeclaration, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('FunctionDeclaration')
    })

    test('ClassDeclaration maps to ClassDeclaration', () => {
      const node = { kind: SyntaxKind.ClassDeclaration, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ClassDeclaration')
    })

    test('CatchClause maps to CatchClause', () => {
      const node = { kind: SyntaxKind.CatchClause, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('CatchClause')
    })

    test('CaseClause maps to SwitchCase', () => {
      const node = { kind: SyntaxKind.CaseClause, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('SwitchCase')
    })

    test('DefaultClause maps to SwitchCase', () => {
      const node = { kind: SyntaxKind.DefaultClause, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('SwitchCase')
    })

    test('ReturnStatement maps to ReturnStatement', () => {
      const node = { kind: SyntaxKind.ReturnStatement, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ReturnStatement')
    })

    test('ThrowStatement maps to ThrowStatement', () => {
      const node = { kind: SyntaxKind.ThrowStatement, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ThrowStatement')
    })

    test('TemplateExpression maps to TemplateLiteral', () => {
      const node = { kind: SyntaxKind.TemplateExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('TemplateLiteral')
    })

    test('NoSubstitutionTemplateLiteral maps to TemplateLiteral', () => {
      const node = { kind: SyntaxKind.NoSubstitutionTemplateLiteral, text: 'hello', pos: 0, end: 7 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('TemplateLiteral')
    })

    test('AwaitExpression maps to AwaitExpression', () => {
      const node = { kind: SyntaxKind.AwaitExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('AwaitExpression')
    })

    test('SpreadElement maps to SpreadElement', () => {
      const node = { kind: SyntaxKind.SpreadElement, pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('SpreadElement')
    })

    test('VariableStatement maps to VariableDeclaration', () => {
      const node = { kind: SyntaxKind.VariableStatement, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('VariableDeclaration')
    })

    test('PostfixUnaryExpression maps to UpdateExpression', () => {
      const node = {
        kind: SyntaxKind.PostfixUnaryExpression,
        pos: 0,
        end: 3,
        operator: SyntaxKind.PlusPlusToken,
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('UpdateExpression')
    })
  })

  describe('convertRawCompilerNode SKIP_KEYS comprehensive', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('skips original key', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, original: {} }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('original')
    })

    test('skips jlChildren key', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, jlChildren: [] }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('jlChildren')
    })

    test('skips locals key', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, locals: {} }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('locals')
    })

    test('skips nextContainer key', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, nextContainer: {} }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('nextContainer')
    })

    test('skips modifierFlagsCache key', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, modifierFlagsCache: 0 }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('modifierFlagsCache')
    })

    test('skips id key', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2, id: 42 }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toHaveProperty('id')
    })
  })

  describe('convertRawCompilerNode KIND_SPECIFIC_MAP mappings', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('ForStatement maps initializer to init', () => {
      const node = {
        kind: SyntaxKind.ForStatement,
        pos: 0,
        end: 30,
        initializer: { kind: SyntaxKind.VariableDeclarationList, pos: 5, end: 15, flags: 1 },
        condition: { kind: SyntaxKind.Identifier, escapedText: 'i', pos: 16, end: 17 },
        incrementor: { kind: SyntaxKind.Identifier, escapedText: 'i', pos: 18, end: 19 },
        statement: { kind: SyntaxKind.Block, pos: 20, end: 30, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.init).toBeDefined()
      expect(result?.test).toBeDefined()
      expect(result?.update).toBeDefined()
      expect(result?.body).toBeDefined()
    })

    test('WhileStatement maps expression to test and statement to body', () => {
      const node = {
        kind: SyntaxKind.WhileStatement,
        pos: 0,
        end: 20,
        expression: { kind: SyntaxKind.TrueKeyword, pos: 7, end: 11 },
        statement: { kind: SyntaxKind.Block, pos: 12, end: 20, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.test).toBeDefined()
      expect(result?.body).toBeDefined()
    })

    test('DoStatement maps expression to test and statement to body', () => {
      const node = {
        kind: SyntaxKind.DoStatement,
        pos: 0,
        end: 20,
        expression: { kind: SyntaxKind.TrueKeyword, pos: 10, end: 14 },
        statement: { kind: SyntaxKind.Block, pos: 2, end: 9, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.test).toBeDefined()
      expect(result?.body).toBeDefined()
    })

    test('TryStatement maps tryBlock to block and catchClause to handler', () => {
      const node = {
        kind: SyntaxKind.TryStatement,
        pos: 0,
        end: 30,
        tryBlock: { kind: SyntaxKind.Block, pos: 4, end: 15, statements: [] },
        catchClause: {
          kind: SyntaxKind.CatchClause,
          pos: 16,
          end: 30,
        },
        finallyBlock: { kind: SyntaxKind.Block, pos: 31, end: 40, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.block).toBeDefined()
      expect(result?.handler).toBeDefined()
      expect(result?.finalizer).toBeDefined()
    })

    test('PropertyAccessExpression maps expression to object and name to property', () => {
      const node = {
        kind: SyntaxKind.PropertyAccessExpression,
        pos: 0,
        end: 5,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'obj', pos: 0, end: 3 },
        name: { kind: SyntaxKind.Identifier, escapedText: 'prop', pos: 4, end: 8 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.object).toBeDefined()
      expect(result?.property).toBeDefined()
    })

    test('CallExpression maps expression to callee', () => {
      const node = {
        kind: SyntaxKind.CallExpression,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'fn', pos: 0, end: 2 },
        arguments: [],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.callee).toBeDefined()
    })

    test('ThrowStatement maps expression to argument', () => {
      const node = {
        kind: SyntaxKind.ThrowStatement,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'err', pos: 6, end: 9 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('ReturnStatement maps expression to argument', () => {
      const node = {
        kind: SyntaxKind.ReturnStatement,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 7, end: 8 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('SpreadElement maps expression to argument', () => {
      const node = {
        kind: SyntaxKind.SpreadElement,
        pos: 0,
        end: 5,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'arr', pos: 3, end: 6 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('ForInStatement maps expression to right and initializer to left', () => {
      const node = {
        kind: SyntaxKind.ForInStatement,
        pos: 0,
        end: 20,
        initializer: { kind: SyntaxKind.Identifier, escapedText: 'key', pos: 5, end: 8 },
        expression: { kind: SyntaxKind.Identifier, escapedText: 'obj', pos: 12, end: 15 },
        statement: { kind: SyntaxKind.Block, pos: 16, end: 20, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.left).toBeDefined()
      expect(result?.right).toBeDefined()
      expect(result?.body).toBeDefined()
    })

    test('ForOfStatement maps expression to right and initializer to left', () => {
      const node = {
        kind: SyntaxKind.ForOfStatement,
        pos: 0,
        end: 20,
        initializer: { kind: SyntaxKind.Identifier, escapedText: 'item', pos: 5, end: 9 },
        expression: { kind: SyntaxKind.Identifier, escapedText: 'arr', pos: 13, end: 16 },
        statement: { kind: SyntaxKind.Block, pos: 17, end: 20, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.left).toBeDefined()
      expect(result?.right).toBeDefined()
    })
  })

  describe('convertRawCompilerNode additional literal edge cases', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('NumericLiteral with decimal value', () => {
      const node = { kind: SyntaxKind.NumericLiteral, text: '3.14', pos: 0, end: 4 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBe(3.14)
      expect(result?.raw).toBe('3.14')
    })

    test('NumericLiteral with negative value text', () => {
      const node = { kind: SyntaxKind.NumericLiteral, text: '42', pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBe(42)
    })

    test('BigIntLiteral with large number', () => {
      const node = { kind: SyntaxKind.BigIntLiteral, text: '9999999999n', pos: 0, end: 12 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.raw).toBe('9999999999n')
      expect(result?.value).toBeNaN()
    })

    test('StringLiteral with empty string', () => {
      const node = { kind: SyntaxKind.StringLiteral, text: '', pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.value).toBe('')
      expect(result?.type).toBe('Literal')
    })

    test('StringLiteral raw is overwritten by PROPERTY_MAP text→raw', () => {
      const node = { kind: SyntaxKind.StringLiteral, text: 'hello', pos: 0, end: 7 }
      const result = convertRawCompilerNode(node, 0)
      // PROPERTY_MAP maps text→raw, so raw becomes the original text value
      expect(result?.raw).toBe('hello')
      expect(result?.value).toBe('hello')
    })

    test('RegularExpressionLiteral with only flags g', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: '/test/g',
        pos: 0,
        end: 7,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'test', flags: 'g' })
    })

    test('RegularExpressionLiteral with all standard flags', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: '/abc/gimsy',
        pos: 0,
        end: 10,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'abc', flags: 'gimsy' })
    })

    test('RegularExpressionLiteral without text property', () => {
      const node = { kind: SyntaxKind.RegularExpressionLiteral, pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.raw).toBeUndefined()
      expect(result?.regex).toBeUndefined()
    })
  })

  describe('convertRawCompilerNode PostfixUnaryExpression edge cases', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('PostfixUnaryExpression with -- operator', () => {
      const node = {
        kind: SyntaxKind.PostfixUnaryExpression,
        pos: 0,
        end: 3,
        operator: SyntaxKind.MinusMinusToken,
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.prefix).toBe(false)
      expect(result?.type).toBe('UpdateExpression')
    })
  })

  describe('convertCompilerNode assignment and logical operator variations', () => {
    function createMockNode(
      overrides: {
        kindName?: string
        text?: string
        start?: number
        end?: number
        compilerNode?: Record<string, unknown>
      } = {},
    ): Node {
      const mockCompilerNode: Record<string, unknown> = overrides.compilerNode ?? {
        pos: overrides.start ?? 0,
        end: overrides.end ?? 10,
      }
      return {
        getKindName: () => overrides.kindName ?? 'StringLiteral',
        getText: () => overrides.text ?? '"hello"',
        getStart: () => overrides.start ?? 0,
        getEnd: () => overrides.end ?? 10,
        getSourceFile: () => ({
          getFilePath: () => '/test/file.ts',
          getFullText: () => overrides.text ?? '"hello"',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        compilerNode: mockCompilerNode,
      } as unknown as Node
    }

    beforeEach(() => {
      setRangeSourceText('')
    })

    test('BinaryExpression with PlusEqualsToken becomes AssignmentExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.PlusEqualsToken },
          right: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('+=')
    })

    test('BinaryExpression with BarBarToken becomes LogicalExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 7,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.BarBarToken },
          right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('LogicalExpression')
      expect(result?.operator).toBe('||')
    })

    test('BinaryExpression with QuestionQuestionToken becomes LogicalExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 7,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.QuestionQuestionToken },
          right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('LogicalExpression')
      expect(result?.operator).toBe('??')
    })

    test('VariableDeclarationList with flags=3 sets const in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
          flags: 3,
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBe('const')
    })

    test('VariableDeclarationList with declarationList flags=2 sets const in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'VariableDeclarationList',
        compilerNode: {
          pos: 0,
          end: 10,
          declarationList: { flags: 2 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.kind).toBe('const')
    })

    test('NumericLiteral with decimal in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'NumericLiteral',
        text: '2.718',
        compilerNode: { pos: 0, end: 5 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.value).toBe(2.718)
      expect(result?.raw).toBe('2.718')
    })

    test('caseBlock with empty clauses in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'SwitchStatement',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 7, end: 8 },
          caseBlock: { clauses: [] },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.cases).toEqual([])
    })

    test('caseBlock without clauses property in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'SwitchStatement',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 7, end: 8 },
          caseBlock: { otherProp: 'value' },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.cases).toBeUndefined()
    })

    test('operatorToken with unknown kind in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: 99999 },
          right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(typeof result?.operator).toBe('string')
    })

    test('converts array with mixed items in convertCompilerNode', () => {
      const child = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 }
      const node = createMockNode({
        kindName: 'ArrayLiteralExpression',
        compilerNode: { pos: 0, end: 10, elements: [child, 'str', 42] },
      })
      const result = convertCompilerNode(node, 0)
      const elements = result?.elements as unknown[]
      expect(elements).toHaveLength(3)
      expect((elements[0] as Record<string, unknown>)?.type).toBe('Identifier')
      expect(elements[1]).toBe('str')
      expect(elements[2]).toBe(42)
    })

    test('depth exactly MAX_DEPTH returns null in convertCompilerNode', () => {
      const node = createMockNode({ kindName: 'Block' })
      expect(convertCompilerNode(node, MAX_DEPTH)).toBeNull()
    })

    test('skips SKIP_KEYS (modifierFlagsCache) in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, modifierFlagsCache: 0 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('modifierFlagsCache')
    })

    test('skips SKIP_KEYS (transformFlags) in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, transformFlags: 1 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('transformFlags')
    })
  })

  describe('convertOperatorToken additional token types', () => {
    test('converts LessThanToken', () => {
      expect(convertOperatorToken(SyntaxKind.LessThanToken)).toBe('<')
    })

    test('converts GreaterThanToken', () => {
      expect(convertOperatorToken(SyntaxKind.GreaterThanToken)).toBe('>')
    })

    test('converts LessThanEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.LessThanEqualsToken)).toBe('<=')
    })

    test('converts GreaterThanEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.GreaterThanEqualsToken)).toBe('>=')
    })

    test('converts EqualsEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.EqualsEqualsToken)).toBe('==')
    })

    test('converts EqualsEqualsEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.EqualsEqualsEqualsToken)).toBe('===')
    })

    test('converts ExclamationEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.ExclamationEqualsToken)).toBe('!=')
    })

    test('converts AmpersandToken', () => {
      expect(convertOperatorToken(SyntaxKind.AmpersandToken)).toBe('&')
    })

    test('converts BarToken', () => {
      expect(convertOperatorToken(SyntaxKind.BarToken)).toBe('|')
    })

    test('converts CaretToken', () => {
      expect(convertOperatorToken(SyntaxKind.CaretToken)).toBe('^')
    })

    test('converts LessThanLessThanToken', () => {
      expect(convertOperatorToken(SyntaxKind.LessThanLessThanToken)).toBe('<<')
    })

    test('converts GreaterThanGreaterThanToken', () => {
      expect(convertOperatorToken(SyntaxKind.GreaterThanGreaterThanToken)).toBe('>>')
    })

    test('converts GreaterThanGreaterThanGreaterThanToken', () => {
      expect(convertOperatorToken(SyntaxKind.GreaterThanGreaterThanGreaterThanToken)).toBe('>>>')
    })

    test('converts TildeToken', () => {
      expect(convertOperatorToken(SyntaxKind.TildeToken)).toBe('~')
    })

    test('converts CommaToken', () => {
      expect(convertOperatorToken(SyntaxKind.CommaToken)).toBe(',')
    })

    test('converts ColonToken', () => {
      expect(convertOperatorToken(SyntaxKind.ColonToken)).toBe(':')
    })

    test('converts SemicolonToken', () => {
      expect(convertOperatorToken(SyntaxKind.SemicolonToken)).toBe(';')
    })

    test('converts DotToken', () => {
      expect(convertOperatorToken(SyntaxKind.DotToken)).toBe('.')
    })

    test('converts QuestionDotToken', () => {
      expect(convertOperatorToken(SyntaxKind.QuestionDotToken)).toBe('?.')
    })

    test('converts DotDotDotToken', () => {
      expect(convertOperatorToken(SyntaxKind.DotDotDotToken)).toBe('...')
    })

    test('converts arrow-like token via object type', () => {
      const obj = { type: 'ArrowToken' }
      expect(convertOperatorToken(obj)).toBe('=>')
    })

    test('converts AmpersandEqualsToken via number', () => {
      expect(convertOperatorToken(SyntaxKind.AmpersandEqualsToken)).toBe('&=')
    })

    test('converts BarEqualsToken via number', () => {
      expect(convertOperatorToken(SyntaxKind.BarEqualsToken)).toBe('|=')
    })

    test('converts CaretEqualsToken via number', () => {
      expect(convertOperatorToken(SyntaxKind.CaretEqualsToken)).toBe('^=')
    })

    test('converts LessThanLessThanEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.LessThanLessThanEqualsToken)).toBe('<<=')
    })

    test('converts GreaterThanGreaterThanEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.GreaterThanGreaterThanEqualsToken)).toBe('>>=')
    })

    test('converts GreaterThanGreaterThanGreaterThanEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken)).toBe(
        '>>>=',
      )
    })

    test('converts AmpersandAmpersandEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.AmpersandAmpersandEqualsToken)).toBe('&&=')
    })

    test('converts BarBarEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.BarBarEqualsToken)).toBe('||=')
    })

    test('converts QuestionQuestionEqualsToken', () => {
      expect(convertOperatorToken(SyntaxKind.QuestionQuestionEqualsToken)).toBe('??=')
    })

    test('converts InKeyword', () => {
      expect(convertOperatorToken(SyntaxKind.InKeyword as number)).toBe('in')
    })

    test('converts InstanceOfKeyword', () => {
      expect(convertOperatorToken(SyntaxKind.InstanceOfKeyword as number)).toBe('instanceof')
    })

    test('object with type EqualsEqualsToken maps correctly', () => {
      const obj = { type: 'EqualsEqualsToken' }
      expect(convertOperatorToken(obj)).toBe('==')
    })

    test('object with type ExclamationEqualsEqualsToken maps correctly', () => {
      const obj = { type: 'ExclamationEqualsEqualsToken' }
      expect(convertOperatorToken(obj)).toBe('!==')
    })

    test('object with type property takes precedence over operator property', () => {
      const obj = { type: 'AmpersandAmpersandToken', operator: 'ignored' }
      expect(convertOperatorToken(obj)).toBe('&&')
    })

    test('object with getText takes precedence over operator', () => {
      const obj = { getText: () => 'getText-result', operator: 'ignored' }
      expect(convertOperatorToken(obj)).toBe('getText-result')
    })

    test('object with unmapped type string falls through to getText', () => {
      const obj = { type: 'SomeUnknownTokenType', getText: () => 'fallback' }
      expect(convertOperatorToken(obj)).toBe('fallback')
    })
  })

  describe('skipTrivia edge cases', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('handles position at exact end of text', () => {
      setRangeSourceText('hello')
      expect(skipTrivia(5)).toBe(5)
    })

    test('skips whitespace after single-line comment', () => {
      setRangeSourceText('// comment\n   code')
      expect(skipTrivia(0)).toBe(14)
    })

    test('skips whitespace after multi-line comment', () => {
      setRangeSourceText('/* c */  code')
      expect(skipTrivia(0)).toBe(9)
    })

    test('skips comment at non-zero position with preceding non-trivia', () => {
      setRangeSourceText('x  /* c */y')
      expect(skipTrivia(1)).toBe(10)
    })

    test('skips multi-line comment with asterisks inside', () => {
      setRangeSourceText('/* a * b */code')
      expect(skipTrivia(0)).toBe(11)
    })

    test('handles single character between positions', () => {
      setRangeSourceText(' a')
      expect(skipTrivia(0)).toBe(1)
    })

    test('skips multiple multi-line comments in sequence', () => {
      setRangeSourceText('/* a *//* b */code')
      expect(skipTrivia(0)).toBe(14)
    })
  })

  describe('convertRawCompilerNode additional KIND_NAME_ALIASES', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('FunctionExpression maps to FunctionExpression', () => {
      const node = { kind: SyntaxKind.FunctionExpression, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('FunctionExpression')
    })

    test('ConditionalExpression maps to ConditionalExpression', () => {
      const node = { kind: SyntaxKind.ConditionalExpression, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ConditionalExpression')
    })

    test('ExpressionStatement maps to ExpressionStatement', () => {
      const node = { kind: SyntaxKind.ExpressionStatement, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ExpressionStatement')
    })

    test('ImportDeclaration maps to ImportDeclaration', () => {
      const node = { kind: SyntaxKind.ImportDeclaration, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ImportDeclaration')
    })

    test('EnumDeclaration maps to TSEnumDeclaration', () => {
      const node = { kind: SyntaxKind.EnumDeclaration, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('TSEnumDeclaration')
    })

    test('InterfaceDeclaration maps to TSInterfaceDeclaration', () => {
      const node = { kind: SyntaxKind.InterfaceDeclaration, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('TSInterfaceDeclaration')
    })

    test('TypeReference maps to TSTypeReference', () => {
      const node = { kind: SyntaxKind.TypeReference, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('TSTypeReference')
    })

    test('ClassExpression maps to ClassExpression', () => {
      const node = { kind: SyntaxKind.ClassExpression, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ClassExpression')
    })

    test('DeleteExpression maps to UnaryExpression', () => {
      const node = { kind: SyntaxKind.DeleteExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('UnaryExpression')
    })

    test('VoidExpression maps to UnaryExpression', () => {
      const node = { kind: SyntaxKind.VoidExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('UnaryExpression')
    })

    test('TypeOfExpression maps to UnaryExpression', () => {
      const node = { kind: SyntaxKind.TypeOfExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('UnaryExpression')
    })

    test('ParenthesizedExpression is unwrapped to inner expression', () => {
      const node = { kind: SyntaxKind.ParenthesizedExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ParenthesizedExpression')
    })

    test('SuperKeyword maps to Super', () => {
      const node = { kind: SyntaxKind.SuperKeyword, pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('Super')
    })

    test('ThisKeyword maps to ThisExpression', () => {
      const node = { kind: SyntaxKind.ThisKeyword, pos: 0, end: 4 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ThisExpression')
    })

    test('BreakStatement maps to BreakStatement', () => {
      const node = { kind: SyntaxKind.BreakStatement, pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('BreakStatement')
    })

    test('ContinueStatement maps to ContinueStatement', () => {
      const node = { kind: SyntaxKind.ContinueStatement, pos: 0, end: 9 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ContinueStatement')
    })

    test('DebuggerStatement maps to DebuggerStatement', () => {
      const node = { kind: SyntaxKind.DebuggerStatement, pos: 0, end: 8 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('DebuggerStatement')
    })

    test('LabeledStatement maps to LabeledStatement', () => {
      const node = { kind: SyntaxKind.LabeledStatement, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('LabeledStatement')
    })

    test('NewExpression maps to NewExpression', () => {
      const node = { kind: SyntaxKind.NewExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('NewExpression')
    })

    test('YieldExpression maps to YieldExpression', () => {
      const node = { kind: SyntaxKind.YieldExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('YieldExpression')
    })

    test('YieldExpression asteriskToken maps to delegate', () => {
      const node = {
        kind: SyntaxKind.YieldExpression,
        pos: 0,
        end: 15,
        asteriskToken: { kind: SyntaxKind.AsteriskToken, pos: 6, end: 7 },
        expression: { kind: SyntaxKind.Identifier, pos: 8, end: 15, escapedText: 'iter' },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('YieldExpression')
      expect(result?.delegate).toBe(true)
      expect(result?.generator).toBeUndefined()
    })

    test('FunctionDeclaration asteriskToken maps to generator', () => {
      const node = {
        kind: SyntaxKind.FunctionDeclaration,
        pos: 0,
        end: 20,
        name: { kind: SyntaxKind.Identifier, pos: 9, end: 12, escapedText: 'gen' },
        asteriskToken: { kind: SyntaxKind.AsteriskToken, pos: 8, end: 9 },
        parameters: [],
        body: { kind: SyntaxKind.Block, pos: 14, end: 20, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('FunctionDeclaration')
      expect(result?.generator).toBe(true)
      expect(result?.delegate).toBeUndefined()
    })

    test('AsExpression maps to TSAsExpression', () => {
      const node = { kind: SyntaxKind.AsExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('TSAsExpression')
    })

    test('ImportDeclaration maps to ImportDeclaration', () => {
      const node = { kind: SyntaxKind.ImportDeclaration, pos: 0, end: 20 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('ImportDeclaration')
    })

    test('NonNullExpression maps to TSNonNullExpression', () => {
      const node = { kind: SyntaxKind.NonNullExpression, pos: 0, end: 10 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.type).toBe('TSNonNullExpression')
    })
  })

  describe('convertRawCompilerNode additional KIND_SPECIFIC_MAP', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('LabeledStatement maps statement to body', () => {
      const node = {
        kind: SyntaxKind.LabeledStatement,
        pos: 0,
        end: 10,
        label: { kind: SyntaxKind.Identifier, escapedText: 'loop', pos: 0, end: 4 },
        statement: { kind: SyntaxKind.Block, pos: 5, end: 10, statements: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.body).toBeDefined()
    })

    test('NewExpression maps expression to callee', () => {
      const node = {
        kind: SyntaxKind.NewExpression,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'Cls', pos: 4, end: 7 },
        arguments: [],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.callee).toBeDefined()
    })

    test('DeleteExpression maps expression to argument', () => {
      const node = {
        kind: SyntaxKind.DeleteExpression,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'prop', pos: 7, end: 11 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('VoidExpression maps expression to argument', () => {
      const node = {
        kind: SyntaxKind.VoidExpression,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.NumericLiteral, text: '0', pos: 5, end: 6 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('TypeOfExpression maps expression to argument', () => {
      const node = {
        kind: SyntaxKind.TypeOfExpression,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 7, end: 8 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('YieldExpression maps expression to argument', () => {
      const node = {
        kind: SyntaxKind.YieldExpression,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'val', pos: 6, end: 9 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('PropertyDeclaration maps name to key and initializer to value', () => {
      const node = {
        kind: SyntaxKind.PropertyDeclaration,
        pos: 0,
        end: 20,
        name: { kind: SyntaxKind.Identifier, escapedText: 'prop', pos: 4, end: 8 },
        initializer: { kind: SyntaxKind.NumericLiteral, text: '42', pos: 11, end: 13 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.key).toBeDefined()
      expect(result?.value).toBeDefined()
    })

    test('PropertyAssignment maps name to key and initializer to value', () => {
      const node = {
        kind: SyntaxKind.PropertyAssignment,
        pos: 0,
        end: 15,
        name: { kind: SyntaxKind.Identifier, escapedText: 'key', pos: 0, end: 3 },
        initializer: { kind: SyntaxKind.StringLiteral, text: 'val', pos: 6, end: 11 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.key).toBeDefined()
      expect(result?.value).toBeDefined()
    })

    test('MethodDeclaration maps name to key', () => {
      const node = {
        kind: SyntaxKind.MethodDeclaration,
        pos: 0,
        end: 20,
        name: { kind: SyntaxKind.Identifier, escapedText: 'myMethod', pos: 4, end: 12 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.key).toBeDefined()
    })

    test('GetAccessor maps name to key', () => {
      const node = {
        kind: SyntaxKind.GetAccessor,
        pos: 0,
        end: 20,
        name: { kind: SyntaxKind.Identifier, escapedText: 'value', pos: 8, end: 13 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.key).toBeDefined()
    })

    test('SetAccessor maps name to key', () => {
      const node = {
        kind: SyntaxKind.SetAccessor,
        pos: 0,
        end: 20,
        name: { kind: SyntaxKind.Identifier, escapedText: 'value', pos: 8, end: 13 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.key).toBeDefined()
    })

    test('SwitchStatement maps expression to discriminant via KIND_SPECIFIC_MAP', () => {
      const node = {
        kind: SyntaxKind.SwitchStatement,
        pos: 0,
        end: 20,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 7, end: 8 },
        caseBlock: { clauses: [] },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.discriminant).toBeDefined()
    })

    test('CaseClause maps expression to test and statements to consequent', () => {
      const node = {
        kind: SyntaxKind.CaseClause,
        pos: 0,
        end: 15,
        expression: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 5, end: 6 },
        statements: [{ kind: SyntaxKind.BreakStatement, pos: 7, end: 13 }],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.test).toBeDefined()
      expect(result?.consequent).toBeDefined()
    })

    test('DefaultClause maps statements to consequent', () => {
      const node = {
        kind: SyntaxKind.DefaultClause,
        pos: 0,
        end: 15,
        statements: [{ kind: SyntaxKind.BreakStatement, pos: 5, end: 11 }],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.consequent).toBeDefined()
    })

    test('SpreadAssignment maps expression to argument', () => {
      const node = {
        kind: SyntaxKind.SpreadAssignment,
        pos: 0,
        end: 10,
        expression: { kind: SyntaxKind.Identifier, escapedText: 'obj', pos: 3, end: 6 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('TaggedTemplateExpression maps template to quasi', () => {
      const node = {
        kind: SyntaxKind.TaggedTemplateExpression,
        pos: 0,
        end: 20,
        tag: { kind: SyntaxKind.Identifier, escapedText: 'tag', pos: 0, end: 3 },
        template: {
          kind: SyntaxKind.NoSubstitutionTemplateLiteral,
          text: 'hello',
          pos: 4,
          end: 11,
        },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.quasi).toBeDefined()
    })
  })

  describe('convertRawCompilerNode depth tracking', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('depth 0 processes normally', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toBeNull()
    })

    test('depth MAX_DEPTH - 1 processes normally', () => {
      const node = { kind: SyntaxKind.Block, pos: 0, end: 2 }
      const result = convertRawCompilerNode(node, MAX_DEPTH - 1)
      expect(result).not.toBeNull()
    })

    test('deeply nested children are cut off at MAX_DEPTH', () => {
      const inner = { kind: SyntaxKind.Block, pos: 0, end: 2 }
      let current: Record<string, unknown> = inner
      for (let i = 0; i < MAX_DEPTH + 2; i++) {
        current = { kind: SyntaxKind.Block, pos: 0, end: 2, child: current }
      }
      const result = convertRawCompilerNode(current, 0)
      expect(result).not.toBeNull()
    })

    test('recursive conversion respects depth increment', () => {
      const leaf = { kind: SyntaxKind.StringLiteral, text: 'leaf', pos: 0, end: 6 }
      const node = {
        kind: SyntaxKind.Block,
        pos: 0,
        end: 10,
        statements: [
          {
            kind: SyntaxKind.ReturnStatement,
            pos: 0,
            end: 10,
            expression: leaf,
          },
        ],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result).not.toBeNull()
    })
  })

  describe('convertRawCompilerNode PROPERTY_MAP mappings', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('block maps to body', () => {
      const child = { kind: SyntaxKind.Block, pos: 5, end: 10, statements: [] }
      const node = { kind: SyntaxKind.IfStatement, pos: 0, end: 20, block: child }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.body).toBeDefined()
    })

    test('thenStatement maps to consequent via KIND_SPECIFIC_MAP', () => {
      const then = { kind: SyntaxKind.Block, pos: 5, end: 15, statements: [] }
      const node = {
        kind: SyntaxKind.IfStatement,
        pos: 0,
        end: 20,
        expression: { kind: SyntaxKind.TrueKeyword, pos: 3, end: 7 },
        thenStatement: then,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.consequent).toBeDefined()
    })

    test('elseStatement maps to alternate via KIND_SPECIFIC_MAP', () => {
      const then = { kind: SyntaxKind.Block, pos: 5, end: 15, statements: [] }
      const els = { kind: SyntaxKind.Block, pos: 16, end: 25, statements: [] }
      const node = {
        kind: SyntaxKind.IfStatement,
        pos: 0,
        end: 25,
        expression: { kind: SyntaxKind.TrueKeyword, pos: 3, end: 7 },
        thenStatement: then,
        elseStatement: els,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.alternate).toBeDefined()
    })

    test('VariableStatement declarationList flattens to declarations (special case)', () => {
      const declList = {
        kind: SyntaxKind.VariableDeclarationList,
        pos: 0,
        end: 10,
        flags: 1,
        declarations: [
          {
            kind: SyntaxKind.VariableDeclaration,
            pos: 0,
            end: 5,
            name: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 },
          },
        ],
      }
      const node = {
        kind: SyntaxKind.VariableStatement,
        pos: 0,
        end: 10,
        declarationList: declList,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.declarations).toBeDefined()
    })

    test('parameters maps to params via PROPERTY_MAP', () => {
      const param = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 0, end: 1 }
      const node = {
        kind: SyntaxKind.FunctionDeclaration,
        pos: 0,
        end: 20,
        name: { kind: SyntaxKind.Identifier, escapedText: 'fn', pos: 9, end: 11 },
        parameters: [param],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.params).toBeDefined()
    })

    test('escapedText maps to name via PROPERTY_MAP', () => {
      const node = { kind: SyntaxKind.Identifier, escapedText: 'myVar', pos: 0, end: 5 }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.name).toBe('myVar')
    })

    test('heritageClauses maps to heritage via PROPERTY_MAP', () => {
      const heritage = { kind: SyntaxKind.HeritageClause, pos: 5, end: 15, token: 85, types: [] }
      const node = {
        kind: SyntaxKind.ClassDeclaration,
        pos: 0,
        end: 30,
        name: { kind: SyntaxKind.Identifier, escapedText: 'Cls', pos: 6, end: 9 },
        heritageClauses: [heritage],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.heritage).toBeDefined()
    })

    test('members maps to body via PROPERTY_MAP', () => {
      const node = {
        kind: SyntaxKind.ClassDeclaration,
        pos: 0,
        end: 30,
        name: { kind: SyntaxKind.Identifier, escapedText: 'Cls', pos: 6, end: 9 },
        members: [],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.body).toBeDefined()
    })

    test('moduleSpecifier maps to source via PROPERTY_MAP', () => {
      const specifier = { kind: SyntaxKind.StringLiteral, text: 'module', pos: 8, end: 16 }
      const node = {
        kind: SyntaxKind.ImportDeclaration,
        pos: 0,
        end: 20,
        moduleSpecifier: specifier,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.source).toBeDefined()
    })

    test('operand maps to argument via PROPERTY_MAP', () => {
      const node = {
        kind: SyntaxKind.PrefixUnaryExpression,
        pos: 0,
        end: 2,
        operator: '!',
        operand: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 1, end: 2 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })
  })

  describe('convertRawCompilerNode TemplateExpression additional', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('TemplateExpression span literal without pos/end has no range', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'a',
        rawText: 'a',
        pos: 0,
        end: 2,
      }
      const expr = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 3, end: 4 }
      const lit = { kind: SyntaxKind.TemplateTail, text: 'b', rawText: 'b' }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 10,
        head,
        templateSpans: [{ expression: expr, literal: lit }],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      expect(quasis[1]?.range).toBeUndefined()
    })

    test('TemplateExpression span literal with pos/end has range', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'a',
        rawText: 'a',
        pos: 0,
        end: 2,
      }
      const expr = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 3, end: 4 }
      const lit = { kind: SyntaxKind.TemplateTail, text: 'b', rawText: 'b', pos: 5, end: 7 }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 7,
        head,
        templateSpans: [{ expression: expr, literal: lit }],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      expect(quasis[1]?.range).toEqual([5, 7])
    })

    test('TemplateExpression head with text but no rawText uses text for both', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'hello',
        pos: 0,
        end: 7,
      }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 7,
        head,
        templateSpans: [],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      const val = quasis[0]?.value as Record<string, unknown>
      expect(val.raw).toBe('hello')
      expect(val.cooked).toBe('hello')
    })

    test('TemplateExpression span literal uses rawText fallback when no text', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'a',
        rawText: 'a',
        pos: 0,
        end: 2,
      }
      const expr = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 3, end: 4 }
      const lit = { kind: SyntaxKind.TemplateTail, rawText: 'raw-b', pos: 5, end: 7 }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 7,
        head,
        templateSpans: [{ expression: expr, literal: lit }],
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      const val = quasis[1]?.value as Record<string, unknown>
      expect(val.raw).toBe('raw-b')
    })

    test('TemplateExpression with templateSpans undefined', () => {
      const head = {
        kind: SyntaxKind.TemplateHead,
        text: 'hello',
        pos: 0,
        end: 7,
      }
      const node = {
        kind: SyntaxKind.TemplateExpression,
        pos: 0,
        end: 7,
        head,
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as unknown[]
      const expressions = result?.expressions as unknown[]
      expect(quasis).toHaveLength(1)
      expect(expressions).toHaveLength(0)
    })

    test('NoSubstitutionTemplateLiteral creates quasis with TemplateElement type', () => {
      const node = {
        kind: SyntaxKind.NoSubstitutionTemplateLiteral,
        text: 'hello',
        pos: 0,
        end: 7,
      }
      const result = convertRawCompilerNode(node, 0)
      const quasis = result?.quasis as Array<Record<string, unknown>>
      expect(quasis[0]?.type).toBe('TemplateElement')
    })
  })

  describe('convertRawCompilerNode array edge cases', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('array with multiple OmittedExpressions', () => {
      const om1 = { kind: SyntaxKind.OmittedExpression, pos: 0, end: 0 }
      const om2 = { kind: SyntaxKind.OmittedExpression, pos: 1, end: 1 }
      const child = { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 2, end: 3 }
      const node = {
        kind: SyntaxKind.ArrayLiteralExpression,
        pos: 0,
        end: 10,
        elements: [om1, child, om2],
      }
      const result = convertRawCompilerNode(node, 0)
      const elements = result?.elements as unknown[]
      expect(elements[0]).toBeNull()
      expect((elements[1] as Record<string, unknown>)?.type).toBe('Identifier')
      expect(elements[2]).toBeNull()
    })

    test('empty array passes through', () => {
      const node = {
        kind: SyntaxKind.ArrayLiteralExpression,
        pos: 0,
        end: 2,
        elements: [],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.elements).toEqual([])
    })

    test('array with null items passes through', () => {
      const node = {
        kind: SyntaxKind.Block,
        pos: 0,
        end: 2,
        items: [null],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.items).toEqual([null])
    })

    test('array with boolean items passes through', () => {
      const node = {
        kind: SyntaxKind.Block,
        pos: 0,
        end: 2,
        items: [true, false],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.items).toEqual([true, false])
    })

    test('array with number items passes through', () => {
      const node = {
        kind: SyntaxKind.Block,
        pos: 0,
        end: 2,
        items: [1, 2, 3],
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.items).toEqual([1, 2, 3])
    })
  })

  describe('convertRawCompilerNode operatorToken edge cases', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('operatorToken with AmpersandAmpersandToken', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 7,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.AmpersandAmpersandToken },
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 5, end: 6 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.operator).toBe('&&')
    })

    test('operatorToken with QuestionQuestionToken', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 7,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.QuestionQuestionToken },
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 5, end: 6 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.operator).toBe('??')
    })

    test('operatorToken with EqualsEqualsEqualsToken', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 7,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.EqualsEqualsEqualsToken },
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 5, end: 6 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.operator).toBe('===')
      expect(result?.type).toBe('BinaryExpression')
    })

    test('operatorToken with ExclamationEqualsToken', () => {
      const node = {
        kind: SyntaxKind.BinaryExpression,
        pos: 0,
        end: 7,
        left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
        operatorToken: { kind: SyntaxKind.ExclamationEqualsToken },
        right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 5, end: 6 },
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.operator).toBe('!=')
    })
  })

  describe('convertRawCompilerNode Regex edge cases', () => {
    beforeEach(() => {
      setRangeSourceText('')
    })

    test('RegularExpressionLiteral with empty pattern', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: '//g',
        pos: 0,
        end: 3,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: '', flags: 'g' })
    })

    test('RegularExpressionLiteral with complex pattern containing slashes', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: '/a\\/b/g',
        pos: 0,
        end: 7,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'a\\/b', flags: 'g' })
    })

    test('RegularExpressionLiteral with unicode flag', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: '/pattern/u',
        pos: 0,
        end: 10,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'pattern', flags: 'u' })
    })

    test('RegularExpressionLiteral with sticky flag', () => {
      const node = {
        kind: SyntaxKind.RegularExpressionLiteral,
        text: '/test/y',
        pos: 0,
        end: 7,
      }
      const result = convertRawCompilerNode(node, 0)
      expect(result?.regex).toEqual({ pattern: 'test', flags: 'y' })
    })
  })

  describe('convertCompilerNode additional KIND_NAME_ALIASES', () => {
    function createMockNode(
      overrides: {
        kindName?: string
        text?: string
        start?: number
        end?: number
        compilerNode?: Record<string, unknown>
      } = {},
    ): Node {
      const mockCompilerNode: Record<string, unknown> = overrides.compilerNode ?? {
        pos: overrides.start ?? 0,
        end: overrides.end ?? 10,
      }
      return {
        getKindName: () => overrides.kindName ?? 'StringLiteral',
        getText: () => overrides.text ?? '"hello"',
        getStart: () => overrides.start ?? 0,
        getEnd: () => overrides.end ?? 10,
        getSourceFile: () => ({
          getFilePath: () => '/test/file.ts',
          getFullText: () => overrides.text ?? '"hello"',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        compilerNode: mockCompilerNode,
      } as unknown as Node
    }

    beforeEach(() => {
      setRangeSourceText('')
    })

    test('DeleteExpression maps to UnaryExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'DeleteExpression',
        compilerNode: { pos: 0, end: 10 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('UnaryExpression')
    })

    test('VoidExpression maps to UnaryExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'VoidExpression',
        compilerNode: { pos: 0, end: 10 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('UnaryExpression')
    })

    test('TypeOfExpression maps to UnaryExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'TypeOfExpression',
        compilerNode: { pos: 0, end: 10 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('UnaryExpression')
    })

    test('ParenthesizedExpression is unwrapped in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'ParenthesizedExpression',
        compilerNode: { pos: 0, end: 10 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('ParenthesizedExpression')
    })

    test('AsExpression maps to TSAsExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'AsExpression',
        compilerNode: { pos: 0, end: 10 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('TSAsExpression')
    })

    test('ImportDeclaration maps to ImportDeclaration in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'ImportDeclaration',
        compilerNode: { pos: 0, end: 20 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('ImportDeclaration')
    })

    test('NonNullExpression maps to TSNonNullExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'NonNullExpression',
        compilerNode: { pos: 0, end: 10 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('TSNonNullExpression')
    })

    test('EnumDeclaration maps to TSEnumDeclaration in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'EnumDeclaration',
        compilerNode: { pos: 0, end: 20 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('TSEnumDeclaration')
    })

    test('InterfaceDeclaration maps to TSInterfaceDeclaration in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'InterfaceDeclaration',
        compilerNode: { pos: 0, end: 20 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('TSInterfaceDeclaration')
    })

    test('ClassExpression maps to ClassExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'ClassExpression',
        compilerNode: { pos: 0, end: 20 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('ClassExpression')
    })

    test('ConditionalExpression maps to ConditionalExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'ConditionalExpression',
        compilerNode: { pos: 0, end: 20 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('ConditionalExpression')
    })
  })

  describe('convertCompilerNode SKIP_KEYS comprehensive', () => {
    function createMockNode(
      overrides: {
        kindName?: string
        text?: string
        start?: number
        end?: number
        compilerNode?: Record<string, unknown>
      } = {},
    ): Node {
      const mockCompilerNode: Record<string, unknown> = overrides.compilerNode ?? {
        pos: overrides.start ?? 0,
        end: overrides.end ?? 10,
      }
      return {
        getKindName: () => overrides.kindName ?? 'StringLiteral',
        getText: () => overrides.text ?? '"hello"',
        getStart: () => overrides.start ?? 0,
        getEnd: () => overrides.end ?? 10,
        getSourceFile: () => ({
          getFilePath: () => '/test/file.ts',
          getFullText: () => overrides.text ?? '"hello"',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        compilerNode: mockCompilerNode,
      } as unknown as Node
    }

    beforeEach(() => {
      setRangeSourceText('')
    })

    test('skips parent key in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, parent: {} },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('parent')
    })

    test('skips symbol key in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, symbol: {} },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('symbol')
    })

    test('skips locals key in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, locals: {} },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('locals')
    })

    test('skips nextContainer key in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, nextContainer: {} },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('nextContainer')
    })

    test('skips original key in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, original: {} },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('original')
    })

    test('skips jlChildren key in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, jlChildren: [] },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('jlChildren')
    })

    test('skips id key in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'Block',
        compilerNode: { pos: 0, end: 2, id: 42 },
      })
      const result = convertCompilerNode(node, 0)
      expect(result).not.toHaveProperty('id')
    })
  })

  describe('convertCompilerNode additional KIND_SPECIFIC_MAP', () => {
    function createMockNode(
      overrides: {
        kindName?: string
        text?: string
        start?: number
        end?: number
        compilerNode?: Record<string, unknown>
      } = {},
    ): Node {
      const mockCompilerNode: Record<string, unknown> = overrides.compilerNode ?? {
        pos: overrides.start ?? 0,
        end: overrides.end ?? 10,
      }
      return {
        getKindName: () => overrides.kindName ?? 'StringLiteral',
        getText: () => overrides.text ?? '"hello"',
        getStart: () => overrides.start ?? 0,
        getEnd: () => overrides.end ?? 10,
        getSourceFile: () => ({
          getFilePath: () => '/test/file.ts',
          getFullText: () => overrides.text ?? '"hello"',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        compilerNode: mockCompilerNode,
      } as unknown as Node
    }

    beforeEach(() => {
      setRangeSourceText('')
    })

    test('PropertyAccessExpression maps expression to object in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'PropertyAccessExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'obj', pos: 0, end: 3 },
          name: { kind: SyntaxKind.Identifier, escapedText: 'prop', pos: 4, end: 8 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.object).toBeDefined()
      expect(result?.property).toBeDefined()
    })

    test('DeleteExpression maps expression to argument in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'DeleteExpression',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'prop', pos: 7, end: 11 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('AwaitExpression maps expression to argument in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'AwaitExpression',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'promise', pos: 6, end: 13 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('YieldExpression maps expression to argument in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'YieldExpression',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'val', pos: 6, end: 9 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('NewExpression maps expression to callee in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'NewExpression',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'Cls', pos: 4, end: 7 },
          arguments: [],
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.callee).toBeDefined()
    })

    test('SpreadElement maps expression to argument in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'SpreadElement',
        compilerNode: {
          pos: 0,
          end: 5,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'arr', pos: 3, end: 6 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('IfStatement maps expression to test in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'IfStatement',
        compilerNode: {
          pos: 0,
          end: 20,
          expression: { kind: SyntaxKind.TrueKeyword, pos: 3, end: 7 },
          thenStatement: { kind: SyntaxKind.Block, pos: 8, end: 15, statements: [] },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.test).toBeDefined()
      expect(result?.consequent).toBeDefined()
    })

    test('ThrowStatement maps expression to argument in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'ThrowStatement',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'err', pos: 6, end: 9 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })

    test('ReturnStatement maps expression to argument in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'ReturnStatement',
        compilerNode: {
          pos: 0,
          end: 10,
          expression: { kind: SyntaxKind.Identifier, escapedText: 'x', pos: 7, end: 8 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.argument).toBeDefined()
    })
  })

  describe('convertCompilerNode additional assignment operators', () => {
    function createMockNode(
      overrides: {
        kindName?: string
        text?: string
        start?: number
        end?: number
        compilerNode?: Record<string, unknown>
      } = {},
    ): Node {
      const mockCompilerNode: Record<string, unknown> = overrides.compilerNode ?? {
        pos: overrides.start ?? 0,
        end: overrides.end ?? 10,
      }
      return {
        getKindName: () => overrides.kindName ?? 'StringLiteral',
        getText: () => overrides.text ?? '"hello"',
        getStart: () => overrides.start ?? 0,
        getEnd: () => overrides.end ?? 10,
        getSourceFile: () => ({
          getFilePath: () => '/test/file.ts',
          getFullText: () => overrides.text ?? '"hello"',
          getLineAndColumnAtPos: () => ({ line: 1, column: 0 }),
        }),
        compilerNode: mockCompilerNode,
      } as unknown as Node
    }

    beforeEach(() => {
      setRangeSourceText('')
    })

    test('BinaryExpression with MinusEqualsToken becomes AssignmentExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.MinusEqualsToken },
          right: { kind: SyntaxKind.NumericLiteral, text: '1', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('-=')
    })

    test('BinaryExpression with AsteriskEqualsToken becomes AssignmentExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.AsteriskEqualsToken },
          right: { kind: SyntaxKind.NumericLiteral, text: '2', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('*=')
    })

    test('BinaryExpression with AmpersandAmpersandToken becomes LogicalExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 7,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.AmpersandAmpersandToken },
          right: { kind: SyntaxKind.Identifier, escapedText: 'b', pos: 5, end: 6 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('LogicalExpression')
      expect(result?.operator).toBe('&&')
    })

    test('BinaryExpression with PercentEqualsToken becomes AssignmentExpression in convertCompilerNode', () => {
      const node = createMockNode({
        kindName: 'BinaryExpression',
        compilerNode: {
          pos: 0,
          end: 5,
          left: { kind: SyntaxKind.Identifier, escapedText: 'a', pos: 0, end: 1 },
          operatorToken: { kind: SyntaxKind.PercentEqualsToken },
          right: { kind: SyntaxKind.NumericLiteral, text: '3', pos: 4, end: 5 },
        },
      })
      const result = convertCompilerNode(node, 0)
      expect(result?.type).toBe('AssignmentExpression')
      expect(result?.operator).toBe('%=')
    })
  })

  describe('setRangeSourceText and skipTrivia interaction', () => {
    test('skipTrivia after setRangeSourceText uses new text', () => {
      setRangeSourceText('   a')
      expect(skipTrivia(0)).toBe(3)
      setRangeSourceText('\t\tb')
      expect(skipTrivia(0)).toBe(2)
    })

    test('skipTrivia with only whitespace returns text length', () => {
      setRangeSourceText('     ')
      expect(skipTrivia(0)).toBe(5)
    })

    test('skipTrivia with single-line comment ending at EOF', () => {
      setRangeSourceText('// eof comment')
      expect(skipTrivia(0)).toBe(14)
    })
  })
})
