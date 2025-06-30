export default class InvalidMatchStateException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidMatchStateException'
  }
}
