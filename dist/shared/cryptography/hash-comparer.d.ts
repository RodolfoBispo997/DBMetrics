export interface HashComparer {
    compare(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
}
