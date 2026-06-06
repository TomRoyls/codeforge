/**
 * @example
 * ```bash
 * codeforge version
 * codeforge version --json
 * ```
 */
import { Command, Flags } from '@oclif/core'
import { readFileSync } from 'node:fs'
import { arch, platform, release } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface VersionInfo {
  codeforge: string
  node: string
  platform: string
  arch: string
  os: string
}

export function getVersionInfo(): VersionInfo {
  const packageJsonPath = join(fileURLToPath(new URL('.', import.meta.url)), '../../package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  return {
    arch: arch(),
    codeforge: packageJson.version || '0.0.0',
    node: process.version,
    os: release(),
    platform: platform(),
  }
}

export default class Version extends Command {
  static override description = 'Show current version of CodeForge'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show current version',
    },
  ]

  static override flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output version info as JSON',
    }),
  }

  async run(): Promise<void> {
    let json = false
    try {
      const { flags } = await this.parse(Version)
      json = flags.json
    } catch {
      // Fallback when oclif config is not available (e.g., in tests)
      json = false
    }
    const info = getVersionInfo()

    if (json) {
      this.log(JSON.stringify(info, null, 2))
    } else {
      this.log(`Current version: ${info.codeforge}`)
    }
  }
}
