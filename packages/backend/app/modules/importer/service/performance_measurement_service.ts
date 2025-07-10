import { performance } from 'node:perf_hooks'
import logger from '@adonisjs/core/services/logger'

export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: Date
  metadata?: Record<string, any>
}

export interface PerformanceStats {
  count: number
  average: number
  min: number
  max: number
  p95: number
  p99: number
  total: number
}

/**
 * Service pour mesurer et analyser les performances
 * Respecte les principes Clean Architecture en étant dans la couche application
 */
export class PerformanceMeasurementService {
  private metrics: Map<string, PerformanceMetrics[]> = new Map()

  /**
   * Mesure le temps d'exécution d'une opération asynchrone
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now()
    const timestamp = new Date()

    try {
      const result = await fn()
      const duration = performance.now() - start

      this.recordMetric({ operation, duration, timestamp, metadata })

      logger.info(`✅ ${operation} completed in ${duration.toFixed(2)}ms`, {
        operation,
        duration: duration.toFixed(2),
        metadata,
      })

      return result
    } catch (error) {
      const duration = performance.now() - start

      this.recordMetric({ operation, duration, timestamp, metadata })

      logger.error(`❌ ${operation} failed after ${duration.toFixed(2)}ms`, {
        operation,
        duration: duration.toFixed(2),
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata,
      })

      throw error
    }
  }

  /**
   * Mesure le temps d'exécution d'une opération synchrone
   */
  measureSync<T>(operation: string, fn: () => T, metadata?: Record<string, any>): T {
    const start = performance.now()
    const timestamp = new Date()

    try {
      const result = fn()
      const duration = performance.now() - start

      this.recordMetric({ operation, duration, timestamp, metadata })

      logger.info(`✅ ${operation} completed in ${duration.toFixed(2)}ms`, {
        operation,
        duration: duration.toFixed(2),
        metadata,
      })

      return result
    } catch (error) {
      const duration = performance.now() - start

      this.recordMetric({ operation, duration, timestamp, metadata })

      logger.error(`❌ ${operation} failed after ${duration.toFixed(2)}ms`, {
        operation,
        duration: duration.toFixed(2),
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata,
      })

      throw error
    }
  }

  /**
   * Enregistre une métrique de performance
   */
  private recordMetric(metric: PerformanceMetrics): void {
    if (!this.metrics.has(metric.operation)) {
      this.metrics.set(metric.operation, [])
    }

    this.metrics.get(metric.operation)!.push(metric)

    // Conserver seulement les 1000 dernières métriques par opération
    const operationMetrics = this.metrics.get(metric.operation)!
    if (operationMetrics.length > 1000) {
      operationMetrics.shift()
    }
  }

  /**
   * Calcule les statistiques pour une opération
   */
  getStats(operation: string): PerformanceStats | null {
    const operationMetrics = this.metrics.get(operation)
    if (!operationMetrics || operationMetrics.length === 0) {
      return null
    }

    const durations = operationMetrics.map((m) => m.duration)
    durations.sort((a, b) => a - b)

    return {
      count: durations.length,
      average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: durations[0],
      max: durations[durations.length - 1],
      p95: this.percentile(durations, 95),
      p99: this.percentile(durations, 99),
      total: durations.reduce((sum, d) => sum + d, 0),
    }
  }

  /**
   * Retourne toutes les statistiques disponibles
   */
  getAllStats(): Record<string, PerformanceStats> {
    const stats: Record<string, PerformanceStats> = {}

    for (const operation of this.metrics.keys()) {
      const operationStats = this.getStats(operation)
      if (operationStats) {
        stats[operation] = operationStats
      }
    }

    return stats
  }

  /**
   * Compare les performances entre deux opérations
   */
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
    const stats1 = this.getStats(operation1)
    const stats2 = this.getStats(operation2)

    const result: any = { operation1: stats1, operation2: stats2 }

    if (stats1 && stats2) {
      const improvement = ((stats1.average - stats2.average) / stats1.average) * 100
      result.improvement = {
        percentage: improvement,
        description:
          improvement > 0
            ? `${operation2} is ${improvement.toFixed(1)}% faster than ${operation1}`
            : `${operation2} is ${Math.abs(improvement).toFixed(1)}% slower than ${operation1}`,
      }
    }

    return result
  }

  /**
   * Calcule le percentile d'un tableau trié
   */
  private percentile(sortedArray: number[], p: number): number {
    const index = Math.ceil((sortedArray.length * p) / 100) - 1
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))]
  }

  /**
   * Remet à zéro toutes les métriques
   */
  reset(): void {
    this.metrics.clear()
  }

  /**
   * Exporte les métriques au format JSON
   */
  exportMetrics(): string {
    const export_data = {
      timestamp: new Date().toISOString(),
      stats: this.getAllStats(),
      rawMetrics: Object.fromEntries(this.metrics),
    }

    return JSON.stringify(export_data, null, 2)
  }

  /**
   * Génère un rapport de performance
   */
  generateReport(): string {
    const stats = this.getAllStats()
    const operations = Object.keys(stats).sort()

    if (operations.length === 0) {
      return 'Aucune métrique disponible'
    }

    let report = '📊 RAPPORT DE PERFORMANCE\n'
    report += '='.repeat(50) + '\n\n'

    for (const operation of operations) {
      const stat = stats[operation]
      report += `🔍 ${operation}\n`
      report += `   Executions: ${stat.count}\n`
      report += `   Moyenne: ${stat.average.toFixed(2)}ms\n`
      report += `   Min/Max: ${stat.min.toFixed(2)}ms / ${stat.max.toFixed(2)}ms\n`
      report += `   P95/P99: ${stat.p95.toFixed(2)}ms / ${stat.p99.toFixed(2)}ms\n`
      report += `   Total: ${stat.total.toFixed(2)}ms\n\n`
    }

    return report
  }
}
