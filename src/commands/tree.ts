import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import ora from 'ora'

import {
  buildTree,
  countTreeNodes,
  type TreeResult,
} from './tree-helpers.js'
import { renderSummary, renderTree, renderTreeJson } from './tree-format-helpers.js'

export default class Tree extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to display tree for',
      required: false,
    }),
  }

  static override description = 'Display directory tree structure'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Display tree for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Display tree for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --max-depth 3',
      description: 'Limit tree depth to 3 levels',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --show-size --show-lines',
      description: 'Show file sizes and line counts',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output tree as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ignore "*.test.ts" --ignore "fixtures"',
      description: 'Ignore specific patterns',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'tree',
      description: 'Output format',
      options: ['json', 'tree'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    'max-depth': Flags.integer({
      char: 'd',
      default: 5,
      description: 'Maximum directory depth',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    'show-lines': Flags.boolean({
      char: 'l',
      default: false,
      description: 'Show line counts for text files',
    }),
    'show-size': Flags.boolean({
      char: 's',
      default: false,
      description: 'Show file sizes',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Tree)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const stat = await fs.stat(targetPath)
    if (!stat.isDirectory()) {
      this.error(`Path is not a directory: ${targetPath}`, { exit: 1 })
    }

    const spinner = ora('Building tree...').start()

    const maxDepth = flags['max-depth']
    const format = flags.format as 'json' | 'tree'
    const ignorePatterns = flags.ignore ?? []
    const showSize = flags['show-size']
    const showLines = flags['show-lines']

    const root = await buildTree(targetPath, {
      ignorePatterns,
      maxDepth,
      showLines,
      showSize,
    })

    // Override root name to full resolved path basename
    root.name = basename(targetPath) || targetPath

    const counts = countTreeNodes(root)

    const result: TreeResult = {
      maxDepth,
      root,
      totalDirs: counts.dirs,
      totalFiles: counts.files,
      totalSize: counts.totalSize,
    }

    spinner.succeed(`Found ${counts.files} files in ${counts.dirs} directories`)

    const outputData =
      format === 'json'
        ? renderTreeJson(result)
        : renderTree(root, { showLines, showSize }) +
          renderSummary(counts.dirs, counts.files, counts.totalSize, showSize)

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

export { buildTree, countTreeNodes, formatFileSize, filterByDepth } from './tree-helpers.js'
export type { TreeNode, TreeResult } from './tree-helpers.js'
export { renderSummary, renderTree, renderTreeJson } from './tree-format-helpers.js'
