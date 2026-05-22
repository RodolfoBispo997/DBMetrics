import { HashComparer } from "./hash-comparer";
import bcrypt from "bcryptjs";

export class BcryptHashComparer implements HashComparer {
  async compare(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
