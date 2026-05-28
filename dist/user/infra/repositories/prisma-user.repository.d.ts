import { UserRepository } from "../../application/repositories/user-repository";
import { User } from "../../domain/entities/user.entity";
export declare class PrismaUserRepository implements UserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<void>;
}
