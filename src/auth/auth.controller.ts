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
import { RegisterPublicUserUseCase } from "../user/application/use-cases/public-registration/register-public-user.use-case";
import { VerifyEmailUseCase } from "../user/application/use-cases/public-registration/verify-email.use-case";
import { PublicRegistrationHttpDTO } from "../user/presentation/dto/public-registration-http.dto";
import { VerifyEmailHttpDTO } from "../user/presentation/dto/verify-email-http.dto";
import { PublicRegistrationEnabledGuard } from "./guards/public-registration-enabled.guard";
import { PublicRegistrationResponseDTO } from "../user/application/use-cases/public-registration/dto/public-registration-response.dto";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly registerPublicUserUseCase: RegisterPublicUserUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
  ) {}

  @Post("register")
  @UseGuards(PublicRegistrationEnabledGuard)
  @ApiOperation({ summary: "Register a public member account" })
  @ApiCreatedResponse({
    description: "Creates a member awaiting email confirmation.",
  })
  async register(
    @Body() body: PublicRegistrationHttpDTO,
  ): Promise<PublicRegistrationResponseDTO> {
    return this.registerPublicUserUseCase.execute(body);
  }

  @Post("verify-email")
  @UseGuards(PublicRegistrationEnabledGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm an email address" })
  @ApiOkResponse({ description: "Confirms the email address." })
  async verifyEmail(
    @Body() body: VerifyEmailHttpDTO,
  ): Promise<{ verified: true }> {
    return this.verifyEmailUseCase.execute(body);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Authenticate user" })
  @ApiOkResponse({
    description: "Returns the access token and authenticated user data.",
  })
  @ApiUnauthorizedResponse({ description: "Invalid email or password" })
  async login(
    @Body() body: AuthenticaUserHttpDTO,
  ): Promise<AuthenticateUserResponseDTO> {
    return this.authenticateUserUseCase.execute(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get authenticated user" })
  @ApiOkResponse({ description: "Returns the currently authenticated user." })
  @ApiUnauthorizedResponse()
  me(@Req() request: AuthenticatedRequest): AuthenticatedRequest["user"] {
    return request.user;
  }
}
