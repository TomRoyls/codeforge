import { basename } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>
export type FileLister = (cwd: string) => Promise<string[]>

export interface PipelineJob {
  branches: string[]
  file: string
  hasArtifacts: boolean
  hasCache: boolean
  line: number
  name: string
  parallel: boolean
  runsOn: string
  stage: string
  steps: number
  timeout: string | null
  triggers: string[]
}

export interface PipelineIssue {
  file: string
  fix: string | null
  line: number | null
  message: string
  severity: 'error' | 'info' | 'warning'
}

export interface PipelineStage {
  dependsOn: string[]
  jobs: string[]
  name: string
}

export interface PipelineConfig {
  files: string[]
  issues: PipelineIssue[]
  jobs: PipelineJob[]
  platform: string
  stages: PipelineStage[]
  suggestions: string[]
}

export interface PipelineStats {
  averageStepsPerJob: number
  coverageReporting: boolean
  hasArtifacts: boolean
  hasCache: boolean
  hasMatrix: boolean
  platforms: string[]
  securityScanning: boolean
  totalJobs: number
  totalSteps: number
}

export interface PipelineOptions {
  verbose?: boolean
}

// ─── detectCIPlatform ───────────────────────────────────

/**
 * @example
 * const platform = detectCIPlatform(['.github/workflows/ci.yml'])
 * console.log(platform) // 'github-actions'
 */
export function detectCIPlatform(files: string[]): string {
  if (files.some((f) => f.includes('.github/workflows/') || f.includes('.github\\workflows\\'))) {
    return 'github-actions'
  }
  if (files.some((f) => basename(f) === '.gitlab-ci.yml')) return 'gitlab-ci'
  if (files.some((f) => basename(f) === '.travis.yml')) return 'travis'
  if (files.some((f) => basename(f) === 'Jenkinsfile')) return 'jenkins'
  if (files.some((f) => f.includes('.circleci/') || f.includes('.circleci\\'))) return 'circleci'
  return 'unknown'
}

// ─── parseGitHubActions ─────────────────────────────────

/**
 * @example
 * const jobs = parseGitHubActions(content, '.github/workflows/ci.yml')
 * console.log(jobs.length)
 */
export function parseGitHubActions(content: string, filePath: string): PipelineJob[] {
  const jobs: PipelineJob[] = []

  const triggers: string[] = []
  const onMatch = content.match(/on:\s*\n((?:\s+-?\s*\w+.*\n)*)/)
  if (onMatch && onMatch[1]) {
    const onBlock = onMatch[1]
    const pushMatch = onBlock.match(/\bpush\b/)
    const prMatch = onBlock.match(/\bpull_request\b/)
    const scheduleMatch = onBlock.match(/\bschedule\b/)
    if (pushMatch) triggers.push('push')
    if (prMatch) triggers.push('pull_request')
    if (scheduleMatch) triggers.push('schedule')
  }
  if (triggers.length === 0 && /on:\s*push/.test(content)) triggers.push('push')
  if (triggers.length === 0 && /on:\s*\[/.test(content)) {
    const bracketMatch = content.match(/on:\s*\[([^\]]+)\]/)
    if (bracketMatch && bracketMatch[1]) {
      const items = bracketMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
      triggers.push(...items)
    }
  }

  const branchMatches = content.matchAll(/branches:\s*\n((?:\s+-\s+.*\n)*)/g)
  const branches: string[] = []
  for (const bm of branchMatches) {
    const items = bm[1] ? bm[1].matchAll(/-\s+(.+)/g) : []
    for (const item of items) {
      branches.push(item[1]?.trim() ?? '')
    }
  }

  const jobsSection = content.match(/jobs:\s*\n([\s\S]*)/)
  if (!jobsSection || !jobsSection[1]) return jobs

  const jobBody = jobsSection[1]
  const jobNames = jobBody.matchAll(/^  (\w[\w-]*):\s*$/gm)

  let lineOffset = content.substring(0, content.indexOf('jobs:')).split('\n').length

  for (const jn of jobNames) {
    const jobName = jn[1] ?? ''
    if (!jobName) continue
    const jobStartIdx = jn.index
    if (jobStartIdx === undefined) continue
    const line = lineOffset + jobBody.substring(0, jobStartIdx).split('\n').length

    const afterName = jobBody.substring(jobStartIdx)
    const nextJob = afterName.search(/\n  \w[\w-]*:\s*$/m)
    const jobChunk = nextJob > 0 ? afterName.substring(0, nextJob) : afterName.substring(0, 500)

    const runsOnMatch = jobChunk.match(/runs-on:\s*(.+)/)
    const runsOn = runsOnMatch?.[1]?.trim() ?? 'unknown'

    const stepCount = (jobChunk.match(/^\s*-\s+(?:name|uses|run):/gm) ?? []).length
    const hasCache = /cache:/.test(jobChunk) || /actions\/cache/.test(jobChunk)
    const hasArtifacts = /actions\/upload-artifact/.test(jobChunk) || /artifacts:/.test(jobChunk)
    const timeoutMatch = jobChunk.match(/timeout-minutes:\s*(\d+)/)
    const hasMatrix = /matrix:/.test(jobChunk)

    jobs.push({
      branches,
      file: filePath,
      hasArtifacts,
      hasCache,
      line,
      name: jobName,
      parallel: hasMatrix,
      runsOn,
      stage: 'default',
      steps: stepCount,
      timeout: timeoutMatch?.[1] ?? null,
      triggers: [...triggers],
    })
  }

  return jobs
}

// ─── parseGitLabCI ──────────────────────────────────────

/**
 * @example
 * const jobs = parseGitLabCI(content, '.gitlab-ci.yml')
 * console.log(jobs[0].name)
 */
export function parseGitLabCI(content: string, filePath: string): PipelineJob[] {
  const jobs: PipelineJob[] = []
  const lines = content.split('\n')

  const reserved = new Set(['image', 'services', 'stages', 'variables', 'before_script', 'after_script', 'cache', 'default', 'include', 'workflow'])

  const triggers: string[] = []
  if (/only:\s*-\s*main/.test(content) || /only:\s*-\s*master/.test(content)) triggers.push('push')
  if (/rules:/.test(content)) triggers.push('push')

  const branchMatches = content.matchAll(/only:\s*\n((?:\s+-\s+.*\n)*)/g)
  const branches: string[] = []
  for (const bm of branchMatches) {
    const items = bm[1] ? bm[1].matchAll(/-\s+(.+)/g) : []
    for (const item of items) {
      const val = item[1]?.trim() ?? ''
      if (!val) continue
      if (!val.startsWith('$') && !val.startsWith('/')) branches.push(val)
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const match = line.match(/^([a-zA-Z][\w-]*):\s*$/)
    if (!match) continue
    const name = match[1]
    if (!name || reserved.has(name)) continue

    const chunkLines: string[] = []
    for (let j = i + 1; j < lines.length; j++) {
      const jline = lines[j]
      if (!jline) break
      if (jline.match(/^[a-zA-Z][\w-]*:\s*$/) || jline.match(/^\S/)) break
      chunkLines.push(jline)
    }
    const chunk = chunkLines.join('\n')

    const stepCount = (chunk.match(/^\s*-\s+/gm) ?? []).length
    const hasCache = /cache:/.test(chunk)
    const hasArtifacts = /artifacts:/.test(chunk)
    const runsOnMatch = chunk.match(/image:\s*(.+)/)
    const timeoutMatch = chunk.match(/timeout:\s*(.+)/)

    jobs.push({
      branches,
      file: filePath,
      hasArtifacts,
      hasCache,
      line: i + 1,
      name,
      parallel: /parallel:/.test(chunk),
      runsOn: runsOnMatch?.[1]?.trim() ?? 'shared',
      stage: 'default',
      steps: Math.max(stepCount, 1),
      timeout: timeoutMatch?.[1]?.trim() ?? null,
      triggers,
    })
  }

  return jobs
}

// ─── parseTravisCI ──────────────────────────────────────

/**
 * @example
 * const jobs = parseTravisCI(content, '.travis.yml')
 * console.log(jobs.length)
 */
export function parseTravisCI(content: string, filePath: string): PipelineJob[] {
  const jobs: PipelineJob[] = []

  const triggers: string[] = []
  if (/branches:/.test(content)) triggers.push('push')
  if (/type:\s*pull_request/.test(content)) triggers.push('pull_request')

  const branches: string[] = []
  const branchSection = content.match(/branches:\s*\n((?:\s+only:.*\n)?(?:\s+-\s+.*\n)*)/)
  if (branchSection && branchSection[1]) {
    const items = branchSection[1].matchAll(/-\s+(.+)/g)
    for (const item of items) {
      const val = item[1]?.trim()
      if (val) branches.push(val)
    }
  }

  const scriptCount = (content.match(/^\s*-\s+/gm) ?? []).length
  const stageMatch = content.match(/stage:\s*(.+)/)
  const osMatch = content.match(/os:\s*-\s*(.+)/)

  jobs.push({
    branches,
    file: filePath,
    hasArtifacts: false,
    hasCache: /cache:/.test(content),
    line: 1,
    name: stageMatch?.[1]?.trim() ?? 'test',
    parallel: /matrix:/.test(content),
    runsOn: osMatch?.[1]?.trim() ?? 'linux',
    stage: stageMatch?.[1]?.trim() ?? 'default',
    steps: Math.max(scriptCount, 1),
    timeout: null,
    triggers: triggers.length > 0 ? triggers : ['push'],
  })

  return jobs
}

// ─── detectPipelineIssues ───────────────────────────────

/**
 * @example
 * const issues = detectPipelineIssues(jobs)
 * console.log(issues[0].severity)
 */
export function detectPipelineIssues(jobs: PipelineJob[]): PipelineIssue[] {
  const issues: PipelineIssue[] = []

  for (const job of jobs) {
    if (!job.hasCache) {
      issues.push({
        file: job.file,
        fix: 'Add caching for dependencies (e.g., actions/cache)',
        line: job.line,
        message: `Job '${job.name}' has no cache configured`,
        severity: 'warning',
      })
    }

    if (job.timeout === null) {
      issues.push({
        file: job.file,
        fix: 'Set timeout-minutes to prevent hung jobs',
        line: job.line,
        message: `Job '${job.name}' has no timeout set`,
        severity: 'warning',
      })
    }

    if (/latest/.test(job.runsOn)) {
      issues.push({
        file: job.file,
        fix: 'Pin to a specific version (e.g., ubuntu-22.04)',
        line: job.line,
        message: `Job '${job.name}' uses 'latest' tag for base image`,
        severity: 'warning',
      })
    }
  }

  const allTriggers = new Set(jobs.flatMap((j) => j.triggers))
  if (!allTriggers.has('pull_request')) {
    issues.push({
      file: jobs[0]?.file ?? '',
      fix: 'Add pull_request trigger to run CI on PRs',
      line: null,
      message: 'No pull_request trigger found',
      severity: 'info',
    })
  }

  const allContent = jobs.map((j) => j.file).join(' ')
  if (!/secrets?|token|key/i.test(allContent)) {
    // no secrets reference is fine, skip
  }

  const hasSecurity = jobs.some((j) =>
    /security|snyk|sonar|owasp|trivy|safety|audit/i.test(j.name),
  )
  if (!hasSecurity && jobs.length > 0) {
    const firstJob = jobs[0]
    if (firstJob) {
      issues.push({
        file: firstJob.file,
        fix: 'Add a security scanning job (Snyk, Trivy, npm audit)',
        line: null,
        message: 'No security scanning job found',
        severity: 'info',
      })
    }
  }

  const hasCoverage = jobs.some((j) =>
    /coverage|codecov|coveralls/i.test(j.name),
  )
  if (!hasCoverage && jobs.length > 0) {
    const firstJob = jobs[0]
    if (firstJob) {
      issues.push({
        file: firstJob.file,
        fix: 'Add coverage reporting step',
        line: null,
        message: 'No coverage reporting found',
        severity: 'info',
      })
    }
  }

  return issues
}

// ─── generatePipelineSuggestions ─────────────────────────

/**
 * @example
 * const suggestions = generatePipelineSuggestions(jobs, issues)
 * console.log(suggestions[0])
 */
export function generatePipelineSuggestions(
  jobs: PipelineJob[],
  issues: PipelineIssue[],
): string[] {
  const suggestions: string[] = []

  if (jobs.length === 0) return ['Add a CI/CD pipeline configuration']

  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length

  if (errorCount > 0) suggestions.push(`Fix ${errorCount} error(s) in pipeline config`)
  if (warningCount > 0) suggestions.push(`Address ${warningCount} warning(s) for better reliability`)

  if (!jobs.some((j) => j.hasCache)) {
    suggestions.push('Add dependency caching to speed up builds')
  }

  if (!jobs.some((j) => j.parallel)) {
    suggestions.push('Consider matrix testing for cross-platform compatibility')
  }

  const totalSteps = jobs.reduce((s, j) => s + j.steps, 0)
  if (totalSteps > 50) {
    suggestions.push('Pipeline has many steps — consider splitting into multiple workflows')
  }

  if (suggestions.length === 0) {
    suggestions.push('Pipeline configuration looks good')
  }

  return suggestions
}

// ─── computePipelineStats ───────────────────────────────

/**
 * @example
 * const stats = computePipelineStats(jobs)
 * console.log(stats.totalJobs)
 */
export function computePipelineStats(jobs: PipelineJob[]): PipelineStats {
  const totalSteps = jobs.reduce((s, j) => s + j.steps, 0)
  const platforms = [...new Set(jobs.map((j) => j.runsOn))]

  return {
    averageStepsPerJob: jobs.length > 0 ? Math.round(totalSteps / jobs.length) : 0,
    coverageReporting: jobs.some((j) => /coverage|codecov|coveralls/i.test(j.name)),
    hasArtifacts: jobs.some((j) => j.hasArtifacts),
    hasCache: jobs.some((j) => j.hasCache),
    hasMatrix: jobs.some((j) => j.parallel),
    platforms,
    securityScanning: jobs.some((j) => /security|snyk|trivy|audit/i.test(j.name)),
    totalJobs: jobs.length,
    totalSteps,
  }
}

// ─── buildPipelineResult ────────────────────────────────

/**
 * @example
 * const config = await buildPipelineResult(files, reader, {})
 * console.log(config.platform)
 */
export async function buildPipelineResult(
  files: string[],
  contentReader: ContentReader,
  _options?: PipelineOptions,
): Promise<PipelineConfig> {
  const platform = detectCIPlatform(files)
  const allJobs: PipelineJob[] = []

  for (const file of files) {
    let content: string
    try {
      content = await contentReader(file)
    } catch {
      continue
    }

    const base = basename(file)

    if (file.includes('.github/workflows') || file.includes('.github\\workflows')) {
      allJobs.push(...parseGitHubActions(content, file))
    } else if (base === '.gitlab-ci.yml') {
      allJobs.push(...parseGitLabCI(content, file))
    } else if (base === '.travis.yml') {
      allJobs.push(...parseTravisCI(content, file))
    }
  }

  const issues = detectPipelineIssues(allJobs)
  const suggestions = generatePipelineSuggestions(allJobs, issues)

  const stages: PipelineStage[] = []
  const stageMap = new Map<string, string[]>()
  for (const job of allJobs) {
    const stage = job.stage || 'default'
    if (!stageMap.has(stage)) stageMap.set(stage, [])
    stageMap.get(stage)!.push(job.name)
  }
  for (const [name, jobNames] of stageMap) {
    stages.push({ dependsOn: [], jobs: jobNames, name })
  }

  return {
    files,
    issues,
    jobs: allJobs,
    platform,
    stages,
    suggestions,
  }
}
