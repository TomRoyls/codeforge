import { describe, it, expect } from 'vitest'
import { EventSink } from '../../../src/utils/event-sink.js'

interface TestEvents {
  message: string
  count: number
  done: boolean
}

describe('EventSink', () => {
  describe('on and emit', () => {
    it('calls handler on emit', () => {
      const bus = new EventSink<TestEvents>()
      let received = ''
      bus.on('message', (data) => { received = data })
      bus.emit('message', 'hello')
      expect(received).toBe('hello')
    })

    it('calls multiple handlers', () => {
      const bus = new EventSink<TestEvents>()
      let count = 0
      bus.on('count', () => { count++ })
      bus.on('count', () => { count++ })
      bus.emit('count', 1)
      expect(count).toBe(2)
    })

    it('does not call handlers for other events', () => {
      const bus = new EventSink<TestEvents>()
      let called = false
      bus.on('message', () => { called = true })
      bus.emit('count', 1)
      expect(called).toBe(false)
    })
  })

  describe('off', () => {
    it('removes handler', () => {
      const bus = new EventSink<TestEvents>()
      let count = 0
      const handler = () => { count++ }
      bus.on('count', handler)
      bus.emit('count', 1)
      bus.off('count', handler)
      bus.emit('count', 2)
      expect(count).toBe(1)
    })
  })

  describe('unsubscribe from on()', () => {
    it('returns unsubscribe function', () => {
      const bus = new EventSink<TestEvents>()
      let count = 0
      const unsub = bus.on('count', () => { count++ })
      bus.emit('count', 1)
      unsub()
      bus.emit('count', 2)
      expect(count).toBe(1)
    })
  })

  describe('listenerCount', () => {
    it('counts listeners', () => {
      const bus = new EventSink<TestEvents>()
      bus.on('message', () => {})
      bus.on('message', () => {})
      expect(bus.listenerCount('message')).toBe(2)
    })

    it('returns 0 for unregistered events', () => {
      const bus = new EventSink<TestEvents>()
      expect(bus.listenerCount('message')).toBe(0)
    })
  })

  describe('removeAllListeners', () => {
    it('removes all for specific event', () => {
      const bus = new EventSink<TestEvents>()
      bus.on('message', () => {})
      bus.on('message', () => {})
      bus.removeAllListeners('message')
      expect(bus.listenerCount('message')).toBe(0)
    })

    it('removes all events', () => {
      const bus = new EventSink<TestEvents>()
      bus.on('message', () => {})
      bus.on('count', () => {})
      bus.removeAllListeners()
      expect(bus.eventNames.length).toBe(0)
    })
  })

  describe('eventNames', () => {
    it('lists registered events', () => {
      const bus = new EventSink<TestEvents>()
      bus.on('message', () => {})
      bus.on('count', () => {})
      expect(bus.eventNames).toContain('message')
      expect(bus.eventNames).toContain('count')
    })
  })
})
