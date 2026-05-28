import { HashGenerator } from "../../../../shared/cryptography/hash-generator";
import { UserRepository } from "../../repositories/user-repository";
import { CreateUserRequestDTO } from "./dto/create-user-request.dto";
import { CreateUserResponseDTO } from "./dto/create-user-response.dto";
export declare class CreateUserUseCase {
    private readonly userRepository;
    private readonly hashGenerator;
    constructor(userRepository: UserRepository, hashGenerator: HashGenerator);
    execute(data: CreateUserRequestDTO): Promise<CreateUserResponseDTO>;
}
