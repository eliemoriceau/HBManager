export class InvalidArgumentException extends Error {
  name = 'InvalidArgumentException'

  constructor(msg: string) {
    super(msg)
  }
}
