import { describe, expect, it } from 'vitest'

import {
  buildPipelineResult,
  computePipelineStats,
  detectCIPlatform,
  detectPipelineIssues,
  generatePipelineSuggestions,
  parseGitLabCI,
  parseGitHubActions,
  parseTravisCI,
  type PipelineJob,
} from '../src/commands/pipeline-helpers.js'

import {
  formatPipelineIssues,
  formatPipelineJobs,
  formatPipelineJson,
  formatPipelineStats,
  formatPipelineTable,
  severityLabel,
} from '../src/commands/pipeline-format-helpers.js'

// ─── Helpers ────────────────────────────────────────────

function makeJob(overrides: Partial<PipelineJob> = {}): PipelineJob {
  return {
    branches: ['main'],
    file: '.github/workflows/ci.yml',
    hasArtifacts: false,
    hasCache: true,
    line: 10,
    name: 'build',
    parallel: false,
    runsOn: 'ubuntu-latest',
    stage: 'default',
    steps: 4,
    timeout: '30',
    triggers: ['push'],
    ...overrides,
  }
}

const ghContent = `
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Install
        run: npm ci
      - name: Test
        run: npm test
      - name: Upload
        uses: actions/upload-artifact@v3
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run lint
`.trim()

const glContent = `
stages:
  - build
  - test

build-job:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  cache:
    paths:
      - node_modules/
  artifacts:
    paths:
      - dist/

test-job:
  stage: test
  image: node:18
  script:
    - npm test
  timeout: 60m
`.trim()

const travisContent = `
language: node_js
node_js:
  - 18
cache: npm
script:
  - npm ci
  - npm test
branches:
  only:
    - main
`.trim()

// ─── detectCIPlatform ───────────────────────────────────

describe('detectCIPlatform', () => {
  it('detects github-actions', () => {
    expect(detectCIPlatform(['.github/workflows/ci.yml'])).toBe('github-actions')
  })

  it('detects github-actions with backslash paths', () => {
    expect(detectCIPlatform(['.github\\workflows\\ci.yml'])).toBe('github-actions')
  })

  it('detects gitlab-ci', () => {
    expect(detectCIPlatform(['.gitlab-ci.yml'])).toBe('gitlab-ci')
  })

  it('detects travis', () => {
    expect(detectCIPlatform(['.travis.yml'])).toBe('travis')
  })

  it('detects jenkins', () => {
    expect(detectCIPlatform(['Jenkinsfile'])).toBe('jenkins')
  })

  it('detects circleci', () => {
    expect(detectCIPlatform(['.circleci/config.yml'])).toBe('circleci')
  })

  it('returns unknown for empty list', () => {
    expect(detectCIPlatform([])).toBe('unknown')
  })

  it('returns unknown for unrelated files', () => {
    expect(detectCIPlatform(['package.json', 'tsconfig.json'])).toBe('unknown')
  })

  it('prioritizes github-actions over others', () => {
    expect(detectCIPlatform(['.github/workflows/ci.yml', '.travis.yml'])).toBe('github-actions')
  })
})

// ─── parseGitHubActions ─────────────────────────────────

describe('parseGitHubActions', () => {
  it('parses jobs from GitHub Actions YAML', () => {
    const jobs = parseGitHubActions(ghContent, '.github/workflows/ci.yml')
    expect(jobs.length).toBeGreaterThanOrEqual(2)
    expect(jobs.some((j) => j.name === 'build')).toBe(true)
    expect(jobs.some((j) => j.name === 'lint')).toBe(true)
  })

  it('detects runsOn', () => {
    const jobs = parseGitHubActions(ghContent, '.github/workflows/ci.yml')
    expect(jobs[0].runsOn).toBe('ubuntu-latest')
  })

  it('detects timeout', () => {
    const jobs = parseGitHubActions(ghContent, '.github/workflows/ci.yml')
    const build = jobs.find((j) => j.name === 'build')!
    expect(build.timeout).toBe('30')
  })

  it('detects artifacts in build job', () => {
    const jobs = parseGitHubActions(ghContent, '.github/workflows/ci.yml')
    const build = jobs.find((j) => j.name === 'build')!
    expect(build.hasArtifacts).toBe(true)
  })

  it('detects push trigger', () => {
    const jobs = parseGitHubActions(ghContent, '.github/workflows/ci.yml')
    expect(jobs[0].triggers).toContain('push')
  })

  it('detects pull_request trigger', () => {
    const jobs = parseGitHubActions(ghContent, '.github/workflows/ci.yml')
    expect(jobs[0].triggers).toContain('pull_request')
  })

  it('detects branches from multiline block', () => {
    const content = 'on:\n  push:\n    branches:\n      - main\n      - dev\njobs:\n  build:\n    runs-on: ubuntu-latest'
    const jobs = parseGitHubActions(content, 'ci.yml')
    expect(jobs[0].branches).toContain('main')
  })

  it('returns empty for no jobs section', () => {
    const jobs = parseGitHubActions('name: test\non: push', 'ci.yml')
    expect(jobs).toEqual([])
  })

  it('counts steps correctly', () => {
    const jobs = parseGitHubActions(ghContent, '.github/workflows/ci.yml')
    const build = jobs.find((j) => j.name === 'build')!
    expect(build.steps).toBeGreaterThanOrEqual(2)
  })

  it('sets file path on each job', () => {
    const jobs = parseGitHubActions(ghContent, '.github/workflows/ci.yml')
    expect(jobs.every((j) => j.file === '.github/workflows/ci.yml')).toBe(true)
  })

  it('detects inline on:push trigger', () => {
    const jobs = parseGitHubActions('on: push\njobs:\n  test:\n    runs-on: ubuntu-latest', 'ci.yml')
    expect(jobs[0].triggers).toContain('push')
  })

  it('detects bracket triggers', () => {
    const jobs = parseGitHubActions('on: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest', 'ci.yml')
    expect(jobs[0].triggers).toContain('push')
    expect(jobs[0].triggers).toContain('pull_request')
  })
})

// ─── parseGitLabCI ──────────────────────────────────────

describe('parseGitLabCI', () => {
  it('parses jobs from GitLab CI YAML', () => {
    const jobs = parseGitLabCI(glContent, '.gitlab-ci.yml')
    expect(jobs.length).toBeGreaterThanOrEqual(2)
    expect(jobs.some((j) => j.name === 'build-job')).toBe(true)
    expect(jobs.some((j) => j.name === 'test-job')).toBe(true)
  })

  it('skips reserved keywords', () => {
    const jobs = parseGitLabCI(glContent, '.gitlab-ci.yml')
    expect(jobs.some((j) => j.name === 'stages')).toBe(false)
    expect(jobs.some((j) => j.name === 'image')).toBe(false)
  })

  it('detects cache', () => {
    const jobs = parseGitLabCI(glContent, '.gitlab-ci.yml')
    const build = jobs.find((j) => j.name === 'build-job')!
    expect(build.hasCache).toBe(true)
  })

  it('detects artifacts', () => {
    const jobs = parseGitLabCI(glContent, '.gitlab-ci.yml')
    const build = jobs.find((j) => j.name === 'build-job')!
    expect(build.hasArtifacts).toBe(true)
  })

  it('detects image as runsOn', () => {
    const jobs = parseGitLabCI(glContent, '.gitlab-ci.yml')
    const build = jobs.find((j) => j.name === 'build-job')!
    expect(build.runsOn).toBe('node:18')
  })

  it('detects timeout', () => {
    const jobs = parseGitLabCI(glContent, '.gitlab-ci.yml')
    const test = jobs.find((j) => j.name === 'test-job')!
    expect(test.timeout).toBe('60m')
  })

  it('returns at least 1 step per job', () => {
    const jobs = parseGitLabCI(glContent, '.gitlab-ci.yml')
    expect(jobs.every((j) => j.steps >= 1)).toBe(true)
  })

  it('sets file path', () => {
    const jobs = parseGitLabCI(glContent, '.gitlab-ci.yml')
    expect(jobs.every((j) => j.file === '.gitlab-ci.yml')).toBe(true)
  })
})

// ─── parseTravisCI ──────────────────────────────────────

describe('parseTravisCI', () => {
  it('parses a Travis CI config', () => {
    const jobs = parseTravisCI(travisContent, '.travis.yml')
    expect(jobs.length).toBe(1)
  })

  it('detects cache', () => {
    const jobs = parseTravisCI(travisContent, '.travis.yml')
    expect(jobs[0].hasCache).toBe(true)
  })

  it('defaults to linux runsOn', () => {
    const jobs = parseTravisCI(travisContent, '.travis.yml')
    expect(jobs[0].runsOn).toBe('linux')
  })

  it('detects branches from branch section', () => {
    const jobs = parseTravisCI(travisContent, '.travis.yml')
    expect(jobs[0].branches.length).toBeGreaterThanOrEqual(0)
  })

  it('has push trigger by default', () => {
    const jobs = parseTravisCI(travisContent, '.travis.yml')
    expect(jobs[0].triggers).toContain('push')
  })

  it('sets file path', () => {
    const jobs = parseTravisCI(travisContent, '.travis.yml')
    expect(jobs[0].file).toBe('.travis.yml')
  })

  it('counts steps', () => {
    const jobs = parseTravisCI(travisContent, '.travis.yml')
    expect(jobs[0].steps).toBeGreaterThanOrEqual(1)
  })

  it('detects stage name', () => {
    const content = 'language: node_js\nstage: deploy\nscript:\n  - echo hi'
    const jobs = parseTravisCI(content, '.travis.yml')
    expect(jobs[0].name).toBe('deploy')
  })
})

// ─── detectPipelineIssues ───────────────────────────────

describe('detectPipelineIssues', () => {
  it('warns about missing cache', () => {
    const jobs = [makeJob({ hasCache: false })]
    const issues = detectPipelineIssues(jobs)
    expect(issues.some((i) => i.message.includes('no cache'))).toBe(true)
  })

  it('warns about missing timeout', () => {
    const jobs = [makeJob({ timeout: null })]
    const issues = detectPipelineIssues(jobs)
    expect(issues.some((i) => i.message.includes('no timeout'))).toBe(true)
  })

  it('warns about latest tag', () => {
    const jobs = [makeJob({ runsOn: 'ubuntu-latest' })]
    const issues = detectPipelineIssues(jobs)
    expect(issues.some((i) => i.message.includes('latest'))).toBe(true)
  })

  it('warns about no pull_request trigger', () => {
    const jobs = [makeJob({ triggers: ['push'] })]
    const issues = detectPipelineIssues(jobs)
    expect(issues.some((i) => i.message.includes('pull_request'))).toBe(true)
  })

  it('warns about no security scanning', () => {
    const jobs = [makeJob()]
    const issues = detectPipelineIssues(jobs)
    expect(issues.some((i) => i.message.includes('security'))).toBe(true)
  })

  it('warns about no coverage reporting', () => {
    const jobs = [makeJob()]
    const issues = detectPipelineIssues(jobs)
    expect(issues.some((i) => i.message.includes('coverage'))).toBe(true)
  })

  it('no issues for well-configured pipeline', () => {
    const jobs = [makeJob({
      hasCache: true,
      timeout: '30',
      runsOn: 'ubuntu-22.04',
      triggers: ['push', 'pull_request'],
      name: 'coverage-security',
    })]
    const issues = detectPipelineIssues(jobs)
    expect(issues.length).toBe(0)
  })

  it('includes fix suggestions', () => {
    const jobs = [makeJob({ hasCache: false })]
    const issues = detectPipelineIssues(jobs)
    const noCacheIssue = issues.find((i) => i.message.includes('no cache'))!
    expect(noCacheIssue.fix).toBeTruthy()
  })

  it('returns pull_request issue for no jobs', () => {
    const issues = detectPipelineIssues([])
    expect(issues.length).toBeGreaterThanOrEqual(0)
  })
})

// ─── generatePipelineSuggestions ─────────────────────────

describe('generatePipelineSuggestions', () => {
  it('suggests adding pipeline when no jobs', () => {
    const suggestions = generatePipelineSuggestions([], [])
    expect(suggestions).toContain('Add a CI/CD pipeline configuration')
  })

  it('suggests adding cache when none found', () => {
    const jobs = [makeJob({ hasCache: false })]
    const suggestions = generatePipelineSuggestions(jobs, [])
    expect(suggestions.some((s) => s.includes('caching'))).toBe(true)
  })

  it('suggests matrix testing when no parallel jobs', () => {
    const jobs = [makeJob({ parallel: false })]
    const suggestions = generatePipelineSuggestions(jobs, [])
    expect(suggestions.some((s) => s.includes('matrix'))).toBe(true)
  })

  it('suggests splitting when many steps', () => {
    const jobs = [makeJob({ steps: 60 })]
    const suggestions = generatePipelineSuggestions(jobs, [])
    expect(suggestions.some((s) => s.includes('splitting'))).toBe(true)
  })

  it('reports errors', () => {
    const jobs = [makeJob()]
    const issues = [{ file: '', fix: null, line: null, message: 'err', severity: 'error' as const }]
    const suggestions = generatePipelineSuggestions(jobs, issues)
    expect(suggestions.some((s) => s.includes('error'))).toBe(true)
  })

  it('reports warnings', () => {
    const jobs = [makeJob()]
    const issues = [{ file: '', fix: null, line: null, message: 'warn', severity: 'warning' as const }]
    const suggestions = generatePipelineSuggestions(jobs, issues)
    expect(suggestions.some((s) => s.includes('warning'))).toBe(true)
  })

  it('praises good config', () => {
    const jobs = [makeJob({ hasCache: true, parallel: true, steps: 3 })]
    const suggestions = generatePipelineSuggestions(jobs, [])
    expect(suggestions.some((s) => s.includes('looks good'))).toBe(true)
  })
})

// ─── computePipelineStats ───────────────────────────────

describe('computePipelineStats', () => {
  it('computes totalJobs', () => {
    const stats = computePipelineStats([makeJob(), makeJob({ name: 'test' })])
    expect(stats.totalJobs).toBe(2)
  })

  it('computes totalSteps', () => {
    const stats = computePipelineStats([makeJob({ steps: 5 }), makeJob({ steps: 3 })])
    expect(stats.totalSteps).toBe(8)
  })

  it('computes averageStepsPerJob', () => {
    const stats = computePipelineStats([makeJob({ steps: 6 }), makeJob({ steps: 4 })])
    expect(stats.averageStepsPerJob).toBe(5)
  })

  it('detects hasCache', () => {
    const stats = computePipelineStats([makeJob({ hasCache: true })])
    expect(stats.hasCache).toBe(true)
  })

  it('detects no hasCache', () => {
    const stats = computePipelineStats([makeJob({ hasCache: false })])
    expect(stats.hasCache).toBe(false)
  })

  it('detects hasArtifacts', () => {
    const stats = computePipelineStats([makeJob({ hasArtifacts: true })])
    expect(stats.hasArtifacts).toBe(true)
  })

  it('detects hasMatrix', () => {
    const stats = computePipelineStats([makeJob({ parallel: true })])
    expect(stats.hasMatrix).toBe(true)
  })

  it('detects securityScanning by job name', () => {
    const stats = computePipelineStats([makeJob({ name: 'security-scan' })])
    expect(stats.securityScanning).toBe(true)
  })

  it('detects coverageReporting by job name', () => {
    const stats = computePipelineStats([makeJob({ name: 'coverage-report' })])
    expect(stats.coverageReporting).toBe(true)
  })

  it('collects platforms', () => {
    const stats = computePipelineStats([makeJob({ runsOn: 'ubuntu-22.04' }), makeJob({ runsOn: 'windows-2022' })])
    expect(stats.platforms).toContain('ubuntu-22.04')
    expect(stats.platforms).toContain('windows-2022')
  })

  it('returns zero for empty', () => {
    const stats = computePipelineStats([])
    expect(stats.totalJobs).toBe(0)
    expect(stats.totalSteps).toBe(0)
    expect(stats.averageStepsPerJob).toBe(0)
  })
})

// ─── buildPipelineResult ────────────────────────────────

describe('buildPipelineResult', () => {
  it('returns unknown platform for empty files', async () => {
    const result = await buildPipelineResult([], async () => '')
    expect(result.platform).toBe('unknown')
  })

  it('detects github-actions platform', async () => {
    const reader = async () => ghContent
    const result = await buildPipelineResult(['.github/workflows/ci.yml'], reader)
    expect(result.platform).toBe('github-actions')
  })

  it('detects gitlab-ci platform', async () => {
    const reader = async () => glContent
    const result = await buildPipelineResult(['.gitlab-ci.yml'], reader)
    expect(result.platform).toBe('gitlab-ci')
  })

  it('skips unreadable files', async () => {
    const reader = async () => { throw new Error('nope') }
    const result = await buildPipelineResult(['.github/workflows/ci.yml'], reader)
    expect(result.jobs).toEqual([])
  })

  it('passes files through', async () => {
    const result = await buildPipelineResult(['a.yml', 'b.yml'], async () => '')
    expect(result.files).toEqual(['a.yml', 'b.yml'])
  })

  it('builds stages from jobs', async () => {
    const reader = async () => ghContent
    const result = await buildPipelineResult(['.github/workflows/ci.yml'], reader)
    expect(result.stages.length).toBeGreaterThanOrEqual(1)
  })

  it('detects issues', async () => {
    const reader = async () => ghContent
    const result = await buildPipelineResult(['.github/workflows/ci.yml'], reader)
    expect(result.issues.length).toBeGreaterThanOrEqual(0)
  })

  it('generates suggestions', async () => {
    const reader = async () => ghContent
    const result = await buildPipelineResult(['.github/workflows/ci.yml'], reader)
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('detects travis platform', async () => {
    const reader = async () => travisContent
    const result = await buildPipelineResult(['.travis.yml'], reader)
    expect(result.platform).toBe('travis')
    expect(result.jobs.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── severityLabel ──────────────────────────────────────

describe('severityLabel', () => {
  it('returns red ERROR', () => {
    const result = severityLabel('error')
    expect(result).toContain('ERROR')
  })

  it('returns orange WARN', () => {
    const result = severityLabel('warning')
    expect(result).toContain('WARN')
  })

  it('returns cyan INFO', () => {
    const result = severityLabel('info')
    expect(result).toContain('INFO')
  })

  it('returns INFO for unknown', () => {
    const result = severityLabel('other')
    expect(result).toContain('INFO')
  })
})

// ─── formatPipelineJobs ─────────────────────────────────

describe('formatPipelineJobs', () => {
  it('returns no-jobs message for empty', () => {
    const result = formatPipelineJobs([])
    expect(result).toContain('No jobs found')
  })

  it('formats job name', () => {
    const result = formatPipelineJobs([makeJob()])
    expect(result).toContain('build')
  })

  it('formats runsOn', () => {
    const result = formatPipelineJobs([makeJob()])
    expect(result).toContain('ubuntu-latest')
  })

  it('formats step count', () => {
    const result = formatPipelineJobs([makeJob({ steps: 7 })])
    expect(result).toContain('7 steps')
  })

  it('formats triggers', () => {
    const result = formatPipelineJobs([makeJob({ triggers: ['push', 'schedule'] })])
    expect(result).toContain('push')
    expect(result).toContain('schedule')
  })
})

// ─── formatPipelineIssues ───────────────────────────────

describe('formatPipelineIssues', () => {
  it('returns no-issues message for empty', () => {
    const result = formatPipelineIssues([])
    expect(result).toContain('No issues found')
  })

  it('formats issue message', () => {
    const result = formatPipelineIssues([{
      file: 'ci.yml',
      fix: 'add cache',
      line: 5,
      message: 'no cache',
      severity: 'warning',
    }])
    expect(result).toContain('no cache')
  })

  it('formats fix suggestion', () => {
    const result = formatPipelineIssues([{
      file: 'ci.yml',
      fix: 'add cache',
      line: null,
      message: 'no cache',
      severity: 'warning',
    }])
    expect(result).toContain('add cache')
  })

  it('formats line number', () => {
    const result = formatPipelineIssues([{
      file: 'ci.yml',
      fix: null,
      line: 10,
      message: 'err',
      severity: 'error',
    }])
    expect(result).toContain('L10')
  })

  it('omits line when null', () => {
    const result = formatPipelineIssues([{
      file: 'ci.yml',
      fix: null,
      line: null,
      message: 'err',
      severity: 'error',
    }])
    expect(result).not.toContain('Lnull')
  })
})

// ─── formatPipelineStats ────────────────────────────────

describe('formatPipelineStats', () => {
  const stats = {
    averageStepsPerJob: 5,
    coverageReporting: false,
    hasArtifacts: true,
    hasCache: true,
    hasMatrix: false,
    platforms: ['ubuntu-latest'],
    securityScanning: false,
    totalJobs: 3,
    totalSteps: 15,
  }

  it('formats total jobs', () => {
    const result = formatPipelineStats(stats)
    expect(result).toContain('3')
  })

  it('formats total steps', () => {
    const result = formatPipelineStats(stats)
    expect(result).toContain('15')
  })

  it('formats average', () => {
    const result = formatPipelineStats(stats)
    expect(result).toContain('5')
  })

  it('formats platform name', () => {
    const result = formatPipelineStats(stats)
    expect(result).toContain('ubuntu-latest')
  })

  it('shows unknown for empty platforms', () => {
    const result = formatPipelineStats({ ...stats, platforms: [] })
    expect(result).toContain('unknown')
  })
})

// ─── formatPipelineTable ────────────────────────────────

describe('formatPipelineTable', () => {
  const config = {
    files: ['.github/workflows/ci.yml'],
    issues: [],
    jobs: [makeJob()],
    platform: 'github-actions',
    stages: [],
    suggestions: ['Add caching'],
  }
  const stats = computePipelineStats(config.jobs)

  it('includes platform header', () => {
    const result = formatPipelineTable(config, stats)
    expect(result).toContain('CI/CD Pipeline Analysis')
  })

  it('includes platform name', () => {
    const result = formatPipelineTable(config, stats)
    expect(result).toContain('github-actions')
  })

  it('includes config files', () => {
    const result = formatPipelineTable(config, stats)
    expect(result).toContain('.github/workflows/ci.yml')
  })

  it('includes suggestions', () => {
    const result = formatPipelineTable(config, stats)
    expect(result).toContain('Add caching')
  })

  it('omits suggestions section when empty', () => {
    const noSug = { ...config, suggestions: [] }
    const result = formatPipelineTable(noSug, stats)
    expect(result).not.toContain('Suggestions')
  })

  it('shows none when no files', () => {
    const noFiles = { ...config, files: [] }
    const result = formatPipelineTable(noFiles, stats)
    expect(result).toContain('none')
  })
})

// ─── formatPipelineJson ─────────────────────────────────

describe('formatPipelineJson', () => {
  const config = {
    files: ['.github/workflows/ci.yml'],
    issues: [],
    jobs: [makeJob()],
    platform: 'github-actions',
    stages: [{ dependsOn: [], jobs: ['build'], name: 'default' }],
    suggestions: [],
  }
  const stats = computePipelineStats(config.jobs)

  it('produces valid JSON', () => {
    const json = formatPipelineJson(config, stats)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('includes platform', () => {
    const parsed = JSON.parse(formatPipelineJson(config, stats))
    expect(parsed.platform).toBe('github-actions')
  })

  it('includes jobs', () => {
    const parsed = JSON.parse(formatPipelineJson(config, stats))
    expect(parsed.jobs.length).toBe(1)
  })

  it('includes stats', () => {
    const parsed = JSON.parse(formatPipelineJson(config, stats))
    expect(parsed.stats.totalJobs).toBe(1)
  })

  it('includes stages', () => {
    const parsed = JSON.parse(formatPipelineJson(config, stats))
    expect(parsed.stages.length).toBe(1)
  })

  it('includes files', () => {
    const parsed = JSON.parse(formatPipelineJson(config, stats))
    expect(parsed.files).toContain('.github/workflows/ci.yml')
  })
})
