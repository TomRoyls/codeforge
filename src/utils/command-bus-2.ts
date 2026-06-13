export interface Command2 {
  type: string
  payload: unknown
}

export interface CommandResult2 {
  success: boolean
  data?: unknown
  error?: string
}

export type CommandHandler2 = (command: Command2) => CommandResult2 | Promise<CommandResult2>

export class CommandBus2 {
  private handlers: Map<string, CommandHandler2> = new Map()
  private middleware: ((cmd: Command2) => Command2)[] = []
  private executedCommands: Command2[] = []
  private maxHistory: number

  constructor(maxHistory = 1000) {
    this.maxHistory = maxHistory
  }

  register(type: string, handler: CommandHandler2): this {
    this.handlers.set(type, handler)
    return this
  }

  unregister(type: string): boolean {
    return this.handlers.delete(type)
  }

  hasHandler(type: string): boolean {
    return this.handlers.has(type)
  }

  use(middleware: (cmd: Command2) => Command2): this {
    this.middleware.push(middleware)
    return this
  }

  async execute(command: Command2): Promise<CommandResult2> {
    let cmd = command
    for (const mw of this.middleware) {
      cmd = mw(cmd)
    }
    this.executedCommands.push(cmd)
    if (this.executedCommands.length > this.maxHistory) this.executedCommands.shift()

    const handler = this.handlers.get(cmd.type)
    if (!handler) return { success: false, error: `No handler for: ${cmd.type}` }
    try {
      return await handler(cmd)
    } catch (err) {
      return { success: false, error: String(err) }
    }
  }

  getHistory(): Command2[] {
    return [...this.executedCommands]
  }

  getHistoryByType(type: string): Command2[] {
    return this.executedCommands.filter(c => c.type === type)
  }

  clearHistory(): void {
    this.executedCommands = []
  }

  registeredTypes(): string[] {
    return Array.from(this.handlers.keys())
  }

  count(): number { return this.handlers.size }

  clear(): void {
    this.handlers.clear()
    this.middleware = []
    this.executedCommands = []
  }

  toArray(): string[] { return this.registeredTypes() }
  toString(): string { return JSON.stringify({ handlers: this.count(), history: this.executedCommands.length }) }
  toJSON(): Record<string, unknown> { return { handlers: this.count(), history: this.executedCommands.length, types: this.registeredTypes() } }
  clone(): CommandBus2 {
    const cb = new CommandBus2(this.maxHistory)
    this.handlers.forEach((h, t) => cb.register(t, h))
    return cb
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CommandBus2)) return false
    return this.count() === other.count()
  }
}
