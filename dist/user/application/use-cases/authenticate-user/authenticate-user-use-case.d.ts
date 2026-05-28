import { HashComparer } from "../../../../shared/cryptography/hash-comparer";
import { UserRepository } from "../../repositories/user-repository";
import { AuthenticateUserRequestDTO } from "./dto/authenticate-user-request.dto";
import { AuthenticateUserResponseDTO } from "./dto/authenticate-user-response.dto";
import { JwtService } from "@nestjs/jwt";
export declare class AuthenticateUserUseCase {
    private readonly userRepository;
    private readonly hashComparer;
    private readonly jwtService;
    constructor(userRepository: UserRepository, hashComparer: HashComparer, jwtService: JwtService);
    execute(data: AuthenticateUserRequestDTO): Promise<AuthenticateUserResponseDTO>;
}
