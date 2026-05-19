// ─── Types ────────────────────────────────────────────────────────────────────

export type Grade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
export type Trend = 'improving' | 'stable' | 'declining'

export interface Subject {
  name: string
  grade: Grade
  score: number
  icon: string
  teacherComment: string
  strengths: string[]
  improvements: string[]
  trend: Trend
}

export interface ReportCard {
  studentName: string
  date: string
  subjects: Subject[]
  overallGrade: string
  overallScore: number
  gpa: number
  honors: string[]
  warnings: string[]
  summary: string
}

export interface ReportCardStats {
  totalSubjects: number
  averageScore: number
  subjectsAbove80: number
  subjectsBelow50: number
  highestSubject: string
  lowestSubject: string
}

export interface ReportCardResult {
  card: ReportCard
  stats: ReportCardStats
  recommendations: string[]
}

export interface ReportCardOptions {
  verbose?: boolean
  projectName?: string
}

// ─── Grade Utilities ──────────────────────────────────────────────────────────

/**
 * Convert a 0-100 score to a letter grade.
 *
 * @example
 * scoreToGrade(92)
 */
export function scoreToGrade(score: number): Grade {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'B+'
  if (score >= 80) return 'B'
  if (score >= 75) return 'C+'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Convert a letter grade to GPA (0-4.0).
 *
 * @example
 * gradeToGPA('A+')
 */
export function gradeToGPA(grade: Grade): number {
  const map: Record<Grade, number> = {
    'A+': 4.0, 'A': 4.0, 'B+': 3.5, 'B': 3.0,
    'C+': 2.5, 'C': 2.0, 'D': 1.0, 'F': 0,
  }
  return map[grade] ?? 0
}

// ─── Subject Scoring ──────────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<string, string> = {
  'Complexity Management': '🧩',
  'Documentation Quality': '📖',
  'Test Coverage': '🧪',
  'Code Security': '🔒',
  'Performance Health': '⚡',
  'Maintainability': '🔧',
  'Dependency Management': '📦',
  'Style Consistency': '✨',
  'Error Handling': '🛡️',
  'API Design': '🎯',
  'Architecture': '🏛️',
  'Code Freshness': ' freshness',
}

function extractImports(content: string): string[] {
  const imports: string[] = []
  for (const line of content.split('\n')) {
    const m = line.match(/import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/)
    if (m) imports.push(m[1])
  }
  return imports
}

/**
 * Compute a score 0-100 for a specific subject.
 *
 * @example
 * computeSubjectScore('Documentation Quality', files, contents)
 */
export function computeSubjectScore(subjectName: string, files: string[], contents: string[]): number {
  const srcFiles = files.filter((f) => !/\.(?:test|spec)\.(ts|tsx|js|jsx)$/.test(f))
  const srcContents = srcFiles.map((f) => contents[files.indexOf(f)] ?? '')

  switch (subjectName) {
    case 'Complexity Management': {
      if (srcContents.length === 0) return 50
      let totalNesting = 0
      let funcCount = 0
      for (const c of srcContents) {
        let maxD = 0
        let d = 0
        for (const ch of c) {
          if (ch === '{') { d++; if (d > maxD) maxD = d }
          if (ch === '}') d--
        }
        totalNesting += maxD
        const fns = c.match(/(?:function\s+\w+|(?:const|let)\s+\w+\s*=.*=>)/g)
        funcCount += fns?.length ?? 0
      }
      const avgNesting = totalNesting / srcContents.length
      return Math.min(Math.round(Math.max(100 - (avgNesting - 3) * 15, 20)), 100)
    }
    case 'Documentation Quality': {
      if (srcContents.length === 0) return 50
      let docLines = 0
      let totalLines = 0
      let hasReadme = files.some((f) => /readme/i.test(f))
      for (const c of srcContents) {
        const lines = c.split('\n')
        totalLines += lines.length
        docLines += lines.filter((l) => l.trimStart().startsWith('/**') || l.trimStart().startsWith('*') || l.trimStart().startsWith('//')).length
      }
      const ratio = totalLines > 0 ? docLines / totalLines : 0
      let score = Math.round(ratio * 300)
      if (hasReadme) score = Math.min(score + 15, 100)
      return Math.min(Math.max(score, 10), 100)
    }
    case 'Test Coverage': {
      const testFiles = files.filter((f) => /\.(?:test|spec)\.(ts|tsx|js|jsx)$/.test(f))
      const testRatio = srcFiles.length > 0 ? testFiles.length / srcFiles.length : 0
      let assertions = 0
      for (const c of contents) {
        assertions += (c.match(/\bexpect\b/g) ?? []).length
        assertions += (c.match(/\bassert\b/g) ?? []).length
      }
      const assertBonus = Math.min(assertions * 2, 30)
      return Math.min(Math.round(testRatio * 70 + assertBonus), 100)
    }
    case 'Code Security': {
      if (srcContents.length === 0) return 80
      let violations = 0
      for (const c of srcContents) {
        if (/\beval\s*\(/.test(c)) violations += 3
        if (/\.innerHTML\s*=/.test(c)) violations += 2
        if (/password\s*[:=]\s*['"]/.test(c)) violations += 3
        if (/api[_-]?key\s*[:=]\s*['"]/.test(c)) violations += 3
        if (/secret\s*[:=]\s*['"]/.test(c)) violations += 3
      }
      return Math.max(Math.round(100 - violations * 10), 10)
    }
    case 'Performance Health': {
      if (srcContents.length === 0) return 80
      let issues = 0
      for (const c of srcContents) {
        if (/for\s*\(.*await/.test(c)) issues += 2
        if (/\.forEach\s*\(\s*async/.test(c)) issues += 2
        if (/readFileSync|writeFileSync/.test(c)) issues += 2
      }
      return Math.max(Math.round(100 - issues * 8), 20)
    }
    case 'Maintainability': {
      if (srcContents.length === 0) return 50
      let longFiles = 0
      for (const c of srcContents) {
        if (c.split('\n').length > 300) longFiles++
      }
      const longRatio = longFiles / srcContents.length
      const avgLen = srcContents.reduce((s, c) => s + c.split('\n').length, 0) / srcContents.length
      const lenScore = avgLen < 100 ? 90 : avgLen < 200 ? 75 : avgLen < 400 ? 55 : 30
      return Math.max(Math.round(lenScore - longRatio * 30), 20)
    }
    case 'Dependency Management': {
      if (srcContents.length === 0) return 50
      let totalImports = 0
      for (const c of srcContents) {
        totalImports += extractImports(c).length
      }
      const avgImports = totalImports / srcContents.length
      if (avgImports < 3) return 90
      if (avgImports < 6) return 80
      if (avgImports < 10) return 65
      return 45
    }
    case 'Style Consistency': {
      if (srcContents.length === 0) return 70
      let camelCase = 0
      let snakeCase = 0
      for (const c of srcContents) {
        camelCase += (c.match(/\b[a-z][a-zA-Z0-9]*\b/g) ?? []).length
        snakeCase += (c.match(/\b[a-z][a-z0-9_]*\b/g) ?? []).filter((w) => w.includes('_')).length
      }
      const total = camelCase + snakeCase
      if (total === 0) return 70
      const consistency = Math.abs(camelCase - snakeCase) / total
      return Math.round(Math.max(100 - consistency * 100, 40))
    }
    case 'Error Handling': {
      if (srcContents.length === 0) return 50
      let tryCount = 0
      let silentCatch = 0
      for (const c of srcContents) {
        tryCount += (c.match(/\btry\s*\{/g) ?? []).length
        silentCatch += (c.match(/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/g) ?? []).length
      }
      if (tryCount === 0) return 40
      const goodRatio = (tryCount - silentCatch) / tryCount
      return Math.round(Math.max(goodRatio * 100, 20))
    }
    case 'API Design': {
      if (srcContents.length === 0) return 50
      let exports = 0
      let namedExports = 0
      let defaultExports = 0
      let manyParams = 0
      for (const c of srcContents) {
        namedExports += (c.match(/export\s+(?:function|class|const|type|interface)\s+\w+/g) ?? []).length
        defaultExports += (c.match(/export\s+default/g) ?? []).length
        const paramMatch = c.match(/function\s+\w+\(([^)]{50,})\)/g)
        if (paramMatch) manyParams += paramMatch.length
      }
      exports = namedExports + defaultExports
      if (exports === 0) return 40
      const namedRatio = namedExports / exports
      let score = Math.round(namedRatio * 70 + 30)
      score -= manyParams * 5
      return Math.max(Math.min(score, 100), 10)
    }
    case 'Architecture': {
      if (files.length === 0) return 50
      const hasSrc = files.some((f) => f.startsWith('src/'))
      const hasTest = files.some((f) => /\.(?:test|spec)\./.test(f))
      const hasConfig = files.some((f) => /tsconfig|package\.json/.test(f))
      let score = 30
      if (hasSrc) score += 25
      if (hasTest) score += 25
      if (hasConfig) score += 20
      return Math.min(score, 100)
    }
    case 'Code Freshness': {
      if (srcContents.length === 0) return 70
      let stale = 0
      for (const c of srcContents) {
        stale += (c.match(/\/\/\s*(?:TODO|FIXME|HACK|WORKAROUND|DEPRECATED)/gi) ?? []).length
      }
      return Math.max(Math.round(100 - stale * 5), 10)
    }
    default:
      return 50
  }
}

// ─── Teacher Comments ─────────────────────────────────────────────────────────

/**
 * Generate teacher comment for a subject score.
 *
 * @example
 * generateTeacherComment('Complexity Management', 85)
 */
export function generateTeacherComment(subjectName: string, score: number): string {
  if (score >= 90) return `Excellent work in ${subjectName}! This is well above average.`
  if (score >= 80) return `Good job in ${subjectName} with room for improvement in edge cases.`
  if (score >= 70) return `Satisfactory performance in ${subjectName}, but needs attention. Consider reviewing best practices.`
  if (score >= 60) return `Below expectations in ${subjectName}. Immediate action needed to raise standards.`
  return `Critical deficiency in ${subjectName}. This requires urgent attention and remediation.`
}

// ─── Strengths & Improvements ─────────────────────────────────────────────────

/**
 * Generate strengths for a subject.
 *
 * @example
 * generateStrengths('Test Coverage', 88)
 */
export function generateStrengths(subjectName: string, score: number): string[] {
  if (score >= 90) return [`Outstanding ${subjectName.toLowerCase()} practices`, `Could serve as a model for other projects`]
  if (score >= 75) return [`Solid foundation in ${subjectName.toLowerCase()}`, `Most core areas are well-covered`]
  if (score >= 60) return [`Basic ${subjectName.toLowerCase()} is present`, `Some good patterns to build on`]
  return [`Acknowledges ${subjectName.toLowerCase()} needs work`]
}

/**
 * Generate improvement suggestions for a subject.
 *
 * @example
 * generateImprovements('Test Coverage', 55)
 */
export function generateImprovements(subjectName: string, score: number): string[] {
  if (score >= 90) return [`Push for 100% — small improvements yield big returns`]
  if (score >= 75) return [`Address remaining gaps in ${subjectName.toLowerCase()}`, `Review edge cases and boundary conditions`]
  if (score >= 60) return [`Significant investment needed in ${subjectName.toLowerCase()}`, `Focus on high-impact areas first`]
  return [`Urgent: dedicate focused effort to ${subjectName.toLowerCase()}`, `Consider pairing with an experienced team member`]
}

// ─── Honors & Warnings ────────────────────────────────────────────────────────

/**
 * Compute honors list (subjects with A or above).
 *
 * @example
 * computeHonors(subjects)
 */
export function computeHonors(subjects: Subject[]): string[] {
  return subjects
    .filter((s) => s.grade === 'A' || s.grade === 'A+')
    .map((s) => `Dean's List: ${s.name}`)
}

/**
 * Compute warnings (subjects with D or below).
 *
 * @example
 * computeWarnings(subjects)
 */
export function computeWarnings(subjects: Subject[]): string[] {
  return subjects
    .filter((s) => s.grade === 'D' || s.grade === 'F')
    .map((s) => `Academic Probation: ${s.name}`)
}

// ─── Summary ──────────────────────────────────────────────────────────────────

/**
 * Generate overall teacher summary comment.
 *
 * @example
 * generateSummary(card)
 */
export function generateSummary(card: ReportCard): string {
  const gpa = card.gpa
  if (gpa >= 3.7) return 'Outstanding student! This project demonstrates excellent coding practices across the board. Keep up the great work!'
  if (gpa >= 3.0) return 'Good student with solid fundamentals. A few areas need attention to reach excellence. Overall, a commendable effort!'
  if (gpa >= 2.0) return 'Average performance with room for growth. Several subjects need focused improvement. With dedication, significant progress is achievable.'
  if (gpa >= 1.0) return 'Below-average performance. Multiple subjects require urgent attention. Recommend a structured improvement plan with clear milestones.'
  return 'Critical: This project needs significant intervention across multiple dimensions. Recommend immediate remediation with dedicated resources.'
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations from report card.
 *
 * @example
 * generateRecommendations(card, stats)
 */
export function generateRecommendations(card: ReportCard, stats: ReportCardStats): string[] {
  const recs: string[] = []
  if (stats.subjectsBelow50 > 0) {
    recs.push(`${stats.subjectsBelow50} subject(s) scored below 50 — prioritize these for immediate improvement`)
  }
  const lowSubjects = card.subjects.filter((s) => s.score < 70)
  for (const s of lowSubjects.slice(0, 3)) {
    recs.push(`Focus on ${s.name} (score: ${s.score}) — ${s.improvements[0] ?? 'needs improvement'}`)
  }
  if (card.gpa < 2.0) {
    recs.push('Overall GPA is below 2.0 — consider a comprehensive code quality initiative')
  }
  if (recs.length === 0) {
    recs.push('All subjects are performing well — maintain current standards and aim for excellence')
  }
  return recs
}

// ─── buildReportCardResult ────────────────────────────────────────────────────

const SUBJECT_NAMES = [
  'Complexity Management',
  'Documentation Quality',
  'Test Coverage',
  'Code Security',
  'Performance Health',
  'Maintainability',
  'Dependency Management',
  'Style Consistency',
  'Error Handling',
  'API Design',
  'Architecture',
  'Code Freshness',
]

/**
 * Build the complete report card result.
 *
 * @example
 * buildReportCardResult(['index.ts'], ['export {}'])
 */
export function buildReportCardResult(
  files: string[],
  contents: string[],
  options?: ReportCardOptions,
): ReportCardResult {
  const subjects: Subject[] = SUBJECT_NAMES.map((name) => {
    const score = computeSubjectScore(name, files, contents)
    const grade = scoreToGrade(score)
    return {
      name,
      grade,
      score,
      icon: SUBJECT_ICONS[name] ?? '📋',
      teacherComment: generateTeacherComment(name, score),
      strengths: generateStrengths(name, score),
      improvements: generateImprovements(name, score),
      trend: 'stable' as Trend,
    }
  })

  const overallScore = subjects.length > 0
    ? Math.round(subjects.reduce((s, sub) => s + sub.score, 0) / subjects.length)
    : 0
  const overallGrade = scoreToGrade(overallScore)
  const gpa = subjects.length > 0
    ? Math.round(subjects.reduce((s, sub) => s + gradeToGPA(sub.grade), 0) / subjects.length * 100) / 100
    : 0

  const card: ReportCard = {
    studentName: options?.projectName ?? 'CodeForge Project',
    date: new Date().toISOString().split('T')[0] ?? '',
    subjects,
    overallGrade,
    overallScore,
    gpa,
    honors: computeHonors(subjects),
    warnings: computeWarnings(subjects),
    summary: '',
  }
  card.summary = generateSummary(card)

  const stats: ReportCardStats = {
    totalSubjects: subjects.length,
    averageScore: overallScore,
    subjectsAbove80: subjects.filter((s) => s.score >= 80).length,
    subjectsBelow50: subjects.filter((s) => s.score < 50).length,
    highestSubject: subjects.reduce((best, s) => s.score > best.score ? s : best, subjects[0])?.name ?? '',
    lowestSubject: subjects.reduce((worst, s) => s.score < worst.score ? s : worst, subjects[0])?.name ?? '',
  }

  const recommendations = generateRecommendations(card, stats)

  return { card, stats, recommendations }
}
