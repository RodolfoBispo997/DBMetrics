type ResolveDashboardDateRangeInput = {
    startDate?: string;
    endDate?: string;
};
type ResolveDashboardDateRangeOutput = {
    startDate: Date;
    endDate: Date;
};
export declare function resolveDashboardDateRange({ startDate, endDate, }: ResolveDashboardDateRangeInput): ResolveDashboardDateRangeOutput;
export {};
