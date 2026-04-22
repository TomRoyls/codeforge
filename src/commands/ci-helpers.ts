import chalk from 'chalk'
import { existsSync, statSync } from 'node:fs'

export type Platform = 'all' | 'github' | 'gitlab'

export interface CiOptions {
  force: boolean
  output: string
  platform: Platform
}

export function generateGitHubActionsContent(): string {
  return `name: CodeForge Analysis

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]

permissions:
  contents: read
  security-events: write

jobs:
  analyze:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run CodeForge analysis
        run: npx codeforge analyze --format sarif --output results.sarif

      - name: Upload SARIF to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: results.sarif
          category: codeforge
`
}

export function generateGitLabCiContent(): string {
  return `stages:
  - analyze

codeforge:
  stage: analyze
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npx codeforge analyze --format gitlab --output gl-code-quality-report.json
  artifacts:
    reports:
      codequality: gl-code-quality-report.json
    expire_in: 1 week
  only:
    - main
    - master
    - develop
  except:
    - tags
`
}

export function validateOutputDir(outputDir: string): { error?: string; valid: boolean; } {
  if (!existsSync(outputDir)) {
    return { error: `Output directory does not exist: ${outputDir}`, valid: false }
  }

  if (!statSync(outputDir).isDirectory()) {
    return { error: `Output path is not a directory: ${outputDir}`, valid: false }
  }

  return { valid: true }
}

export function resolveCiOptions(flags: Record<string, unknown>): CiOptions {
  return {
    force: (flags.force as boolean) ?? false,
    output: (flags.output as string) ?? '.',
    platform: (flags.platform as Platform) ?? 'all',
  }
}

export function displayNextSteps(logFn: (msg: string) => void): void {
  logFn('')
  logFn(chalk.bold('Next steps:'))
  logFn(chalk.gray('  1. Review and customize the generated CI configuration'))
  logFn(chalk.gray('  2. Ensure codeforge is installed in your CI environment'))
  logFn(chalk.gray('  3. Commit the changes to your repository'))
}
