import { AuthenticateUserUseCase } from "../user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { AuthenticaUserHttpDTO } from "../user/presentation/dto/authenticate-user-http.dto";
export declare class AuthController {
    private readonly authenticateUserUseCase;
    constructor(authenticateUserUseCase: AuthenticateUserUseCase);
    login(body: AuthenticaUserHttpDTO): Promise<import("../user/application/use-cases/authenticate-user/dto/authenticate-user-response.dto").AuthenticateUserResponseDTO>;
    me(request: any): any;
}
