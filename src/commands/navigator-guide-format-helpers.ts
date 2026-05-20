import chalk from 'chalk'
import type { NavigatorGuideResult, GuideSection, Attraction, TourRoute, ConstructionZone, OnboardingScore, NavigatorGuideStats } from './navigator-guide-helpers.js'

// ─── Color Utilities ──────────────────────────────────────────────────────────

function difficultyColor(d: string): string {
  if (d === 'easy') return chalk.green(d)
  if (d === 'moderate') return chalk.yellow(d)
  if (d === 'challenging') return chalk.rgb(255, 165, 0)(d)
  return chalk.red(d)
}

function typeColor(t: string): string {
  if (t === 'must-see') return chalk.green(t)
  if (t === 'recommended') return chalk.blue(t)
  if (t === 'optional') return chalk.gray(t)
  if (t === 'skip') return chalk.dim(t)
  return chalk.yellow(t)
}

function severityColor(s: string): string {
  if (s === 'minor') return chalk.green(s)
  if (s === 'moderate') return chalk.yellow(s)
  return chalk.red(s)
}

function gradeColor(g: string): string {
  if (g === 'exceptional') return chalk.green(g)
  if (g === 'excellent') return chalk.blue(g)
  if (g === 'good') return chalk.cyan(g)
  if (g === 'fair') return chalk.yellow(g)
  if (g === 'poor') return chalk.rgb(255, 165, 0)(g)
  return chalk.red(g)
}

function ratingStars(r: string): string {
  const map: Record<string, number> = { 'five-stars': 5, 'four-stars': 4, 'three-stars': 3, 'two-stars': 2, 'one-star': 1 }
  const n = map[r] ?? 0
  return chalk.yellow('★'.repeat(n)) + chalk.dim('★'.repeat(5 - n))
}

// ─── Section Formatting ───────────────────────────────────────────────────────

function formatSections(sections: GuideSection[]): string {
  if (sections.length === 0) return chalk.dim('  No guide sections found.')
  return sections.map((s, i) => {
    const req = s.isRequired ? chalk.green(' [required]') : ''
    const prereqs = s.prerequisites.length > 0 ? chalk.dim(` (prereqs: ${s.prerequisites.join(', ')})`) : ''
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(s.title)}${req}`,
      `     ${chalk.dim(s.description)}`,
      `     Difficulty: ${difficultyColor(s.difficulty)} | Reading: ${chalk.cyan(s.readingTime)} | Files: ${chalk.white(String(s.files.length))}${prereqs}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Attraction Formatting ────────────────────────────────────────────────────

function formatAttractions(attractions: Attraction[]): string {
  if (attractions.length === 0) return chalk.dim('  No attractions found.')
  return attractions.slice(0, 15).map((a, i) => {
    const sig = chalk.dim(`(${a.significance})`)
    const warns = a.warnings.length > 0 ? chalk.yellow(` ⚠ ${a.warnings.join('; ')}`) : ''
    const highlights = a.highlights.length > 0 ? chalk.dim(` • ${a.highlights.join(', ')}`) : ''
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(a.name)} ${typeColor(a.type)} ${sig}`,
      `     ${chalk.dim(a.category)} | ${chalk.cyan(a.visitDuration)}${highlights}${warns}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Route Formatting ─────────────────────────────────────────────────────────

function formatRoutes(routes: TourRoute[]): string {
  if (routes.length === 0) return chalk.dim('  No tour routes available.')
  return routes.map((r, i) => {
    const self = r.isSelfGuided ? chalk.dim(' (self-guided)') : ''
    const stops = r.stops.slice(0, 5).map(s =>
      `     ${chalk.dim(`#${s.order}`)} ${chalk.bold(s.attraction)} — ${chalk.cyan(s.action)} (${s.timeToSpend})`,
    ).join('\n')
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(r.name)}${self}`,
      `     ${chalk.dim(r.description)}`,
      `     Difficulty: ${difficultyColor(r.difficulty)} | Time: ${chalk.cyan(r.estimatedTime)} | Rating: ${chalk.white(String(r.rating))}`,
      stops,
    ].join('\n')
  }).join('\n\n')
}

// ─── Construction Zone Formatting ──────────────────────────────────────────────

function formatConstructionZones(zones: ConstructionZone[]): string {
  if (zones.length === 0) return chalk.dim('  No construction zones detected.')
  return zones.map((z, i) => {
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(z.area)} — ${severityColor(z.severity)} ${chalk.dim(`(${z.type})`)}`,
      `     ${chalk.dim(z.description)}`,
      `     Alternative: ${chalk.cyan(z.alternative)}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Onboarding Score Formatting ───────────────────────────────────────────────

function formatOnboarding(onboarding: OnboardingScore): string {
  const bar = (v: number) => {
    const filled = Math.round(v / 5)
    return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(20 - filled))
  }
  return [
    `  Overall: ${gradeColor(onboarding.grade)} ${chalk.bold(String(onboarding.overall))}/100`,
    `  Documentation:    ${bar(onboarding.documentation)} ${chalk.white(String(onboarding.documentation))}`,
    `  Structure:        ${bar(onboarding.structure)} ${chalk.white(String(onboarding.structure))}`,
    `  Naming:           ${bar(onboarding.naming)} ${chalk.white(String(onboarding.naming))}`,
    `  Complexity:       ${bar(onboarding.complexity)} ${chalk.white(String(onboarding.complexity))}`,
    `  Entry Clarity:    ${bar(onboarding.entryClarity)} ${chalk.white(String(onboarding.entryClarity))}`,
  ].join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

function formatStats(stats: NavigatorGuideStats): string {
  return [
    `  Sections: ${chalk.white(String(stats.totalSections))} | Attractions: ${chalk.white(String(stats.totalAttractions))} (${chalk.green(String(stats.mustSeeCount))} must-see)`,
    `  Routes: ${chalk.white(String(stats.totalRoutes))} (${chalk.cyan(String(stats.beginnerRoutes))} beginner) | Construction: ${chalk.yellow(String(stats.constructionZones))} (${chalk.red(String(stats.majorConstructionZones))} major)`,
    `  Onboarding: ${chalk.cyan(stats.estimatedOnboardingTime)} | Completeness: ${chalk.white(String(stats.guideCompleteness))}% | Accessibility: ${chalk.white(String(stats.overallAccessibility))}%`,
    `  Rating: ${ratingStars(stats.guideRating)} | Recommended: ${chalk.bold(stats.recommendedTour)}`,
  ].join('\n')
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format navigator guide result as a table
 * @example
 * formatNavigatorGuideTable(result) // string
 */
export function formatNavigatorGuideTable(result: NavigatorGuideResult): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n📖 Navigator Guide\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')
  lines.push(chalk.bold('📋 Guide Sections'))
  lines.push(formatSections(result.sections))
  lines.push('')
  lines.push(chalk.bold('🎯 Attractions'))
  lines.push(formatAttractions(result.attractions))
  lines.push('')
  lines.push(chalk.bold('🗺️  Tour Routes'))
  lines.push(formatRoutes(result.routes))
  lines.push('')
  lines.push(chalk.bold('🚧 Construction Zones'))
  lines.push(formatConstructionZones(result.constructionZones))
  lines.push('')
  lines.push(chalk.bold('📊 Onboarding Score'))
  lines.push(formatOnboarding(result.onboarding))
  lines.push('')
  lines.push(chalk.bold('📈 Stats'))
  lines.push(formatStats(result.stats))
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    result.recommendations.forEach(r => lines.push(`  • ${r}`))
  }
  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ───────────────────────────────────────────────────────────

/**
 * Format navigator guide result as JSON
 * @example
 * formatNavigatorGuideJson(result) // string
 */
export function formatNavigatorGuideJson(result: NavigatorGuideResult): string {
  return JSON.stringify(result, null, 2)
}
