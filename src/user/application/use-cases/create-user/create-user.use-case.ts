import { Inject, Injectable } from "@nestjs/common";
import { HashGenerator } from "../../../../shared/cryptography/hash-generator";
import { User } from "../../../domain/entities/user.entity";
import { UserRole } from "../../../domain/enums/user-role.enum";
import { EmailAlreadyExistsError } from "../../../domain/errors/email-already-exists-error";
import { UserRepository } from "../../repositories/user-repository";
import { CreateUserRequestDTO } from "./dto/create-user-request.dto";
import { CreateUserResponseDTO } from "./dto/create-user-response.dto";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("HashGenerator")
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(data: CreateUserRequestDTO): Promise<CreateUserResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new EmailAlreadyExistsError("Email already exist");
    }

    const hashedPassword = await this.hashGenerator.hash(data.password);

    const user = User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role ?? UserRole.ADMIN,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
