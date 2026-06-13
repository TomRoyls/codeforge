export class SchedulerCron2 {
  private patterns: Map<string, () => void> = new Map()

  add(name: string, fn: () => void): void {
    this.patterns.set(name, fn)
  }

  remove(name: string): boolean {
    return this.patterns.delete(name)
  }

  has(name: string): boolean {
    return this.patterns.has(name)
  }

  clear(): void {
    this.patterns.clear()
  }

  size(): number {
    return this.patterns.size
  }

  names(): string[] {
    return Array.from(this.patterns.keys())
  }

  run(name: string): boolean {
    const fn = this.patterns.get(name)
    if (fn) { fn(); return true }
    return false
  }

  runAll(): void {
    this.patterns.forEach(fn => fn())
  }

  static parseCronField(field: string, min: number, max: number): number[] {
    if (field === '*') {
      const result: number[] = []
      for (let i = min; i <= max; i++) result.push(i)
      return result
    }
    if (field.includes('/')) {
      const [range, step] = field.split('/')
      const stepNum = parseInt(step)
      const [start, end] = range === '*' ? [min, max] : range.includes('-') ? range.split('-').map(Number) : [parseInt(range), max]
      const result: number[] = []
      for (let i = start; i <= end; i += stepNum) result.push(i)
      return result
    }
    if (field.includes(',')) {
      return field.split(',').map(f => parseInt(f))
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number)
      const result: number[] = []
      for (let i = start; i <= end; i++) result.push(i)
      return result
    }
    return [parseInt(field)]
  }

  static matchesMinute(cron: string, minute: number, hour: number, day: number, month: number, dayOfWeek: number): boolean {
    const parts = cron.split(/\s+/)
    if (parts.length < 5) return false
    const minutes = SchedulerCron2.parseCronField(parts[0], 0, 59)
    const hours = SchedulerCron2.parseCronField(parts[1], 0, 23)
    const days = SchedulerCron2.parseCronField(parts[2], 1, 31)
    const months = SchedulerCron2.parseCronField(parts[3], 1, 12)
    const dows = SchedulerCron2.parseCronField(parts[4], 0, 6)
    return minutes.includes(minute) && hours.includes(hour) && days.includes(day) && months.includes(month) && dows.includes(dayOfWeek)
  }

  static describeCron(cron: string): string {
    const parts = cron.split(/\s+/)
    if (parts.length < 5) return 'Invalid cron expression'
    const [minute, hour, day, month, dow] = parts
    if (minute === '*' && hour === '*') return 'Every minute'
    if (minute === '0' && hour === '*') return 'Every hour at minute 0'
    if (minute === '0' && hour === '0') return 'Daily at midnight'
    if (minute === '0' && hour === '12') return 'Daily at noon'
    if (day === '*' && month === '*' && dow === '0') return `Every Sunday at ${hour}:${minute.padStart(2, '0')}`
    return `At ${hour}:${minute} on day ${day} of month ${month}`
  }

  static validate(cron: string): boolean {
    const parts = cron.split(/\s+/)
    return parts.length >= 5
  }

  toArray(): string[] { return this.names() }
  toString(): string { return JSON.stringify(this.names()) }
  toJSON(): string[] { return this.names() }
  clone(): SchedulerCron2 {
    const s = new SchedulerCron2()
    this.patterns.forEach((fn, name) => s.add(name, fn))
    return s
  }
  equals(other: unknown): boolean {
    if (!(other instanceof SchedulerCron2)) return false
    if (this.size() !== other.size()) return false
    return this.names().every(n => other.has(n))
  }
}
