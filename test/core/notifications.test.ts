import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AlertManager } from '../../src/core/notifications/alert-manager.js'
import { DEFAULT_NOTIFICATION_CONFIG } from '../../src/core/notifications/types.js'
import type { AlertRule, NotificationConfig } from '../../src/core/notifications/types.js'

function makeRule(overrides: Partial<AlertRule> = {}): AlertRule {
  return {
    id: 'rule-1',
    name: 'Test Rule',
    type: 'threshold-exceeded',
    severity: 'high',
    condition: {
      metric: 'complexity',
      operator: '>',
      value: 10,
    },
    channels: ['console'],
    enabled: true,
    cooldown: 0,
    metadata: {},
    ...overrides,
  }
}

describe('AlertManager', () => {
  let manager: AlertManager

  beforeEach(() => {
    manager = new AlertManager()
  })

  describe('constructor', () => {
    it('creates instance with default config', () => {
      const mgr = new AlertManager()
      expect(mgr.getConfig()).toEqual(DEFAULT_NOTIFICATION_CONFIG)
    })

    it('merges partial config with defaults', () => {
      const mgr = new AlertManager({ maxAlertsPerHour: 50 })
      const config = mgr.getConfig()
      expect(config.maxAlertsPerHour).toBe(50)
      expect(config.enabled).toBe(true)
    })

    it('accepts full config override', () => {
      const customConfig: Partial<NotificationConfig> = {
        enabled: false,
        defaultChannels: ['slack'],
        maxAlertsPerHour: 10,
        deduplicationWindow: 60000,
        webhookUrl: 'https://example.com/hook',
        emailRecipients: ['admin@example.com'],
        slackWebhook: 'https://hooks.slack.com/xxx',
        filePath: '/tmp/alerts.log',
      }
      const mgr = new AlertManager(customConfig)
      const config = mgr.getConfig()
      expect(config.enabled).toBe(false)
      expect(config.defaultChannels).toEqual(['slack'])
      expect(config.webhookUrl).toBe('https://example.com/hook')
    })
  })

  describe('addRule / removeRule / getRules', () => {
    it('adds a rule and retrieves it', () => {
      const rule = makeRule()
      manager.addRule(rule)
      expect(manager.getRules()).toHaveLength(1)
      expect(manager.getRules()[0]!.id).toBe('rule-1')
    })

    it('adds multiple rules', () => {
      manager.addRule(makeRule({ id: 'r1' }))
      manager.addRule(makeRule({ id: 'r2' }))
      manager.addRule(makeRule({ id: 'r3' }))
      expect(manager.getRules()).toHaveLength(3)
    })

    it('overwrites rule with same id', () => {
      manager.addRule(makeRule({ id: 'r1', name: 'First' }))
      manager.addRule(makeRule({ id: 'r1', name: 'Second' }))
      expect(manager.getRules()).toHaveLength(1)
      expect(manager.getRules()[0]!.name).toBe('Second')
    })

    it('removes an existing rule', () => {
      manager.addRule(makeRule({ id: 'r1' }))
      const result = manager.removeRule('r1')
      expect(result).toBe(true)
      expect(manager.getRules()).toHaveLength(0)
    })

    it('returns false when removing non-existent rule', () => {
      const result = manager.removeRule('nonexistent')
      expect(result).toBe(false)
    })

    it('getEnabledRules returns only enabled rules', () => {
      manager.addRule(makeRule({ id: 'r1', enabled: true }))
      manager.addRule(makeRule({ id: 'r2', enabled: false }))
      manager.addRule(makeRule({ id: 'r3', enabled: true }))
      expect(manager.getEnabledRules()).toHaveLength(2)
    })

    it('getEnabledRules returns empty array when all disabled', () => {
      manager.addRule(makeRule({ id: 'r1', enabled: false }))
      expect(manager.getEnabledRules()).toHaveLength(0)
    })
  })

  describe('checkCondition', () => {
    it('checks greater than (>)', () => {
      const rule = makeRule({ condition: { metric: 'x', operator: '>', value: 10 } })
      manager.addRule(rule)
      expect(manager.checkCondition({ metric: 'x', operator: '>', value: 10 }, 15)).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '>', value: 10 }, 5)).toBe(false)
      expect(manager.checkCondition({ metric: 'x', operator: '>', value: 10 }, 10)).toBe(false)
    })

    it('checks less than (<)', () => {
      expect(manager.checkCondition({ metric: 'x', operator: '<', value: 10 }, 5)).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '<', value: 10 }, 15)).toBe(false)
    })

    it('checks greater than or equal (>=)', () => {
      expect(manager.checkCondition({ metric: 'x', operator: '>=', value: 10 }, 10)).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '>=', value: 10 }, 15)).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '>=', value: 10 }, 5)).toBe(false)
    })

    it('checks less than or equal (<=)', () => {
      expect(manager.checkCondition({ metric: 'x', operator: '<=', value: 10 }, 10)).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '<=', value: 10 }, 5)).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '<=', value: 10 }, 15)).toBe(false)
    })

    it('checks equality (==)', () => {
      expect(manager.checkCondition({ metric: 'x', operator: '==', value: 10 }, 10)).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '==', value: 10 }, 11)).toBe(false)
    })

    it('checks inequality (!=)', () => {
      expect(manager.checkCondition({ metric: 'x', operator: '!=', value: 10 }, 11)).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '!=', value: 10 }, 10)).toBe(false)
    })

    it('checks contains operator', () => {
      expect(manager.checkCondition({ metric: 'x', operator: 'contains', value: 'error' }, 'error: something')).toBe(
        true,
      )
      expect(manager.checkCondition({ metric: 'x', operator: 'contains', value: 'error' }, 'warning: something')).toBe(
        false,
      )
    })

    it('handles string comparison with ==', () => {
      expect(manager.checkCondition({ metric: 'x', operator: '==', value: 'hello' }, 'hello')).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '==', value: 'hello' }, 'world')).toBe(false)
    })

    it('handles string comparison with !=', () => {
      expect(manager.checkCondition({ metric: 'x', operator: '!=', value: 'hello' }, 'world')).toBe(true)
      expect(manager.checkCondition({ metric: 'x', operator: '!=', value: 'hello' }, 'hello')).toBe(false)
    })

    it('handles numeric strings in numeric comparison', () => {
      expect(manager.checkCondition({ metric: 'x', operator: '>', value: '5' }, '10')).toBe(true)
    })
  })

  describe('evaluate', () => {
    it('triggers alert when condition is met', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 15)
      expect(alerts).toHaveLength(1)
      expect(alerts[0]!.severity).toBe('high')
      expect(alerts[0]!.acknowledged).toBe(false)
    })

    it('returns empty when condition not met', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 5)
      expect(alerts).toHaveLength(0)
    })

    it('returns empty when metric does not match', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('lines', 15)
      expect(alerts).toHaveLength(0)
    })

    it('returns empty when rule is disabled', () => {
      manager.addRule(makeRule({ enabled: false }))
      const alerts = manager.evaluate('complexity', 15)
      expect(alerts).toHaveLength(0)
    })

    it('returns empty when notifications disabled in config', () => {
      const mgr = new AlertManager({ enabled: false })
      mgr.addRule(makeRule())
      const alerts = mgr.evaluate('complexity', 15)
      expect(alerts).toHaveLength(0)
    })

    it('passes context data to alert', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 15, { file: 'test.ts' })
      expect(alerts[0]!.data.file).toBe('test.ts')
      expect(alerts[0]!.data.metric).toBe('complexity')
      expect(alerts[0]!.data.value).toBe(15)
    })

    it('triggers multiple matching rules', () => {
      manager.addRule(makeRule({ id: 'r1', condition: { metric: 'x', operator: '>', value: 5 } }))
      manager.addRule(makeRule({ id: 'r2', condition: { metric: 'x', operator: '>', value: 10 } }))
      manager.addRule(makeRule({ id: 'r3', condition: { metric: 'y', operator: '>', value: 5 } }))
      const alerts = manager.evaluate('x', 15)
      expect(alerts).toHaveLength(2)
    })
  })

  describe('evaluateAll', () => {
    it('evaluates multiple metrics', () => {
      manager.addRule(makeRule({ id: 'r1', condition: { metric: 'complexity', operator: '>', value: 10 } }))
      manager.addRule(makeRule({ id: 'r2', condition: { metric: 'lines', operator: '>', value: 500 } }))
      const alerts = manager.evaluateAll({ complexity: 15, lines: 600 })
      expect(alerts).toHaveLength(2)
    })

    it('returns combined alerts from all metrics', () => {
      manager.addRule(makeRule({ id: 'r1', condition: { metric: 'a', operator: '>', value: 10 } }))
      manager.addRule(makeRule({ id: 'r2', condition: { metric: 'b', operator: '<', value: 5 } }))
      const alerts = manager.evaluateAll({ a: 15, b: 2 })
      expect(alerts).toHaveLength(2)
    })

    it('returns empty when no metrics match', () => {
      manager.addRule(makeRule({ condition: { metric: 'a', operator: '>', value: 100 } }))
      const alerts = manager.evaluateAll({ a: 5 })
      expect(alerts).toHaveLength(0)
    })
  })

  describe('cooldown', () => {
    it('skips alert when rule is in cooldown', () => {
      manager.addRule(makeRule({ id: 'r1', cooldown: 60000 }))
      manager.evaluate('complexity', 15)
      const alerts2 = manager.evaluate('complexity', 15)
      expect(alerts2).toHaveLength(0)
    })

    it('isInCooldown returns false for unknown rule', () => {
      expect(manager.isInCooldown('unknown')).toBe(false)
    })

    it('isInCooldown returns false before first trigger', () => {
      manager.addRule(makeRule({ id: 'r1', cooldown: 60000 }))
      expect(manager.isInCooldown('r1')).toBe(false)
    })

    it('triggers again after cooldown expires', () => {
      manager.addRule(makeRule({ id: 'r1', cooldown: 0 }))
      manager.evaluate('complexity', 15)
      const alerts2 = manager.evaluate('complexity', 15)
      expect(alerts2).toHaveLength(1)
    })
  })

  describe('rate limiting', () => {
    it('respects maxAlertsPerHour limit', () => {
      const mgr = new AlertManager({ maxAlertsPerHour: 2 })
      mgr.addRule(makeRule({ id: 'r1', cooldown: 0, condition: { metric: 'x', operator: '>', value: 0 } }))
      mgr.addRule(makeRule({ id: 'r2', cooldown: 0, condition: { metric: 'x', operator: '>', value: 0 } }))
      const first = mgr.evaluate('x', 1)
      expect(first).toHaveLength(2)
      const second = mgr.evaluate('x', 1)
      expect(second).toHaveLength(0)
    })

    it('isRateLimited returns false when under limit', () => {
      expect(manager.isRateLimited()).toBe(false)
    })
  })

  describe('notification formatting', () => {
    it('creates notification from alert', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 15)
      const notification = manager.createNotification(alerts[0]!)
      expect(notification.title).toContain('HIGH')
      expect(notification.title).toContain('Test Rule')
      expect(notification.severity).toBe('high')
      expect(notification.metadata.ruleId).toBe('rule-1')
    })

    it('formats for console channel', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 15)
      const notification = manager.createNotification(alerts[0]!)
      notification.channel = 'console'
      const formatted = manager.formatForChannel(notification)
      expect(formatted).toContain('[HIGH]')
      expect(formatted).toContain('Test Rule')
    })

    it('formats for webhook channel as JSON', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 15)
      const notification = manager.createNotification(alerts[0]!)
      notification.channel = 'webhook'
      const formatted = manager.formatForChannel(notification)
      const parsed = JSON.parse(formatted)
      expect(parsed.title).toContain('Test Rule')
      expect(parsed.severity).toBe('high')
    })

    it('formats for file channel with timestamp', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 15)
      const notification = manager.createNotification(alerts[0]!)
      notification.channel = 'file'
      const formatted = manager.formatForChannel(notification)
      expect(formatted).toContain('[HIGH]')
      expect(formatted).toContain('Test Rule')
    })

    it('formats for slack channel with severity marker', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 15)
      const notification = manager.createNotification(alerts[0]!)
      notification.channel = 'slack'
      const formatted = manager.formatForChannel(notification)
      expect(formatted).toContain('Test Rule')
      expect(formatted).toContain('*')
    })

    it('formats for email channel with subject and body', () => {
      manager.addRule(makeRule())
      const alerts = manager.evaluate('complexity', 15)
      const notification = manager.createNotification(alerts[0]!)
      notification.channel = 'email'
      const formatted = manager.formatForChannel(notification)
      expect(formatted).toContain('Subject:')
      expect(formatted).toContain('Test Rule')
    })
  })

  describe('sendNotification', () => {
    it('returns true for console channel', () => {
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'console' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(manager.sendNotification(msg)).toBe(true)
    })

    it('returns true for webhook when url configured', () => {
      const mgr = new AlertManager({ webhookUrl: 'https://example.com/hook' })
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'webhook' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(mgr.sendNotification(msg)).toBe(true)
    })

    it('returns false for webhook when url not configured', () => {
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'webhook' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(manager.sendNotification(msg)).toBe(false)
    })

    it('returns true for email when recipients configured', () => {
      const mgr = new AlertManager({ emailRecipients: ['admin@example.com'] })
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'email' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(mgr.sendNotification(msg)).toBe(true)
    })

    it('returns false for email when no recipients', () => {
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'email' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(manager.sendNotification(msg)).toBe(false)
    })

    it('returns true for slack when webhook configured', () => {
      const mgr = new AlertManager({ slackWebhook: 'https://hooks.slack.com/xxx' })
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'slack' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(mgr.sendNotification(msg)).toBe(true)
    })

    it('returns false for slack when no webhook configured', () => {
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'slack' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(manager.sendNotification(msg)).toBe(false)
    })

    it('returns true for file when path configured', () => {
      const mgr = new AlertManager({ filePath: '/tmp/alerts.log' })
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'file' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(mgr.sendNotification(msg)).toBe(true)
    })

    it('returns false for file when no path configured', () => {
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'file' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(manager.sendNotification(msg)).toBe(false)
    })

    it('returns false when notifications disabled', () => {
      const mgr = new AlertManager({ enabled: false })
      const msg = {
        title: 'Test',
        body: 'body',
        severity: 'info' as const,
        channel: 'console' as const,
        timestamp: Date.now(),
        metadata: {},
      }
      expect(mgr.sendNotification(msg)).toBe(false)
    })
  })

  describe('alert management', () => {
    it('getAlerts returns all alerts', () => {
      manager.addRule(makeRule({ id: 'r1', cooldown: 0 }))
      manager.evaluate('complexity', 15)
      manager.evaluate('complexity', 20)
      expect(manager.getAlerts()).toHaveLength(2)
    })

    it('getUnacknowledged returns only unacknowledged', () => {
      manager.addRule(makeRule({ id: 'r1', cooldown: 0 }))
      manager.evaluate('complexity', 15)
      manager.evaluate('complexity', 20)
      expect(manager.getUnacknowledged()).toHaveLength(2)
    })

    it('acknowledge marks alert as acknowledged', () => {
      manager.addRule(makeRule({ id: 'r1' }))
      const [alert] = manager.evaluate('complexity', 15)
      const result = manager.acknowledge(alert!.id)
      expect(result).toBe(true)
      expect(manager.getUnacknowledged()).toHaveLength(0)
    })

    it('acknowledge returns false for unknown alert', () => {
      expect(manager.acknowledge('nonexistent')).toBe(false)
    })

    it('acknowledgeAll marks all as acknowledged', () => {
      manager.addRule(makeRule({ id: 'r1', cooldown: 0 }))
      manager.evaluate('complexity', 15)
      manager.evaluate('complexity', 20)
      const count = manager.acknowledgeAll()
      expect(count).toBe(2)
      expect(manager.getUnacknowledged()).toHaveLength(0)
    })

    it('acknowledgeAll returns 0 when no alerts', () => {
      expect(manager.acknowledgeAll()).toBe(0)
    })

    it('clearAlerts removes all alerts', () => {
      manager.addRule(makeRule())
      manager.evaluate('complexity', 15)
      manager.clearAlerts()
      expect(manager.getAlerts()).toHaveLength(0)
    })
  })

  describe('getCountBySeverity', () => {
    it('returns zero counts initially', () => {
      const counts = manager.getCountBySeverity()
      expect(counts.critical).toBe(0)
      expect(counts.high).toBe(0)
      expect(counts.medium).toBe(0)
      expect(counts.low).toBe(0)
      expect(counts.info).toBe(0)
    })

    it('counts alerts by severity', () => {
      manager.addRule(makeRule({ id: 'r1', severity: 'critical', condition: { metric: 'a', operator: '>', value: 0 } }))
      manager.addRule(makeRule({ id: 'r2', severity: 'high', condition: { metric: 'b', operator: '>', value: 0 } }))
      manager.addRule(makeRule({ id: 'r3', severity: 'high', condition: { metric: 'c', operator: '>', value: 0 } }))
      manager.evaluateAll({ a: 1, b: 1, c: 1 })
      const counts = manager.getCountBySeverity()
      expect(counts.critical).toBe(1)
      expect(counts.high).toBe(2)
    })
  })

  describe('getConfig', () => {
    it('returns a copy of the config', () => {
      const config1 = manager.getConfig()
      const config2 = manager.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })
  })

  describe('edge cases', () => {
    it('handles contains with non-string values', () => {
      expect(manager.checkCondition({ metric: 'x', operator: 'contains', value: 'err' }, 123)).toBe(false)
    })

    it('handles rule with zero cooldown allowing re-trigger', () => {
      manager.addRule(makeRule({ cooldown: 0 }))
      const a1 = manager.evaluate('complexity', 15)
      const a2 = manager.evaluate('complexity', 15)
      expect(a1).toHaveLength(1)
      expect(a2).toHaveLength(1)
    })

    it('alert message includes metric and value info', () => {
      manager.addRule(makeRule())
      const [alert] = manager.evaluate('complexity', 15)
      expect(alert!.message).toContain('complexity')
      expect(alert!.message).toContain('15')
    })

    it('each alert gets unique id', () => {
      manager.addRule(makeRule({ id: 'r1', cooldown: 0 }))
      const a1 = manager.evaluate('complexity', 15)
      const a2 = manager.evaluate('complexity', 15)
      expect(a1[0]!.id).not.toBe(a2[0]!.id)
    })

    it('rule with metadata preserves it in alert', () => {
      manager.addRule(makeRule({ metadata: { team: 'security', priority: 1 } }))
      const [alert] = manager.evaluate('complexity', 15)
      expect(alert!.rule.metadata.team).toBe('security')
      expect(alert!.rule.metadata.priority).toBe(1)
    })
  })
})
