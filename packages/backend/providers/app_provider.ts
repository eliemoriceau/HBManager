import type { ApplicationService } from '@adonisjs/core/types'
import { authProviderMap } from '#auth/index'
import { matchProviderMap } from '#match/index'
import { importerProviderMap } from '#importer/index'
import { teamProviderMap } from '#team/index'
import { officielProviderMap } from '#officiel/index'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {}

  /**
   * The container bindings have booted
   */
  async boot() {
    const sources = [
      matchProviderMap,
      authProviderMap,
      importerProviderMap,
      teamProviderMap,
      officielProviderMap,
    ]
    sources.forEach((map) => {
      map.forEach(([useCase, service]) => {
        this.app.container.bind(useCase, () => {
          return this.app.container.make(service)
        })
      })
    })
  }

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {}

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}
