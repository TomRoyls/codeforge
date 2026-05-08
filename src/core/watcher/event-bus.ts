import type { EventHandler, Subscription } from './types.js'

export class EventBus {
  private subscriptions: Map<string, Subscription> = new Map()
  private idCounter: number = 0

  on(event: string, handler: EventHandler): Subscription {
    return this.createSubscription(event, handler, false)
  }

  once(event: string, handler: EventHandler): Subscription {
    return this.createSubscription(event, handler, true)
  }

  off(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId)
  }

  emit(event: string, data: unknown): void {
    const toRemove: string[] = []

    for (const [id, sub] of this.subscriptions) {
      if (sub.event === event) {
        sub.handler(data)
        if (sub.once) {
          toRemove.push(id)
        }
      }
    }

    for (const id of toRemove) {
      this.subscriptions.delete(id)
    }
  }

  getSubscriptions(event?: string): Subscription[] {
    const subs = Array.from(this.subscriptions.values())
    if (event !== undefined) {
      return subs.filter((s) => s.event === event)
    }
    return subs
  }

  clear(): void {
    this.subscriptions.clear()
    this.idCounter = 0
  }

  listenerCount(event: string): number {
    let count = 0
    for (const sub of this.subscriptions.values()) {
      if (sub.event === event) {
        count++
      }
    }
    return count
  }

  private createSubscription(event: string, handler: EventHandler, once: boolean): Subscription {
    const id = `sub_${++this.idCounter}`
    const subscription: Subscription = { id, event, handler, once }
    this.subscriptions.set(id, subscription)
    return subscription
  }
}
