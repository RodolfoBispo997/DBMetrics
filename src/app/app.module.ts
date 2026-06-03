import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";
import { DatabaseConnectionModule } from "../database-connection/database-connection.module";

@Module({
  imports: [UserModule, AuthModule, DatabaseConnectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
