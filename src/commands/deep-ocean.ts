import { Command, Flags } from '@oclif/core'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildDeepOceanResult } from './deep-ocean-helpers.js'
import { formatDeepOceanJson, formatDeepOceanTable } from './deep-ocean-format-helpers.js'

// ─── Constants ─────────────────────────────────────────────────────────────

const FILE_PATTERNS = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
]

// ─── Command ───────────────────────────────────────────────────────────────

/** @example codeforge deep-ocean ./src --verbose */
export default class DeepOcean extends Command {
  static override description = 'Analyze code depth, mystery, currents, bioluminescence, pressure, and trench quality'

  static override examples = [
    '<%= config.bin %> <%= command.id %> ./src',
    '<%= config.bin %> <%= command.id %> ./src --verbose',
    '<%= config.bin %> <%= command.id %> ./src --json',
  ]

  static override flags = {
    json: Flags.boolean({ char: 'j', description: 'Output as JSON' }),
    verbose: Flags.boolean({ char: 'v', description: 'Show per-file details' }),
  }

  static override args = [{ name: 'path', description: 'Path to analyze', default: '.' }]

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DeepOcean)
    const spinner = ora('Analyzing ocean depths...').start()

    const discovered = await discoverFiles(args.path, FILE_PATTERNS)
    const files = discovered.map((f) => f.path)
    const contents: string[] = []

    for (const file of files) {
      try {
        const { readFileSync } = await import('fs')
        contents.push(readFileSync(file, 'utf-8'))
      } catch {
        contents.push('')
      }
    }

    const result = buildDeepOceanResult(files, contents)

    spinner.stop()

    if (flags.json) {
      this.log(formatDeepOceanJson(result))
    } else {
      this.log(formatDeepOceanTable(result, flags.verbose))
    }
  }
}
