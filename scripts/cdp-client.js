/**
 * Chrome DevTools Protocol (CDP) Client Library
 * Simple async/await interface for CDP MCP server
 *
 * Usage:
 *   const client = new CDPClient();
 *   await client.connect();
 *   const metrics = await client.getPerformanceMetrics();
 *   await client.disconnect();
 */

const net = require('net');
const { EventEmitter } = require('events');

class CDPClient extends EventEmitter {
  constructor(options = {}) {
    super();
    this.host = options.host || 'localhost';
    this.port = options.port || 3100;
    this.timeout = options.timeout || 30000;
    this.debug = options.debug || false;
    this.socket = null;
    this.messageQueue = new Map();
    this.nextId = 1;
  }

  log(msg) {
    if (this.debug) {
      console.error(`[CDP Client] ${new Date().toISOString()} - ${msg}`);
    }
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(this.port, this.host);

      this.socket.on('connect', () => {
        this.log('Connected to CDP server');
        this.setupMessageHandler();
        resolve();
      });

      this.socket.on('error', reject);

      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.timeout);
    });
  }

  setupMessageHandler() {
    let buffer = '';

    this.socket.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      lines.forEach((line) => {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            this.handleMessage(message);
          } catch (error) {
            this.log(`Failed to parse message: ${error.message}`);
          }
        }
      });
    });

    this.socket.on('error', (error) => {
      this.log(`Socket error: ${error.message}`);
      this.emit('error', error);
    });

    this.socket.on('end', () => {
      this.log('Disconnected from CDP server');
    });
  }

  handleMessage(message) {
    const { id, result, error } = message;
    const pendingPromise = this.messageQueue.get(id);

    if (pendingPromise) {
      if (error) {
        pendingPromise.reject(new Error(error));
      } else {
        pendingPromise.resolve(result);
      }
      this.messageQueue.delete(id);
    }
  }

  async sendMessage(method, params = {}) {
    if (!this.socket) {
      throw new Error('Not connected. Call connect() first.');
    }

    const id = this.nextId++;
    const message = { id, method, params };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageQueue.delete(id);
        reject(new Error(`Message ${id} timeout after ${this.timeout}ms`));
      }, this.timeout);

      this.messageQueue.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });

      this.socket.write(JSON.stringify(message) + '\n');
      this.log(`Sent: ${method} (id: ${id})`);
    });
  }

  // ========== Public API ==========

  async init() {
    return this.sendMessage('init');
  }

  async getBrowserVersion() {
    return this.sendMessage('browser.getVersion');
  }

  async listTargets() {
    return this.sendMessage('targets.list');
  }

  async getPerformanceMetrics(targetId = null) {
    return this.sendMessage('performance.getMetrics', { targetId });
  }

  async navigatePage(url, options = {}) {
    return this.sendMessage('page.navigate', { url, ...options });
  }

  async takeScreenshot(options = {}) {
    const { format = 'png', quality = 80, fullPage = false, clip = null } = options;
    return this.sendMessage('page.screenshot', {
      format,
      quality,
      fullPage,
      clip
    });
  }

  async inspectNetwork(options = {}) {
    const { filter = null, includeResponseBody = false } = options;
    return this.sendMessage('network.inspect', {
      filter,
      includeResponseBody
    });
  }

  async queryDOM(selector, options = {}) {
    const { includeAttributes = false, includeComputedStyle = false } = options;
    return this.sendMessage('dom.query', {
      selector,
      includeAttributes,
      includeComputedStyle
    });
  }

  async runLighthouseAudit(url, options = {}) {
    const {
      categories = ['performance', 'accessibility', 'best-practices', 'seo'],
      throttling = '4g'
    } = options;

    return this.sendMessage('lighthouse.audit', {
      url,
      categories,
      throttling
    });
  }

  // Convenience methods

  async waitForPerformance(expectedMetrics = {}, maxRetries = 10) {
    let lastMetrics = null;

    for (let i = 0; i < maxRetries; i++) {
      const result = await this.getPerformanceMetrics();
      lastMetrics = result;

      const meetsExpectations = Object.entries(expectedMetrics).every(
        ([metric, maxValue]) => {
          const actual = result.metrics.find(m => m.name === metric);
          return actual && actual.value <= maxValue;
        }
      );

      if (meetsExpectations) {
        return lastMetrics;
      }

      await this.delay(500);
    }

    throw new Error(
      `Performance metrics did not meet expectations after ${maxRetries} retries. Last metrics: ${JSON.stringify(lastMetrics)}`
    );
  }

  async measurePerformance(testFn, description = '') {
    const startMetrics = await this.getPerformanceMetrics();

    const startTime = Date.now();
    await testFn();
    const duration = Date.now() - startTime;

    const endMetrics = await this.getPerformanceMetrics();

    return {
      description,
      duration,
      startMetrics,
      endMetrics,
      changes: this.diffMetrics(startMetrics, endMetrics)
    };
  }

  diffMetrics(startMetrics, endMetrics) {
    const changes = {};

    startMetrics.metrics.forEach((startMetric) => {
      const endMetric = endMetrics.metrics.find(m => m.name === startMetric.name);
      if (endMetric) {
        changes[startMetric.name] = {
          start: startMetric.value,
          end: endMetric.value,
          delta: endMetric.value - startMetric.value,
          percentChange: ((endMetric.value - startMetric.value) / startMetric.value * 100).toFixed(2)
        };
      }
    });

    return changes;
  }

  async disconnect() {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.end(() => {
          this.log('Disconnected');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CDPClient;
}

// Example usage
if (require.main === module) {
  (async () => {
    const client = new CDPClient({ debug: true });

    try {
      await client.connect();
      console.log('Connected to CDP server');

      // Initialize
      const initResult = await client.init();
      console.log('Init result:', initResult);

      // Get browser version
      const version = await client.getBrowserVersion();
      console.log('Browser version:', version);

      // List targets
      const targets = await client.listTargets();
      console.log('Targets:', targets);

      // Get performance metrics
      const metrics = await client.getPerformanceMetrics();
      console.log('Performance metrics:', metrics);

      // Run Lighthouse audit
      const audit = await client.runLighthouseAudit('http://localhost:3000');
      console.log('Lighthouse audit:', audit);

      await client.disconnect();
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
