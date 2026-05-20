import { describe, expect, it } from 'vitest'

import {
  buildVitalsResult,
  classifyStatus,
  computeComplexity,
  computeOverallHealth,
  computeOrganHealth,
  countCatchBlocks,
  countExports,
  countFunctions,
  countTodoMarkers,
  determinePrognosis,
  determineTriage,
  diagnoseOrgan,
  diagnoseSymptoms,
  examineOrgan,
  generateRecommendations,
  isTestFile,
  measureBloodPressure,
  measureHeartRateVariability,
  measureOxygen,
  measurePulse,
  measureRespiration,
  measureTemperature,
  measureWhiteBloodCellCount,
  type OrganReport,
  type Symptom,
  type VitalsStats,
  type VitalSign,
} from '../src/commands/vitals-helpers.js'

import {
  formatOrganHealthChart,
  formatOverallHealthMeter,
  formatRecommendations,
  formatSymptomList,
  formatVitalsJSON,
  formatVitalsStats,
  formatVitalsTable,
  formatVitalSignsMonitor,
} from '../src/commands/vitals-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CLEAN_CODE = `/**
 * A well-documented utility.
 */
export function add(a: number, b: number): number {
  return a + b
}
export function multiply(a: number, b: number): number {
  return a * b
}
`

const COMPLEX_CODE = `function deep(x: any) {
  if (x) {
    if (y) {
      if (z) {
        for (let i = 0; i < 100; i++) {
          while (w) { if (a) {} if (b) {} if (c) {} if (d) {} if (e) {} if (f) {} }
        }
      }
    }
  }
}
function deeper(p: any) {
  if (p) {
    if (q) {
      if (r) {
        if (s) {
          for (let j = 0; j < 100; j++) {
            while (t) { if (g) {} if (h) {} if (i) {} }
          }
        }
      }
    }
  }
}
`

const RISKY_CODE = `// TODO: fix this later
// FIXME: broken logic
// TODO: refactor needed
// HACK: temporary workaround
// TODO: add error handling
// TODO: missing tests
// FIXME: security issue
// TODO: optimize this
export function risky() { if (true) { for (let i = 0; i < 100; i++) {} } }
export function alsoRisky() {}
export function moreRisky() {}
export function yetAnother() {}
export function tooMany() {}
export function wayTooMany() {}
`

const ERROR_HANDLED_CODE = `function safeOp() {
  try {
    doSomething()
  } catch (e) {
    handleError(e)
  }
}
function anotherSafe() {
  try {
    doOther()
  } catch (err) {
    log(err)
  }
}
`

const LARGE_FILE = 'const x = 1\n'.repeat(400)

// ─── classifyStatus ───────────────────────────────────────────────────────────

describe('classifyStatus', () => {
  it('returns normal for in-range value', () => {
    expect(classifyStatus(10, [5, 15], 20, 30)).toBe('normal')
  })

  it('returns critical for high value', () => {
    expect(classifyStatus(35, [5, 15], 20, 30)).toBe('critical')
  })

  it('returns warning for borderline high', () => {
    expect(classifyStatus(22, [5, 15], 20, 30)).toBe('warning')
  })

  it('returns critical for low value', () => {
    expect(classifyStatus(2, [10, 30], 5, 2)).toBe('critical')
  })

  it('returns warning for low borderline', () => {
    expect(classifyStatus(8, [10, 30], 5, 2)).toBe('warning')
  })

  it('returns normal at range boundary', () => {
    expect(classifyStatus(15, [5, 15], 20, 30)).toBe('normal')
  })

  it('returns normal at lower boundary', () => {
    expect(classifyStatus(5, [5, 15], 20, 30)).toBe('normal')
  })
})

// ─── measurePulse ─────────────────────────────────────────────────────────────

describe('measurePulse', () => {
  it('measures normal pulse', () => {
    const v = measurePulse(14, 7)
    expect(v.name).toBe('Pulse')
    expect(v.value).toBe(14)
    expect(v.unit).toBe('bpm')
    expect(v.status).toBe('normal')
  })

  it('measures high pulse', () => {
    const v = measurePulse(100, 1)
    expect(v.status).toBe('critical')
  })

  it('measures low pulse', () => {
    const v = measurePulse(1, 14)
    expect(v.value).toBeLessThan(5)
  })

  it('handles zero days', () => {
    const v = measurePulse(10, 0)
    expect(v.value).toBeGreaterThan(0)
  })
})

// ─── measureBloodPressure ────────────────────────────────────────────────────

describe('measureBloodPressure', () => {
  it('measures low complexity', () => {
    const v = measureBloodPressure([{ content: CLEAN_CODE }])
    expect(v.name).toBe('Blood Pressure')
    expect(v.unit).toBe('mmHg')
    expect(v.status).toBe('normal')
  })

  it('measures high complexity', () => {
    const v = measureBloodPressure([{ content: COMPLEX_CODE }])
    expect(v.value).toBeGreaterThan(15)
  })

  it('handles empty files', () => {
    const v = measureBloodPressure([])
    expect(v.value).toBe(0)
  })
})

// ─── measureTemperature ───────────────────────────────────────────────────────

describe('measureTemperature', () => {
  it('measures clean code temperature', () => {
    const v = measureTemperature([{ content: CLEAN_CODE }])
    expect(v.name).toBe('Temperature')
    expect(v.unit).toBe('°C')
    expect(v.status).toBe('normal')
  })

  it('measures risky code temperature', () => {
    const v = measureTemperature([{ content: RISKY_CODE }])
    expect(v.value).toBeGreaterThan(30)
  })

  it('handles empty files', () => {
    const v = measureTemperature([])
    expect(v.value).toBe(0)
  })
})

// ─── measureRespiration ───────────────────────────────────────────────────────

describe('measureRespiration', () => {
  it('measures normal respiration', () => {
    const v = measureRespiration(15, 50)
    expect(v.name).toBe('Respiration')
    expect(v.value).toBe(30)
    expect(v.unit).toBe('%')
    expect(v.status).toBe('normal')
  })

  it('measures low respiration', () => {
    const v = measureRespiration(0, 100)
    expect(v.value).toBe(0)
    expect(v.status).toBe('critical')
  })

  it('handles zero commits', () => {
    const v = measureRespiration(0, 0)
    expect(v.value).toBe(0)
  })
})

// ─── measureOxygen ────────────────────────────────────────────────────────────

describe('measureOxygen', () => {
  it('measures good oxygen', () => {
    const v = measureOxygen(10, 12)
    expect(v.name).toBe('Oxygen')
    expect(v.value).toBe(1.2)
    expect(v.status).toBe('normal')
  })

  it('measures low oxygen', () => {
    const v = measureOxygen(20, 3)
    expect(v.value).toBeLessThan(0.5)
    expect(v.status).toBe('critical')
  })

  it('handles zero source files', () => {
    const v = measureOxygen(0, 5)
    expect(v.value).toBe(0)
  })
})

// ─── measureHeartRateVariability ───────────────────────────────────────────────

describe('measureHeartRateVariability', () => {
  it('measures consistent naming', () => {
    const v = measureHeartRateVariability([{ content: 'const myVar = 1\nconst anotherVar = 2\nconst thirdVar = 3' }])
    expect(v.name).toBe('Heart Rate Variability')
    expect(v.value).toBe(100)
    expect(v.status).toBe('normal')
  })

  it('measures inconsistent naming', () => {
    const v = measureHeartRateVariability([{ content: 'const myVar = 1\nconst another_var = 2\nconst ThirdVar = 3' }])
    expect(v.value).toBeLessThan(80)
  })

  it('handles empty content', () => {
    const v = measureHeartRateVariability([{ content: '' }])
    expect(v.value).toBe(100)
  })
})

// ─── measureWhiteBloodCellCount ───────────────────────────────────────────────

describe('measureWhiteBloodCellCount', () => {
  it('measures good error handling', () => {
    const v = measureWhiteBloodCellCount([{ content: ERROR_HANDLED_CODE }])
    expect(v.name).toBe('White Blood Cell Count')
    expect(v.value).toBeGreaterThanOrEqual(0.5)
  })

  it('measures poor error handling', () => {
    const v = measureWhiteBloodCellCount([{ content: 'function a() {}\nfunction b() {}\nfunction c() {}' }])
    expect(v.value).toBe(0)
    expect(v.status).toBe('critical')
  })

  it('handles empty files', () => {
    const v = measureWhiteBloodCellCount([{ content: '' }])
    expect(v.value).toBe(0)
  })
})

// ─── Helper Functions ─────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for flat code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('counts branches', () => {
    expect(computeComplexity('if (a) { for (let i = 0; i < 10; i++) {} }')).toBe(3)
  })
})

describe('countTodoMarkers', () => {
  it('counts TODOs', () => {
    expect(countTodoMarkers('// TODO: fix\n// FIXME: broken')).toBe(2)
  })

  it('returns 0 for clean code', () => {
    expect(countTodoMarkers('const x = 1')).toBe(0)
  })
})

describe('countExports', () => {
  it('counts exports', () => {
    expect(countExports('export function foo() {}\nexport const bar = 1')).toBe(2)
  })
})

describe('countFunctions', () => {
  it('counts function declarations', () => {
    expect(countFunctions('function foo() {}')).toBe(1)
  })

  it('counts arrow functions', () => {
    expect(countFunctions('const bar = () => {}')).toBe(1)
  })
})

describe('countCatchBlocks', () => {
  it('counts catch blocks', () => {
    expect(countCatchBlocks('try {} catch(e) {}\ntry {} catch(x) {}')).toBe(2)
  })
})

describe('isTestFile', () => {
  it('detects test files', () => {
    expect(isTestFile('foo.test.ts')).toBe(true)
    expect(isTestFile('bar.spec.js')).toBe(true)
  })

  it('rejects non-test files', () => {
    expect(isTestFile('foo.ts')).toBe(false)
    expect(isTestFile('test.ts')).toBe(false)
  })
})

// ─── Organ Examination ────────────────────────────────────────────────────────

describe('examineOrgan', () => {
  it('examines healthy organ', () => {
    const report = examineOrgan('src/core', [{ content: CLEAN_CODE, path: 'src/core/util.ts' }])
    expect(report.organ).toBe('src/core')
    expect(report.health).toBeGreaterThan(0)
    expect(report.prognosis).toBeDefined()
    expect(report.vitalSigns.length).toBe(4)
  })

  it('examines empty organ', () => {
    const report = examineOrgan('src/empty', [])
    expect(report.health).toBe(100)
    expect(report.prognosis).toBe('excellent')
  })

  it('diagnoses problems', () => {
    const report = examineOrgan('src/risky', [{ content: RISKY_CODE, path: 'src/risky/bad.ts' }])
    expect(report.diagnosis).toBeTruthy()
  })
})

describe('computeOrganHealth', () => {
  it('returns 100 for all normal', () => {
    const vitals: VitalSign[] = [
      { name: 'A', value: 1, unit: 'x', status: 'normal', range: [0, 10], description: '' },
      { name: 'B', value: 1, unit: 'x', status: 'normal', range: [0, 10], description: '' },
    ]
    expect(computeOrganHealth(vitals)).toBe(100)
  })

  it('returns 20 for all critical', () => {
    const vitals: VitalSign[] = [
      { name: 'A', value: 1, unit: 'x', status: 'critical', range: [0, 10], description: '' },
    ]
    expect(computeOrganHealth(vitals)).toBe(20)
  })

  it('returns 100 for empty', () => {
    expect(computeOrganHealth([])).toBe(100)
  })
})

describe('diagnoseOrgan', () => {
  it('diagnoses critical vitals', () => {
    const vitals: VitalSign[] = [
      { name: 'BP', value: 50, unit: 'x', status: 'critical', range: [0, 10], description: '' },
    ]
    expect(diagnoseOrgan(vitals)).toContain('Critical')
    expect(diagnoseOrgan(vitals)).toContain('BP')
  })

  it('diagnoses warnings', () => {
    const vitals: VitalSign[] = [
      { name: 'Temp', value: 35, unit: 'x', status: 'warning', range: [0, 30], description: '' },
    ]
    expect(diagnoseOrgan(vitals)).toContain('Warning')
  })

  it('diagnoses normal', () => {
    const vitals: VitalSign[] = [
      { name: 'X', value: 5, unit: 'x', status: 'normal', range: [0, 10], description: '' },
    ]
    expect(diagnoseOrgan(vitals)).toContain('normal')
  })
})

// ─── Prognosis & Triage ───────────────────────────────────────────────────────

describe('determinePrognosis', () => {
  it('returns excellent for high health', () => {
    expect(determinePrognosis(95)).toBe('excellent')
  })

  it('returns good for moderate health', () => {
    expect(determinePrognosis(75)).toBe('good')
  })

  it('returns fair for middling health', () => {
    expect(determinePrognosis(55)).toBe('fair')
  })

  it('returns poor for low health', () => {
    expect(determinePrognosis(35)).toBe('poor')
  })

  it('returns critical for very low health', () => {
    expect(determinePrognosis(15)).toBe('critical')
  })
})

describe('determineTriage', () => {
  it('returns emergency for criticals', () => {
    expect(determineTriage(1, 0)).toBe('emergency')
  })

  it('returns urgent for many warnings', () => {
    expect(determineTriage(0, 3)).toBe('urgent')
  })

  it('returns routine for healthy', () => {
    expect(determineTriage(0, 0)).toBe('routine')
  })

  it('returns routine for few warnings', () => {
    expect(determineTriage(0, 1)).toBe('routine')
  })
})

// ─── Symptom Diagnosis ────────────────────────────────────────────────────────

describe('diagnoseSymptoms', () => {
  it('detects TODO symptoms', () => {
    const symptoms = diagnoseSymptoms([{ content: '// TODO: fix this bug\nconst x = 1', path: 'a.ts' }])
    expect(symptoms.some((s) => s.vital === 'Temperature')).toBe(true)
    expect(symptoms.some((s) => s.symptom.includes('TODO'))).toBe(true)
  })

  it('detects high complexity symptoms', () => {
    const symptoms = diagnoseSymptoms([{ content: COMPLEX_CODE, path: 'b.ts' }])
    expect(symptoms.some((s) => s.vital === 'Blood Pressure')).toBe(true)
  })

  it('detects missing error handling', () => {
    const noError = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}\nfunction e() {}\nfunction f() {}'
    const symptoms = diagnoseSymptoms([{ content: noError, path: 'c.ts' }])
    expect(symptoms.some((s) => s.vital === 'White Blood Cell Count')).toBe(true)
  })

  it('detects large files', () => {
    const symptoms = diagnoseSymptoms([{ content: LARGE_FILE, path: 'd.ts' }])
    expect(symptoms.some((s) => s.vital === 'Blood Pressure')).toBe(true)
  })

  it('returns empty for healthy code', () => {
    const symptoms = diagnoseSymptoms([{ content: 'const x = 1', path: 'e.ts' }])
    expect(symptoms).toEqual([])
  })
})

// ─── Overall Health ───────────────────────────────────────────────────────────

describe('computeOverallHealth', () => {
  it('returns 100 for empty', () => {
    expect(computeOverallHealth([])).toBe(100)
  })

  it('weights blood pressure heavily', () => {
    const healthy: VitalSign[] = [
      { name: 'Pulse', value: 10, unit: 'bpm', status: 'normal', range: [5, 20], description: '' },
      { name: 'Blood Pressure', value: 40, unit: 'mmHg', status: 'critical', range: [5, 15], description: '' },
    ]
    const score = computeOverallHealth(healthy)
    expect(score).toBeLessThan(60)
  })

  it('returns high score for all normal', () => {
    const allNormal: VitalSign[] = [
      { name: 'Pulse', value: 10, unit: 'bpm', status: 'normal', range: [5, 20], description: '' },
      { name: 'Blood Pressure', value: 10, unit: 'mmHg', status: 'normal', range: [5, 15], description: '' },
    ]
    expect(computeOverallHealth(allNormal)).toBe(85)
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends for critical vitals', () => {
    const vitals: VitalSign[] = [
      { name: 'Pulse', value: 100, unit: 'bpm', status: 'critical', range: [5, 20], description: '' },
    ]
    const recs = generateRecommendations(vitals, [], [], { overallHealth: 20, criticalVitals: 1, warningVitals: 0, normalVitals: 0, excellentVitals: 0, patientAge: 100, lastCheckup: '', diagnosis: '', triageLevel: 'emergency' })
    expect(recs.some((r) => r.includes('CRITICAL'))).toBe(true)
  })

  it('recommends for warning vitals', () => {
    const vitals: VitalSign[] = [
      { name: 'Oxygen', value: 0.4, unit: 'ratio', status: 'warning', range: [0.8, 2.0], description: '' },
    ]
    const recs = generateRecommendations(vitals, [], [], { overallHealth: 50, criticalVitals: 0, warningVitals: 1, normalVitals: 0, excellentVitals: 0, patientAge: 100, lastCheckup: '', diagnosis: '', triageLevel: 'routine' })
    expect(recs.some((r) => r.includes('WARNING'))).toBe(true)
  })

  it('praises healthy codebase', () => {
    const recs = generateRecommendations([], [], [], { overallHealth: 90, criticalVitals: 0, warningVitals: 0, normalVitals: 7, excellentVitals: 0, patientAge: 100, lastCheckup: '', diagnosis: 'Healthy', triageLevel: 'routine' })
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })

  it('recommends for poor organs', () => {
    const organs: OrganReport[] = [{ organ: 'src/bad', health: 20, vitalSigns: [], diagnosis: 'bad', prognosis: 'poor' }]
    const recs = generateRecommendations([], organs, [], { overallHealth: 50, criticalVitals: 0, warningVitals: 0, normalVitals: 0, excellentVitals: 0, patientAge: 100, lastCheckup: '', diagnosis: '', triageLevel: 'routine' })
    expect(recs.some((r) => r.includes('src/bad'))).toBe(true)
  })

  it('recommends for severe symptoms', () => {
    const symptoms: Symptom[] = [{ file: 'a.ts', line: 1, vital: 'BP', severity: 'severe', symptom: 'high', treatment: 'Fix it' }]
    const recs = generateRecommendations([], [], symptoms, { overallHealth: 50, criticalVitals: 0, warningVitals: 0, normalVitals: 0, excellentVitals: 0, patientAge: 100, lastCheckup: '', diagnosis: '', triageLevel: 'routine' })
    expect(recs.some((r) => r.includes('Prescribe'))).toBe(true)
  })
})

// ─── buildVitalsResult ────────────────────────────────────────────────────────

describe('buildVitalsResult', () => {
  it('builds complete result', () => {
    const result = buildVitalsResult(['a.ts', 'b.test.ts'], [CLEAN_CODE, CLEAN_CODE], { maxDepth: 50 })
    expect(result.vitals.length).toBe(7)
    expect(result.stats.overallHealth).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildVitalsResult([], [], { maxDepth: 50 })
    expect(result.vitals.length).toBe(7)
    expect(result.organs).toEqual([])
    expect(result.symptoms).toEqual([])
  })

  it('groups organs by directory', () => {
    const result = buildVitalsResult(
      ['src/core/a.ts', 'src/core/b.ts', 'src/utils/c.ts'],
      [CLEAN_CODE, CLEAN_CODE, CLEAN_CODE],
      { maxDepth: 50 },
    )
    expect(result.organs.length).toBe(2)
  })

  it('generates recommendations', () => {
    const result = buildVitalsResult(['risky.ts'], [RISKY_CODE], { maxDepth: 50 })
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets triage level', () => {
    const result = buildVitalsResult(['risky.ts'], [RISKY_CODE], { maxDepth: 50 })
    expect(['routine', 'urgent', 'emergency']).toContain(result.stats.triageLevel)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatVitalSignsMonitor', () => {
  it('formats monitor display', () => {
    const vitals: VitalSign[] = [
      { name: 'Pulse', value: 10, unit: 'bpm', status: 'normal', range: [5, 20], description: '' },
    ]
    const output = formatVitalSignsMonitor(vitals)
    expect(output).toContain('VITAL SIGNS MONITOR')
    expect(output).toContain('Pulse')
  })

  it('handles empty', () => {
    expect(formatVitalSignsMonitor([])).toContain('No vital signs')
  })
})

describe('formatOrganHealthChart', () => {
  it('formats chart', () => {
    const organs: OrganReport[] = [{ organ: 'src/core', health: 85, vitalSigns: [], diagnosis: 'ok', prognosis: 'good' }]
    const output = formatOrganHealthChart(organs)
    expect(output).toContain('Organ Health Chart')
    expect(output).toContain('src/core')
  })

  it('handles empty', () => {
    expect(formatOrganHealthChart([])).toContain('No organs')
  })
})

describe('formatSymptomList', () => {
  it('formats symptoms', () => {
    const symptoms: Symptom[] = [{ file: 'a.ts', line: 5, vital: 'BP', severity: 'moderate', symptom: 'high', treatment: 'Fix' }]
    const output = formatSymptomList(symptoms)
    expect(output).toContain('Symptoms')
    expect(output).toContain('MODERATE')
    expect(output).toContain('Treatment')
  })

  it('handles empty', () => {
    expect(formatSymptomList([])).toContain('No symptoms')
  })
})

describe('formatOverallHealthMeter', () => {
  it('formats meter', () => {
    const output = formatOverallHealthMeter(85)
    expect(output).toContain('Overall Health')
    expect(output).toContain('85%')
  })
})

describe('formatVitalsStats', () => {
  it('formats stats', () => {
    const stats: VitalsStats = { overallHealth: 85, criticalVitals: 0, warningVitals: 1, normalVitals: 5, excellentVitals: 1, patientAge: 365, lastCheckup: '2024-01-01', diagnosis: 'Healthy', triageLevel: 'routine' }
    const output = formatVitalsStats(stats)
    expect(output).toContain('Medical Summary')
    expect(output).toContain('85%')
    expect(output).toContain('ROUTINE')
  })
})

describe('formatRecommendations', () => {
  it('formats recs', () => {
    expect(formatRecommendations(['Take vitals daily'])).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatVitalsTable', () => {
  it('formats full table', () => {
    const result = buildVitalsResult(['a.ts'], [CLEAN_CODE], { maxDepth: 50 })
    const output = formatVitalsTable(result)
    expect(output).toContain('VITAL SIGNS MONITOR')
    expect(output).toContain('Overall Health')
  })
})

describe('formatVitalsJSON', () => {
  it('formats valid JSON', () => {
    const result = buildVitalsResult(['a.ts'], [CLEAN_CODE], { maxDepth: 50 })
    const json = formatVitalsJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.vitals).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes realistic codebase', () => {
    const result = buildVitalsResult(
      ['src/clean.ts', 'src/risky.ts', 'src/safe.ts', 'tests/clean.test.ts'],
      [CLEAN_CODE, RISKY_CODE, ERROR_HANDLED_CODE, CLEAN_CODE],
      { maxDepth: 100 },
    )
    expect(result.vitals.length).toBe(7)
    expect(result.organs.length).toBeGreaterThanOrEqual(2)
    expect(result.symptoms.length).toBeGreaterThan(0)
    expect(result.stats.overallHealth).toBeGreaterThan(0)
    expect(result.stats.triageLevel).toBeDefined()
  })

  it('round-trips through JSON', () => {
    const result = buildVitalsResult(['a.ts'], [CLEAN_CODE], { maxDepth: 50 })
    const json = formatVitalsJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.overallHealth).toBe(result.stats.overallHealth)
    expect(parsed.vitals.length).toBe(result.vitals.length)
  })
})
