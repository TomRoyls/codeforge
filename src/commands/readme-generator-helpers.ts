// ─── Types ──────────────────────────────────────────────

export type PackageJsonReader = (cwd: string) => Promise<Record<string, unknown> | null>
export type ContentReader = (filePath: string) => Promise<string>
export type FileLister = (cwd: string) => Promise<string[]>

export interface ReadmeCommand {
  description: string
  examples: string[]
  flags: string[]
  name: string
  usage: string
}

export interface ReadmeData {
  badges: string[]
  commands: ReadmeCommand[]
  description: string
  features: string[]
  installation: string
  license: string
  projectName: string
  requirements: string[]
  scripts: Record<string, string>
  techStack: string[]
  version: string
}

export interface ReadmeSection {
  content: string
  order: number
  title: string
}

export interface ReadmeResult {
  data: ReadmeData
  markdown: string
  sections: ReadmeSection[]
}

export interface ReadmeOptions {
  template: 'commands' | 'full' | 'minimal'
  verbose?: boolean
}

// ─── extractProjectInfo ─────────────────────────────────

/**
 * @example
 * const info = await extractProjectInfo('/path', reader)
 * console.log(info.projectName)
 */
export async function extractProjectInfo(
  cwd: string,
  packageReader: PackageJsonReader,
): Promise<ReadmeData> {
  const pkg = await packageReader(cwd)

  const name = (pkg?.name as string) ?? 'unknown-project'
  const description = (pkg?.description as string) ?? ''
  const version = (pkg?.version as string) ?? '0.0.0'
  const license = (pkg?.license as string) ?? 'MIT'

  const engines = pkg?.engines as Record<string, string> | undefined
  const requirements: string[] = []
  if (engines) {
    for (const [key, value] of Object.entries(engines)) {
      requirements.push(`${key} ${value}`)
    }
  }

  const scripts: Record<string, string> = {}
  const scriptsObj = pkg?.scripts as Record<string, string> | undefined
  if (scriptsObj) {
    for (const [key, value] of Object.entries(scriptsObj)) {
      scripts[key] = value
    }
  }

  return {
    badges: [],
    commands: [],
    description,
    features: [],
    installation: `npm install -g ${name}`,
    license,
    projectName: name,
    requirements,
    scripts,
    techStack: [],
    version,
  }
}

// ─── extractCommands ────────────────────────────────────

/**
 * @example
 * const cmds = extractCommands(commandsDir, reader)
 * console.log(cmds.length)
 */
export async function extractCommands(
  commandFiles: string[],
  contentReader: ContentReader,
): Promise<ReadmeCommand[]> {
  const commands: ReadmeCommand[] = []

  for (const file of commandFiles) {
    try {
      const content = await contentReader(file)
      const nameMatch = content.match(/static\s+override\s+description\s*=\s*['"](.+?)['"]/)
      const desc = nameMatch?.[1] ?? ''

      const baseName = file
        .replace(/\\/g, '/')
        .split('/')
        .at(-1) ?? ''
        .replace(/\.(ts|js)$/, '')

      const usage = `codeforge ${baseName} [path]`

      const flagMatches = content.matchAll(/static\s+override\s+flags\s*=\s*\{([\s\S]*?)\}/g)
      const flags: string[] = []
      for (const fm of flagMatches) {
      const flags: string[] = []
      const flagNames = (fm[1] ?? '').matchAll(/(\w+):\s*Flags\./g)
        for (const fn of flagNames) {
          if (fn[1]) flags.push(`--${fn[1]}`)
        }
      }

      const exampleMatches = content.matchAll(/command:\s*['"]<%=\s*config\.bin\s*%>\s*<%=\s*command\.id\s*%>\s*(.+?)['"]/g)
      const examples: string[] = []
      for (const em of exampleMatches) {
        examples.push(`codeforge ${baseName} ${em[1]}`)
      }

      if (desc) {
        commands.push({ description: desc, examples, flags, name: baseName, usage })
      }
    } catch {
      continue
    }
  }

  return commands.sort((a, b) => a.name.localeCompare(b.name))
}

// ─── detectFeatures ─────────────────────────────────────

/**
 * @example
 * const features = detectFeatures(['.ts', '.test.ts'], { 'app.ts': 'import chalk' })
 * console.log(features)
 */
export function detectFeatures(
  _files: string[],
  contents: Record<string, string>,
): string[] {
  const features = new Set<string>()

  const allContent = Object.values(contents).join('\n')

  if (/import.*chalk/.test(allContent)) features.add('Colorized output')
  if (/import.*ora/.test(allContent)) features.add('Progress spinners')
  if (/import.*@oclif/.test(allContent)) features.add('CLI framework (oclif)')
  if (/vitest/.test(allContent)) features.add('Testing with Vitest')
  if (/import.*ts-morph/.test(allContent)) features.add('TypeScript AST analysis')
  if (/import.*fast-glob/.test(allContent) || /import.*fg/.test(allContent)) features.add('Fast file discovery')
  if (/\.test\.|\.spec\./.test(allContent)) features.add('Test suite')
  if (/eslint|prettier/.test(allContent)) features.add('Code quality tools')
  if (/import.*node:fs/.test(allContent)) features.add('File system operations')
  if (/discoverFiles/.test(allContent)) features.add('File discovery engine')

  return [...features].sort()
}

// ─── detectTechStack ────────────────────────────────────

/**
 * @example
 * const stack = detectTechStack({ dependencies: { chalk: '5.0.0' } })
 * console.log(stack)
 */
export function detectTechStack(packageJson: Record<string, unknown>): string[] {
  const stack = new Set<string>()

  const deps = packageJson.dependencies as Record<string, string> | undefined
  const devDeps = packageJson.devDependencies as Record<string, string> | undefined
  const allDeps = { ...deps, ...devDeps }

  const stackMap: Record<string, string> = {
    '@oclif/core': 'Oclif CLI Framework',
    '@oclif/plugin-help': 'Oclif Help Plugin',
    '@swc/core': 'SWC Parser',
    chalk: 'Chalk (Terminal Colors)',
    eslint: 'ESLint',
    'fast-glob': 'Fast-Glob',
    ora: 'Ora (Spinners)',
    prettier: 'Prettier',
    'ts-morph': 'ts-morph (TypeScript AST)',
    typescript: 'TypeScript',
    vitest: 'Vitest',
  }

  for (const [dep, label] of Object.entries(stackMap)) {
    if (allDeps[dep]) stack.add(label)
  }

  return [...stack].sort()
}

// ─── generateBadges ─────────────────────────────────────

/**
 * @example
 * const badges = generateBadges({ projectName: 'my-app', license: 'MIT', version: '1.0.0' })
 * console.log(badges.length)
 */
export function generateBadges(data: ReadmeData): string[] {
  const badges: string[] = []

  badges.push(
    `[![npm version](https://img.shields.io/npm/v/${data.projectName}.svg)](https://npmjs.org/package/${data.projectName})`,
  )
  badges.push(
    `[![License: ${data.license}](https://img.shields.io/badge/License-${data.license}-yellow.svg)](https://opensource.org/licenses/${data.license})`,
  )

  if (data.version) {
    badges.push(
      `![version](https://img.shields.io/badge/version-${data.version}-blue.svg)`,
    )
  }

  return badges
}

// ─── generateInstallationSection ────────────────────────

/**
 * @example
 * const md = generateInstallationSection({ installation: 'npm install -g my-app' })
 * console.log(md)
 */
export function generateInstallationSection(data: ReadmeData): string {
  const lines = [
    '## Installation',
    '',
    '```bash',
    data.installation,
    '```',
    '',
  ]

  if (data.requirements.length > 0) {
    lines.push('### Requirements', '')
    for (const req of data.requirements) {
      lines.push(`- ${req}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── generateUsageSection ───────────────────────────────

/**
 * @example
 * const md = generateUsageSection([{ name: 'analyze', usage: 'codeforge analyze', description: 'Analyze code', flags: [], examples: [] }])
 * console.log(md)
 */
export function generateUsageSection(commands: ReadmeCommand[]): string {
  const lines = [
    '## Usage',
    '',
    '```bash',
    '$ codeforge --help',
    '```',
    '',
  ]

  if (commands.length > 0) {
    const first = commands[0]
    if (first) {
      lines.push('```bash')
      lines.push(`$ ${first.usage}`)
      lines.push('```', '')
    }
  }

  return lines.join('\n')
}

// ─── generateCommandsSection ────────────────────────────

/**
 * @example
 * const md = generateCommandsSection(commands)
 * console.log(md.includes('| Command'))
 */
export function generateCommandsSection(commands: ReadmeCommand[]): string {
  if (commands.length === 0) return ''

  const lines = [
    '## Commands',
    '',
    '| Command | Description |',
    '|---------|-------------|',
  ]

  for (const cmd of commands) {
    lines.push(`| \`${cmd.usage}\` | ${cmd.description} |`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── generateFeaturesSection ────────────────────────────

/**
 * @example
 * const md = generateFeaturesSection(['TypeScript', 'Colorized output'])
 * console.log(md.includes('TypeScript'))
 */
export function generateFeaturesSection(features: string[]): string {
  if (features.length === 0) return ''

  const lines = ['## Features', '']
  for (const f of features) {
    lines.push(`- ${f}`)
  }
  lines.push('')
  return lines.join('\n')
}

// ─── assembleReadme ─────────────────────────────────────

/**
 * @example
 * const md = assembleReadme(data, sections, 'full')
 * console.log(md.startsWith('#'))
 */
export function assembleReadme(
  data: ReadmeData,
  sections: ReadmeSection[],
  template: 'commands' | 'full' | 'minimal',
): string {
  const parts: string[] = []

  if (template === 'full') {
    parts.push(`# ${data.projectName}`, '')
    if (data.badges.length > 0) {
      parts.push(data.badges.join(' '), '')
    }
    parts.push(data.description, '')

    const sorted = [...sections].sort((a, b) => a.order - b.order)
    for (const section of sorted) {
      parts.push(section.content)
    }

    parts.push(`## License`, '', `${data.license} © ${data.projectName} Team`, '')
  } else if (template === 'minimal') {
    parts.push(`# ${data.projectName}`, '')
    parts.push(data.description, '')
    parts.push(generateInstallationSection(data))
    parts.push(generateUsageSection(data.commands))
  } else {
    parts.push(`# ${data.projectName} Commands`, '')
    parts.push(generateCommandsSection(data.commands))
  }

  return parts.join('\n')
}

// ─── buildReadmeResult ──────────────────────────────────

/**
 * @example
 * const result = await buildReadmeResult('/path', reader, lister, pkgReader, { template: 'full' })
 * console.log(result.markdown)
 */
export async function buildReadmeResult(
  cwd: string,
  commandFiles: string[],
  contents: Record<string, string>,
  packageReader: PackageJsonReader,
  options: ReadmeOptions,
): Promise<ReadmeResult> {
  const data = await extractProjectInfo(cwd, packageReader)

  const commands = await extractCommands(commandFiles, async (f: string) => {
    const content = contents[f]
    if (content !== undefined) return content
    throw new Error(`File not found: ${f}`)
  })

  const pkg = await packageReader(cwd)
  const pkgRecord = pkg ?? {}

  const features = detectFeatures(commandFiles, contents)
  const techStack = detectTechStack(pkgRecord)
  const badges = generateBadges(data)

  const fullData: ReadmeData = {
    ...data,
    badges,
    commands,
    features,
    techStack,
  }

  const sections: ReadmeSection[] = [
    { content: generateInstallationSection(fullData), order: 1, title: 'Installation' },
    { content: generateUsageSection(commands), order: 2, title: 'Usage' },
    { content: generateCommandsSection(commands), order: 3, title: 'Commands' },
    { content: generateFeaturesSection(features), order: 4, title: 'Features' },
  ]

  if (techStack.length > 0) {
    sections.push({
      content: `## Tech Stack\n\n${techStack.map((t) => `- ${t}`).join('\n')}\n`,
      order: 5,
      title: 'Tech Stack',
    })
  }

  const markdown = assembleReadme(fullData, sections, options.template)

  return { data: fullData, markdown, sections }
}
