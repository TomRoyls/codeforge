import { describe, expect, it } from 'vitest'

import {
  buildHeartbeatResult,
  classifyVital,
  computeOverallHealth,
  generateDiagnosis,
  generatePrescriptions,
  measureBMI,
  measureBloodPressure,
  measureBloodSugar,
  measureCholesterol,
  measureHeartRateVariability,
  measurePulse,
  measureRespiration,
  measureTemperature,
  type VitalSign,
  type HeartbeatStats,
} from '../src/commands/heartbeat-helpers.js'

import {
  formatDiagnosis,
  formatHealthBadge,
  formatHeartbeatJSON,
  formatHeartbeatLine,
  formatHeartbeatTable,
  formatPrescriptions,
  formatStatsSummary,
  formatVitalRow,
  formatVitalStatus,
  formatVitalsTable,
} from '../src/commands/heartbeat-format-helpers.js'

// ─── classifyVital ────────────────────────────────────────────────────────────

describe('classifyVital', () => {
  it('classifies pulse normal', () => { expect(classifyVital('pulse', 10)).toBe('normal') })
  it('classifies pulse elevated', () => { expect(classifyVital('pulse', 25)).toBe('elevated') })
  it('classifies pulse high', () => { expect(classifyVital('pulse', 55)).toBe('high') })
  it('classifies pulse critical (zero)', () => { expect(classifyVital('pulse', 0)).toBe('critical') })

  it('classifies bloodPressure normal', () => { expect(classifyVital('bloodPressure', 5)).toBe('normal') })
  it('classifies bloodPressure elevated', () => { expect(classifyVital('bloodPressure', 15)).toBe('elevated') })
  it('classifies bloodPressure high', () => { expect(classifyVital('bloodPressure', 25)).toBe('high') })
  it('classifies bloodPressure critical', () => { expect(classifyVital('bloodPressure', 35)).toBe('critical') })

  it('classifies temperature normal', () => { expect(classifyVital('temperature', 0)).toBe('normal') })
  it('classifies temperature elevated', () => { expect(classifyVital('temperature', 3)).toBe('elevated') })
  it('classifies temperature high', () => { expect(classifyVital('temperature', 10)).toBe('high') })
  it('classifies temperature critical', () => { expect(classifyVital('temperature', 20)).toBe('critical') })

  it('classifies respiration normal', () => { expect(classifyVital('respiration', 90)).toBe('normal') })
  it('classifies respiration elevated', () => { expect(classifyVital('respiration', 70)).toBe('elevated') })
  it('classifies respiration high', () => { expect(classifyVital('respiration', 50)).toBe('high') })
  it('classifies respiration critical', () => { expect(classifyVital('respiration', 30)).toBe('critical') })

  it('classifies cholesterol normal', () => { expect(classifyVital('cholesterol', 5)).toBe('normal') })
  it('classifies cholesterol elevated', () => { expect(classifyVital('cholesterol', 15)).toBe('elevated') })
  it('classifies cholesterol high', () => { expect(classifyVital('cholesterol', 40)).toBe('high') })
  it('classifies cholesterol critical', () => { expect(classifyVital('cholesterol', 70)).toBe('critical') })

  it('classifies bmi normal', () => { expect(classifyVital('bmi', 100)).toBe('normal') })
  it('classifies bmi elevated', () => { expect(classifyVital('bmi', 300)).toBe('elevated') })
  it('classifies bmi high', () => { expect(classifyVital('bmi', 600)).toBe('high') })
  it('classifies bmi critical', () => { expect(classifyVital('bmi', 900)).toBe('critical') })

  it('classifies bloodSugar normal', () => { expect(classifyVital('bloodSugar', 20)).toBe('normal') })
  it('classifies bloodSugar elevated', () => { expect(classifyVital('bloodSugar', 75)).toBe('elevated') })
  it('classifies bloodSugar high', () => { expect(classifyVital('bloodSugar', 150)).toBe('high') })
  it('classifies bloodSugar critical', () => { expect(classifyVital('bloodSugar', 250)).toBe('critical') })

  it('classifies heartRateVariability normal', () => { expect(classifyVital('heartRateVariability', 5)).toBe('normal') })
  it('classifies heartRateVariability elevated', () => { expect(classifyVital('heartRateVariability', 15)).toBe('elevated') })
  it('classifies heartRateVariability high', () => { expect(classifyVital('heartRateVariability', 25)).toBe('high') })
  it('classifies heartRateVariability critical', () => { expect(classifyVital('heartRateVariability', 40)).toBe('critical') })

  it('returns normal for unknown vital', () => { expect(classifyVital('unknown', 50)).toBe('normal') })
})

// ─── measurePulse ─────────────────────────────────────────────────────────────

describe('measurePulse', () => {
  it('returns pulse vital', () => {
    const v = measurePulse(['a.ts'], ['code'])
    expect(v.name).toBe('Pulse')
    expect(v.unit).toBe('bpm')
    expect(v.icon).toBe('💓')
  })

  it('is critical for empty project', () => {
    const v = measurePulse([], [])
    expect(v.status).toBe('critical')
  })

  it('is normal for moderate files', () => {
    const files = Array.from({ length: 5 }, (_, i) => `f${i}.ts`)
    const contents = files.map(() => 'code')
    const v = measurePulse(files, contents)
    expect(v.status).toBe('normal')
  })
})

// ─── measureBloodPressure ─────────────────────────────────────────────────────

describe('measureBloodPressure', () => {
  it('returns blood pressure vital', () => {
    const v = measureBloodPressure(['a.ts'], ['function x() {}'])
    expect(v.name).toBe('Blood Pressure')
    expect(v.icon).toBe('🩺')
  })

  it('is normal for flat code', () => {
    const v = measureBloodPressure(['a.ts'], ['const x = 1'])
    expect(v.status).toBe('normal')
  })

  it('is elevated for nested code', () => {
    const nested = 'function f() { if(a) { if(b) { if(c) { if(d) { if(e) { if(f) { if(g) { if(h) { if(i) { if(j) { if(k) { } } } } } } } } } } } }'
    const v = measureBloodPressure(['a.ts'], [nested])
    expect(v.status).not.toBe('normal')
  })

  it('shows max/avg in unit', () => {
    const v = measureBloodPressure(['a.ts'], ['{ { } }'])
    expect(v.unit).toContain('/')
  })
})

// ─── measureTemperature ───────────────────────────────────────────────────────

describe('measureTemperature', () => {
  it('returns temperature vital', () => {
    const v = measureTemperature(['a.ts'], ['clean code'])
    expect(v.name).toBe('Temperature')
    expect(v.icon).toBe('🌡️')
  })

  it('is normal for clean code', () => {
    const v = measureTemperature(['a.ts'], ['const x = 1'])
    expect(v.status).toBe('normal')
  })

  it('is elevated for a few issues', () => {
    const v = measureTemperature(['a.ts'], ['// FIXME: broken\n// TODO: fix'])
    expect(v.value).toBeGreaterThanOrEqual(2)
  })

  it('penalizes eval', () => {
    const v = measureTemperature(['a.ts'], ['eval("code")'])
    expect(v.value).toBeGreaterThan(0)
  })
})

// ─── measureRespiration ───────────────────────────────────────────────────────

describe('measureRespiration', () => {
  it('returns respiration vital', () => {
    const v = measureRespiration(['a.ts'], ['code'])
    expect(v.name).toBe('Respiration')
    expect(v.icon).toBe('🫁')
  })

  it('is critical with no tests', () => {
    const v = measureRespiration(['a.ts'], ['export function x() {}'])
    expect(v.status).toBe('critical')
  })

  it('improves with tests', () => {
    const v = measureRespiration(
      ['a.ts', 'a.test.ts'],
      ['export function x() {}', "import { x } from './a'; test('x', () => {})"],
    )
    expect(v.value).toBeGreaterThan(0)
  })
})

// ─── measureCholesterol ───────────────────────────────────────────────────────

describe('measureCholesterol', () => {
  it('returns cholesterol vital', () => {
    const v = measureCholesterol(['a.ts'], ['clean'])
    expect(v.name).toBe('Cholesterol')
    expect(v.icon).toBe('🧪')
  })

  it('is normal for clean code', () => {
    const v = measureCholesterol(['a.ts'], ['const x = 1'])
    expect(v.status).toBe('normal')
  })

  it('counts TODO items', () => {
    const v = measureCholesterol(['a.ts'], ['// TODO: a\n// FIXME: b\n// HACK: c'])
    expect(v.value).toBe(3)
  })

  it('is elevated for moderate debt', () => {
    const content = Array.from({ length: 12 }, (_, i) => `// TODO: item ${i}`).join('\n')
    const v = measureCholesterol(['a.ts'], [content])
    expect(v.status).toBe('elevated')
  })
})

// ─── measureBMI ───────────────────────────────────────────────────────────────

describe('measureBMI', () => {
  it('returns BMI vital', () => {
    const v = measureBMI(['a.ts'], ['code'])
    expect(v.name).toBe('BMI')
    expect(v.icon).toBe('⚖️')
  })

  it('is normal for small files', () => {
    const v = measureBMI(['a.ts'], ['line1\nline2\nline3'])
    expect(v.status).toBe('normal')
  })

  it('is elevated for larger files', () => {
    const content = Array.from({ length: 300 }, (_, i) => `line ${i}`).join('\n')
    const v = measureBMI(['a.ts'], [content])
    expect(v.status).toBe('elevated')
  })

  it('computes average across files', () => {
    const v = measureBMI(['a.ts', 'b.ts'], ['line1\nline2', 'line1'])
    expect(v.value).toBe(2)
  })
})

// ─── measureBloodSugar ────────────────────────────────────────────────────────

describe('measureBloodSugar', () => {
  it('returns blood sugar vital', () => {
    const v = measureBloodSugar(['a.ts'], ['code'])
    expect(v.name).toBe('Blood Sugar')
    expect(v.icon).toBe('💉')
  })

  it('is normal for few deps', () => {
    const v = measureBloodSugar(['a.ts'], ["import chalk from 'chalk'"])
    expect(v.value).toBe(1)
    expect(v.status).toBe('normal')
  })

  it('counts unique external deps', () => {
    const v = measureBloodSugar(['a.ts'], ["import a from 'chalk'\nimport b from 'ora'\nimport c from 'react'"])
    expect(v.value).toBe(3)
  })

  it('ignores relative imports', () => {
    const v = measureBloodSugar(['a.ts'], ["import { x } from './utils'"])
    expect(v.value).toBe(0)
  })
})

// ─── measureHeartRateVariability ───────────────────────────────────────────────

describe('measureHeartRateVariability', () => {
  it('returns HRV vital', () => {
    const v = measureHeartRateVariability(['a.ts'], ['code'])
    expect(v.name).toBe('Heart Rate Variability')
    expect(v.icon).toBe('📈')
  })

  it('is low for consistent naming', () => {
    const v = measureHeartRateVariability(['a.ts'], ['function camelCase() { const myVar = 1 }'])
    expect(v.value).toBeLessThanOrEqual(100)
  })

  it('is higher for mixed styles', () => {
    const v = measureHeartRateVariability(['a.ts'], ['function camelCase() { const snake_case = PascalCase }'])
    expect(v.value).toBeGreaterThan(0)
  })
})

// ─── computeOverallHealth ─────────────────────────────────────────────────────

describe('computeOverallHealth', () => {
  const makeVital = (status: string): VitalSign => ({
    name: 'test', value: 50, unit: 'x', status: status as VitalSign['status'],
    description: '', icon: '📋', advice: '',
  })

  it('returns excellent for all normal', () => {
    const { health, score } = computeOverallHealth([makeVital('normal'), makeVital('normal')])
    expect(health).toBe('excellent')
    expect(score).toBe(100)
  })

  it('returns good for mostly normal', () => {
    const { health } = computeOverallHealth([makeVital('normal'), makeVital('elevated'), makeVital('elevated')])
    expect(health).toBe('good')
  })

  it('returns fair for mixed', () => {
    const { health } = computeOverallHealth([makeVital('elevated'), makeVital('high')])
    expect(health).toBe('fair')
  })

  it('returns poor for mostly high', () => {
    const { health } = computeOverallHealth([makeVital('high'), makeVital('high'), makeVital('high')])
    expect(health).toBe('poor')
  })

  it('returns critical for all critical', () => {
    const { health, score } = computeOverallHealth([makeVital('critical'), makeVital('critical')])
    expect(health).toBe('critical')
    expect(score).toBe(10)
  })

  it('handles empty vitals', () => {
    const { health, score } = computeOverallHealth([])
    expect(health).toBe('fair')
    expect(score).toBe(50)
  })
})

// ─── generateDiagnosis ────────────────────────────────────────────────────────

describe('generateDiagnosis', () => {
  it('praises excellent health', () => {
    const d = generateDiagnosis('excellent', [])
    expect(d).toContain('excellent')
  })

  it('notes good health', () => {
    const d = generateDiagnosis('good', [])
    expect(d).toContain('good')
  })

  it('notes fair health', () => {
    const d = generateDiagnosis('fair', [])
    expect(d).toContain('fair')
  })

  it('warns poor health', () => {
    const d = generateDiagnosis('poor', [])
    expect(d).toContain('poor')
  })

  it('alarms critical health', () => {
    const d = generateDiagnosis('critical', [])
    expect(d).toContain('critical')
  })

  it('mentions critical vitals', () => {
    const vitals: VitalSign[] = [{
      name: 'Pulse', value: 0, unit: 'bpm', status: 'critical',
      description: '', icon: '', advice: '',
    }]
    const d = generateDiagnosis('poor', vitals)
    expect(d).toContain('1')
  })
})

// ─── generatePrescriptions ────────────────────────────────────────────────────

describe('generatePrescriptions', () => {
  const makeVital = (status: string, name = 'Test'): VitalSign => ({
    name, value: 50, unit: 'x', status: status as VitalSign['status'],
    description: '', icon: '📋', advice: 'fix it',
  })

  it('prescribes for critical vitals', () => {
    const p = generatePrescriptions([makeVital('critical', 'Pulse')])
    expect(p.some((x) => x.includes('Pulse'))).toBe(true)
  })

  it('prescribes for high vitals', () => {
    const p = generatePrescriptions([makeVital('high', 'BMI')])
    expect(p.some((x) => x.includes('BMI'))).toBe(true)
  })

  it('says all normal when healthy', () => {
    const p = generatePrescriptions([makeVital('normal')])
    expect(p.some((x) => x.includes('normal'))).toBe(true)
  })

  it('skips normal and elevated vitals', () => {
    const p = generatePrescriptions([makeVital('normal'), makeVital('elevated')])
    expect(p.some((x) => x.includes('normal'))).toBe(true)
  })
})

// ─── buildHeartbeatResult ─────────────────────────────────────────────────────

describe('buildHeartbeatResult', () => {
  it('builds result with 8 vitals', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    expect(result.vitals).toHaveLength(8)
  })

  it('sets overall health', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(result.overallHealth)
  })

  it('sets health score', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    expect(result.healthScore).toBeGreaterThanOrEqual(0)
    expect(result.healthScore).toBeLessThanOrEqual(100)
  })

  it('generates diagnosis', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    expect(result.diagnosis).toBeTruthy()
  })

  it('generates prescriptions', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    expect(result.prescriptions.length).toBeGreaterThan(0)
  })

  it('computes stats', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    expect(result.stats.totalVitals).toBe(8)
    expect(result.stats.normalCount + result.stats.elevatedCount + result.stats.highCount + result.stats.criticalCount).toBe(8)
  })

  it('each vital has required fields', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    for (const v of result.vitals) {
      expect(v.name).toBeTruthy()
      expect(v.unit).toBeTruthy()
      expect(v.icon).toBeTruthy()
      expect(v.description).toBeTruthy()
      expect(v.advice).toBeTruthy()
      expect(['normal', 'elevated', 'high', 'critical']).toContain(v.status)
    }
  })

  it('handles empty input', () => {
    const result = buildHeartbeatResult([], [])
    expect(result.vitals).toHaveLength(8)
  })
})

// ─── formatVitalStatus ────────────────────────────────────────────────────────

describe('formatVitalStatus', () => {
  it('formats normal', () => { expect(formatVitalStatus('normal')).toContain('NORMAL') })
  it('formats critical', () => { expect(formatVitalStatus('critical')).toContain('CRITICAL') })
  it('formats elevated', () => { expect(formatVitalStatus('elevated')).toContain('ELEVATED') })
  it('formats high', () => { expect(formatVitalStatus('high')).toContain('HIGH') })
})

// ─── formatHealthBadge ────────────────────────────────────────────────────────

describe('formatHealthBadge', () => {
  it('formats excellent', () => { expect(formatHealthBadge('excellent')).toContain('EXCELLENT') })
  it('formats critical', () => { expect(formatHealthBadge('critical')).toContain('CRITICAL') })
})

// ─── formatHeartbeatLine ──────────────────────────────────────────────────────

describe('formatHeartbeatLine', () => {
  it('renders heartbeat line', () => {
    const line = formatHeartbeatLine(75)
    expect(line).toContain('♥')
    expect(line).toContain('─')
  })

  it('renders for score 100', () => {
    const line = formatHeartbeatLine(100)
    expect(line).toContain('♥')
  })

  it('renders for score 0', () => {
    const line = formatHeartbeatLine(0)
    expect(line).toContain('♥')
  })
})

// ─── formatVitalRow ───────────────────────────────────────────────────────────

describe('formatVitalRow', () => {
  it('formats vital row', () => {
    const vital: VitalSign = {
      name: 'Pulse', value: 72, unit: 'bpm', status: 'normal',
      description: '', icon: '💓', advice: '',
    }
    const row = formatVitalRow(vital)
    expect(row).toContain('Pulse')
    expect(row).toContain('72')
    expect(row).toContain('NORMAL')
  })
})

// ─── formatVitalsTable ────────────────────────────────────────────────────────

describe('formatVitalsTable', () => {
  it('formats vitals table', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    const table = formatVitalsTable(result.vitals)
    expect(table).toContain('Vital Signs')
    expect(table).toContain('Pulse')
  })
})

// ─── formatStatsSummary ───────────────────────────────────────────────────────

describe('formatStatsSummary', () => {
  it('formats stats', () => {
    const stats: HeartbeatStats = {
      totalVitals: 8, normalCount: 5, elevatedCount: 2, highCount: 1, criticalCount: 0,
    }
    const summary = formatStatsSummary(stats)
    expect(summary).toContain('8')
    expect(summary).toContain('5')
  })
})

// ─── formatPrescriptions ──────────────────────────────────────────────────────

describe('formatPrescriptions', () => {
  it('formats prescriptions', () => {
    const p = formatPrescriptions(['Fix tests', 'Reduce complexity'])
    expect(p).toContain('Fix tests')
    expect(p).toContain('Reduce complexity')
  })

  it('shows message for empty', () => {
    expect(formatPrescriptions([])).toContain('No prescriptions')
  })
})

// ─── formatDiagnosis ──────────────────────────────────────────────────────────

describe('formatDiagnosis', () => {
  it('formats diagnosis', () => {
    const d = formatDiagnosis('Patient is healthy')
    expect(d).toContain('healthy')
    expect(d).toContain('Diagnosis')
  })
})

// ─── formatHeartbeatTable ─────────────────────────────────────────────────────

describe('formatHeartbeatTable', () => {
  it('formats full table', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    const table = formatHeartbeatTable(result)
    expect(table).toContain('Vital Signs')
    expect(table).toContain('Diagnosis')
    expect(table).toContain('Prescriptions')
    expect(table).toContain('♥')
  })
})

// ─── formatHeartbeatJSON ──────────────────────────────────────────────────────

describe('formatHeartbeatJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildHeartbeatResult(['a.ts'], ['const x = 1'])
    const json = formatHeartbeatJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.vitals).toHaveLength(8)
    expect(parsed.overallHealth).toBeTruthy()
    expect(parsed.healthScore).toBeGreaterThanOrEqual(0)
    expect(parsed.diagnosis).toBeTruthy()
    expect(parsed.prescriptions).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
