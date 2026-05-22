import { HashComparer } from "../../../../shared/cryptography/hash-comparer";
import { InvalidCredentialsError } from "../../../domain/errors/invalid-credentials-error";
import { UserRepository } from "../../repositories/user-repository";
import { AuthenticateUserRequestDTO } from "./dto/authenticate-user-request.dto";
import { AuthenticateUserResponseDTO } from "./dto/authenticate-user-response.dto";

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashComparer: HashComparer,
  ) {}

  async execute(
    data: AuthenticateUserRequestDTO,
  ): Promise<AuthenticateUserResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new InvalidCredentialsError("Invalid credentials");
    }

    const passwordMatch = await this.hashComparer.compare(
      data.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new InvalidCredentialsError("Invalid credentials");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
