import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildEmojiResult, buildEmojiStats, findEmojisInContent, type EmojiResult } from './emoji-helpers.js'
import { formatEmojiCsv, formatEmojiJson, formatEmojiTable } from './emoji-format-helpers.js'

export default class Emoji extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for emoji usage',
      required: false,
    }),
  }

  static override description = 'Scan source files for emoji usage'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scan current directory for emojis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Scan src directory, output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Scan TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show only top 10 emojis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed output with file locations',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output emojis.csv',
      description: 'Export emoji usage to CSV file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx,.md,.json',
      description: 'Comma-separated file extensions to scan (e.g., ".ts,.tsx,.md")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    top: Flags.integer({
      default: 20,
      description: 'Show only top N emojis',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output with file locations',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Emoji)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Scanning for emojis...'

    const allMatches = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        const matches = findEmojisInContent(content, file.path)
        allMatches.push(...matches)
      } catch {
        // skip unreadable files
      }
    }

    const stats = buildEmojiStats(allMatches)
    const result: EmojiResult = buildEmojiResult(allMatches, stats, flags.top)

    spinner.succeed(
      `Found ${result.totalEmojis} emojis (${result.uniqueEmojis} unique) across ${result.filesWithEmojis} files`,
    )

    const outputData =
      format === 'json'
        ? formatEmojiJson(result)
        : format === 'csv'
          ? formatEmojiCsv(result)
          : formatEmojiTable(result, verbose)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }
  }
}

export { buildEmojiResult, buildEmojiStats, findEmojisInContent } from './emoji-helpers.js'
export type { EmojiMatch, EmojiResult, EmojiStats } from './emoji-helpers.js'
export { formatEmojiCsv, formatEmojiJson, formatEmojiTable } from './emoji-format-helpers.js'
