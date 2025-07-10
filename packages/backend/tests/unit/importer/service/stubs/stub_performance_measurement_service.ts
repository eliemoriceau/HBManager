import {
  PerformanceMeasurementService,
  PerformanceMetrics,
  PerformanceStats,
} from '#importer/service/performance_measurement_service.js'

/**
 * Stub pour le service de mesure de performance pour les tests
 */
export class StubPerformanceMeasurementService extends PerformanceMeasurementService {
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    return await fn()
  }

  measureSync<T>(operation: string, fn: () => T, metadata?: Record<string, any>): T {
    return fn()
  }

  private recordMetric(metric: PerformanceMetrics): void {
    // No-op pour les tests
  }

  getStats(operation: string): PerformanceStats | null {
    return {
      count: 1,
      average: 1,
      min: 1,
      max: 1,
      p95: 1,
      p99: 1,
      total: 1,
    }
  }

  getAllStats(): Record<string, PerformanceStats> {
    return {}
  }

  compare(
    operation1: string,
    operation2: string
  ): {
    operation1: PerformanceStats | null
    operation2: PerformanceStats | null
    improvement?: {
      percentage: number
      description: string
    }
  } {
    return {
      operation1: this.getStats(operation1),
      operation2: this.getStats(operation2),
    }
  }

  reset(): void {
    // No-op pour les tests
  }

  exportMetrics(): string {
    return '{}'
  }

  generateReport(): string {
    return 'Rapport de test'
  }
}
