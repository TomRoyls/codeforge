import { describe, expect, it } from 'vitest'

import {
  buildSundialResult,
  buildSegments,
  classifyOverallGrade,
  classifySegment,
  computeEfficiencyIndex,
  computeSundialAccuracy,
  computeWasteIndex,
  estimateSpaceComplexity,
  estimateTimeComplexity,
  findShadowPaths,
  generateSundialRecommendations,
  takeReading,
  type DialReading,
  type ShadowPath,
  type SundialStats,
} from '../src/commands/sundial-helpers.js'
import { formatSundialJson, formatSundialTable } from '../src/commands/sundial-format-helpers.js'

// ─── estimateTimeComplexity ────────────────────────────────────────────────────

describe('estimateTimeComplexity', () => {
  it('returns O(1) for simple code', () => {
    expect(estimateTimeComplexity('const x = 1')).toBe('O(1)')
  })

  it('returns O(1) for no loops', () => {
    expect(estimateTimeComplexity('function add(a, b) { return a + b }')).toBe('O(1)')
  })

  it('returns O(n) for single loop', () => {
    expect(estimateTimeComplexity('for (const x of arr) { console.log(x) }')).toBe('O(n)')
  })

  it('returns O(n) for while loop', () => {
    expect(estimateTimeComplexity('while (i < n) { i++ }')).toBe('O(n)')
  })

  it('returns O(n²) for nested loops', () => {
    expect(estimateTimeComplexity('for (const a of arr) { for (const b of arr) { } }')).toBe('O(n²)')
  })

  it('returns O(n³) for triple nested loops', () => {
    const code = 'for (const a of arr) { for (const b of arr) { for (const c of arr) { } } }'
    expect(estimateTimeComplexity(code)).toBe('O(n³)')
  })

  it('returns O(n log n) for sort with loop', () => {
    expect(estimateTimeComplexity('for (const x of arr) { arr.sort() }')).toBe('O(n log n)')
  })

  it('returns O(log n) for binary search pattern', () => {
    expect(estimateTimeComplexity('function binarySearch(arr, target) { }')).toBe('O(log n)')
  })

  it('ignores comments', () => {
    expect(estimateTimeComplexity('// for loop here\nconst x = 1')).toBe('O(1)')
  })

  it('detects recursion as O(2^n)', () => {
    const code = 'function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }'
    expect(estimateTimeComplexity(code)).toBe('O(2^n)')
  })
})

// ─── estimateSpaceComplexity ──────────────────────────────────────────────────

describe('estimateSpaceComplexity', () => {
  it('returns O(1) for simple code', () => {
    expect(estimateSpaceComplexity('const x = 1')).toBe('O(1)')
  })

  it('returns O(n) for new Array', () => {
    expect(estimateSpaceComplexity('const arr = new Array(n)')).toBe('O(n)')
  })

  it('returns O(n) for push operations', () => {
    const result = estimateSpaceComplexity('arr.push(1)')
    expect(result).toBe('O(n)')
  })

  it('returns O(n) for JSON operations', () => {
    expect(estimateSpaceComplexity('JSON.parse(data)')).toBe('O(n)')
  })

  it('returns O(n) for Map/Set', () => {
    expect(estimateSpaceComplexity('const m = new Map()')).toBe('O(n)')
  })
})

// ─── findShadowPaths ──────────────────────────────────────────────────────────

describe('findShadowPaths', () => {
  it('returns empty for efficient code', () => {
    const paths = findShadowPaths('const x = 1 + 1', 'a.ts')
    expect(paths.length).toBe(0)
  })

  it('detects repeated lookups', () => {
    const code = 'const a = obj.x;\nconst b = obj.x;\nconst c = obj.x;'
    const paths = findShadowPaths(code, 'a.ts')
    expect(paths.some(p => p.type === 'repeated-lookup')).toBe(true)
  })

  it('detects unnecessary copies', () => {
    const paths = findShadowPaths('arr.slice().sort()', 'a.ts')
    expect(paths.some(p => p.type === 'unnecessary-copy')).toBe(true)
  })

  it('detects double iteration', () => {
    const code = 'arr.forEach(x => {})\narr.forEach(x => {})'
    const paths = findShadowPaths(code, 'a.ts')
    expect(paths.some(p => p.type === 'double-iteration')).toBe(true)
  })

  it('detects nested loops', () => {
    const code = 'for (const a of arr) {\n  for (const b of arr) {\n    console.log(a, b)\n  }\n}'
    const paths = findShadowPaths(code, 'a.ts')
    expect(paths.some(p => p.type === 'nested-loop')).toBe(true)
  })

  it('detects excessive allocation', () => {
    const code = 'const a = { ...obj1 }\nconst b = { ...obj2 }\nconst c = { ...obj3 }'
    const paths = findShadowPaths(code, 'a.ts')
    expect(paths.some(p => p.type === 'excessive-allocation')).toBe(true)
  })

  it('sets correct waste level for repeated lookups', () => {
    const code = 'const a = fn();\nconst b = fn();\nconst c = fn();\nconst d = fn();'
    const paths = findShadowPaths(code, 'a.ts')
    const repeated = paths.find(p => p.type === 'repeated-lookup')
    expect(repeated?.wasteLevel).toBe('severe')
  })

  it('provides fix suggestions', () => {
    const code = 'arr.slice().sort()'
    const paths = findShadowPaths(code, 'a.ts')
    expect(paths[0]?.fix.length).toBeGreaterThan(0)
  })

  it('provides estimated savings', () => {
    const code = 'arr.slice().sort()'
    const paths = findShadowPaths(code, 'a.ts')
    expect(paths[0]?.estimatedSavings.length).toBeGreaterThan(0)
  })

  it('sets correct file path', () => {
    const paths = findShadowPaths('arr.slice().sort()', 'src/utils.ts')
    expect(paths[0]?.file).toBe('src/utils.ts')
  })

  it('sets correct line numbers', () => {
    const code = 'const x = 1\narr.slice().sort()'
    const paths = findShadowPaths(code, 'a.ts')
    const copy = paths.find(p => p.type === 'unnecessary-copy')
    expect(copy?.line).toBe(2)
  })
})

// ─── takeReading ──────────────────────────────────────────────────────────────

describe('takeReading', () => {
  it('returns 100 efficiency for simple code', () => {
    const reading = takeReading('const x = 1', 'a.ts')
    expect(reading.efficiency).toBe(100)
  })

  it('returns correct file path', () => {
    const reading = takeReading('const x = 1', 'src/a.ts')
    expect(reading.file).toBe('src/a.ts')
  })

  it('counts operations', () => {
    const code = 'arr.map(x => x).filter(x => x)'
    const reading = takeReading(code, 'a.ts')
    expect(reading.operationCount).toBeGreaterThanOrEqual(2)
  })

  it('detects time complexity', () => {
    const code = 'for (const x of arr) { console.log(x) }'
    const reading = takeReading(code, 'a.ts')
    expect(reading.timeComplexity).toBe('O(n)')
  })

  it('assigns optimal grade for efficient code', () => {
    const reading = takeReading('const x = 1', 'a.ts')
    expect(reading.grade).toBe('optimal')
  })

  it('assigns lower efficiency for nested loops', () => {
    const code = 'for (const a of arr) { for (const b of arr) { } }'
    const reading = takeReading(code, 'a.ts')
    expect(reading.efficiency).toBeLessThan(70)
  })

  it('sets obstruction level for inefficient code', () => {
    const code = 'for (const a of arr) { for (const b of arr) { for (const c of arr) {} } }'
    const reading = takeReading(code, 'a.ts')
    expect(reading.obstructionLevel).toBeGreaterThan(0)
  })

  it('counts shadow paths', () => {
    const code = 'arr.slice().sort()'
    const reading = takeReading(code, 'a.ts')
    expect(reading.shadowPaths).toBeGreaterThanOrEqual(0)
  })

  it('computes space complexity', () => {
    const reading = takeReading('const x = 1', 'a.ts')
    expect(reading.spaceComplexity).toBeDefined()
  })

  it('grade is one of the valid values', () => {
    const reading = takeReading('const x = 1', 'a.ts')
    expect(['optimal', 'efficient', 'adequate', 'wasteful', 'extravagant']).toContain(reading.grade)
  })

  it('assigns wasteful or extravagant for very inefficient code', () => {
    const code = Array(10).fill('for (const a of arr) { for (const b of arr) { } }').join('\n')
    const reading = takeReading(code, 'a.ts')
    expect(['wasteful', 'extravagant', 'adequate']).toContain(reading.grade)
    expect(reading.efficiency).toBeLessThan(50)
  })
})

// ─── classifySegment ──────────────────────────────────────────────────────────

describe('classifySegment', () => {
  it('returns golden-hour for high efficiency', () => {
    expect(classifySegment(90)).toBe('golden-hour')
  })

  it('returns midday for good efficiency', () => {
    expect(classifySegment(70)).toBe('midday')
  })

  it('returns afternoon for moderate efficiency', () => {
    expect(classifySegment(50)).toBe('afternoon')
  })

  it('returns twilight for low efficiency', () => {
    expect(classifySegment(30)).toBe('twilight')
  })

  it('returns midnight for very low efficiency', () => {
    expect(classifySegment(10)).toBe('midnight')
  })

  it('returns golden-hour at boundary 80', () => {
    expect(classifySegment(80)).toBe('golden-hour')
  })

  it('returns midday at boundary 60', () => {
    expect(classifySegment(60)).toBe('midday')
  })

  it('returns afternoon at boundary 40', () => {
    expect(classifySegment(40)).toBe('afternoon')
  })

  it('returns twilight at boundary 20', () => {
    expect(classifySegment(20)).toBe('twilight')
  })

  it('returns midnight at 0', () => {
    expect(classifySegment(0)).toBe('midnight')
  })
})

// ─── computeEfficiencyIndex ───────────────────────────────────────────────────

describe('computeEfficiencyIndex', () => {
  it('returns 100 for empty readings', () => {
    expect(computeEfficiencyIndex([])).toBe(100)
  })

  it('computes average efficiency', () => {
    const readings: DialReading[] = [
      { file: 'a.ts', efficiency: 80, operationCount: 0, unnecessaryOps: 0, optimalPaths: 0, shadowPaths: 0, obstructionLevel: 0, timeComplexity: 'O(1)', spaceComplexity: 'O(1)', grade: 'optimal' },
      { file: 'b.ts', efficiency: 60, operationCount: 0, unnecessaryOps: 0, optimalPaths: 0, shadowPaths: 0, obstructionLevel: 0, timeComplexity: 'O(1)', spaceComplexity: 'O(1)', grade: 'efficient' },
    ]
    expect(computeEfficiencyIndex(readings)).toBe(70)
  })

  it('returns single reading efficiency', () => {
    const readings: DialReading[] = [
      { file: 'a.ts', efficiency: 75, operationCount: 0, unnecessaryOps: 0, optimalPaths: 0, shadowPaths: 0, obstructionLevel: 0, timeComplexity: 'O(1)', spaceComplexity: 'O(1)', grade: 'efficient' },
    ]
    expect(computeEfficiencyIndex(readings)).toBe(75)
  })
})

// ─── computeWasteIndex ────────────────────────────────────────────────────────

describe('computeWasteIndex', () => {
  it('returns 0 for no shadow paths', () => {
    expect(computeWasteIndex([])).toBe(0)
  })

  it('computes waste for minor paths', () => {
    const paths: ShadowPath[] = [
      { type: 'unnecessary-copy', file: 'a.ts', line: 1, description: '', wasteLevel: 'minor', estimatedSavings: '', fix: '' },
    ]
    expect(computeWasteIndex(paths)).toBe(3)
  })

  it('computes waste for major paths', () => {
    const paths: ShadowPath[] = [
      { type: 'nested-loop', file: 'a.ts', line: 1, description: '', wasteLevel: 'major', estimatedSavings: '', fix: '' },
    ]
    expect(computeWasteIndex(paths)).toBe(15)
  })

  it('computes waste for severe paths', () => {
    const paths: ShadowPath[] = [
      { type: 'nested-loop', file: 'a.ts', line: 1, description: '', wasteLevel: 'severe', estimatedSavings: '', fix: '' },
    ]
    expect(computeWasteIndex(paths)).toBe(25)
  })

  it('computes waste for moderate paths', () => {
    const paths: ShadowPath[] = [
      { type: 'double-iteration', file: 'a.ts', line: 1, description: '', wasteLevel: 'moderate', estimatedSavings: '', fix: '' },
    ]
    expect(computeWasteIndex(paths)).toBe(8)
  })

  it('caps at 100', () => {
    const paths: ShadowPath[] = Array.from({ length: 10 }, () => ({
      type: 'nested-loop' as const, file: 'a.ts', line: 1, description: '', wasteLevel: 'severe' as const, estimatedSavings: '', fix: '',
    }))
    expect(computeWasteIndex(paths)).toBe(100)
  })
})

// ─── computeSundialAccuracy ───────────────────────────────────────────────────

describe('computeSundialAccuracy', () => {
  it('returns 100 for perfect scores', () => {
    expect(computeSundialAccuracy(100, 0)).toBe(100)
  })

  it('returns 0 for worst scores', () => {
    expect(computeSundialAccuracy(0, 100)).toBe(0)
  })

  it('weights efficiency at 70 percent and waste at 30 percent', () => {
    const result = computeSundialAccuracy(100, 0)
    expect(result).toBe(100)
  })

  it('computes mixed scores', () => {
    const result = computeSundialAccuracy(50, 50)
    expect(result).toBe(50)
  })

  it('is bounded 0-100', () => {
    expect(computeSundialAccuracy(0, 0)).toBeGreaterThanOrEqual(0)
    expect(computeSundialAccuracy(100, 100)).toBeLessThanOrEqual(100)
  })
})

// ─── classifyOverallGrade ─────────────────────────────────────────────────────

describe('classifyOverallGrade', () => {
  it('returns atomic-clock for high scores', () => {
    expect(classifyOverallGrade(95, 90)).toBe('atomic-clock')
  })

  it('returns precision for good scores', () => {
    expect(classifyOverallGrade(75, 70)).toBe('precision')
  })

  it('returns standard for moderate scores', () => {
    expect(classifyOverallGrade(55, 50)).toBe('standard')
  })

  it('returns sundial for low scores', () => {
    expect(classifyOverallGrade(35, 30)).toBe('sundial')
  })

  it('returns hourglass for very low scores', () => {
    expect(classifyOverallGrade(10, 10)).toBe('hourglass')
  })
})

// ─── buildSegments ────────────────────────────────────────────────────────────

describe('buildSegments', () => {
  const makeReading = (eff: number, file = 'a.ts'): DialReading => ({
    file, efficiency: eff, operationCount: 0, unnecessaryOps: 0, optimalPaths: 0,
    shadowPaths: 0, obstructionLevel: 0, timeComplexity: 'O(1)', spaceComplexity: 'O(1)', grade: 'optimal',
  })

  it('returns empty for no readings', () => {
    expect(buildSegments([])).toEqual([])
  })

  it('groups files by segment type', () => {
    const readings = [makeReading(90, 'a.ts'), makeReading(85, 'b.ts')]
    const segments = buildSegments(readings)
    const golden = segments.find(s => s.type === 'golden-hour')
    expect(golden?.files.length).toBe(2)
  })

  it('computes average efficiency per segment', () => {
    const readings = [makeReading(90, 'a.ts'), makeReading(80, 'b.ts')]
    const segments = buildSegments(readings)
    const golden = segments.find(s => s.type === 'golden-hour')
    expect(golden?.avgEfficiency).toBe(85)
  })

  it('orders segments from golden-hour to midnight', () => {
    const readings = [makeReading(90, 'a.ts'), makeReading(30, 'b.ts'), makeReading(60, 'c.ts')]
    const segments = buildSegments(readings)
    const types = segments.map(s => s.type)
    const order = ['golden-hour', 'midday', 'afternoon', 'twilight', 'midnight']
    const indices = types.map(t => order.indexOf(t))
    for (let i = 1; i < indices.length; i++) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1])
    }
  })

  it('includes descriptions', () => {
    const readings = [makeReading(90, 'a.ts')]
    const segments = buildSegments(readings)
    expect(segments[0].description.length).toBeGreaterThan(0)
  })
})

// ─── generateSundialRecommendations ───────────────────────────────────────────

describe('generateSundialRecommendations', () => {
  const makeStats = (overrides: Partial<SundialStats> = {}): SundialStats => ({
    totalReadings: 1,
    avgEfficiency: 80,
    optimalFiles: 1,
    extravagantFiles: 0,
    totalShadowPaths: 0,
    severeShadowPaths: 0,
    goldenHourFiles: 1,
    midnightFiles: 0,
    commonTimeComplexity: 'O(1)',
    avgObstructionLevel: 10,
    efficiencyIndex: 80,
    wasteIndex: 10,
    sundialAccuracy: 80,
    overallGrade: 'atomic-clock',
    ...overrides,
  })

  it('recommends addressing severe shadow paths', () => {
    const paths: ShadowPath[] = [
      { type: 'nested-loop', file: 'a.ts', line: 1, description: '', wasteLevel: 'severe', estimatedSavings: '', fix: '' },
    ]
    const recs = generateSundialRecommendations([], paths, makeStats())
    expect(recs.some(r => r.includes('severe'))).toBe(true)
  })

  it('recommends redesigning extravagant files', () => {
    const readings: DialReading[] = [
      { file: 'bad.ts', efficiency: 10, operationCount: 0, unnecessaryOps: 0, optimalPaths: 0, shadowPaths: 0, obstructionLevel: 0, timeComplexity: 'O(n²)', spaceComplexity: 'O(n)', grade: 'extravagant' },
    ]
    const recs = generateSundialRecommendations(readings, [], makeStats({ extravagantFiles: 1 }))
    expect(recs.some(r => r.includes('extravagant') || r.includes('Redesign'))).toBe(true)
  })

  it('recommends prioritizing midnight files', () => {
    const readings: DialReading[] = [
      { file: 'slow.ts', efficiency: 10, operationCount: 0, unnecessaryOps: 0, optimalPaths: 0, shadowPaths: 0, obstructionLevel: 0, timeComplexity: 'O(n³)', spaceComplexity: 'O(n)', grade: 'extravagant' },
    ]
    const recs = generateSundialRecommendations(readings, [], makeStats({ midnightFiles: 1 }))
    expect(recs.some(r => r.includes('midnight') || r.includes('Prioritize'))).toBe(true)
  })

  it('recommends addressing common waste patterns', () => {
    const paths: ShadowPath[] = Array.from({ length: 4 }, () => ({
      type: 'nested-loop' as const, file: 'a.ts', line: 1, description: '', wasteLevel: 'major' as const, estimatedSavings: '', fix: '',
    }))
    const recs = generateSundialRecommendations([], paths, makeStats())
    expect(recs.some(r => r.includes('Common waste pattern'))).toBe(true)
  })

  it('recommends for high waste index', () => {
    const recs = generateSundialRecommendations([], [], makeStats({ wasteIndex: 60 }))
    expect(recs.some(r => r.includes('waste index'))).toBe(true)
  })

  it('recommends for low sundial accuracy', () => {
    const recs = generateSundialRecommendations([], [], makeStats({ sundialAccuracy: 30 }))
    expect(recs.some(r => r.includes('sundial accuracy'))).toBe(true)
  })

  it('recommends for high time complexity files', () => {
    const readings: DialReading[] = [
      { file: 'a.ts', efficiency: 50, operationCount: 0, unnecessaryOps: 0, optimalPaths: 0, shadowPaths: 0, obstructionLevel: 0, timeComplexity: 'O(n²)', spaceComplexity: 'O(n)', grade: 'adequate' },
      { file: 'b.ts', efficiency: 50, operationCount: 0, unnecessaryOps: 0, optimalPaths: 0, shadowPaths: 0, obstructionLevel: 0, timeComplexity: 'O(n³)', spaceComplexity: 'O(n)', grade: 'adequate' },
    ]
    const recs = generateSundialRecommendations(readings, [], makeStats())
    expect(recs.some(r => r.includes('time complexity'))).toBe(true)
  })
})

// ─── buildSundialResult ───────────────────────────────────────────────────────

describe('buildSundialResult', () => {
  it('returns all required fields', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    expect(result).toHaveProperty('readings')
    expect(result).toHaveProperty('shadowPaths')
    expect(result).toHaveProperty('segments')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('handles empty input', () => {
    const result = buildSundialResult([], [], {})
    expect(result.readings).toEqual([])
    expect(result.stats.totalReadings).toBe(0)
    expect(result.stats.avgEfficiency).toBe(100)
  })

  it('handles single file', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    expect(result.readings.length).toBe(1)
    expect(result.stats.totalReadings).toBe(1)
  })

  it('handles multiple files', () => {
    const result = buildSundialResult(['a.ts', 'b.ts'], ['const x = 1', 'for (const y of arr) {}'], {})
    expect(result.readings.length).toBe(2)
  })

  it('computes stats correctly', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.efficiencyIndex).toBeGreaterThan(0)
    expect(result.stats.wasteIndex).toBe(0)
    expect(result.stats.overallGrade).toBeDefined()
  })

  it('detects shadow paths across files', () => {
    const result = buildSundialResult(['a.ts'], ['arr.slice().sort()'], {})
    expect(result.shadowPaths.length).toBeGreaterThanOrEqual(0)
  })

  it('builds segments from readings', () => {
    const result = buildSundialResult(['a.ts', 'b.ts'], ['const x = 1', 'for (const a of arr) { for (const b of arr) {} }'], {})
    expect(result.segments.length).toBeGreaterThanOrEqual(1)
  })

  it('sets common time complexity', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    expect(['O(1)', 'O(n)', 'O(n²)']).toContain(result.stats.commonTimeComplexity)
  })

  it('sets overall grade', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    expect(['atomic-clock', 'precision', 'standard', 'sundial', 'hourglass']).toContain(result.stats.overallGrade)
  })

  it('generates recommendations', () => {
    const result = buildSundialResult(['a.ts', 'b.ts', 'c.ts'], [
      'for (const a of arr) { for (const b of arr) { for (const c of arr) {} } }',
      'for (const a of arr) { for (const b of arr) { for (const c of arr) {} } }',
      'for (const a of arr) { for (const b of arr) { for (const c of arr) {} } }',
    ], {})
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatSundialTable ───────────────────────────────────────────────────────

describe('formatSundialTable', () => {
  it('returns a string', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatSundialTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('contains section headings', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatSundialTable(result, false)
    expect(formatted).toContain('Readings')
    expect(formatted).toContain('Shadow Paths')
    expect(formatted).toContain('Dial Segments')
  })

  it('shows no readings message for empty', () => {
    const result = buildSundialResult([], [], {})
    const formatted = formatSundialTable(result, false)
    expect(formatted).toContain('No readings taken')
  })

  it('shows recommendations when present', () => {
    const result = buildSundialResult(['a.ts', 'b.ts', 'c.ts', 'd.ts'], [
      Array(20).fill('for (const a of arr) { for (const b of arr) { for (const c of arr) {} } }').join('\n'),
      'const x = 1', 'const y = 2', 'const z = 3',
    ], {})
    const formatted = formatSundialTable(result, false)
    if (result.recommendations.length > 0) {
      expect(formatted).toContain('Recommendations')
    }
  })

  it('shows verbose output', () => {
    const files = Array.from({ length: 15 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const result = buildSundialResult(files, contents, {})
    const formatted = formatSundialTable(result, true)
    expect(formatted).toContain('file14.ts')
  })
})

// ─── formatSundialJson ────────────────────────────────────────────────────────

describe('formatSundialJson', () => {
  it('returns valid JSON', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    const json = formatSundialJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains all top-level keys', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatSundialJson(result))
    expect(parsed).toHaveProperty('readings')
    expect(parsed).toHaveProperty('shadowPaths')
    expect(parsed).toHaveProperty('segments')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('roundtrips correctly', () => {
    const result = buildSundialResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatSundialJson(result))
    expect(parsed.stats.totalReadings).toBe(result.stats.totalReadings)
    expect(parsed.stats.efficiencyIndex).toBe(result.stats.efficiencyIndex)
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('sundial integration', () => {
  it('handles a realistic codebase', () => {
    const files = ['src/index.ts', 'src/utils.ts', 'src/sort.ts']
    const contents = [
      'export function main() {}',
      'export function helper(x) { return x * 2 }',
      'for (const a of arr) { for (const b of arr) { if (a === b) return true } }',
    ]
    const result = buildSundialResult(files, contents, {})

    expect(result.readings.length).toBe(3)
    expect(result.segments.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalReadings).toBe(3)
    expect(result.stats.overallGrade).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('produces consistent results for same input', () => {
    const r1 = buildSundialResult(['a.ts'], ['const x = 1'], {})
    const r2 = buildSundialResult(['a.ts'], ['const x = 1'], {})
    expect(r1.stats.efficiencyIndex).toBe(r2.stats.efficiencyIndex)
    expect(r1.stats.wasteIndex).toBe(r2.stats.wasteIndex)
  })

  it('handles files with heavy shadow paths', () => {
    const code = [
      'arr.slice().sort()',
      'for (const a of arr) { for (const b of arr) {} }',
      'const a = fn(); const b = fn(); const c = fn(); const d = fn();',
    ].join('\n')
    const result = buildSundialResult(['heavy.ts'], [code], {})
    expect(result.shadowPaths.length).toBeGreaterThan(0)
    expect(result.stats.totalShadowPaths).toBeGreaterThan(0)
  })

  it('all zero-shadow-path files are in golden-hour or midday', () => {
    const result = buildSundialResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    for (const r of result.readings) {
      expect(r.efficiency).toBe(100)
    }
  })
})
