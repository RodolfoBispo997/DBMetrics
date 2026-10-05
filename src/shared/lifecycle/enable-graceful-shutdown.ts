import type { INestApplication } from "@nestjs/common";

export function enableGracefulShutdown(
	application: Pick<INestApplication, "enableShutdownHooks">,
): void {
	// Lets ECS/Fargate shut down the app gracefully during rolling deployments.
	application.enableShutdownHooks();
}
