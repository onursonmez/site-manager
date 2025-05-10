import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChannels1712345678906 implements MigrationInterface {
  name = "AddChannels1712345678906";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add example data
    const adminUserResult = await queryRunner.query(`SELECT id FROM "users" WHERE "username" = 'admin'`);
    const adminUserId = adminUserResult[0].id;

    // Create main channel
    await queryRunner.query(
      `
      INSERT INTO "channels" (
        "name",
        "description",
        "slug",
        "createdById",
        "metadata"
      )
      VALUES (
        'Main Website',
        'Corporate main website',
        'main',
        $1,
        '{"theme": "light", "language": "en"}'
      )
      RETURNING "id"
    `,
      [adminUserId]
    );

    const mainChannelResult = await queryRunner.query(`SELECT id FROM "channels" WHERE "slug" = 'main'`);
    const mainChannelId = mainChannelResult[0].id;

    // Create blog channel as child
    await queryRunner.query(
      `
      INSERT INTO "channels" (
        "name",
        "description",
        "slug",
        "parentId",
        "depth",
        "path",
        "createdById",
        "metadata"
      )
      VALUES (
        'Blog',
        'Corporate blog',
        'blog',
        $1,
        1,
        ARRAY[$3::uuid],
        $2,
        '{"theme": "light", "language": "en", "postsPerPage": 10}'
      )
      RETURNING "id"
    `,
      [mainChannelId, adminUserId, mainChannelId]
    );

    // Add settings for main channel
    await queryRunner.query(
      `
      INSERT INTO "channel_settings" (
        "channelId",
        "key",
        "value"
      )
      VALUES
        ($1, 'theme', '"light"'),
        ($1, 'language', '"en"'),
        ($1, 'socialLinks', '{"twitter": "https://twitter.com", "linkedin": "https://linkedin.com"}')
    `,
      [mainChannelId]
    );

    // Assign admin user to main channel with admin role
    const adminRoleResult = await queryRunner.query(`SELECT id FROM "roles" WHERE "name" = 'admin'`);
    const adminRoleId = adminRoleResult[0].id;

    await queryRunner.query(
      `
      INSERT INTO "channel_users" (
        "channelId",
        "userId",
        "roleId"
      )
      VALUES ($1, $2, $3)
    `,
      [mainChannelId, adminUserId, adminRoleId]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
