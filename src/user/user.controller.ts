import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreateUserUseCase } from "./application/use-cases/create-user/create-user.use-case";
import { CreateUserHttpDTO } from "./presentation/dto/create-user-http.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CreateUserResponseDTO } from "./application/use-cases/create-user/dto/create-user-response.dto";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@ApiTags("Users")
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@ApiForbiddenResponse()
@Controller("users")
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post()
  @ApiOperation({ summary: "Create user" })
  @ApiCreatedResponse({ description: "User created" })
  async create(@Body() body: CreateUserHttpDTO): Promise<CreateUserResponseDTO> {
    return this.createUserUseCase.execute(body);
  }
}
