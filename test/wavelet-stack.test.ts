import { describe, expect, it } from 'vitest'

import { WaveletStack } from '../src/core/wavelet-stack/index.js'

// ─── Construction ────────────────────────────────────────
describe('WaveletStack construction', () => {
  it('creates empty stack', () => {
    const stack = new WaveletStack<number>()
    expect(stack.size()).toBe(0)
    expect(stack.isEmpty()).toBe(true)
  })

  it('creates with custom alphabet size', () => {
    const stack = new WaveletStack<string>({ alphabetSize: 64 })
    expect(stack.capacity).toBe(64)
  })
})

// ─── Push/Pop/Peek ───────────────────────────────────────
describe('WaveletStack push/pop/peek', () => {
  it('pushes and peeks', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    stack.push(2)
    expect(stack.peek()).toBe(2)
    expect(stack.size()).toBe(2)
  })

  it('pops in LIFO order', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.pop()).toBe(3)
    expect(stack.pop()).toBe(2)
    expect(stack.pop()).toBe(1)
    expect(stack.isEmpty()).toBe(true)
  })

  it('throws on pop from empty stack', () => {
    const stack = new WaveletStack<number>()
    expect(() => stack.pop()).toThrow('Cannot pop from empty stack')
  })

  it('throws on peek empty stack', () => {
    const stack = new WaveletStack<number>()
    expect(() => stack.peek()).toThrow('Cannot peek empty stack')
  })
})

// ─── Count ───────────────────────────────────────────────
describe('WaveletStack count', () => {
  it('counts occurrences of an item', () => {
    const stack = new WaveletStack<string>()
    stack.push('a')
    stack.push('b')
    stack.push('a')
    expect(stack.count('a')).toBe(2)
    expect(stack.count('b')).toBe(1)
    expect(stack.count('c')).toBe(0)
  })
})

// ─── Rank/Select/Access ──────────────────────────────────
describe('WaveletStack rank/select/access', () => {
  it('rank counts occurrences up to position', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(1)
    stack.push(3)
    stack.push(1)
    expect(stack.rank(0, 1)).toBe(1)
    expect(stack.rank(2, 1)).toBe(2)
    expect(stack.rank(4, 1)).toBe(3)
  })

  it('rank throws for out-of-range position', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    expect(() => stack.rank(-1, 1)).toThrow()
    expect(() => stack.rank(1, 1)).toThrow()
  })

  it('select finds position of nth occurrence', () => {
    const stack = new WaveletStack<string>()
    stack.push('a')
    stack.push('b')
    stack.push('a')
    expect(stack.select(0, 'a')).toBe(0)
    expect(stack.select(1, 'a')).toBe(2)
    expect(stack.select(0, 'b')).toBe(1)
  })

  it('select throws for non-existent occurrence', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    expect(() => stack.select(1, 1)).toThrow()
  })

  it('select throws for negative occurrence', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    expect(() => stack.select(-1, 1)).toThrow()
  })

  it('access returns item at position', () => {
    const stack = new WaveletStack<number>()
    stack.push(10)
    stack.push(20)
    stack.push(30)
    expect(stack.access(0)).toBe(10)
    expect(stack.access(1)).toBe(20)
    expect(stack.access(2)).toBe(30)
  })

  it('access throws for out-of-range', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    expect(() => stack.access(-1)).toThrow()
    expect(() => stack.access(1)).toThrow()
  })
})

// ─── Histogram ───────────────────────────────────────────
describe('WaveletStack histogram', () => {
  it('returns correct histogram', () => {
    const stack = new WaveletStack<string>()
    stack.push('x')
    stack.push('y')
    stack.push('x')
    const hist = stack.histogram()
    expect(hist.get('x')).toBe(2)
    expect(hist.get('y')).toBe(1)
  })
})

// ─── Clone ───────────────────────────────────────────────
describe('WaveletStack clone', () => {
  it('creates independent clone', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    stack.push(2)
    const cloned = stack.clone()
    expect(cloned.toArray()).toEqual([1, 2])
    expect(cloned.size()).toBe(2)
    cloned.push(3)
    expect(stack.size()).toBe(2)
    expect(cloned.size()).toBe(3)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('WaveletStack toArray', () => {
  it('returns items in order', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.toArray()).toEqual([1, 2, 3])
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('WaveletStack clear', () => {
  it('clears the stack', () => {
    const stack = new WaveletStack<number>()
    stack.push(1)
    stack.push(2)
    stack.clear()
    expect(stack.size()).toBe(0)
    expect(stack.isEmpty()).toBe(true)
    expect(stack.count(1)).toBe(0)
  })
})

// ─── Iterator ────────────────────────────────────────────
describe('WaveletStack iterator', () => {
  it('is iterable', () => {
    const stack = new WaveletStack<number>()
    stack.push(10)
    stack.push(20)
    stack.push(30)
    const result: number[] = []
    for (const item of stack) {
      result.push(item)
    }
    expect(result).toEqual([10, 20, 30])
  })
})
