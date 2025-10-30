/**
 * Metrics Collection Tool
 *
 * A comprehensive metrics collection and aggregation system supporting counters,
 * gauges, histograms, and timers. Exports metrics in JSON and Prometheus formats
 * for integration with monitoring systems.
 *
 * @example Basic Usage
 * ```typescript
 * const metrics = new MetricsCollector({ service: 'api' });
 *
 * // Counter - monotonically increasing value
 * const requests = metrics.counter('http_requests_total', {
 *   description: 'Total HTTP requests'
 * });
 * requests.inc({ method: 'GET', status: '200' });
 *
 * // Gauge - value that can go up or down
 * const memory = metrics.gauge('memory_usage_bytes', {
 *   description: 'Current memory usage'
 * });
 * memory.set(process.memoryUsage().heapUsed);
 *
 * // Histogram - track distributions
 * const latency = metrics.histogram('http_request_duration_ms', {
 *   description: 'HTTP request latency',
 *   buckets: [10, 50, 100, 500, 1000, 5000]
 * });
 * latency.observe(245, { endpoint: '/api/users' });
 *
 * // Timer - convenience wrapper for histograms
 * const timer = metrics.timer('db_query_duration_ms');
 * const end = timer.start({ query: 'SELECT' });
 * // ... do work ...
 * end();
 * ```
 *
 * @example Express Integration
 * ```typescript
 * import express from 'express';
 * import { MetricsCollector } from './metrics-tool';
 *
 * const app = express();
 * const metrics = new MetricsCollector({ service: 'api' });
 *
 * const requestCounter = metrics.counter('http_requests_total');
 * const requestDuration = metrics.histogram('http_request_duration_ms', {
 *   buckets: [10, 50, 100, 500, 1000]
 * });
 *
 * app.use((req, res, next) => {
 *   const end = requestDuration.startTimer({
 *     method: req.method,
 *     path: req.path
 *   });
 *
 *   res.on('finish', () => {
 *     requestCounter.inc({
 *       method: req.method,
 *       path: req.path,
 *       status: res.statusCode.toString()
 *     });
 *     end();
 *   });
 *
 *   next();
 * });
 *
 * // Expose metrics endpoint
 * app.get('/metrics', (req, res) => {
 *   res.set('Content-Type', 'text/plain');
 *   res.send(metrics.exportPrometheus());
 * });
 * ```
 *
 * @example React Integration
 * ```typescript
 * import { MetricsCollector } from './metrics-tool';
 *
 * const metrics = new MetricsCollector({ service: 'frontend' });
 * const renderTime = metrics.histogram('component_render_time_ms');
 * const errorCounter = metrics.counter('component_errors_total');
 *
 * class MetricsWrapper extends React.Component {
 *   componentDidMount() {
 *     const end = renderTime.startTimer({
 *       component: this.constructor.name
 *     });
 *     end();
 *   }
 *
 *   componentDidCatch(error: Error) {
 *     errorCounter.inc({ component: this.constructor.name });
 *   }
 * }
 * ```
 */

/**
 * Metric label type
 */
export type Labels = Record<string, string | number>;

/**
 * Base metric options
 */
export interface MetricOptions {
  /** Description of the metric */
  description?: string;
  /** Unit of measurement */
  unit?: string;
  /** Labels to apply to all metric instances */
  labels?: Labels;
}

/**
 * Histogram bucket configuration
 */
export interface HistogramOptions extends MetricOptions {
  /** Bucket boundaries for histogram */
  buckets?: number[];
}

/**
 * Counter metric - monotonically increasing value
 */
export interface Counter {
  /** Increment counter by value (default: 1) */
  inc(labels?: Labels, value?: number): void;
  /** Get current value */
  get(labels?: Labels): number;
}

/**
 * Gauge metric - value that can increase or decrease
 */
export interface Gauge {
  /** Set gauge to specific value */
  set(value: number, labels?: Labels): void;
  /** Increment gauge */
  inc(labels?: Labels, value?: number): void;
  /** Decrement gauge */
  dec(labels?: Labels, value?: number): void;
  /** Get current value */
  get(labels?: Labels): number;
  /** Set to current timestamp */
  setToCurrentTime(labels?: Labels): void;
}

/**
 * Histogram metric - track value distributions
 */
export interface Histogram {
  /** Observe a value */
  observe(value: number, labels?: Labels): void;
  /** Start a timer, returns function to end and record */
  startTimer(labels?: Labels): () => void;
  /** Get histogram statistics */
  get(labels?: Labels): HistogramSnapshot;
}

/**
 * Timer metric - convenience wrapper for histograms
 */
export interface Timer {
  /** Start timing, returns function to end and record */
  start(labels?: Labels): () => number;
  /** Observe a duration directly */
  observe(durationMs: number, labels?: Labels): void;
}

/**
 * Histogram snapshot with statistics
 */
export interface HistogramSnapshot {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  buckets: Record<number, number>;
  percentiles?: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

/**
 * Metric snapshot for export
 */
export interface MetricSnapshot {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  description?: string;
  unit?: string;
  values: Array<{
    labels: Labels;
    value: number | HistogramSnapshot;
    timestamp: number;
  }>;
}

/**
 * Metrics collector options
 */
export interface MetricsCollectorOptions {
  /** Service or application name */
  service?: string;
  /** Default labels for all metrics */
  defaultLabels?: Labels;
  /** Enable/disable metrics collection */
  enabled?: boolean;
  /** Metric prefix */
  prefix?: string;
}

/**
 * Internal counter implementation
 */
class CounterMetric implements Counter {
  private values = new Map<string, number>();

  constructor(
    private name: string,
    private options: MetricOptions = {}
  ) {}

  inc(labels: Labels = {}, value: number = 1): void {
    const key = this.serializeLabels(labels);
    const current = this.values.get(key) || 0;
    this.values.set(key, current + value);
  }

  get(labels: Labels = {}): number {
    const key = this.serializeLabels(labels);
    return this.values.get(key) || 0;
  }

  getAll(): Map<string, { labels: Labels; value: number }> {
    const result = new Map<string, { labels: Labels; value: number }>();
    for (const [key, value] of this.values) {
      result.set(key, { labels: this.deserializeLabels(key), value });
    }
    return result;
  }

  private serializeLabels(labels: Labels): string {
    return JSON.stringify(
      Object.entries({ ...this.options.labels, ...labels })
        .sort(([a], [b]) => a.localeCompare(b))
    );
  }

  private deserializeLabels(key: string): Labels {
    return Object.fromEntries(JSON.parse(key));
  }
}

/**
 * Internal gauge implementation
 */
class GaugeMetric implements Gauge {
  private values = new Map<string, number>();

  constructor(
    private name: string,
    private options: MetricOptions = {}
  ) {}

  set(value: number, labels: Labels = {}): void {
    const key = this.serializeLabels(labels);
    this.values.set(key, value);
  }

  inc(labels: Labels = {}, value: number = 1): void {
    const key = this.serializeLabels(labels);
    const current = this.values.get(key) || 0;
    this.values.set(key, current + value);
  }

  dec(labels: Labels = {}, value: number = 1): void {
    this.inc(labels, -value);
  }

  get(labels: Labels = {}): number {
    const key = this.serializeLabels(labels);
    return this.values.get(key) || 0;
  }

  setToCurrentTime(labels: Labels = {}): void {
    this.set(Date.now(), labels);
  }

  getAll(): Map<string, { labels: Labels; value: number }> {
    const result = new Map<string, { labels: Labels; value: number }>();
    for (const [key, value] of this.values) {
      result.set(key, { labels: this.deserializeLabels(key), value });
    }
    return result;
  }

  private serializeLabels(labels: Labels): string {
    return JSON.stringify(
      Object.entries({ ...this.options.labels, ...labels })
        .sort(([a], [b]) => a.localeCompare(b))
    );
  }

  private deserializeLabels(key: string): Labels {
    return Object.fromEntries(JSON.parse(key));
  }
}

/**
 * Internal histogram implementation
 */
class HistogramMetric implements Histogram {
  private observations = new Map<string, number[]>();
  private buckets: number[];

  constructor(
    private name: string,
    private options: HistogramOptions = {}
  ) {
    this.buckets = options.buckets || [10, 50, 100, 500, 1000, 5000, 10000];
    this.buckets.sort((a, b) => a - b);
  }

  observe(value: number, labels: Labels = {}): void {
    const key = this.serializeLabels(labels);
    const observations = this.observations.get(key) || [];
    observations.push(value);
    this.observations.set(key, observations);
  }

  startTimer(labels: Labels = {}): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.observe(duration, labels);
    };
  }

  get(labels: Labels = {}): HistogramSnapshot {
    const key = this.serializeLabels(labels);
    const observations = this.observations.get(key) || [];

    if (observations.length === 0) {
      return {
        count: 0,
        sum: 0,
        min: 0,
        max: 0,
        avg: 0,
        buckets: {},
      };
    }

    const sorted = [...observations].sort((a, b) => a - b);
    const sum = observations.reduce((acc, val) => acc + val, 0);
    const count = observations.length;

    // Calculate bucket counts
    const buckets: Record<number, number> = {};
    for (const bucket of this.buckets) {
      buckets[bucket] = sorted.filter(v => v <= bucket).length;
    }
    buckets['+Inf'] = count;

    // Calculate percentiles
    const percentiles = {
      p50: this.percentile(sorted, 0.5),
      p90: this.percentile(sorted, 0.9),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
    };

    return {
      count,
      sum,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / count,
      buckets,
      percentiles,
    };
  }

  getAll(): Map<string, { labels: Labels; value: HistogramSnapshot }> {
    const result = new Map<string, { labels: Labels; value: HistogramSnapshot }>();
    for (const key of this.observations.keys()) {
      const labels = this.deserializeLabels(key);
      result.set(key, { labels, value: this.get(labels) });
    }
    return result;
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  private serializeLabels(labels: Labels): string {
    return JSON.stringify(
      Object.entries({ ...this.options.labels, ...labels })
        .sort(([a], [b]) => a.localeCompare(b))
    );
  }

  private deserializeLabels(key: string): Labels {
    return Object.fromEntries(JSON.parse(key));
  }
}

/**
 * Main metrics collector class
 */
export class MetricsCollector {
  private counters = new Map<string, CounterMetric>();
  private gauges = new Map<string, GaugeMetric>();
  private histograms = new Map<string, HistogramMetric>();
  private service?: string;
  private defaultLabels: Labels;
  private enabled: boolean;
  private prefix: string;

  constructor(options: MetricsCollectorOptions = {}) {
    this.service = options.service;
    this.defaultLabels = options.defaultLabels || {};
    this.enabled = options.enabled !== false;
    this.prefix = options.prefix || '';

    if (this.service) {
      this.defaultLabels.service = this.service;
    }
  }

  /**
   * Create or get a counter metric
   */
  counter(name: string, options: MetricOptions = {}): Counter {
    const fullName = this.prefix + name;

    if (!this.counters.has(fullName)) {
      const mergedOptions = {
        ...options,
        labels: { ...this.defaultLabels, ...options.labels },
      };
      this.counters.set(fullName, new CounterMetric(fullName, mergedOptions));
    }

    return this.counters.get(fullName)!;
  }

  /**
   * Create or get a gauge metric
   */
  gauge(name: string, options: MetricOptions = {}): Gauge {
    const fullName = this.prefix + name;

    if (!this.gauges.has(fullName)) {
      const mergedOptions = {
        ...options,
        labels: { ...this.defaultLabels, ...options.labels },
      };
      this.gauges.set(fullName, new GaugeMetric(fullName, mergedOptions));
    }

    return this.gauges.get(fullName)!;
  }

  /**
   * Create or get a histogram metric
   */
  histogram(name: string, options: HistogramOptions = {}): Histogram {
    const fullName = this.prefix + name;

    if (!this.histograms.has(fullName)) {
      const mergedOptions = {
        ...options,
        labels: { ...this.defaultLabels, ...options.labels },
      };
      this.histograms.set(fullName, new HistogramMetric(fullName, mergedOptions));
    }

    return this.histograms.get(fullName)!;
  }

  /**
   * Create a timer (histogram-based)
   */
  timer(name: string, options: HistogramOptions = {}): Timer {
    const histogram = this.histogram(name, options);

    return {
      start: (labels?: Labels) => {
        const startTime = Date.now();
        return () => {
          const duration = Date.now() - startTime;
          histogram.observe(duration, labels);
          return duration;
        };
      },
      observe: (durationMs: number, labels?: Labels) => {
        histogram.observe(durationMs, labels);
      },
    };
  }

  /**
   * Collect all metrics
   */
  collect(): MetricSnapshot[] {
    if (!this.enabled) return [];

    const snapshots: MetricSnapshot[] = [];
    const timestamp = Date.now();

    // Collect counters
    for (const [name, counter] of this.counters) {
      const values = Array.from(counter.getAll().values()).map(({ labels, value }) => ({
        labels,
        value,
        timestamp,
      }));

      snapshots.push({
        name,
        type: 'counter',
        values,
      });
    }

    // Collect gauges
    for (const [name, gauge] of this.gauges) {
      const values = Array.from(gauge.getAll().values()).map(({ labels, value }) => ({
        labels,
        value,
        timestamp,
      }));

      snapshots.push({
        name,
        type: 'gauge',
        values,
      });
    }

    // Collect histograms
    for (const [name, histogram] of this.histograms) {
      const values = Array.from(histogram.getAll().values()).map(({ labels, value }) => ({
        labels,
        value,
        timestamp,
      }));

      snapshots.push({
        name,
        type: 'histogram',
        values,
      });
    }

    return snapshots;
  }

  /**
   * Export metrics as JSON
   */
  exportJSON(): string {
    return JSON.stringify(this.collect(), null, 2);
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const snapshots = this.collect();
    const lines: string[] = [];

    for (const snapshot of snapshots) {
      // Add HELP line
      if (snapshot.description) {
        lines.push(`# HELP ${snapshot.name} ${snapshot.description}`);
      }

      // Add TYPE line
      lines.push(`# TYPE ${snapshot.name} ${snapshot.type}`);

      // Add metric values
      for (const { labels, value } of snapshot.values) {
        if (snapshot.type === 'histogram' && typeof value === 'object') {
          const hist = value as HistogramSnapshot;
          const labelStr = this.formatPrometheusLabels(labels);

          // Bucket counts
          for (const [bucket, count] of Object.entries(hist.buckets)) {
            const bucketLabels = { ...labels, le: bucket };
            lines.push(
              `${snapshot.name}_bucket${this.formatPrometheusLabels(bucketLabels)} ${count}`
            );
          }

          // Sum and count
          lines.push(`${snapshot.name}_sum${labelStr} ${hist.sum}`);
          lines.push(`${snapshot.name}_count${labelStr} ${hist.count}`);
        } else {
          const labelStr = this.formatPrometheusLabels(labels);
          lines.push(`${snapshot.name}${labelStr} ${value}`);
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format labels for Prometheus
   */
  private formatPrometheusLabels(labels: Labels): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';

    const formatted = entries
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    return `{${formatted}}`;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

/**
 * Default metrics collector instance
 */
export const defaultMetrics = new MetricsCollector({
  service: process.env.SERVICE_NAME,
  enabled: process.env.METRICS_ENABLED !== 'false',
});
