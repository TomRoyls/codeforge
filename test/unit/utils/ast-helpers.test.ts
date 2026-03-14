import { describe, test, expect } from 'vitest'
import {
  getCalleeName,
  getArguments,
  isIdentifier,
  isLiteral,
  isNewExpression,
  isCallExpression,
  isMemberExpression,
  getIdentifierName,
  getRange,
  getNodeSource,
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
  })
})
