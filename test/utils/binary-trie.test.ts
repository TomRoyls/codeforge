import { describe, expect, it } from 'vitest'
import { BinaryTrie } from '../../src/utils/binary-trie.js'

describe('BinaryTrie', () => {
  it('inserts and finds', () => {
    const bt = new BinaryTrie(8)
    bt.insert(5)
    expect(bt.find(5)).toBe(true)
    expect(bt.find(6)).toBe(false)
  })

  it('handles multiple inserts', () => {
    const bt = new BinaryTrie(8)
    bt.insert(1)
    bt.insert(2)
    bt.insert(3)
    expect(bt.size).toBe(3)
    expect(bt.find(1)).toBe(true)
    expect(bt.find(2)).toBe(true)
    expect(bt.find(4)).toBe(false)
  })

  it('maxXor finds best match', () => {
    const bt = new BinaryTrie(8)
    bt.insert(2)
    bt.insert(4)
    bt.insert(7)
    expect(bt.maxXor(5)).toBe(7)
  })

  it('removes element', () => {
    const bt = new BinaryTrie(8)
    bt.insert(5)
    expect(bt.remove(5)).toBe(true)
    expect(bt.find(5)).toBe(false)
    expect(bt.size).toBe(0)
  })

  it('remove non-existent returns false', () => {
    const bt = new BinaryTrie(8)
    expect(bt.remove(42)).toBe(false)
  })

  it('handles zero', () => {
    const bt = new BinaryTrie(4)
    bt.insert(0)
    expect(bt.find(0)).toBe(true)
    expect(bt.maxXor(0)).toBe(0)
  })

  it('handles max value', () => {
    const bt = new BinaryTrie(4)
    bt.insert(15)
    expect(bt.find(15)).toBe(true)
    expect(bt.maxXor(0)).toBe(15)
  })

  it('maxXor with multiple candidates', () => {
    const bt = new BinaryTrie(4)
    bt.insert(3)
    bt.insert(10)
    expect(bt.maxXor(5)).toBeGreaterThanOrEqual(5 ^ 10)
  })

  it('duplicate insert increments count', () => {
    const bt = new BinaryTrie(8)
    bt.insert(5)
    bt.insert(5)
    expect(bt.size).toBe(2)
    bt.remove(5)
    expect(bt.find(5)).toBe(true)
  })

  it('maxXor returns 0 for same value', () => {
    const bt = new BinaryTrie(4)
    bt.insert(5)
    expect(bt.maxXor(5)).toBe(0)
  })

  it('handles 16-bit values', () => {
    const bt = new BinaryTrie(16)
    bt.insert(1000)
    bt.insert(2000)
    expect(bt.find(1000)).toBe(true)
    expect(bt.maxXor(0)).toBe(2000)
  })

  it('handles zero insertion', () => {
    const bt = new BinaryTrie(4)
    bt.insert(0)
    expect(bt.find(0)).toBe(true)
    expect(bt.size).toBe(1)
  })
})
