import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

describe('Ci Command', () => {
  let Ci: typeof import('../../../src/commands/ci.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Ci = (await import('../../../src/commands/ci.js')).default
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-ci-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Ci.description).toBe(
        'Generate CI/CD configuration files for GitHub Actions and GitLab CI',
      )
    })

    test('has examples defined', () => {
      expect(Ci.examples).toBeDefined()
      expect(Ci.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Ci.flags).toBeDefined()
      expect(Ci.flags.platform).toBeDefined()
      expect(Ci.flags.output).toBeDefined()
      expect(Ci.flags.force).toBeDefined()
    })

    test('platform flag has correct options', () => {
      expect(Ci.flags.platform.options).toContain('github')
      expect(Ci.flags.platform.options).toContain('gitlab')
      expect(Ci.flags.platform.options).toContain('all')
    })

    test('platform flag has default value all', () => {
      expect(Ci.flags.platform.default).toBe('all')
    })

    test('output flag has default value .', () => {
      expect(Ci.flags.output.default).toBe('.')
    })

    test('force flag has default false', () => {
      expect(Ci.flags.force.default).toBe(false)
    })
  })

  describe('Flag characters', () => {
    test('platform flag has char p', () => {
      expect(Ci.flags.platform.char).toBe('p')
    })

    test('output flag has char o', () => {
      expect(Ci.flags.output.char).toBe('o')
    })

    test('force flag has char f', () => {
      expect(Ci.flags.force.char).toBe('f')
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Ci([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      return command
    }

    describe('GitHub Actions generation', () => {
      test('creates GitHub Actions workflow file', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'github',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
        const exists = await fs
          .access(workflowPath)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('creates GitHub Actions with correct content', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'github',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
        const content = await fs.readFile(workflowPath, 'utf-8')

        expect(content).toContain('name: CodeForge Analysis')
        expect(content).toContain('on:')
        expect(content).toContain('push:')
        expect(content).toContain('pull_request:')
        expect(content).toContain('actions/checkout@v4')
        expect(content).toContain('actions/setup-node@v4')
        expect(content).toContain('npm ci')
        expect(content).toContain('npx codeforge analyze')
        expect(content).toContain('--format sarif')
        expect(content).toContain('--output results.sarif')
      })

      test('skips GitHub Actions when file exists and force is false', async () => {
        const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
        await fs.mkdir(path.dirname(workflowPath), { recursive: true })
        await fs.writeFile(workflowPath, 'old content', 'utf-8')

        const cmd = createCommandWithMockedParse({
          platform: 'github',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const content = await fs.readFile(workflowPath, 'utf-8')
        expect(content).toBe('old content')
      })

      test('overwrites GitHub Actions when force is true', async () => {
        const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
        await fs.mkdir(path.dirname(workflowPath), { recursive: true })
        await fs.writeFile(workflowPath, 'old content', 'utf-8')

        const cmd = createCommandWithMockedParse({
          platform: 'github',
          output: tempDir,
          force: true,
        })
        await cmd.run()

        const content = await fs.readFile(workflowPath, 'utf-8')
        expect(content).toContain('name: CodeForge Analysis')
      })
    })

    describe('GitLab CI generation', () => {
      test('creates GitLab CI file', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'gitlab',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
        const exists = await fs
          .access(gitlabCiPath)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })

      test('creates GitLab CI with correct content', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'gitlab',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
        const content = await fs.readFile(gitlabCiPath, 'utf-8')

        expect(content).toContain('stages:')
        expect(content).toContain('- analyze')
        expect(content).toContain('codeforge:')
        expect(content).toContain('image: node:20')
        expect(content).toContain('npm ci')
        expect(content).toContain('npx codeforge analyze')
      })

      test('skips GitLab CI when file exists and force is false', async () => {
        const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
        await fs.writeFile(gitlabCiPath, 'old content', 'utf-8')

        const cmd = createCommandWithMockedParse({
          platform: 'gitlab',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const content = await fs.readFile(gitlabCiPath, 'utf-8')
        expect(content).toBe('old content')
      })

      test('overwrites GitLab CI when force is true', async () => {
        const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
        await fs.writeFile(gitlabCiPath, 'old content', 'utf-8')

        const cmd = createCommandWithMockedParse({
          platform: 'gitlab',
          output: tempDir,
          force: true,
        })
        await cmd.run()

        const content = await fs.readFile(gitlabCiPath, 'utf-8')
        expect(content).toContain('stages:')
      })
    })

    describe('All platforms', () => {
      test('creates both files when platform is all', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'all',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
        const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')

        const githubExists = await fs
          .access(workflowPath)
          .then(() => true)
          .catch(() => false)
        const gitlabExists = await fs
          .access(gitlabCiPath)
          .then(() => true)
          .catch(() => false)

        expect(githubExists).toBe(true)
        expect(gitlabExists).toBe(true)
      })
    })

    describe('Output directory', () => {
      test('creates files in custom output directory', async () => {
        const customDir = path.join(tempDir, 'custom')
        await fs.mkdir(customDir, { recursive: true })

        const cmd = createCommandWithMockedParse({
          platform: 'all',
          output: customDir,
          force: false,
        })
        await cmd.run()

        const workflowPath = path.join(customDir, '.github', 'workflows', 'codeforge.yml')
        const gitlabCiPath = path.join(customDir, '.gitlab-ci.yml')

        const githubExists = await fs
          .access(workflowPath)
          .then(() => true)
          .catch(() => false)
        const gitlabExists = await fs
          .access(gitlabCiPath)
          .then(() => true)
          .catch(() => false)

        expect(githubExists).toBe(true)
        expect(gitlabExists).toBe(true)
      })

      test('creates nested directories if needed', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'github',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
        const exists = await fs
          .access(workflowPath)
          .then(() => true)
          .catch(() => false)
        expect(exists).toBe(true)
      })
    })

    describe('Output messages', () => {
      test('outputs success message for GitHub Actions', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'github',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Created')
        expect(output).toContain('codeforge.yml')
      })

      test('outputs success message for GitLab CI', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'gitlab',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Created')
        expect(output).toContain('.gitlab-ci.yml')
      })

      test('outputs next steps', async () => {
        const cmd = createCommandWithMockedParse({
          platform: 'github',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Next steps')
      })

      test('outputs skip message when file exists and force is false', async () => {
        const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
        await fs.writeFile(gitlabCiPath, 'old content', 'utf-8')

        const cmd = createCommandWithMockedParse({
          platform: 'gitlab',
          output: tempDir,
          force: false,
        })
        await cmd.run()

        const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
        expect(output).toContain('Skipping')
      })
    })

    describe('Private methods', () => {
      describe('generateGitHubActionsContent', () => {
        test('generates valid YAML content', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitHubActionsContent: () => string }
          ).generateGitHubActionsContent()

          expect(result).toContain('name:')
          expect(result).toContain('on:')
          expect(result).toContain('jobs:')
          expect(result).toContain('runs-on:')
          expect(result).toContain('steps:')
        })

        test('includes push and pull_request triggers', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitHubActionsContent: () => string }
          ).generateGitHubActionsContent()

          expect(result).toContain('push:')
          expect(result).toContain('pull_request:')
          expect(result).toContain('branches:')
        })

        test('includes Node.js setup', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitHubActionsContent: () => string }
          ).generateGitHubActionsContent()

          expect(result).toContain('actions/setup-node@v4')
          expect(result).toContain("node-version: '20'")
        })

        test('includes npm install command', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitHubActionsContent: () => string }
          ).generateGitHubActionsContent()

          expect(result).toContain('npm ci')
        })

        test('includes codeforge analyze command', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitHubActionsContent: () => string }
          ).generateGitHubActionsContent()

          expect(result).toContain('npx codeforge analyze')
          expect(result).toContain('--format sarif')
          expect(result).toContain('--output results.sarif')
        })

        test('includes SARIF upload step', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitHubActionsContent: () => string }
          ).generateGitHubActionsContent()

          expect(result).toContain('github/codeql-action/upload-sarif@v3')
          expect(result).toContain('sarif_file: results.sarif')
          expect(result).toContain('category: codeforge')
        })

        test('includes permissions for security-events', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitHubActionsContent: () => string }
          ).generateGitHubActionsContent()

          expect(result).toContain('permissions:')
          expect(result).toContain('security-events: write')
          expect(result).toContain('contents: read')
        })
      })

      describe('generateGitLabCiContent', () => {
        test('generates valid YAML content', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitLabCiContent: () => string }
          ).generateGitLabCiContent()

          expect(result).toContain('stages:')
          expect(result).toContain('script:')
        })

        test('includes analyze stage', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitLabCiContent: () => string }
          ).generateGitLabCiContent()

          expect(result).toContain('stage: analyze')
        })

        test('includes Node.js image', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitLabCiContent: () => string }
          ).generateGitLabCiContent()

          expect(result).toContain('image: node:20')
        })

        test('includes npm install command', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitLabCiContent: () => string }
          ).generateGitLabCiContent()

          expect(result).toContain('npm ci')
        })

        test('includes codeforge analyze command', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitLabCiContent: () => string }
          ).generateGitLabCiContent()

          expect(result).toContain('npx codeforge analyze')
          expect(result).toContain('--format gitlab')
          expect(result).toContain('--output gl-code-quality-report.json')
        })

        test('includes code quality artifacts', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitLabCiContent: () => string }
          ).generateGitLabCiContent()

          expect(result).toContain('artifacts:')
          expect(result).toContain('reports:')
          expect(result).toContain('codequality: gl-code-quality-report.json')
          expect(result).toContain('expire_in: 1 week')
        })

        test('includes branch configuration', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitLabCiContent: () => string }
          ).generateGitLabCiContent()

          expect(result).toContain('only:')
          expect(result).toContain('- main')
        })

        test('includes cache configuration', () => {
          const cmd = new Ci([], {} as never)
          const result = (
            cmd as unknown as { generateGitLabCiContent: () => string }
          ).generateGitLabCiContent()

          expect(result).toContain('cache:')
          expect(result).toContain('node_modules/')
        })
      })
    })
  })
})
