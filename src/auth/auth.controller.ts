import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthenticateUserUseCase } from "../user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { AuthenticaUserHttpDTO } from "../user/presentation/dto/authenticate-user-http.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthenticateUserResponseDTO } from "../user/application/use-cases/authenticate-user/dto/authenticate-user-response.dto";
import { UserRole } from "../user/domain/enums/user-role.enum";

type AuthenticatedUser = {
  userId: string;
  email: string;
  role: UserRole;
};

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  @Post("login")
  async login(
    @Body() body: AuthenticaUserHttpDTO,
  ): Promise<AuthenticateUserResponseDTO> {
    return this.authenticateUserUseCase.execute(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() request: any): AuthenticatedUser {
    return request.user;
  }
}
