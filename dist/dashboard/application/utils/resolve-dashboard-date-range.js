"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDashboardDateRange = resolveDashboardDateRange;
const invalid_dashboard_date_range_error_1 = require("../errors/invalid-dashboard-date-range-error");
function resolveDashboardDateRange({ startDate, endDate, }) {
    const now = new Date();
    if (startDate && endDate) {
        const resolvedStartDate = parseDate(startDate);
        const resolvedEndDate = parseDate(endDate);
        if (resolvedStartDate > resolvedEndDate) {
            throw new invalid_dashboard_date_range_error_1.InvalidDashboardDateRangeError("startDate cannot be greater than endDate");
        }
        return {
            startDate: resolvedStartDate,
            endDate: resolvedEndDate,
        };
    }
    if (startDate && !endDate) {
        const resolvedStartDate = parseDate(startDate);
        if (resolvedStartDate > now) {
            throw new invalid_dashboard_date_range_error_1.InvalidDashboardDateRangeError("startDate cannot be greater than endDate");
        }
        return {
            startDate: resolvedStartDate,
            endDate: now,
        };
    }
    if (!startDate && endDate) {
        const resolvedEndDate = parseDate(endDate);
        const resolvedStartDate = new Date(resolvedEndDate);
        resolvedStartDate.setDate(resolvedStartDate.getDate() - 7);
        return {
            startDate: resolvedStartDate,
            endDate: resolvedEndDate,
        };
    }
    const defaultEndDate = now;
    const defaultStartDate = new Date(defaultEndDate);
    defaultStartDate.setDate(defaultStartDate.getDate() - 7);
    return {
        startDate: defaultStartDate,
        endDate: defaultEndDate,
    };
}
function parseDate(value) {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new invalid_dashboard_date_range_error_1.InvalidDashboardDateRangeError(`Invalid date: ${value}`);
    }
    return parsedDate;
}
//# sourceMappingURL=resolve-dashboard-date-range.js.map