import { UserRepository } from "../../application/repositories/user-repository";
import { User } from "../../domain/entities/user.entity";
import { UserRole } from "../../domain/enums/user-role.enum";
import { prisma } from "../database/prisma/prisma-client";

//Serve para traduzir os enum do UserRole
import {
  PrismaClient,
  UserRole as PrismaUserRole,
} from "../../../../generated/prisma";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return User.restore({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as UserRole,
    });
  }
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return User.restore({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as UserRole,
    });
  }

  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as UserRole,
      },
    });
  }
}
