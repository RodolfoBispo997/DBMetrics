import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthenticateUserUseCase } from "../user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { AuthenticaUserHttpDTO } from "../user/presentation/dto/authenticate-user-http.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  @Post("login")
  async login(@Body() body: AuthenticaUserHttpDTO) {
    return this.authenticateUserUseCase.execute(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() request: any) {
    return request.user;
  }
}
