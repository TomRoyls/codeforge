import { describe, it, expect } from 'vitest'
import { ProfileOptimizer } from '../../src/core/profile-optimizer/profile-optimizer.js'
import type {
  ProfileEntry,
  ProfileSnapshot,
  BudgetRule,
} from '../../src/core/profile-optimizer/types.js'

function makeEntry(overrides: Partial<ProfileEntry> = {}): ProfileEntry {
  return {
    name: 'test-entry',
    duration: 100,
    calls: 10,
    memory: 50,
    category: 'general',
    ...overrides,
  }
}

function makeSnapshot(overrides: Partial<ProfileSnapshot> = {}): ProfileSnapshot {
  return {
    entries: [makeEntry()],
    timestamp: 1000,
    label: 'test-snapshot',
    ...overrides,
  }
}

describe('ProfileOptimizer - Snapshot Management', () => {
  it('should add a snapshot', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot()
    po.addSnapshot(snapshot)
    expect(po.getSnapshots()).toHaveLength(1)
  })

  it('should add multiple snapshots', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(makeSnapshot({ label: 'snap1' }))
    po.addSnapshot(makeSnapshot({ label: 'snap2' }))
    po.addSnapshot(makeSnapshot({ label: 'snap3' }))
    expect(po.getSnapshots()).toHaveLength(3)
  })

  it('should return snapshot by label', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(makeSnapshot({ label: 'my-label' }))
    const found = po.getSnapshot('my-label')
    expect(found).toBeDefined()
    expect(found!.label).toBe('my-label')
  })

  it('should return undefined for unknown label', () => {
    const po = new ProfileOptimizer()
    expect(po.getSnapshot('unknown')).toBeUndefined()
  })

  it('should add entry to existing snapshot by label', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(makeSnapshot({ label: 'existing' }))
    const newEntry = makeEntry({ name: 'new-entry' })
    po.addEntry('existing', newEntry)
    const snapshot = po.getSnapshot('existing')
    expect(snapshot!.entries).toHaveLength(2)
    expect(snapshot!.entries[1]!.name).toBe('new-entry')
  })

  it('should create snapshot when adding entry with unknown label', () => {
    const po = new ProfileOptimizer()
    po.addEntry('new-snapshot', makeEntry({ name: 'entry1' }))
    expect(po.getSnapshots()).toHaveLength(1)
    const snapshot = po.getSnapshot('new-snapshot')
    expect(snapshot).toBeDefined()
    expect(snapshot!.entries).toHaveLength(1)
    expect(snapshot!.entries[0]!.name).toBe('entry1')
  })

  it('should get all snapshots', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(makeSnapshot({ label: 'a' }))
    po.addSnapshot(makeSnapshot({ label: 'b' }))
    const all = po.getSnapshots()
    expect(all).toHaveLength(2)
    expect(all[0]!.label).toBe('a')
    expect(all[1]!.label).toBe('b')
  })

  it('should return a copy of snapshots', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(makeSnapshot())
    const snapshots = po.getSnapshots()
    snapshots.push(makeSnapshot({ label: 'extra' }))
    expect(po.getSnapshots()).toHaveLength(1)
  })

  it('should return empty array when no snapshots', () => {
    const po = new ProfileOptimizer()
    expect(po.getSnapshots()).toEqual([])
  })
})

describe('ProfileOptimizer - Comparison', () => {
  const baseline: ProfileSnapshot = {
    entries: [
      makeEntry({ name: 'func-a', duration: 100 }),
      makeEntry({ name: 'func-b', duration: 200 }),
      makeEntry({ name: 'func-c', duration: 50 }),
    ],
    timestamp: 1000,
    label: 'baseline',
  }

  const current: ProfileSnapshot = {
    entries: [
      makeEntry({ name: 'func-a', duration: 150 }),
      makeEntry({ name: 'func-b', duration: 150 }),
      makeEntry({ name: 'func-c', duration: 50 }),
    ],
    timestamp: 2000,
    label: 'current',
  }

  it('should compare two snapshots by label', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(baseline)
    po.addSnapshot(current)
    const result = po.compare('baseline', 'current')
    expect(result.baseline.label).toBe('baseline')
    expect(result.current.label).toBe('current')
  })

  it('should detect regressions in comparison', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(baseline)
    po.addSnapshot(current)
    const result = po.compare('baseline', 'current')
    expect(result.regressions.length).toBeGreaterThan(0)
    const regression = result.regressions.find((r) => r.name === 'func-a')
    expect(regression).toBeDefined()
    expect(regression!.increase).toBe(50)
    expect(regression!.percentageChange).toBe(50)
  })

  it('should detect improvements in comparison', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(baseline)
    po.addSnapshot(current)
    const result = po.compare('baseline', 'current')
    const improvement = result.improvements.find((i) => i.name === 'func-b')
    expect(improvement).toBeDefined()
    expect(improvement!.decrease).toBe(50)
    expect(improvement!.percentageChange).toBe(25)
  })

  it('should throw when baseline not found', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(current)
    expect(() => po.compare('missing', 'current')).toThrow('Snapshot not found: missing')
  })

  it('should throw when current not found', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(baseline)
    expect(() => po.compare('baseline', 'missing')).toThrow('Snapshot not found: missing')
  })

  it('should detect no changes for identical snapshots', () => {
    const po = new ProfileOptimizer()
    const snap: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 1000,
      label: 'snap-a',
    }
    const snap2: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 2000,
      label: 'snap-b',
    }
    po.addSnapshot(snap)
    po.addSnapshot(snap2)
    const result = po.compare('snap-a', 'snap-b')
    expect(result.regressions).toHaveLength(0)
    expect(result.improvements).toHaveLength(0)
  })

  it('should detect regressions with threshold filtering', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 110 })],
      timestamp: 2000,
      label: 'curr',
    }
    po.addSnapshot(base)
    po.addSnapshot(curr)
    const withLowThreshold = po.detectRegressions(base, curr, 0)
    const withHighThreshold = po.detectRegressions(base, curr, 20)
    expect(withLowThreshold.length).toBeGreaterThan(0)
    expect(withHighThreshold).toHaveLength(0)
  })

  it('should detect improvements with threshold filtering', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 80 })],
      timestamp: 2000,
      label: 'curr',
    }
    const withThreshold = po.detectImprovements(base, curr, 30)
    expect(withThreshold).toHaveLength(0)
  })

  it('should handle entries only in baseline', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'only-in-base', duration: 100 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'only-in-curr', duration: 100 })],
      timestamp: 2000,
      label: 'curr',
    }
    const regressions = po.detectRegressions(base, curr)
    const improvements = po.detectImprovements(base, curr)
    expect(regressions).toHaveLength(0)
    expect(improvements).toHaveLength(0)
  })

  it('should handle all regressions', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [
        makeEntry({ name: 'a', duration: 100 }),
        makeEntry({ name: 'b', duration: 100 }),
      ],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [
        makeEntry({ name: 'a', duration: 200 }),
        makeEntry({ name: 'b', duration: 300 }),
      ],
      timestamp: 2000,
      label: 'curr',
    }
    const regressions = po.detectRegressions(base, curr)
    expect(regressions).toHaveLength(2)
  })
})

describe('ProfileOptimizer - Analysis', () => {
  it('should get top N entries by duration', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'slow', duration: 500 }),
        makeEntry({ name: 'medium', duration: 200 }),
        makeEntry({ name: 'fast', duration: 50 }),
      ],
    })
    const top2 = po.getTopEntries(snapshot, 2)
    expect(top2).toHaveLength(2)
    expect(top2[0]!.name).toBe('slow')
    expect(top2[1]!.name).toBe('medium')
  })

  it('should return all entries if N exceeds count', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', duration: 100 }),
        makeEntry({ name: 'b', duration: 200 }),
      ],
    })
    const top = po.getTopEntries(snapshot, 10)
    expect(top).toHaveLength(2)
  })

  it('should return empty for empty snapshot top entries', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({ entries: [] })
    expect(po.getTopEntries(snapshot, 5)).toEqual([])
  })

  it('should get hotspots above threshold percentage', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'big', duration: 900 }),
        makeEntry({ name: 'small', duration: 100 }),
      ],
    })
    const hotspots = po.getHotspots(snapshot, 50)
    expect(hotspots).toHaveLength(1)
    expect(hotspots[0]!.name).toBe('big')
  })

  it('should return empty hotspots when total duration is zero', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'zero', duration: 0 }),
      ],
    })
    expect(po.getHotspots(snapshot, 10)).toEqual([])
  })

  it('should return multiple hotspots if multiple entries exceed threshold', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', duration: 400 }),
        makeEntry({ name: 'b', duration: 400 }),
        makeEntry({ name: 'c', duration: 200 }),
      ],
    })
    const hotspots = po.getHotspots(snapshot, 30)
    expect(hotspots).toHaveLength(2)
  })

  it('should not mutate original entries in getTopEntries', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', duration: 100 }),
        makeEntry({ name: 'b', duration: 300 }),
        makeEntry({ name: 'c', duration: 200 }),
      ],
    })
    po.getTopEntries(snapshot, 2)
    expect(snapshot.entries[0]!.name).toBe('a')
    expect(snapshot.entries[1]!.name).toBe('b')
    expect(snapshot.entries[2]!.name).toBe('c')
  })
})

describe('ProfileOptimizer - Suggestions', () => {
  it('should generate performance suggestions for slow entries', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'slow-func', duration: 2000, calls: 10, memory: 10 })],
    })
    const suggestions = po.generateSuggestions(snapshot)
    const perfSuggestion = suggestions.find((s) => s.category === 'performance')
    expect(perfSuggestion).toBeDefined()
    expect(perfSuggestion!.target).toBe('slow-func')
  })

  it('should generate memory suggestions for high memory entries', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'mem-func', duration: 10, calls: 10, memory: 500 })],
    })
    const suggestions = po.generateSuggestions(snapshot)
    const memSuggestion = suggestions.find((s) => s.category === 'memory')
    expect(memSuggestion).toBeDefined()
    expect(memSuggestion!.target).toBe('mem-func')
  })

  it('should generate call suggestions for frequent calls', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'freq-func', duration: 10, calls: 5000, memory: 10 })],
    })
    const suggestions = po.generateSuggestions(snapshot)
    const callSuggestion = suggestions.find((s) => s.category === 'calls')
    expect(callSuggestion).toBeDefined()
    expect(callSuggestion!.target).toBe('freq-func')
  })

  it('should generate multiple suggestions for a single entry', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'heavy-func', duration: 2000, calls: 5000, memory: 500 })],
    })
    const suggestions = po.generateSuggestions(snapshot)
    expect(suggestions.length).toBeGreaterThanOrEqual(2)
    const categories = suggestions.map((s) => s.category)
    expect(categories).toContain('performance')
    expect(categories).toContain('memory')
    expect(categories).toContain('calls')
  })

  it('should return empty suggestions for low-impact entries', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'light-func', duration: 10, calls: 10, memory: 10 })],
    })
    const suggestions = po.generateSuggestions(snapshot)
    expect(suggestions).toHaveLength(0)
  })

  it('should set high impact for dominant entries', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'dominant', duration: 1900, calls: 10, memory: 10 }),
        makeEntry({ name: 'minor', duration: 100, calls: 10, memory: 10 }),
      ],
    })
    const suggestions = po.generateSuggestions(snapshot)
    const perfSuggestion = suggestions.find((s) => s.category === 'performance' && s.target === 'dominant')
    expect(perfSuggestion).toBeDefined()
    expect(perfSuggestion!.impact).toBe('high')
  })

  it('should generate suggestions for multiple categories', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'slow', duration: 2000, calls: 10, memory: 10 }),
        makeEntry({ name: 'memory-heavy', duration: 10, calls: 10, memory: 300 }),
      ],
    })
    const suggestions = po.generateSuggestions(snapshot)
    expect(suggestions.length).toBeGreaterThanOrEqual(2)
  })
})

describe('ProfileOptimizer - Budget Rules', () => {
  const rule: BudgetRule = {
    name: 'max-time',
    target: 'func-a',
    maxDuration: 100,
    maxCalls: 50,
    maxMemory: 200,
  }

  it('should add a budget rule', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule(rule)
    expect(po.getBudgetRules()).toHaveLength(1)
  })

  it('should add multiple budget rules', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule(rule)
    po.addBudgetRule({ name: 'rule2', target: 'func-b', maxDuration: 200, maxCalls: 100, maxMemory: 500 })
    expect(po.getBudgetRules()).toHaveLength(2)
  })

  it('should remove a budget rule by name', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule(rule)
    const removed = po.removeBudgetRule('max-time')
    expect(removed).toBe(true)
    expect(po.getBudgetRules()).toHaveLength(0)
  })

  it('should return false when removing non-existent rule', () => {
    const po = new ProfileOptimizer()
    expect(po.removeBudgetRule('nonexistent')).toBe(false)
  })

  it('should check budget and pass when within limits', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule(rule)
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'func-a', duration: 50, calls: 10, memory: 100 })],
    })
    const results = po.checkBudget(snapshot)
    expect(results).toHaveLength(1)
    expect(results[0]!.passed).toBe(true)
  })

  it('should check budget and fail when exceeding duration', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule(rule)
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'func-a', duration: 200, calls: 10, memory: 100 })],
    })
    const results = po.checkBudget(snapshot)
    expect(results[0]!.passed).toBe(false)
    expect(results[0]!.actualDuration).toBe(200)
  })

  it('should check budget and fail when exceeding calls', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule(rule)
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'func-a', duration: 50, calls: 100, memory: 100 })],
    })
    const results = po.checkBudget(snapshot)
    expect(results[0]!.passed).toBe(false)
    expect(results[0]!.actualCalls).toBe(100)
  })

  it('should check budget and fail when exceeding memory', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule(rule)
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'func-a', duration: 50, calls: 10, memory: 500 })],
    })
    const results = po.checkBudget(snapshot)
    expect(results[0]!.passed).toBe(false)
    expect(results[0]!.actualMemory).toBe(500)
  })

  it('should check multiple rules against snapshot', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule({ name: 'rule1', target: 'func-a', maxDuration: 100, maxCalls: 50, maxMemory: 200 })
    po.addBudgetRule({ name: 'rule2', target: 'func-b', maxDuration: 50, maxCalls: 10, maxMemory: 100 })
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'func-a', duration: 50, calls: 10, memory: 50 }),
        makeEntry({ name: 'func-b', duration: 100, calls: 10, memory: 50 }),
      ],
    })
    const results = po.checkBudget(snapshot)
    expect(results).toHaveLength(2)
    const rule1Result = results.find((r) => r.rule.name === 'rule1')
    const rule2Result = results.find((r) => r.rule.name === 'rule2')
    expect(rule1Result!.passed).toBe(true)
    expect(rule2Result!.passed).toBe(false)
  })

  it('should return a copy of budget rules', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule(rule)
    const rules = po.getBudgetRules()
    rules.push({ name: 'extra', target: 'x', maxDuration: 1, maxCalls: 1, maxMemory: 1 })
    expect(po.getBudgetRules()).toHaveLength(1)
  })

  it('should return empty budget rules initially', () => {
    const po = new ProfileOptimizer()
    expect(po.getBudgetRules()).toEqual([])
  })

  it('should aggregate multiple matching entries for budget check', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule({ name: 'multi', target: 'func-a', maxDuration: 150, maxCalls: 20, maxMemory: 200 })
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'func-a', duration: 50, calls: 5, memory: 50 }),
        makeEntry({ name: 'func-a', duration: 50, calls: 5, memory: 50 }),
      ],
    })
    const results = po.checkBudget(snapshot)
    expect(results[0]!.actualDuration).toBe(100)
    expect(results[0]!.actualCalls).toBe(10)
    expect(results[0]!.actualMemory).toBe(100)
    expect(results[0]!.passed).toBe(true)
  })
})

describe('ProfileOptimizer - Statistics', () => {
  it('should compute total entries', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a' }),
        makeEntry({ name: 'b' }),
        makeEntry({ name: 'c' }),
      ],
    })
    const stats = po.getStatistics(snapshot)
    expect(stats.totalEntries).toBe(3)
  })

  it('should compute total duration', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', duration: 100 }),
        makeEntry({ name: 'b', duration: 200 }),
        makeEntry({ name: 'c', duration: 300 }),
      ],
    })
    const stats = po.getStatistics(snapshot)
    expect(stats.totalDuration).toBe(600)
  })

  it('should compute total memory', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', memory: 10 }),
        makeEntry({ name: 'b', memory: 20 }),
      ],
    })
    const stats = po.getStatistics(snapshot)
    expect(stats.totalMemory).toBe(30)
  })

  it('should compute total calls', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', calls: 5 }),
        makeEntry({ name: 'b', calls: 15 }),
      ],
    })
    const stats = po.getStatistics(snapshot)
    expect(stats.totalCalls).toBe(20)
  })

  it('should compute average duration', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', duration: 100 }),
        makeEntry({ name: 'b', duration: 200 }),
      ],
    })
    const stats = po.getStatistics(snapshot)
    expect(stats.avgDuration).toBe(150)
  })

  it('should compute max duration', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', duration: 100 }),
        makeEntry({ name: 'b', duration: 500 }),
        makeEntry({ name: 'c', duration: 200 }),
      ],
    })
    const stats = po.getStatistics(snapshot)
    expect(stats.maxDuration).toBe(500)
  })

  it('should group categories', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'a', category: 'network' }),
        makeEntry({ name: 'b', category: 'network' }),
        makeEntry({ name: 'c', category: 'cpu' }),
      ],
    })
    const stats = po.getStatistics(snapshot)
    expect(stats.categories['network']).toBe(2)
    expect(stats.categories['cpu']).toBe(1)
  })

  it('should return zeros for empty snapshot', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({ entries: [] })
    const stats = po.getStatistics(snapshot)
    expect(stats.totalEntries).toBe(0)
    expect(stats.totalDuration).toBe(0)
    expect(stats.totalMemory).toBe(0)
    expect(stats.totalCalls).toBe(0)
    expect(stats.avgDuration).toBe(0)
    expect(stats.maxDuration).toBe(0)
    expect(Object.keys(stats.categories)).toHaveLength(0)
  })
})

describe('ProfileOptimizer - Merge', () => {
  it('should merge snapshots by aggregating entries with same name', () => {
    const po = new ProfileOptimizer()
    const snap1: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-a', duration: 100, calls: 10, memory: 50 })],
      timestamp: 1000,
      label: 'snap1',
    }
    const snap2: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-a', duration: 200, calls: 20, memory: 100 })],
      timestamp: 2000,
      label: 'snap2',
    }
    const merged = po.mergeSnapshots([snap1, snap2])
    expect(merged.entries).toHaveLength(1)
    expect(merged.entries[0]!.duration).toBe(150)
    expect(merged.entries[0]!.calls).toBe(15)
    expect(merged.entries[0]!.memory).toBe(75)
  })

  it('should merge entries with different names', () => {
    const po = new ProfileOptimizer()
    const snap1: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-a', duration: 100 })],
      timestamp: 1000,
      label: 'snap1',
    }
    const snap2: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-b', duration: 200 })],
      timestamp: 2000,
      label: 'snap2',
    }
    const merged = po.mergeSnapshots([snap1, snap2])
    expect(merged.entries).toHaveLength(2)
  })

  it('should return empty for empty array', () => {
    const po = new ProfileOptimizer()
    const merged = po.mergeSnapshots([])
    expect(merged.entries).toEqual([])
    expect(merged.label).toBe('merged')
  })

  it('should merge three or more snapshots', () => {
    const po = new ProfileOptimizer()
    const snap1: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-a', duration: 100 })],
      timestamp: 1000,
      label: 'snap1',
    }
    const snap2: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-a', duration: 200 })],
      timestamp: 2000,
      label: 'snap2',
    }
    const snap3: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-a', duration: 300 })],
      timestamp: 3000,
      label: 'snap3',
    }
    const merged = po.mergeSnapshots([snap1, snap2, snap3])
    expect(merged.entries).toHaveLength(1)
    expect(merged.entries[0]!.duration).toBe(200)
  })

  it('should preserve category from first entry', () => {
    const po = new ProfileOptimizer()
    const snap1: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-a', category: 'network' })],
      timestamp: 1000,
      label: 'snap1',
    }
    const snap2: ProfileSnapshot = {
      entries: [makeEntry({ name: 'func-a', category: 'cpu' })],
      timestamp: 2000,
      label: 'snap2',
    }
    const merged = po.mergeSnapshots([snap1, snap2])
    expect(merged.entries[0]!.category).toBe('network')
  })

  it('should set merged label', () => {
    const po = new ProfileOptimizer()
    const merged = po.mergeSnapshots([makeSnapshot()])
    expect(merged.label).toBe('merged')
  })
})

describe('ProfileOptimizer - Clear', () => {
  it('should clear all snapshots and rules', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(makeSnapshot())
    po.addBudgetRule({ name: 'rule', target: 'x', maxDuration: 100, maxCalls: 10, maxMemory: 50 })
    po.clear()
    expect(po.getSnapshots()).toEqual([])
    expect(po.getBudgetRules()).toEqual([])
  })

  it('should allow adding after clear', () => {
    const po = new ProfileOptimizer()
    po.addSnapshot(makeSnapshot())
    po.clear()
    po.addSnapshot(makeSnapshot({ label: 'new' }))
    expect(po.getSnapshots()).toHaveLength(1)
    expect(po.getSnapshot('new')).toBeDefined()
  })
})

describe('ProfileOptimizer - Edge Cases', () => {
  it('should handle empty snapshot in getTopEntries', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({ entries: [] })
    expect(po.getTopEntries(snapshot, 5)).toEqual([])
  })

  it('should handle single entry snapshot', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({ entries: [makeEntry({ name: 'only', duration: 42 })] })
    const top = po.getTopEntries(snapshot, 5)
    expect(top).toHaveLength(1)
    expect(top[0]!.duration).toBe(42)
  })

  it('should handle zero duration entries in regression detection', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'zero', duration: 0 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'zero', duration: 0 })],
      timestamp: 2000,
      label: 'curr',
    }
    const regressions = po.detectRegressions(base, curr)
    expect(regressions).toHaveLength(0)
  })

  it('should handle zero duration baseline in regression detection', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'zero-base', duration: 0 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'zero-base', duration: 100 })],
      timestamp: 2000,
      label: 'curr',
    }
    const regressions = po.detectRegressions(base, curr)
    expect(regressions).toHaveLength(0)
  })

  it('should handle no regressions scenario', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 50 })],
      timestamp: 2000,
      label: 'curr',
    }
    const regressions = po.detectRegressions(base, curr)
    expect(regressions).toHaveLength(0)
  })

  it('should handle all regressions scenario', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [
        makeEntry({ name: 'a', duration: 100 }),
        makeEntry({ name: 'b', duration: 200 }),
      ],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [
        makeEntry({ name: 'a', duration: 300 }),
        makeEntry({ name: 'b', duration: 600 }),
      ],
      timestamp: 2000,
      label: 'curr',
    }
    const regressions = po.detectRegressions(base, curr)
    expect(regressions).toHaveLength(2)
  })

  it('should handle empty snapshot in checkBudget', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule({ name: 'rule', target: 'x', maxDuration: 100, maxCalls: 10, maxMemory: 50 })
    const snapshot = makeSnapshot({ entries: [] })
    const results = po.checkBudget(snapshot)
    expect(results).toHaveLength(1)
    expect(results[0]!.passed).toBe(true)
    expect(results[0]!.actualDuration).toBe(0)
  })

  it('should handle getTopEntries with zero N', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({ entries: [makeEntry()] })
    expect(po.getTopEntries(snapshot, 0)).toEqual([])
  })

  it('should handle regression with exact threshold boundary', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 110 })],
      timestamp: 2000,
      label: 'curr',
    }
    const atThreshold = po.detectRegressions(base, curr, 10)
    expect(atThreshold).toHaveLength(0)
    const belowThreshold = po.detectRegressions(base, curr, 9.9)
    expect(belowThreshold).toHaveLength(1)
  })

  it('should handle improvement with exact threshold boundary', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 90 })],
      timestamp: 2000,
      label: 'curr',
    }
    const atThreshold = po.detectImprovements(base, curr, 10)
    expect(atThreshold).toHaveLength(0)
    const belowThreshold = po.detectImprovements(base, curr, 9.9)
    expect(belowThreshold).toHaveLength(1)
  })

  it('should generate suggestions with estimated saving', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'slow', duration: 2000, calls: 10, memory: 10 })],
    })
    const suggestions = po.generateSuggestions(snapshot)
    const perfSuggestion = suggestions.find((s) => s.category === 'performance')
    expect(perfSuggestion!.estimatedSaving).toBe(600)
  })

  it('should handle merge with single snapshot', () => {
    const po = new ProfileOptimizer()
    const snap = makeSnapshot({
      entries: [makeEntry({ name: 'a', duration: 100, calls: 10, memory: 50 })],
    })
    const merged = po.mergeSnapshots([snap])
    expect(merged.entries).toHaveLength(1)
    expect(merged.entries[0]!.duration).toBe(100)
    expect(merged.entries[0]!.calls).toBe(10)
    expect(merged.entries[0]!.memory).toBe(50)
  })

  it('should handle budget rule with no matching entries', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule({ name: 'rule', target: 'nonexistent', maxDuration: 100, maxCalls: 10, maxMemory: 50 })
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'other', duration: 200 })],
    })
    const results = po.checkBudget(snapshot)
    expect(results[0]!.passed).toBe(true)
    expect(results[0]!.actualDuration).toBe(0)
  })

  it('should handle getStatistics with single entry', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'only', duration: 42, calls: 7, memory: 13 })],
    })
    const stats = po.getStatistics(snapshot)
    expect(stats.totalEntries).toBe(1)
    expect(stats.totalDuration).toBe(42)
    expect(stats.totalCalls).toBe(7)
    expect(stats.totalMemory).toBe(13)
    expect(stats.avgDuration).toBe(42)
    expect(stats.maxDuration).toBe(42)
  })

  it('should handle hotspots with single entry', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [makeEntry({ name: 'only', duration: 100 })],
    })
    const hotspots = po.getHotspots(snapshot, 50)
    expect(hotspots).toHaveLength(1)
    expect(hotspots[0]!.name).toBe('only')
  })

  it('should handle removeBudgetRule with multiple rules of same name', () => {
    const po = new ProfileOptimizer()
    po.addBudgetRule({ name: 'dup', target: 'a', maxDuration: 100, maxCalls: 10, maxMemory: 50 })
    po.addBudgetRule({ name: 'dup', target: 'b', maxDuration: 200, maxCalls: 20, maxMemory: 100 })
    po.removeBudgetRule('dup')
    expect(po.getBudgetRules()).toHaveLength(1)
    expect(po.getBudgetRules()[0]!.target).toBe('b')
  })

  it('should calculate percentage change correctly for regressions', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 150 })],
      timestamp: 2000,
      label: 'curr',
    }
    const regressions = po.detectRegressions(base, curr)
    expect(regressions[0]!.percentageChange).toBe(50)
    expect(regressions[0]!.increase).toBe(50)
  })

  it('should calculate percentage change correctly for improvements', () => {
    const po = new ProfileOptimizer()
    const base: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 200 })],
      timestamp: 1000,
      label: 'base',
    }
    const curr: ProfileSnapshot = {
      entries: [makeEntry({ name: 'a', duration: 100 })],
      timestamp: 2000,
      label: 'curr',
    }
    const improvements = po.detectImprovements(base, curr)
    expect(improvements[0]!.percentageChange).toBe(50)
    expect(improvements[0]!.decrease).toBe(100)
  })

  it('should generate medium impact suggestion for moderate duration', () => {
    const po = new ProfileOptimizer()
    const snapshot = makeSnapshot({
      entries: [
        makeEntry({ name: 'moderate', duration: 1500, calls: 10, memory: 10 }),
        makeEntry({ name: 'big', duration: 5000, calls: 10, memory: 10 }),
        makeEntry({ name: 'small', duration: 500, calls: 10, memory: 10 }),
      ],
    })
    const suggestions = po.generateSuggestions(snapshot)
    const moderateSuggestion = suggestions.find((s) => s.target === 'moderate' && s.category === 'performance')
    expect(moderateSuggestion).toBeDefined()
    expect(moderateSuggestion!.impact).toBe('medium')
  })

  it('should handle addEntry to snapshot created by addEntry', () => {
    const po = new ProfileOptimizer()
    po.addEntry('dynamic', makeEntry({ name: 'first' }))
    po.addEntry('dynamic', makeEntry({ name: 'second' }))
    const snapshot = po.getSnapshot('dynamic')
    expect(snapshot).toBeDefined()
    expect(snapshot!.entries).toHaveLength(2)
    expect(snapshot!.entries[0]!.name).toBe('first')
    expect(snapshot!.entries[1]!.name).toBe('second')
  })
})
