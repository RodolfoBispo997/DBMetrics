import { Inject, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../shared/infra/database/prisma/prisma.service";

export const APP_READINESS_TIMEOUT_MS = "APP_READINESS_TIMEOUT_MS";

@Injectable()
export class ReadinessService {
	private readonly logger = new Logger(ReadinessService.name);

	constructor(
		private readonly prisma: PrismaService,
		@Inject(APP_READINESS_TIMEOUT_MS)
		private readonly timeoutMs: number,
	) {}

	async isReady(): Promise<boolean> {
		let timeout: ReturnType<typeof setTimeout> | undefined;

		try {
			await Promise.race([
				this.prisma.$queryRaw`SELECT 1`,
				new Promise<never>((_, reject) => {
					timeout = setTimeout(
						() => reject(new Error("Readiness database check timed out")),
						this.timeoutMs,
					);
				}),
			]);

			return true;
		} catch {
			this.logger.warn("Primary database readiness check failed");
			return false;
		} finally {
			if (timeout) {
				clearTimeout(timeout);
			}
		}
	}
}
