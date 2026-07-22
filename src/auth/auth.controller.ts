import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthenticateUserUseCase } from "../user/application/use-cases/authenticate-user/authenticate-user-use-case";
import { AuthenticaUserHttpDTO } from "../user/presentation/dto/authenticate-user-http.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthenticateUserResponseDTO } from "../user/application/use-cases/authenticate-user/dto/authenticate-user-response.dto";
import type { AuthenticatedRequest } from "./types/authenticated-request";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: AuthenticaUserHttpDTO,
  ): Promise<AuthenticateUserResponseDTO> {
    return this.authenticateUserUseCase.execute(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest): AuthenticatedRequest["user"] {
    return request.user;
  }
}
