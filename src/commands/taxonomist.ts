import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTaxonomistResult, type TaxonomistOptions, type TaxonomyResult } from './taxonomist-helpers.js'
import { formatTaxonomistJSON, formatTaxonomistTable } from './taxonomist-format-helpers.js'

export default class Taxonomist extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to classify',
      required: false,
    }),
  }

  static override description = 'Classify code into a taxonomy hierarchy'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Classify current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Classify src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed classification info',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output taxonomy.json',
      description: 'Export taxonomy to JSON file',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Taxonomist)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const options: TaxonomistOptions = { verbose: flags.verbose }

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.json',
        '**/*.css',
        '**/*.html',
        '**/*.md',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
      ],
    })

    spinner.text = 'Classifying files...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of discoveredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const result: TaxonomyResult = buildTaxonomistResult(files, contents, options)

    spinner.succeed(`Classified ${files.length} files into taxonomy`)

    const outputData = format === 'json' ? formatTaxonomistJSON(result) : formatTaxonomistTable(result)

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

export { buildTaxonomistResult, classifyFile, classifyFamily, classifyGenus, classifyKingdom, classifyPhylum, classifyClass, classifyOrder, computeSimilarity, computeTaxonomyStats, detectTraits, findClosestRelative, generateTaxonomyRecommendations, buildTaxonomyTree, groupBy, extractGroupTraits, countTaxa, computeTreeDepth, collectLeafGroups, computeClassificationConfidence } from './taxonomist-helpers.js'
export type { Classification, Taxon, TaxonRank, TaxonomyResult, TaxonomyStats, TaxonomistOptions } from './taxonomist-helpers.js'
export { formatTaxonomistJSON, formatTaxonomistTable, formatTaxonomyTree, formatClassificationTable, formatSimilarityPairs, formatTaxonomyStats, formatRecommendations, formatCoverageScore, getRankColor } from './taxonomist-format-helpers.js'
