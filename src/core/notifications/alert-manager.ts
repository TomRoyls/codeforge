import type {
  Alert,
  AlertCondition,
  AlertRule,
  AlertSeverity,
  NotificationConfig,
  NotificationMessage,
} from './types.js'
import { DEFAULT_NOTIFICATION_CONFIG } from './types.js'

const ONE_HOUR_MS = 3_600_000

let alertCounter = 0

function generateAlertId(): string {
  alertCounter++
  return `alert-${Date.now()}-${alertCounter}`
}

export class AlertManager {
  private rules: Map<string, AlertRule>
  private alerts: Alert[]
  private config: NotificationConfig
  private lastTriggered: Map<string, number>
  private recentAlertTimestamps: number[]

  constructor(config?: Partial<NotificationConfig>) {
    this.config = { ...DEFAULT_NOTIFICATION_CONFIG, ...config }
    this.rules = new Map()
    this.alerts = []
    this.lastTriggered = new Map()
    this.recentAlertTimestamps = []
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
  }

  removeRule(id: string): boolean {
    return this.rules.delete(id)
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values())
  }

  getEnabledRules(): AlertRule[] {
    return this.getRules().filter((rule) => rule.enabled)
  }

  checkCondition(condition: AlertCondition, value: number | string): boolean {
    const { operator } = condition
    const conditionValue = condition.value

    if (operator === 'contains') {
      return String(value).includes(String(conditionValue))
    }

    const numValue = Number(value)
    const numCondition = Number(conditionValue)

    if (!Number.isNaN(numValue) && !Number.isNaN(numCondition)) {
      switch (operator) {
        case '>':
          return numValue > numCondition
        case '<':
          return numValue < numCondition
        case '>=':
          return numValue >= numCondition
        case '<=':
          return numValue <= numCondition
        case '==':
          return numValue === numCondition
        case '!=':
          return numValue !== numCondition
        default:
          return false
      }
    }

    const strValue = String(value)
    const strCondition = String(conditionValue)

    switch (operator) {
      case '==':
        return strValue === strCondition
      case '!=':
        return strValue !== strCondition
      default:
        return false
    }
  }

  evaluate(metric: string, value: number | string, context?: Record<string, unknown>): Alert[] {
    if (!this.config.enabled) {
      return []
    }

    const triggeredAlerts: Alert[] = []

    for (const rule of this.getEnabledRules()) {
      if (rule.condition.metric !== metric) {
        continue
      }

      if (!this.checkCondition(rule.condition, value)) {
        continue
      }

      if (this.isInCooldown(rule.id)) {
        continue
      }

      if (this.isRateLimited()) {
        continue
      }

      const alert: Alert = {
        id: generateAlertId(),
        rule,
        triggeredAt: Date.now(),
        message: this.buildAlertMessage(rule, metric, value),
        severity: rule.severity,
        data: { metric, value, ...context },
        acknowledged: false,
      }

      this.alerts.push(alert)
      this.lastTriggered.set(rule.id, Date.now())
      this.recentAlertTimestamps.push(Date.now())
      triggeredAlerts.push(alert)

      for (const channel of rule.channels) {
        const notification = this.createNotification(alert)
        notification.channel = channel
        this.sendNotification(notification)
      }
    }

    return triggeredAlerts
  }

  evaluateAll(metrics: Record<string, number | string>, context?: Record<string, unknown>): Alert[] {
    const allAlerts: Alert[] = []
    for (const [metric, value] of Object.entries(metrics)) {
      const metricAlerts = this.evaluate(metric, value, context)
      allAlerts.push(...metricAlerts)
    }
    return allAlerts
  }

  private buildAlertMessage(rule: AlertRule, metric: string, value: number | string): string {
    return `Rule "${rule.name}" triggered: metric "${metric}" with value "${value}" ${rule.condition.operator} "${rule.condition.value}"`
  }

  createNotification(alert: Alert): NotificationMessage {
    return {
      title: `[${alert.severity.toUpperCase()}] ${alert.rule.name}`,
      body: alert.message,
      severity: alert.severity,
      channel: this.config.defaultChannels[0] ?? 'console',
      timestamp: alert.triggeredAt,
      metadata: {
        ruleId: alert.rule.id,
        alertId: alert.id,
        type: alert.rule.type,
      },
    }
  }

  formatForChannel(message: NotificationMessage): string {
    switch (message.channel) {
      case 'console':
        return `[${message.severity.toUpperCase()}] ${message.title}: ${message.body}`
      case 'webhook':
        return JSON.stringify({
          title: message.title,
          body: message.body,
          severity: message.severity,
          timestamp: message.timestamp,
          metadata: message.metadata,
        })
      case 'file':
        return `[${new Date(message.timestamp).toISOString()}] [${message.severity.toUpperCase()}] ${message.title}: ${message.body}`
      case 'slack': {
        const severityEmoji: Record<AlertSeverity, string> = {
          critical: ':red_circle:',
          high: ':large_orange_diamond:',
          medium: ':large_yellow_diamond:',
          low: ':large_blue_diamond:',
          info: ':information_source:',
        }
        const emoji = severityEmoji[message.severity]
        return `${emoji} *${message.title}*\n${message.body}`
      }
      case 'email':
        return `Subject: ${message.title}\n\n${message.body}`
      default:
        return `${message.title}: ${message.body}`
    }
  }

  sendNotification(message: NotificationMessage): boolean {
    if (!this.config.enabled) {
      return false
    }

    const formatted = this.formatForChannel(message)
    switch (message.channel) {
      case 'console':
        console.log(formatted)
        return true
      case 'webhook':
        return this.config.webhookUrl !== undefined && this.config.webhookUrl.length > 0
      case 'email':
        return (this.config.emailRecipients?.length ?? 0) > 0
      case 'slack':
        return this.config.slackWebhook !== undefined && this.config.slackWebhook.length > 0
      case 'file':
        return this.config.filePath !== undefined && this.config.filePath.length > 0
      default:
        return false
    }
  }

  getAlerts(): Alert[] {
    return [...this.alerts]
  }

  getUnacknowledged(): Alert[] {
    return this.alerts.filter((alert) => !alert.acknowledged)
  }

  acknowledge(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      return true
    }
    return false
  }

  acknowledgeAll(): number {
    let count = 0
    for (const alert of this.alerts) {
      if (!alert.acknowledged) {
        alert.acknowledged = true
        count++
      }
    }
    return count
  }

  isInCooldown(ruleId: string): boolean {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      return false
    }
    const lastTime = this.lastTriggered.get(ruleId)
    if (lastTime === undefined) {
      return false
    }
    return Date.now() - lastTime < rule.cooldown
  }

  isRateLimited(): boolean {
    const oneHourAgo = Date.now() - ONE_HOUR_MS
    this.recentAlertTimestamps = this.recentAlertTimestamps.filter((ts) => ts > oneHourAgo)
    return this.recentAlertTimestamps.length >= this.config.maxAlertsPerHour
  }

  getCountBySeverity(): Record<AlertSeverity, number> {
    const counts: Record<AlertSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    }
    for (const alert of this.alerts) {
      counts[alert.severity]++
    }
    return counts
  }

  clearAlerts(): void {
    this.alerts = []
    this.lastTriggered.clear()
    this.recentAlertTimestamps = []
  }

  getConfig(): NotificationConfig {
    return { ...this.config }
  }
}
