export class DatabaseConnectionException extends Error {
  constructor(message: string = 'Connexion \u00e0 la base de donn\u00e9es impossible') {
    super(message)
    this.name = 'DatabaseConnectionException'
  }
}
