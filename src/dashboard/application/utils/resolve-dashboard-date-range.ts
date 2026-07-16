import { InvalidDashboardDateRangeError } from "../errors/invalid-dashboard-date-range-error";

type ResolveDashboardDateRangeInput = {
  startDate?: string;
  endDate?: string;
  now?: Date;
};

type ResolveDashboardDateRangeOutput = {
  startDate: Date;
  endDate: Date;
};

export function resolveDashboardDateRange({
  startDate,
  endDate,
  now = new Date(),
}: ResolveDashboardDateRangeInput): ResolveDashboardDateRangeOutput {
  const resolvedNow = new Date(now);

  if (Number.isNaN(resolvedNow.getTime())) {
    throw new InvalidDashboardDateRangeError("Invalid current date");
  }

  if (startDate && endDate) {
    const resolvedStartDate = parseDate(startDate);
    const resolvedEndDate = parseDate(endDate);

    validateEndDate(resolvedEndDate, resolvedNow);

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

    if (resolvedStartDate > resolvedNow) {
      throw new InvalidDashboardDateRangeError(
        "startDate cannot be greater than endDate",
      );
    }

    return {
      startDate: resolvedStartDate,
      endDate: resolvedNow,
    };
  }

  if (!startDate && endDate) {
    const resolvedEndDate = parseDate(endDate);
    validateEndDate(resolvedEndDate, resolvedNow);
    const resolvedStartDate = new Date(resolvedEndDate);
    resolvedStartDate.setDate(resolvedStartDate.getDate() - 7);

    return {
      startDate: resolvedStartDate,
      endDate: resolvedEndDate,
    };
  }

  const defaultEndDate = resolvedNow;
  const defaultStartDate = new Date(defaultEndDate);
  defaultStartDate.setDate(defaultStartDate.getDate() - 7);

  return {
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  };
}

function validateEndDate(endDate: Date, now: Date): void {
  if (endDate > now) {
    throw new InvalidDashboardDateRangeError("endDate cannot be in the future");
  }
}

function parseDate(value: string): Date {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new InvalidDashboardDateRangeError(`Invalid date: ${value}`);
  }

  return parsedDate;
}
