import { Inject, Injectable } from "@nestjs/common";
import { HashComparer } from "../../../../shared/cryptography/hash-comparer";
import { InvalidCredentialsError } from "../../../domain/errors/invalid-credentials-error";
import { UserRepository } from "../../repositories/user-repository";
import { AuthenticateUserRequestDTO } from "./dto/authenticate-user-request.dto";
import { AuthenticateUserResponseDTO } from "./dto/authenticate-user-response.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository,
    @Inject("HashComparer")
    private readonly hashComparer: HashComparer,
    private readonly jwtService: JwtService,
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

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
    };
  }
}
