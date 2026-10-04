import { CanActivate, Injectable, NotFoundException } from "@nestjs/common";
import { getPublicRegistrationEnabled } from "../../shared/config/environment.config";

@Injectable()
export class PublicRegistrationEnabledGuard implements CanActivate {
  canActivate(): boolean {
    if (!getPublicRegistrationEnabled()) {
      throw new NotFoundException();
    }

    return true;
  }
}
