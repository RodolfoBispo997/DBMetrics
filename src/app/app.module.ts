import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseConnectionModule } from "../database-connection/database-connection.module";
import { DatabaseMetricModule } from "../database-metric/database-metric.module";

@Module({
  imports: [
    UserModule,
    AuthModule,
    DatabaseConnectionModule,
    DatabaseMetricModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
