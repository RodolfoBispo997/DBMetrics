import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
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
import { ResendVerificationUseCase } from "../user/application/use-cases/public-registration/resend-verification.use-case";
import { ResendVerificationHttpDTO } from "../user/presentation/dto/resend-verification-http.dto";
import { ResendVerificationResponseDTO } from "../user/application/use-cases/public-registration/resend-verification.use-case";
import {
  ApiBearerAuth,
  ApiAcceptedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiNoContentResponse,
} from "@nestjs/swagger";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { CreateRefreshSessionUseCase } from "../user/application/use-cases/refresh-session/create-refresh-session.use-case";
import { RotateRefreshSessionUseCase } from "../user/application/use-cases/refresh-session/rotate-refresh-session.use-case";
import { LogoutRefreshSessionUseCase } from "../user/application/use-cases/refresh-session/logout-refresh-session.use-case";
import {
  REFRESH_SESSION_COOKIE,
  REFRESH_TOKEN_TTL_DAYS,
} from "../user/application/use-cases/refresh-session/refresh-session.constants";
import {
  clearRefreshSessionCookie,
  setRefreshSessionCookie,
} from "./refresh-session-cookie";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly registerPublicUserUseCase: RegisterPublicUserUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly createRefreshSessionUseCase: CreateRefreshSessionUseCase,
    private readonly rotateRefreshSessionUseCase: RotateRefreshSessionUseCase,
    private readonly logoutRefreshSessionUseCase: LogoutRefreshSessionUseCase,
    @Inject(REFRESH_TOKEN_TTL_DAYS)
    private readonly refreshTokenTtlDays: number,
  ) {}

  @Post("register")
  @UseGuards(PublicRegistrationEnabledGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60 * 60 * 1000 } })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Register a public member account" })
  @ApiAcceptedResponse({
    description:
      "Returns a generic response that does not reveal whether an account exists.",
    type: PublicRegistrationResponseDTO,
  })
  @ApiTooManyRequestsResponse({ description: "Too many registration requests." })
  async register(
    @Body() body: PublicRegistrationHttpDTO,
  ): Promise<PublicRegistrationResponseDTO> {
    return this.registerPublicUserUseCase.execute(body);
  }

  @Post("verify-email")
  @UseGuards(PublicRegistrationEnabledGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm an email address" })
  @ApiOkResponse({ description: "Confirms the email address." })
  @ApiTooManyRequestsResponse({ description: "Too many verification attempts." })
  async verifyEmail(
    @Body() body: VerifyEmailHttpDTO,
  ): Promise<{ verified: true }> {
    return this.verifyEmailUseCase.execute(body);
  }

  @Post("resend-verification")
  @UseGuards(PublicRegistrationEnabledGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60 * 60 * 1000 } })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: "Resend an email confirmation link" })
  @ApiAcceptedResponse({
    description:
      "Returns the same response whether the account exists or is already verified.",
  })
  @ApiTooManyRequestsResponse({ description: "Too many resend requests." })
  async resendVerification(
    @Body() body: ResendVerificationHttpDTO,
  ): Promise<ResendVerificationResponseDTO> {
    return this.resendVerificationUseCase.execute(body);
  }

  @Post("login")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60 * 1000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Authenticate user",
    description:
      "Returns the current access-token response and sets a refresh session in an HttpOnly cookie.",
  })
  @ApiOkResponse({
    description: "Returns the access token and sets the refresh-session cookie.",
  })
  @ApiUnauthorizedResponse({ description: "Invalid email or password" })
  @ApiTooManyRequestsResponse({ description: "Too many login attempts." })
  async login(
    @Body() body: AuthenticaUserHttpDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthenticateUserResponseDTO> {
    const authentication = await this.authenticateUserUseCase.execute(body);
    const { refreshToken } = await this.createRefreshSessionUseCase.execute(
      authentication.userId,
    );
    setRefreshSessionCookie(response, refreshToken, this.refreshTokenTtlDays);
    return { accessToken: authentication.accessToken };
  }

  @Post("refresh")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60 * 1000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh an access token",
    description:
      "Rotates the HttpOnly refresh-session cookie and returns a new access token.",
  })
  @ApiOkResponse({ description: "Returns a new access token." })
  @ApiUnauthorizedResponse({ description: "Invalid refresh session." })
  @ApiTooManyRequestsResponse({ description: "Too many refresh requests." })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const result = await this.rotateRefreshSessionUseCase.execute(
      request.cookies?.[REFRESH_SESSION_COOKIE],
    );
    setRefreshSessionCookie(response, result.refreshToken, this.refreshTokenTtlDays);
    return { accessToken: result.accessToken };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Revoke the current refresh session",
    description:
      "Revokes the session from the HttpOnly cookie, if present, and clears that cookie.",
  })
  @ApiNoContentResponse({ description: "The refresh cookie has been cleared." })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.logoutRefreshSessionUseCase.execute(
      request.cookies?.[REFRESH_SESSION_COOKIE],
    );
    clearRefreshSessionCookie(response, this.refreshTokenTtlDays);
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
