// ─── Types ─────────────────────────────────────────────────────────────────────

export type EventType = 'founding' | 'expansion' | 'war' | 'treaty' | 'plague' | 'renaissance' | 'exodus' | 'coronation'
export type CharacterRole = 'founder' | 'architect' | 'builder' | 'guardian' | 'wanderer' | 'phantom'

export interface GitCommit {
  hash: string
  author: string
  date: string
  message: string
  insertions: number
  deletions: number
  filesChanged: string[]
}

export interface Event {
  hash: string
  date: string
  type: EventType
  description: string
  impact: number
  filesAffected: string[]
}

export interface Character {
  name: string
  commits: number
  linesAdded: number
  linesRemoved: number
  firstAppearance: string
  lastAppearance: string
  activeDays: number
  role: CharacterRole
}

export interface Chapter {
  title: string
  era: string
  startDate: string
  endDate: string
  narrative: string
  keyEvents: Event[]
  characters: string[]
  significance: number
}

export interface ChronicleStats {
  totalChapters: number
  totalEvents: number
  totalCharacters: number
  foundingDate: string
  currentAge: number
  totalPages: number
  goldenAgeChapter: string
  darkAgeChapter: string
  narrativeRichness: number
}

export interface ChronicleResult {
  title: string
  chapters: Chapter[]
  characters: Character[]
  events: Event[]
  stats: ChronicleStats
  recommendations: string[]
}

// ─── Date Utilities ────────────────────────────────────────────────────────────

function parseDate(dateStr: string): Date {
  return new Date(dateStr)
}

/**
 * Days between two date strings.
 *
 * @example
 * daysBetween('2024-01-01', '2024-01-10')
 */
export function daysBetween(a: string, b: string): number {
  const da = parseDate(a)
  const db = parseDate(b)
  return Math.abs(Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24)))
}

/**
 * Get season name from date string.
 *
 * @example
 * getSeason('2024-03-15')
 */
export function getSeason(dateStr: string): string {
  const month = parseDate(dateStr).getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

function getYear(dateStr: string): number {
  return parseDate(dateStr).getFullYear()
}

// ─── Git Log Parsing ───────────────────────────────────────────────────────────

/**
 * Parse raw git log output into structured commits.
 *
 * @example
 * parseGitLog('COMMIT_START\nabc123\nJohn\n2024-01-01\nInitial commit')
 */
export function parseGitLog(rawLog: string): GitCommit[] {
  if (!rawLog || rawLog.trim().length === 0) return []

  const blocks = rawLog.split('COMMIT_START').filter((b) => b.trim().length > 0)
  const commits: GitCommit[] = []

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
    if (lines.length < 1) continue

    const dataLine = lines[0]!
    const parts = dataLine.split('\x00')
    if (parts.length < 4) continue

    const hash = parts[0] ?? ''
    const author = parts[1] ?? ''
    const date = parts[2] ?? ''
    const message = parts.slice(3).join('\x00')

    let insertions = 0
    let deletions = 0
    const filesChanged: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!
      const insMatch = line.match(/(\d+) insertion/)
      if (insMatch) insertions = parseInt(insMatch[1] ?? '', 10)
      const delMatch = line.match(/(\d+) deletion/)
      if (delMatch) deletions = parseInt(delMatch[1] ?? '', 10)
      if (line.includes('file changed') || line.includes('files changed')) continue
    }

    commits.push({ hash, author, date, message, insertions, deletions, filesChanged })
  }

  return commits
}

// ─── Event Classification ──────────────────────────────────────────────────────

/**
 * Classify a commit into an event type.
 *
 * @example
 * classifyEvent(commit, 0, 100)
 */
export function classifyEvent(commit: GitCommit, index: number, _total?: number): EventType {
  const msg = commit.message.toLowerCase()

  if (index < 3 || /^(initial|first commit|init repo|bootstrap|scaffold project)/i.test(msg)) {
    return 'founding'
  }

  if (/^(release|version|v\d|tag|bump version|publish)/i.test(msg)) {
    return 'coronation'
  }

  if (/^(fix|bug|patch|vuln|security|hotfix|critical|cve)/i.test(msg)) {
    return 'plague'
  }

  if (/^(doc|docs|document|readme|comment|changelog)/i.test(msg) || /test/i.test(msg) && /^(add|write|create|improve)/i.test(msg)) {
    return 'renaissance'
  }

  if (/^(move|rename|restructure|reorg|reorganize|migrate|transfer)/i.test(msg)) {
    return 'exodus'
  }

  if (/^(api|interface|type\b|contract|schema|protocol)/i.test(msg) || /\b(interface|type)\s+\w+\s*=/.test(msg)) {
    return 'treaty'
  }

  if (/^(merge|conflict|force push|refactor|rewrite|rework)/i.test(msg) || commit.deletions > 100) {
    return 'war'
  }

  if (/^(feat|feature|add|new|implement|create|support)/i.test(msg) || commit.insertions > 50) {
    return 'expansion'
  }

  if (/^(improve|clean|lint|format|style|chore)/i.test(msg)) {
    return 'renaissance'
  }

  return 'expansion'
}

/**
 * Build an Event from a commit and its classified type.
 *
 * @example
 * buildEvent(commit, 'founding')
 */
export function buildEvent(commit: GitCommit, type: EventType): Event {
  const impact = Math.min(100, commit.insertions + commit.deletions)
  return {
    hash: commit.hash,
    date: commit.date,
    type,
    description: commit.message,
    impact,
    filesAffected: commit.filesChanged,
  }
}

// ─── Character Role Assignment ─────────────────────────────────────────────────

/**
 * Assign a role to a character based on their commit patterns.
 *
 * @example
 * assignCharacterRole('Alice', commits, 0, 100)
 */
export function assignCharacterRole(
  _name: string,
  commits: GitCommit[],
  firstCommitIdx: number,
  _totalCommits: number,
): CharacterRole {
  if (commits.length <= 2) return 'phantom'

  if (firstCommitIdx < 10) return 'founder'

  if (commits.length < 5) {
    if (commits.length >= 2) {
      const dates = commits.map((c) => parseDate(c.date).getTime()).sort()
      const span = (dates[dates.length - 1]! - dates[0]!) / (1000 * 60 * 60 * 24)
      if (span > 30) return 'wanderer'
    }
    return 'wanderer'
  }

  const fixCount = commits.filter((c) => /^(fix|bug|patch|hotfix|security)/i.test(c.message)).length
  if (fixCount / commits.length > 0.3) return 'guardian'

  const refactorCount = commits.filter((c) => /^(refactor|restructure|move|rename|rework)/i.test(c.message)).length
  if (refactorCount / commits.length > 0.2) return 'architect'

  const featCount = commits.filter((c) => /^(feat|feature|add|new|implement|create)/i.test(c.message)).length
  if (featCount / commits.length > 0.5) return 'builder'

  return 'builder'
}

// ─── Chapter Division ──────────────────────────────────────────────────────────

/**
 * Divide events into chapter groups by natural time gaps.
 *
 * @example
 * divideIntoChapters(events)
 */
export function divideIntoChapters(events: Event[]): { events: Event[]; startDate: string; endDate: string }[] {
  if (events.length === 0) return []

  const sorted = [...events].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())

  const groups: { events: Event[]; startDate: string; endDate: string }[] = []
  let current: Event[] = [sorted[0]!]

  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1]!.date, sorted[i]!.date)
    if (gap > 3) {
      groups.push({
        events: current,
        startDate: current[0]!.date,
        endDate: current[current.length - 1]!.date,
      })
      current = []
    }
    current.push(sorted[i]!)
  }

  if (current.length > 0) {
    groups.push({
      events: current,
      startDate: current[0]!.date,
      endDate: current[current.length - 1]!.date,
    })
  }

  const merged: typeof groups = []
  for (const group of groups) {
    if (merged.length > 0 && group.events.length < 3) {
      const prev = merged[merged.length - 1]!
      prev.events.push(...group.events)
      prev.endDate = group.endDate
    } else {
      merged.push({ ...group, events: [...group.events] })
    }
  }

  return merged
}

// ─── Narrative Generation ──────────────────────────────────────────────────────

function countEventTypes(events: Event[]): Record<EventType, number> {
  const counts: Record<EventType, number> = {
    founding: 0, expansion: 0, war: 0, treaty: 0,
    plague: 0, renaissance: 0, exodus: 0, coronation: 0,
  }
  for (const e of events) {
    counts[e.type]++
  }
  return counts
}

function getDominantType(counts: Record<EventType, number>): EventType {
  let max = 0
  let dominant: EventType = 'expansion'
  for (const [type, count] of Object.entries(counts)) {
    if (count > max) {
      max = count
      dominant = type as EventType
    }
  }
  return dominant
}

function chapterTitle(counts: Record<EventType, number>, isLast: boolean): string {
  const dominant = getDominantType(counts)
  const titles: Record<EventType, string[]> = {
    founding: ['The Founding', 'In the Beginning', 'Genesis'],
    expansion: ['The Great Expansion', 'Rising Towers', 'Growth of the Realm'],
    war: ['The Time of Conflict', 'The Great Refactoring', 'Turbulent Times'],
    treaty: ['The Accords', 'Treaty of Types', 'The Great API Summit'],
    plague: ['The Dark Ages', 'Bug Crisis', 'The Troubles'],
    renaissance: ['The Renaissance', 'Golden Restoration', 'Quality Dawn'],
    exodus: ['The Great Migration', 'Exodus', 'The Restructuring'],
    coronation: ['The Coronation', 'Release Day', 'A New Reign'],
  }
  const options = titles[dominant] ?? ['The Chronicle']
  const idx = isLast ? 2 : (counts[dominant] ?? 0) % options.length
  return options[Math.min(idx, options.length - 1)] ?? options[0]!
}

/**
 * Write narrative text for a chapter.
 *
 * @example
 * writeNarrative(events, '2024-01-01', '2024-03-01', ['Alice'])
 */
export function writeNarrative(events: Event[], startDate: string, _endDate: string, characters: string[]): string {
  if (events.length === 0) return 'A period of silence, with no recorded events.'

  const counts = countEventTypes(events)
  const season = getSeason(startDate)
  const year = getYear(startDate)
  const totalImpact = events.reduce((s, e) => s + e.impact, 0)
  const lines: string[] = []

  lines.push(`In the ${season} of ${year},`)

  if (counts.founding > 0) {
    lines.push('the founders laid the first stones of what would become a great project.')
  }

  if (counts.expansion > 0 && counts.expansion >= (counts.founding ?? 0)) {
    lines.push(`builders erected ${counts.expansion} new structure${counts.expansion > 1 ? 's' : ''} across the realm.`)
  }

  if (counts.war > 0) {
    lines.push(`conflict erupted ${counts.war} time${counts.war > 1 ? 's' : ''} as merge storms and refactoring battles shook the foundations.`)
  }

  if (counts.treaty > 0) {
    lines.push(`diplomats established ${counts.treaty} agreement${counts.treaty > 1 ? 's' : ''}, defining interfaces and types for the realm.`)
  }

  if (counts.plague > 0) {
    lines.push(`dark times saw ${counts.plague} bug outbreak${counts.plague > 1 ? 's' : ''}, and the guardians scrambled to contain the damage.`)
  }

  if (counts.renaissance > 0) {
    lines.push(`a renaissance brought ${counts.renaissance} quality improvement${counts.renaissance > 1 ? 's' : ''}, with documentation and tests flourishing.`)
  }

  if (counts.exodus > 0) {
    lines.push(`the great migration moved ${counts.exodus} landmark${counts.exodus > 1 ? 's' : ''} as the geography of the project shifted.`)
  }

  if (counts.coronation > 0) {
    lines.push(`the people rejoiced as ${counts.coronation} new version${counts.coronation > 1 ? 's were' : ' was'} crowned.`)
  }

  if (characters.length > 0 && characters.length <= 3) {
    lines.push(`${characters.join(' and ')} led the efforts.`)
  } else if (characters.length > 3) {
    lines.push(`${characters.slice(0, 3).join(', ')}, and others led the efforts.`)
  }

  if (totalImpact > 500) lines.push('This was a period of immense activity that reshaped the project.')
  else if (totalImpact > 100) lines.push('Steady progress was made throughout this period.')
  else lines.push('A quiet period of careful stewardship.')

  return lines.join(' ')
}

// ─── Analysis ──────────────────────────────────────────────────────────────────

/**
 * Compute narrative richness score (0-100).
 *
 * @example
 * computeNarrativeRichness(chapters, events, characters)
 */
export function computeNarrativeRichness(chapters: Chapter[], events: Event[], characters: Character[]): number {
  let score = 0

  if (chapters.length > 1) score += 15
  if (chapters.length > 3) score += 10
  if (chapters.length > 5) score += 5

  const eventTypes = new Set(events.map((e) => e.type))
  if (eventTypes.size > 2) score += 10
  if (eventTypes.size > 4) score += 10
  if (eventTypes.size >= 7) score += 5

  if (characters.length > 1) score += 10
  if (characters.length > 3) score += 10
  if (characters.length > 5) score += 5

  if (events.length > 0) {
    const span = daysBetween(events[0]!.date, events[events.length - 1]!.date)
    if (span > 30) score += 10
    if (span > 180) score += 5
  }

  if (chapters.length > 1) {
    const sizes = chapters.map((c) => c.keyEvents.length)
    const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length
    const variance = sizes.reduce((s, n) => s + Math.pow(n - avg, 2), 0) / sizes.length
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 1
    if (cv < 0.5) score += 5
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Identify the golden age chapter (most productive).
 *
 * @example
 * identifyGoldenAge(chapters)
 */
export function identifyGoldenAge(chapters: Chapter[]): string {
  if (chapters.length === 0) return 'none'

  let best = chapters[0]!
  let bestScore = 0

  for (const ch of chapters) {
    const counts = countEventTypes(ch.keyEvents)
    const score = (counts.expansion * 3 + counts.renaissance * 4 + counts.coronation * 3 + counts.treaty * 2)
      * (ch.significance / 100)
    if (score > bestScore) {
      bestScore = score
      best = ch
    }
  }

  return best.title
}

/**
 * Identify the dark age chapter (most troubled).
 *
 * @example
 * identifyDarkAge(chapters)
 */
export function identifyDarkAge(chapters: Chapter[]): string {
  if (chapters.length === 0) return 'none'

  let worst = chapters[0]!
  let worstScore = 0

  for (const ch of chapters) {
    const counts = countEventTypes(ch.keyEvents)
    const score = counts.plague * 5 + counts.war * 3
    if (score > worstScore) {
      worstScore = score
      worst = ch
    }
  }

  return worst.title
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate chronicle recommendations.
 *
 * @example
 * generateRecommendations(chapters, characters, events, stats)
 */
export function generateRecommendations(
  chapters: Chapter[],
  characters: Character[],
  events: Event[],
  stats: ChronicleStats,
): string[] {
  const recs: string[] = []

  const phantoms = characters.filter((c) => c.role === 'phantom')
  if (phantoms.length > characters.length * 0.3) {
    recs.push(`High turnover: ${phantoms.length} phantom contributor(s) — consider knowledge transfer`)
  }

  const darkChapter = chapters.find((c) => {
    const counts = countEventTypes(c.keyEvents)
    return counts.plague > counts.expansion && counts.plague > 0
  })
  if (darkChapter) {
    recs.push(`Dark age "${darkChapter.title}" — document lessons to prevent recurrence`)
  }

  const wanderers = characters.filter((c) => c.role === 'wanderer')
  if (wanderers.length > 0) {
    recs.push(`${wanderers.length} wanderer(s) with sparse contributions — engage or archive`)
  }

  const types = new Set(events.map((e) => e.type))
  if (!types.has('renaissance')) {
    recs.push('No quality renaissance detected — schedule documentation and test sprints')
  }

  if (!types.has('treaty')) {
    recs.push('No API treaties found — consider formalizing interfaces and type contracts')
  }

  if (stats.narrativeRichness < 30) {
    recs.push('Low narrative richness — use conventional commits to enrich the chronicle')
  }

  const founders = characters.filter((c) => c.role === 'founder')
  const recentActive = characters.filter((c) => {
    if (events.length === 0) return false
    const lastEvent = events[events.length - 1]!.date
    return daysBetween(c.lastAppearance, lastEvent) < 30
  })
  if (founders.length > 0 && recentActive.filter((c) => c.role === 'founder').length === 0) {
    recs.push('Original founders no longer active — ensure institutional knowledge is preserved')
  }

  if (recs.length === 0) {
    recs.push('The chronicle tells a rich and balanced story — continue the good work')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete chronicle result from git commits.
 *
 * @example
 * buildChronicleResult(commits, { projectPath: '.' })
 */
export function buildChronicleResult(
  commits: GitCommit[],
  options: { projectPath: string },
): ChronicleResult {
  if (commits.length === 0) {
    return {
      title: 'The Empty Chronicle',
      chapters: [],
      characters: [],
      events: [],
      stats: {
        totalChapters: 0, totalEvents: 0, totalCharacters: 0,
        foundingDate: 'N/A', currentAge: 0, totalPages: 0,
        goldenAgeChapter: 'none', darkAgeChapter: 'none', narrativeRichness: 0,
      },
      recommendations: ['No git history found — initialize a repository and start committing'],
    }
  }

  const events: Event[] = commits.map((c, i) => {
    const type = classifyEvent(c, i, commits.length)
    return buildEvent(c, type)
  })

  const chapterGroups = divideIntoChapters(events)

  const authorCommits = new Map<string, GitCommit[]>()
  for (const c of commits) {
    const arr = authorCommits.get(c.author) ?? []
    arr.push(c)
    authorCommits.set(c.author, arr)
  }

  const authorFirstIdx = new Map<string, number>()
  for (let i = 0; i < commits.length; i++) {
    if (!authorFirstIdx.has(commits[i]!.author)) {
      authorFirstIdx.set(commits[i]!.author, i)
    }
  }

  const characters: Character[] = [...authorCommits.entries()].map(([name, cmts]) => {
    const dates = cmts.map((c) => c.date).sort()
    const uniqueDays = new Set(dates.map((d) => d.substring(0, 10)))
    return {
      name,
      commits: cmts.length,
      linesAdded: cmts.reduce((s, c) => s + c.insertions, 0),
      linesRemoved: cmts.reduce((s, c) => s + c.deletions, 0),
      firstAppearance: dates[0] ?? '',
      lastAppearance: dates[dates.length - 1] ?? '',
      activeDays: uniqueDays.size,
      role: assignCharacterRole(name, cmts, authorFirstIdx.get(name) ?? commits.length, commits.length),
    }
  })

  const chapters: Chapter[] = chapterGroups.map((group, idx) => {
    const counts = countEventTypes(group.events)
    const title = chapterTitle(counts, idx === chapterGroups.length - 1)
    const season = getSeason(group.startDate)
    const year = getYear(group.startDate)
    const era = `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`
    const chapterChars = [...new Set(
      group.events.flatMap((e) => {
        const commit = commits.find((c) => c.hash === e.hash)
        return commit ? [commit.author] : []
      }),
    )]
    const narrative = writeNarrative(group.events, group.startDate, group.endDate, chapterChars)
    const significance = group.events.length > 0
      ? Math.min(100, Math.round(group.events.reduce((s, e) => s + e.impact, 0) / group.events.length))
      : 0

    return {
      title,
      era,
      startDate: group.startDate,
      endDate: group.endDate,
      narrative,
      keyEvents: group.events,
      characters: chapterChars,
      significance,
    }
  })

  const sortedEvents = [...events].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
  const foundingDate = sortedEvents[0]?.date ?? 'N/A'
  const lastDate = sortedEvents[sortedEvents.length - 1]?.date ?? new Date().toISOString()
  const currentAge = daysBetween(foundingDate, lastDate)

  const stats: ChronicleStats = {
    totalChapters: chapters.length,
    totalEvents: events.length,
    totalCharacters: characters.length,
    foundingDate,
    currentAge,
    totalPages: commits.length,
    goldenAgeChapter: identifyGoldenAge(chapters),
    darkAgeChapter: identifyDarkAge(chapters),
    narrativeRichness: computeNarrativeRichness(chapters, events, characters),
  }

  const recommendations = generateRecommendations(chapters, characters, events, stats)

  const projectFolder = options.projectPath.split('/').pop() ?? options.projectPath
  const title = `The Chronicle of ${projectFolder}`

  return { title, chapters, characters, events: sortedEvents, stats, recommendations }
}
