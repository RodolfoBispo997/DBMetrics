"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app/app.module");
const common_1 = require("@nestjs/common");
const domain_exception_filter_1 = require("./shared/filters/domain-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new domain_exception_filter_1.DomainExceptionFilter());
    await app.listen(3000);
    console.log("Server running on http://localhost:3000");
}
bootstrap();
//# sourceMappingURL=main.js.map