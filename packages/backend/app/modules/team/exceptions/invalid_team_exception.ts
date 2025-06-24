export default class InvalidTeamException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidTeamException'
  }
}
