// ─── Types ────────────────────────────────────────────────────────────────────

export type VitalStatus = 'normal' | 'elevated' | 'high' | 'critical'
export type OverallHealth = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'

export interface VitalSign {
  name: string
  value: number
  unit: string
  status: VitalStatus
  description: string
  icon: string
  advice: string
}

export interface HeartbeatStats {
  totalVitals: number
  normalCount: number
  elevatedCount: number
  highCount: number
  criticalCount: number
}

export interface HeartbeatResult {
  vitals: VitalSign[]
  overallHealth: OverallHealth
  healthScore: number
  diagnosis: string
  prescriptions: string[]
  stats: HeartbeatStats
}

export interface HeartbeatOptions {
  verbose?: boolean
}

// ─── Vital Classification ─────────────────────────────────────────────────────

/**
 * Classify a vital sign value into status.
 *
 * @example
 * classifyVital('pulse', 10)
 */
export function classifyVital(name: string, value: number): VitalStatus {
  switch (name) {
    case 'pulse':
      if (value === 0) return 'critical'
      if (value > 50) return 'high'
      if (value > 20) return 'elevated'
      return 'normal'
    case 'bloodPressure':
      if (value >= 30) return 'critical'
      if (value >= 20) return 'high'
      if (value >= 10) return 'elevated'
      return 'normal'
    case 'temperature':
      if (value >= 15) return 'critical'
      if (value >= 5) return 'high'
      if (value >= 1) return 'elevated'
      return 'normal'
    case 'respiration':
      if (value < 40) return 'critical'
      if (value < 60) return 'high'
      if (value < 80) return 'elevated'
      return 'normal'
    case 'cholesterol':
      if (value >= 60) return 'critical'
      if (value >= 30) return 'high'
      if (value >= 10) return 'elevated'
      return 'normal'
    case 'bmi':
      if (value >= 800) return 'critical'
      if (value >= 400) return 'high'
      if (value >= 200) return 'elevated'
      return 'normal'
    case 'bloodSugar':
      if (value >= 200) return 'critical'
      if (value >= 100) return 'high'
      if (value >= 50) return 'elevated'
      return 'normal'
    case 'heartRateVariability':
      if (value >= 35) return 'critical'
      if (value >= 20) return 'high'
      if (value >= 10) return 'elevated'
      return 'normal'
    default:
      return 'normal'
  }
}

// ─── Vital Measurement Helpers ────────────────────────────────────────────────

function extractImports(content: string): string[] {
  const imports: string[] = []
  for (const line of content.split('\n')) {
    const m = line.match(/import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/)
    if (m) imports.push(m[1])
  }
  return imports
}

function countDebtItems(content: string): number {
  return (content.match(/\/\/\s*(?:TODO|FIXME|HACK|WORKAROUND|DEPRECATED|XXX)/gi) ?? []).length
}

// ─── measurePulse ─────────────────────────────────────────────────────────────

/**
 * Measure pulse (commit activity estimate).
 *
 * @example
 * measurePulse(files, contents)
 */
export function measurePulse(files: string[], contents: string[]): VitalSign {
  const value = Math.min(Math.round(files.length * 1.5), 100)
  const status = classifyVital('pulse', value)
  return {
    name: 'Pulse',
    value,
    unit: 'bpm',
    status,
    description: 'Project activity level (estimated from file count)',
    icon: '💓',
    advice: status === 'critical'
      ? 'No activity detected — project may be abandoned'
      : status === 'high'
        ? 'Very high activity — ensure quality controls are in place'
        : 'Activity levels are healthy',
  }
}

// ─── measureBloodPressure ─────────────────────────────────────────────────────

/**
 * Measure blood pressure (code complexity).
 *
 * @example
 * measureBloodPressure(files, contents)
 */
export function measureBloodPressure(files: string[], contents: string[]): VitalSign {
  let maxNesting = 0
  let totalNesting = 0
  let fileCount = 0

  for (const content of contents) {
    let d = 0
    let maxD = 0
    for (const ch of content) {
      if (ch === '{') { d++; if (d > maxD) maxD = d }
      if (ch === '}') d--
    }
    maxNesting = Math.max(maxNesting, maxD)
    totalNesting += maxD
    fileCount++
  }

  const avgNesting = fileCount > 0 ? Math.round(totalNesting / fileCount) : 0
  const value = maxNesting
  const status = classifyVital('bloodPressure', value)

  return {
    name: 'Blood Pressure',
    value,
    unit: `${maxNesting}/${avgNesting}`,
    status,
    description: `Code complexity (max/avg nesting: ${maxNesting}/${avgNesting})`,
    icon: '🩺',
    advice: status === 'critical'
      ? 'Dangerously high complexity — refactor immediately'
      : status === 'high'
        ? 'Elevated complexity — consider breaking down functions'
        : 'Complexity levels are manageable',
  }
}

// ─── measureTemperature ───────────────────────────────────────────────────────

/**
 * Measure temperature (hotspot count).
 *
 * @example
 * measureTemperature(files, contents)
 */
export function measureTemperature(files: string[], contents: string[]): VitalSign {
  let hotspots = 0
  for (const content of contents) {
    if (/\beval\s*\(/.test(content)) hotspots++
    if (/\.innerHTML\s*=/.test(content)) hotspots++
    if (/password\s*[:=]\s*['"]/.test(content)) hotspots++
    hotspots += countDebtItems(content)
  }
  const value = hotspots
  const status = classifyVital('temperature', value)
  return {
    name: 'Temperature',
    value,
    unit: '°C',
    status,
    description: `Hotspot count (${hotspots} issue areas detected)`,
    icon: '🌡️',
    advice: status === 'critical'
      ? 'Severe fever — many hotspots need urgent treatment'
      : status === 'high'
        ? 'Running hot — address hotspots to reduce temperature'
        : 'Temperature is within normal range',
  }
}

// ─── measureRespiration ───────────────────────────────────────────────────────

/**
 * Measure respiration (test health).
 *
 * @example
 * measureRespiration(files, contents)
 */
export function measureRespiration(files: string[], contents: string[]): VitalSign {
  const testFiles = files.filter((f) => /\.(?:test|spec)\.(ts|tsx|js|jsx)$/.test(f))
  const srcFiles = files.filter((f) => !/\.(?:test|spec)\.(ts|tsx|js|jsx)$/.test(f) && /\.(ts|tsx|js|jsx)$/.test(f))
  const ratio = srcFiles.length > 0 ? Math.round((testFiles.length / srcFiles.length) * 100) : 0
  const value = Math.min(ratio, 100)
  const status = classifyVital('respiration', value)
  return {
    name: 'Respiration',
    value,
    unit: '%',
    status,
    description: `Test-to-source ratio (${testFiles.length} tests / ${srcFiles.length} source)`,
    icon: '🫁',
    advice: status === 'critical'
      ? 'Labored breathing — test coverage is critically low'
      : status === 'high'
        ? 'Shallow breathing — add more tests for healthier coverage'
        : 'Breathing is steady',
  }
}

// ─── measureCholesterol ───────────────────────────────────────────────────────

/**
 * Measure cholesterol (technical debt).
 *
 * @example
 * measureCholesterol(files, contents)
 */
export function measureCholesterol(files: string[], contents: string[]): VitalSign {
  let debt = 0
  for (const content of contents) {
    debt += countDebtItems(content)
  }
  const value = debt
  const status = classifyVital('cholesterol', value)
  return {
    name: 'Cholesterol',
    value,
    unit: 'mg/dL',
    status,
    description: `Technical debt items (${debt} TODO/FIXME/HACK markers)`,
    icon: '🧪',
    advice: status === 'critical'
      ? 'Dangerously high cholesterol — debt will clog development arteries'
      : status === 'high'
        ? 'Elevated debt — start paying down TODOs and FIXMEs'
        : 'Debt levels are manageable',
  }
}

// ─── measureBMI ───────────────────────────────────────────────────────────────

/**
 * Measure BMI (code mass index — average file size).
 *
 * @example
 * measureBMI(files, contents)
 */
export function measureBMI(files: string[], contents: string[]): VitalSign {
  const totalLines = contents.reduce((s, c) => s + c.split('\n').length, 0)
  const avgLines = files.length > 0 ? Math.round(totalLines / files.length) : 0
  const value = avgLines
  const status = classifyVital('bmi', value)
  return {
    name: 'BMI',
    value,
    unit: 'lines',
    status,
    description: `Average file size (${avgLines} lines per file)`,
    icon: '⚖️',
    advice: status === 'critical'
      ? 'Severely overweight files — split into smaller modules'
      : status === 'high'
        ? 'Files are getting heavy — consider modularization'
        : 'File sizes are healthy',
  }
}

// ─── measureBloodSugar ────────────────────────────────────────────────────────

/**
 * Measure blood sugar (dependency count).
 *
 * @example
 * measureBloodSugar(files, contents)
 */
export function measureBloodSugar(files: string[], contents: string[]): VitalSign {
  const externalImports = new Set<string>()
  for (const content of contents) {
    for (const imp of extractImports(content)) {
      if (!imp.startsWith('.')) externalImports.add(imp)
    }
  }
  const value = externalImports.size
  const status = classifyVital('bloodSugar', value)
  return {
    name: 'Blood Sugar',
    value,
    unit: 'deps',
    status,
    description: `External dependencies (${value} unique packages)`,
    icon: '💉',
    advice: status === 'critical'
      ? 'Dependency overdose — audit and remove unnecessary packages'
      : status === 'high'
        ? 'High dependency count — review which are truly needed'
        : 'Dependency count is healthy',
  }
}

// ─── measureHeartRateVariability ───────────────────────────────────────────────

/**
 * Measure heart rate variability (code consistency).
 *
 * @example
 * measureHeartRateVariability(files, contents)
 */
export function measureHeartRateVariability(files: string[], contents: string[]): VitalSign {
  let camelCase = 0
  let snakeCase = 0
  let pascalCase = 0
  for (const content of contents) {
    camelCase += (content.match(/\b[a-z][a-zA-Z0-9]{2,}\b/g) ?? []).length
    snakeCase += (content.match(/\b[a-z]+_[a-z_]+\b/g) ?? []).length
    pascalCase += (content.match(/\b[A-Z][a-zA-Z0-9]{2,}\b/g) ?? []).length
  }
  const total = camelCase + snakeCase + pascalCase
  const variance = total > 0 ? Math.round((Math.abs(camelCase - snakeCase) + Math.abs(camelCase - pascalCase)) / total * 100) : 0
  const value = Math.min(variance, 100)
  const status = classifyVital('heartRateVariability', value)
  return {
    name: 'Heart Rate Variability',
    value,
    unit: '%',
    status,
    description: `Naming/style variance (${value}% inconsistency)`,
    icon: '📈',
    advice: status === 'critical'
      ? 'Highly irregular patterns — establish consistent style guide'
      : status === 'high'
        ? 'Inconsistent naming — standardize conventions'
        : 'Coding patterns are consistent',
  }
}

// ─── computeOverallHealth ─────────────────────────────────────────────────────

const STATUS_SCORE: Record<VitalStatus, number> = {
  normal: 100,
  elevated: 70,
  high: 40,
  critical: 10,
}

/**
 * Compute overall health from vitals.
 *
 * @example
 * computeOverallHealth(vitals)
 */
export function computeOverallHealth(vitals: VitalSign[]): { health: OverallHealth; score: number } {
  if (vitals.length === 0) return { health: 'fair', score: 50 }
  const avg = Math.round(vitals.reduce((s, v) => s + STATUS_SCORE[v.status], 0) / vitals.length)

  let health: OverallHealth
  if (avg >= 85) health = 'excellent'
  else if (avg >= 70) health = 'good'
  else if (avg >= 50) health = 'fair'
  else if (avg >= 30) health = 'poor'
  else health = 'critical'

  return { health, score: avg }
}

// ─── generateDiagnosis ────────────────────────────────────────────────────────

/**
 * Generate medical-style diagnosis.
 *
 * @example
 * generateDiagnosis('good', vitals)
 */
export function generateDiagnosis(health: OverallHealth, vitals: VitalSign[]): string {
  const criticals = vitals.filter((v) => v.status === 'critical')
  const highs = vitals.filter((v) => v.status === 'high')

  switch (health) {
    case 'excellent':
      return 'Patient is in excellent health. All vital signs are within normal ranges. Continue current practices.'
    case 'good':
      return `Patient is in good health. ${highs.length > 0 ? `${highs.length} vital(s) slightly elevated — monitor closely.` : 'Minor fluctuations are normal.'}`
    case 'fair':
      return `Patient health is fair. ${highs.length + criticals.length} vital(s) need attention. Recommend lifestyle changes (refactoring).`
    case 'poor':
      return `Patient health is poor. ${criticals.length} critical vital(s) detected. Immediate intervention recommended.`
    case 'critical':
      return `Patient is in critical condition. ${criticals.length} vital(s) in critical state. Emergency refactoring required!`
  }
}

// ─── generatePrescriptions ────────────────────────────────────────────────────

/**
 * Generate prescriptions (fix suggestions).
 *
 * @example
 * generatePrescriptions(vitals)
 */
export function generatePrescriptions(vitals: VitalSign[]): string[] {
  const prescriptions: string[] = []

  for (const v of vitals) {
    if (v.status === 'critical') {
      prescriptions.push(`🚨 ${v.name}: ${v.advice}`)
    } else if (v.status === 'high') {
      prescriptions.push(`⚠️ ${v.name}: ${v.advice}`)
    }
  }

  if (prescriptions.length === 0) {
    prescriptions.push('✅ All vitals normal — maintain current health regimen')
  }

  return prescriptions
}

// ─── buildHeartbeatResult ─────────────────────────────────────────────────────

/**
 * Build the complete heartbeat analysis result.
 *
 * @example
 * buildHeartbeatResult(['index.ts'], ['export {}'])
 */
export function buildHeartbeatResult(
  files: string[],
  contents: string[],
  _options?: HeartbeatOptions,
): HeartbeatResult {
  const vitals: VitalSign[] = [
    measurePulse(files, contents),
    measureBloodPressure(files, contents),
    measureTemperature(files, contents),
    measureRespiration(files, contents),
    measureCholesterol(files, contents),
    measureBMI(files, contents),
    measureBloodSugar(files, contents),
    measureHeartRateVariability(files, contents),
  ]

  const { health, score } = computeOverallHealth(vitals)
  const diagnosis = generateDiagnosis(health, vitals)
  const prescriptions = generatePrescriptions(vitals)

  const stats: HeartbeatStats = {
    totalVitals: vitals.length,
    normalCount: vitals.filter((v) => v.status === 'normal').length,
    elevatedCount: vitals.filter((v) => v.status === 'elevated').length,
    highCount: vitals.filter((v) => v.status === 'high').length,
    criticalCount: vitals.filter((v) => v.status === 'critical').length,
  }

  return { vitals, overallHealth: health, healthScore: score, diagnosis, prescriptions, stats }
}
