import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

import { DomainError } from "@/shared/errors/domain-error";

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      message: exception.message,
    });
  }
}
