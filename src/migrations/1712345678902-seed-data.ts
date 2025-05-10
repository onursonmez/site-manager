import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class SeedData1712345678902 implements MigrationInterface {
  name = "SeedData1712345678902";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create admin user with hashed password (password: Admin123!)
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    await queryRunner.query(`
      INSERT INTO "users" ("username", "email", "password")
      VALUES ('admin', 'admin@example.com', '${hashedPassword}')
      RETURNING "id";
    `);

    // Get the admin user ID
    const adminUserResult = await queryRunner.query(`
      SELECT id FROM "users" WHERE "username" = 'admin'
    `);
    const adminUserId = adminUserResult[0].id;

    // Create basic roles
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description")
      VALUES 
        ('admin', 'Administrator with full access'),
        ('manager', 'Manager with limited administration access'),
        ('user', 'Regular user with basic access')
      RETURNING "id", "name";
    `);

    // Get role IDs
    const rolesResult = await queryRunner.query(`
      SELECT id, name FROM "roles"
    `);
    const roles: Record<string, string> = {};
    for (const role of rolesResult) {
      roles[role.name] = role.id;
    }

    // Create permissions
    await queryRunner.query(`
      INSERT INTO "permissions" ("name", "description", "scope", "resource", "action")
      VALUES 
        ('manage_users', 'Full user management', 'all', 'users', 'manage'),
        ('view_users', 'View all users', 'all', 'users', 'read'),
        ('manage_roles', 'Manage all roles', 'all', 'roles', 'manage'),
        ('view_roles', 'View all roles', 'all', 'roles', 'read'),
        ('manage_permissions', 'Manage all permissions', 'all', 'permissions', 'manage'),
        ('view_permissions', 'View all permissions', 'all', 'permissions', 'read'),
        ('manage_stocks', 'Manage all stocks', 'all', 'stocks', 'manage'),
        ('view_stocks', 'View all stocks', 'all', 'stocks', 'read'),
        ('manage_own_stocks', 'Manage own stocks', 'own', 'stocks', 'manage'),
        ('view_own_stocks', 'View own stocks', 'own', 'stocks', 'read')
      RETURNING "id", "name";
    `);

    // Get permission IDs
    const permissionsResult = await queryRunner.query(`
      SELECT id, name FROM "permissions"
    `);
    const permissions: Record<string, string> = {};
    for (const permission of permissionsResult) {
      permissions[permission.name] = permission.id;
    }

    // Assign permissions to roles
    // Admin role gets all permissions
    for (const permName in permissions) {
      await queryRunner.query(`
        INSERT INTO "role_permissions" ("roleId", "permissionId")
        VALUES ('${roles["admin"]}', '${permissions[permName]}')
      `);
    }

    // Manager role gets view permissions and manage permissions for own resources
    const managerPermissions = ["view_users", "view_roles", "view_permissions", "view_stocks", "manage_own_stocks", "view_own_stocks"];
    for (const permName of managerPermissions) {
      await queryRunner.query(`
        INSERT INTO "role_permissions" ("roleId", "permissionId")
        VALUES ('${roles["manager"]}', '${permissions[permName]}')
      `);
    }

    // User role gets only view and manage own resources
    const userPermissions = ["view_own_stocks", "manage_own_stocks"];
    for (const permName of userPermissions) {
      await queryRunner.query(`
        INSERT INTO "role_permissions" ("roleId", "permissionId")
        VALUES ('${roles["user"]}', '${permissions[permName]}')
      `);
    }

    // Assign admin role to admin user
    await queryRunner.query(`
      INSERT INTO "users_roles" ("userId", "roleId")
      VALUES ('${adminUserId}', '${roles["admin"]}')
    `);

    // Create policies for conditional access
    await queryRunner.query(`
      INSERT INTO "policies" ("name", "description", "conditions", "filterExpression", "permissionId")
      VALUES 
        ('OwnStocksViewPolicy', 'Allow viewing own stocks', '{"ownership": "$user.id"}', 'createdById = :userId', '${permissions["view_own_stocks"]}'),
        ('OwnStocksManagePolicy', 'Allow managing own stocks', '{"ownership": "$user.id"}', 'createdById = :userId', '${permissions["manage_own_stocks"]}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clear all data
    await queryRunner.query(`DELETE FROM "policies"`);
    await queryRunner.query(`DELETE FROM "users_roles"`);
    await queryRunner.query(`DELETE FROM "role_permissions"`);
    await queryRunner.query(`DELETE FROM "permissions"`);
    await queryRunner.query(`DELETE FROM "roles"`);
    await queryRunner.query(`DELETE FROM "users"`);
  }
}
