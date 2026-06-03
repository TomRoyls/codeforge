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

  it('handles empty string', () => {
    const dt = new DigitalTree()
    dt.insert('')
    expect(dt.search('')).toBe(true)
    expect(dt.search('a')).toBe(false)
  })

  it('handles remove non-existent', () => {
    const dt = new DigitalTree()
    dt.insert('abc')
    expect(dt.remove('xyz')).toBe(false)
    expect(dt.search('abc')).toBe(true)
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

  it('startsWith checks prefix', () => {
    const dt = new DigitalTree()
    dt.insert('hello')
    expect(dt.startsWith('hel')).toBe(true)
    expect(dt.startsWith('xyz')).toBe(false)
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
})
