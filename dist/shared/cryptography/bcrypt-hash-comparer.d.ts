import { HashComparer } from "./hash-comparer";
export declare class BcryptHashComparer implements HashComparer {
    compare(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}
