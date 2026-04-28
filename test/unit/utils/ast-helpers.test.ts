import { describe, test, expect } from 'vitest'
import {
  getCalleeName,
  getArguments,
  isIdentifier,
  isLiteral,
  isNewExpression,
  isCallExpression,
  isMemberExpression,
  isBinaryExpression,
  isLogicalExpression,
  isUnaryExpression,
  isTemplateLiteral,
  isFunctionExpression,
  isReturnStatement,
  getIdentifierName,
  getRange,
  getNodeSource,
  getNodeText,
} from '../../../src/utils/ast-helpers.js'

function createMockContext(source = 'test') {
  return { getSource: () => source }
}

describe('ast-helpers', () => {
  describe('getCalleeName', () => {
    test('should return name for NewExpression with Identifier callee', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [],
      }
      expect(getCalleeName(node)).toBe('Array')
    })

    test('should return name for CallExpression with Identifier callee', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'console' },
        arguments: [],
      }
      expect(getCalleeName(node)).toBe('console')
    })

    test('should return null for NewExpression with non-Identifier callee', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'foo' } },
        arguments: [],
      }
      expect(getCalleeName(node)).toBeNull()
    })

    test('should return null for CallExpression with non-Identifier callee', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'MemberExpression', object: { type: 'Identifier', name: 'obj' } },
        arguments: [],
      }
      expect(getCalleeName(node)).toBeNull()
    })

    test('should return null for non-expression node', () => {
      const node = { type: 'Identifier', name: 'x' }
      expect(getCalleeName(node)).toBeNull()
    })

    test('should return null for null node', () => {
      expect(getCalleeName(null)).toBeNull()
    })

    test('should return null for undefined node', () => {
      expect(getCalleeName(undefined)).toBeNull()
    })

    test('should return name for NewExpression with constructor like Map', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Map' },
        arguments: [],
      }
      expect(getCalleeName(node)).toBe('Map')
    })

    test('should return name for NewExpression with Set', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Set' },
        arguments: [],
      }
      expect(getCalleeName(node)).toBe('Set')
    })

    test('should return name for NewExpression with Promise', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Promise' },
        arguments: [],
      }
      expect(getCalleeName(node)).toBe('Promise')
    })

    test('should return name for CallExpression with Math.floor', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'floor' },
        arguments: [],
      }
      expect(getCalleeName(node)).toBe('floor')
    })

    test('should return null for NewExpression with CallExpression callee', () => {
      const node = {
        type: 'NewExpression',
        callee: {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'factory' },
          arguments: [],
        },
        arguments: [],
      }
      expect(getCalleeName(node)).toBeNull()
    })

    test('should return null for CallExpression with FunctionExpression callee', () => {
      const node = {
        type: 'CallExpression',
        callee: {
          type: 'FunctionExpression',
          id: null,
          params: [],
          body: { type: 'BlockStatement', body: [] },
        },
        arguments: [],
      }
      expect(getCalleeName(node)).toBeNull()
    })

    test('should return null for empty object node', () => {
      expect(getCalleeName({})).toBeNull()
    })

    test('should return null for number node', () => {
      expect(getCalleeName(42)).toBeNull()
    })

    test('should return name for CallExpression with identifier callee named "require"', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{ type: 'Literal', value: 'fs' }],
      }
      expect(getCalleeName(node)).toBe('require')
    })

    test('should return name for NewExpression with identifier callee named "RegExp"', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'RegExp' },
        arguments: [{ type: 'Literal', value: 'abc' }],
      }
      expect(getCalleeName(node)).toBe('RegExp')
    })
  })

  describe('getArguments', () => {
    test('should return arguments array for NewExpression', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'Literal', value: 5 }],
      }
      expect(getArguments(node)).toEqual([{ type: 'Literal', value: 5 }])
    })

    test('should return arguments array for CallExpression', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [
          { type: 'Identifier', name: 'x' },
          { type: 'Identifier', name: 'y' },
        ],
      }
      expect(getArguments(node)).toHaveLength(2)
    })

    test('should return empty array for non-expression node', () => {
      const node = { type: 'Identifier', name: 'x' }
      expect(getArguments(node)).toEqual([])
    })

    test('should return empty array for null node', () => {
      expect(getArguments(null)).toEqual([])
    })

    test('should return empty array for undefined node', () => {
      expect(getArguments(undefined)).toEqual([])
    })

    test('should return empty array when arguments is undefined', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
      }
      expect(getArguments(node)).toEqual([])
    })

    test('should return empty array for NewExpression without arguments', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
      }
      expect(getArguments(node)).toEqual([])
    })

    test('should return single argument for CallExpression', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'Literal', value: 'hello' }],
      }
      const args = getArguments(node)
      expect(args).toHaveLength(1)
    })

    test('should return multiple arguments for CallExpression', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
          { type: 'Literal', value: 3 },
        ],
      }
      expect(getArguments(node)).toHaveLength(3)
    })

    test('should preserve argument order', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [
          { type: 'Identifier', name: 'a' },
          { type: 'Identifier', name: 'b' },
          { type: 'Identifier', name: 'c' },
        ],
      }
      const args = getArguments(node)
      expect((args[0] as Record<string, unknown>).name).toBe('a')
      expect((args[1] as Record<string, unknown>).name).toBe('b')
      expect((args[2] as Record<string, unknown>).name).toBe('c')
    })

    test('should return empty array for BinaryExpression', () => {
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'x' },
        right: { type: 'Identifier', name: 'y' },
      }
      expect(getArguments(node)).toEqual([])
    })

    test('should return empty array for MemberExpression', () => {
      const node = {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'obj' },
        property: { type: 'Identifier', name: 'prop' },
      }
      expect(getArguments(node)).toEqual([])
    })

    test('should return arguments with nested expressions', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [
          {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'inner' },
            arguments: [],
          },
        ],
      }
      const args = getArguments(node)
      expect(args).toHaveLength(1)
      expect((args[0] as Record<string, unknown>).type).toBe('CallExpression')
    })

    test('should return arguments with SpreadElement', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'args' } }],
      }
      expect(getArguments(node)).toHaveLength(1)
    })

    test('should return empty array for boolean input', () => {
      expect(getArguments(true)).toEqual([])
    })

    test('should return empty array for number input', () => {
      expect(getArguments(42)).toEqual([])
    })

    test('should return empty array for string input', () => {
      expect(getArguments('node')).toEqual([])
    })

    test('should handle arguments that are object expressions', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'ObjectExpression', properties: [] }],
      }
      expect(getArguments(node)).toHaveLength(1)
    })

    test('should handle arguments that are array expressions', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [{ type: 'ArrayExpression', elements: [] }],
      }
      expect(getArguments(node)).toHaveLength(1)
    })
  })

  describe('isIdentifier', () => {
    test('should return true for Identifier node', () => {
      expect(isIdentifier({ type: 'Identifier', name: 'x' })).toBe(true)
    })

    test('should return false for non-Identifier node', () => {
      expect(isIdentifier({ type: 'Literal', value: 5 })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isIdentifier(null)).toBe(false)
    })

    test('should return false for undefined', () => {
      expect(isIdentifier(undefined)).toBe(false)
    })

    test('should return true when name matches', () => {
      expect(isIdentifier({ type: 'Identifier', name: 'foo' }, 'foo')).toBe(true)
    })

    test('should return false when name does not match', () => {
      expect(isIdentifier({ type: 'Identifier', name: 'foo' }, 'bar')).toBe(false)
    })

    test('should return true when name is undefined (no filter)', () => {
      expect(isIdentifier({ type: 'Identifier', name: 'anything' }, undefined)).toBe(true)
    })

    test('should return false for non-Identifier with name parameter', () => {
      expect(isIdentifier({ type: 'Literal', value: 5 }, 'foo')).toBe(false)
    })

    test('should return false for null with name parameter', () => {
      expect(isIdentifier(null, 'foo')).toBe(false)
    })

    test('should return false for undefined with name parameter', () => {
      expect(isIdentifier(undefined, 'foo')).toBe(false)
    })

    test('should return false for empty string input', () => {
      expect(isIdentifier('')).toBe(false)
    })

    test('should return false for number input', () => {
      expect(isIdentifier(123)).toBe(false)
    })

    test('should return false for boolean input', () => {
      expect(isIdentifier(false)).toBe(false)
    })

    test('should match identifier with single character name', () => {
      expect(isIdentifier({ type: 'Identifier', name: 'x' }, 'x')).toBe(true)
    })

    test('should match identifier with underscore name', () => {
      expect(isIdentifier({ type: 'Identifier', name: '_private' }, '_private')).toBe(true)
    })

    test('should match identifier with dollar sign name', () => {
      expect(isIdentifier({ type: 'Identifier', name: '$jquery' }, '$jquery')).toBe(true)
    })

    test('should not match with wrong name case-sensitive', () => {
      expect(isIdentifier({ type: 'Identifier', name: 'Foo' }, 'foo')).toBe(false)
    })

    test('should return false for object without type field', () => {
      expect(isIdentifier({ name: 'x' })).toBe(false)
    })

    test('should return false for object with wrong type value', () => {
      expect(isIdentifier({ type: 'identifier', name: 'x' })).toBe(false)
    })
  })

  describe('isLiteral', () => {
    test('should return true for Literal node', () => {
      expect(isLiteral({ type: 'Literal', value: 5 })).toBe(true)
    })

    test('should return false for non-Literal node', () => {
      expect(isLiteral({ type: 'Identifier', name: 'x' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isLiteral(null)).toBe(false)
    })

    test('should return true for string literal', () => {
      expect(isLiteral({ type: 'Literal', value: 'hello' })).toBe(true)
    })

    test('should return true for boolean literal true', () => {
      expect(isLiteral({ type: 'Literal', value: true })).toBe(true)
    })

    test('should return true for boolean literal false', () => {
      expect(isLiteral({ type: 'Literal', value: false })).toBe(true)
    })

    test('should return true for null literal', () => {
      expect(isLiteral({ type: 'Literal', value: null })).toBe(true)
    })

    test('should return true for number literal 0', () => {
      expect(isLiteral({ type: 'Literal', value: 0 })).toBe(true)
    })

    test('should return true for negative number literal', () => {
      expect(isLiteral({ type: 'Literal', value: -1 })).toBe(true)
    })

    test('should return true for float literal', () => {
      expect(isLiteral({ type: 'Literal', value: 3.14 })).toBe(true)
    })

    test('should return true for empty string literal', () => {
      expect(isLiteral({ type: 'Literal', value: '' })).toBe(true)
    })

    test('should return false for undefined', () => {
      expect(isLiteral(undefined)).toBe(false)
    })

    test('should return false for string input', () => {
      expect(isLiteral('Literal')).toBe(false)
    })

    test('should return false for number input', () => {
      expect(isLiteral(42)).toBe(false)
    })

    test('should return false for boolean input', () => {
      expect(isLiteral(true)).toBe(false)
    })

    test('should return false for empty object', () => {
      expect(isLiteral({})).toBe(false)
    })

    test('should return false for object with lowercase type', () => {
      expect(isLiteral({ type: 'literal', value: 5 })).toBe(false)
    })

    test('should return true for regex literal', () => {
      expect(
        isLiteral({ type: 'Literal', value: /test/, regex: { pattern: 'test', flags: '' } }),
      ).toBe(true)
    })
  })

  describe('isNewExpression', () => {
    test('should return true for NewExpression node', () => {
      expect(isNewExpression({ type: 'NewExpression', callee: {}, arguments: [] })).toBe(true)
    })

    test('should return false for non-NewExpression node', () => {
      expect(isNewExpression({ type: 'CallExpression' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isNewExpression(null)).toBe(false)
    })

    test('should return false for undefined in isNewExpression', () => {
      expect(isNewExpression(undefined)).toBe(false)
    })

    test('should return false for string input', () => {
      expect(isNewExpression('NewExpression')).toBe(false)
    })

    test('should return false for number input', () => {
      expect(isNewExpression(0)).toBe(false)
    })

    test('should return false for boolean input', () => {
      expect(isNewExpression(true)).toBe(false)
    })

    test('should return false for empty object', () => {
      expect(isNewExpression({})).toBe(false)
    })

    test('should return true for NewExpression without callee', () => {
      expect(isNewExpression({ type: 'NewExpression' })).toBe(true)
    })

    test('should return false for object with wrong case type', () => {
      expect(isNewExpression({ type: 'newexpression' })).toBe(false)
    })

    test('should return false for object with similar type name', () => {
      expect(isNewExpression({ type: 'NewExpressions' })).toBe(false)
    })

    test('should return true for NewExpression with empty arguments', () => {
      expect(
        isNewExpression({
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Foo' },
          arguments: [],
        }),
      ).toBe(true)
    })

    test('should return false for BinaryExpression', () => {
      expect(isNewExpression({ type: 'BinaryExpression', operator: '+' })).toBe(false)
    })

    test('should return false for MemberExpression', () => {
      expect(isNewExpression({ type: 'MemberExpression' })).toBe(false)
    })

    test('should return false for object with type as number', () => {
      expect(isNewExpression({ type: 42 })).toBe(false)
    })
  })

  describe('isCallExpression', () => {
    test('should return true for CallExpression node', () => {
      expect(isCallExpression({ type: 'CallExpression', callee: {}, arguments: [] })).toBe(true)
    })

    test('should return false for non-CallExpression node', () => {
      expect(isCallExpression({ type: 'NewExpression' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isCallExpression(null)).toBe(false)
    })

    test('should return false for undefined in isCallExpression', () => {
      expect(isCallExpression(undefined)).toBe(false)
    })

    test('should return false for string input', () => {
      expect(isCallExpression('CallExpression')).toBe(false)
    })

    test('should return false for number input', () => {
      expect(isCallExpression(0)).toBe(false)
    })

    test('should return false for boolean input', () => {
      expect(isCallExpression(false)).toBe(false)
    })

    test('should return false for empty object', () => {
      expect(isCallExpression({})).toBe(false)
    })

    test('should return true for CallExpression without callee', () => {
      expect(isCallExpression({ type: 'CallExpression' })).toBe(true)
    })

    test('should return false for object with wrong case type', () => {
      expect(isCallExpression({ type: 'callexpression' })).toBe(false)
    })

    test('should return false for object with similar type name', () => {
      expect(isCallExpression({ type: 'CallExpressions' })).toBe(false)
    })

    test('should return true for CallExpression with arguments', () => {
      expect(
        isCallExpression({
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'fn' },
          arguments: [{ type: 'Literal', value: 1 }],
        }),
      ).toBe(true)
    })

    test('should return false for BinaryExpression', () => {
      expect(isCallExpression({ type: 'BinaryExpression' })).toBe(false)
    })

    test('should return false for MemberExpression', () => {
      expect(isCallExpression({ type: 'MemberExpression' })).toBe(false)
    })

    test('should return false for object with type as boolean', () => {
      expect(isCallExpression({ type: true })).toBe(false)
    })
  })

  describe('isMemberExpression', () => {
    test('should return true for MemberExpression node', () => {
      expect(isMemberExpression({ type: 'MemberExpression', object: {}, property: {} })).toBe(true)
    })

    test('should return false for non-MemberExpression node', () => {
      expect(isMemberExpression({ type: 'Identifier' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isMemberExpression(null)).toBe(false)
    })

    test('should return false for undefined in isMemberExpression', () => {
      expect(isMemberExpression(undefined)).toBe(false)
    })

    test('should return false for string input', () => {
      expect(isMemberExpression('MemberExpression')).toBe(false)
    })

    test('should return false for number input', () => {
      expect(isMemberExpression(0)).toBe(false)
    })

    test('should return false for boolean input', () => {
      expect(isMemberExpression(false)).toBe(false)
    })

    test('should return false for empty object', () => {
      expect(isMemberExpression({})).toBe(false)
    })

    test('should return true for MemberExpression without object/property', () => {
      expect(isMemberExpression({ type: 'MemberExpression' })).toBe(true)
    })

    test('should return false for wrong case type', () => {
      expect(isMemberExpression({ type: 'memberexpression' })).toBe(false)
    })

    test('should return false for similar type name', () => {
      expect(isMemberExpression({ type: 'MemberExpressions' })).toBe(false)
    })

    test('should return true for MemberExpression with computed property', () => {
      expect(
        isMemberExpression({ type: 'MemberExpression', object: {}, property: {}, computed: true }),
      ).toBe(true)
    })

    test('should return false for CallExpression', () => {
      expect(isMemberExpression({ type: 'CallExpression' })).toBe(false)
    })

    test('should return false for NewExpression', () => {
      expect(isMemberExpression({ type: 'NewExpression' })).toBe(false)
    })

    test('should return false for BinaryExpression', () => {
      expect(isMemberExpression({ type: 'BinaryExpression' })).toBe(false)
    })
  })

  describe('isBinaryExpression', () => {
    test('should return true for BinaryExpression with plus operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '+',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with minus operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '-',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with multiply operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '*',
          left: { type: 'Literal', value: 2 },
          right: { type: 'Literal', value: 3 },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with division operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '/',
          left: { type: 'Identifier', name: 'x' },
          right: { type: 'Literal', value: 2 },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with strict equality operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '===',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: 5 },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with loose equality operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '==',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Literal', value: 5 },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with less than operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with logical AND operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '&&',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with instanceof operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: 'instanceof',
          left: { type: 'Identifier', name: 'obj' },
          right: { type: 'Identifier', name: 'Array' },
        }),
      ).toBe(true)
    })

    test('should return true for BinaryExpression with in operator', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: 'in',
          left: { type: 'Literal', value: 'key' },
          right: { type: 'Identifier', name: 'obj' },
        }),
      ).toBe(true)
    })

    test('should return false for CallExpression', () => {
      expect(isBinaryExpression({ type: 'CallExpression' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isBinaryExpression(null)).toBe(false)
    })

    test('should return false for undefined', () => {
      expect(isBinaryExpression(undefined)).toBe(false)
    })

    test('should return false for string input', () => {
      expect(isBinaryExpression('BinaryExpression')).toBe(false)
    })

    test('should return false for number input', () => {
      expect(isBinaryExpression(42)).toBe(false)
    })

    test('should return false for boolean input', () => {
      expect(isBinaryExpression(true)).toBe(false)
    })

    test('should return false for empty object', () => {
      expect(isBinaryExpression({})).toBe(false)
    })

    test('should return false for wrong case type', () => {
      expect(isBinaryExpression({ type: 'binaryexpression' })).toBe(false)
    })

    test('should return false for similar type name', () => {
      expect(isBinaryExpression({ type: 'BinaryExpressions' })).toBe(false)
    })

    test('should return true for BinaryExpression without left/right', () => {
      expect(isBinaryExpression({ type: 'BinaryExpression', operator: '+' })).toBe(true)
    })

    test('should return true for nested BinaryExpression', () => {
      expect(
        isBinaryExpression({
          type: 'BinaryExpression',
          operator: '+',
          left: {
            type: 'BinaryExpression',
            operator: '*',
            left: { type: 'Literal', value: 2 },
            right: { type: 'Literal', value: 3 },
          },
          right: { type: 'Literal', value: 4 },
        }),
      ).toBe(true)
    })

    test('should return false for LogicalExpression', () => {
      expect(
        isBinaryExpression({
          type: 'LogicalExpression',
          operator: '||',
          left: { type: 'Identifier', name: 'a' },
          right: { type: 'Identifier', name: 'b' },
        }),
      ).toBe(false)
    })
  })

  describe('getIdentifierName', () => {
    test('should return name for Identifier node', () => {
      expect(getIdentifierName({ type: 'Identifier', name: 'foo' })).toBe('foo')
    })

    test('should return null for non-Identifier node', () => {
      expect(getIdentifierName({ type: 'Literal', value: 5 })).toBeNull()
    })

    test('should return null for null', () => {
      expect(getIdentifierName(null)).toBeNull()
    })

    test('should return name for Identifier with single char name', () => {
      expect(getIdentifierName({ type: 'Identifier', name: 'x' })).toBe('x')
    })

    test('should return name for Identifier with underscore prefix', () => {
      expect(getIdentifierName({ type: 'Identifier', name: '_private' })).toBe('_private')
    })

    test('should return name for Identifier with dollar prefix', () => {
      expect(getIdentifierName({ type: 'Identifier', name: '$elem' })).toBe('$elem')
    })

    test('should return name for Identifier with double underscore', () => {
      expect(getIdentifierName({ type: 'Identifier', name: '__proto__' })).toBe('__proto__')
    })

    test('should return name for Identifier with numbers in name', () => {
      expect(getIdentifierName({ type: 'Identifier', name: 'item1' })).toBe('item1')
    })

    test('should return name for Identifier with camelCase', () => {
      expect(getIdentifierName({ type: 'Identifier', name: 'myVariableName' })).toBe(
        'myVariableName',
      )
    })

    test('should return name for Identifier with PascalCase', () => {
      expect(getIdentifierName({ type: 'Identifier', name: 'MyClassName' })).toBe('MyClassName')
    })

    test('should return name for Identifier with UPPER_CASE', () => {
      expect(getIdentifierName({ type: 'Identifier', name: 'MY_CONSTANT' })).toBe('MY_CONSTANT')
    })

    test('should return empty string for Identifier with empty name', () => {
      expect(getIdentifierName({ type: 'Identifier', name: '' })).toBe('')
    })

    test('should return null for undefined', () => {
      expect(getIdentifierName(undefined)).toBeNull()
    })

    test('should return null for string input', () => {
      expect(getIdentifierName('Identifier' as unknown as object)).toBeNull()
    })

    test('should return null for number input', () => {
      expect(getIdentifierName(42 as unknown as object)).toBeNull()
    })

    test('should return null for MemberExpression', () => {
      expect(getIdentifierName({ type: 'MemberExpression', object: {}, property: {} })).toBeNull()
    })

    test('should return null for empty object', () => {
      expect(getIdentifierName({})).toBeNull()
    })

    test('should return null for object with type but not Identifier', () => {
      expect(getIdentifierName({ type: 'CallExpression' })).toBeNull()
    })
  })

  describe('getRange', () => {
    test('should return range for node with range property', () => {
      const node = { type: 'Identifier', name: 'x', range: [0, 1] as [number, number] }
      expect(getRange(node)).toEqual([0, 1])
    })

    test('should return null for node without range property', () => {
      const node = { type: 'Identifier', name: 'x' }
      expect(getRange(node)).toBeNull()
    })

    test('should return null for null node', () => {
      expect(getRange(null)).toBeNull()
    })

    test('should return null for undefined node', () => {
      expect(getRange(undefined)).toBeNull()
    })

    test('should return null for non-object node', () => {
      expect(getRange('string')).toBeNull()
    })

    test('should return range with large offsets', () => {
      const node = { type: 'Identifier', name: 'x', range: [1000, 2000] as [number, number] }
      expect(getRange(node)).toEqual([1000, 2000])
    })

    test('should return range where start equals end', () => {
      const node = { type: 'Identifier', name: 'x', range: [5, 5] as [number, number] }
      expect(getRange(node)).toEqual([5, 5])
    })

    test('should return range starting at 0', () => {
      const node = { type: 'Program', body: [], range: [0, 50] as [number, number] }
      expect(getRange(node)).toEqual([0, 50])
    })

    test('should return range for CallExpression node', () => {
      const node = {
        type: 'CallExpression',
        callee: {},
        arguments: [],
        range: [10, 20] as [number, number],
      }
      expect(getRange(node)).toEqual([10, 20])
    })

    test('should return range for Literal node', () => {
      const node = { type: 'Literal', value: 42, range: [0, 2] as [number, number] }
      expect(getRange(node)).toEqual([0, 2])
    })

    test('should return null for node with range as string', () => {
      const node = { type: 'Identifier', name: 'x', range: 'invalid' }
      expect(getRange(node)).toBe('invalid')
    })

    test('should return range for node with many properties', () => {
      const node = {
        type: 'FunctionDeclaration',
        id: { type: 'Identifier', name: 'fn' },
        params: [],
        body: { type: 'BlockStatement', body: [] },
        generator: false,
        async: false,
        range: [0, 100] as [number, number],
      }
      expect(getRange(node)).toEqual([0, 100])
    })

    test('should return null for boolean input', () => {
      expect(getRange(true)).toBeNull()
    })

    test('should return null for number input', () => {
      expect(getRange(42)).toBeNull()
    })

    test('should return range for node with only range', () => {
      const node = { range: [3, 7] as [number, number] }
      expect(getRange(node)).toEqual([3, 7])
    })

    test('should return range for NewExpression node', () => {
      const node = {
        type: 'NewExpression',
        callee: {},
        arguments: [],
        range: [0, 10] as [number, number],
      }
      expect(getRange(node)).toEqual([0, 10])
    })

    test('should return range for BinaryExpression node', () => {
      const node = {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Identifier', name: 'a' },
        right: { type: 'Identifier', name: 'b' },
        range: [0, 5] as [number, number],
      }
      expect(getRange(node)).toEqual([0, 5])
    })
  })

  describe('getNodeSource', () => {
    test('should return source text for node with range', () => {
      const context = createMockContext('const x = 5;')
      const node = { type: 'Identifier', name: 'x', range: [6, 7] as [number, number] }
      expect(getNodeSource(context, node)).toBe('x')
    })

    test('should return empty string for node without range', () => {
      const context = createMockContext('const x = 5;')
      const node = { type: 'Identifier', name: 'x' }
      expect(getNodeSource(context, node)).toBe('')
    })

    test('should return empty string for null node', () => {
      const context = createMockContext('test')
      expect(getNodeSource(context, null)).toBe('')
    })

    test('should return empty string for undefined node', () => {
      const context = createMockContext('test')
      expect(getNodeSource(context, undefined)).toBe('')
    })

    test('should return empty string for non-object node', () => {
      const context = createMockContext('test')
      expect(getNodeSource(context, 'string')).toBe('')
    })

    test('should return full source when range covers entire string', () => {
      const source = 'const x = 5;'
      const context = createMockContext(source)
      const node = { type: 'Program', range: [0, source.length] as [number, number] }
      expect(getNodeSource(context, node)).toBe(source)
    })

    test('should return partial source for subrange', () => {
      const source = 'function hello() { return "world"; }'
      const context = createMockContext(source)
      const node = { type: 'Identifier', name: 'hello', range: [9, 14] as [number, number] }
      expect(getNodeSource(context, node)).toBe('hello')
    })

    test('should return empty string for zero-length range', () => {
      const context = createMockContext('hello world')
      const node = { type: 'Identifier', range: [5, 5] as [number, number] }
      expect(getNodeSource(context, node)).toBe('')
    })

    test('should return single character for range of length 1', () => {
      const context = createMockContext('abc')
      const node = { type: 'Identifier', range: [1, 2] as [number, number] }
      expect(getNodeSource(context, node)).toBe('b')
    })

    test('should return source for range at end of string', () => {
      const context = createMockContext('hello world')
      const node = { type: 'Identifier', range: [6, 11] as [number, number] }
      expect(getNodeSource(context, node)).toBe('world')
    })

    test('should handle empty source string', () => {
      const context = createMockContext('')
      const node = { type: 'Identifier', range: [0, 0] as [number, number] }
      expect(getNodeSource(context, node)).toBe('')
    })

    test('should return source for CallExpression range', () => {
      const source = 'foo.bar("test")'
      const context = createMockContext(source)
      const node = { type: 'CallExpression', range: [0, source.length] as [number, number] }
      expect(getNodeSource(context, node)).toBe(source)
    })

    test('should return source for BinaryExpression range', () => {
      const source = 'a + b'
      const context = createMockContext(source)
      const node = { type: 'BinaryExpression', range: [0, 5] as [number, number] }
      expect(getNodeSource(context, node)).toBe('a + b')
    })

    test('should return source for range at start of string', () => {
      const context = createMockContext('hello world')
      const node = { type: 'Identifier', range: [0, 5] as [number, number] }
      expect(getNodeSource(context, node)).toBe('hello')
    })

    test('should handle source with special characters', () => {
      const source = 'const x = "héllo wörld";'
      const context = createMockContext(source)
      const node = { type: 'Literal', range: [10, 23] as [number, number] }
      expect(getNodeSource(context, node)).toBe('"héllo wörld"')
    })

    test('should return number literal source', () => {
      const source = 'const x = 42;'
      const context = createMockContext(source)
      const node = { type: 'Literal', range: [10, 12] as [number, number] }
      expect(getNodeSource(context, node)).toBe('42')
    })

    test('should return source for NewExpression range', () => {
      const source = 'new Array(5)'
      const context = createMockContext(source)
      const node = { type: 'NewExpression', range: [0, source.length] as [number, number] }
      expect(getNodeSource(context, node)).toBe(source)
    })
  })

  describe('getNodeText', () => {
    test('should return text for node with range', () => {
      const source = 'const x = 5;'
      const node = { type: 'Identifier', name: 'x', range: [6, 7] as [number, number] }
      expect(getNodeText(node, source)).toBe('x')
    })

    test('should return empty string for node without range', () => {
      const source = 'const x = 5;'
      const node = { type: 'Identifier', name: 'x' }
      expect(getNodeText(node, source)).toBe('')
    })

    test('should return empty string for null node', () => {
      expect(getNodeText(null, 'source')).toBe('')
    })

    test('should return empty string for undefined node', () => {
      expect(getNodeText(undefined, 'source')).toBe('')
    })

    test('should return empty string for string node', () => {
      expect(getNodeText('string', 'source')).toBe('')
    })

    test('should return empty string for number node', () => {
      expect(getNodeText(42, 'source')).toBe('')
    })

    test('should return empty string for boolean node', () => {
      expect(getNodeText(true, 'source')).toBe('')
    })

    test('should return full source for range covering all', () => {
      const source = 'function test() {}'
      const node = { type: 'FunctionDeclaration', range: [0, source.length] as [number, number] }
      expect(getNodeText(node, source)).toBe(source)
    })

    test('should return partial text for subrange', () => {
      const source = 'hello world foo bar'
      const node = { type: 'Identifier', range: [6, 11] as [number, number] }
      expect(getNodeText(node, source)).toBe('world')
    })

    test('should return single character for range of length 1', () => {
      const source = 'abcdef'
      const node = { type: 'Identifier', range: [2, 3] as [number, number] }
      expect(getNodeText(node, source)).toBe('c')
    })

    test('should return empty string for zero-length range', () => {
      const source = 'hello'
      const node = { type: 'Identifier', range: [2, 2] as [number, number] }
      expect(getNodeText(node, source)).toBe('')
    })

    test('should handle empty source string', () => {
      const node = { type: 'Identifier', range: [0, 0] as [number, number] }
      expect(getNodeText(node, '')).toBe('')
    })

    test('should return text for CallExpression', () => {
      const source = 'foo(1, 2, 3)'
      const node = { type: 'CallExpression', range: [0, source.length] as [number, number] }
      expect(getNodeText(node, source)).toBe(source)
    })

    test('should return text for NewExpression', () => {
      const source = 'new Map()'
      const node = { type: 'NewExpression', range: [0, source.length] as [number, number] }
      expect(getNodeText(node, source)).toBe(source)
    })

    test('should return text for BinaryExpression', () => {
      const source = 'a + b'
      const node = { type: 'BinaryExpression', range: [0, 5] as [number, number] }
      expect(getNodeText(node, source)).toBe('a + b')
    })

    test('should return text for MemberExpression', () => {
      const source = 'obj.property'
      const node = { type: 'MemberExpression', range: [0, source.length] as [number, number] }
      expect(getNodeText(node, source)).toBe(source)
    })

    test('should return text at end of source', () => {
      const source = 'const x = 42;'
      const node = { type: 'Literal', range: [10, 12] as [number, number] }
      expect(getNodeText(node, source)).toBe('42')
    })

    test('should return text for range at start of source', () => {
      const source = 'const x = 42;'
      const node = { type: 'Keyword', range: [0, 5] as [number, number] }
      expect(getNodeText(node, source)).toBe('const')
    })

    test('should handle source with unicode characters', () => {
      const source = '日本語テスト'
      const node = { type: 'Identifier', range: [0, 3] as [number, number] }
      expect(getNodeText(node, source)).toBe('日本語')
    })

    test('should handle source with newlines', () => {
      const source = 'line1\nline2\nline3'
      const node = { type: 'Identifier', range: [6, 11] as [number, number] }
      expect(getNodeText(node, source)).toBe('line2')
    })

    test('should handle source with tabs', () => {
      const source = '\thello\t'
      const node = { type: 'Identifier', range: [1, 6] as [number, number] }
      expect(getNodeText(node, source)).toBe('hello')
    })

    test('should return text for nested node range', () => {
      const source = 'foo(bar(baz))'
      const node = { type: 'CallExpression', range: [4, 12] as [number, number] }
      expect(getNodeText(node, source)).toBe('bar(baz)')
    })

    test('should return text for arrow function', () => {
      const source = '(x) => x * 2'
      const node = {
        type: 'ArrowFunctionExpression',
        range: [0, source.length] as [number, number],
      }
      expect(getNodeText(node, source)).toBe(source)
    })

    test('should return text for object expression', () => {
      const source = '{ key: "value" }'
      const node = { type: 'ObjectExpression', range: [0, source.length] as [number, number] }
      expect(getNodeText(node, source)).toBe(source)
    })

    test('should return text for array expression', () => {
      const source = '[1, 2, 3]'
      const node = { type: 'ArrayExpression', range: [0, source.length] as [number, number] }
      expect(getNodeText(node, source)).toBe(source)
    })

    test('should return text for conditional expression', () => {
      const source = 'a ? b : c'
      const node = { type: 'ConditionalExpression', range: [0, source.length] as [number, number] }
      expect(getNodeText(node, source)).toBe(source)
    })
  })

  describe('cross-function integration', () => {
    test('isIdentifier and getIdentifierName work together for valid identifier', () => {
      const node = { type: 'Identifier', name: 'test' }
      expect(isIdentifier(node)).toBe(true)
      expect(getIdentifierName(node)).toBe('test')
    })

    test('isIdentifier returns false and getIdentifierName returns null for non-identifier', () => {
      const node = { type: 'Literal', value: 5 }
      expect(isIdentifier(node)).toBe(false)
      expect(getIdentifierName(node)).toBeNull()
    })

    test('isNewExpression and getCalleeName work together', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'MyClass' },
        arguments: [],
      }
      expect(isNewExpression(node)).toBe(true)
      expect(getCalleeName(node)).toBe('MyClass')
    })

    test('isCallExpression and getCalleeName work together', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'myFn' },
        arguments: [],
      }
      expect(isCallExpression(node)).toBe(true)
      expect(getCalleeName(node)).toBe('myFn')
    })

    test('isNewExpression and getArguments work together', () => {
      const node = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Array' },
        arguments: [{ type: 'Literal', value: 10 }],
      }
      expect(isNewExpression(node)).toBe(true)
      expect(getArguments(node)).toHaveLength(1)
    })

    test('isCallExpression and getArguments work together', () => {
      const node = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'fn' },
        arguments: [
          { type: 'Literal', value: 1 },
          { type: 'Literal', value: 2 },
        ],
      }
      expect(isCallExpression(node)).toBe(true)
      expect(getArguments(node)).toHaveLength(2)
    })

    test('getRange and getNodeText work together', () => {
      const source = 'const foo = 42;'
      const node = { type: 'Identifier', name: 'foo', range: [6, 9] as [number, number] }
      const range = getRange(node)
      expect(range).toEqual([6, 9])
      expect(getNodeText(node, source)).toBe('foo')
    })

    test('getRange and getNodeSource work together', () => {
      const source = 'hello world'
      const context = createMockContext(source)
      const node = { type: 'Identifier', range: [0, 5] as [number, number] }
      const range = getRange(node)
      expect(range).toEqual([0, 5])
      expect(getNodeSource(context, node)).toBe('hello')
    })

    test('all type guards return false for null', () => {
      expect(isNewExpression(null)).toBe(false)
      expect(isCallExpression(null)).toBe(false)
      expect(isMemberExpression(null)).toBe(false)
      expect(isBinaryExpression(null)).toBe(false)
      expect(isIdentifier(null)).toBe(false)
      expect(isLiteral(null)).toBe(false)
    })

    test('all type guards return false for undefined', () => {
      expect(isNewExpression(undefined)).toBe(false)
      expect(isCallExpression(undefined)).toBe(false)
      expect(isMemberExpression(undefined)).toBe(false)
      expect(isBinaryExpression(undefined)).toBe(false)
      expect(isIdentifier(undefined)).toBe(false)
      expect(isLiteral(undefined)).toBe(false)
    })

    test('all type guards return false for string', () => {
      const str = 'not a node'
      expect(isNewExpression(str)).toBe(false)
      expect(isCallExpression(str)).toBe(false)
      expect(isMemberExpression(str)).toBe(false)
      expect(isBinaryExpression(str)).toBe(false)
      expect(isIdentifier(str)).toBe(false)
      expect(isLiteral(str)).toBe(false)
    })

    test('all type guards return false for number', () => {
      expect(isNewExpression(42)).toBe(false)
      expect(isCallExpression(42)).toBe(false)
      expect(isMemberExpression(42)).toBe(false)
      expect(isBinaryExpression(42)).toBe(false)
      expect(isIdentifier(42)).toBe(false)
      expect(isLiteral(42)).toBe(false)
    })

    test('all type guards return false for boolean', () => {
      expect(isNewExpression(true)).toBe(false)
      expect(isCallExpression(true)).toBe(false)
      expect(isMemberExpression(true)).toBe(false)
      expect(isBinaryExpression(true)).toBe(false)
      expect(isIdentifier(true)).toBe(false)
      expect(isLiteral(true)).toBe(false)
    })

    test('each type guard identifies only its own type', () => {
      const newExpr = { type: 'NewExpression' }
      const callExpr = { type: 'CallExpression' }
      const memberExpr = { type: 'MemberExpression' }
      const binaryExpr = { type: 'BinaryExpression' }
      const identifier = { type: 'Identifier' }
      const literal = { type: 'Literal' }

      expect(isNewExpression(newExpr)).toBe(true)
      expect(isNewExpression(callExpr)).toBe(false)

      expect(isCallExpression(callExpr)).toBe(true)
      expect(isCallExpression(memberExpr)).toBe(false)

      expect(isMemberExpression(memberExpr)).toBe(true)
      expect(isMemberExpression(binaryExpr)).toBe(false)

      expect(isBinaryExpression(binaryExpr)).toBe(true)
      expect(isBinaryExpression(identifier)).toBe(false)

      expect(isIdentifier(identifier)).toBe(true)
      expect(isIdentifier(literal)).toBe(false)

      expect(isLiteral(literal)).toBe(true)
      expect(isLiteral(newExpr)).toBe(false)
    })

    test('getCalleeName and getArguments handle both New and Call expressions', () => {
      const newExpr = {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Foo' },
        arguments: [{ type: 'Literal', value: 1 }],
      }
      const callExpr = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'bar' },
        arguments: [{ type: 'Literal', value: 2 }],
      }

      expect(getCalleeName(newExpr)).toBe('Foo')
      expect(getCalleeName(callExpr)).toBe('bar')
      expect(getArguments(newExpr)).toHaveLength(1)
      expect(getArguments(callExpr)).toHaveLength(1)
    })
  })

  describe('isLogicalExpression', () => {
    test('should return true for LogicalExpression node', () => {
      expect(isLogicalExpression({ type: 'LogicalExpression', operator: '&&' })).toBe(true)
    })

    test('should return false for non-LogicalExpression node', () => {
      expect(isLogicalExpression({ type: 'BinaryExpression' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isLogicalExpression(null)).toBe(false)
    })

    test('should return false for undefined', () => {
      expect(isLogicalExpression(undefined)).toBe(false)
    })

    test('should return false for primitive', () => {
      expect(isLogicalExpression('LogicalExpression')).toBe(false)
    })
  })

  describe('isUnaryExpression', () => {
    test('should return true for UnaryExpression node', () => {
      expect(isUnaryExpression({ type: 'UnaryExpression', operator: '!' })).toBe(true)
    })

    test('should return false for non-UnaryExpression node', () => {
      expect(isUnaryExpression({ type: 'BinaryExpression' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isUnaryExpression(null)).toBe(false)
    })
  })

  describe('isTemplateLiteral', () => {
    test('should return true for TemplateLiteral node', () => {
      expect(isTemplateLiteral({ type: 'TemplateLiteral', quasis: [] })).toBe(true)
    })

    test('should return false for non-TemplateLiteral node', () => {
      expect(isTemplateLiteral({ type: 'Literal' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isTemplateLiteral(null)).toBe(false)
    })
  })

  describe('isFunctionExpression', () => {
    test('should return true for FunctionExpression node', () => {
      expect(isFunctionExpression({ type: 'FunctionExpression', params: [] })).toBe(true)
    })

    test('should return true for ArrowFunctionExpression node', () => {
      expect(isFunctionExpression({ type: 'ArrowFunctionExpression', params: [] })).toBe(true)
    })

    test('should return false for FunctionDeclaration', () => {
      expect(isFunctionExpression({ type: 'FunctionDeclaration' })).toBe(false)
    })

    test('should return false for non-function node', () => {
      expect(isFunctionExpression({ type: 'CallExpression' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isFunctionExpression(null)).toBe(false)
    })
  })

  describe('isReturnStatement', () => {
    test('should return true for ReturnStatement node', () => {
      expect(isReturnStatement({ type: 'ReturnStatement', argument: null })).toBe(true)
    })

    test('should return false for non-ReturnStatement node', () => {
      expect(isReturnStatement({ type: 'ExpressionStatement' })).toBe(false)
    })

    test('should return false for null', () => {
      expect(isReturnStatement(null)).toBe(false)
    })
  })
})
