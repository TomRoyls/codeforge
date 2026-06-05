// ─── Types ────────────────────────────────────────────────────────────────────

export interface Season {
  name: string
  months: number[]
  commitCount: number
  avgChangesPerCommit: number
  dominantAction: 'feature' | 'fix' | 'refactor' | 'test' | 'docs' | 'chore'
  characteristics: string[]
}

export interface Rhythm {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  peakDay: number
  peakHour: number
  consistency: number
  description: string
}

export interface Prediction {
  category: string
  confidence: number
  prediction: string
  basedOn: string
}

export interface AlmanacStats {
  totalCommits: number
  commitsByDayOfWeek: number[]
  commitsByHour: number[]
  commitsByMonth: number[]
  mostActiveDay: string
  mostActiveHour: string
  mostActiveMonth: string
  avgCommitsPerDay: number
  busiestSeason: string
  quietestSeason: string
}

export interface AlmanacResult {
  seasons: Season[]
  rhythms: Rhythm[]
  predictions: Prediction[]
  stats: AlmanacStats
  recommendations: string[]
}

export interface AlmanacOptions {
  verbose?: boolean
}

export interface LogEntry {
  hash: string
  date: string
  message: string
  insertions: number
  deletions: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export { DAY_NAMES, MONTH_NAMES }

// ─── Log Parsing ──────────────────────────────────────────────────────────────

/**
 * Parse raw git log into structured entries.
 *
 * @example
 * parseAlmanacLog(gitOutput)
 */
export function parseAlmanacLog(raw: string): LogEntry[] {
  if (!raw.trim()) return []

  const lines = raw.trim().split('\n')
  const entries: LogEntry[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const parts = trimmed.split('|')
    if (parts.length < 5) continue

    entries.push({
      hash: parts[0]!.trim(),
      date: (parts[1] ?? '').trim(),
      message: parts[2]!.trim(),
      insertions: parseInt(parts[3]!.trim(), 10) || 0,
      deletions: parseInt(parts[4]!.trim(), 10) || 0,
    })
  }

  return entries
}

// ─── Commit Timing ────────────────────────────────────────────────────────────

/**
 * Analyze commit timing distributions.
 *
 * @example
 * analyzeCommitTiming(entries)
 */
export function analyzeCommitTiming(entries: LogEntry[]): {
  commitsByDayOfWeek: number[]
  commitsByHour: number[]
  commitsByMonth: number[]
  totalCommits: number
} {
  const byDay = new Array(7).fill(0) as number[]
  const byHour = new Array(24).fill(0) as number[]
  const byMonth = new Array(12).fill(0) as number[]

  for (const entry of entries) {
    const d = new Date(entry.date)
    if (isNaN(d.getTime())) continue

    byDay[d.getDay()]!++
    byHour[d.getHours()]!++
    byMonth[d.getMonth()]!++
  }

  return {
    commitsByDayOfWeek: byDay,
    commitsByHour: byHour,
    commitsByMonth: byMonth,
    totalCommits: entries.length,
  }
}

// ─── Commit Classification ────────────────────────────────────────────────────

/**
 * Classify commit message into an action category.
 *
 * @example
 * classifyCommitAction('feat: add login')
 */
export function classifyCommitAction(message: string): Season['dominantAction'] {
  const lower = message.toLowerCase()

  if (lower.includes('refactor') || lower.includes('migrate') || lower.includes('restructure')) return 'refactor'
  if (lower.includes('test') || lower.includes('spec') || lower.includes('coverage')) return 'test'
  if (lower.includes('docs') || lower.includes('readme') || lower.includes('documentation')) return 'docs'
  if (lower.startsWith('feat') || lower.includes('feature') || lower.includes('add ')) return 'feature'
  if (lower.startsWith('fix') || lower.includes('bug') || lower.includes('patch')) return 'fix'
  return 'chore'
}

// ─── Season Detection ─────────────────────────────────────────────────────────

/**
 * Detect development seasons from monthly commit data.
 *
 * @example
 * detectSeasons(monthlyCommits, entries)
 */
export function detectSeasons(
  monthlyCommits: number[],
  entries: LogEntry[],
): Season[] {
  const seasons: Season[] = []

  // Group consecutive months with similar activity levels
  const avg = monthlyCommits.reduce((s, c) => s + c, 0) / 12
  const threshold = Math.max(avg, 1)

  const segments = groupMonthSegments(monthlyCommits, threshold)

  for (const segment of segments) {
    const months = segment.months
    const commitCount = months.reduce((s, m) => s + monthlyCommits[m]!, 0)
    const segmentEntries = entries.filter((e) => {
      const d = new Date(e.date)
      return !isNaN(d.getTime()) && months.includes(d.getMonth())
    })

    const avgChanges = segmentEntries.length > 0
      ? Math.round(segmentEntries.reduce((s, e) => s + e.insertions + e.deletions, 0) / segmentEntries.length)
      : 0

    const actionCounts: Record<string, number> = {}
    for (const e of segmentEntries) {
      const action = classifyCommitAction(e.message)
      actionCounts[action] = (actionCounts[action] ?? 0) + 1
    }
    const dominantAction = (Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'chore') as Season['dominantAction']

    const characteristics = buildSeasonCharacteristics(segment.type, months, commitCount, avg)

    seasons.push({
      name: segment.name,
      months,
      commitCount,
      avgChangesPerCommit: avgChanges,
      dominantAction,
      characteristics,
    })
  }

  return seasons
}

interface MonthSegment {
  months: number[]
  type: 'harvest' | 'fallow' | 'planting' | 'storage'
  name: string
}

/**
 * Group months into activity segments.
 *
 * @example
 * groupMonthSegments(commitsByMonth, threshold)
 */
export function groupMonthSegments(monthlyCommits: number[], threshold: number): MonthSegment[] {
  const segments: MonthSegment[] = []
  let currentMonths: number[] = []
  let currentType: 'harvest' | 'fallow' | 'planting' | 'storage' | null = null

  for (let m = 0; m < 12; m++) {
    const count = monthlyCommits[m] ?? 0
    const prevCount = m > 0 ? (monthlyCommits[m - 1] ?? 0) : count
    const type = classifyMonthActivity(count, prevCount, threshold)

    if (type !== currentType || currentType === null) {
      if (currentMonths.length > 0 && currentType !== null) {
        segments.push(buildSegment(currentMonths, currentType, monthlyCommits))
      }
      currentMonths = [m]
      currentType = type
    } else {
      currentMonths.push(m)
    }
  }

  if (currentMonths.length > 0 && currentType !== null) {
    segments.push(buildSegment(currentMonths, currentType, monthlyCommits))
  }

  return segments.length > 0 ? segments : [{ months: [0], type: 'fallow' as const, name: 'Fallow Season' }]
}

/**
 * Classify a single month's activity level.
 *
 * @example
 * classifyMonthActivity(count, prevCount, threshold)
 */
export function classifyMonthActivity(
  count: number,
  prevCount: number,
  threshold: number,
): 'harvest' | 'fallow' | 'planting' | 'storage' {
  if (count >= threshold * 1.5) return 'harvest'
  if (count < threshold * 0.5) return 'fallow'
  if (count > prevCount) return 'planting'
  return 'storage'
}

/**
 * Build a segment from months and type.
 *
 * @example
 * buildSegment([0, 1, 2], 'harvest', commits)
 */
export function buildSegment(
  months: number[],
  type: MonthSegment['type'],
  _monthlyCommits: number[],
): MonthSegment {
  const names: Record<MonthSegment['type'], string> = {
    harvest: 'Harvest Season',
    fallow: 'Fallow Season',
    planting: 'Planting Season',
    storage: 'Storage Season',
  }

  // Add seasonal prefix based on calendar position
  const midMonth = months[Math.floor(months.length / 2)] ?? 0
  const seasonalPrefix = getSeasonalPrefix(midMonth)

  return {
    months,
    type,
    name: `${seasonalPrefix} ${names[type]}`,
  }
}

/**
 * Get seasonal prefix from month index.
 *
 * @example
 * getSeasonalPrefix(0)
 */
export function getSeasonalPrefix(month: number): string {
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Autumn'
  return 'Winter'
}

/**
 * Build season characteristics list.
 *
 * @example
 * buildSeasonCharacteristics('harvest', [3, 4], 50, 20)
 */
export function buildSeasonCharacteristics(
  type: MonthSegment['type'],
  months: number[],
  commitCount: number,
  avg: number,
): string[] {
  const chars: string[] = []

  if (type === 'harvest') {
    chars.push('High development activity')
    chars.push(`${Math.round(commitCount / months.length)} commits/month`)
  } else if (type === 'fallow') {
    chars.push('Low development activity')
    chars.push('Good time for planning')
  } else if (type === 'planting') {
    chars.push('Growing activity')
    chars.push('New features likely being started')
  } else {
    chars.push('Declining activity')
    chars.push('Stabilization period')
  }

  if (commitCount > avg * 2) chars.push('Peak development period')
  if (commitCount < avg * 0.3) chars.push('Near-dormant period')

  return chars
}

// ─── Rhythm Detection ─────────────────────────────────────────────────────────

/**
 * Detect development rhythms from timing data.
 *
 * @example
 * detectRhythms(timing)
 */
export function detectRhythms(timing: {
  commitsByDayOfWeek: number[]
  commitsByHour: number[]
  commitsByMonth: number[]
  totalCommits: number
}): Rhythm[] {
  const rhythms: Rhythm[] = []

  // Weekly rhythm
  const maxDay = Math.max(...timing.commitsByDayOfWeek)
  if (maxDay > 0) {
    const peakDayIdx = timing.commitsByDayOfWeek.indexOf(maxDay)
    const consistency = computeConsistency(timing.commitsByDayOfWeek)
    rhythms.push({
      type: 'weekly',
      peakDay: peakDayIdx,
      peakHour: 0,
      consistency,
      description: `${DAY_NAMES[peakDayIdx]} is the most active day with ${maxDay} commits`,
    })
  }

  // Daily rhythm
  const maxHour = Math.max(...timing.commitsByHour)
  if (maxHour > 0) {
    const peakHourIdx = timing.commitsByHour.indexOf(maxHour)
    const consistency = computeConsistency(timing.commitsByHour.filter((h) => h > 0))
    rhythms.push({
      type: 'daily',
      peakDay: 0,
      peakHour: peakHourIdx,
      consistency,
      description: `Peak commit hour is ${formatHour(peakHourIdx)} with ${maxHour} commits`,
    })
  }

  // Monthly rhythm
  const maxMonth = Math.max(...timing.commitsByMonth)
  if (maxMonth > 0) {
    const peakMonthIdx = timing.commitsByMonth.indexOf(maxMonth)
    const consistency = computeConsistency(timing.commitsByMonth)
    rhythms.push({
      type: 'monthly',
      peakDay: peakMonthIdx,
      peakHour: 0,
      consistency,
      description: `${MONTH_NAMES[peakMonthIdx]} is the most active month`,
    })
  }

  // Quarterly rhythm
  const quarters = [
    timing.commitsByMonth.slice(0, 3).reduce((s, c) => s + c, 0),
    timing.commitsByMonth.slice(3, 6).reduce((s, c) => s + c, 0),
    timing.commitsByMonth.slice(6, 9).reduce((s, c) => s + c, 0),
    timing.commitsByMonth.slice(9, 12).reduce((s, c) => s + c, 0),
  ]
  const maxQ = Math.max(...quarters)
  if (maxQ > 0) {
    const peakQ = quarters.indexOf(maxQ)
    const consistency = computeConsistency(quarters)
    rhythms.push({
      type: 'quarterly',
      peakDay: peakQ,
      peakHour: 0,
      consistency,
      description: `Q${peakQ + 1} is the most active quarter with ${maxQ} commits`,
    })
  }

  return rhythms
}

/**
 * Format hour as human-readable string.
 *
 * @example
 * formatHour(14)
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

/**
 * Compute consistency score (0-100) for a set of values.
 *
 * @example
 * computeConsistency([10, 12, 11, 9, 10])
 */
export function computeConsistency(values: number[]): number {
  if (values.length === 0) return 0
  if (values.length === 1) return 100

  const avg = values.reduce((s, v) => s + v, 0) / values.length
  if (avg === 0) return 0

  const variance = values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / avg

  // Lower coefficient of variation = higher consistency
  return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)))
}

// ─── Predictions ──────────────────────────────────────────────────────────────

/**
 * Generate predictions based on seasons and rhythms.
 *
 * @example
 * generatePredictions(seasons, rhythms, stats)
 */
export function generatePredictions(
  seasons: Season[],
  rhythms: Rhythm[],
  stats: AlmanacStats,
): Prediction[] {
  const predictions: Prediction[] = []

  // Predict next month's activity
  const currentMonth = new Date().getMonth()
  const nextMonth = (currentMonth + 1) % 12
  const monthCommits = stats.commitsByMonth[nextMonth] ?? 0
  const avgMonthly = stats.totalCommits > 0 ? stats.totalCommits / 12 : 0

  if (monthCommits > avgMonthly * 1.3) {
    predictions.push({
      category: 'activity',
      confidence: Math.min(90, 50 + Math.round(monthCommits / Math.max(avgMonthly, 1) * 10)),
      prediction: `Next month (${MONTH_NAMES[nextMonth]}) will likely see above-average activity (~${monthCommits} commits)`,
      basedOn: `Historical ${MONTH_NAMES[nextMonth]} average: ${monthCommits} commits`,
    })
  } else if (monthCommits < avgMonthly * 0.5) {
    predictions.push({
      category: 'activity',
      confidence: Math.min(85, 40 + Math.round((1 - monthCommits / Math.max(avgMonthly, 1)) * 50)),
      prediction: `Next month (${MONTH_NAMES[nextMonth]}) will likely be a quieter period (~${monthCommits} commits)`,
      basedOn: `Historical ${MONTH_NAMES[nextMonth]} average: ${monthCommits} commits`,
    })
  } else {
    predictions.push({
      category: 'activity',
      confidence: 50,
      prediction: `Next month (${MONTH_NAMES[nextMonth]}) will likely see average activity (~${Math.round(avgMonthly)} commits)`,
      basedOn: `Overall monthly average: ${Math.round(avgMonthly)} commits`,
    })
  }

  // Predict dominant action for next season
  const upcomingSeason = findUpcomingSeason(seasons, nextMonth)
  if (upcomingSeason) {
    predictions.push({
      category: 'work-type',
      confidence: 60,
      prediction: `Expect ${upcomingSeason.dominantAction} work in the upcoming season`,
      basedOn: `${upcomingSeason.name} historically sees ${upcomingSeason.dominantAction} commits`,
    })
  }

  // Most productive day prediction
  const weeklyRhythm = rhythms.find((r) => r.type === 'weekly')
  if (weeklyRhythm && weeklyRhythm.peakDay >= 0) {
    predictions.push({
      category: 'productivity',
      confidence: weeklyRhythm.consistency,
      prediction: `${DAY_NAMES[weeklyRhythm.peakDay]} is your most productive day`,
      basedOn: `${weeklyRhythm.consistency}% weekly pattern consistency`,
    })
  }

  // Peak hour prediction
  const dailyRhythm = rhythms.find((r) => r.type === 'daily')
  if (dailyRhythm && dailyRhythm.peakHour >= 0) {
    predictions.push({
      category: 'timing',
      confidence: dailyRhythm.consistency,
      prediction: `Peak coding happens around ${formatHour(dailyRhythm.peakHour)}`,
      basedOn: `Daily rhythm analysis across ${stats.totalCommits} commits`,
    })
  }

  // Quarterly prediction
  const currentQuarter = Math.floor(currentMonth / 3)
  const nextQuarter = (currentQuarter + 1) % 4
  const qSeason = seasons.find((s) => s.months.some((m) => Math.floor(m / 3) === nextQuarter))
  if (qSeason) {
    predictions.push({
      category: 'quarterly',
      confidence: 55,
      prediction: `Q${nextQuarter + 1} will focus on ${qSeason.dominantAction} work`,
      basedOn: `Historical Q${nextQuarter + 1} patterns`,
    })
  }

  return predictions
}

/**
 * Find upcoming season for a given month.
 *
 * @example
 * findUpcomingSeason(seasons, 3)
 */
export function findUpcomingSeason(seasons: Season[], month: number): Season | undefined {
  return seasons.find((s) => s.months.includes(month))
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute almanac statistics.
 *
 * @example
 * computeAlmanacStats(timing, seasons)
 */
export function computeAlmanacStats(
  timing: {
    commitsByDayOfWeek: number[]
    commitsByHour: number[]
    commitsByMonth: number[]
    totalCommits: number
  },
  seasons: Season[],
): AlmanacStats {
  const maxDayIdx = timing.commitsByDayOfWeek.indexOf(Math.max(...timing.commitsByDayOfWeek))
  const maxHourIdx = timing.commitsByHour.indexOf(Math.max(...timing.commitsByHour))
  const maxMonthIdx = timing.commitsByMonth.indexOf(Math.max(...timing.commitsByMonth))

  const activeDays = timing.commitsByDayOfWeek.filter((c) => c > 0).length
  const avgCommitsPerDay = activeDays > 0
    ? Math.round((timing.totalCommits / Math.max(activeDays, 1)) * 10) / 10
    : 0

  const sorted = [...seasons].sort((a, b) => b.commitCount - a.commitCount)
  const busiestSeason = sorted[0]?.name ?? 'Unknown'
  const quietestSeason = sorted[sorted.length - 1]?.name ?? 'Unknown'

  return {
    totalCommits: timing.totalCommits,
    commitsByDayOfWeek: timing.commitsByDayOfWeek,
    commitsByHour: timing.commitsByHour,
    commitsByMonth: timing.commitsByMonth,
    mostActiveDay: DAY_NAMES[maxDayIdx] ?? 'Unknown',
    mostActiveHour: formatHour(maxHourIdx),
    mostActiveMonth: MONTH_NAMES[maxMonthIdx] ?? 'Unknown',
    avgCommitsPerDay,
    busiestSeason,
    quietestSeason,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate almanac recommendations.
 *
 * @example
 * generateAlmanacRecommendations(seasons, rhythms, stats)
 */
export function generateAlmanacRecommendations(
  seasons: Season[],
  rhythms: Rhythm[],
  stats: AlmanacStats,
): string[] {
  const recs: string[] = []

  // Review scheduling
  const busySeason = seasons.find((s) =>
    s.characteristics.includes('Peak development period'),
  )
  if (busySeason) {
    recs.push(`Schedule code reviews before ${busySeason.name} to manage the influx`)
  }

  // Refactoring during slow periods
  const slowSeasons = seasons.filter((s) =>
    s.characteristics.includes('Low development activity'),
  )
  if (slowSeasons.length > 0) {
    const names = slowSeasons.map((s) => s.name).join(', ')
    recs.push(`Allocate refactoring time during ${names}`)
  }

  // Release planning
  const weeklyRhythm = rhythms.find((r) => r.type === 'weekly')
  if (weeklyRhythm) {
    recs.push(`Plan releases on days with historically lower activity (avoid ${DAY_NAMES[weeklyRhythm.peakDay]})`)
  }

  // Team capacity
  if (stats.avgCommitsPerDay > 10) {
    recs.push('High daily commit rate — ensure adequate review capacity')
  }

  // Consistency warnings
  const inconsistent = rhythms.filter((r) => r.consistency < 40)
  if (inconsistent.length > 0) {
    recs.push(`${inconsistent.length} rhythm(s) show low consistency — consider establishing regular cadences`)
  }

  // Test coverage during busy periods
  const harvestSeasons = seasons.filter((s) => s.dominantAction === 'feature')
  if (harvestSeasons.length > 0) {
    recs.push('Increase test coverage before feature-heavy seasons')
  }

  if (recs.length === 0) {
    recs.push('Development patterns look healthy and consistent')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete almanac result from git log.
 *
 * @example
 * buildAlmanacResult(gitLog)
 */
export function buildAlmanacResult(
  gitLog: string,
  _options?: AlmanacOptions,
): AlmanacResult {
  const entries = parseAlmanacLog(gitLog)
  const timing = analyzeCommitTiming(entries)
  const seasons = detectSeasons(timing.commitsByMonth, entries)
  const rhythms = detectRhythms(timing)
  const stats = computeAlmanacStats(timing, seasons)
  const predictions = generatePredictions(seasons, rhythms, stats)
  const recommendations = generateAlmanacRecommendations(seasons, rhythms, stats)

  return {
    seasons,
    rhythms,
    predictions,
    stats,
    recommendations,
  }
}
