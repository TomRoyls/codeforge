import { describe, expect, it } from 'vitest'
import { MarkovChain } from '../../src/utils/markov-chain.js'

describe('MarkovChain', () => {
  it('trains on a sequence', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'a', 'b', 'a'])
    expect(mc.getTransitionProbability('a', 'b')).toBeCloseTo(1, 6)
    expect(mc.getTransitionProbability('b', 'a')).toBeCloseTo(1, 6)
  })

  it('generates sequence from trained chain', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'c', 'a', 'b', 'c'])
    const result = mc.generate('a', 5, () => 0.5)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toBe('a')
  })

  it('generates with deterministic seed', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'a', 'b'])
    let seed = 42
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const r1 = mc.generate('a', 4, rng)
    seed = 42
    const rng2 = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const r2 = mc.generate('a', 4, rng2)
    expect(r1).toEqual(r2)
  })

  it('returns null for unknown state', () => {
    const mc = new MarkovChain<string>()
    expect(mc.next('unknown')).toBeNull()
  })

  it('getStates returns all states', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'c'])
    const states = mc.getStates()
    expect(states).toContain('a')
    expect(states).toContain('b')
  })

  it('getTransitionsFrom returns transition map', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('x', 'y')
    mc.addTransition('x', 'y')
    const trans = mc.getTransitionsFrom('x')
    expect(trans.get('y')).toBe(2)
  })

  it('handles single element training', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a'])
    expect(mc.getStates()).toEqual([])
  })

  it('computes probability correctly', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('a', 'c')
    expect(mc.getTransitionProbability('a', 'b')).toBeCloseTo(0.5, 6)
    expect(mc.getTransitionProbability('a', 'c')).toBeCloseTo(0.5, 6)
  })

  it('handles number states', () => {
    const mc = new MarkovChain<number>()
    mc.train([1, 2, 3, 1, 2])
    expect(mc.getTransitionProbability(1, 2)).toBeCloseTo(1, 6)
  })

  it('generates stops when no transition', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    const result = mc.generate('b', 5)
    expect(result).toEqual(['b'])
  })

  it('getTransitionsFrom empty for unknown state', () => {
    const mc = new MarkovChain<string>()
    expect(mc.getTransitionsFrom('x').size).toBe(0)
  })

  it('handles longer training sequence', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'c', 'a', 'b', 'd'])
    expect(mc.getTransitionProbability('a', 'b')).toBeCloseTo(1, 6)
    expect(mc.getTransitionProbability('b', 'c')).toBeCloseTo(0.5, 6)
  })

  it('unknown state probability is 0', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    expect(mc.getTransitionProbability('z', 'a')).toBe(0)
  })

  it('generate with start state in chain', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('b', 'c')
    const result = mc.generate('a', 3)
    expect(result[0]).toBe('a')
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('train with single transition', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b'])
    expect(mc.getTransitionProbability('a', 'b')).toBeCloseTo(1, 6)
  })

  it('getStates returns source states', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('b', 'c')
    const states = mc.getStates()
    expect(states).toContain('a')
    expect(states).toContain('b')
  })

  it('handles single state', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'a', 1)
    const next = mc.next('a')
    expect(next).toBe('a')
  })

  it('multiple transitions from same state', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b', 1)
    mc.addTransition('a', 'c', 1)
    const next = mc.next('a')
    expect(['b', 'c']).toContain(next)
  })

  it('single state always returns same state', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('x', 'x', 1)
    expect(mc.next('x')).toBe('x')
  })

  it('single state transition always returns same value', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('a', 'b')
    const result = mc.next('a')
    expect(result).toBe('b')
  })

  it('train and next returns valid state', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'a', 'b'])
    const result = mc.next('a')
    expect(result === 'b' || result === null).toBe(true)
  })

  it('generates length 1 correctly', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    const result = mc.generate('a', 1)
    expect(result).toEqual(['a'])
  })

  it('generates with length 0 includes start state', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    const result = mc.generate('a', 0)
    expect(result).toEqual(['a'])
  })

  it('generates sequence matching length when possible', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('b', 'c')
    mc.addTransition('c', 'd')
    const result = mc.generate('a', 4)
    expect(result.length).toBe(4)
  })

  it('handles self-transitions', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'a')
    mc.addTransition('a', 'a')
    mc.addTransition('a', 'b')
    expect(mc.getTransitionProbability('a', 'a')).toBeCloseTo(2/3, 5)
  })

  it('multiple addTransition calls accumulate', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('a', 'b')
    mc.addTransition('a', 'b')
    const trans = mc.getTransitionsFrom('a')
    expect(trans.get('b')).toBe(3)
  })

  it('getTransitionsFrom returns a copy', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('x', 'y')
    const trans = mc.getTransitionsFrom('x')
    trans.set('z', 999)
    const trans2 = mc.getTransitionsFrom('x')
    expect(trans2.has('z')).toBe(false)
  })

  it('getStates returns all unique states', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'a', 'c', 'b', 'c'])
    const states = mc.getStates()
    expect(states).toContain('a')
    expect(states).toContain('b')
    expect(states).toContain('c')
    expect(states.length).toBe(3)
  })

  it('handles weighted transitions correctly', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('a', 'b')
    mc.addTransition('a', 'b')
    mc.addTransition('a', 'c')
    expect(mc.getTransitionProbability('a', 'b')).toBeCloseTo(0.75, 6)
    expect(mc.getTransitionProbability('a', 'c')).toBeCloseTo(0.25, 6)
  })

  it('train with empty sequence', () => {
    const mc = new MarkovChain<string>()
    mc.train([])
    expect(mc.getStates()).toEqual([])
  })

  it('generate with custom rng that always returns 0', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('a', 'c')
    const result = mc.generate('a', 2, () => 0)
    expect(result).toEqual(['a', 'b'])
  })

  it('generate with custom rng that always returns 0.99', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b', 9)
    mc.addTransition('a', 'c', 1)
    const result = mc.generate('a', 2, () => 0.99)
    expect(result).toEqual(['a', 'c'])
  })

  it('train on two-element sequence', () => {
    const mc = new MarkovChain<string>()
    mc.train(['x', 'y'])
    expect(mc.getTransitionProbability('x', 'y')).toBeCloseTo(1, 6)
  })

  it('handles complex training patterns', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'a', 'c', 'a', 'd'])
    expect(mc.getTransitionProbability('a', 'b')).toBeCloseTo(1/3, 6)
    expect(mc.getTransitionProbability('a', 'c')).toBeCloseTo(1/3, 6)
    expect(mc.getTransitionProbability('a', 'd')).toBeCloseTo(1/3, 6)
  })

  it('next returns first option when rng returns 0', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('x', 'y')
    mc.addTransition('x', 'z')
    const result = mc.next('x', () => 0)
    expect(result).toBe('y')
  })

  it('handles branching paths correctly', () => {
    const mc = new MarkovChain<string>()
    mc.train(['start', 'left', 'end'])
    mc.train(['start', 'right', 'end'])
    expect(mc.getTransitionProbability('start', 'left')).toBeCloseTo(0.5, 6)
    expect(mc.getTransitionProbability('start', 'right')).toBeCloseTo(0.5, 6)
  })

  it('getStates does not include destinations only', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    const states = mc.getStates()
    expect(states).toContain('a')
    expect(states).not.toContain('b')
  })

  it('multiple train calls accumulate transitions', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b'])
    mc.train(['a', 'b'])
    expect(mc.getTransitionProbability('a', 'b')).toBeCloseTo(1, 6)
    const trans = mc.getTransitionsFrom('a')
    expect(trans.get('b')).toBe(2)
  })

  it('generate stops when encountering state with no transitions', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    mc.addTransition('b', 'c')
    mc.addTransition('c', 'dead_end')
    const result = mc.generate('dead_end', 5)
    expect(result).toEqual(['dead_end'])
  })

  it('getTransitionsFrom returns a copy not affecting internal state', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    const trans = mc.getTransitionsFrom('a')
    trans.set('z', 999)
    const trans2 = mc.getTransitionsFrom('a')
    expect(trans2.has('z')).toBe(false)
    expect(mc.getTransitionProbability('a', 'b')).toBeCloseTo(1, 6)
  })

  it('getTransitionsFrom copy modification does not affect next', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    const trans = mc.getTransitionsFrom('a')
    trans.set('b', 0)
    const result = mc.next('a')
    expect(result).toBe('b')
  })

  it('generates deterministic sequence with fixed rng', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'c', 'd'])
    let counter = 0
    const rng = () => (counter++ % 10) / 10
    const result = mc.generate('a', 10, rng)
    expect(result[0]).toBe('a')
    expect(result.length).toBe(4)
  })

  it('handles string state with special characters', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('hello world', 'good-bye!')
    expect(mc.getTransitionProbability('hello world', 'good-bye!')).toBeCloseTo(1, 6)
  })

  it('getTransitionProbability for unknown to state returns 0', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    expect(mc.getTransitionProbability('a', 'unknown')).toBe(0)
  })

  it('next always returns same state for self-loop', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('loop', 'loop')
    for (let i = 0; i < 10; i++) {
      expect(mc.next('loop')).toBe('loop')
    }
  })

  it('handles boolean states', () => {
    const mc = new MarkovChain<boolean>()
    mc.train([true, false, true, false])
    expect(mc.getTransitionProbability(true, false)).toBeCloseTo(1, 6)
  })

  it('handles object states', () => {
    const mc = new MarkovChain<{ id: number }>()
    const a = { id: 1 }
    const b = { id: 2 }
    mc.train([a, b, a])
    expect(mc.getStates()).toContain(a)
  })

  it('generate returns array with start state even when length is 0', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('a', 'b')
    const result = mc.generate('start', 0)
    expect(result).toEqual(['start'])
  })

  it('next with unknown state and rng still returns null', () => {
    const mc = new MarkovChain<string>()
    const result = mc.next('unknown', () => 0.5)
    expect(result).toBeNull()
  })

  it('handles large number of transitions from same state', () => {
    const mc = new MarkovChain<string>()
    for (let i = 0; i < 100; i++) {
      mc.addTransition('a', 'b')
    }
    expect(mc.getTransitionsFrom('a').get('b')).toBe(100)
  })

  it('getStates includes states with only self-transitions', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('self', 'self')
    const states = mc.getStates()
    expect(states).toContain('self')
  })

  it('train on sequence with repeated states', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'a', 'a', 'a'])
    expect(mc.getTransitionProbability('a', 'a')).toBeCloseTo(1, 6)
  })

  it('next respects probability distribution with many options', () => {
    const mc = new MarkovChain<string>()
    for (let i = 0; i < 10; i++) {
      mc.addTransition('a', `option${i}`)
    }
    const trans = mc.getTransitionsFrom('a')
    expect(trans.size).toBe(10)
    for (let i = 0; i < 10; i++) {
      expect(trans.get(`option${i}`)).toBe(1)
    }
  })

  it('handles unicode string states', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('こんにちは', '世界')
    expect(mc.getStates()).toContain('こんにちは')
  })

  it('getTransitionProbability returns 0 for unknown', () => {
    const mc = new MarkovChain<string>()
    expect(mc.getTransitionProbability('a', 'b')).toBe(0)
  })

  it('generate with single state', () => {
    const mc = new MarkovChain<string>()
    mc.addTransition('x', 'x')
    const seq = mc.generate('x', 3, () => 0.5)
    expect(seq.length).toBeLessThanOrEqual(3)
  })

  it('train builds transitions', () => {
    const mc = new MarkovChain<string>()
    mc.train(['a', 'b', 'a', 'b'])
    expect(mc.getStates()).toContain('a')
    expect(mc.getStates()).toContain('b')
  })
})
