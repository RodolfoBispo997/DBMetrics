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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpEvolutionClient = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@nestjs/common");
let HttpEvolutionClient = class HttpEvolutionClient {
    constructor(config) {
        this.config = config;
        console.log("==============================");
        console.log(config);
        console.log("==============================");
        this.http = axios_1.default.create({
            baseURL: config.baseUrl,
            headers: {
                apikey: config.apiKey,
            },
            timeout: 10000,
        });
    }
    async sendText(data) {
        console.log("BaseURL:", this.http.defaults.baseURL);
        console.log("Payload:", data);
        await this.http.post(`/message/sendText/${data.instance}`, {
            number: data.number,
            text: data.text,
        });
    }
};
exports.HttpEvolutionClient = HttpEvolutionClient;
exports.HttpEvolutionClient = HttpEvolutionClient = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("EvolutionConfig")),
    __metadata("design:paramtypes", [Object])
], HttpEvolutionClient);
//# sourceMappingURL=evolution.client.js.map