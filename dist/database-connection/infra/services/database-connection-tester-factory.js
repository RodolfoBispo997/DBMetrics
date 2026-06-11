"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectionTesterFactoryImpl = void 0;
const common_1 = require("@nestjs/common");
const database_provider_enum_1 = require("../../domain/enums/database-provider.enum");
const mysql_connection_tester_1 = require("./mysql-connection-tester");
const postgres_connection_tester_1 = require("./postgres-connection-tester");
let DatabaseConnectionTesterFactoryImpl = class DatabaseConnectionTesterFactoryImpl {
    constructor(postgresConnectionTester, mysqlConnectionTester) {
        this.postgresConnectionTester = postgresConnectionTester;
        this.mysqlConnectionTester = mysqlConnectionTester;
    }
    get(provider) {
        if (provider === database_provider_enum_1.DatabaseProvider.MYSQL) {
            return this.mysqlConnectionTester;
        }
        if (provider === database_provider_enum_1.DatabaseProvider.POSTGRESQL) {
            return this.postgresConnectionTester;
        }
        throw new Error("Unsupported database provider");
    }
};
exports.DatabaseConnectionTesterFactoryImpl = DatabaseConnectionTesterFactoryImpl;
exports.DatabaseConnectionTesterFactoryImpl = DatabaseConnectionTesterFactoryImpl = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [postgres_connection_tester_1.PostgresConnectionTester,
        mysql_connection_tester_1.MysqlConnectionTester])
], DatabaseConnectionTesterFactoryImpl);
//# sourceMappingURL=database-connection-tester-factory.js.map