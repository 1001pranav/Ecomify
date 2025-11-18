/**
 * Test Queue Utilities
 * Observer Pattern: Mock event publishing for testing
 */

/**
 * Event observer interface
 */
export interface EventObserver {
  update(event: string, data: any): void;
}

/**
 * Test event queue - Observer Pattern implementation
 */
export class TestEventQueue {
  private static instance: TestEventQueue;
  private observers: Map<string, EventObserver[]> = new Map();
  private publishedEvents: Array<{ event: string; data: any; timestamp: Date }> = [];

  private constructor() {}

  static getInstance(): TestEventQueue {
    if (!TestEventQueue.instance) {
      TestEventQueue.instance = new TestEventQueue();
    }
    return TestEventQueue.instance;
  }

  /**
   * Subscribe to events
   */
  subscribe(event: string, observer: EventObserver): void {
    if (!this.observers.has(event)) {
      this.observers.set(event, []);
    }
    this.observers.get(event)!.push(observer);
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(event: string, observer: EventObserver): void {
    const eventObservers = this.observers.get(event);
    if (eventObservers) {
      const index = eventObservers.indexOf(observer);
      if (index > -1) {
        eventObservers.splice(index, 1);
      }
    }
  }

  /**
   * Publish event
   */
  publish(event: string, data: any): void {
    this.publishedEvents.push({
      event,
      data,
      timestamp: new Date(),
    });

    const eventObservers = this.observers.get(event);
    if (eventObservers) {
      eventObservers.forEach((observer) => observer.update(event, data));
    }
  }

  /**
   * Get all published events
   */
  getPublishedEvents(): Array<{ event: string; data: any; timestamp: Date }> {
    return this.publishedEvents;
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string): any[] {
    return this.publishedEvents
      .filter((e) => e.event === eventType)
      .map((e) => e.data);
  }

  /**
   * Wait for event to be published
   */
  async waitForEvent(
    eventType: string,
    timeout: number = 5000
  ): Promise<any> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const events = this.getEventsByType(eventType);
      if (events.length > 0) {
        return events[events.length - 1];
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Event ${eventType} not received within ${timeout}ms`);
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.publishedEvents = [];
    this.observers.clear();
  }

  /**
   * Get event count
   */
  getEventCount(eventType?: string): number {
    if (eventType) {
      return this.getEventsByType(eventType).length;
    }
    return this.publishedEvents.length;
  }
}

/**
 * Get test queue instance
 */
export function getTestQueue(): TestEventQueue {
  return TestEventQueue.getInstance();
}

/**
 * Mock queue service for testing
 */
export class MockQueueService {
  private queue = getTestQueue();

  async publish(event: string, data: any): Promise<void> {
    this.queue.publish(event, data);
  }

  async subscribe(event: string, handler: (data: any) => void): Promise<void> {
    this.queue.subscribe(event, {
      update: (eventType: string, data: any) => handler(data),
    });
  }

  getPublishedEvents() {
    return this.queue.getPublishedEvents();
  }

  clear() {
    this.queue.clear();
  }
}
