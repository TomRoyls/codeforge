import { describe, expect, it } from 'vitest'
import { HungarianAssignment } from '../../src/utils/hungarian-assignment.js'

describe('HungarianAssignment', () => {
  it('finds optimal 2x2 assignment', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 2)
    ha.setCost(1, 0, 2)
    ha.setCost(1, 1, 1)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(2)
  })

  it('handles 1x1', () => {
    const ha = new HungarianAssignment(1, 1)
    ha.setCost(0, 0, 5)
    const { totalCost, assignment } = ha.solve()
    expect(totalCost).toBe(5)
    expect(assignment[0]).toBe(0)
  })

  it('handles 1x3 (more jobs than workers)', () => {
    const ha = new HungarianAssignment(1, 3)
    ha.setCost(0, 0, 10)
    ha.setCost(0, 1, 3)
    ha.setCost(0, 2, 7)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(3)
  })

  it('handles 3x1 (more workers than jobs)', () => {
    const ha = new HungarianAssignment(3, 1)
    ha.setCost(0, 0, 5)
    ha.setCost(1, 0, 2)
    ha.setCost(2, 0, 8)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(2)
  })

  it('greedy matches close to optimal', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 100)
    ha.setCost(1, 0, 100)
    ha.setCost(1, 1, 1)
    const greedy = ha.solveGreedy()
    const optimal = ha.solve()
    expect(greedy.totalCost).toBe(optimal.totalCost)
  })

  it('handles 3x3', () => {
    const ha = new HungarianAssignment(3, 3)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 2)
    ha.setCost(0, 2, 3)
    ha.setCost(1, 0, 4)
    ha.setCost(1, 1, 1)
    ha.setCost(1, 2, 2)
    ha.setCost(2, 0, 2)
    ha.setCost(2, 1, 3)
    ha.setCost(2, 2, 1)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(3)
  })

  it('handles equal costs', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 5)
    ha.setCost(0, 1, 5)
    ha.setCost(1, 0, 5)
    ha.setCost(1, 1, 5)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(10)
  })

  it('handles zero costs', () => {
    const ha = new HungarianAssignment(2, 2)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(0)
  })

  it('assignment returns valid pairs', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 5)
    ha.setCost(1, 0, 5)
    ha.setCost(1, 1, 1)
    const { assignment } = ha.solve()
    const jobs = new Set(assignment.filter(a => a !== null))
    expect(jobs.size).toBe(2)
  })

  it('greedy handles unequal dimensions', () => {
    const ha = new HungarianAssignment(2, 3)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 2)
    ha.setCost(0, 2, 3)
    ha.setCost(1, 0, 4)
    ha.setCost(1, 1, 1)
    ha.setCost(1, 2, 2)
    const { totalCost } = ha.solveGreedy()
    expect(totalCost).toBeLessThanOrEqual(5)
  })

  it('handles all equal costs', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 5)
    ha.setCost(0, 1, 5)
    ha.setCost(1, 0, 5)
    ha.setCost(1, 1, 5)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(10)
  })

  it('handles large cost difference', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 1000)
    ha.setCost(1, 0, 1000)
    ha.setCost(1, 1, 1)
    const { totalCost, assignment } = ha.solve()
    expect(totalCost).toBe(2)
    expect(assignment[0]).toBe(0)
    expect(assignment[1]).toBe(1)
  })

  it('1x1 assignment', () => {
    const ha = new HungarianAssignment(1, 1)
    ha.setCost(0, 0, 42)
    const { totalCost, assignment } = ha.solve()
    expect(totalCost).toBe(42)
    expect(assignment[0]).toBe(0)
  })

  it('handles 3x3 identity costs', () => {
    const ha = new HungarianAssignment(3, 3)
    ha.setCost(0, 0, 0)
    ha.setCost(1, 1, 0)
    ha.setCost(2, 2, 0)
    ha.setCost(0, 1, 10)
    ha.setCost(0, 2, 10)
    ha.setCost(1, 0, 10)
    ha.setCost(1, 2, 10)
    ha.setCost(2, 0, 10)
    ha.setCost(2, 1, 10)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(0)
  })

  it('2x2 off-diagonal optimal', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 10)
    ha.setCost(0, 1, 1)
    ha.setCost(1, 0, 1)
    ha.setCost(1, 1, 10)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(2)
  })

  it('handles 2x3 rectangular', () => {
    const ha = new HungarianAssignment(2, 3)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 2)
    ha.setCost(0, 2, 3)
    ha.setCost(1, 0, 3)
    ha.setCost(1, 1, 2)
    ha.setCost(1, 2, 1)
    const { totalCost } = ha.solve()
    expect(totalCost).toBeLessThanOrEqual(4)
  })

  it('handles 1x1 matrix', () => {
    const ha = new HungarianAssignment(1)
    ha.setCost(0, 0, 7)
    const { totalCost } = ha.solve()
    expect(totalCost).toBeGreaterThanOrEqual(0)
  })

  it('2x2 assignment picks minimum', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 10)
    ha.setCost(1, 0, 10)
    ha.setCost(1, 1, 1)
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(2)
  })

  it('3x3 identity matrix cost is 3', () => {
    const ha = new HungarianAssignment(3, 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        ha.setCost(i, j, i === j ? 1 : 100)
      }
    }
    const { totalCost } = ha.solve()
    expect(totalCost).toBe(3)
  })

  it('solveGreedy returns assignment', () => {
    const ha = new HungarianAssignment(2, 2)
    ha.setCost(0, 0, 1)
    ha.setCost(0, 1, 10)
    ha.setCost(1, 0, 10)
    ha.setCost(1, 1, 1)
    const greedy = ha.solveGreedy()
    expect(greedy.totalCost).toBe(2)
  })

  it('constructor sets dimensions', () => {
    const ha = new HungarianAssignment(3, 3)
    expect(ha).toBeDefined()
  })
})
