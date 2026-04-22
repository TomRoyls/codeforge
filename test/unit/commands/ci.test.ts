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

  function createCommandWithMockedParse(flags: Record<string, unknown>) {
    const command = new Ci([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args: {},
      flags,
    })
    return command
  }

  describe('run', () => {
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

  describe('GitHub Actions content details', () => {
    function getGitHubContent(): string {
      const cmd = new Ci([], {} as never)
      return (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
    }

    test('contains ubuntu-latest runner', () => {
      expect(getGitHubContent()).toContain('ubuntu-latest')
    })

    test('contains checkout step with v4', () => {
      expect(getGitHubContent()).toContain('actions/checkout@v4')
    })

    test('contains node-version 20', () => {
      expect(getGitHubContent()).toContain("node-version: '20'")
    })

    test('contains npm cache config', () => {
      expect(getGitHubContent()).toContain("cache: 'npm'")
    })

    test('contains main branch in push triggers', () => {
      expect(getGitHubContent()).toContain('main')
    })

    test('contains master branch in push triggers', () => {
      expect(getGitHubContent()).toContain('master')
    })

    test('contains develop branch in push triggers', () => {
      expect(getGitHubContent()).toContain('develop')
    })

    test('contains if always for SARIF upload', () => {
      expect(getGitHubContent()).toContain('if: always()')
    })

    test('contains category codeforge in SARIF config', () => {
      expect(getGitHubContent()).toContain('category: codeforge')
    })

    test('content starts with name field', () => {
      expect(getGitHubContent().startsWith('name:')).toBe(true)
    })

    test('contains multiple steps', () => {
      const content = getGitHubContent()
      const stepMatches = content.match(/- name:/g)
      expect(stepMatches).not.toBeNull()
      expect(stepMatches!.length).toBeGreaterThanOrEqual(4)
    })

    test('contains analyze job', () => {
      expect(getGitHubContent()).toContain('analyze:')
    })

    test('has proper YAML indentation structure', () => {
      const content = getGitHubContent()
      expect(content).toContain('jobs:')
      expect(content).toContain('  analyze:')
    })
  })

  describe('GitLab CI content details', () => {
    function getGitLabContent(): string {
      const cmd = new Ci([], {} as never)
      return (cmd as unknown as { generateGitLabCiContent: () => string }).generateGitLabCiContent()
    }

    test('contains codeforge job name', () => {
      expect(getGitLabContent()).toContain('codeforge:')
    })

    test('contains stages section at start', () => {
      expect(getGitLabContent().startsWith('stages:')).toBe(true)
    })

    test('contains only main/master/develop branches', () => {
      const content = getGitLabContent()
      expect(content).toContain('- main')
      expect(content).toContain('- master')
      expect(content).toContain('- develop')
    })

    test('contains except tags rule', () => {
      expect(getGitLabContent()).toContain('except:')
      expect(getGitLabContent()).toContain('- tags')
    })

    test('expire_in is 1 week', () => {
      expect(getGitLabContent()).toContain('expire_in: 1 week')
    })

    test('contains proper code quality report path', () => {
      expect(getGitLabContent()).toContain('codequality: gl-code-quality-report.json')
    })

    test('contains gitlab format flag', () => {
      expect(getGitLabContent()).toContain('--format gitlab')
    })

    test('contains gl-code-quality-report output', () => {
      expect(getGitLabContent()).toContain('--output gl-code-quality-report.json')
    })
  })

  describe('Error handling', () => {
    test('errors when output directory does not exist', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: '/nonexistent/path/that/does/not/exist',
        force: false,
      })

      await expect(cmd.run()).rejects.toThrow('does not exist')
    })

    test('errors when output path is a file not a directory', async () => {
      const filePath = path.join(tempDir, 'not-a-dir.txt')
      await fs.writeFile(filePath, 'content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: filePath,
        force: false,
      })

      await expect(cmd.run()).rejects.toThrow()
    })

    test('handles write permission errors gracefully', async () => {
      const restrictedDir = path.join(tempDir, 'restricted')
      await fs.mkdir(restrictedDir, { recursive: true })
      await fs.chmod(restrictedDir, 0o444)

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: restrictedDir,
        force: true,
      })

      try {
        await cmd.run()
      } catch {
        // Expected to throw for permission denied
      }

      await fs.chmod(restrictedDir, 0o755)
    })
  })

  describe('Force flag behavior', () => {
    test('force=false skips both files when both exist', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'old github', 'utf-8')

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await fs.writeFile(gitlabCiPath, 'old gitlab', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      expect(await fs.readFile(workflowPath, 'utf-8')).toBe('old github')
      expect(await fs.readFile(gitlabCiPath, 'utf-8')).toBe('old gitlab')
    })

    test('force=true overwrites both files', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'old github', 'utf-8')

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await fs.writeFile(gitlabCiPath, 'old gitlab', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: true,
      })
      await cmd.run()

      const githubContent = await fs.readFile(workflowPath, 'utf-8')
      const gitlabContent = await fs.readFile(gitlabCiPath, 'utf-8')

      expect(githubContent).toContain('CodeForge Analysis')
      expect(gitlabContent).toContain('stages:')
    })

    test('force creates new files when none exist', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: true,
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

  describe('Platform selection', () => {
    test('github platform does not create gitlab file', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      const exists = await fs
        .access(gitlabCiPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(false)
    })

    test('gitlab platform does not create github file', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const exists = await fs
        .access(workflowPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(false)
    })

    test('all platform creates both files', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')

      expect(
        await fs
          .access(workflowPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true)
      expect(
        await fs
          .access(gitlabCiPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true)
    })
  })

  describe('Output messages detailed', () => {
    test('github generation logs creation message', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('.github/workflows/codeforge.yml')
    })

    test('gitlab generation logs creation message', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('.gitlab-ci.yml')
    })

    test('skip message mentions --force flag', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'existing', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('--force')
    })

    test('next steps mentions review', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Review')
    })

    test('next steps mentions codeforge install', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('codeforge')
    })

    test('next steps mentions commit', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Commit')
    })

    test('skip message for GitHub Actions mentions correct file', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'existing', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('codeforge.yml')
    })
  })

  describe('Edge cases', () => {
    test('handles deeply nested output directory', async () => {
      const deepDir = path.join(tempDir, 'a', 'b', 'c', 'd')
      await fs.mkdir(deepDir, { recursive: true })

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: deepDir,
        force: false,
      })
      await cmd.run()

      const workflowPath = path.join(deepDir, '.github', 'workflows', 'codeforge.yml')
      const exists = await fs
        .access(workflowPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })

    test('handles output directory with spaces', async () => {
      const spaceDir = path.join(tempDir, 'my project')
      await fs.mkdir(spaceDir, { recursive: true })

      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: spaceDir,
        force: false,
      })
      await cmd.run()

      const gitlabCiPath = path.join(spaceDir, '.gitlab-ci.yml')
      const exists = await fs
        .access(gitlabCiPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })

    test('generated GitHub Actions YAML is multi-line', () => {
      const cmd = new Ci([], {} as never)
      const result = (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
      expect(result.split('\n').length).toBeGreaterThan(10)
    })

    test('generated GitLab CI YAML is multi-line', () => {
      const cmd = new Ci([], {} as never)
      const result = (
        cmd as unknown as { generateGitLabCiContent: () => string }
      ).generateGitLabCiContent()
      expect(result.split('\n').length).toBeGreaterThan(10)
    })

    test('GitHub Actions content ends with newline', () => {
      const cmd = new Ci([], {} as never)
      const result = (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
      expect(result.endsWith('\n')).toBe(true)
    })

    test('GitLab CI content ends with newline', () => {
      const cmd = new Ci([], {} as never)
      const result = (
        cmd as unknown as { generateGitLabCiContent: () => string }
      ).generateGitLabCiContent()
      expect(result.endsWith('\n')).toBe(true)
    })

    test('generates identical content on multiple calls', () => {
      const cmd = new Ci([], {} as never)
      const access = cmd as unknown as {
        generateGitHubActionsContent: () => string
        generateGitLabCiContent: () => string
      }
      const first = access.generateGitHubActionsContent()
      const second = access.generateGitHubActionsContent()
      expect(first).toBe(second)
    })

    test('GitLab content is identical on multiple calls', () => {
      const cmd = new Ci([], {} as never)
      const access = cmd as unknown as { generateGitLabCiContent: () => string }
      const first = access.generateGitLabCiContent()
      const second = access.generateGitLabCiContent()
      expect(first).toBe(second)
    })

    test('force=true overwrites only existing github file without touching gitlab', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'old', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: true,
      })
      await cmd.run()

      const content = await fs.readFile(workflowPath, 'utf-8')
      expect(content).toContain('CodeForge Analysis')

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      const gitlabExists = await fs
        .access(gitlabCiPath)
        .then(() => true)
        .catch(() => false)
      expect(gitlabExists).toBe(false)
    })

    test('force=true overwrites only existing gitlab file without touching github', async () => {
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await fs.writeFile(gitlabCiPath, 'old', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: true,
      })
      await cmd.run()

      const content = await fs.readFile(gitlabCiPath, 'utf-8')
      expect(content).toContain('stages:')

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const githubExists = await fs
        .access(workflowPath)
        .then(() => true)
        .catch(() => false)
      expect(githubExists).toBe(false)
    })
  })

  describe('Examples validation', () => {
    test('has at least 4 examples', () => {
      expect(Ci.examples.length).toBeGreaterThanOrEqual(4)
    })

    test('all examples have command property', () => {
      for (const example of Ci.examples as Array<{ command: string; description: string }>) {
        expect(example.command).toBeDefined()
        expect(typeof example.command).toBe('string')
      }
    })

    test('all examples have description property', () => {
      for (const example of Ci.examples as Array<{ command: string; description: string }>) {
        expect(example.description).toBeDefined()
        expect(typeof example.description).toBe('string')
      }
    })

    test('examples reference correct command id', () => {
      for (const example of Ci.examples as Array<{ command: string }>) {
        expect(example.command).toMatch(/command\.id/)
      }
    })

    test('examples include platform flag example', () => {
      const commands = (Ci.examples as Array<{ command: string }>).map((e) => e.command)
      const hasPlatform = commands.some((c) => c.includes('--platform'))
      expect(hasPlatform).toBe(true)
    })

    test('examples include output flag example', () => {
      const commands = (Ci.examples as Array<{ command: string }>).map((e) => e.command)
      const hasOutput = commands.some((c) => c.includes('--output'))
      expect(hasOutput).toBe(true)
    })

    test('examples include force flag example', () => {
      const commands = (Ci.examples as Array<{ command: string }>).map((e) => e.command)
      const hasForce = commands.some((c) => c.includes('--force'))
      expect(hasForce).toBe(true)
    })
  })

  describe('Flag defaults and options', () => {
    test('platform options are exactly github gitlab all', () => {
      expect(Ci.flags.platform.options).toEqual(['github', 'gitlab', 'all'])
    })

    test('force flag description mentions overwrite', () => {
      expect(Ci.flags.force.description).toContain('Overwrite')
    })

    test('output flag description mentions directory', () => {
      expect(Ci.flags.output.description).toContain('directory')
    })

    test('platform flag description mentions CI platform', () => {
      expect(Ci.flags.platform.description).toContain('CI platform')
    })

    test('output flag has correct char', () => {
      expect(Ci.flags.output.char).toBe('o')
    })

    test('platform flag has correct char', () => {
      expect(Ci.flags.platform.char).toBe('p')
    })

    test('force flag has correct char', () => {
      expect(Ci.flags.force.char).toBe('f')
    })

    test('ext flag is not defined', () => {
      expect(Ci.flags.ext).toBeUndefined()
    })

    test('verbose flag is not defined', () => {
      expect(Ci.flags.verbose).toBeUndefined()
    })

    test('json flag is not defined', () => {
      expect(Ci.flags.json).toBeUndefined()
    })

    test('quiet flag is not defined', () => {
      expect(Ci.flags.quiet).toBeUndefined()
    })
  })

  describe('Idempotency', () => {
    test('running twice without force produces same content', async () => {
      const cmd1 = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd1.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const firstContent = await fs.readFile(workflowPath, 'utf-8')

      const cmd2 = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: true,
      })
      await cmd2.run()

      const secondContent = await fs.readFile(workflowPath, 'utf-8')
      expect(firstContent).toBe(secondContent)
    })

    test('running gitlab twice produces same content', async () => {
      const cmd1 = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd1.run()

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      const firstContent = await fs.readFile(gitlabCiPath, 'utf-8')

      const cmd2 = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: true,
      })
      await cmd2.run()

      const secondContent = await fs.readFile(gitlabCiPath, 'utf-8')
      expect(firstContent).toBe(secondContent)
    })
  })

  describe('Output directory edge cases', () => {
    test('handles relative path output directory', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: '.',
        force: false,
      })

      try {
        await cmd.run()
      } catch {
        // May fail if cwd doesn't have expected structure
      }
    })

    test('handles temp directory with special characters', async () => {
      const specialDir = path.join(tempDir, 'ci-output')
      await fs.mkdir(specialDir, { recursive: true })

      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: specialDir,
        force: false,
      })
      await cmd.run()

      const workflowPath = path.join(specialDir, '.github', 'workflows', 'codeforge.yml')
      const exists = await fs
        .access(workflowPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })
  })

  describe('Content structure validation', () => {
    test('GitHub Actions YAML has no tab characters', () => {
      const cmd = new Ci([], {} as never)
      const result = (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
      expect(result).not.toContain('\t')
    })

    test('GitLab CI YAML has no tab characters', () => {
      const cmd = new Ci([], {} as never)
      const result = (
        cmd as unknown as { generateGitLabCiContent: () => string }
      ).generateGitLabCiContent()
      expect(result).not.toContain('\t')
    })

    test('GitHub Actions content uses consistent 2-space indentation', () => {
      const cmd = new Ci([], {} as never)
      const result = (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
      const lines = result.split('\n')
      for (const line of lines) {
        if (line.length > 0 && line.startsWith(' ')) {
          const match = line.match(/^( +)/)
          if (match) {
            expect(match[1].length % 2).toBe(0)
          }
        }
      }
    })

    test('GitLab CI content uses consistent 2-space indentation', () => {
      const cmd = new Ci([], {} as never)
      const result = (
        cmd as unknown as { generateGitLabCiContent: () => string }
      ).generateGitLabCiContent()
      const lines = result.split('\n')
      for (const line of lines) {
        if (line.length > 0 && line.startsWith(' ')) {
          const match = line.match(/^( +)/)
          if (match) {
            expect(match[1].length % 2).toBe(0)
          }
        }
      }
    })
  })

  describe('GitHub Actions step-level details', () => {
    function getGitHubContent(): string {
      const cmd = new Ci([], {} as never)
      return (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
    }

    test('contains Checkout repository step', () => {
      expect(getGitHubContent()).toContain('- name: Checkout repository')
    })

    test('contains Setup Node.js step', () => {
      expect(getGitHubContent()).toContain('- name: Setup Node.js')
    })

    test('contains Install dependencies step', () => {
      expect(getGitHubContent()).toContain('- name: Install dependencies')
    })

    test('contains Run CodeForge analysis step', () => {
      expect(getGitHubContent()).toContain('- name: Run CodeForge analysis')
    })

    test('contains Upload SARIF step', () => {
      expect(getGitHubContent()).toContain('- name: Upload SARIF to GitHub Code Scanning')
    })

    test('checkout step uses actions/checkout@v4', () => {
      const content = getGitHubContent()
      const checkoutIdx = content.indexOf('- name: Checkout repository')
      const usesIdx = content.indexOf('uses: actions/checkout@v4', checkoutIdx)
      expect(usesIdx).toBeGreaterThan(checkoutIdx)
    })

    test('setup node step uses actions/setup-node@v4', () => {
      const content = getGitHubContent()
      const setupIdx = content.indexOf('- name: Setup Node.js')
      const usesIdx = content.indexOf('uses: actions/setup-node@v4', setupIdx)
      expect(usesIdx).toBeGreaterThan(setupIdx)
    })

    test('setup node step has with block with node-version and cache', () => {
      const content = getGitHubContent()
      const setupIdx = content.indexOf('- name: Setup Node.js')
      const section = content.substring(setupIdx, content.indexOf('- name:', setupIdx + 1))
      expect(section).toContain('with:')
      expect(section).toContain('node-version')
      expect(section).toContain('cache')
    })

    test('install dependencies step runs npm ci', () => {
      const content = getGitHubContent()
      const installIdx = content.indexOf('- name: Install dependencies')
      const section = content.substring(installIdx, content.indexOf('- name:', installIdx + 1))
      expect(section).toContain('run: npm ci')
    })

    test('analyze step runs codeforge with sarif format', () => {
      const content = getGitHubContent()
      const analyzeIdx = content.indexOf('- name: Run CodeForge analysis')
      const section = content.substring(analyzeIdx, content.indexOf('- name:', analyzeIdx + 1))
      expect(section).toContain('run: npx codeforge analyze --format sarif --output results.sarif')
    })

    test('upload step uses codeql-action/upload-sarif@v3', () => {
      const content = getGitHubContent()
      const uploadIdx = content.indexOf('- name: Upload SARIF')
      const section = content.substring(uploadIdx)
      expect(section).toContain('uses: github/codeql-action/upload-sarif@v3')
    })

    test('upload step has with block with sarif_file and category', () => {
      const content = getGitHubContent()
      const uploadIdx = content.indexOf('- name: Upload SARIF')
      const section = content.substring(uploadIdx)
      expect(section).toContain('sarif_file: results.sarif')
      expect(section).toContain('category: codeforge')
    })

    test('contains exactly 5 named steps', () => {
      const content = getGitHubContent()
      const stepMatches = content.match(/- name:/g)
      expect(stepMatches).not.toBeNull()
      expect(stepMatches!.length).toBe(5)
    })
  })

  describe('GitLab CI script and config details', () => {
    function getGitLabContent(): string {
      const cmd = new Ci([], {} as never)
      return (cmd as unknown as { generateGitLabCiContent: () => string }).generateGitLabCiContent()
    }

    test('script section contains exactly 2 commands', () => {
      const content = getGitLabContent()
      const scriptIdx = content.indexOf('script:')
      const sectionAfterScript = content.substring(scriptIdx)
      const scriptSection = sectionAfterScript.split('\n').slice(1)
      const commands: string[] = []
      for (const line of scriptSection) {
        if (line.trim().startsWith('- ')) {
          commands.push(line.trim())
        } else if (line.trim() && !line.trim().startsWith('-')) {
          break
        }
      }
      expect(commands.length).toBe(2)
    })

    test('first script command is npm ci', () => {
      const content = getGitLabContent()
      const scriptIdx = content.indexOf('script:')
      const section = content.substring(scriptIdx)
      const lines = section.split('\n')
      const firstCmd = lines.find((l) => l.trim().startsWith('- npm'))
      expect(firstCmd).toBeDefined()
      expect(firstCmd!.trim()).toBe('- npm ci')
    })

    test('second script command is npx codeforge analyze', () => {
      const content = getGitLabContent()
      const scriptIdx = content.indexOf('script:')
      const section = content.substring(scriptIdx)
      const commands = section.split('\n').filter((l) => l.trim().startsWith('- '))
      expect(commands.length).toBeGreaterThanOrEqual(2)
      expect(commands[1].trim()).toContain('npx codeforge analyze')
    })

    test('only section lists exactly 3 branches', () => {
      const content = getGitLabContent()
      const onlyIdx = content.indexOf('only:')
      const onlySection = content.substring(onlyIdx)
      const onlyBranches: string[] = []
      let counting = false
      for (const line of onlySection.split('\n')) {
        if (line.trim() === 'only:') {
          counting = true
          continue
        }
        if (counting) {
          if (line.trim().startsWith('- ')) {
            onlyBranches.push(line.trim())
          } else if (line.trim() && !line.trim().startsWith('-')) {
            break
          }
        }
      }
      expect(onlyBranches.length).toBe(3)
    })

    test('cache section has paths key with node_modules', () => {
      const content = getGitLabContent()
      const cacheIdx = content.indexOf('cache:')
      const cacheSection = content.substring(cacheIdx, content.indexOf('script:'))
      expect(cacheSection).toContain('paths:')
      expect(cacheSection).toContain('node_modules/')
    })

    test('artifacts section has reports key', () => {
      const content = getGitLabContent()
      expect(content).toContain('artifacts:')
      expect(content).toContain('reports:')
    })

    test('artifacts reports has codequality key', () => {
      const content = getGitLabContent()
      expect(content).toContain('codequality: gl-code-quality-report.json')
    })

    test('except section contains tags', () => {
      const content = getGitLabContent()
      const exceptIdx = content.indexOf('except:')
      const exceptSection = content.substring(exceptIdx)
      expect(exceptSection).toContain('- tags')
    })

    test('codeforge job has stage analyze', () => {
      const content = getGitLabContent()
      expect(content).toContain('codeforge:')
      expect(content).toContain('stage: analyze')
    })

    test('codeforge job uses node:20 image', () => {
      const content = getGitLabContent()
      expect(content).toContain('image: node:20')
    })
  })

  describe('YAML quality checks', () => {
    function getGitHubContent(): string {
      const cmd = new Ci([], {} as never)
      return (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
    }

    function getGitLabContent(): string {
      const cmd = new Ci([], {} as never)
      return (cmd as unknown as { generateGitLabCiContent: () => string }).generateGitLabCiContent()
    }

    test('GitHub content has no trailing spaces on non-empty lines', () => {
      const lines = getGitHubContent().split('\n')
      for (const line of lines) {
        if (line.length > 0) {
          expect(line).not.toMatch(/ $/)
        }
      }
    })

    test('GitLab content has no trailing spaces on non-empty lines', () => {
      const lines = getGitLabContent().split('\n')
      for (const line of lines) {
        if (line.length > 0) {
          expect(line).not.toMatch(/ $/)
        }
      }
    })

    test('GitHub content uses LF line endings not CRLF', () => {
      expect(getGitHubContent()).not.toContain('\r\n')
    })

    test('GitLab content uses LF line endings not CRLF', () => {
      expect(getGitLabContent()).not.toContain('\r\n')
    })

    test('GitHub content has no BOM marker', () => {
      const content = getGitHubContent()
      expect(content.charCodeAt(0)).not.toBe(0xfeff)
    })

    test('GitLab content has no BOM marker', () => {
      const content = getGitLabContent()
      expect(content.charCodeAt(0)).not.toBe(0xfeff)
    })

    test('GitHub content has at least 20 lines', () => {
      expect(getGitHubContent().split('\n').length).toBeGreaterThanOrEqual(20)
    })

    test('GitLab content has at least 15 lines', () => {
      expect(getGitLabContent().split('\n').length).toBeGreaterThanOrEqual(15)
    })
  })

  describe('Written file content matches generated', () => {
    test('written GitHub file matches generated content exactly', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const genCmd = new Ci([], {} as never)
      const generated = (
        genCmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const written = await fs.readFile(workflowPath, 'utf-8')
      expect(written).toBe(generated)
    })

    test('written GitLab file matches generated content exactly', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const genCmd = new Ci([], {} as never)
      const generated = (
        genCmd as unknown as { generateGitLabCiContent: () => string }
      ).generateGitLabCiContent()

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      const written = await fs.readFile(gitlabCiPath, 'utf-8')
      expect(written).toBe(generated)
    })

    test('GitHub file contains valid YAML keys', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const content = await fs.readFile(workflowPath, 'utf-8')
      expect(content).toContain('name:')
      expect(content).toContain('on:')
      expect(content).toContain('jobs:')
      expect(content).toContain('steps:')
    })

    test('GitLab file contains valid YAML keys', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      const content = await fs.readFile(gitlabCiPath, 'utf-8')
      expect(content).toContain('stages:')
      expect(content).toContain('script:')
      expect(content).toContain('image:')
    })

    test('written file is readable as UTF-8', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const buffer = await fs.readFile(workflowPath)
      const content = buffer.toString('utf-8')
      expect(content.length).toBeGreaterThan(0)
      expect(content).toContain('CodeForge')
    })

    test('file exists after creation', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await expect(fs.access(gitlabCiPath)).resolves.toBeUndefined()
    })
  })

  describe('Error message content', () => {
    test('non-existent dir error includes the path', async () => {
      const badPath = '/nonexistent/path/that/does/not/exist'
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: badPath,
        force: false,
      })

      await expect(cmd.run()).rejects.toThrow(badPath)
    })

    test('non-existent dir error starts with Output directory', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: '/nonexistent/path/that/does/not/exist',
        force: false,
      })

      await expect(cmd.run()).rejects.toThrow('Output directory')
    })

    test('file-as-dir error includes not a directory', async () => {
      const filePath = path.join(tempDir, 'not-a-dir.txt')
      await fs.writeFile(filePath, 'content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: filePath,
        force: false,
      })

      await expect(cmd.run()).rejects.toThrow('not a directory')
    })

    test('file-as-dir error includes the path', async () => {
      const filePath = path.join(tempDir, 'not-a-dir.txt')
      await fs.writeFile(filePath, 'content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: filePath,
        force: false,
      })

      await expect(cmd.run()).rejects.toThrow(filePath)
    })

    test('file-as-dir error starts with Output path', async () => {
      const filePath = path.join(tempDir, 'not-a-dir.txt')
      await fs.writeFile(filePath, 'content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: filePath,
        force: false,
      })

      await expect(cmd.run()).rejects.toThrow('Output path')
    })

    test('error with deeply nested non-existent path', async () => {
      const deepPath = '/a/b/c/d/e/f/g/h'
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: deepPath,
        force: false,
      })

      await expect(cmd.run()).rejects.toThrow('does not exist')
    })
  })

  describe('Force and platform combinations', () => {
    test('all + force=false + only github exists = skips github, creates gitlab', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'old github', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      expect(await fs.readFile(workflowPath, 'utf-8')).toBe('old github')
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      const gitlabContent = await fs.readFile(gitlabCiPath, 'utf-8')
      expect(gitlabContent).toContain('stages:')
    })

    test('all + force=false + only gitlab exists = creates github, skips gitlab', async () => {
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await fs.writeFile(gitlabCiPath, 'old gitlab', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      expect(await fs.readFile(gitlabCiPath, 'utf-8')).toBe('old gitlab')
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const githubContent = await fs.readFile(workflowPath, 'utf-8')
      expect(githubContent).toContain('CodeForge Analysis')
    })

    test('all + force=true + only github exists = overwrites github, creates gitlab', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'old github', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: true,
      })
      await cmd.run()

      expect(await fs.readFile(workflowPath, 'utf-8')).toContain('CodeForge Analysis')
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      expect(await fs.readFile(gitlabCiPath, 'utf-8')).toContain('stages:')
    })

    test('all + force=true + only gitlab exists = creates github, overwrites gitlab', async () => {
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await fs.writeFile(gitlabCiPath, 'old gitlab', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: true,
      })
      await cmd.run()

      expect(await fs.readFile(gitlabCiPath, 'utf-8')).toContain('stages:')
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      expect(await fs.readFile(workflowPath, 'utf-8')).toContain('CodeForge Analysis')
    })

    test('github + force=false + no existing file = creates new', async () => {
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

    test('gitlab + force=false + no existing file = creates new', async () => {
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

    test('github with custom output dir creates in custom dir', async () => {
      const customDir = path.join(tempDir, 'custom-github')
      await fs.mkdir(customDir, { recursive: true })

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: customDir,
        force: false,
      })
      await cmd.run()

      const workflowPath = path.join(customDir, '.github', 'workflows', 'codeforge.yml')
      const exists = await fs
        .access(workflowPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })

    test('gitlab with custom output dir creates in custom dir', async () => {
      const customDir = path.join(tempDir, 'custom-gitlab')
      await fs.mkdir(customDir, { recursive: true })

      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: customDir,
        force: false,
      })
      await cmd.run()

      const gitlabCiPath = path.join(customDir, '.gitlab-ci.yml')
      const exists = await fs
        .access(gitlabCiPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })
  })

  describe('Output messages extended', () => {
    test('skip message for GitHub mentions already exists', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'existing', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('already exists')
    })

    test('skip message for GitLab mentions already exists', async () => {
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await fs.writeFile(gitlabCiPath, 'existing', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('already exists')
    })

    test('skip message for GitHub contains --force suggestion', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'existing', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Use --force to overwrite')
    })

    test('skip message for GitLab contains --force suggestion', async () => {
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await fs.writeFile(gitlabCiPath, 'existing', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Use --force to overwrite')
    })

    test('next steps mentions customize', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('customize')
    })

    test('next steps step 1 mentions Review', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Review')
    })

    test('next steps step 3 mentions Commit', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Commit')
    })

    test('empty line is logged before next steps', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const calls = mockConsoleLog.mock.calls.map((c) => c[0])
      const emptyIdx = calls.indexOf('')
      const nextStepsIdx = calls.findIndex((c) => typeof c === 'string' && c.includes('Next steps'))
      expect(emptyIdx).toBeGreaterThan(-1)
      expect(nextStepsIdx).toBeGreaterThan(-1)
      expect(nextStepsIdx).toBeGreaterThan(emptyIdx)
    })
  })

  describe('Content specific values', () => {
    function getGitHubContent(): string {
      const cmd = new Ci([], {} as never)
      return (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
    }

    function getGitLabContent(): string {
      const cmd = new Ci([], {} as never)
      return (cmd as unknown as { generateGitLabCiContent: () => string }).generateGitLabCiContent()
    }

    test('GitHub branches list contains main master develop in order', () => {
      const content = getGitHubContent()
      const mainIdx = content.indexOf('main')
      const masterIdx = content.indexOf('master')
      const developIdx = content.indexOf('develop')
      expect(mainIdx).toBeGreaterThan(-1)
      expect(masterIdx).toBeGreaterThan(mainIdx)
      expect(developIdx).toBeGreaterThan(masterIdx)
    })

    test('GitHub permissions has contents read', () => {
      const content = getGitHubContent()
      expect(content).toContain('contents: read')
    })

    test('GitHub permissions has security-events write', () => {
      const content = getGitHubContent()
      expect(content).toContain('security-events: write')
    })

    test('GitLab stage value is analyze', () => {
      expect(getGitLabContent()).toContain('stage: analyze')
    })

    test('GitHub analyze command uses sarif format', () => {
      const content = getGitHubContent()
      expect(content).toContain('--format sarif')
    })

    test('GitLab script commands are in correct order', () => {
      const content = getGitLabContent()
      const npmCiIdx = content.indexOf('npm ci')
      const npxIdx = content.indexOf('npx codeforge')
      expect(npxIdx).toBeGreaterThan(npmCiIdx)
    })

    test('GitHub SARIF category is codeforge', () => {
      expect(getGitHubContent()).toContain('category: codeforge')
    })

    test('GitLab artifacts expire_in is 1 week', () => {
      expect(getGitLabContent()).toContain('expire_in: 1 week')
    })

    test('GitLab except section has tags', () => {
      const content = getGitLabContent()
      expect(content).toContain('except:')
      expect(content).toContain('- tags')
    })

    test('GitHub content contains uses keyword for actions', () => {
      expect(getGitHubContent()).toContain('uses:')
    })

    test('GitLab content contains image keyword', () => {
      expect(getGitLabContent()).toContain('image:')
    })
  })

  describe('Default flag behavior at runtime', () => {
    test('force false does not overwrite existing GitHub file', async () => {
      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      await fs.mkdir(path.dirname(workflowPath), { recursive: true })
      await fs.writeFile(workflowPath, 'preserved content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      expect(await fs.readFile(workflowPath, 'utf-8')).toBe('preserved content')
    })

    test('force false does not overwrite existing GitLab file', async () => {
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      await fs.writeFile(gitlabCiPath, 'preserved content', 'utf-8')

      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      expect(await fs.readFile(gitlabCiPath, 'utf-8')).toBe('preserved content')
    })

    test('running github then gitlab creates both files independently', async () => {
      const cmd1 = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd1.run()

      const cmd2 = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd2.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')

      expect(
        await fs
          .access(workflowPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true)
      expect(
        await fs
          .access(gitlabCiPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true)
    })

    test('can run with force true on fresh directory', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: true,
      })
      await cmd.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')

      expect(
        await fs
          .access(workflowPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true)
      expect(
        await fs
          .access(gitlabCiPath)
          .then(() => true)
          .catch(() => false),
      ).toBe(true)
    })

    test('multiple sequential github runs produce identical files', async () => {
      const cmd1 = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd1.run()

      const cmd2 = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: true,
      })
      await cmd2.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const content = await fs.readFile(workflowPath, 'utf-8')
      expect(content).toContain('CodeForge Analysis')
    })

    test('switching platforms between runs works', async () => {
      const cmd1 = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd1.run()

      const cmd2 = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd2.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')

      const githubContent = await fs.readFile(workflowPath, 'utf-8')
      const gitlabContent = await fs.readFile(gitlabCiPath, 'utf-8')

      expect(githubContent).toContain('CodeForge Analysis')
      expect(gitlabContent).toContain('stages:')
    })
  })

  describe('Command class properties', () => {
    test('Ci class can be instantiated', () => {
      const cmd = new Ci([], {} as never)
      expect(cmd).toBeDefined()
    })

    test('Ci.description is a non-empty string', () => {
      expect(typeof Ci.description).toBe('string')
      expect(Ci.description.length).toBeGreaterThan(0)
    })

    test('Ci.examples is a non-empty array', () => {
      expect(Array.isArray(Ci.examples)).toBe(true)
      expect(Ci.examples.length).toBeGreaterThan(0)
    })

    test('Ci.flags has exactly force output platform keys', () => {
      const flagKeys = Object.keys(Ci.flags)
      expect(flagKeys).toContain('force')
      expect(flagKeys).toContain('output')
      expect(flagKeys).toContain('platform')
    })

    test('all flags have string descriptions', () => {
      for (const [, flag] of Object.entries(Ci.flags)) {
        expect(typeof flag.description).toBe('string')
        expect(flag.description.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Directory structure creation', () => {
    test('GitHub creates .github directory', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const githubDir = path.join(tempDir, '.github')
      const stat = await fs.stat(githubDir)
      expect(stat.isDirectory()).toBe(true)
    })

    test('GitHub creates .github/workflows directory', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const workflowsDir = path.join(tempDir, '.github', 'workflows')
      const stat = await fs.stat(workflowsDir)
      expect(stat.isDirectory()).toBe(true)
    })

    test('GitLab creates file directly in output dir', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const gitlabCiPath = path.join(tempDir, '.gitlab-ci.yml')
      const stat = await fs.stat(gitlabCiPath)
      expect(stat.isFile()).toBe(true)
    })

    test('GitHub file path is .github/workflows/codeforge.yml', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const expectedPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const exists = await fs
        .access(expectedPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })

    test('GitLab file path is .gitlab-ci.yml', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'gitlab',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const expectedPath = path.join(tempDir, '.gitlab-ci.yml')
      const exists = await fs
        .access(expectedPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })

    test('running all platforms creates correct directory tree', async () => {
      const cmd = createCommandWithMockedParse({
        platform: 'all',
        output: tempDir,
        force: false,
      })
      await cmd.run()

      const githubDir = path.join(tempDir, '.github')
      const workflowsDir = path.join(tempDir, '.github', 'workflows')
      const workflowFile = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const gitlabFile = path.join(tempDir, '.gitlab-ci.yml')

      expect((await fs.stat(githubDir)).isDirectory()).toBe(true)
      expect((await fs.stat(workflowsDir)).isDirectory()).toBe(true)
      expect((await fs.stat(workflowFile)).isFile()).toBe(true)
      expect((await fs.stat(gitlabFile)).isFile()).toBe(true)
    })
  })

  describe('Content does not contain hardcoded paths', () => {
    function getGitHubContent(): string {
      const cmd = new Ci([], {} as never)
      return (
        cmd as unknown as { generateGitHubActionsContent: () => string }
      ).generateGitHubActionsContent()
    }

    function getGitLabContent(): string {
      const cmd = new Ci([], {} as never)
      return (cmd as unknown as { generateGitLabCiContent: () => string }).generateGitLabCiContent()
    }

    test('GitHub content does not contain absolute paths', () => {
      expect(getGitHubContent()).not.toContain('/tmp/')
      expect(getGitHubContent()).not.toContain('/home/')
    })

    test('GitLab content does not contain absolute paths', () => {
      expect(getGitLabContent()).not.toContain('/tmp/')
      expect(getGitLabContent()).not.toContain('/home/')
    })

    test('GitHub content does not contain Windows paths', () => {
      expect(getGitHubContent()).not.toContain('C:\\')
    })

    test('GitLab content does not contain Windows paths', () => {
      expect(getGitLabContent()).not.toContain('C:\\')
    })

    test('GitHub content has on section with push and pull_request', () => {
      const content = getGitHubContent()
      const onIdx = content.indexOf('on:')
      const section = content.substring(onIdx, content.indexOf('permissions:'))
      expect(section).toContain('push:')
      expect(section).toContain('pull_request:')
    })

    test('GitLab content has stages section at beginning', () => {
      expect(getGitLabContent().indexOf('stages:')).toBe(0)
    })

    test('GitHub content has non-empty name value', () => {
      expect(getGitHubContent()).toContain('name: CodeForge Analysis')
    })

    test('GitLab content has analyze as only stage', () => {
      const content = getGitLabContent()
      expect(content).toContain('stages:\n  - analyze')
    })

    test('GitHub generated file content matches between fresh and force', async () => {
      const cmd1 = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: false,
      })
      await cmd1.run()

      const workflowPath = path.join(tempDir, '.github', 'workflows', 'codeforge.yml')
      const freshContent = await fs.readFile(workflowPath, 'utf-8')

      const cmd2 = createCommandWithMockedParse({
        platform: 'github',
        output: tempDir,
        force: true,
      })
      await cmd2.run()
      const forceContent = await fs.readFile(workflowPath, 'utf-8')

      expect(freshContent).toBe(forceContent)
    })
  })
})
