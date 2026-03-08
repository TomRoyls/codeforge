import { Command } from '@oclif/core'

export default class World extends Command {
  static override description = 'Say hello world'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Say hello world',
    },
  ]

  async run(): Promise<void> {
    this.log('hello world! (./src/commands/hello/world.ts)')
  }
}
