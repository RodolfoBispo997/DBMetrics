export class InvalidEncryptedDatabaseCredentialError extends Error {
  constructor() {
    super("Invalid encrypted database credential");
  }
}
