import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserUseCase } from "./application/use-cases/create-user/create-user.use-case";
import { CreateUserHttpDTO } from "./presentation/dto/create-user-http.dto";

@Controller("users")
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() body: CreateUserHttpDTO) {
    return this.createUserUseCase.execute(body);
  }
}
