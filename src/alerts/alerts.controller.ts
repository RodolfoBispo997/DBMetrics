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
  Query,
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
import { GetAlertExecutionUseCase } from "./application/use-cases/get-alert-execution/get-alert-execution.use-case";
import { ListAlertExecutionsUseCase } from "./application/use-cases/list-alert-executions/list-alert-executions.use-case";
import { AlertExecutionPresenter } from "./presentation/presenters/alert-execution.presenter";
import { AlertRulePresenter } from "./presentation/presenters/alert-rule.presenter";
import { ListAlertExecutionsQueryHttpDTO } from "./presentation/dto/list-alert-executions-query-http.dto";

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
    private readonly getAlertExecutionUseCase: GetAlertExecutionUseCase,
    private readonly listAlertExecutionsUseCase: ListAlertExecutionsUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateAlertRuleBodyHttpDTO, @Req() request: any) {
    const alertRule = await this.createAlertRuleUseCase.execute({
      userId: request.user.userId,
      connectionId: body.connectionId,
      metric: body.metric,
      operator: body.operator,
      threshold: body.threshold,
      channel: body.channel,
      destination: body.destination,
    });
    return AlertRulePresenter.toHTTP(alertRule);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async get(@Param("id") alertRuleId: string, @Req() request: any) {
    const alertRule = await this.getAlertRuleUseCase.execute({
      userId: request.user.userId,
      alertRuleId,
    });
    return AlertRulePresenter.toHTTP(alertRule);
  }

  @Get("/connection/:connectionId")
  @UseGuards(JwtAuthGuard)
  async list(@Param("connectionId") connectionId: string, @Req() request: any) {
    const alertRules = await this.listAlertRulesUseCase.execute({
      userId: request.user.userId,
      connectionId,
    });
    return alertRules.map(AlertRulePresenter.toHTTP);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(
    @Param("id") alertRuleId: string,
    @Body() body: UpdateAlertRuleBodyHttpDTO,
    @Req() request: any,
  ) {
    const alertRule = await this.updateAlertRuleUseCase.execute({
      userId: request.user.userId,
      alertRuleId,
      metric: body.metric,
      operator: body.operator,
      threshold: body.threshold,
      channel: body.channel,
      destination: body.destination,
    });
    return AlertRulePresenter.toHTTP(alertRule);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/enable")
  async enable(
    @Param("id") alertRuleId: string,
    @Req() request: any,
  ) {
    const alertRule = await this.enableAlertRuleUseCase.execute({
      userId: request.user.userId,
      alertRuleId,
    });
    return AlertRulePresenter.toHTTP(alertRule);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/disable")
  async disable(
    @Param("id") alertRuleId: string,
    @Req() request: any,
  ) {
    const alertRule = await this.disableAlertRuleUseCase.execute({
      userId: request.user.userId,
      alertRuleId,
    });
    return AlertRulePresenter.toHTTP(alertRule);
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

  @UseGuards(JwtAuthGuard)
  @Get("/executions/:id")
  async getExecution(@Param("id") executionId: string, @Req() request: any) {
    const execution = await this.getAlertExecutionUseCase.execute({
      executionId,
      userId: request.user.userId,
    });
    return AlertExecutionPresenter.toHTTP(execution);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/connection/:connectionId/executions")
  async listExecutions(
    @Param("connectionId") connectionId: string,
    @Query() query: ListAlertExecutionsQueryHttpDTO,
    @Req() request: any,
  ) {
    const result = await this.listAlertExecutionsUseCase.execute({
      connectionId,
      userId: request.user.userId,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      data: result.executions.map(AlertExecutionPresenter.toHTTP),
      meta: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }
}
