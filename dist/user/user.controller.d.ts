import { CreateUserUseCase } from "./application/use-cases/create-user/create-user.use-case";
import { CreateUserHttpDTO } from "./presentation/dto/create-user-http.dto";
export declare class UserController {
    private readonly createUserUseCase;
    constructor(createUserUseCase: CreateUserUseCase);
    create(body: CreateUserHttpDTO): Promise<import("./application/use-cases/create-user/dto/create-user-response.dto").CreateUserResponseDTO>;
}
