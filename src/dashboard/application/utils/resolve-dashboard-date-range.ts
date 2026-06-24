import { InvalidDashboardDateRangeError } from "../errors/invalid-dashboard-date-range-error";

type ResolveDashboardDateRangeInput = {
  startDate?: string;
  endDate?: string;
};

type ResolveDashboardDateRangeOutput = {
  startDate: Date;
  endDate: Date;
};

export function resolveDashboardDateRange({
  startDate,
  endDate,
}: ResolveDashboardDateRangeInput): ResolveDashboardDateRangeOutput {
  const now = new Date();

  if (startDate && endDate) {
    const resolvedStartDate = parseDate(startDate);
    const resolvedEndDate = parseDate(endDate);

    if (resolvedStartDate > resolvedEndDate) {
      throw new InvalidDashboardDateRangeError(
        "startDate cannot be greater than endDate",
      );
    }

    return {
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
    };
  }

  if (startDate && !endDate) {
    const resolvedStartDate = parseDate(startDate);

    if (resolvedStartDate > now) {
      throw new InvalidDashboardDateRangeError(
        "startDate cannot be greater than endDate",
      );
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

function parseDate(value: string): Date {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new InvalidDashboardDateRangeError(`Invalid date: ${value}`);
  }

  return parsedDate;
}
