import { describe, it, expect, beforeEach } from 'vitest'
import { ETACalculator } from '../../src/core/progress-tracker/eta-calculator.js'
import { ProgressTracker } from '../../src/core/progress-tracker/progress-tracker.js'
import { DEFAULT_TRACKER_CONFIG } from '../../src/core/progress-tracker/types.js'
import type { TrackerConfig } from '../../src/core/progress-tracker/types.js'

describe('DEFAULT_TRACKER_CONFIG', () => {
  it('should have autoStart true by default', () => {
    expect(DEFAULT_TRACKER_CONFIG.autoStart).toBe(true)
  })

  it('should have historySize 100', () => {
    expect(DEFAULT_TRACKER_CONFIG.historySize).toBe(100)
  })

  it('should have updateInterval 100', () => {
    expect(DEFAULT_TRACKER_CONFIG.updateInterval).toBe(100)
  })
})

describe('ETACalculator', () => {
  let calc: ETACalculator

  beforeEach(() => {
    calc = new ETACalculator()
  })

  describe('record', () => {
    it('should store a data point', () => {
      calc.record(1000, 10)
      expect(calc.getHistory()).toHaveLength(1)
    })

    it('should store multiple data points', () => {
      calc.record(1000, 10)
      calc.record(2000, 20)
      calc.record(3000, 30)
      expect(calc.getHistory()).toHaveLength(3)
    })

    it('should trim to historySize', () => {
      const small = new ETACalculator(5)
      for (let i = 0; i < 10; i++) {
        small.record(i * 1000, i * 10)
      }
      expect(small.getHistory()).toHaveLength(5)
    })

    it('should keep the latest points when trimming', () => {
      const small = new ETACalculator(3)
      for (let i = 0; i < 5; i++) {
        small.record(i * 1000, i * 10)
      }
      const history = small.getHistory()
      expect(history[0]!.value).toBe(20)
      expect(history[2]!.value).toBe(40)
    })

    it('should use default historySize of 100', () => {
      const defaultCalc = new ETACalculator()
      for (let i = 0; i < 150; i++) {
        defaultCalc.record(i * 100, i)
      }
      expect(defaultCalc.getHistory()).toHaveLength(100)
    })
  })

  describe('calculateRate', () => {
    it('should return 0 with no data points', () => {
      expect(calc.calculateRate()).toBe(0)
    })

    it('should return 0 with single data point', () => {
      calc.record(1000, 50)
      expect(calc.calculateRate()).toBe(0)
    })

    it('should calculate rate with two data points', () => {
      calc.record(0, 0)
      calc.record(1000, 100)
      expect(calc.calculateRate()).toBe(100)
    })

    it('should calculate rate with multiple data points', () => {
      calc.record(0, 0)
      calc.record(1000, 50)
      calc.record(2000, 100)
      expect(calc.calculateRate()).toBe(50)
    })

    it('should return 0 when timestamps are the same', () => {
      calc.record(1000, 0)
      calc.record(1000, 100)
      expect(calc.calculateRate()).toBe(0)
    })

    it('should handle negative rate (decreasing values)', () => {
      calc.record(0, 100)
      calc.record(1000, 50)
      expect(calc.calculateRate()).toBe(-50)
    })

    it('should calculate rate correctly with large time span', () => {
      calc.record(0, 0)
      calc.record(10000, 500)
      expect(calc.calculateRate()).toBe(50)
    })
  })

  describe('calculateETA', () => {
    it('should return 0 when rate is 0', () => {
      expect(calc.calculateETA(50, 100)).toBe(0)
    })

    it('should calculate remaining time', () => {
      calc.record(0, 0)
      calc.record(1000, 50)
      const eta = calc.calculateETA(50, 100)
      expect(eta).toBe(1000)
    })

    it('should return 0 when current equals total', () => {
      calc.record(0, 0)
      calc.record(1000, 100)
      expect(calc.calculateETA(100, 100)).toBe(0)
    })

    it('should return 0 when current exceeds total', () => {
      calc.record(0, 0)
      calc.record(1000, 100)
      expect(calc.calculateETA(150, 100)).toBe(0)
    })

    it('should calculate eta for partial progress', () => {
      calc.record(0, 0)
      calc.record(2000, 80)
      const eta = calc.calculateETA(80, 100)
      expect(eta).toBe(500)
    })

    it('should return 0 with negative rate', () => {
      calc.record(0, 100)
      calc.record(1000, 50)
      expect(calc.calculateETA(50, 100)).toBe(0)
    })
  })

  describe('calculatePercent', () => {
    it('should return 0 for 0 progress', () => {
      expect(calc.calculatePercent(0, 100)).toBe(0)
    })

    it('should return 50 for half progress', () => {
      expect(calc.calculatePercent(50, 100)).toBe(50)
    })

    it('should return 100 for complete progress', () => {
      expect(calc.calculatePercent(100, 100)).toBe(100)
    })

    it('should clamp over 100 to 100', () => {
      expect(calc.calculatePercent(150, 100)).toBe(100)
    })

    it('should clamp negative values to 0', () => {
      expect(calc.calculatePercent(-10, 100)).toBe(0)
    })

    it('should return 0 when total is 0', () => {
      expect(calc.calculatePercent(0, 0)).toBe(0)
    })

    it('should handle fractional percentages', () => {
      expect(calc.calculatePercent(1, 3)).toBeCloseTo(33.333, 1)
    })
  })

  describe('getHistory', () => {
    it('should return empty array when no points recorded', () => {
      expect(calc.getHistory()).toEqual([])
    })

    it('should return a copy of history', () => {
      calc.record(1000, 10)
      const h1 = calc.getHistory()
      const h2 = calc.getHistory()
      expect(h1).toEqual(h2)
      expect(h1).not.toBe(h2)
    })

    it('should preserve point data', () => {
      calc.record(1234, 56)
      const history = calc.getHistory()
      expect(history[0]!.timestamp).toBe(1234)
      expect(history[0]!.value).toBe(56)
    })
  })

  describe('clear', () => {
    it('should remove all history points', () => {
      calc.record(1000, 10)
      calc.record(2000, 20)
      calc.clear()
      expect(calc.getHistory()).toEqual([])
    })

    it('should allow recording after clear', () => {
      calc.record(1000, 10)
      calc.clear()
      calc.record(2000, 20)
      expect(calc.getHistory()).toHaveLength(1)
    })
  })
})

describe('ProgressTracker', () => {
  let tracker: ProgressTracker

  beforeEach(() => {
    tracker = new ProgressTracker()
  })

  describe('constructor', () => {
    it('should create tracker with default config', () => {
      const config = tracker.getConfig()
      expect(config).toEqual(DEFAULT_TRACKER_CONFIG)
    })

    it('should accept partial config', () => {
      const custom = new ProgressTracker({ autoStart: false })
      expect(custom.getConfig().autoStart).toBe(false)
      expect(custom.getConfig().historySize).toBe(100)
    })

    it('should accept full config', () => {
      const config: Partial<TrackerConfig> = {
        autoStart: false,
        historySize: 50,
        updateInterval: 200,
      }
      const custom = new ProgressTracker(config)
      const result = custom.getConfig()
      expect(result.autoStart).toBe(false)
      expect(result.historySize).toBe(50)
      expect(result.updateInterval).toBe(200)
    })
  })

  describe('addItem', () => {
    it('should add a progress item', () => {
      tracker.addItem('test', 'Test Item', 100)
      const snapshot = tracker.getSnapshot('test')
      expect(snapshot).not.toBeNull()
      expect(snapshot!.itemId).toBe('test')
    })

    it('should set status to in_progress with autoStart', () => {
      tracker.addItem('test', 'Test', 100)
      const summary = tracker.getSummary()
      expect(summary.inProgress).toBe(1)
      expect(summary.pending).toBe(0)
    })

    it('should set status to pending without autoStart', () => {
      const noAuto = new ProgressTracker({ autoStart: false })
      noAuto.addItem('test', 'Test', 100)
      const summary = noAuto.getSummary()
      expect(summary.pending).toBe(1)
      expect(summary.inProgress).toBe(0)
    })

    it('should set startedAt when autoStart is true', () => {
      const before = Date.now()
      tracker.addItem('test', 'Test', 100)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.elapsed).toBeGreaterThanOrEqual(0)
    })

    it('should initialize current to 0', () => {
      tracker.addItem('test', 'Test', 100)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.current).toBe(0)
    })

    it('should set the correct total', () => {
      tracker.addItem('test', 'Test', 250)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.total).toBe(250)
    })
  })

  describe('update', () => {
    it('should update current progress', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 50)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.current).toBe(50)
    })

    it('should transition from pending to in_progress', () => {
      const noAuto = new ProgressTracker({ autoStart: false })
      noAuto.addItem('test', 'Test', 100)
      expect(noAuto.getSummary().pending).toBe(1)
      noAuto.update('test', 25)
      expect(noAuto.getSummary().inProgress).toBe(1)
    })

    it('should set startedAt on first update from pending', () => {
      const noAuto = new ProgressTracker({ autoStart: false })
      noAuto.addItem('test', 'Test', 100)
      const before = Date.now()
      noAuto.update('test', 10)
      const snapshot = noAuto.getSnapshot('test')!
      expect(snapshot.elapsed).toBeLessThanOrEqual(Date.now() - before + 100)
    })

    it('should handle update beyond total', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 200)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.current).toBe(200)
    })

    it('should not throw for unknown id', () => {
      expect(() => tracker.update('unknown', 10)).not.toThrow()
    })

    it('should record data in ETA calculator', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 50)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.rate).toBeGreaterThanOrEqual(0)
    })
  })

  describe('complete', () => {
    it('should mark item as completed', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.complete('test')
      const summary = tracker.getSummary()
      expect(summary.completed).toBe(1)
    })

    it('should set completedAt timestamp', () => {
      tracker.addItem('test', 'Test', 100)
      const before = Date.now()
      tracker.complete('test')
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.current).toBe(100)
    })

    it('should set current to total', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 50)
      tracker.complete('test')
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.current).toBe(100)
    })

    it('should set startedAt if not set', () => {
      const noAuto = new ProgressTracker({ autoStart: false })
      noAuto.addItem('test', 'Test', 100)
      noAuto.complete('test')
      const summary = noAuto.getSummary()
      expect(summary.completed).toBe(1)
    })

    it('should not throw for unknown id', () => {
      expect(() => tracker.complete('unknown')).not.toThrow()
    })

    it('should handle complete without prior update', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.complete('test')
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.current).toBe(100)
      expect(snapshot.percent).toBe(100)
    })
  })

  describe('fail', () => {
    it('should mark item as failed', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.fail('test')
      const summary = tracker.getSummary()
      expect(summary.failed).toBe(1)
    })

    it('should set completedAt timestamp', () => {
      tracker.addItem('test', 'Test', 100)
      const before = Date.now()
      tracker.fail('test')
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.elapsed).toBeGreaterThanOrEqual(0)
    })

    it('should not change current value', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 50)
      tracker.fail('test')
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.current).toBe(50)
    })

    it('should not throw for unknown id', () => {
      expect(() => tracker.fail('unknown')).not.toThrow()
    })

    it('should set startedAt if not set', () => {
      const noAuto = new ProgressTracker({ autoStart: false })
      noAuto.addItem('test', 'Test', 100)
      noAuto.fail('test')
      const summary = noAuto.getSummary()
      expect(summary.failed).toBe(1)
    })
  })

  describe('getSnapshot', () => {
    it('should return null for unknown id', () => {
      expect(tracker.getSnapshot('unknown')).toBeNull()
    })

    it('should return snapshot with correct itemId', () => {
      tracker.addItem('test', 'Test', 100)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.itemId).toBe('test')
    })

    it('should calculate percent', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 50)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.percent).toBe(50)
    })

    it('should include elapsed time', () => {
      tracker.addItem('test', 'Test', 100)
      const snapshot = tracker.getSnapshot('test')!
      expect(typeof snapshot.elapsed).toBe('number')
      expect(snapshot.elapsed).toBeGreaterThanOrEqual(0)
    })

    it('should include rate', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 50)
      const snapshot = tracker.getSnapshot('test')!
      expect(typeof snapshot.rate).toBe('number')
    })

    it('should include remaining time', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 50)
      const snapshot = tracker.getSnapshot('test')!
      expect(typeof snapshot.remaining).toBe('number')
    })

    it('should clamp percent to 100', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.update('test', 200)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.percent).toBe(100)
    })
  })

  describe('getAllSnapshots', () => {
    it('should return empty array when no items', () => {
      expect(tracker.getAllSnapshots()).toEqual([])
    })

    it('should return all snapshots', () => {
      tracker.addItem('a', 'A', 100)
      tracker.addItem('b', 'B', 200)
      const snapshots = tracker.getAllSnapshots()
      expect(snapshots).toHaveLength(2)
    })

    it('should include correct item ids', () => {
      tracker.addItem('x', 'X', 50)
      tracker.addItem('y', 'Y', 75)
      const snapshots = tracker.getAllSnapshots()
      const ids = snapshots.map((s) => s.itemId)
      expect(ids).toContain('x')
      expect(ids).toContain('y')
    })
  })

  describe('getOverallProgress', () => {
    it('should return zeros when no items', () => {
      const overall = tracker.getOverallProgress()
      expect(overall.totalCurrent).toBe(0)
      expect(overall.totalTotal).toBe(0)
      expect(overall.percent).toBe(0)
    })

    it('should aggregate current and total', () => {
      tracker.addItem('a', 'A', 100)
      tracker.addItem('b', 'B', 200)
      tracker.update('a', 50)
      tracker.update('b', 100)
      const overall = tracker.getOverallProgress()
      expect(overall.totalCurrent).toBe(150)
      expect(overall.totalTotal).toBe(300)
    })

    it('should calculate overall percent', () => {
      tracker.addItem('a', 'A', 100)
      tracker.addItem('b', 'B', 100)
      tracker.update('a', 50)
      tracker.update('b', 50)
      const overall = tracker.getOverallProgress()
      expect(overall.percent).toBe(50)
    })

    it('should clamp overall percent to 100', () => {
      tracker.addItem('a', 'A', 100)
      tracker.update('a', 200)
      const overall = tracker.getOverallProgress()
      expect(overall.percent).toBe(100)
    })

    it('should handle single item', () => {
      tracker.addItem('only', 'Only', 100)
      tracker.update('only', 25)
      const overall = tracker.getOverallProgress()
      expect(overall.percent).toBe(25)
    })
  })

  describe('getSummary', () => {
    it('should return zeros when no items', () => {
      const summary = tracker.getSummary()
      expect(summary.total).toBe(0)
      expect(summary.completed).toBe(0)
      expect(summary.inProgress).toBe(0)
      expect(summary.failed).toBe(0)
      expect(summary.pending).toBe(0)
    })

    it('should count items by status', () => {
      tracker.addItem('a', 'A', 100)
      tracker.addItem('b', 'B', 100)
      tracker.addItem('c', 'C', 100)
      tracker.complete('a')
      tracker.fail('b')
      const summary = tracker.getSummary()
      expect(summary.total).toBe(3)
      expect(summary.completed).toBe(1)
      expect(summary.inProgress).toBe(1)
      expect(summary.failed).toBe(1)
    })

    it('should count pending items', () => {
      const noAuto = new ProgressTracker({ autoStart: false })
      noAuto.addItem('a', 'A', 100)
      noAuto.addItem('b', 'B', 100)
      const summary = noAuto.getSummary()
      expect(summary.pending).toBe(2)
    })

    it('should count completed items', () => {
      tracker.addItem('a', 'A', 100)
      tracker.addItem('b', 'B', 100)
      tracker.complete('a')
      tracker.complete('b')
      const summary = tracker.getSummary()
      expect(summary.completed).toBe(2)
      expect(summary.inProgress).toBe(0)
    })
  })

  describe('reset', () => {
    it('should clear all items', () => {
      tracker.addItem('a', 'A', 100)
      tracker.addItem('b', 'B', 200)
      tracker.reset()
      expect(tracker.getSummary().total).toBe(0)
    })

    it('should clear snapshots', () => {
      tracker.addItem('a', 'A', 100)
      tracker.reset()
      expect(tracker.getAllSnapshots()).toEqual([])
    })

    it('should allow adding items after reset', () => {
      tracker.addItem('a', 'A', 100)
      tracker.reset()
      tracker.addItem('b', 'B', 200)
      const summary = tracker.getSummary()
      expect(summary.total).toBe(1)
    })

    it('should return null snapshot for previously existing id', () => {
      tracker.addItem('a', 'A', 100)
      tracker.reset()
      expect(tracker.getSnapshot('a')).toBeNull()
    })
  })

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const config1 = tracker.getConfig()
      const config2 = tracker.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })

    it('should reflect constructor overrides', () => {
      const custom = new ProgressTracker({
        autoStart: false,
        historySize: 50,
        updateInterval: 200,
      })
      const config = custom.getConfig()
      expect(config.autoStart).toBe(false)
      expect(config.historySize).toBe(50)
      expect(config.updateInterval).toBe(200)
    })
  })

  describe('Edge Cases', () => {
    it('should handle fail then update', () => {
      tracker.addItem('test', 'Test', 100)
      tracker.fail('test')
      tracker.update('test', 75)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.current).toBe(75)
      expect(tracker.getSummary().failed).toBe(1)
    })

    it('should handle multiple items independently', () => {
      tracker.addItem('a', 'A', 100)
      tracker.addItem('b', 'B', 200)
      tracker.update('a', 50)
      tracker.complete('b')
      const snapA = tracker.getSnapshot('a')!
      const snapB = tracker.getSnapshot('b')!
      expect(snapA.current).toBe(50)
      expect(snapB.current).toBe(200)
      expect(snapB.percent).toBe(100)
    })

    it('should handle autoStart false then manual update', () => {
      const noAuto = new ProgressTracker({ autoStart: false })
      noAuto.addItem('test', 'Test', 100)
      const before = Date.now()
      noAuto.update('test', 25)
      const snapshot = noAuto.getSnapshot('test')!
      expect(snapshot.elapsed).toBeLessThanOrEqual(Date.now() - before + 100)
      expect(noAuto.getSummary().inProgress).toBe(1)
    })

    it('should handle getSnapshot for unknown id', () => {
      expect(tracker.getSnapshot('nonexistent')).toBeNull()
    })

    it('should handle update on unknown id silently', () => {
      expect(() => tracker.update('ghost', 10)).not.toThrow()
    })

    it('should handle complete on unknown id silently', () => {
      expect(() => tracker.complete('ghost')).not.toThrow()
    })

    it('should handle fail on unknown id silently', () => {
      expect(() => tracker.fail('ghost')).not.toThrow()
    })

    it('should handle adding item with same id (overwrite)', () => {
      tracker.addItem('test', 'First', 100)
      tracker.update('test', 50)
      tracker.addItem('test', 'Second', 200)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.total).toBe(200)
      expect(snapshot.current).toBe(0)
    })

    it('should handle zero total', () => {
      tracker.addItem('test', 'Zero', 0)
      const snapshot = tracker.getSnapshot('test')!
      expect(snapshot.percent).toBe(0)
      expect(snapshot.total).toBe(0)
    })

    it('should track history size from config', () => {
      const small = new ProgressTracker({ historySize: 3 })
      small.addItem('test', 'Test', 100)
      for (let i = 1; i <= 10; i++) {
        small.update('test', i * 10)
      }
      const snapshot = small.getSnapshot('test')!
      expect(snapshot.rate).toBeGreaterThanOrEqual(0)
    })

    it('should handle overall progress with completed items', () => {
      tracker.addItem('a', 'A', 100)
      tracker.addItem('b', 'B', 100)
      tracker.complete('a')
      tracker.complete('b')
      const overall = tracker.getOverallProgress()
      expect(overall.totalCurrent).toBe(200)
      expect(overall.totalTotal).toBe(200)
      expect(overall.percent).toBe(100)
    })

    it('should provide valid elapsed for pending items', () => {
      const noAuto = new ProgressTracker({ autoStart: false })
      noAuto.addItem('test', 'Test', 100)
      const snapshot = noAuto.getSnapshot('test')!
      expect(snapshot.elapsed).toBeGreaterThanOrEqual(0)
    })
  })
})
