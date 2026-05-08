export type NotificationChannel = 'console' | 'webhook' | 'email' | 'slack' | 'file'
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type AlertType = 'threshold-exceeded' | 'regression-detected' | 'new-violation' | 'quality-declined' | 'security-vulnerability' | 'build-quality'

export interface AlertRule {
  id: string
  name: string
  type: AlertType
  severity: AlertSeverity
  condition: AlertCondition
  channels: NotificationChannel[]
  enabled: boolean
  cooldown: number
  metadata: Record<string, unknown>
}

export interface AlertCondition {
  metric: string
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains'
  value: number | string
  timeframe?: string
}

export interface Alert {
  id: string
  rule: AlertRule
  triggeredAt: number
  message: string
  severity: AlertSeverity
  data: Record<string, unknown>
  acknowledged: boolean
}

export interface NotificationMessage {
  title: string
  body: string
  severity: AlertSeverity
  channel: NotificationChannel
  timestamp: number
  metadata: Record<string, string>
}

export interface NotificationConfig {
  enabled: boolean
  defaultChannels: NotificationChannel[]
  quietHoursStart?: number
  quietHoursEnd?: number
  maxAlertsPerHour: number
  deduplicationWindow: number
  webhookUrl?: string
  emailRecipients?: string[]
  slackWebhook?: string
  filePath?: string
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: true,
  defaultChannels: ['console'],
  maxAlertsPerHour: 100,
  deduplicationWindow: 300000,
}
