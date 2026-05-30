import { describe, expect, it } from 'vitest'
import { Rope } from '../../../src/utils/rope.js'

describe('Rope', () => {
  it('should create empty rope', () => {
    const rope = new Rope()
    expect(rope.length).toBe(0)
    expect(rope.toString()).toBe('')
  })

  it('should create rope from string', () => {
    const rope = new Rope('hello')
    expect(rope.length).toBe(5)
    expect(rope.toString()).toBe('hello')
  })

  it('should create rope from empty string', () => {
    const rope = new Rope('')
    expect(rope.length).toBe(0)
    expect(rope.toString()).toBe('')
  })

  it('should get character at index', () => {
    const rope = new Rope('hello')
    expect(rope.index(0)).toBe('h')
    expect(rope.index(1)).toBe('e')
    expect(rope.index(4)).toBe('o')
  })

  it('should throw for out of bounds index', () => {
    const rope = new Rope('hello')
    expect(() => rope.index(-1)).toThrow(RangeError)
    expect(() => rope.index(5)).toThrow(RangeError)
  })

  it('should throw for index on empty rope', () => {
    const rope = new Rope()
    expect(() => rope.index(0)).toThrow(RangeError)
  })

  it('should concatenate two ropes', () => {
    const rope1 = new Rope('hello')
    const rope2 = new Rope(' world')
    const result = rope1.concat(rope2)
    expect(result.toString()).toBe('hello world')
    expect(result.length).toBe(11)
  })

  it('should concatenate with empty rope', () => {
    const rope1 = new Rope('hello')
    const rope2 = new Rope()
    const result = rope1.concat(rope2)
    expect(result.toString()).toBe('hello')
    expect(result.length).toBe(5)
  })

  it('should concatenate two empty ropes', () => {
    const rope1 = new Rope()
    const rope2 = new Rope()
    const result = rope1.concat(rope2)
    expect(result.length).toBe(0)
    expect(result.toString()).toBe('')
  })

  it('should split rope at position', () => {
    const rope = new Rope('hello world')
    const [left, right] = rope.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe(' world')
    expect(left.length).toBe(5)
    expect(right.length).toBe(6)
  })

  it('should split at beginning', () => {
    const rope = new Rope('hello')
    const [left, right] = rope.split(0)
    expect(left.length).toBe(0)
    expect(right.toString()).toBe('hello')
  })

  it('should split at end', () => {
    const rope = new Rope('hello')
    const [left, right] = rope.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.length).toBe(0)
  })

  it('should split empty rope', () => {
    const rope = new Rope()
    const [left, right] = rope.split(0)
    expect(left.length).toBe(0)
    expect(right.length).toBe(0)
  })

  it('should insert text at position', () => {
    const rope = new Rope('helo')
    rope.insert(2, 'l')
    expect(rope.toString()).toBe('hello')
    expect(rope.length).toBe(5)
  })

  it('should insert at beginning', () => {
    const rope = new Rope('ello')
    rope.insert(0, 'h')
    expect(rope.toString()).toBe('hello')
  })

  it('should insert at end', () => {
    const rope = new Rope('hell')
    rope.insert(4, 'o')
    expect(rope.toString()).toBe('hello')
  })

  it('should insert empty string', () => {
    const rope = new Rope('hello')
    rope.insert(2, '')
    expect(rope.toString()).toBe('hello')
    expect(rope.length).toBe(5)
  })

  it('should insert into empty rope', () => {
    const rope = new Rope()
    rope.insert(0, 'hello')
    expect(rope.toString()).toBe('hello')
  })

  it('should insert multiple characters', () => {
    const rope = new Rope('he')
    rope.insert(2, 'llo')
    expect(rope.toString()).toBe('hello')
  })

  it('should delete range', () => {
    const rope = new Rope('hello world')
    rope.delete(5, 1)
    expect(rope.toString()).toBe('helloworld')
    expect(rope.length).toBe(10)
  })

  it('should delete multiple characters', () => {
    const rope = new Rope('hello world')
    rope.delete(5, 6)
    expect(rope.toString()).toBe('hello')
    expect(rope.length).toBe(5)
  })

  it('should delete at beginning', () => {
    const rope = new Rope('hello')
    rope.delete(0, 2)
    expect(rope.toString()).toBe('llo')
  })

  it('should delete at end', () => {
    const rope = new Rope('hello')
    rope.delete(3, 2)
    expect(rope.toString()).toBe('hel')
  })

  it('should delete empty range', () => {
    const rope = new Rope('hello')
    rope.delete(2, 0)
    expect(rope.toString()).toBe('hello')
  })

  it('should delete entire string', () => {
    const rope = new Rope('hello')
    rope.delete(0, 5)
    expect(rope.length).toBe(0)
    expect(rope.toString()).toBe('')
  })

  it('should handle delete past end', () => {
    const rope = new Rope('hello')
    rope.delete(3, 10)
    expect(rope.toString()).toBe('hel')
    expect(rope.length).toBe(3)
  })

  it('should handle delete from empty rope', () => {
    const rope = new Rope()
    rope.delete(0, 5)
    expect(rope.length).toBe(0)
  })

  it('should clone rope', () => {
    const rope = new Rope('hello')
    const clone = rope.clone()
    expect(clone.toString()).toBe('hello')
    expect(clone.length).toBe(5)

    clone.insert(5, ' world')
    expect(rope.toString()).toBe('hello')
    expect(clone.toString()).toBe('hello world')
  })

  it('should clone empty rope', () => {
    const rope = new Rope()
    const clone = rope.clone()
    expect(clone.length).toBe(0)
  })

  it('should handle large text', () => {
    const text = 'a'.repeat(1000)
    const rope = new Rope(text)
    expect(rope.length).toBe(1000)
    expect(rope.toString()).toBe(text)
    expect(rope.index(0)).toBe('a')
    expect(rope.index(999)).toBe('a')
  })

  it('should insert into large rope', () => {
    const rope = new Rope('a'.repeat(1000))
    rope.insert(500, 'b')
    expect(rope.length).toBe(1001)
    expect(rope.index(500)).toBe('b')
    expect(rope.index(499)).toBe('a')
    expect(rope.index(501)).toBe('a')
  })

  it('should delete from large rope', () => {
    const rope = new Rope('a'.repeat(1000))
    rope.delete(100, 50)
    expect(rope.length).toBe(950)
  })

  it('should split large rope', () => {
    const rope = new Rope('a'.repeat(1000))
    const [left, right] = rope.split(500)
    expect(left.length).toBe(500)
    expect(right.length).toBe(500)
  })

  it('should concat large ropes', () => {
    const rope1 = new Rope('a'.repeat(500))
    const rope2 = new Rope('b'.repeat(500))
    const result = rope1.concat(rope2)
    expect(result.length).toBe(1000)
    expect(result.toString()).toBe('a'.repeat(500) + 'b'.repeat(500))
  })

  it('should handle multiple consecutive inserts', () => {
    const rope = new Rope()
    rope.insert(0, 'h')
    rope.insert(1, 'e')
    rope.insert(2, 'l')
    rope.insert(3, 'l')
    rope.insert(4, 'o')
    expect(rope.toString()).toBe('hello')
  })

  it('should handle insert, delete, insert sequence', () => {
    const rope = new Rope('hello world')
    rope.delete(5, 6)
    rope.insert(5, ' there')
    expect(rope.toString()).toBe('hello there')
  })

  it('should handle split then concat', () => {
    const rope = new Rope('hello world')
    const [left, right] = rope.split(5)
    const combined = left.concat(right)
    expect(combined.toString()).toBe('hello world')
  })
})