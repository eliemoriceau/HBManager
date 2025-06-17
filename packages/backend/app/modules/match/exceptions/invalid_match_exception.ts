export default class InvalidMatchException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidMatchException'
  }
}
