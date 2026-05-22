import { hash } from "bcryptjs";
import { HashGenerator } from "./hash-generator";

export class BcryptHashGenerator implements HashGenerator {
  async hash(payload: string): Promise<string> {
    const hashedPassword = await hash(payload, 8);

    return hashedPassword;
  }
}
