export class InvalidArgumentException implements Error {
  stack: string
  message: string
  name: string = 'InvalidArgumentException'

  constructor(msg: string, stack?: string) {
    this.message = msg
    this.stack = stack || ''
  }
}
