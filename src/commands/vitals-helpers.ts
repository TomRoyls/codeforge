// ─── Types ─────────────────────────────────────────────────────────────────────

export interface VitalSign {
  name: string
  value: number
  unit: string
  status: 'critical' | 'warning' | 'normal' | 'excellent'
  range: [number, number]
  description: string
}

export interface OrganReport {
  organ: string
  health: number
  vitalSigns: VitalSign[]
  diagnosis: string
  prognosis: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
}

export interface Symptom {
  file: string
  line: number
  vital: string
  severity: 'mild' | 'moderate' | 'severe' | 'critical'
  symptom: string
  treatment: string
}

export interface VitalsStats {
  overallHealth: number
  criticalVitals: number
  warningVitals: number
  normalVitals: number
  excellentVitals: number
  patientAge: number
  lastCheckup: string
  diagnosis: string
  triageLevel: 'routine' | 'urgent' | 'emergency'
}

export interface VitalsResult {
  vitals: VitalSign[]
  organs: OrganReport[]
  symptoms: Symptom[]
  stats: VitalsStats
  recommendations: string[]
}

// ─── Status Classification ────────────────────────────────────────────────────

/**
 * Classify a vital sign status from its value.
 *
 * @example
 * classifyStatus(10, [5, 15], 20, 30)
 */
export function classifyStatus(
  value: number,
  normalRange: [number, number],
  warningThreshold: number,
  criticalThreshold: number,
): VitalSign['status'] {
  if (value >= normalRange[0] && value <= normalRange[1]) return 'normal'
  if (criticalThreshold > normalRange[1] && value >= criticalThreshold) return 'critical'
  if (criticalThreshold < normalRange[0] && value <= criticalThreshold) return 'critical'
  if (warningThreshold > normalRange[1] && value >= warningThreshold) return 'warning'
  if (warningThreshold < normalRange[0] && value <= warningThreshold) return 'warning'
  if (value < normalRange[0] || value > normalRange[1]) return 'warning'
  return 'normal'
}

// ─── Vital Measurement Functions ──────────────────────────────────────────────

/**
 * Measure pulse: commit frequency per week.
 *
 * @example
 * measurePulse(25, 7)
 */
export function measurePulse(commits: number, daysSpan: number): VitalSign {
  const weeks = Math.max(daysSpan / 7, 0.01)
  const perWeek = Math.round((commits / weeks) * 100) / 100
  const status = classifyStatus(perWeek, [5, 20], 50, 100)
  return {
    name: 'Pulse',
    value: perWeek,
    unit: 'bpm',
    range: [5, 20],
    status,
    description: `Commit frequency: ${perWeek} commits/week`,
  }
}

/**
 * Measure blood pressure: average cyclomatic complexity.
 *
 * @example
 * measureBloodPressure([{content: 'if (x) {}'}])
 */
export function measureBloodPressure(files: { content: string }[]): VitalSign {
  let totalComplexity = 0
  let count = 0
  for (const f of files) {
    totalComplexity += computeComplexity(f.content)
    count++
  }
  const avg = count > 0 ? Math.round((totalComplexity / count) * 100) / 100 : 0
  const status = classifyStatus(avg, [1, 15], 20, 30)
  return {
    name: 'Blood Pressure',
    value: avg,
    unit: 'mmHg',
    range: [1, 15],
    status,
    description: `Average cyclomatic complexity: ${avg}`,
  }
}

/**
 * Measure temperature: bug risk score 0-100.
 *
 * @example
 * measureTemperature([{content: 'TODO: fix'}])
 */
export function measureTemperature(files: { content: string }[]): VitalSign {
  let totalRisk = 0
  for (const f of files) {
    const todoCount = countTodoMarkers(f.content)
    const complexity = computeComplexity(f.content)
    const exports = countExports(f.content)
    const risk = Math.min(100, todoCount * 5 + Math.max(0, complexity - 10) * 2 + Math.max(0, exports - 5) * 3)
    totalRisk += risk
  }
  const avg = files.length > 0 ? Math.round((totalRisk / files.length) * 100) / 100 : 0
  const status = classifyStatus(avg, [0, 30], 60, 80)
  return {
    name: 'Temperature',
    value: avg,
    unit: '°C',
    range: [0, 30],
    status,
    description: `Bug risk score: ${avg}/100`,
  }
}

/**
 * Measure respiration: refactoring rate as percentage.
 *
 * @example
 * measureRespiration(10, 50)
 */
export function measureRespiration(refactorCommits: number, totalCommits: number): VitalSign {
  const rate = totalCommits > 0 ? Math.round((refactorCommits / totalCommits) * 10000) / 100 : 0
  const status = classifyStatus(rate, [10, 30], 5, 0)
  return {
    name: 'Respiration',
    value: rate,
    unit: '%',
    range: [10, 30],
    status,
    description: `Refactoring rate: ${rate}% of commits`,
  }
}

/**
 * Measure oxygen: test-to-source file ratio.
 *
 * @example
 * measureOxygen(20, 15)
 */
export function measureOxygen(sourceFiles: number, testFiles: number): VitalSign {
  const ratio = sourceFiles > 0 ? Math.round((testFiles / sourceFiles) * 100) / 100 : 0
  const status = classifyStatus(ratio, [0.8, 2.0], 0.5, 0.2)
  return {
    name: 'Oxygen',
    value: ratio,
    unit: 'ratio',
    range: [0.8, 2.0],
    status,
    description: `Test-to-source ratio: ${ratio}`,
  }
}

/**
 * Measure heart rate variability: naming convention consistency.
 *
 * @example
 * measureHeartRateVariability([{content: 'const myVar = 1'}])
 */
export function measureHeartRateVariability(files: { content: string }[]): VitalSign {
  let camelCount = 0
  let snakeCount = 0
  let pascalCount = 0
  let total = 0
  for (const f of files) {
    const matches = f.content.match(/\b(?:const|let|var|function|class)\s+([a-zA-Z_]\w*)/g)
    if (!matches) continue
    for (const m of matches) {
      const name = m.replace(/^(?:const|let|var|function|class)\s+/, '')
      if (/^[a-z][a-zA-Z0-9]*$/.test(name)) camelCount++
      else if (/^[a-z_][a-z0-9_]*$/.test(name)) snakeCount++
      else if (/^[A-Z][a-zA-Z0-9]*$/.test(name)) pascalCount++
      total++
    }
  }
  const consistency = total > 0 ? Math.round((Math.max(camelCount, snakeCount, pascalCount) / total) * 10000) / 100 : 100
  const status = classifyStatus(consistency, [80, 100], 60, 40)
  return {
    name: 'Heart Rate Variability',
    value: consistency,
    unit: '%',
    range: [80, 100],
    status,
    description: `Naming consistency: ${consistency}%`,
  }
}

/**
 * Measure white blood cell count: error handling ratio.
 *
 * @example
 * measureWhiteBloodCellCount([{content: 'try { } catch(e) {} function f() {}'}])
 */
export function measureWhiteBloodCellCount(files: { content: string }[]): VitalSign {
  let catchCount = 0
  let functionCount = 0
  for (const f of files) {
    const catches = f.content.match(/\bcatch\s*\(/g)
    if (catches) catchCount += catches.length
    const functions = f.content.match(/\bfunction\b|=>\s*[{(]|\basync\s+\w+\s*\(/g)
    if (functions) functionCount += functions.length
  }
  const ratio = functionCount > 0 ? Math.round((catchCount / functionCount) * 100) / 100 : 0
  const status = classifyStatus(ratio, [0.5, 2.0], 0.2, 0.1)
  return {
    name: 'White Blood Cell Count',
    value: ratio,
    unit: 'ratio',
    range: [0.5, 2.0],
    status,
    description: `Error handling ratio: ${ratio} catch/function`,
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Compute cyclomatic complexity.
 *
 * @example
 * computeComplexity('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function computeComplexity(content: string): number {
  const patterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcatch\b/g, /&&/g, /\|\|/g]
  let total = 1
  for (const pat of patterns) {
    const m = content.match(pat)
    if (m) total += m.length
  }
  return total
}

/**
 * Count TODO/FIXME markers.
 *
 * @example
 * countTodoMarkers('// TODO: fix this')
 */
export function countTodoMarkers(content: string): number {
  const m = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)[\s:]/gi)
  return m ? m.length : 0
}

/**
 * Count exports.
 *
 * @example
 * countExports('export function foo() {}')
 */
export function countExports(content: string): number {
  const m = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm)
  return m ? m.length : 0
}

/**
 * Count functions.
 *
 * @example
 * countFunctions('function foo() {} const bar = () => {}')
 */
export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\b|=>\s*[{(]|\basync\s+\w+\s*\(/g)
  return m ? m.length : 0
}

/**
 * Count catch blocks.
 *
 * @example
 * countCatchBlocks('try {} catch(e) {}')
 */
export function countCatchBlocks(content: string): number {
  const m = content.match(/\bcatch\s*\(/g)
  return m ? m.length : 0
}

/**
 * Check if a file path is a test file.
 *
 * @example
 * isTestFile('foo.test.ts')
 */
export function isTestFile(path: string): boolean {
  return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(path)
}

// ─── Organ Examination ────────────────────────────────────────────────────────

/**
 * Examine an organ (directory/module) and produce a health report.
 *
 * @example
 * examineOrgan('src/core', [{content: '...', path: 'src/core/a.ts'}])
 */
export function examineOrgan(
  directory: string,
  files: { content: string; path: string }[],
): OrganReport {
  if (files.length === 0) {
    return {
      organ: directory,
      health: 100,
      vitalSigns: [],
      diagnosis: 'No files to examine',
      prognosis: 'excellent',
    }
  }

  const bp = measureBloodPressure(files)
  const temp = measureTemperature(files)
  const hrv = measureHeartRateVariability(files)
  const wbc = measureWhiteBloodCellCount(files)

  const vitalSigns = [bp, temp, hrv, wbc]

  const health = computeOrganHealth(vitalSigns)

  return {
    organ: directory,
    health,
    vitalSigns,
    diagnosis: diagnoseOrgan(vitalSigns),
    prognosis: determinePrognosis(health),
  }
}

/**
 * Compute organ health from vital signs (weighted average).
 *
 * @example
 * computeOrganHealth(vitalSigns)
 */
export function computeOrganHealth(vitalSigns: VitalSign[]): number {
  if (vitalSigns.length === 0) return 100
  const weights: Record<string, number> = {
    normal: 100,
    excellent: 100,
    warning: 60,
    critical: 20,
  }
  const total = vitalSigns.reduce((sum, v) => sum + (weights[v.status] ?? 80), 0)
  return Math.round(total / vitalSigns.length)
}

/**
 * Diagnose an organ from its vital signs.
 *
 * @example
 * diagnoseOrgan(vitalSigns)
 */
export function diagnoseOrgan(vitalSigns: VitalSign[]): string {
  const criticals = vitalSigns.filter((v) => v.status === 'critical')
  const warnings = vitalSigns.filter((v) => v.status === 'warning')
  if (criticals.length > 0) return `Critical: ${criticals.map((v) => v.name).join(', ')} out of range`
  if (warnings.length > 0) return `Warning: ${warnings.map((v) => v.name).join(', ')} borderline`
  return 'All vital signs within normal range'
}

// ─── Prognosis & Triage ───────────────────────────────────────────────────────

/**
 * Determine prognosis from health score.
 *
 * @example
 * determinePrognosis(85)
 */
export function determinePrognosis(health: number): OrganReport['prognosis'] {
  if (health >= 90) return 'excellent'
  if (health >= 70) return 'good'
  if (health >= 50) return 'fair'
  if (health >= 30) return 'poor'
  return 'critical'
}

/**
 * Determine triage level from counts.
 *
 * @example
 * determineTriage(2, 3)
 */
export function determineTriage(criticalCount: number, warningCount: number): VitalsStats['triageLevel'] {
  if (criticalCount > 0) return 'emergency'
  if (warningCount >= 3) return 'urgent'
  return 'routine'
}

// ─── Symptom Diagnosis ────────────────────────────────────────────────────────

/**
 * Diagnose symptoms from files.
 *
 * @example
 * diagnoseSymptoms([{content: '...', path: 'a.ts'}])
 */
export function diagnoseSymptoms(files: { content: string; path: string }[]): Symptom[] {
  const symptoms: Symptom[] = []

  for (const f of files) {
    const lines = f.content.split('\n')

    const todoMatches = [...f.content.matchAll(/\/\/\s*(TODO|FIXME)[\s:]+(.*)/gi)]
    for (const m of todoMatches) {
      const lineNum = f.content.substring(0, m.index).split('\n').length
      symptoms.push({
        file: f.path,
        line: lineNum,
        vital: 'Temperature',
        severity: 'mild',
        symptom: `TODO/FIXME: ${m[2]?.trim() ?? 'unknown'}`,
        treatment: 'Resolve or create issue tracker entry',
      })
    }

    const complexity = computeComplexity(f.content)
    if (complexity > 20) {
      symptoms.push({
        file: f.path,
        line: 1,
        vital: 'Blood Pressure',
        severity: complexity > 30 ? 'severe' : 'moderate',
        symptom: `High complexity (${complexity}) detected`,
        treatment: 'Break down into smaller functions',
      })
    }

    const catchCount = countCatchBlocks(f.content)
    const fnCount = countFunctions(f.content)
    if (fnCount > 5 && catchCount === 0) {
      symptoms.push({
        file: f.path,
        line: 1,
        vital: 'White Blood Cell Count',
        severity: 'moderate',
        symptom: `${fnCount} functions with no error handling`,
        treatment: 'Add try/catch blocks for error-prone operations',
      })
    }

    const linesOfCode = lines.filter((l) => l.trim().length > 0 && !l.trim().startsWith('//')).length
    if (linesOfCode > 300) {
      symptoms.push({
        file: f.path,
        line: 1,
        vital: 'Blood Pressure',
        severity: linesOfCode > 500 ? 'severe' : 'moderate',
        symptom: `File too large (${linesOfCode} effective lines)`,
        treatment: 'Split into smaller modules',
      })
    }
  }

  return symptoms
}

// ─── Overall Health ───────────────────────────────────────────────────────────

/**
 * Compute overall health from vital signs (weighted).
 *
 * @example
 * computeOverallHealth(vitalSigns)
 */
export function computeOverallHealth(vitals: VitalSign[]): number {
  if (vitals.length === 0) return 100
  const weights: Record<string, number> = {
    excellent: 100,
    normal: 85,
    warning: 50,
    critical: 15,
  }
  const vitalWeights: Record<string, number> = {
    Pulse: 1.0,
    'Blood Pressure': 1.5,
    Temperature: 1.5,
    Respiration: 0.8,
    Oxygen: 1.2,
    'Heart Rate Variability': 0.7,
    'White Blood Cell Count': 1.0,
  }

  let totalWeight = 0
  let weightedSum = 0
  for (const v of vitals) {
    const w = vitalWeights[v.name] ?? 1.0
    weightedSum += (weights[v.status] ?? 80) * w
    totalWeight += w
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 100
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate medical-style recommendations.
 *
 * @example
 * generateRecommendations(vitals, organs, symptoms, stats)
 */
export function generateRecommendations(
  vitals: VitalSign[],
  organs: OrganReport[],
  symptoms: Symptom[],
  stats: VitalsStats,
): string[] {
  const recs: string[] = []

  const criticals = vitals.filter((v) => v.status === 'critical')
  for (const v of criticals) {
    recs.push(`CRITICAL: ${v.name} (${v.value} ${v.unit}) requires immediate attention`)
  }

  const warnings = vitals.filter((v) => v.status === 'warning')
  for (const v of warnings) {
    recs.push(`WARNING: ${v.name} (${v.value} ${v.unit}) — schedule a review`)
  }

  const severeSymptoms = symptoms.filter((s) => s.severity === 'severe' || s.severity === 'critical')
  for (const s of severeSymptoms) {
    recs.push(`Prescribe: ${s.treatment} (for ${s.file})`)
  }

  const poorOrgans = organs.filter((o) => o.prognosis === 'poor' || o.prognosis === 'critical')
  for (const o of poorOrgans) {
    recs.push(`Organ '${o.organ}' (${o.prognosis} prognosis): ${o.diagnosis}`)
  }

  if (stats.triageLevel === 'emergency') {
    recs.push('TRIAGE: Emergency — critical vitals detected, immediate intervention required')
  } else if (stats.triageLevel === 'urgent') {
    recs.push('TRIAGE: Urgent — schedule follow-up within 48 hours')
  }

  if (recs.length === 0) {
    recs.push('Patient is healthy — all vital signs within normal range. Continue regular checkups.')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build complete vitals result from files and contents.
 *
 * @example
 * buildVitalsResult(['a.ts'], ['const x = 1'], { maxDepth: 50 })
 */
export function buildVitalsResult(
  files: string[],
  contents: string[],
  options: { maxDepth: number },
): VitalsResult {
  const fileData = files.map((f, i) => ({ content: contents[i] ?? '', path: f }))

  const pulse = measurePulse(0, 1)
  const bp = measureBloodPressure(fileData)
  const temp = measureTemperature(fileData)
  const resp = measureRespiration(0, 1)
  const testFiles = files.filter((f) => isTestFile(f))
  const sourceFiles = files.filter((f) => !isTestFile(f))
  const oxygen = measureOxygen(sourceFiles.length, testFiles.length)
  const hrv = measureHeartRateVariability(fileData)
  const wbc = measureWhiteBloodCellCount(fileData)

  const vitals = [pulse, bp, temp, resp, oxygen, hrv, wbc]

  const directoryMap = new Map<string, { content: string; path: string }[]>()
  for (const fd of fileData) {
    const dir = fd.path.includes('/') ? fd.path.substring(0, fd.path.lastIndexOf('/')) : '.'
    const arr = directoryMap.get(dir) ?? []
    arr.push(fd)
    directoryMap.set(dir, arr)
  }

  const organs: OrganReport[] = []
  for (const [dir, dirFiles] of directoryMap) {
    organs.push(examineOrgan(dir, dirFiles))
  }

  const symptoms = diagnoseSymptoms(fileData)

  const criticalVitals = vitals.filter((v) => v.status === 'critical').length
  const warningVitals = vitals.filter((v) => v.status === 'warning').length
  const normalVitals = vitals.filter((v) => v.status === 'normal').length
  const excellentVitals = vitals.filter((v) => v.status === 'excellent').length
  const overallHealth = computeOverallHealth(vitals)

  const stats: VitalsStats = {
    overallHealth,
    criticalVitals,
    warningVitals,
    normalVitals,
    excellentVitals,
    patientAge: options.maxDepth,
    lastCheckup: 'none',
    diagnosis: overallHealth >= 80 ? 'Healthy' : overallHealth >= 60 ? 'Fair condition' : overallHealth >= 40 ? 'Poor condition' : 'Critical condition',
    triageLevel: determineTriage(criticalVitals, warningVitals),
  }

  const recommendations = generateRecommendations(vitals, organs, symptoms, stats)

  return { vitals, organs, symptoms, stats, recommendations }
}
