import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import type { Response } from "express";
import { ReadinessService } from "./readiness.service";

@Controller()
export class AppController {
	constructor(private readonly readinessService: ReadinessService) {}

	@Get("health")
	health(): { status: string } {
		return { status: "ok" };
	}

	@Get("ready")
	async ready(
		@Res({ passthrough: true }) response: Response,
	): Promise<{ status: "ready" | "not_ready" }> {
		const isReady = await this.readinessService.isReady();
		response.status(isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);

		return { status: isReady ? "ready" : "not_ready" };
	}
}
