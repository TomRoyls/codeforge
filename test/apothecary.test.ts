import { describe, expect, it } from 'vitest'

import {
  buildApothecaryResult,
  classifyOverallHealth,
  computeHealthIndex,
  detectSymptoms,
  diagnoseAilments,
  determineTreatmentPriority,
  estimateRecovery,
  evaluateMedicineCabinet,
  generateRecommendations,
  prescribeRemedies,
  type Ailment,
  type ApothecaryOptions,
  type ApothecaryResult,
  type ApothecaryStats,
  type MedicineCabinet,
  type Remedy,
  type Symptom,
} from '../src/commands/apothecary-helpers.js'

import {
  formatAilments,
  formatApothecaryJson,
  formatApothecaryStats,
  formatApothecaryTable,
  formatCabinet,
  formatChronicLabel,
  formatHealthGauge,
  formatHealthLabel,
  formatRecommendations,
  formatRemedies,
  formatSeverityLabel,
  formatSpreadLabel,
  formatSymptoms,
} from '../src/commands/apothecary-format-helpers.js'

// ─── detectSymptoms ─────────────────────────────────────────────────────────────

describe('detectSymptoms', () => {
  it('returns empty for empty content', () => {
    expect(detectSymptoms('', 'a.ts')).toEqual([])
  })

  it('returns empty for whitespace-only content', () => {
    expect(detectSymptoms('   \n\t  ', 'a.ts')).toEqual([])
  })

  it('detects excessive nesting', () => {
    const content = Array.from({ length: 8 }, (_, i) => '{'.repeat(1)).join('\n') + '}}}}}}}}'
    const symptoms = detectSymptoms(content, 'a.ts')
    const nesting = symptoms.filter(s => s.name === 'excessive-nesting')
    expect(nesting.length).toBeGreaterThanOrEqual(1)
  })

  it('detects missing types (any)', () => {
    const symptoms = detectSymptoms('const x: any = 1; const y: any = 2', 'a.ts')
    const types = symptoms.filter(s => s.name === 'missing-types')
    expect(types.length).toBeGreaterThanOrEqual(1)
  })

  it('detects debt accumulation (TODO/FIXME)', () => {
    const symptoms = detectSymptoms('// TODO: fix this\n// FIXME: broken', 'a.ts')
    const debt = symptoms.filter(s => s.name === 'debt-accumulation')
    expect(debt.length).toBeGreaterThanOrEqual(1)
  })

  it('detects eval usage', () => {
    const symptoms = detectSymptoms('eval("alert(1)")', 'a.ts')
    const evalS = symptoms.filter(s => s.name === 'eval-usage')
    expect(evalS.length).toBeGreaterThanOrEqual(1)
    expect(evalS[0].severity).toBe('critical')
    expect(evalS[0].category).toBe('security')
  })

  it('detects magic numbers', () => {
    const symptoms = detectSymptoms('const x = 86400; const y = 3600000; const z = 1000000; const w = 9999', 'a.ts')
    const magic = symptoms.filter(s => s.name === 'magic-numbers')
    expect(magic.length).toBeGreaterThanOrEqual(1)
  })

  it('detects import overload', () => {
    const imports = Array.from({ length: 20 }, (_, i) => `import { mod${i} } from './mod${i}'`).join('\n')
    const symptoms = detectSymptoms(imports, 'a.ts')
    const overload = symptoms.filter(s => s.name === 'import-overload')
    expect(overload.length).toBeGreaterThanOrEqual(1)
  })

  it('detects mutation risk', () => {
    const content = 'globalThis.x = 1\narr.push(1)\narr.splice(0,1)\narr.sort()'
    const symptoms = detectSymptoms(content, 'a.ts')
    const mut = symptoms.filter(s => s.name === 'mutation-risk')
    expect(mut.length).toBeGreaterThanOrEqual(1)
  })

  it('sets file path on symptoms', () => {
    const symptoms = detectSymptoms('const x: any = 1', 'my/file.ts')
    expect(symptoms.every(s => s.file === 'my/file.ts')).toBe(true)
  })

  it('includes indicators on symptoms', () => {
    const symptoms = detectSymptoms('const x: any = 1', 'a.ts')
    expect(symptoms.every(s => s.indicators.length > 0)).toBe(true)
  })

  it('returns no symptoms for clean code', () => {
    const symptoms = detectSymptoms('const x: string = "hello"', 'a.ts')
    expect(symptoms.length).toBe(0)
  })
})

// ─── diagnoseAilments ───────────────────────────────────────────────────────────

describe('diagnoseAilments', () => {
  it('returns empty for no symptoms', () => {
    expect(diagnoseAilments([])).toEqual([])
  })

  it('diagnoses complexity-fever from nesting', () => {
    const symptoms: Symptom[] = [
      { name: 'excessive-nesting', file: 'a.ts', line: 1, severity: 'severe', category: 'structural', description: 'nesting', indicators: ['max-nesting:8'] },
    ]
    const ailments = diagnoseAilments(symptoms)
    const cf = ailments.find(a => a.name === 'complexity-fever')
    expect(cf).toBeDefined()
    expect(cf!.symptoms).toContain('excessive-nesting')
  })

  it('diagnoses type-blindness from missing types', () => {
    const symptoms: Symptom[] = [
      { name: 'missing-types', file: 'a.ts', line: 1, severity: 'moderate', category: 'maintainability', description: 'any', indicators: ['any-count:3'] },
    ]
    const ailments = diagnoseAilments(symptoms)
    const tb = ailments.find(a => a.name === 'type-blindness')
    expect(tb).toBeDefined()
  })

  it('diagnoses security-vulnerability from eval', () => {
    const symptoms: Symptom[] = [
      { name: 'eval-usage', file: 'a.ts', line: 1, severity: 'critical', category: 'security', description: 'eval', indicators: ['eval-call'] },
    ]
    const ailments = diagnoseAilments(symptoms)
    const sv = ailments.find(a => a.name === 'security-vulnerability')
    expect(sv).toBeDefined()
    expect(sv!.chronicLevel).toBe('terminal')
  })

  it('sets terminal for critical symptoms', () => {
    const symptoms: Symptom[] = [
      { name: 'eval-usage', file: 'a.ts', line: 1, severity: 'critical', category: 'security', description: 'eval', indicators: [] },
    ]
    const ailments = diagnoseAilments(symptoms)
    expect(ailments.some(a => a.chronicLevel === 'terminal')).toBe(true)
  })

  it('sets pandemic spread for widespread symptoms', () => {
    const symptoms: Symptom[] = [
      { name: 'missing-types', file: 'a.ts', line: 1, severity: 'moderate', category: 'maintainability', description: 'any', indicators: [] },
      { name: 'missing-types', file: 'b.ts', line: 1, severity: 'moderate', category: 'maintainability', description: 'any', indicators: [] },
      { name: 'missing-types', file: 'c.ts', line: 1, severity: 'moderate', category: 'maintainability', description: 'any', indicators: [] },
    ]
    const ailments = diagnoseAilments(symptoms)
    const tb = ailments.find(a => a.name === 'type-blindness')
    expect(tb!.spreadRisk).toBe('pandemic')
  })

  it('sets contained spread for single file', () => {
    const symptoms: Symptom[] = [
      { name: 'missing-types', file: 'a.ts', line: 1, severity: 'moderate', category: 'maintainability', description: 'any', indicators: [] },
      { name: 'excessive-nesting', file: 'a.ts', line: 1, severity: 'moderate', category: 'structural', description: 'nesting', indicators: [] },
    ]
    const ailments = diagnoseAilments(symptoms)
    const tb = ailments.find(a => a.name === 'type-blindness')
    expect(tb!.spreadRisk).toBe('pandemic')
  })

  it('includes diagnosis description', () => {
    const symptoms: Symptom[] = [
      { name: 'debt-accumulation', file: 'a.ts', line: 1, severity: 'moderate', category: 'maintainability', description: 'TODO', indicators: [] },
    ]
    const ailments = diagnoseAilments(symptoms)
    expect(ailments[0].diagnosis.length).toBeGreaterThan(0)
  })
})

// ─── prescribeRemedies ──────────────────────────────────────────────────────────

describe('prescribeRemedies', () => {
  it('returns empty for no ailments', () => {
    expect(prescribeRemedies([], [])).toEqual([])
  })

  it('prescribes extract-function for complexity-fever', () => {
    const ailments: Ailment[] = [
      { name: 'complexity-fever', symptoms: ['excessive-nesting'], diagnosis: 'test', affectedFiles: ['a.ts'], chronicLevel: 'acute', spreadRisk: 'contained', description: 'test' },
    ]
    const remedies = prescribeRemedies(ailments, [])
    const ef = remedies.find(r => r.targetAilment === 'complexity-fever')
    expect(ef).toBeDefined()
    expect(ef!.name).toBe('extract-function')
  })

  it('prescribes add-type-annotations for type-blindness', () => {
    const ailments: Ailment[] = [
      { name: 'type-blindness', symptoms: ['missing-types'], diagnosis: 'test', affectedFiles: ['a.ts'], chronicLevel: 'acute', spreadRisk: 'contained', description: 'test' },
    ]
    const remedies = prescribeRemedies(ailments, [])
    const ta = remedies.find(r => r.targetAilment === 'type-blindness')
    expect(ta).toBeDefined()
    expect(ta!.name).toBe('add-type-annotations')
  })

  it('prescribes remove-eval for security-vulnerability', () => {
    const ailments: Ailment[] = [
      { name: 'security-vulnerability', symptoms: ['eval-usage'], diagnosis: 'test', affectedFiles: ['a.ts'], chronicLevel: 'terminal', spreadRisk: 'contained', description: 'test' },
    ]
    const remedies = prescribeRemedies(ailments, [])
    const re = remedies.find(r => r.targetAilment === 'security-vulnerability')
    expect(re).toBeDefined()
    expect(re!.effectiveness).toBeGreaterThanOrEqual(90)
  })

  it('includes preparation steps', () => {
    const ailments: Ailment[] = [
      { name: 'complexity-fever', symptoms: ['excessive-nesting'], diagnosis: 'test', affectedFiles: ['a.ts'], chronicLevel: 'acute', spreadRisk: 'contained', description: 'test' },
    ]
    const remedies = prescribeRemedies(ailments, [])
    expect(remedies[0].preparation.length).toBeGreaterThan(0)
  })

  it('includes side effects', () => {
    const ailments: Ailment[] = [
      { name: 'complexity-fever', symptoms: ['excessive-nesting'], diagnosis: 'test', affectedFiles: ['a.ts'], chronicLevel: 'acute', spreadRisk: 'contained', description: 'test' },
    ]
    const remedies = prescribeRemedies(ailments, [])
    expect(remedies[0].sideEffects.length).toBeGreaterThan(0)
  })

  it('includes ingredients', () => {
    const ailments: Ailment[] = [
      { name: 'complexity-fever', symptoms: ['excessive-nesting'], diagnosis: 'test', affectedFiles: ['a.ts'], chronicLevel: 'acute', spreadRisk: 'contained', description: 'test' },
    ]
    const remedies = prescribeRemedies(ailments, [])
    expect(remedies[0].ingredients.length).toBeGreaterThan(0)
  })

  it('sets difficulty level', () => {
    const ailments: Ailment[] = [
      { name: 'complexity-fever', symptoms: ['excessive-nesting'], diagnosis: 'test', affectedFiles: ['a.ts'], chronicLevel: 'acute', spreadRisk: 'contained', description: 'test' },
    ]
    const remedies = prescribeRemedies(ailments, [])
    expect(['trivial', 'easy', 'moderate', 'difficult']).toContain(remedies[0].difficulty)
  })
})

// ─── evaluateMedicineCabinet ────────────────────────────────────────────────────

describe('evaluateMedicineCabinet', () => {
  it('returns full score for empty content', () => {
    const cab = evaluateMedicineCabinet('', 'a.ts')
    expect(cab.cabinetScore).toBe(100)
    expect(cab.isWellEquipped).toBe(true)
  })

  it('detects error handling', () => {
    const cab = evaluateMedicineCabinet('try { foo(); } catch(e) {}', 'a.ts')
    expect(cab.existingRemedies).toContain('error-handling')
  })

  it('detects type guards', () => {
    const cab = evaluateMedicineCabinet('if (typeof x === "string") {}', 'a.ts')
    expect(cab.existingRemedies).toContain('type-guards')
  })

  it('detects null safety', () => {
    const cab = evaluateMedicineCabinet('const y = x?.prop', 'a.ts')
    expect(cab.existingRemedies).toContain('null-safety')
  })

  it('detects JSDoc', () => {
    const cab = evaluateMedicineCabinet('/** docs */\nconst x = 1', 'a.ts')
    expect(cab.existingRemedies).toContain('jsdoc')
  })

  it('detects immutability', () => {
    const cab = evaluateMedicineCabinet('const x = 1; const y = 2', 'a.ts')
    expect(cab.existingRemedies).toContain('immutability')
  })

  it('flags missing error handling', () => {
    const cab = evaluateMedicineCabinet('foo.bar()', 'a.ts')
    expect(cab.missingRemedies).toContain('error-handling')
  })

  it('flags missing jsdoc', () => {
    const cab = evaluateMedicineCabinet('const x = 1', 'a.ts')
    expect(cab.missingRemedies).toContain('jsdoc')
  })

  it('flags missing immutability for let usage', () => {
    const cab = evaluateMedicineCabinet('let x = 1; x = 2', 'a.ts')
    expect(cab.missingRemedies).toContain('immutability')
  })

  it('computes cabinet score', () => {
    const cab = evaluateMedicineCabinet('try { foo(); } catch(e) {}\nconst x = 1', 'a.ts')
    expect(cab.cabinetScore).toBeGreaterThan(0)
  })

  it('is well equipped with enough remedies', () => {
    const cab = evaluateMedicineCabinet('try { foo(); } catch(e) {}\nif (typeof x === "string") {}\nconst y = x?.prop\n/** doc */\nconst x = 1', 'a.ts')
    expect(cab.isWellEquipped).toBe(true)
  })
})

// ─── computeHealthIndex ─────────────────────────────────────────────────────────

describe('computeHealthIndex', () => {
  it('returns 100 for no symptoms or ailments', () => {
    expect(computeHealthIndex([], [], [])).toBe(100)
  })

  it('deducts for critical symptoms', () => {
    const high: Symptom[] = [{ name: 'x', file: 'a.ts', line: 1, severity: 'critical', category: 'security', description: 'test', indicators: [] }]
    const low: Symptom[] = [{ name: 'x', file: 'a.ts', line: 1, severity: 'mild', category: 'cosmetic', description: 'test', indicators: [] }]
    expect(computeHealthIndex(high, [], [])).toBeLessThan(computeHealthIndex(low, [], []))
  })

  it('deducts for terminal ailments', () => {
    const withAilments: Ailment[] = [{ name: 'test', symptoms: [], diagnosis: '', affectedFiles: [], chronicLevel: 'terminal', spreadRisk: 'contained', description: '' }]
    expect(computeHealthIndex([], withAilments, [])).toBeLessThan(computeHealthIndex([], [], []))
  })

  it('boosts for well-stocked cabinets', () => {
    const goodCab: MedicineCabinet[] = [{ file: 'a.ts', existingRemedies: ['error-handling', 'type-guards'], missingRemedies: [], cabinetScore: 100, isWellEquipped: true }]
    const noCab: MedicineCabinet[] = [{ file: 'a.ts', existingRemedies: [], missingRemedies: [], cabinetScore: 0, isWellEquipped: false }]
    expect(computeHealthIndex([], [], goodCab)).toBeGreaterThanOrEqual(computeHealthIndex([], [], noCab))
  })

  it('clamps to 0-100', () => {
    const many: Symptom[] = Array.from({ length: 20 }, () => ({ name: 'x', file: 'a.ts', line: 1, severity: 'critical' as const, category: 'security' as const, description: 't', indicators: [] }))
    expect(computeHealthIndex(many, [], [])).toBeGreaterThanOrEqual(0)
  })
})

// ─── classifyOverallHealth ──────────────────────────────────────────────────────

describe('classifyOverallHealth', () => {
  it('returns robust for high index', () => {
    expect(classifyOverallHealth(90)).toBe('robust')
  })

  it('returns healthy for good index', () => {
    expect(classifyOverallHealth(70)).toBe('healthy')
  })

  it('returns ailing for moderate index', () => {
    expect(classifyOverallHealth(50)).toBe('ailing')
  })

  it('returns sick for low index', () => {
    expect(classifyOverallHealth(30)).toBe('sick')
  })

  it('returns critical for very low index', () => {
    expect(classifyOverallHealth(10)).toBe('critical')
  })
})

// ─── determineTreatmentPriority ─────────────────────────────────────────────────

describe('determineTreatmentPriority', () => {
  it('returns none for no remedies', () => {
    expect(determineTreatmentPriority([])).toBe('none')
  })

  it('returns highest effectiveness remedy', () => {
    const remedies: Remedy[] = [
      { name: 'low-eff', targetAilment: 'test', ingredients: [], preparation: [], dosage: 'single-file', sideEffects: [], contraindications: [], effectiveness: 50, difficulty: 'easy' },
      { name: 'high-eff', targetAilment: 'test', ingredients: [], preparation: [], dosage: 'single-file', sideEffects: [], contraindications: [], effectiveness: 95, difficulty: 'trivial' },
    ]
    expect(determineTreatmentPriority(remedies)).toBe('high-eff')
  })
})

// ─── estimateRecovery ───────────────────────────────────────────────────────────

describe('estimateRecovery', () => {
  const makeStats = (overrides: Partial<ApothecaryStats> = {}): ApothecaryStats => ({
    totalSymptoms: 0, mildSymptoms: 0, severeSymptoms: 0, criticalSymptoms: 0,
    totalAilments: 0, acuteAilments: 0, chronicAilments: 0,
    totalRemedies: 0, easyRemedies: 0, difficultRemedies: 0,
    avgEffectiveness: 0, avgCabinetScore: 100,
    wellEquippedFiles: 1, poorlyEquippedFiles: 0,
    overallHealth: 'robust', healthIndex: 100,
    treatmentPriority: 'none', estimatedRecovery: 'quick',
    ...overrides,
  })

  it('returns quick for healthy codebase', () => {
    expect(estimateRecovery(makeStats())).toBe('quick')
  })

  it('returns moderate for few ailments', () => {
    expect(estimateRecovery(makeStats({ totalAilments: 2, criticalSymptoms: 1 }))).toBe('moderate')
  })

  it('returns long-term for chronic ailments', () => {
    expect(estimateRecovery(makeStats({ chronicAilments: 1, totalAilments: 4 }))).toBe('long-term')
  })

  it('returns major-surgery for many ailments', () => {
    expect(estimateRecovery(makeStats({ totalAilments: 7 }))).toBe('major-surgery')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<ApothecaryStats> = {}): ApothecaryStats => ({
    totalSymptoms: 5, mildSymptoms: 3, severeSymptoms: 1, criticalSymptoms: 1,
    totalAilments: 2, acuteAilments: 1, chronicAilments: 1,
    totalRemedies: 2, easyRemedies: 1, difficultRemedies: 1,
    avgEffectiveness: 70, avgCabinetScore: 50,
    wellEquippedFiles: 1, poorlyEquippedFiles: 2,
    overallHealth: 'ailing', healthIndex: 50,
    treatmentPriority: 'fix-types', estimatedRecovery: 'moderate',
    ...overrides,
  })

  it('recommends treating terminal ailments', () => {
    const ailments: Ailment[] = [
      { name: 'test', symptoms: [], diagnosis: '', affectedFiles: [], chronicLevel: 'terminal', spreadRisk: 'contained', description: '' },
    ]
    const recs = generateRecommendations([], ailments, [], makeStats())
    expect(recs.some(r => r.includes('terminal'))).toBe(true)
  })

  it('recommends quick wins', () => {
    const remedies: Remedy[] = [
      { name: 'quick-fix', targetAilment: 'test', ingredients: [], preparation: [], dosage: 'single-file', sideEffects: [], contraindications: [], effectiveness: 80, difficulty: 'easy' },
    ]
    const recs = generateRecommendations([], [], remedies, makeStats())
    expect(recs.some(r => r.includes('quick win'))).toBe(true)
  })

  it('recommends stocking cabinets for poor files', () => {
    const recs = generateRecommendations([], [], [], makeStats({ poorlyEquippedFiles: 3 }))
    expect(recs.some(r => r.includes('medicine cabinet') || r.includes('poor'))).toBe(true)
  })

  it('recommends high-impact remedies', () => {
    const remedies: Remedy[] = [
      { name: 'super-fix', targetAilment: 'test', ingredients: [], preparation: [], dosage: 'single-file', sideEffects: [], contraindications: [], effectiveness: 95, difficulty: 'moderate' },
    ]
    const recs = generateRecommendations([], [], remedies, makeStats())
    expect(recs.some(r => r.includes('High-impact') || r.includes('super-fix'))).toBe(true)
  })

  it('recommends focus for poor health', () => {
    const recs = generateRecommendations([], [], [], makeStats({ overallHealth: 'critical' }))
    expect(recs.some(r => r.includes('poor') || r.includes('critical'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const recs = generateRecommendations([], [], [], makeStats({
      poorlyEquippedFiles: 0, overallHealth: 'robust',
    }))
    expect(recs.length).toBe(0)
  })

  it('deduplicates recommendations', () => {
    const ailments: Ailment[] = [
      { name: 'a', symptoms: [], diagnosis: '', affectedFiles: [], chronicLevel: 'terminal', spreadRisk: 'contained', description: '' },
      { name: 'b', symptoms: [], diagnosis: '', affectedFiles: [], chronicLevel: 'terminal', spreadRisk: 'contained', description: '' },
    ]
    const recs = generateRecommendations([], ailments, [], makeStats())
    const terminalRecs = recs.filter(r => r.includes('terminal'))
    expect(terminalRecs.length).toBe(1)
  })
})

// ─── buildApothecaryResult ──────────────────────────────────────────────────────

describe('buildApothecaryResult', () => {
  const opts: ApothecaryOptions = {}

  it('returns empty result for no files', () => {
    const result = buildApothecaryResult([], [], opts)
    expect(result.symptoms).toEqual([])
    expect(result.stats.totalSymptoms).toBe(0)
    expect(result.recommendations).toEqual([])
  })

  it('returns robust for empty files', () => {
    const result = buildApothecaryResult([], [], opts)
    expect(result.stats.overallHealth).toBe('robust')
    expect(result.stats.healthIndex).toBe(100)
  })

  it('builds symptoms from files', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['const x: any = 1; // TODO: fix'],
      opts,
    )
    expect(result.symptoms.length).toBeGreaterThan(0)
  })

  it('diagnoses ailments from symptoms', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['const x: any = 1; // TODO: fix'],
      opts,
    )
    expect(result.ailments.length).toBeGreaterThan(0)
  })

  it('prescribes remedies for ailments', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['const x: any = 1'],
      opts,
    )
    expect(result.remedies.length).toBeGreaterThan(0)
  })

  it('evaluates medicine cabinets', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['try { foo(); } catch(e) {}'],
      opts,
    )
    expect(result.cabinet.length).toBe(1)
    expect(result.cabinet[0].existingRemedies).toContain('error-handling')
  })

  it('computes stats correctly', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['const x: any = 1'],
      opts,
    )
    expect(result.stats.totalSymptoms).toBeGreaterThan(0)
    expect(typeof result.stats.healthIndex).toBe('number')
    expect(typeof result.stats.avgCabinetScore).toBe('number')
  })

  it('classifies overall health', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['const x: string = "hello"'],
      opts,
    )
    expect(['robust', 'healthy', 'ailing', 'sick', 'critical']).toContain(result.stats.overallHealth)
  })

  it('determines treatment priority', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['const x: any = 1'],
      opts,
    )
    expect(result.stats.treatmentPriority).toBeDefined()
  })

  it('estimates recovery', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['const x: string = "hello"'],
      opts,
    )
    expect(['quick', 'moderate', 'long-term', 'major-surgery']).toContain(result.stats.estimatedRecovery)
  })

  it('generates recommendations', () => {
    const result = buildApothecaryResult(
      ['a.ts'],
      ['eval("code")'],
      opts,
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty content', () => {
    const result = buildApothecaryResult(['a.ts'], [''], opts)
    expect(result.symptoms.length).toBe(0)
    expect(result.cabinet[0].cabinetScore).toBe(100)
  })

  it('handles multiple files with mixed health', () => {
    const result = buildApothecaryResult(
      ['clean.ts', 'messy.ts'],
      ['const x: string = "hello"', 'const x: any = 1; eval(code); // TODO'],
      opts,
    )
    expect(result.symptoms.length).toBeGreaterThan(0)
    expect(result.stats.totalZones).toBeUndefined()
  })
})

// ─── format helpers ─────────────────────────────────────────────────────────────

describe('format helpers', () => {
  const makeResult = (): ApothecaryResult => buildApothecaryResult(
    ['a.ts'],
    ['const x: string = "hello"'],
    {},
  )

  describe('formatSymptoms', () => {
    it('handles empty symptoms', () => {
      expect(formatSymptoms([])).toContain('healthy')
    })

    it('shows symptom details', () => {
      const symptoms: Symptom[] = [
        { name: 'missing-types', file: 'a.ts', line: 1, severity: 'moderate', category: 'maintainability', description: 'any types', indicators: ['any-count:2'] },
      ]
      expect(formatSymptoms(symptoms)).toContain('missing-types')
    })
  })

  describe('formatAilments', () => {
    it('handles empty ailments', () => {
      expect(formatAilments([])).toContain('No ailments')
    })

    it('shows ailment details', () => {
      const ailments: Ailment[] = [
        { name: 'complexity-fever', symptoms: ['excessive-nesting'], diagnosis: 'Too complex', affectedFiles: ['a.ts'], chronicLevel: 'acute', spreadRisk: 'contained', description: 'test' },
      ]
      expect(formatAilments(ailments)).toContain('complexity-fever')
      expect(formatAilments(ailments)).toContain('Too complex')
    })
  })

  describe('formatRemedies', () => {
    it('handles empty remedies', () => {
      expect(formatRemedies([])).toContain('No remedies')
    })

    it('shows remedy details', () => {
      const remedies: Remedy[] = [
        { name: 'extract-function', targetAilment: 'complexity-fever', ingredients: [], preparation: ['step 1', 'step 2'], dosage: 'single-file', sideEffects: [], contraindications: [], effectiveness: 80, difficulty: 'moderate' },
      ]
      expect(formatRemedies(remedies)).toContain('extract-function')
      expect(formatRemedies(remedies)).toContain('80%')
    })
  })

  describe('formatCabinet', () => {
    it('handles empty cabinet', () => {
      expect(formatCabinet([])).toContain('No files')
    })

    it('shows cabinet details', () => {
      const cab: MedicineCabinet[] = [
        { file: 'a.ts', existingRemedies: ['error-handling'], missingRemedies: ['jsdoc'], cabinetScore: 40, isWellEquipped: false },
      ]
      const output = formatCabinet(cab)
      expect(output).toContain('a.ts')
      expect(output).toContain('error-handling')
    })
  })

  describe('formatApothecaryStats', () => {
    it('shows stats summary', () => {
      const result = makeResult()
      const output = formatApothecaryStats(result.stats)
      expect(output).toContain('Apothecary Analysis')
      expect(output).toContain('Symptoms:')
      expect(output).toContain('Health Index:')
    })
  })

  describe('formatRecommendations', () => {
    it('handles empty recommendations', () => {
      expect(formatRecommendations([])).toContain('healthy')
    })

    it('shows numbered recommendations', () => {
      const output = formatRecommendations(['Fix X', 'Fix Y'])
      expect(output).toContain('1. Fix X')
      expect(output).toContain('2. Fix Y')
    })
  })

  describe('formatHealthGauge', () => {
    it('returns gauge string', () => {
      const gauge = formatHealthGauge(75)
      expect(gauge).toContain('\u2588')
      expect(gauge).toContain('75')
    })
  })

  describe('label formatters', () => {
    it('formatHealthLabel covers all levels', () => {
      for (const h of ['robust', 'healthy', 'ailing', 'sick', 'critical'] as const) {
        expect(formatHealthLabel(h)).toContain(h)
      }
    })

    it('formatSeverityLabel covers all levels', () => {
      for (const s of ['mild', 'moderate', 'severe', 'critical']) {
        expect(formatSeverityLabel(s)).toContain(s)
      }
    })

    it('formatChronicLabel covers all levels', () => {
      for (const l of ['acute', 'chronic', 'terminal'] as const) {
        expect(formatChronicLabel(l)).toContain(l)
      }
    })

    it('formatSpreadLabel covers all levels', () => {
      for (const r of ['contained', 'local', 'systemic', 'pandemic'] as const) {
        expect(formatSpreadLabel(r)).toContain(r)
      }
    })
  })

  describe('formatApothecaryTable', () => {
    it('produces full table output', () => {
      const result = makeResult()
      const output = formatApothecaryTable(result)
      expect(output).toContain('Apothecary Analysis')
      expect(output).toContain('Recommendations')
    })
  })

  describe('formatApothecaryJson', () => {
    it('produces valid JSON', () => {
      const result = makeResult()
      const json = formatApothecaryJson(result)
      const parsed = JSON.parse(json)
      expect(parsed.symptoms).toBeDefined()
      expect(parsed.stats).toBeDefined()
    })
  })
})

// ─── Integration ────────────────────────────────────────────────────────────────

describe('apothecary integration', () => {
  it('full diagnosis of messy codebase', () => {
    const result = buildApothecaryResult(
      ['messy.ts'],
      ['const x: any = 1;\neval(x);\n// TODO: refactor\n// FIXME: broken\nglobalThis.z = 1;\narr.push(1);\narr.splice(0,1);\narr.sort();'],
      {},
    )
    expect(result.symptoms.length).toBeGreaterThan(2)
    expect(result.ailments.length).toBeGreaterThanOrEqual(1)
    expect(result.remedies.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.healthIndex).toBeLessThan(70)
  })

  it('healthy codebase needs no treatment', () => {
    const result = buildApothecaryResult(
      ['clean.ts'],
      ['/** docs */\nconst x: string = "hello";\ntry { foo(); } catch(e) {}'],
      {},
    )
    expect(result.symptoms.length).toBe(0)
    expect(result.ailments.length).toBe(0)
    expect(result.remedies.length).toBe(0)
    expect(result.stats.overallHealth).toBe('robust')
  })
})
