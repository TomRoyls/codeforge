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
})
