"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseHealthServiceImpl = void 0;
const common_1 = require("@nestjs/common");
let DatabaseHealthServiceImpl = class DatabaseHealthServiceImpl {
    evaluate(metrics) {
        if (metrics.activeConnections >= 100) {
            return {
                status: "CRITICAL",
                message: "Too many active connections",
                checkedAt: new Date(),
            };
        }
        if (metrics.activeConnections >= 70) {
            return {
                status: "WARNING",
                message: "High number of active connections",
                checkedAt: new Date(),
            };
        }
        return {
            status: "ONLINE",
            message: "Database is healthy",
            checkedAt: new Date(),
        };
    }
};
exports.DatabaseHealthServiceImpl = DatabaseHealthServiceImpl;
exports.DatabaseHealthServiceImpl = DatabaseHealthServiceImpl = __decorate([
    (0, common_1.Injectable)()
], DatabaseHealthServiceImpl);
//# sourceMappingURL=database-health.service.js.map