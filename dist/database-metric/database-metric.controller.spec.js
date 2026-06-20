"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const database_metric_controller_1 = require("./database-metric.controller");
describe('DatabaseMetricController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [database_metric_controller_1.DatabaseMetricController],
        }).compile();
        controller = module.get(database_metric_controller_1.DatabaseMetricController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=database-metric.controller.spec.js.map