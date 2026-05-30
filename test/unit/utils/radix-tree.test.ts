import { describe, expect, it } from 'vitest'
import { RadixTree } from '../../../src/utils/radix-tree.js'

describe('RadixTree', () => {
  it('should create an empty RadixTree', () => {
    const tree = new RadixTree<string>()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
  })

  it('should insert and retrieve a value', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', 'world')
    expect(tree.get('hello')).toBe('world')
  })

  it('should return undefined for non-existent key', () => {
    const tree = new RadixTree<string>()
    expect(tree.get('nonexistent')).toBeUndefined()
  })

  it('should check if key exists with has()', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', 'world')
    expect(tree.has('hello')).toBe(true)
    expect(tree.has('nonexistent')).toBe(false)
  })

  it('should delete a key', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', 'world')
    const result = tree.delete('hello')
    expect(result).toBe(true)
    expect(tree.get('hello')).toBeUndefined()
    expect(tree.size).toBe(0)
  })

  it('should not delete non-existent key', () => {
    const tree = new RadixTree<string>()
    const result = tree.delete('nonexistent')
    expect(result).toBe(false)
  })

  it('should find prefix matches', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', '1')
    tree.insert('helicopter', '2')
    tree.insert('help', '3')
    tree.insert('world', '4')
    const results = tree.startsWith('hel')
    expect(results).toHaveLength(3)
    expect(results[0][0]).toBe('hello')
  })

  it('should handle empty string key', () => {
    const tree = new RadixTree<string>()
    tree.insert('', 'empty')
    expect(tree.get('')).toBe('empty')
    expect(tree.has('')).toBe(true)
  })

  it('should handle keys with common prefixes', () => {
    const tree = new RadixTree<number>()
    tree.insert('apple', 1)
    tree.insert('app', 2)
    tree.insert('application', 3)
    expect(tree.get('apple')).toBe(1)
    expect(tree.get('app')).toBe(2)
    expect(tree.get('application')).toBe(3)
  })

  it('should overwrite existing value', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', 'world')
    tree.insert('hello', 'universe')
    expect(tree.get('hello')).toBe('universe')
    expect(tree.size).toBe(1)
  })

  it('should clear all entries', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', 'world')
    tree.insert('world', 'earth')
    tree.clear()
    expect(tree.size).toBe(0)
    expect(tree.isEmpty()).toBe(true)
    expect(tree.get('hello')).toBeUndefined()
  })

  it('should track size correctly', () => {
    const tree = new RadixTree<string>()
    expect(tree.size).toBe(0)
    tree.insert('a', '1')
    expect(tree.size).toBe(1)
    tree.insert('b', '2')
    expect(tree.size).toBe(2)
    tree.insert('c', '3')
    expect(tree.size).toBe(3)
  })

  it('should update size on delete', () => {
    const tree = new RadixTree<string>()
    tree.insert('a', '1')
    tree.insert('b', '2')
    tree.insert('c', '3')
    tree.delete('b')
    expect(tree.size).toBe(2)
  })

  it('should find all keys', () => {
    const tree = new RadixTree<number>()
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    tree.insert('cherry', 3)
    const keys = tree.keys()
    expect(keys).toHaveLength(3)
    expect(keys).toContain('apple')
  })

  it('should find all values', () => {
    const tree = new RadixTree<number>()
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    tree.insert('cherry', 3)
    const values = tree.values()
    expect(values).toHaveLength(3)
    expect(values).toContain(1)
  })

  it('should get all entries', () => {
    const tree = new RadixTree<number>()
    tree.insert('apple', 1)
    tree.insert('banana', 2)
    const entries = tree.entries()
    expect(entries).toHaveLength(2)
  })

  it('should find longest prefix of key', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', '1')
    tree.insert('hello world', '2')
    tree.insert('helloworld', '3')
    const result = tree.longestPrefixOf('hello world test')
    expect(result).toBe('hello world')
  })

  it('should return undefined for longest prefix when no match', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', '1')
    const result = tree.longestPrefixOf('xyz')
    expect(result).toBeUndefined()
  })

  it('should handle single character keys', () => {
    const tree = new RadixTree<string>()
    tree.insert('a', '1')
    tree.insert('b', '2')
    tree.insert('c', '3')
    expect(tree.get('a')).toBe('1')
    expect(tree.size).toBe(3)
  })

  it('should handle numeric keys', () => {
    const tree = new RadixTree<number>()
    tree.insert('123', 1)
    tree.insert('124', 2)
    tree.insert('125', 3)
    expect(tree.get('123')).toBe(1)
  })

  it('should handle case sensitivity', () => {
    const tree = new RadixTree<string>()
    tree.insert('Hello', '1')
    tree.insert('hello', '2')
    expect(tree.get('Hello')).toBe('1')
    expect(tree.get('hello')).toBe('2')
    expect(tree.size).toBe(2)
  })

  it('should find prefix with no matches', () => {
    const tree = new RadixTree<string>()
    tree.insert('apple', '1')
    tree.insert('banana', '2')
    const results = tree.startsWith('xyz')
    expect(results).toHaveLength(0)
  })

  it('should handle deeply nested prefixes', () => {
    const tree = new RadixTree<number>()
    tree.insert('a', 1)
    tree.insert('ab', 2)
    tree.insert('abc', 3)
    tree.insert('abcd', 4)
    expect(tree.size).toBe(4)
    const results = tree.startsWith('ab')
    expect(results.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle value of different types', () => {
    const tree = new RadixTree<{ data: string }>()
    tree.insert('obj1', { data: 'value1' })
    tree.insert('obj2', { data: 'value2' })
    const result = tree.get('obj1')
    expect(result?.data).toBe('value1')
  })

  it('should find prefix matches including exact match', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello', '1')
    tree.insert('help', '2')
    const results = tree.startsWith('hello')
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle keys with special characters', () => {
    const tree = new RadixTree<string>()
    tree.insert('hello-world', '1')
    tree.insert('hello_world', '2')
    expect(tree.get('hello-world')).toBe('1')
    expect(tree.get('hello_world')).toBe('2')
  })

  it('should handle insertion of many keys', () => {
    const tree = new RadixTree<number>()
    for (let i = 0; i < 100; i++) {
      tree.insert(`key${i}`, i)
    }
    expect(tree.size).toBe(100)
    expect(tree.get('key50')).toBe(50)
  })

  it('should compress nodes after deletion', () => {
    const tree = new RadixTree<string>()
    tree.insert('romane', '1')
    tree.insert('romanus', '2')
    tree.insert('romulus', '3')
    tree.delete('romulus')
    expect(tree.size).toBe(2)
  })
})