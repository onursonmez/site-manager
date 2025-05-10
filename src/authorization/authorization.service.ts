import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { PermissionsService } from "../permissions/permissions.service";
import { PoliciesService } from "../policies/policies.service";
import { CheckPermissionDto } from "./dto/check-permission.dto";
import { PermissionCheckResult } from "./interfaces/permission-check-result.interface";
import { PermissionScope } from "../permissions/enums/permission-scope.enum";

@Injectable()
export class AuthorizationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly policiesService: PoliciesService
  ) {}

  async checkPermission(checkPermissionDto: CheckPermissionDto): Promise<PermissionCheckResult> {
    const { userId, permissionName, resource, context = {} } = checkPermissionDto;

    try {
      // Get user with roles and permissions
      const user = await this.usersService.findOne(userId);

      // Check if user has any roles
      if (!user.roles || user.roles.length === 0) {
        return {
          granted: false,
          message: "User has no roles assigned",
        };
      }

      // Get all permissions from user's roles
      const userPermissions = user.roles.flatMap((role) => role.permissions);

      // Check if user has the requested permission
      const userPermission = userPermissions.find((perm) => perm.name === permissionName);

      if (!userPermission) {
        return {
          granted: false,
          message: `User does not have the '${permissionName}' permission`,
        };
      }

      // Check if permission is for the requested resource
      if (userPermission.resource && userPermission.resource !== resource) {
        return {
          granted: false,
          message: `Permission is not applicable to resource '${resource}'`,
        };
      }

      // Get policies for this permission
      const policies = await this.policiesService.findByPermissionId(userPermission.id);

      // If there are no policies, simply grant based on permission scope
      if (policies.length === 0) {
        const result: PermissionCheckResult = {
          granted: true,
          scope: userPermission.scope,
        };

        // If scope is OWN, include a default filter
        if (userPermission.scope === PermissionScope.OWN) {
          result.filter = "createdById = :userId";
        }

        return result;
      }

      // Evaluate each policy
      for (const policy of policies) {
        const isPolicyMatch = this.evaluatePolicy(policy.conditions, {
          user,
          resource,
          ...context,
        });

        if (isPolicyMatch) {
          return {
            granted: true,
            scope: userPermission.scope,
            filter: policy.filterExpression || (userPermission.scope === PermissionScope.OWN ? "createdById = :userId" : undefined),
          };
        }
      }

      // If no policy matches, deny access
      return {
        granted: false,
        message: "No applicable policy found",
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          granted: false,
          message: error.message,
        };
      }
      throw error;
    }
  }

  private evaluatePolicy(policyConditions: Record<string, any>, context: Record<string, any>): boolean {
    // Simplistic policy evaluation
    // In a real-world scenario, this would be more sophisticated
    try {
      // Check each condition in the policy
      for (const [key, value] of Object.entries(policyConditions)) {
        // Handle variable substitution (e.g., $user.id)
        if (typeof value === "string" && value.startsWith("$")) {
          const parts = value.substring(1).split(".");
          let contextValue = context;

          for (const part of parts) {
            contextValue = contextValue[part];
            if (contextValue === undefined) {
              return false;
            }
          }

          // If the key exists in context, compare values
          if (key in context && context[key] !== contextValue) {
            return false;
          }
        }
        // Direct comparison
        else if (key in context && context[key] !== value) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Policy evaluation error:", error);
      return false;
    }
  }
}
