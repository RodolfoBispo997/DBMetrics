import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CreateAlertRuleBodyHttpDTO } from "./presentation/dto/create-alert-rule-body-http.dto";
import { CreateAlertRuleUseCase } from "./application/use-cases/create-alert-rule/create-alert-rule.use-case";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetAlertRuleUseCase } from "./application/use-cases/get-alert-rule/get-alert-rule.use-case";
import { ListAlertRulesUseCase } from "./application/use-cases/list-alert-rules/list-alert-rules.use-case";
import { UpdateAlertRuleBodyHttpDTO } from "./presentation/dto/update-alert-rule-body-http.dto";
import { UpdateAlertRuleUseCase } from "./application/use-cases/update-alert-rule/update-alert-rule.use-case";
import { EnableAlertRuleUseCase } from "./application/use-cases/enable-alert-rule/enable-alert-rule.use-case";
import { DisableAlertRuleUseCase } from "./application/use-cases/disable-alert-rule/disable-alert-rule.use-case";
import { DeleteAlertRuleUseCase } from "./application/use-cases/delete-alert-rule/delete-alert-rule.use-case";

@Controller("alerts")
export class AlertsController {
  constructor(
    private readonly createAlertRuleUseCase: CreateAlertRuleUseCase,
    private readonly getAlertRuleUseCase: GetAlertRuleUseCase,
    private readonly listAlertRulesUseCase: ListAlertRulesUseCase,
    private readonly updateAlertRuleUseCase: UpdateAlertRuleUseCase,
    private readonly enableAlertRuleUseCase: EnableAlertRuleUseCase,
    private readonly disableAlertRuleUseCase: DisableAlertRuleUseCase,
    private readonly deleteAlertRuleUseCase: DeleteAlertRuleUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateAlertRuleBodyHttpDTO, @Req() request: any) {
    return this.createAlertRuleUseCase.execute({
      userId: request.user.userId,
      connectionId: body.connectionId,
      metric: body.metric,
      operator: body.operator,
      threshold: body.threshold,
      channel: body.channel,
    });
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async get(@Param("id") alertRuleId: string, @Req() request: any) {
    return this.getAlertRuleUseCase.execute({
      userId: request.user.userId,
      alertRuleId,
    });
  }

  @Get("/connection/:connectionId")
  @UseGuards(JwtAuthGuard)
  async list(@Param("connectionId") connectionId: string, @Req() request: any) {
    return this.listAlertRulesUseCase.execute({
      userId: request.user.userId,
      connectionId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(
    @Param("id") alertRuleId: string,
    @Body() body: UpdateAlertRuleBodyHttpDTO,
    @Req() request: any,
  ) {
    return this.updateAlertRuleUseCase.execute({
      userId: request.user.userId,

      alertRuleId,

      metric: body.metric,
      operator: body.operator,
      threshold: body.threshold,
      channel: body.channel,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/enable")
  @HttpCode(HttpStatus.NO_CONTENT)
  async enable(
    @Param("id") alertRuleId: string,
    @Req() request: any,
  ): Promise<void> {
    return this.enableAlertRuleUseCase.execute({
      userId: request.user.userId,
      alertRuleId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/disable")
  @HttpCode(HttpStatus.NO_CONTENT)
  async disable(
    @Param("id") alertRuleId: string,
    @Req() request: any,
  ): Promise<void> {
    return this.disableAlertRuleUseCase.execute({
      userId: request.user.userId,
      alertRuleId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("id") alertRuleId: string,
    @Req() request: any,
  ): Promise<void> {
    return this.deleteAlertRuleUseCase.execute({
      userId: request.user.userId,
      alertRuleId,
    });
  }
}
