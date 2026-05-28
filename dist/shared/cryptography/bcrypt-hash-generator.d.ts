import { HashGenerator } from "./hash-generator";
export declare class BcryptHashGenerator implements HashGenerator {
    hash(payload: string): Promise<string>;
}
