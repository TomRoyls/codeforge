import { describe, expect, it, vi, afterEach } from 'vitest'

import { ProgressTracker } from '../../../src/core/progress-tracker/progress-tracker.js'

describe('ProgressTracker', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds an item and tracks it', () => {
    const tracker = new ProgressTracker()
    tracker.addItem('task1', 'Processing files', 100)
    const snapshot = tracker.getSnapshot('task1')
    expect(snapshot).not.toBeNull()
    expect(snapshot!.total).toBe(100)
    expect(snapshot!.current).toBe(0)
  })

  it('updates item progress', () => {
    const tracker = new ProgressTracker()
    tracker.addItem('task1', 'Processing', 100)
    tracker.update('task1', 50)
    const snapshot = tracker.getSnapshot('task1')
    expect(snapshot!.current).toBe(50)
  })

  it('completes an item', () => {
    const tracker = new ProgressTracker()
    tracker.addItem('task1', 'Task', 100)
    tracker.complete('task1')
    const snapshot = tracker.getSnapshot('task1')
    expect(snapshot!.current).toBe(100)
    expect(snapshot!.percent).toBeGreaterThanOrEqual(99)
  })

  it('marks item as failed', () => {
    const tracker = new ProgressTracker()
    tracker.addItem('task1', 'Task', 100)
    tracker.fail('task1')
    const summary = tracker.getSummary()
    expect(summary.failed).toBe(1)
  })

  it('getSnapshot returns null for missing item', () => {
    const tracker = new ProgressTracker()
    expect(tracker.getSnapshot('nope')).toBeNull()
  })

  it('getAllSnapshots returns all items', () => {
    const tracker = new ProgressTracker()
    tracker.addItem('a', 'Task A', 10)
    tracker.addItem('b', 'Task B', 20)
    const snapshots = tracker.getAllSnapshots()
    expect(snapshots).toHaveLength(2)
  })

  it('getOverallProgress aggregates all items', () => {
    const tracker = new ProgressTracker()
    tracker.addItem('a', 'Task A', 100)
    tracker.addItem('b', 'Task B', 200)
    tracker.update('a', 50)
    tracker.update('b', 100)
    const overall = tracker.getOverallProgress()
    expect(overall.totalCurrent).toBe(150)
    expect(overall.totalTotal).toBe(300)
    expect(overall.percent).toBe(50)
  })

  it('getOverallProgress returns 0 for empty tracker', () => {
    const tracker = new ProgressTracker()
    const overall = tracker.getOverallProgress()
    expect(overall.percent).toBe(0)
  })

  it('getSummary counts statuses correctly', () => {
    const tracker = new ProgressTracker({ autoStart: false })
    tracker.addItem('a', 'A', 10)
    tracker.addItem('b', 'B', 10)
    tracker.addItem('c', 'C', 10)
    tracker.addItem('d', 'D', 10)
    tracker.update('a', 5)
    tracker.complete('b')
    tracker.fail('c')
    const summary = tracker.getSummary()
    expect(summary.total).toBe(4)
    expect(summary.completed).toBe(1)
    expect(summary.failed).toBe(1)
    expect(summary.pending).toBe(1)
    expect(summary.inProgress).toBe(1)
  })

  it('reset clears all items', () => {
    const tracker = new ProgressTracker()
    tracker.addItem('a', 'A', 10)
    tracker.reset()
    expect(tracker.getAllSnapshots()).toHaveLength(0)
    const summary = tracker.getSummary()
    expect(summary.total).toBe(0)
  })

  it('getConfig returns current config', () => {
    const tracker = new ProgressTracker({ autoStart: false, historySize: 50 })
    const config = tracker.getConfig()
    expect(config.autoStart).toBe(false)
    expect(config.historySize).toBe(50)
  })

  it('snapshot includes elapsed time', () => {
    vi.useFakeTimers()
    const tracker = new ProgressTracker()
    tracker.addItem('a', 'A', 100)
    vi.advanceTimersByTime(5000)
    tracker.update('a', 50)
    const snapshot = tracker.getSnapshot('a')
    expect(snapshot!.elapsed).toBeGreaterThanOrEqual(5000)
  })

  it('handles zero total gracefully', () => {
    const tracker = new ProgressTracker()
    tracker.addItem('a', 'Empty', 0)
    const snapshot = tracker.getSnapshot('a')
    expect(snapshot!.percent).toBe(0)
  })

  it('update on non-existent item does nothing', () => {
    const tracker = new ProgressTracker()
    expect(() => tracker.update('nope', 50)).not.toThrow()
  })

  it('complete on non-existent item does nothing', () => {
    const tracker = new ProgressTracker()
    expect(() => tracker.complete('nope')).not.toThrow()
  })

  it('autoStart config starts items in_progress', () => {
    const tracker = new ProgressTracker({ autoStart: true })
    tracker.addItem('a', 'A', 10)
    tracker.update('a', 5)
    const summary = tracker.getSummary()
    expect(summary.inProgress).toBe(1)
  })

  it('no autoStart keeps items pending until update', () => {
    const tracker = new ProgressTracker({ autoStart: false })
    tracker.addItem('a', 'A', 10)
    const summary = tracker.getSummary()
    expect(summary.pending).toBe(1)
    tracker.update('a', 5)
    const summary2 = tracker.getSummary()
    expect(summary2.inProgress).toBe(1)
  })
})
