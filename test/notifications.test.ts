import { AlertManager } from '../src/core/notifications/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('AlertManager', () => {
  describe('constructor', () => {
    it('creates manager with default config', () => {
      const am = new AlertManager()
      expect(am.getAlerts()).toEqual([])
      expect(am.getRules()).toEqual([])
    })

    it('accepts custom config', () => {
      const am = new AlertManager({ enabled: false })
      expect(am.getConfig().enabled).toBe(false)
    })
  })

  // ─── Rule Management ────────────────────────────────────────────────────

  describe('rule management', () => {
    it('adds a rule', () => {
      const am = new AlertManager()
      am.addRule({
        id: 'r1',
        name: 'Test Rule',
        enabled: true,
        condition: { metric: 'cpu', operator: '>', value: 90 },
        severity: 'high',
        channels: ['console'],
        type: 'threshold',
        cooldown: 0,
      })
      expect(am.getRules().length).toBe(1)
      expect(am.getEnabledRules().length).toBe(1)
    })

    it('removes a rule', () => {
      const am = new AlertManager()
      am.addRule({
        id: 'r1',
        name: 'Test',
        enabled: true,
        condition: { metric: 'cpu', operator: '>', value: 90 },
        severity: 'high',
        channels: ['console'],
        type: 'threshold',
        cooldown: 0,
      })
      expect(am.removeRule('r1')).toBe(true)
      expect(am.removeRule('r1')).toBe(false)
      expect(am.getRules().length).toBe(0)
    })

    it('getEnabledRules excludes disabled rules', () => {
      const am = new AlertManager()
      am.addRule({ id: 'r1', name: 'On', enabled: true, condition: { metric: 'x', operator: '>', value: 1 }, severity: 'low', channels: ['console'], type: 'threshold', cooldown: 0 })
      am.addRule({ id: 'r2', name: 'Off', enabled: false, condition: { metric: 'x', operator: '>', value: 1 }, severity: 'low', channels: ['console'], type: 'threshold', cooldown: 0 })
      expect(am.getEnabledRules().length).toBe(1)
    })
  })

  // ─── CheckCondition ──────────────────────────────────────────────────────

  describe('checkCondition', () => {
    it('checks greater than', () => {
      const am = new AlertManager()
      expect(am.checkCondition({ metric: 'x', operator: '>', value: 5 }, 10)).toBe(true)
      expect(am.checkCondition({ metric: 'x', operator: '>', value: 5 }, 3)).toBe(false)
    })

    it('checks less than', () => {
      const am = new AlertManager()
      expect(am.checkCondition({ metric: 'x', operator: '<', value: 5 }, 3)).toBe(true)
    })

    it('checks equality', () => {
      const am = new AlertManager()
      expect(am.checkCondition({ metric: 'x', operator: '==', value: 5 }, 5)).toBe(true)
      expect(am.checkCondition({ metric: 'x', operator: '!=', value: 5 }, 3)).toBe(true)
    })

    it('checks contains', () => {
      const am = new AlertManager()
      expect(am.checkCondition({ metric: 'x', operator: 'contains', value: 'err' }, 'error message')).toBe(true)
    })

    it('checks >= and <=', () => {
      const am = new AlertManager()
      expect(am.checkCondition({ metric: 'x', operator: '>=', value: 5 }, 5)).toBe(true)
      expect(am.checkCondition({ metric: 'x', operator: '<=', value: 5 }, 5)).toBe(true)
    })
  })

  // ─── Evaluate ────────────────────────────────────────────────────────────

  describe('evaluate', () => {
    it('triggers alert when condition met', () => {
      const am = new AlertManager()
      am.addRule({
        id: 'r1',
        name: 'High CPU',
        enabled: true,
        condition: { metric: 'cpu', operator: '>', value: 80 },
        severity: 'high',
        channels: ['console'],
        type: 'threshold',
        cooldown: 0,
      })
      const alerts = am.evaluate('cpu', 95)
      expect(alerts.length).toBe(1)
      expect(alerts[0]!.severity).toBe('high')
    })

    it('does not trigger when condition not met', () => {
      const am = new AlertManager()
      am.addRule({
        id: 'r1',
        name: 'High CPU',
        enabled: true,
        condition: { metric: 'cpu', operator: '>', value: 80 },
        severity: 'high',
        channels: ['console'],
        type: 'threshold',
        cooldown: 0,
      })
      expect(am.evaluate('cpu', 50)).toEqual([])
    })

    it('does not trigger when disabled', () => {
      const am = new AlertManager({ enabled: false })
      am.addRule({
        id: 'r1',
        name: 'Test',
        enabled: true,
        condition: { metric: 'x', operator: '>', value: 0 },
        severity: 'low',
        channels: ['console'],
        type: 'threshold',
        cooldown: 0,
      })
      expect(am.evaluate('x', 100)).toEqual([])
    })

    it('evaluateAll checks multiple metrics', () => {
      const am = new AlertManager()
      am.addRule({ id: 'r1', name: 'A', enabled: true, condition: { metric: 'a', operator: '>', value: 5 }, severity: 'low', channels: ['console'], type: 'threshold', cooldown: 0 })
      am.addRule({ id: 'r2', name: 'B', enabled: true, condition: { metric: 'b', operator: '>', value: 5 }, severity: 'medium', channels: ['console'], type: 'threshold', cooldown: 0 })
      const alerts = am.evaluateAll({ a: 10, b: 3 })
      expect(alerts.length).toBe(1)
    })
  })

  // ─── Acknowledge ─────────────────────────────────────────────────────────

  describe('acknowledge', () => {
    it('acknowledges an alert', () => {
      const am = new AlertManager()
      am.addRule({ id: 'r1', name: 'T', enabled: true, condition: { metric: 'x', operator: '>', value: 0 }, severity: 'low', channels: ['console'], type: 'threshold', cooldown: 0 })
      const [alert] = am.evaluate('x', 1)
      expect(am.acknowledge(alert!.id)).toBe(true)
      expect(am.getUnacknowledged().length).toBe(0)
    })

    it('acknowledgeAll marks all', () => {
      const am = new AlertManager()
      am.addRule({ id: 'r1', name: 'T', enabled: true, condition: { metric: 'x', operator: '>', value: 0 }, severity: 'low', channels: ['console'], type: 'threshold', cooldown: 0 })
      am.evaluate('x', 1)
      am.evaluate('x', 2)
      expect(am.acknowledgeAll()).toBe(2)
    })

    it('returns false for unknown alert', () => {
      const am = new AlertManager()
      expect(am.acknowledge('nonexistent')).toBe(false)
    })
  })

  // ─── Notification Formatting ─────────────────────────────────────────────

  describe('formatting', () => {
    it('formats for console channel', () => {
      const am = new AlertManager()
      am.addRule({ id: 'r1', name: 'Test', enabled: true, condition: { metric: 'x', operator: '>', value: 0 }, severity: 'low', channels: ['console'], type: 'threshold', cooldown: 0 })
      const [alert] = am.evaluate('x', 1)
      const msg = am.createNotification(alert!)
      const formatted = am.formatForChannel(msg)
      expect(formatted).toContain('Test')
    })

    it('formats for webhook channel', () => {
      const am = new AlertManager()
      const msg = { title: 'Test', body: 'Body', severity: 'high' as const, channel: 'webhook' as const, timestamp: Date.now(), metadata: {} }
      const formatted = am.formatForChannel(msg)
      expect(() => JSON.parse(formatted)).not.toThrow()
    })
  })

  // ─── Utility ─────────────────────────────────────────────────────────────

  describe('utility', () => {
    it('getCountBySeverity returns counts', () => {
      const am = new AlertManager()
      am.addRule({ id: 'r1', name: 'T', enabled: true, condition: { metric: 'x', operator: '>', value: 0 }, severity: 'high', channels: ['console'], type: 'threshold', cooldown: 0 })
      am.evaluate('x', 1)
      const counts = am.getCountBySeverity()
      expect(counts.high).toBe(1)
      expect(counts.low).toBe(0)
    })

    it('clearAlerts removes all alerts', () => {
      const am = new AlertManager()
      am.addRule({ id: 'r1', name: 'T', enabled: true, condition: { metric: 'x', operator: '>', value: 0 }, severity: 'low', channels: ['console'], type: 'threshold', cooldown: 0 })
      am.evaluate('x', 1)
      am.clearAlerts()
      expect(am.getAlerts()).toEqual([])
    })
  })
})
