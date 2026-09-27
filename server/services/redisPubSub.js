// Redis Pub/Sub Adapter & Multi-Instance Relay Simulator
import { EventEmitter } from 'events';

class RedisPubSubSimulator extends EventEmitter {
  constructor() {
    super();
    this.connected = true;
    this.nodes = ['Cluster-Node-Alpha (Port 5000)', 'Cluster-Node-Beta (Port 5001)'];
    this.metrics = {
      publishedCount: 0,
      relayedCount: 0,
      activeChannels: ['nith:cs-302', 'nith:ec-201', 'nith:himalaya-room-4', 'nith:nith-hackathon-7'],
      avgLatencyMs: 2
    };
    this.recentLogs = [];
  }

  publish(channel, eventName, payload, sourceNode = 'Node-Alpha') {
    this.metrics.publishedCount++;
    
    // Simulate Redis Channel Publish
    const targetNode = sourceNode === 'Node-Alpha' ? 'Node-Beta' : 'Node-Alpha';
    const logEntry = {
      id: `redis-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toISOString(),
      channel,
      eventName,
      sourceNode,
      targetNode,
      payloadSummary: typeof payload === 'object' ? JSON.stringify(payload).substring(0, 70) + '...' : String(payload),
      latencyMs: Math.floor(1 + Math.random() * 3)
    };

    this.recentLogs.unshift(logEntry);
    if (this.recentLogs.length > 50) this.recentLogs.pop();

    this.metrics.relayedCount++;
    this.emit('message', channel, eventName, payload, logEntry);
    return logEntry;
  }

  getStats() {
    return {
      connected: this.connected,
      nodes: this.nodes,
      metrics: this.metrics,
      logs: this.recentLogs.slice(0, 15)
    };
  }
}

export const redisPubSub = new RedisPubSubSimulator();
