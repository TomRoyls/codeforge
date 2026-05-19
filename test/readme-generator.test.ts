import { describe, it, expect } from 'vitest'

import {
  assembleReadme,
  buildReadmeResult,
  detectFeatures,
  detectTechStack,
  extractCommands,
  extractProjectInfo,
  generateBadges,
  generateCommandsSection,
  generateFeaturesSection,
  generateInstallationSection,
  generateUsageSection,
  type ReadmeCommand,
  type ReadmeData,
} from '../src/commands/readme-generator-helpers.js'

import {
  formatReadmeJson,
  formatReadmeMarkdown,
  formatReadmePreview,
} from '../src/commands/readme-generator-format-helpers.js'

import ReadmeGenerator from '../src/commands/readme-generator.js'

// ─── extractProjectInfo ─────────────────────────────────

describe('extractProjectInfo', () => {
  const pkgReader = async () => ({
    name: 'my-app',
    description: 'A test app',
    version: '1.0.0',
    license: 'MIT',
    engines: { node: '>=18.0.0' },
    scripts: { build: 'tsc', test: 'vitest' },
  })

  it('should extract project name', async () => {
    const data = await extractProjectInfo('.', pkgReader)
    expect(data.projectName).toBe('my-app')
  })

  it('should extract description', async () => {
    const data = await extractProjectInfo('.', pkgReader)
    expect(data.description).toBe('A test app')
  })

  it('should extract version', async () => {
    const data = await extractProjectInfo('.', pkgReader)
    expect(data.version).toBe('1.0.0')
  })

  it('should extract license', async () => {
    const data = await extractProjectInfo('.', pkgReader)
    expect(data.license).toBe('MIT')
  })

  it('should extract requirements from engines', async () => {
    const data = await extractProjectInfo('.', pkgReader)
    expect(data.requirements).toContain('node >=18.0.0')
  })

  it('should extract scripts', async () => {
    const data = await extractProjectInfo('.', pkgReader)
    expect(data.scripts.build).toBe('tsc')
  })

  it('should handle null package.json', async () => {
    const nullReader = async () => null
    const data = await extractProjectInfo('.', nullReader)
    expect(data.projectName).toBe('unknown-project')
    expect(data.version).toBe('0.0.0')
  })

  it('should handle missing fields', async () => {
    const minimalReader = async () => ({ name: 'mini' })
    const data = await extractProjectInfo('.', minimalReader)
    expect(data.projectName).toBe('mini')
    expect(data.description).toBe('')
    expect(data.requirements).toHaveLength(0)
  })

  it('should generate installation command', async () => {
    const data = await extractProjectInfo('.', pkgReader)
    expect(data.installation).toBe('npm install -g my-app')
  })
})

// ─── extractCommands ────────────────────────────────────

describe('extractCommands', () => {
  const commandContent = `
    export default class Analyze extends Command {
      static override description = 'Analyze code for issues'
      static override flags = {
        format: Flags.string({ char: 'f' }),
        verbose: Flags.boolean({ char: 'v' }),
      }
    }
  `

  it('should extract command description', async () => {
    const reader = async () => commandContent
    const cmds = await extractCommands(['analyze.ts'], reader)
    expect(cmds[0].description).toBe('Analyze code for issues')
  })

  it('should extract command name from filename', async () => {
    const reader = async () => commandContent
    const cmds = await extractCommands(['analyze.ts'], reader)
    expect(cmds[0].name).toBe('analyze')
  })

  it('should generate usage string', async () => {
    const reader = async () => commandContent
    const cmds = await extractCommands(['analyze.ts'], reader)
    expect(cmds[0].usage).toBe('codeforge analyze [path]')
  })

  it('should skip files without description', async () => {
    const reader = async () => 'export default class Foo extends Command {}'
    const cmds = await extractCommands(['foo.ts'], reader)
    expect(cmds).toHaveLength(0)
  })

  it('should handle read errors', async () => {
    const failReader = async () => { throw new Error('ENOENT') }
    const cmds = await extractCommands(['missing.ts'], failReader)
    expect(cmds).toHaveLength(0)
  })

  it('should sort commands alphabetically', async () => {
    const reader = async (f: string) => {
      if (f === 'zebra.ts') return "static override description = 'Z'"
      if (f === 'alpha.ts') return "static override description = 'A'"
      return ''
    }
    const cmds = await extractCommands(['zebra.ts', 'alpha.ts'], reader)
    expect(cmds[0].name).toBe('alpha')
    expect(cmds[1].name).toBe('zebra')
  })

  it('should extract examples', async () => {
    const content = `
      static override examples = [
        { command: '<%= config.bin %> <%= command.id %> --format json', description: 'JSON output' },
      ]
      static override description = 'Test'
    `
    const reader = async () => content
    const cmds = await extractCommands(['test.ts'], reader)
    expect(cmds[0].examples.length).toBeGreaterThan(0)
  })
})

// ─── detectFeatures ─────────────────────────────────────

describe('detectFeatures', () => {
  it('should detect chalk usage', () => {
    const features = detectFeatures([], { 'app.ts': "import chalk from 'chalk'" })
    expect(features).toContain('Colorized output')
  })

  it('should detect ora usage', () => {
    const features = detectFeatures([], { 'app.ts': "import ora from 'ora'" })
    expect(features).toContain('Progress spinners')
  })

  it('should detect oclif usage', () => {
    const features = detectFeatures([], { 'app.ts': "import { Command } from '@oclif/core'" })
    expect(features).toContain('CLI framework (oclif)')
  })

  it('should detect vitest', () => {
    const features = detectFeatures([], { 'app.test.ts': "import { describe } from 'vitest'" })
    expect(features).toContain('Testing with Vitest')
  })

  it('should detect file discovery', () => {
    const features = detectFeatures([], { 'app.ts': 'import { discoverFiles } from' })
    expect(features).toContain('File discovery engine')
  })

  it('should return sorted features', () => {
    const features = detectFeatures([], {
      'a.ts': "import ora from 'ora'\nimport chalk from 'chalk'",
    })
    for (let i = 1; i < features.length; i++) {
      expect(features[i] >= features[i - 1]).toBe(true)
    }
  })

  it('should return empty for no matches', () => {
    const features = detectFeatures([], { 'app.ts': 'console.log("hello")' })
    expect(features).toHaveLength(0)
  })
})

// ─── detectTechStack ────────────────────────────────────

describe('detectTechStack', () => {
  it('should detect chalk', () => {
    const stack = detectTechStack({ dependencies: { chalk: '5.0.0' } })
    expect(stack).toContain('Chalk (Terminal Colors)')
  })

  it('should detect oclif', () => {
    const stack = detectTechStack({ dependencies: { '@oclif/core': '^4.0.0' } })
    expect(stack).toContain('Oclif CLI Framework')
  })

  it('should detect devDependencies', () => {
    const stack = detectTechStack({ devDependencies: { vitest: '^1.0.0' } })
    expect(stack).toContain('Vitest')
  })

  it('should detect typescript', () => {
    const stack = detectTechStack({ devDependencies: { typescript: '^5.0.0' } })
    expect(stack).toContain('TypeScript')
  })

  it('should return empty for no deps', () => {
    const stack = detectTechStack({})
    expect(stack).toHaveLength(0)
  })

  it('should sort results', () => {
    const stack = detectTechStack({
      dependencies: { chalk: '5', ora: '8' },
    })
    for (let i = 1; i < stack.length; i++) {
      expect(stack[i] >= stack[i - 1]).toBe(true)
    }
  })
})

// ─── generateBadges ─────────────────────────────────────

describe('generateBadges', () => {
  const data: ReadmeData = {
    badges: [],
    commands: [],
    description: 'test',
    features: [],
    installation: 'npm i',
    license: 'MIT',
    projectName: 'my-app',
    requirements: [],
    scripts: {},
    techStack: [],
    version: '1.0.0',
  }

  it('should generate npm badge', () => {
    const badges = generateBadges(data)
    expect(badges.some((b) => b.includes('npm'))).toBe(true)
  })

  it('should generate license badge', () => {
    const badges = generateBadges(data)
    expect(badges.some((b) => b.includes('License'))).toBe(true)
  })

  it('should generate version badge', () => {
    const badges = generateBadges(data)
    expect(badges.some((b) => b.includes('1.0.0'))).toBe(true)
  })

  it('should include shields.io URLs', () => {
    const badges = generateBadges(data)
    for (const b of badges) {
      expect(b).toContain('shields.io')
    }
  })
})

// ─── generateInstallationSection ────────────────────────

describe('generateInstallationSection', () => {
  it('should include installation header', () => {
    const md = generateInstallationSection({
      ...makeBaseData(),
      installation: 'npm install -g my-app',
    })
    expect(md).toContain('## Installation')
  })

  it('should include install command in code block', () => {
    const md = generateInstallationSection({
      ...makeBaseData(),
      installation: 'npm install -g my-app',
    })
    expect(md).toContain('npm install -g my-app')
  })

  it('should include requirements section when present', () => {
    const md = generateInstallationSection({
      ...makeBaseData(),
      requirements: ['node >=18.0.0'],
    })
    expect(md).toContain('### Requirements')
    expect(md).toContain('node >=18.0.0')
  })

  it('should omit requirements when empty', () => {
    const md = generateInstallationSection(makeBaseData())
    expect(md).not.toContain('### Requirements')
  })
})

// ─── generateUsageSection ───────────────────────────────

describe('generateUsageSection', () => {
  it('should include Usage header', () => {
    const md = generateUsageSection([])
    expect(md).toContain('## Usage')
  })

  it('should include --help example', () => {
    const md = generateUsageSection([])
    expect(md).toContain('--help')
  })

  it('should show first command example', () => {
    const cmds: ReadmeCommand[] = [
      { description: 'test', examples: [], flags: [], name: 'analyze', usage: 'codeforge analyze' },
    ]
    const md = generateUsageSection(cmds)
    expect(md).toContain('codeforge analyze')
  })
})

// ─── generateCommandsSection ────────────────────────────

describe('generateCommandsSection', () => {
  it('should return empty for no commands', () => {
    expect(generateCommandsSection([])).toBe('')
  })

  it('should include table header', () => {
    const cmds: ReadmeCommand[] = [
      { description: 'Analyze code', examples: [], flags: [], name: 'analyze', usage: 'codeforge analyze' },
    ]
    const md = generateCommandsSection(cmds)
    expect(md).toContain('| Command |')
    expect(md).toContain('analyze')
  })

  it('should list all commands', () => {
    const cmds: ReadmeCommand[] = [
      { description: 'A', examples: [], flags: [], name: 'a', usage: 'codeforge a' },
      { description: 'B', examples: [], flags: [], name: 'b', usage: 'codeforge b' },
    ]
    const md = generateCommandsSection(cmds)
    expect(md).toContain('codeforge a')
    expect(md).toContain('codeforge b')
  })
})

// ─── generateFeaturesSection ────────────────────────────

describe('generateFeaturesSection', () => {
  it('should return empty for no features', () => {
    expect(generateFeaturesSection([])).toBe('')
  })

  it('should list features', () => {
    const md = generateFeaturesSection(['TypeScript', 'Fast'])
    expect(md).toContain('- TypeScript')
    expect(md).toContain('- Fast')
  })
})

// ─── assembleReadme ─────────────────────────────────────

describe('assembleReadme', () => {
  const data = makeBaseData()
  const sections = [
    { content: '## Install\n\nnpm i\n', order: 1, title: 'Install' },
    { content: '## Usage\n\ncodeforge\n', order: 2, title: 'Usage' },
  ]

  it('should start with project heading for full template', () => {
    const md = assembleReadme(data, sections, 'full')
    expect(md).toContain('# my-app')
  })

  it('should include description for full template', () => {
    const md = assembleReadme(data, sections, 'full')
    expect(md).toContain('A test app')
  })

  it('should include license for full template', () => {
    const md = assembleReadme(data, sections, 'full')
    expect(md).toContain('MIT')
  })

  it('should include sections in order', () => {
    const md = assembleReadme(data, sections, 'full')
    const installIdx = md.indexOf('Install')
    const usageIdx = md.indexOf('Usage')
    expect(installIdx).toBeLessThan(usageIdx)
  })

  it('should produce minimal template', () => {
    const md = assembleReadme(data, [], 'minimal')
    expect(md).toContain('# my-app')
    expect(md).toContain('## Installation')
  })

  it('should produce commands template', () => {
    const md = assembleReadme(data, [], 'commands')
    expect(md).toContain('Commands')
  })
})

// ─── buildReadmeResult ──────────────────────────────────

describe('buildReadmeResult', () => {
  const pkgReader = async () => ({
    name: 'test-app',
    description: 'Test',
    version: '2.0.0',
    license: 'ISC',
    dependencies: { chalk: '5' },
    scripts: { build: 'tsc' },
  })

  it('should return full result', async () => {
    const result = await buildReadmeResult('.', [], {}, pkgReader, { template: 'full' })
    expect(result.data.projectName).toBe('test-app')
    expect(result.markdown).toBeTruthy()
    expect(result.sections.length).toBeGreaterThan(0)
  })

  it('should detect tech stack', async () => {
    const result = await buildReadmeResult('.', [], {}, pkgReader, { template: 'full' })
    expect(result.data.techStack).toContain('Chalk (Terminal Colors)')
  })

  it('should generate badges', async () => {
    const result = await buildReadmeResult('.', [], {}, pkgReader, { template: 'full' })
    expect(result.data.badges.length).toBeGreaterThan(0)
  })

  it('should extract commands from contents', async () => {
    const contents = {
      'analyze.ts': "static override description = 'Analyze code'\nstatic override flags = { format: Flags.string() }",
    }
    const result = await buildReadmeResult('.', ['analyze.ts'], contents, pkgReader, { template: 'full' })
    expect(result.data.commands.length).toBeGreaterThan(0)
  })

  it('should detect features from contents', async () => {
    const contents = { 'app.ts': "import chalk from 'chalk'" }
    const result = await buildReadmeResult('.', [], contents, pkgReader, { template: 'full' })
    expect(result.data.features).toContain('Colorized output')
  })
})

// ─── formatReadmePreview ────────────────────────────────

describe('formatReadmePreview', () => {
  it('should show project name', () => {
    const result = makeBaseResult()
    const preview = formatReadmePreview(result)
    expect(preview).toContain('my-app')
  })

  it('should show commands', () => {
    const result: typeof makeBaseResult extends () => infer R ? R : never = {
      ...makeBaseResult(),
      data: { ...makeBaseData(), commands: [{ description: 'Analyze', examples: [], flags: [], name: 'analyze', usage: 'codeforge analyze' }] },
    }
    const preview = formatReadmePreview(result)
    expect(preview).toContain('analyze')
  })

  it('should show features', () => {
    const result = { ...makeBaseResult(), data: { ...makeBaseData(), features: ['TypeScript'] } }
    const preview = formatReadmePreview(result)
    expect(preview).toContain('TypeScript')
  })

  it('should show sections', () => {
    const result = makeBaseResult()
    const preview = formatReadmePreview(result)
    expect(preview).toContain('Sections')
  })
})

// ─── formatReadmeJson ───────────────────────────────────

describe('formatReadmeJson', () => {
  it('should produce valid JSON', () => {
    const result = makeBaseResult()
    const json = formatReadmeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.projectName).toBe('my-app')
  })

  it('should include commands', () => {
    const result = { ...makeBaseResult(), data: { ...makeBaseData(), commands: [{ description: 'A', examples: [], flags: [], name: 'a', usage: 'codeforge a' }] } }
    const json = formatReadmeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.commands).toHaveLength(1)
  })
})

// ─── formatReadmeMarkdown ───────────────────────────────

describe('formatReadmeMarkdown', () => {
  it('should return the markdown', () => {
    const result = makeBaseResult()
    const md = formatReadmeMarkdown(result)
    expect(md).toBe(result.markdown)
  })
})

// ─── Command metadata ───────────────────────────────────

describe('ReadmeGenerator command', () => {
  it('should have correct description', () => {
    expect(ReadmeGenerator.description).toContain('EADME')
  })

  it('should have path arg', () => {
    expect(ReadmeGenerator.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(ReadmeGenerator.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(ReadmeGenerator.flags.output).toBeDefined()
  })

  it('should have template flag', () => {
    expect(ReadmeGenerator.flags.template).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(ReadmeGenerator.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(ReadmeGenerator.examples.length).toBeGreaterThan(0)
  })
})

// ─── Helpers ────────────────────────────────────────────

function makeBaseData(): ReadmeData {
  return {
    badges: [],
    commands: [],
    description: 'A test app',
    features: [],
    installation: 'npm install -g my-app',
    license: 'MIT',
    projectName: 'my-app',
    requirements: [],
    scripts: {},
    techStack: [],
    version: '1.0.0',
  }
}

function makeBaseResult() {
  return {
    data: makeBaseData(),
    markdown: '# my-app\n\nA test app\n',
    sections: [
      { content: '## Install\n', order: 1, title: 'Install' },
    ],
  }
}
