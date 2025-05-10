import { Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service";
import { AuthorizationController } from "./authorization.controller";
import { UsersModule } from "../users/users.module";
import { PermissionsModule } from "../permissions/permissions.module";
import { PoliciesModule } from "../policies/policies.module";

@Module({
  imports: [UsersModule, PermissionsModule, PoliciesModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
