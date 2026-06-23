import { GetDashboardOverviewUseCase } from "./application/use-cases/get-dashboard-overview/get-dashboard-overview.use-case";
export declare class DashboardController {
    private readonly getDashboardOverviewUseCase;
    constructor(getDashboardOverviewUseCase: GetDashboardOverviewUseCase);
    overview(request: any): Promise<import("./application/types/dashboard-overview.type").DashboardOverview>;
}
