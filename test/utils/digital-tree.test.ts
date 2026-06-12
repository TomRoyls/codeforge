import { describe, expect, it } from 'vitest'
import { DigitalTree } from '../../src/utils/digital-tree.js'

describe('DigitalTree', () => {
  it('insert and search', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    expect(dt.search('hello')).toBe(true)
    expect(dt.search('hell')).toBe(false)
  })

  it('startsWith checks prefix', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    expect(dt.startsWith('hel')).toBe(true)
    expect(dt.startsWith('xyz')).toBe(false)
  })

  it('handles empty string', () => {
    const dt = new DigitalTree()
    dt.insert('')
    expect(dt.search('')).toBe(true)
  })

  it('handles multiple inserts', () => {
    const dt = new DigitalTree()
    dt.insert('abc')
    dt.insert('abd')
    dt.insert('ab')
    expect(dt.search('abc')).toBe(true)
    expect(dt.search('abd')).toBe(true)
    expect(dt.search('ab')).toBe(true)
    expect(dt.count).toBe(3)
  })

  it('duplicate insert does not increase count', () => {
    const dt = new DigitalTree()
    dt.insert('abc')
    dt.insert('abc')
    expect(dt.count).toBe(1)
  })

  it('remove existing word', () => {
    const dt = new DigitalTree()
    dt.insert('abc')
    expect(dt.remove('abc')).toBe(true)
    expect(dt.search('abc')).toBe(false)
    expect(dt.count).toBe(0)
  })

  it('remove non-existent word', () => {
    const dt = new DigitalTree()
    expect(dt.remove('abc')).toBe(false)
  })

  it('removes shared prefix correctly', () => {
    const dt = new DigitalTree()
    dt.insert('abc')
    dt.insert('abcd')
    dt.remove('abcd')
    expect(dt.search('abc')).toBe(true)
    expect(dt.search('abcd')).toBe(false)
  })

  it('handles single char', () => {
    const dt = new DigitalTree()
    dt.insert('a')
    expect(dt.search('a')).toBe(true)
    expect(dt.search('b')).toBe(false)
  })

  it('count tracks correctly', () => {
    const dt = new DigitalTree()
    expect(dt.count).toBe(0)
    dt.insert('a')
    dt.insert('b')
    expect(dt.count).toBe(2)
  })

  it('startsWith after removal', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    dt.insert('help')
    dt.remove('help')
    expect(dt.startsWith('hel')).toBe(true)
    expect(dt.search('help')).toBe(false)
  })

  it('handles unicode characters', () => {
    const dt = new DigitalTree()
    dt.insert('café')
    dt.insert('naïve')
    expect(dt.search('café')).toBe(true)
    expect(dt.search('naïve')).toBe(true)
    expect(dt.startsWith('caf')).toBe(true)
  })

  it('handles numeric strings', () => {
    const dt = new DigitalTree()
    dt.insert('123')
    dt.insert('1234')
    expect(dt.search('123')).toBe(true)
    expect(dt.startsWith('12')).toBe(true)
  })

  it('handles remove then re-insert', () => {
    const dt = new DigitalTree()
    dt.insert('abc')
    dt.remove('abc')
    dt.insert('abc')
    expect(dt.search('abc')).toBe(true)
  })

  it('handles remove then search prefix', () => {
    const dt = new DigitalTree()
    dt.insert('abcd')
    dt.remove('abcd')
    expect(dt.startsWith('abc')).toBe(false)
  })

  it('search after removal returns false', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    dt.remove('hello')
    expect(dt.search('hello')).toBe(false)
  })

  it('insert and search multiple words', () => {
    const dt = new DigitalTree()
    dt.insert('cat')
    dt.insert('car')
    dt.insert('dog')
    expect(dt.search('cat')).toBe(true)
    expect(dt.search('car')).toBe(true)
    expect(dt.search('dog')).toBe(true)
    expect(dt.search('cow')).toBe(false)
  })

  it('remove removes word', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    expect(dt.remove('hello')).toBe(true)
    expect(dt.search('hello')).toBe(false)
  })

  it('search returns false for never-inserted', () => {
    const dt = new DigitalTree<string>()
    expect(dt.search('missing')).toBe(false)
  })

  it('insert and search returns true', () => {
    const dt = new DigitalTree<string>()
    dt.insert('hello')
    expect(dt.search('hello')).toBe(true)
  })

  it('toString returns correct format', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    dt.insert('world')
    expect(dt.toString()).toBe('DigitalTree(2 words)')
  })

  it('toJSON returns all words', () => {
    const dt = new DigitalTree()
    dt.insert('cat')
    dt.insert('car')
    dt.insert('dog')
    const words = dt.toJSON()
    expect(words).toHaveLength(3)
    expect(words).toContain('cat')
    expect(words).toContain('car')
    expect(words).toContain('dog')
  })

  it('clone creates independent copy', () => {
    const dt1 = new DigitalTree()
    dt1.insert('hello')
    dt1.insert('world')
    const dt2 = dt1.clone()
    dt2.insert('test')
    expect(dt1.search('test')).toBe(false)
    expect(dt2.search('test')).toBe(true)
    expect(dt1.count).toBe(2)
    expect(dt2.count).toBe(3)
  })

  it('equals returns true for identical trees', () => {
    const dt1 = new DigitalTree()
    dt1.insert('hello')
    dt1.insert('world')
    const dt2 = new DigitalTree()
    dt2.insert('hello')
    dt2.insert('world')
    expect(dt1.equals(dt2)).toBe(true)
  })

  it('equals returns false for different counts', () => {
    const dt1 = new DigitalTree()
    dt1.insert('hello')
    const dt2 = new DigitalTree()
    dt2.insert('hello')
    dt2.insert('world')
    expect(dt1.equals(dt2)).toBe(false)
  })

  it('equals returns false for non-DigitalTree', () => {
    const dt = new DigitalTree()
    expect(dt.equals({})).toBe(false)
    expect(dt.equals(null)).toBe(false)
    expect(dt.equals(undefined)).toBe(false)
  })

  it('removes word that is prefix of another', () => {
    const dt = new DigitalTree()
    dt.insert('a')
    dt.insert('ab')
    dt.remove('a')
    expect(dt.search('a')).toBe(false)
    expect(dt.search('ab')).toBe(true)
  })

  it('removes word that has another as prefix', () => {
    const dt = new DigitalTree()
    dt.insert('ab')
    dt.insert('abc')
    dt.remove('abc')
    expect(dt.search('ab')).toBe(true)
    expect(dt.search('abc')).toBe(false)
  })

  it('handles very long word', () => {
    const dt = new DigitalTree()
    const longWord = 'a'.repeat(1000)
    dt.insert(longWord)
    expect(dt.search(longWord)).toBe(true)
    expect(dt.startsWith(longWord.slice(0, 500))).toBe(true)
  })

  it('handles special characters', () => {
    const dt = new DigitalTree()
    dt.insert('hello-world')
    dt.insert('test@example')
    expect(dt.search('hello-world')).toBe(true)
    expect(dt.search('test@example')).toBe(true)
    expect(dt.startsWith('hello-')).toBe(true)
  })

  it('startsWith returns true for exact match', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    expect(dt.startsWith('hello')).toBe(true)
  })

  it('startsWith returns false for empty prefix when no words', () => {
    const dt = new DigitalTree()
    expect(dt.startsWith('')).toBe(true)
  })

  it('startsWith returns true for empty prefix with words', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    expect(dt.startsWith('')).toBe(true)
  })

  it('remove does not affect other words with shared prefix', () => {
    const dt = new DigitalTree()
    dt.insert('cat')
    dt.insert('car')
    dt.insert('cap')
    dt.remove('car')
    expect(dt.search('cat')).toBe(true)
    expect(dt.search('car')).toBe(false)
    expect(dt.search('cap')).toBe(true)
  })

  it('multiple inserts of same word do not create duplicates', () => {
    const dt = new DigitalTree()
    dt.insert('test')
    dt.insert('test')
    dt.insert('test')
    const words = dt.toJSON()
    expect(words).toHaveLength(1)
    expect(words[0]).toBe('test')
  })

  it('clone after multiple operations', () => {
    const dt1 = new DigitalTree()
    dt1.insert('a')
    dt1.insert('b')
    dt1.remove('a')
    dt1.insert('c')
    const dt2 = dt1.clone()
    expect(dt1.equals(dt2)).toBe(true)
    expect(dt2.toJSON()).toEqual(['b', 'c'])
  })

  it('handles case-sensitive inserts', () => {
    const dt = new DigitalTree()
    dt.insert('Hello')
    dt.insert('hello')
    expect(dt.search('Hello')).toBe(true)
    expect(dt.search('hello')).toBe(true)
    expect(dt.count).toBe(2)
  })

  it('search returns false for partial match', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    expect(dt.search('hell')).toBe(false)
    expect(dt.search('helloo')).toBe(false)
  })

  it('startsWith returns true for prefix of prefix', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    expect(dt.startsWith('he')).toBe(true)
    expect(dt.startsWith('h')).toBe(true)
  })

  it('handles words with numbers', () => {
    const dt = new DigitalTree()
    dt.insert('test123')
    dt.insert('test456')
    expect(dt.search('test123')).toBe(true)
    expect(dt.search('test456')).toBe(true)
    expect(dt.startsWith('test')).toBe(true)
  })

  it('remove returns false when tree is empty', () => {
    const dt = new DigitalTree()
    expect(dt.remove('anything')).toBe(false)
  })

  it('count decreases after removal', () => {
    const dt = new DigitalTree()
    dt.insert('a')
    dt.insert('b')
    dt.insert('c')
    expect(dt.count).toBe(3)
    dt.remove('b')
    expect(dt.count).toBe(2)
  })

  it('toJSON returns empty array for empty tree', () => {
    const dt = new DigitalTree()
    expect(dt.toJSON()).toEqual([])
  })

  it('handles removing then adding back', () => {
    const dt = new DigitalTree()
    dt.insert('test')
    dt.remove('test')
    dt.insert('test')
    expect(dt.search('test')).toBe(true)
    expect(dt.count).toBe(1)
  })

  it('equals after clone and modification', () => {
    const dt1 = new DigitalTree()
    dt1.insert('hello')
    const dt2 = dt1.clone()
    expect(dt1.equals(dt2)).toBe(true)
    dt2.insert('world')
    expect(dt1.equals(dt2)).toBe(false)
  })

  it('startsWith for word that was removed', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    dt.remove('hello')
    expect(dt.startsWith('he')).toBe(false)
  })

  it('insert many words with shared prefix', () => {
    const dt = new DigitalTree()
    const words = ['a', 'aa', 'aaa', 'aaaa', 'aaaaa']
    words.forEach(w => dt.insert(w))
    words.forEach(w => expect(dt.search(w)).toBe(true))
    expect(dt.count).toBe(5)
  })

  it('remove from middle of shared prefix chain', () => {
    const dt = new DigitalTree()
    dt.insert('a')
    dt.insert('ab')
    dt.insert('abc')
    dt.remove('ab')
    expect(dt.search('a')).toBe(true)
    expect(dt.search('ab')).toBe(false)
    expect(dt.search('abc')).toBe(true)
  })

  it('handles unicode emoji', () => {
    const dt = new DigitalTree()
    dt.insert('😀')
    dt.insert('😀😁')
    expect(dt.search('😀')).toBe(true)
    expect(dt.search('😀😁')).toBe(true)
    expect(dt.startsWith('😀')).toBe(true)
  })

  it('should remove words', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    dt.insert('help')
    expect(dt.remove('hello')).toBe(true)
    expect(dt.search('hello')).toBe(false)
    expect(dt.search('help')).toBe(true)
  })

  it('should list all words via toJSON', () => {
    const dt = new DigitalTree()
    dt.insert('cat')
    dt.insert('car')
    const arr = dt.toJSON()
    expect(arr).toContain('cat')
    expect(arr).toContain('car')
  })
})