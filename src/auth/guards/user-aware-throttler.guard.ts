import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  getOptionsToken,
  getStorageToken,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from "@nestjs/throttler";

@Injectable()
export class UserAwareThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject(getOptionsToken()) options: ThrottlerModuleOptions,
    @Inject(getStorageToken()) storage: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storage, reflector);
  }

  protected async getTracker(request: Record<string, any>): Promise<string> {
    const userId = request.user?.userId;
    if (typeof userId === "string" && userId.length > 0) return `user:${userId}`;
    const ip = request.ip ?? request.socket?.remoteAddress;
    return `ip:${typeof ip === "string" && ip.length > 0 ? ip : "unknown"}`;
  }
}
