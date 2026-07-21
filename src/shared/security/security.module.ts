import { Module } from "@nestjs/common";
import { DatabaseCredentialsCipherService } from "./database-credentials/database-credentials-cipher.service";

@Module({
  providers: [DatabaseCredentialsCipherService],
  exports: [DatabaseCredentialsCipherService],
})
export class SecurityModule {}
