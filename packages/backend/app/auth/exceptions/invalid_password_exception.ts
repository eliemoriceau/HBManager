export default class InvalidPasswordException extends Error {
  constructor(password: string) {
    super(`Password ${password} is invalid`)
  }
}
