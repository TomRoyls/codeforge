export type DashboardWidget2 = 'line-chart' | 'bar-chart' | 'gauge' | 'table' | 'pie-chart' | 'heatmap' | 'text' | 'status'
export type DashboardLayout2 = 'grid' | 'flex' | 'stacked' | 'tabbed'

export interface DashboardPanel2 {
  id: string
  title: string
  widget: DashboardWidget2
  metrics: string[]
  position: { x: number; y: number; w: number; h: number }
  refreshInterval: number
  query: string
  thresholds: { warning: number; critical: number }
  config: Record<string, unknown>
}

export class DashboardBuilder2 {
  private panels: Map<string, DashboardPanel2> = new Map()
  private layout: DashboardLayout2 = 'grid'
  private title: string = 'Dashboard'
  private refreshInterval: number = 30
  private variables: Map<string, string> = new Map()
  private annotations: Array<{ name: string; query: string }> = []
  private panelOrder: string[] = []

  setTitle(title: string): this { this.title = title; return this }
  getTitle(): string { return this.title }

  setLayout(layout: DashboardLayout2): this { this.layout = layout; return this }
  getLayout(): DashboardLayout2 { return this.layout }

  setRefreshInterval(seconds: number): this { this.refreshInterval = seconds; return this }
  getRefreshInterval(): number { return this.refreshInterval }

  setVariable(name: string, value: string): this { this.variables.set(name, value); return this }
  getVariable(name: string): string | undefined { return this.variables.get(name) }
  getVariables(): Map<string, string> { return new Map(this.variables) }

  addAnnotation(name: string, query: string): this { this.annotations.push({ name, query }); return this }
  getAnnotations(): Array<{ name: string; query: string }> { return [...this.annotations] }

  addPanel(panel: Omit<DashboardPanel2, 'id'> & { id?: string }): string {
    const id = panel.id ?? `panel_${this.panels.size + 1}`
    this.panels.set(id, { ...panel, id })
    this.panelOrder.push(id)
    return id
  }

  getPanel(id: string): DashboardPanel2 | undefined { return this.panels.get(id) }

  updatePanel(id: string, updates: Partial<DashboardPanel2>): boolean {
    const panel = this.panels.get(id)
    if (!panel) return false
    Object.assign(panel, updates)
    return true
  }

  removePanel(id: string): boolean {
    const idx = this.panelOrder.indexOf(id)
    if (idx >= 0) this.panelOrder.splice(idx, 1)
    return this.panels.delete(id)
  }

  movePanel(id: string, newIndex: number): boolean {
    const oldIndex = this.panelOrder.indexOf(id)
    if (oldIndex === -1) return false
    this.panelOrder.splice(oldIndex, 1)
    this.panelOrder.splice(newIndex, 0, id)
    return true
  }

  getPanels(): DashboardPanel2[] {
    return this.panelOrder.map(id => this.panels.get(id)!).filter(Boolean)
  }

  getPanelsByWidget(widget: DashboardWidget2): DashboardPanel2[] {
    return Array.from(this.panels.values()).filter(p => p.widget === widget)
  }

  getPanelsByMetric(metric: string): DashboardPanel2[] {
    return Array.from(this.panels.values()).filter(p => p.metrics.includes(metric))
  }

  resizePanel(id: string, w: number, h: number): boolean {
    const panel = this.panels.get(id)
    if (!panel) return false
    panel.position.w = w
    panel.position.h = h
    return true
  }

  movePanelPosition(id: string, x: number, y: number): boolean {
    const panel = this.panels.get(id)
    if (!panel) return false
    panel.position.x = x
    panel.position.y = y
    return true
  }

  setThresholds(id: string, warning: number, critical: number): boolean {
    const panel = this.panels.get(id)
    if (!panel) return false
    panel.thresholds = { warning, critical }
    return true
  }

  setPanelConfig(id: string, config: Record<string, unknown>): boolean {
    const panel = this.panels.get(id)
    if (!panel) return false
    panel.config = config
    return true
  }

  exportJSON(): Record<string, unknown> {
    return {
      title: this.title,
      layout: this.layout,
      refreshInterval: this.refreshInterval,
      variables: Object.fromEntries(this.variables),
      annotations: this.annotations,
      panels: this.getPanels(),
    }
  }

  getSummary(): { title: string; panels: number; variables: number; annotations: number } {
    return {
      title: this.title,
      panels: this.panels.size,
      variables: this.variables.size,
      annotations: this.annotations.length,
    }
  }

  count(): number { return this.panels.size }

  toArray(): DashboardPanel2[] { return this.getPanels() }
  toString(): string { return JSON.stringify(this.getSummary()) }
  toJSON(): Record<string, unknown> { return this.getSummary() }
  clone(): DashboardBuilder2 {
    const db = new DashboardBuilder2()
    db.title = this.title
    db.layout = this.layout
    db.refreshInterval = this.refreshInterval
    this.variables.forEach((v, k) => db.variables.set(k, v))
    db.annotations = [...this.annotations]
    this.panels.forEach((p, id) => db.panels.set(id, { ...p, metrics: [...p.metrics], position: { ...p.position }, thresholds: { ...p.thresholds }, config: { ...p.config } }))
    db.panelOrder = [...this.panelOrder]
    return db
  }
  equals(other: unknown): boolean {
    if (!(other instanceof DashboardBuilder2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.panels.clear()
    this.panelOrder = []
    this.variables.clear()
    this.annotations = []
  }
}
