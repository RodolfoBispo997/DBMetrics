import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { GetDashboardOverviewUseCase } from "./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly getDashboardOverviewUseCase: GetDashboardOverviewUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get("overview")
  async overview(@Req() request: any) {
    const userId = request.user.userId;

    return this.getDashboardOverviewUseCase.execute({ userId });
  }
}
