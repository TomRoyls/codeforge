export interface PromptMessage2 {
  role: 'system' | 'user' | 'assistant'
  content: string
  weight: number
}

export interface PromptTemplate2 {
  id: string
  template: string
  variables: string[]
  description: string
}

export class PromptBuilder2 {
  private messages: PromptMessage2[] = []
  private templates: Map<string, PromptTemplate2> = new Map()
  private defaults: Record<string, string> = {}
  private maxTokens: number
  private tokenEstimate = 0

  constructor(maxTokens = 8192) {
    this.maxTokens = maxTokens
  }

  setSystem(content: string): this {
    this.messages = this.messages.filter(m => m.role !== 'system')
    this.messages.unshift({ role: 'system', content, weight: 1 })
    this.recalculateTokens()
    return this
  }

  addUser(content: string, weight = 1): this {
    this.messages.push({ role: 'user', content, weight })
    this.tokenEstimate += this.estimateTokens(content)
    this.enforceLimit()
    return this
  }

  addAssistant(content: string, weight = 1): this {
    this.messages.push({ role: 'assistant', content, weight })
    this.tokenEstimate += this.estimateTokens(content)
    this.enforceLimit()
    return this
  }

  addMessage(role: PromptMessage2['role'], content: string, weight = 1): this {
    if (role === 'system') return this.setSystem(content)
    return this[role === 'user' ? 'addUser' : 'addAssistant'](content, weight)
  }

  registerTemplate(id: string, template: string, description = ''): this {
    const variables = this.extractVariables(template)
    this.templates.set(id, { id, template, variables, description })
    return this
  }

  applyTemplate(id: string, vars: Record<string, string>): this {
    const tmpl = this.templates.get(id)
    if (!tmpl) throw new Error(`Template ${id} not found`)
    const content = this.interpolate(tmpl.template, { ...this.defaults, ...vars })
    return this.addUser(content)
  }

  setDefault(key: string, value: string): this {
    this.defaults[key] = value
    return this
  }

  getDefaults(): Record<string, string> { return { ...this.defaults } }

  removeLast(): PromptMessage2 | null {
    const removed = this.messages.pop()
    if (removed) {
      this.tokenEstimate -= this.estimateTokens(removed.content)
    }
    return removed ?? null
  }

  getMessages(): PromptMessage2[] { return [...this.messages] }
  getMessageCount(): number { return this.messages.length }
  getTokenEstimate(): number { return this.tokenEstimate }
  getMaxTokens(): number { return this.maxTokens }

  build(): string {
    return this.messages.map(m => {
      const prefix = m.role === 'system' ? '[SYSTEM]' : m.role === 'user' ? '[USER]' : '[ASSISTANT]'
      return `${prefix} ${m.content}`
    }).join('\n\n')
  }

  buildJSON(): string {
    return JSON.stringify(this.messages.map(m => ({ role: m.role, content: m.content })))
  }

  buildOpenAI(): Array<{ role: string; content: string }> {
    return this.messages.map(m => ({ role: m.role, content: m.content }))
  }

  getTemplates(): PromptTemplate2[] { return Array.from(this.templates.values()) }
  getTemplate(id: string): PromptTemplate2 | undefined { return this.templates.get(id) }

  clearMessages(): this {
    this.messages = []
    this.tokenEstimate = 0
    return this
  }

  clearTemplates(): this {
    this.templates.clear()
    return this
  }

  count(): number { return this.messages.length }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  private recalculateTokens(): void {
    this.tokenEstimate = this.messages.reduce((sum, m) => sum + this.estimateTokens(m.content), 0)
  }

  private enforceLimit(): void {
    while (this.tokenEstimate > this.maxTokens && this.messages.length > 1) {
      const removed = this.messages.shift()
      if (removed && removed.role !== 'system') {
        this.tokenEstimate -= this.estimateTokens(removed.content)
      } else if (removed) {
        this.messages.unshift(removed)
        break
      }
    }
    this.recalculateTokens()
  }

  private extractVariables(template: string): string[] {
    const matches = template.matchAll(/\{\{(\w+)\}\}/g)
    return Array.from(new Set(Array.from(matches).map(m => m[1])))
  }

  private interpolate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
  }

  toArray(): PromptMessage2[] { return [...this.messages] }
  toString(): string { return this.build() }
  toJSON(): Record<string, unknown> { return { messages: this.count(), tokens: this.tokenEstimate, templates: this.templates.size } }
  clone(): PromptBuilder2 {
    const pb = new PromptBuilder2(this.maxTokens)
    pb.messages = [...this.messages]
    pb.defaults = { ...this.defaults }
    pb.tokenEstimate = this.tokenEstimate
    this.templates.forEach((t, id) => pb.templates.set(id, { ...t }))
    return pb
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PromptBuilder2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.clearMessages()
    this.clearTemplates()
    this.defaults = {}
  }
}
