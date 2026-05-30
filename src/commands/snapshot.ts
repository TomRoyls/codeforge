import { Args, Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'
import ora from 'ora'

import {
  captureSnapshot,
  compareSnapshots,
  generateSnapshotName,
  listSnapshots,
  loadSnapshot,
  saveSnapshot,
} from './snapshot-helpers.js'
import { formatSnapshotDiffTable, formatSnapshotJson, formatSnapshotList, formatSnapshotTable } from './snapshot-format-helpers.js'

export default class Snapshot extends Command {
  static override args = {
    action: Args.string({
      default: 'list',
      description: 'Action to perform',
      options: ['capture', 'compare', 'list', 'show'],
      required: false,
    }),
  }

  static override description = 'Capture and compare codebase snapshots'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'List all snapshots',
    },
    {
      command: '<%= config.bin %> <%= command.id %> capture',
      description: 'Capture a new snapshot',
    },
    {
      command: '<%= config.bin %> <%= command.id %> capture --name my-snapshot',
      description: 'Capture a named snapshot',
    },
    {
      command: '<%= config.bin %> <%= command.id %> show my-snapshot',
      description: 'Show snapshot details',
    },
    {
      command: '<%= config.bin %> <%= command.id %> compare --compare-with my-snapshot',
      description: 'Compare latest snapshot with a named one',
    },
    {
      command: '<%= config.bin %> <%= command.id %> capture --format json --output snapshot.json',
      description: 'Capture and save as JSON',
    },
  ]

  static override flags = {
    'compare-with': Flags.string({
      description: 'Snapshot name to compare with (for compare action)',
    }),
    dir: Flags.string({
      default: '.codeforge/snapshots',
      description: 'Directory to store snapshots',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    name: Flags.string({
      description: 'Snapshot name (default: timestamp-based)',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Snapshot)

    const action = args.action as 'capture' | 'compare' | 'list' | 'show'
    const format = flags.format as 'json' | 'table'
    const snapshotDir = flags.dir

    switch (action) {
      case 'capture': {
        await this.captureAction(snapshotDir, flags.name, format, flags.output)
        break
      }
      case 'compare': {
        await this.compareAction(snapshotDir, flags['compare-with'], format, flags.output)
        break
      }
      case 'list': {
        await this.listAction(snapshotDir, format, flags.output)
        break
      }
      case 'show': {
        await this.showAction(snapshotDir, flags.name, format, flags.output)
        break
      }
    }
  }

  private async captureAction(
    snapshotDir: string,
    name: string | undefined,
    format: 'json' | 'table',
    output: string | undefined,
  ): Promise<void> {
    const snapshotName = name ?? generateSnapshotName()
    const spinner = ora('Capturing snapshot...').start()

    const snapshot = await captureSnapshot('.', snapshotName)
    const filePath = await saveSnapshot(snapshot, snapshotDir)

    spinner.succeed(`Snapshot "${snapshotName}" saved to ${filePath}`)

    const outputData = format === 'json' ? formatSnapshotJson(snapshot) : formatSnapshotTable(snapshot)

    if (output) {
      await fs.writeFile(output, outputData, 'utf8')
      this.log(`Results written to ${output}`)
    } else {
      this.log(outputData)
    }
  }

  private async compareAction(
    snapshotDir: string,
    compareWith: string | undefined,
    format: 'json' | 'table',
    output: string | undefined,
  ): Promise<void> {
    if (!compareWith) {
      this.error('--compare-with is required for compare action', { exit: 1 })
    }

    const spinner = ora('Loading snapshots...').start()

    const snapshots = await listSnapshots(snapshotDir)
    if (snapshots.length === 0) {
      spinner.fail('No snapshots found')
      this.error('No snapshots found. Run `codeforge snapshot capture` first.', { exit: 1 })
    }

    const latestName = snapshots[0]!.name
    spinner.text = `Comparing ${latestName} with ${compareWith}...`

    const fromSnapshot = await loadSnapshot(compareWith, snapshotDir)
    const toSnapshot = await loadSnapshot(latestName, snapshotDir)

    const diff = compareSnapshots(fromSnapshot, toSnapshot)
    spinner.succeed('Comparison complete')

    const outputData = format === 'json' ? formatSnapshotJson(diff) : formatSnapshotDiffTable(diff)

    if (output) {
      await fs.writeFile(output, outputData, 'utf8')
      this.log(`Results written to ${output}`)
    } else {
      this.log(outputData)
    }
  }

  private async listAction(
    snapshotDir: string,
    format: 'json' | 'table',
    output: string | undefined,
  ): Promise<void> {
    const snapshots = await listSnapshots(snapshotDir)

    const outputData = format === 'json' ? formatSnapshotJson(snapshots) : formatSnapshotList(snapshots)

    if (output) {
      await fs.writeFile(output, outputData, 'utf8')
      this.log(`Results written to ${output}`)
    } else {
      this.log(outputData)
    }
  }

  private async showAction(
    snapshotDir: string,
    name: string | undefined,
    format: 'json' | 'table',
    output: string | undefined,
  ): Promise<void> {
    if (!name) {
      this.error('--name is required for show action', { exit: 1 })
    }

    const spinner = ora('Loading snapshot...').start()
    const snapshot = await loadSnapshot(name, snapshotDir)
    spinner.succeed(`Loaded snapshot "${name}"`)

    const outputData = format === 'json' ? formatSnapshotJson(snapshot) : formatSnapshotTable(snapshot)

    if (output) {
      await fs.writeFile(output, outputData, 'utf8')
      this.log(`Results written to ${output}`)
    } else {
      this.log(outputData)
    }
  }
}

export {
  captureSnapshot,
  compareSnapshots,
  generateSnapshotName,
  listSnapshots,
  loadSnapshot,
  saveSnapshot,
} from './snapshot-helpers.js'
export type {
  FileHash,
  MetricChange,
  Snapshot,
  SnapshotDiff,
  SnapshotListItem,
  SnapshotMetrics,
} from './snapshot-helpers.js'
export { formatSnapshotDiffTable, formatSnapshotJson, formatSnapshotList, formatSnapshotTable } from './snapshot-format-helpers.js'
