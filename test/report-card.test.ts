import { describe, expect, it } from 'vitest'

import {
  buildReportCardResult,
  computeHonors,
  computeWarnings,
  computeSubjectScore,
  generateImprovements,
  generateStrengths,
  generateSummary,
  generateTeacherComment,
  gradeToGPA,
  scoreToGrade,
  type Subject,
  type ReportCard,
  type ReportCardStats,
} from '../src/commands/report-card-helpers.js'

import {
  formatGrade,
  formatGPA,
  formatHonors,
  formatReportCardJSON,
  formatReportCardTable,
  formatScoreBar,
  formatStatsSummary,
  formatSubjectRow,
  formatWarnings,
  formatRecommendations,
} from '../src/commands/report-card-format-helpers.js'

// ─── scoreToGrade ─────────────────────────────────────────────────────────────

describe('scoreToGrade', () => {
  it('returns A+ for 95+', () => { expect(scoreToGrade(95)).toBe('A+') })
  it('returns A+ for 100', () => { expect(scoreToGrade(100)).toBe('A+') })
  it('returns A for 90-94', () => { expect(scoreToGrade(92)).toBe('A') })
  it('returns B+ for 85-89', () => { expect(scoreToGrade(87)).toBe('B+') })
  it('returns B for 80-84', () => { expect(scoreToGrade(82)).toBe('B') })
  it('returns C+ for 75-79', () => { expect(scoreToGrade(76)).toBe('C+') })
  it('returns C for 70-74', () => { expect(scoreToGrade(72)).toBe('C') })
  it('returns D for 60-69', () => { expect(scoreToGrade(65)).toBe('D') })
  it('returns F for <60', () => { expect(scoreToGrade(50)).toBe('F') })
  it('returns F for 0', () => { expect(scoreToGrade(0)).toBe('F') })
})

// ─── gradeToGPA ───────────────────────────────────────────────────────────────

describe('gradeToGPA', () => {
  it('returns 4.0 for A+', () => { expect(gradeToGPA('A+')).toBe(4.0) })
  it('returns 4.0 for A', () => { expect(gradeToGPA('A')).toBe(4.0) })
  it('returns 3.5 for B+', () => { expect(gradeToGPA('B+')).toBe(3.5) })
  it('returns 3.0 for B', () => { expect(gradeToGPA('B')).toBe(3.0) })
  it('returns 2.5 for C+', () => { expect(gradeToGPA('C+')).toBe(2.5) })
  it('returns 2.0 for C', () => { expect(gradeToGPA('C')).toBe(2.0) })
  it('returns 1.0 for D', () => { expect(gradeToGPA('D')).toBe(1.0) })
  it('returns 0 for F', () => { expect(gradeToGPA('F')).toBe(0) })
})

// ─── computeSubjectScore ──────────────────────────────────────────────────────

describe('computeSubjectScore', () => {
  const files = ['index.ts', 'core.ts', 'core.test.ts', 'tsconfig.json']
  const contents = [
    '/** Main entry */\nimport { core } from "./core"\nexport function main() { core() }',
    '/** Core module */\nexport function core() { return 42 }\n// TODO: refactor',
    "import { core } from './core'\nimport { expect } from 'vitest'\nexpect(core()).toBe(42)",
    '{"compilerOptions": {}}',
  ]

  it('scores Complexity Management', () => {
    const score = computeSubjectScore('Complexity Management', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('scores Documentation Quality', () => {
    const score = computeSubjectScore('Documentation Quality', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('scores Test Coverage', () => {
    const score = computeSubjectScore('Test Coverage', files, contents)
    expect(score).toBeGreaterThan(0)
  })

  it('scores Code Security', () => {
    const score = computeSubjectScore('Code Security', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('scores Performance Health', () => {
    const score = computeSubjectScore('Performance Health', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('scores Maintainability', () => {
    const score = computeSubjectScore('Maintainability', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('scores Dependency Management', () => {
    const score = computeSubjectScore('Dependency Management', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('scores Style Consistency', () => {
    const score = computeSubjectScore('Style Consistency', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('scores Error Handling', () => {
    const score = computeSubjectScore('Error Handling', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('scores API Design', () => {
    const score = computeSubjectScore('API Design', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('scores Architecture', () => {
    const score = computeSubjectScore('Architecture', files, contents)
    expect(score).toBeGreaterThan(0)
  })

  it('scores Code Freshness', () => {
    const score = computeSubjectScore('Code Freshness', files, contents)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('returns 50 for unknown subject', () => {
    expect(computeSubjectScore('Unknown', files, contents)).toBe(50)
  })

  it('penalizes eval in Code Security', () => {
    const score = computeSubjectScore('Code Security', ['a.ts'], ['eval("code")'])
    expect(score).toBeLessThan(80)
  })

  it('penalizes TODOs in Code Freshness', () => {
    const score = computeSubjectScore('Code Freshness', ['a.ts'], ['// TODO: fix this\n// FIXME: broken\n// HACK: temp'])
    expect(score).toBeLessThan(90)
  })

  it('penalizes performance anti-patterns', () => {
    const score = computeSubjectScore('Performance Health', ['a.ts'], ['for (const x of arr) { await fetch(x) }'])
    expect(score).toBeLessThan(90)
  })

  it('returns default for empty source files', () => {
    const score = computeSubjectScore('Complexity Management', [], [])
    expect(score).toBe(50)
  })
})

// ─── generateTeacherComment ───────────────────────────────────────────────────

describe('generateTeacherComment', () => {
  it('praises A-range scores', () => {
    const comment = generateTeacherComment('Testing', 92)
    expect(comment).toContain('Excellent')
  })

  it('encourages B-range scores', () => {
    const comment = generateTeacherComment('Testing', 85)
    expect(comment).toContain('Good job')
  })

  it('notes C-range scores', () => {
    const comment = generateTeacherComment('Testing', 72)
    expect(comment).toContain('Satisfactory')
  })

  it('warns D-range scores', () => {
    const comment = generateTeacherComment('Testing', 65)
    expect(comment).toContain('Below expectations')
  })

  it('critical F-range scores', () => {
    const comment = generateTeacherComment('Testing', 40)
    expect(comment).toContain('Critical deficiency')
  })

  it('includes subject name', () => {
    const comment = generateTeacherComment('Complexity Management', 80)
    expect(comment).toContain('Complexity Management')
  })
})

// ─── generateStrengths ────────────────────────────────────────────────────────

describe('generateStrengths', () => {
  it('returns 2 strengths for A-range', () => {
    const strengths = generateStrengths('Testing', 95)
    expect(strengths).toHaveLength(2)
    expect(strengths[0]).toContain('Outstanding')
  })

  it('returns solid foundation for B-range', () => {
    const strengths = generateStrengths('Testing', 80)
    expect(strengths.some((s) => s.includes('Solid foundation'))).toBe(true)
  })

  it('returns basic for C-range', () => {
    const strengths = generateStrengths('Testing', 70)
    expect(strengths.some((s) => s.includes('Basic'))).toBe(true)
  })

  it('returns acknowledges for low scores', () => {
    const strengths = generateStrengths('Testing', 40)
    expect(strengths.some((s) => s.includes('Acknowledges'))).toBe(true)
  })
})

// ─── generateImprovements ─────────────────────────────────────────────────────

describe('generateImprovements', () => {
  it('suggests pushing for 100 at A-range', () => {
    const imps = generateImprovements('Testing', 95)
    expect(imps[0]).toContain('100')
  })

  it('suggests addressing gaps at B-range', () => {
    const imps = generateImprovements('Testing', 80)
    expect(imps.some((i) => i.includes('gaps'))).toBe(true)
  })

  it('suggests investment at C-range', () => {
    const imps = generateImprovements('Testing', 70)
    expect(imps.some((i) => i.includes('investment'))).toBe(true)
  })

  it('suggests urgent action at low scores', () => {
    const imps = generateImprovements('Testing', 40)
    expect(imps.some((i) => i.includes('Urgent'))).toBe(true)
  })
})

// ─── computeHonors ────────────────────────────────────────────────────────────

describe('computeHonors', () => {
  const makeSubject = (name: string, grade: string): Subject => ({
    name, grade: grade as Subject['grade'], score: 90, icon: '📋',
    teacherComment: '', strengths: [], improvements: [], trend: 'stable',
  })

  it('lists A and A+ subjects', () => {
    const honors = computeHonors([makeSubject('Docs', 'A+'), makeSubject('Tests', 'B'), makeSubject('Security', 'A')])
    expect(honors).toHaveLength(2)
    expect(honors[0]).toContain('Docs')
    expect(honors[1]).toContain('Security')
  })

  it('returns empty for no A grades', () => {
    const honors = computeHonors([makeSubject('Tests', 'C'), makeSubject('Docs', 'B')])
    expect(honors).toHaveLength(0)
  })
})

// ─── computeWarnings ──────────────────────────────────────────────────────────

describe('computeWarnings', () => {
  const makeSubject = (name: string, grade: string): Subject => ({
    name, grade: grade as Subject['grade'], score: 50, icon: '📋',
    teacherComment: '', strengths: [], improvements: [], trend: 'stable',
  })

  it('lists D and F subjects', () => {
    const warnings = computeWarnings([makeSubject('Tests', 'F'), makeSubject('Docs', 'A'), makeSubject('Security', 'D')])
    expect(warnings).toHaveLength(2)
  })

  it('returns empty for no D/F grades', () => {
    const warnings = computeWarnings([makeSubject('Tests', 'B'), makeSubject('Docs', 'A')])
    expect(warnings).toHaveLength(0)
  })
})

// ─── generateSummary ──────────────────────────────────────────────────────────

describe('generateSummary', () => {
  const makeCard = (gpa: number): ReportCard => ({
    studentName: 'Test', date: '2024-01-01', subjects: [], overallGrade: 'B',
    overallScore: 80, gpa, honors: [], warnings: [], summary: '',
  })

  it('praises high GPA', () => {
    const summary = generateSummary(makeCard(3.8))
    expect(summary).toContain('Outstanding')
  })

  it('commends good GPA', () => {
    const summary = generateSummary(makeCard(3.2))
    expect(summary).toContain('Good')
  })

  it('notes average GPA', () => {
    const summary = generateSummary(makeCard(2.3))
    expect(summary).toContain('Average')
  })

  it('warns below average GPA', () => {
    const summary = generateSummary(makeCard(1.2))
    expect(summary).toContain('Below-average')
  })

  it('critical for very low GPA', () => {
    const summary = generateSummary(makeCard(0.5))
    expect(summary).toContain('Critical')
  })
})

// ─── buildReportCardResult ────────────────────────────────────────────────────

describe('buildReportCardResult', () => {
  it('builds complete result with 12 subjects', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    expect(result.card.subjects).toHaveLength(12)
  })

  it('sets student name from options', () => {
    const result = buildReportCardResult(['index.ts'], [''], { projectName: 'MyApp' })
    expect(result.card.studentName).toBe('MyApp')
  })

  it('sets date', () => {
    const result = buildReportCardResult(['index.ts'], [''])
    expect(result.card.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('computes overall grade', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    expect(result.card.overallGrade).toBeTruthy()
    expect(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']).toContain(result.card.overallGrade)
  })

  it('computes GPA', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    expect(result.card.gpa).toBeGreaterThanOrEqual(0)
    expect(result.card.gpa).toBeLessThanOrEqual(4.0)
  })

  it('computes honors', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    expect(result.card.honors).toBeDefined()
  })

  it('computes warnings', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    expect(result.card.warnings).toBeDefined()
  })

  it('generates summary', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    expect(result.card.summary).toBeTruthy()
  })

  it('computes stats correctly', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    expect(result.stats.totalSubjects).toBe(12)
    expect(result.stats.averageScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.highestSubject).toBeTruthy()
    expect(result.stats.lowestSubject).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty files', () => {
    const result = buildReportCardResult([], [])
    expect(result.card.subjects).toHaveLength(12)
    expect(result.stats.totalSubjects).toBe(12)
  })

  it('each subject has required fields', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    for (const sub of result.card.subjects) {
      expect(sub.name).toBeTruthy()
      expect(sub.grade).toBeTruthy()
      expect(sub.score).toBeGreaterThanOrEqual(0)
      expect(sub.icon).toBeTruthy()
      expect(sub.teacherComment).toBeTruthy()
      expect(sub.strengths.length).toBeGreaterThan(0)
      expect(sub.improvements.length).toBeGreaterThan(0)
      expect(sub.trend).toBeTruthy()
    }
  })
})

// ─── formatGrade ──────────────────────────────────────────────────────────────

describe('formatGrade', () => {
  it('formats A+', () => { expect(formatGrade('A+')).toContain('A+') })
  it('formats F', () => { expect(formatGrade('F')).toContain('F') })
  it('pads grade', () => { expect(formatGrade('A').length).toBeGreaterThanOrEqual(2) })
})

// ─── formatGPA ────────────────────────────────────────────────────────────────

describe('formatGPA', () => {
  it('formats GPA', () => { expect(formatGPA(3.5)).toContain('3.50') })
  it('formats 0 GPA', () => { expect(formatGPA(0)).toContain('0.00') })
})

// ─── formatScoreBar ───────────────────────────────────────────────────────────

describe('formatScoreBar', () => {
  it('renders bar', () => {
    expect(formatScoreBar(50)).toContain('█')
    expect(formatScoreBar(50)).toContain('░')
  })
  it('renders full bar', () => { expect(formatScoreBar(100)).toContain('█'.repeat(20)) })
  it('renders empty bar', () => { expect(formatScoreBar(0)).toContain('░'.repeat(20)) })
})

// ─── formatSubjectRow ─────────────────────────────────────────────────────────

describe('formatSubjectRow', () => {
  it('formats subject row', () => {
    const subject: Subject = {
      name: 'Test Coverage', grade: 'B+', score: 85, icon: '🧪',
      teacherComment: '', strengths: [], improvements: [], trend: 'stable',
    }
    const row = formatSubjectRow(subject)
    expect(row).toContain('Test Coverage')
    expect(row).toContain('B+')
    expect(row).toContain('85')
  })
})

// ─── formatHonors ─────────────────────────────────────────────────────────────

describe('formatHonors', () => {
  it('formats honors', () => {
    const formatted = formatHonors(["Dean's List: Documentation"])
    expect(formatted).toContain('Honors')
    expect(formatted).toContain('Documentation')
  })

  it('shows message for no honors', () => {
    expect(formatHonors([])).toContain('No honors')
  })
})

// ─── formatWarnings ───────────────────────────────────────────────────────────

describe('formatWarnings', () => {
  it('formats warnings', () => {
    const formatted = formatWarnings(['Academic Probation: Testing'])
    expect(formatted).toContain('Warnings')
    expect(formatted).toContain('Testing')
  })

  it('shows message for no warnings', () => {
    expect(formatWarnings([])).toContain('No warnings')
  })
})

// ─── formatStatsSummary ───────────────────────────────────────────────────────

describe('formatStatsSummary', () => {
  it('formats stats', () => {
    const stats: ReportCardStats = {
      totalSubjects: 12, averageScore: 75, subjectsAbove80: 5, subjectsBelow50: 1,
      highestSubject: 'Docs', lowestSubject: 'Tests',
    }
    const summary = formatStatsSummary(stats)
    expect(summary).toContain('12')
    expect(summary).toContain('75')
    expect(summary).toContain('Docs')
    expect(summary).toContain('Tests')
  })
})

// ─── formatRecommendations ────────────────────────────────────────────────────

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const recs = formatRecommendations(['Fix tests', 'Improve docs'])
    expect(recs).toContain('Fix tests')
    expect(recs).toContain('Improve docs')
  })

  it('shows message for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatReportCardTable ────────────────────────────────────────────────────

describe('formatReportCardTable', () => {
  it('formats full report card', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    const table = formatReportCardTable(result)
    expect(table).toContain('REPORT CARD')
    expect(table).toContain('GPA')
    expect(table).toContain('Teacher Summary')
    expect(table).toContain('Statistics')
    expect(table).toContain('Recommendations')
  })
})

// ─── formatReportCardJSON ─────────────────────────────────────────────────────

describe('formatReportCardJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildReportCardResult(['index.ts'], ['export function main() {}'])
    const json = formatReportCardJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.card).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
    expect(parsed.card.subjects).toHaveLength(12)
  })
})
