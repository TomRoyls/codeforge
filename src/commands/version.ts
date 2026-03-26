import { Command } from '@oclif/core'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export default class Version extends Command {
  static override description = 'Show current version of CodeForge'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show current version',
    },
  ]

  async run(): Promise<void> {
    const packageJsonPath = join(fileURLToPath(new URL('.', import.meta.url)), '../../package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    const version = packageJson.version || '0.0.0'
    this.log(`Current version: ${version}`)
  }
}
